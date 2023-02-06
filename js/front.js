/**
 * front.js
 * 
 * 各種イベントハンドラの実装等
 */


/**
 * 新規盤面作成
 */
function newFile(evt) {
  if (confirm('新規作成しますか？\n（※この操作は元に戻せません）')) {
    const hsize = $('#newfile_hsize').val();
    const vsize = $('#newfile_vsize').val();
    // 盤面新規作成
    JanpaiEditor.astack = new ActionStack();
    JanpaiEditor.board = new Board(hsize, vsize);
    JanpaiEditor.drawer.drawCanvas(JanpaiEditor.board);
  }
}


/**
 * メニュー実行
 */
function fileMenu(evt) {
  const menu = $('#filemenu').val();
  $('.popup_overlay').removeClass('active');
  if (menu === 'writeimg') {
    $('#popup_writeimg').addClass('active');
  } else if (menu === 'writeurl') {
    let url = JanpaiEditor.board.writeUrl();
    $('#display_url').val(url);
    $('#popup_writeurl').addClass('active');
  } else if (menu === 'readurl') {
    $('#popup_readurl').addClass('active');
  } else if (menu === 'writejson') {
    $('#popup_writejson').addClass('active');
  } else if (menu === 'readjson') {
    $('#popup_readjson').addClass('active');
  }
}

/**
 * 画像出力 
 * （github pages にデプロイしないとCORSに引っかかって動かない）
 */
function writeImg() {
  const filename = $('#writeimg_filename').val();
  const canvas = document.querySelector('canvas');
  // 画像保存（一時的にダウンロード用リンクを生成）
  canvas.toBlob((blob) => {
    let dlanchor = document.createElement('a');
    dlanchor.href = window.URL.createObjectURL(blob);
    dlanchor.download = filename;
    dlanchor.click();
    dlanchor.remove();
  });
  // ポップアップを閉じる
  $('#popup_writeimg').removeClass('active');
}

/**
 * URL出力
 */
function writeUrl() {
  $('#popup_writeurl').removeClass('active');
}

/**
 * URL読込
 */
function readUrl() {
  let url = $('#input_url').val();
  let urlquery = url.split('?');
  if (urlquery.length > 1) {
    JanpaiEditor.board.readUrl(urlquery[1]);
    JanpaiEditor.drawer.drawCanvas(JanpaiEditor.board);
    JanpaiEditor.astack = new ActionStack();
  }
  $('#popup_readurl').removeClass('active');
}

/**
 * JSON出力
 */
function writeJson() {
  const filename = $('#writejson_filename').val();
  const jsonstr = JanpaiEditor.board.writeJson();
  const blob = new Blob([jsonstr], {type:"text/json"});
  let dlanchor = document.createElement('a');
  dlanchor.href = window.URL.createObjectURL(blob);
  dlanchor.download = filename;
  dlanchor.click();
  dlanchor.remove();
  $('#popup_writejson').removeClass('active');
}
/**
 * JSON読込
 */
function readJson() {
  let file = $('#readjson_filename').prop('files')[0];
  let reader = new FileReader();
  reader.readAsText(file, 'UTF-8');
  // 読み込み完了時のコールバック処理
  reader.onload = function() {
    let jsonobj = JSON.parse(reader.result);
    JanpaiEditor.board.readJson(jsonobj);
    JanpaiEditor.drawer.drawCanvas(JanpaiEditor.board);
    JanpaiEditor.astack = new ActionStack();
  }
  $('#popup_readjson').removeClass('active');
}

/**
 * キャンセル
 */
function closePopup() {
  $('.popup_overlay').removeClass('active');
}


/**
 * サイズ変更
 */
function setSize(evt) {
  let csize = $('#setsize').val() - 0;
  const mincsize = $('#setsize').attr('min') - 0;
  const maxcsize = $('#setsize').attr('max') - 0;
  // 範囲バリデーション
  if (csize < mincsize) {
    csize = mincsize;
  } else if (csize > maxcsize) {
    csize = maxcsize;
  }
  // サイズ変更と再描画
  JanpaiEditor.drawer.csize = csize;
  JanpaiEditor.drawer.drawCanvas(JanpaiEditor.board);
}

/**
 * 解答モード：入力色変更
 */
function changeTextColor(evt) {
  const new_color_id = evt.currentTarget.value;   // optionのvalue値取得
  JanpaiEditor.drawer.colorid_in = new_color_id;
}

/**
 * 解答モード：背景色変更
 */
function changeBgColor(evt) {
  const new_color_id = evt.currentTarget.value;  // optionのvalue値取得
  JanpaiEditor.drawer.colorid_bg = new_color_id;
  // new_color_id == 0 のときは通常モードへ、それ以外のときは背景入力モードへ移行。
  if (new_color_id == 0) {
    JanpaiEditor.config.inputmode = 'text';
    // フォームUI処理（下記elseの状態から通常状態に戻す）
    $('label[for="text_color"]').removeClass('inactive_form');
    $('label[for="bg_color"').removeClass('active_form')
    $('#text_color').prop('disabled', false)
  } else {
    JanpaiEditor.config.inputmode = 'bg';
    // フォームUI処理（通常入力モードが無効化されたことを分かりやすく示す）
    $('label[for="text_color"]').addClass('inactive_form');
    $('label[for="bg_color"').addClass('active_form')
    $('#text_color').prop('disabled', true);
  }
}

