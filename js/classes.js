/**
 * classes.js
 * 
 * 各種クラスの実装
 */


/**
 * Boardクラス
 * 
 * 盤面本体のクラス
 * 中身はサンプルのJSONファイル準拠
 */
class Board {

  /**
   * コンストラクタ
   * @param {int} hsize 横のマス数
   * @param {int} vsize 縦のマス数
   */
  constructor(hsize=14, vsize=7) {
    this.hsize = hsize;  // 横マス数
    this.vsize = vsize;  // 縦マス数
    this.initCells();    // 盤面
    this.initBorders();  // 境界線
  }

  /**
   * 盤面の初期化
   */
  initCells() {
    this.cells = [];
    for (let i = 0; i < this.vsize; i++) {
      this.cells.push([]);
      for (let j = 0; j < this.hsize; j++) {
        let cell_obj = {};
        cell_obj.contents = 'd0';       // 裏牌
        this.cells[i].push(cell_obj);
      }
    }
  }

  /**
   * 境界配列の初期化
   * 暫定。外枠も番兵として入れるか、中身のデータ構造をどうするか
   * 今後のブロック分けアルゴリズムの実装による
   */
  initBorders() {
    this.hborders = [];   // 横境界 (v-1 x h のboolean配列)
    for (let i = 0; i < this.vsize - 1; i++) {
      this.hborders.push([]);
      for (let j = 0; j < this.hsize; j++) {
        this.hborders[i].push(false);
      }
    }
    this.vborders = [];   // 縦境界 (v x h-1 のboolean配列)
    for (let i = 0; i < this.vsize; i++) {
      this.vborders.push([]);
      for (let j = 0; j < this.hsize; j++) {
        this.vborders[i].push(false);
      }
    }
  }

  /**
   * セルの読み込み
   * ほとんど上のコードの使い回し
   */
  readCells(src_cells) {
    this.cells = [];
    for (let bi = 0; bi < this.numElems - 1; bi++) {
      this.cells.push([]);
      for (let bj = 0; bj < this.numElems - 1 - bi; bj++) {
        this.cells[bi].push([]);
        for (let i = 0; i < this.numItems; i++) {
          this.cells[bi][bj].push([]);
          for (let j = 0; j < this.numItems; j++) {
            let cell_obj = {};
            cell_obj.contents = src_cells[bi][bj][i][j].contents;
            cell_obj.textcolor = src_cells[bi][bj][i][j].textcolor;
            cell_obj.bgcolor = src_cells[bi][bj][i][j].bgcolor;
            this.cells[bi][bj][i].push(cell_obj);
          }
        }
      }
    }
  }

  /**
   * JSON形式オブジェクトを読込
   */
  readJson(obj) {
    this.numElems = obj.numElems;
    this.numItems = obj.numItems;
    this.maxCellSize = this.numItems * (this.numElems - 1);
    // 各要素、項目をコピー
    this.elements = []
    for (let objel of obj.elements) {
      let el = {}
      el.contents = objel.contents;
      el.subelements = [];
      el.items = objel.items.slice();
      // サブ要素のコピー
      for (let objsubel of objel.subelements) {
        let subel = {}
        subel.type = objsubel.type;
        if (subel.type === 0) {
          subel.contents = objsubel.contents;
        } else {
          subel.contents1 = objsubel.contents1;
          subel.contents2 = objsubel.contents2;
        }
        subel.start = objsubel.start;
        subel.size = objsubel.size;
        el.subelements.push(subel);
      }
      this.elements.push(el);
    }
    if (obj.cells) {
      this.readCells(obj.cells);
    } else {
      this.initCells();
    }
    this.calcItemSize();        // 項目の最大長を計算
  }

  

  /**
   * 現在の盤面をJSON形式の文字列で返す 
   */
  writeJson() {
    let obj = {}
    obj.numElems = this.numElems;
    obj.numItems = this.numItems;
    obj.elements = this.elements;
    obj.cells = this.cells;        // セルの内容も保存できるよう変更しました。
    return JSON.stringify(obj, null, 2);
  }

  /**
   * URL書き出し
   */
  writeUrl() {
    let url = 'https://subaru-saito1.github.io/suirieditor?';
    let splitchar = '_'
    url += (this.numElems);        // 要素数
    url += (splitchar + this.numItems);  // 項目数
    for (let el of this.elements) {
      // 要素名エンコード
      url += (splitchar + encodeURIComponent(el.contents));
      // サブ要素エンコード処理
      url += (splitchar + el.subelements.length);
      for (let subel of el.subelements) {
        url += (splitchar + subel.type);
        url += (splitchar + subel.start);
        url += (splitchar + subel.size);
        if (subel.type === 0) {
          url += (splitchar + encodeURIComponent(subel.contents));
        } else {
          url += (splitchar + encodeURIComponent(subel.contents1));
          url += (splitchar + encodeURIComponent(subel.contents2));
        }
      } 
      // 項目エンコード
      for (let item of el.items) {
        url += (splitchar + encodeURIComponent(item));
      }
    }
    return url;
  }

