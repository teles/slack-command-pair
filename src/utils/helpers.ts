/// <reference types="google-apps-script" />
import { PT_MONTH } from "../config/constants";

export function norm(s: unknown): string {
  return String(s ?? "").trim();
}

export function includesInsensitive(
  target: string,
  aliases: string[]
): boolean {
  const t = target
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
  return aliases.some(
    (a) =>
      t ===
      a
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
  );
}

export function findIdx(headers: string[], aliases: string[]): number {
  return headers.findIndex((h) => includesInsensitive(h, aliases));
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

export function parseDateLoose(s?: string): Date | undefined {
  if (!s) return;
  const t = String(s).trim();

  // ISO: 2025-08-18
  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso)
    return new Date(
      Number(iso[1]),
      Number(iso[2]) - 1,
      Number(iso[3]),
      0,
      0,
      0,
      0
    );

  // BR: 18/08/2025
  const br = t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br)
    return new Date(
      Number(br[3]),
      Number(br[2]) - 1,
      Number(br[1]),
      0,
      0,
      0,
      0
    );

  // "12 de agosto de 2025"
  const pt = t.match(/^(\d{1,2})\s+de\s+([A-Za-zçãéôíóúà]+)\s+de\s+(\d{4})$/i);
  if (pt) {
    const day = Number(pt[1]);
    const mon =
      PT_MONTH[
        pt[2]
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase()
      ];
    const year = Number(pt[3]);
    if (mon !== undefined) return new Date(year, mon, day, 0, 0, 0, 0);
  }

  return;
}

export function normEndOfDay(d?: Date): Date | undefined {
  if (!d) return;
  const out = new Date(d);
  out.setHours(23, 59, 59, 999);
  return out;
}

export function getLastMonday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // se for domingo (0), voltar 6 dias
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - daysToSubtract);
  lastMonday.setHours(0, 0, 0, 0);
  return lastMonday;
}

export function okJson(o: unknown): GoogleAppsScript.Content.TextOutput {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(
    ContentService.MimeType.JSON
  );
}
