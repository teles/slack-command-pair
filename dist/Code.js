"use strict";
(() => {
  // src/sheet.ts
  function readWholeSheet(spreadsheetId, sheetName) {
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sh = ss.getSheetByName(sheetName);
    if (!sh) return `Aba '${sheetName}' n\xE3o encontrada.`;
    const values = sh.getDataRange().getValues();
    return values.map((r) => r.join(", ")).join("\n");
  }

  // src/index.ts
  function doGet(_e) {
    const text = readWholeSheet("1o5xABbxLZVhn8Fl1ixz2MIzC1iXLOBQLJUFCK1SVMsE", "Pair");
    return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
  }
  globalThis.doGet = doGet;
})();