  /**
   * URL読込（クエリ部分を読み込み）
   */
  readUrl(query) {
    let tokens = query.split('_');
    let cnt = 0;
    this.numElems = parseInt(tokens[cnt++]);
    this.numItems = parseInt(tokens[cnt++]);
    this.maxCellSize = this.numItems * (this.numElems - 1);
    // 各要素、項目をコピー
    this.elements = []
    for (let e = 0; e < this.numElems; e++) {
      let el = {}
      // 要素
      el.contents = decodeURIComponent(tokens[cnt++]);
      // サブ要素
      el.subelements = [];
      let subelems = parseInt(tokens[cnt++]);
      for (let sb = 0; sb < subelems; sb++) {
        let subel = {}
        subel.type = parseInt(tokens[cnt++]);
        subel.start = parseInt(tokens[cnt++]);
        subel.size = parseInt(tokens[cnt++]);
        if (subel.type === 0) {
          subel.contents = decodeURIComponent(tokens[cnt++]);
        } else {
          subel.contents1 = decodeURIComponent(tokens[cnt++]);
          subel.contents2 = decodeURIComponent(tokens[cnt++]);
        }
        el.subelements.push(subel);
      }
      // 項目
      el.items = []
      for (let it = 0; it < this.numItems; it++) {
        el.items.push(decodeURIComponent(tokens[cnt++]));
      }
      this.elements.push(el);
    }
    this.calcItemSize();   // 項目の最大長を計算
    this.initCells();      // セルの初期化
  }

  /**
   * 現在の解答盤面を消去する
   * color_id: 削除する色
   */
  clearAns(color_id=0) {
    let action = new Action();
    for (let bi = 0; bi < this.numElems - 1; bi++) {
      for (let bj = 0; bj < this.numElems - bi - 1; bj++) {
        for (let i = 0; i < this.numItems; i++) {
          for (let j = 0; j < this.numItems; j++) {
            const pv = this.cells[bi][bj][i][j].contents;
            const pc = this.cells[bi][bj][i][j].textcolor;
            if (color_id == 0) {
              // 解答全削除
              this.cells[bi][bj][i][j].bgcolor = 0;
              if (pv != '' || pc != 3) {
                this.cells[bi][bj][i][j].contents = '';
                this.cells[bi][bj][i][j].textcolor = 3;
                action.oplist.push(new AtomicAction(bi, bj, i, j, pv, pc, '', 3));
              }
            } else if (color_id == this.cells[bi][bj][i][j].textcolor) {
              // 色指定で削除する場合、背景色は残しておく
              if (pv != '' || pc != 3) {
                this.cells[bi][bj][i][j].contents = '';
                this.cells[bi][bj][i][j].textcolor = 3;
                action.oplist.push(new AtomicAction(bi, bj, i, j, pv, pc, '', 3));
              }
            }
          }
        }
      }
    }
    if (action.oplist.length > 0) {
      JanpaiEditor.astack.push(action);
    }
  }

  /**
   * クリック時のセル変更処理
   * args: マスの座標(bi, bj, i, j) ＋ マウスボタン番号
   */
  changeCellByClick(bi, bj, i, j, button) {
    // 通常入力モード
    if (JanpaiEditor.config.inputmode === 'text') {
      const current_val = this.cells[bi][bj][i][j].contents;
      const current_color = this.cells[bi][bj][i][j].textcolor;
      let next_val = '';
      let next_color = JanpaiEditor.drawer.colorid_in;
      
      if (button === 0) {         // 左クリック
        if (current_val=== '') {
          next_val = 'o';
        } else if (current_val === 'o') {
          next_val = 'x';
        } else {
          next_val = '';
        }
      } else if (button === 2) {  //右クリック
        if (current_val === '') {
          next_val = 'x';
        } else if (current_val === 'x') {
          next_val = 'o';
        } else {
          next_val = '';
        }
      } else {
        // 他のボタンの場合は何もしないで終わる
        return;
      }
      JanpaiEditor.astack.push(new Action([new AtomicAction(bi, bj, i, j, current_val, current_color, next_val, next_color)]));
      this.cells[bi][bj][i][j].contents = next_val;
      this.cells[bi][bj][i][j].textcolor = next_color;
    }
    // 背景色変更モード
    else if (JanpaiEditor.config.inputmode === 'bg') {
      const cell_color = this.cells[bi][bj][i][j].bgcolor;
      if (cell_color == JanpaiEditor.drawer.colorid_bg) {
        this.cells[bi][bj][i][j].bgcolor = 0;
      } else {
        this.cells[bi][bj][i][j].bgcolor = JanpaiEditor.drawer.colorid_bg;
      }
    }
    // ここにきたらおかしいのでエラー
    else {
      console.log("Something Wrong! (in Board::changeCellByClick");
      console.log("config.inputmode: " + JanpaiEditor.config.inputmode);
    }
  }

