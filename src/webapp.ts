export function doGet(e: GoogleAppsScript.Events.DoGet) {
  const ss = SpreadsheetApp.openById("1o5xABbxLZVhn8Fl1ixz2MIzC1iXLOBQLJUFCK1SVMsE");
  const sheet = ss.getSheetByName("Pair");
  if (!sheet) {
    return ContentService.createTextOutput("Aba 'Pair' não encontrada.");
  }

  const values = sheet.getDataRange().getValues();
  const text = values.map(row => row.join(", ")).join("\n");

  return ContentService
    .createTextOutput(text)
    .setMimeType(ContentService.MimeType.TEXT);
}
