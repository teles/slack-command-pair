/// <reference types="google-apps-script" />

export type PairRow = {
  date: string;                // "12 de agosto de 2025"
  start: string;               // "12 de agosto de 2025 às 9h BRT"
  end: string;                 // "12 de agosto de 2025 às 11h30 BRT"
  participants: string[];      // ["Mewtwo", "Treecko"]
  goal: string;                // "Implementar cache de PokéAPI..."
  duration: { text: string; minutes: number }; // { "02h30min", 150 }
  slackIds: string[];          // ["UN3WD25RQ4F", "U5ZR37E3P3E"]
};

const HEADER_MAP = {
  data: ["data", "date"],
  inicio: ["início", "inicio", "start"],
  fim: ["fim", "end"],
  participantes: ["participantes", "pairs", "people"],
  objetivo: ["objetivo do pair", "objetivo", "goal", "activity"],
  horas: ["horas", "duração", "duration"],
  slackIds: ["slack ids", "slack", "ids"]
};

function norm(s: unknown): string {
  return String(s ?? "").trim();
}

function includesInsensitive(target: string, aliases: string[]) {
  const t = target.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  return aliases.some(a => t === a.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase());
}

function findIdx(headers: string[], aliases: string[]) {
  return headers.findIndex(h => includesInsensitive(h, aliases));
}

export function parseDurationToMinutes(text: string): number {
  const s = norm(text);
  // aceita "02h30min", "2h30", "150", "01:15", "90m"
  const hhmm = s.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) return parseInt(hhmm[1], 10) * 60 + parseInt(hhmm[2], 10);

  const hmin = s.match(/(?:(\d{1,2})\s*h)?\s*(?:(\d{1,2})\s*(?:min|m))?/i);
  if (hmin && (hmin[1] || hmin[2])) {
    const h = hmin[1] ? parseInt(hmin[1], 10) : 0;
    const m = hmin[2] ? parseInt(hmin[2], 10) : 0;
    return h * 60 + m;
  }

  const pure = s.match(/^\d+$/);
  if (pure) return parseInt(pure[0], 10); // já em minutos

  return 0;
}

/** Lê a planilha e devolve um array de PairRow. Assume 1ª linha como cabeçalho. */
export function readSheetAsObjects(spreadsheetId: string, sheetName: string): PairRow[] {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sh = ss.getSheetByName(sheetName);
  if (!sh) return [];

  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(norm);
  const idx = {
    date: findIdx(headers, HEADER_MAP.data),
    start: findIdx(headers, HEADER_MAP.inicio),
    end: findIdx(headers, HEADER_MAP.fim),
    participants: findIdx(headers, HEADER_MAP.participantes),
    goal: findIdx(headers, HEADER_MAP.objetivo),
    duration: findIdx(headers, HEADER_MAP.horas),
    slackIds: findIdx(headers, HEADER_MAP.slackIds)
  };

  return values.slice(1).reduce<PairRow[]>((acc, row) => {
    if (row.every(cell => norm(cell) === "")) return acc; // pula linha vazia

    const durationText = norm(row[idx.duration]);
    const participants = norm(row[idx.participants])
      .split(/\s*,\s*/).filter(Boolean);

    const slackIds = norm(row[idx.slackIds])
      .split(/\s*,\s*/).filter(Boolean);

    acc.push({
      date: norm(row[idx.date]),
      start: norm(row[idx.start]),
      end: norm(row[idx.end]),
      participants,
      goal: norm(row[idx.goal]),
      duration: { text: durationText, minutes: parseDurationToMinutes(durationText) },
      slackIds
    });
    return acc;
  }, []);
}