  /* ================= Boardクラス　ユーティリティ ====================== */

}



/**
 * Drawerクラス
 * 
 * 盤面描画関連
 */
class Drawer {

  /**
   * コンストラクタ：描画初期値類の設定
   * 後続のloadImageをチェーンして呼ぶこと。
   * どうもコンストラクタはasyncに出来ない様子。
   */
  constructor() {
    this.offset = 15;
    this.csize = $('#setsize').val() - 0;
    this.csize_h = this.csize;
    this.csize_v = this.csize;
    this.colors = {
      'bg': '#ffffff',
      'bd': '#00ff00',
    };
    this.highlight_cell = [];
    // 牌画像のオフセット位置を管理するリスト
    this.vpx = 63;
    this.hpx = 47;
    this.image_offsets = {};
  }

  /**
   * 麻雀牌の画像素材読込 & 各牌の画像オブジェクト配列を生成
   */
  async loadImage() {
    let img = null;
    let promise = new Promise(function(resolve) {
      img = new Image();
      img.onload = () => {resolve()};
      img.src = "img/pai.png";
    });
    await promise;
    this.createImageDict();
  }

  /**
   * 麻雀牌の画像を分割してimages辞書に格納
   */
  createImageDict() {
    const vn = 5;      // 牌の縦の個数 
    const hn = 10;     // 牌の横の個数
    for (let i = 0; i < vn; i++) {
      for (let j = 0; j < hn; j++) {
        let pname = this.getPaiName(i, j)
        this.image_offsets[pname] = [this.hpx * j, this.vpx * i]
      }
    }
  }

  /**
   * (i, j) のインデックスから牌名を取得
   */
  getPaiName(i, j) {
    switch (i) {
      case 0:
        return 'd' + j;
      case 1:
        return 'p' + j;
      case 2:
        return 's' + j;
      case 3:
        return 'm' + j;
      case 4:
        return 'z' + j;    // j = 8, 9 は無効
      default:
        throw 'ありえない牌です';
    }
  }

  /**
   * 描画関数本体
   */
  drawCanvas(board) {
    const canvas = document.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    // 背景描画
    let [maxwidth, maxheight] = this.getCanvasSize(board);
    canvas.setAttribute('width', maxwidth);
    canvas.setAttribute('height', maxheight);
    ctx.fillStyle = this.colors.bg;
    ctx.fillRect(0, 0, maxwidth, maxheight);

    // 盤面描画
    this.drawCell(board, ctx);
  }

  /**
   * キャンバスサイズの取得
   */
  getCanvasSize(board) {
    let canvassize_h = 0, canvassize_v = 0;
    canvassize_h += this.offset * 2;
    canvassize_v += this.offset * 2;
    canvassize_h += board.hsize * this.csize_h;
    canvassize_v += board.vsize * this.csize_v;
    return [canvassize_h, canvassize_v];
  }

  /**
   * セル描画関数メイン
   */
  drawCell(board, ctx) {
    // オフセットの計算
    const ofsx = this.offset + (board.maxItemSize + 1) * this.csize;
    const ofsy = this.offset + (board.maxItemSize + 1) * this.csize;
    for (let bi = 0; bi < board.numElems - 1; bi++) {
      for (let bj = 0; bj < board.numElems - 1 - bi; bj++) {
        // 境界オフセット値計算
        const bdofsx = ofsx + bj * board.numItems * this.csize;
        const bdofsy = ofsy + bi * board.numItems * this.csize;
        const bdsize = board.numItems * this.csize;
        for (let i = 0; i < board.numItems; i++) {
          for (let j = 0; j < board.numItems; j++) {
            // オフセット値計算
            const cofsx = bdofsx + j * this.csize;
            const cofsy = bdofsy + i * this.csize;
            const cval = board.cells[bi][bj][i][j].contents;
            const ccolor = board.cells[bi][bj][i][j].textcolor;
            const cbgcolor = this.getCellColor(board, bi, bj, i, j);
            this.drawRect(ctx, cofsx, cofsy, this.csize, this.csize, cbgcolor);
            this.drawCellText(ctx, cofsx, cofsy, cval, ccolor);
          }
        }
        this.drawBorder(board, ctx, bdofsx, bdofsy, bdsize, bdsize)
      }
    }
  }

