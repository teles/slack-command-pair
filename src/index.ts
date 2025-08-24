/// <reference types="google-apps-script" />
import { readSheetAsObjects } from "./sheet";

type HateoasResponse<T> = {
  meta: {
    generated_at: string;       // ISO
    sheet_id: string;
    sheet_name: string;
    total_items: number;
    version?: string;           // opcional, injete no build se quiser
  };
  links: {
    self: string;               // URL do Web App atual
    sheet_html: string;         // link para a planilha
    collection: string;         // mesma URL (ex.: /exec?sheet=Pair)
  };
  data: T[];
};

const SHEET_ID = "1o5xABbxLZVhn8Fl1ixz2MIzC1iXLOBQLJUFCK1SVMsE";
const SHEET_NAME = "Pair";

function makeWebAppUrl(): string {
  // Retorna a URL do deployment ativo (Web App)
  // Observação: para alguns cenários retorna a versão "mais recente".
  // Para URL fixa, prefira usar o deploymentId conhecido via secret.
  return ScriptApp.getService().getUrl() || "";
}

function sheetHtmlUrl(sheetId: string, sheetName: string): string {
  // link direto para a aba
  return `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=0&range=${encodeURIComponent(sheetName)}!A1`;
}

// --- implementação pura para facilitar teste unitário
export function getPairsJson(spreadsheetId = SHEET_ID, sheetName = SHEET_NAME): HateoasResponse<ReturnType<typeof readSheetAsObjects>[number]> {
  const items = readSheetAsObjects(spreadsheetId, sheetName);

  return {
    meta: {
      generated_at: new Date().toISOString(),
      sheet_id: spreadsheetId,
      sheet_name: sheetName,
      total_items: items.length,
      version: (globalThis as any).PACKAGE_VERSION ?? undefined,
    },
    links: {
      self: makeWebAppUrl(),
      sheet_html: sheetHtmlUrl(spreadsheetId, sheetName),
      collection: `${makeWebAppUrl()}?sheet=${encodeURIComponent(sheetName)}`
    },
    data: items
  };
}

// --- HTTP
function doGet(e: GoogleAppsScript.Events.DoGet) {
  const sheet = e?.parameter?.sheet || SHEET_NAME;
  const payload = getPairsJson(SHEET_ID, sheet);

  const out = ContentService
    .createTextOutput(JSON.stringify(payload, null, 2))
    .setMimeType(ContentService.MimeType.JSON);

  // HATEOAS-friendly headers
  out.setContent(JSON.stringify(payload)); // sem pretty print para rede
  return out;
}

// Exposição global para o GAS
(globalThis as any).doGet = doGet;
