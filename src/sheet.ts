export function readWholeSheet(spreadsheetId: string, sheetName: string): string {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sh = ss.getSheetByName(sheetName);
  if (!sh) return `Aba '${sheetName}' não encontrada.`;

  const values = sh.getDataRange().getValues();
  return values.map(r => r.join(", ")).join("\n");
}