  /**
   * 矩形領域描画（汎用）
   */
  drawRect(ctx, ofsx, ofsy, width, height, bgcolor=this.colors.bg) {
    ctx.strokeStyle = this.colors.bd;
    ctx.lineWidth = 1.5;
    ctx.fillStyle = bgcolor;
    ctx.strokeRect(ofsx, ofsy, width, height);
    ctx.fillRect(ofsx, ofsy, width, height);
  }
  /**
   * 境界部分描画（セル部分）
   */
  drawBorder(board, ctx, ofsx, ofsy, width, height) {
    ctx.strokeStyle = this.colors.bd;
    ctx.lineWidth = 3;
    ctx.strokeRect(ofsx, ofsy, width, height);
  }
  

  /**
   * セル描画関数：テキスト部分
   */
  drawCellText(ctx, ofsx, ofsy, c, ccolor) {
    ctx.strokeStyle = this.strHsl(this.colors_in_list[ccolor]);
    if (c === 'o') {
      ctx.lineWidth = 2;
      let cx = ofsx + this.csize / 2;
      let cy = ofsy + this.csize / 2;
      ctx.beginPath();
      ctx.arc(cx, cy, this.csize/2.5, 0, 2*Math.PI);
      ctx.closePath();
      ctx.stroke();
    } else if (c === 'x') {
      let p = 0.1 * this.csize;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ofsx + p, ofsy + p);
      ctx.lineTo(ofsx + this.csize - p, ofsy + this.csize - p);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ofsx + this.csize - p, ofsy + p);
      ctx.lineTo(ofsx + p, ofsy + this.csize - p);
      ctx.closePath();
      ctx.stroke();
    }
  }

  /**
   * 指定された座標を中心に文字を書く
   */
  drawChar(ctx, x, y, ch) {
    ctx.lineWidth = 1;
    ctx.fillStyle = this.colors.bd;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let fontsize = this.csize / this.fontdivide;
    ctx.font = fontsize + 'px sans-serif';
    ctx.fillText(ch, x, y);
  }


  /* =========================  ハイライト設定 ============================ */
  setHighlight(bi, bj, i, j) {
    this.highlight_cell = [bi, bj, i, j];
  }
  unsetHighlight() {
    this.highlight_cell = [];
  }

  /**
   * ハイライト＋周辺セルの色を補正
   */
  getCellColor(board, bi, bj, i, j) {
    const base_color_id = board.cells[bi][bj][i][j].bgcolor;
    const base_color = this.colors_bg_list[base_color_id];
    let highlight_color = base_color;
    if (this.isHighlightTarget(bi, bj, i, j)) {
      if (base_color_id == 0) {
        highlight_color = [base_color[0], base_color[1], base_color[2] - 0.08];
      } else {
        highlight_color = [base_color[0], base_color[1] - 0.2, base_color[2]];
      }
    }
    return this.strHsl(highlight_color);
  }
  /**
   * ハイライト対象載せるかどうか判定
   */
  isHighlightTarget(bi, bj, i, j) {
    const cbi = this.highlight_cell[0];
    const cbj = this.highlight_cell[1];
    const ci  = this.highlight_cell[2];
    const cj  = this.highlight_cell[3];
    /*
    if (bi == cbi && bj == cbj && i == ci && j == cj) {
      return false;
    }
    */
    // 暫定：同じ縦列・横列の他マス
    return ((bi == cbi && i == ci) || (bj == cbj && j == cj));
  }


  /* ====================== ユーティリティ系 ============================== */

  /**
   * 文字が数字かどうかチェック。下の関数を併用
   */
  isDigit(ch) {
    return ((ch >= '0') && ch <= '9');
  }
  /**
   * 縦書きの場合、数字を漢数字に直す
   */
  convertNum2Kanji(ch) {
    const kanji = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    return kanji[parseInt(ch)];
  }

  /**
   * HSLの配列の値から Canvas, CSSで使用するHSL文字列を生成
   */
  strHsl(hsl_list) {
    let ret = "hsl(" + hsl_list[0] + ", ";
    ret += (hsl_list[1] * 100) + "%, ";
    ret += (hsl_list[2] * 100) + "%)";
    return ret;
  }
}