/**
 * 問題入力モード変更
 */
function setQmode(evt) {
  JanpaiEditor.config.qamode = 'question';
  console.log('問題入力モード');
  JanpaiEditor.drawer.drawCanvas(JanpaiEditor.board);
}
/**
 * 解答入力モード変更
 */
function setAmode(evt) {
  JanpaiEditor.config.qamode = 'answer';
  console.log('解答入力モード');
  JanpaiEditor.drawer.drawCanvas(JanpaiEditor.board);
}
/**
 * 戻る
 */
function undoAction(evt) {
  JanpaiEditor.astack.undo();
  JanpaiEditor.drawer.drawCanvas(JanpaiEditor.board);
}
/**
 * 進む
 */
function redoAction(evt) {
  JanpaiEditor.astack.redo();
  JanpaiEditor.drawer.drawCanvas(JanpaiEditor.board);
}

/**
 * 解答消去
 */
function clearAnswer(evt) {
  const opt_val = $('#clear_color').val();
  JanpaiEditor.board.clearAns(opt_val);
  JanpaiEditor.drawer.drawCanvas(JanpaiEditor.board);
}


// ===========================================================================
//                      盤面(Canvas) フロントインタフェース
// ===========================================================================

/**
 * 盤面クリック
 */
function clickBoard(evt) {
  evt.preventDefault();   // 右クリックでメニューが開かないようにする
  let objinfo = identifyClickPos(evt.offsetX, evt.offsetY);
  if (objinfo.type === 'cell') {
    clickPai(objinfo, evt.button);
  } else if (objinfo.type === 'border') {
    clickBorder(objinfo);
  } else {
    // 空白クリック時：何もしない
  }
  JanpaiEditor.drawer.drawCanvas(JanpaiEditor.board);
}

/**
 * マウス座標から盤面オブジェクト（特定の牌 or 境界線）を特定
 */
function identifyClickPos(mx, my) {
  mx -= JanpaiEditor.drawer.offset;
  my -= JanpaiEditor.drawer.offset;
  let ch = JanpaiEditor.drawer.csize_h;
  let cv = JanpaiEditor.drawer.csize_v;
  let p = JanpaiEditor.drawer.pad;
  let x = parseInt(mx / ch);
  let y = parseInt(my / cv);
  let ix = mx % ch;
  let iy = my % cv;
  if (ix > p && ix < ch - p && iy > p && iy < cv - p) {
    return {'type': 'cell', 'i': y, 'j': x};
  } else {
    return {'type': 'border'};
  }
}

/**
 * 牌クリック時の処理 （button: 0で左、2で右）
 */
function clickPai(obj, button) {
  let pai = JanpaiEditor.board.cells[obj.i][obj.j].contents;
  $('.popup_overlay').removeClass('active');   // すでに出ているポップアップを消去
  $('#paiform').val(pai);       // ここをいい感じのUIに変更
  $('#paiform_i').val(obj.i);
  $('#paiform_j').val(obj.j);
  $('#popup_paiform').addClass('active');     // ポップアップ表示
  $('#paiform').focus();
}

/**
 * 牌入力処理
 */
function inputPai() {
  // OK時の処理：項目名追加
  let pai = $('#paiform').val();   // ここをいい感じのUIに変更
  let i = $('#paiform_i').val();
  let j = $('#paiform_j').val();
  console.log(i,j,pai);
  // ポップアップを閉じて再描画
  $('#popup_paiform').removeClass('active');
  JanpaiEditor.board.changeCellByClick(i, j, pai);
  JanpaiEditor.drawer.drawCanvas(JanpaiEditor.board);
}


/** 
 * 境界線クリック時の処理 (button: 0で左、2で右)
 */
function clickBorder(obj, button) {
  // 保留
  console.log('border');
}

/**
 * 盤面キーボード入力
 */
function keyDownBoard(evt) {
  console.log(evt);
  if (evt.key == 'z' && evt.ctrlKey) {
    JanpaiEditor.astack.undo();
    JanpaiEditor.drawer.drawCanvas(JanpaiEditor.board);
  }
  if (evt.key == 'Z' && evt.ctrlKey) {
    JanpaiEditor.astack.redo();
    JanpaiEditor.drawer.drawCanvas(JanpaiEditor.board);
  }
}

/**
 * 盤面をなぞる（トラッキング用）
 */
function trackBoard(evt) {
  const objinfo = identifyClickPos(evt.offsetX, evt.offsetY);
  if (objinfo.type === 'cell') {
    JanpaiEditor.drawer.setHighlight(objinfo.bi, objinfo.bj, objinfo.i, objinfo.j);
  } else {
    JanpaiEditor.drawer.unsetHighlight();
  }
  JanpaiEditor.drawer.drawCanvas(JanpaiEditor.board);
}