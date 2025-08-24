/// <reference types="google-apps-script" />
import { readSheetAsObjects, PairRow } from "./sheet";

const SHEET_ID = "1o5xABbxLZVhn8Fl1ixz2MIzC1iXLOBQLJUFCK1SVMsE";
const SHEET_NAME = "Pair";

type Filters = {
  user?: string;        // slack id (Uxxxx) ou nome
  from?: Date;          // inclusive (normalizado p/ 00:00)
  to?: Date;            // inclusive (normalizado p/ 23:59)
  page: number;
  pageSize: number;
  raw: string;          // o texto original do comando, p/ exibir no header
};

function okJson(o: unknown) {
  return ContentService.createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------- Parsing dos parâmetros ------------------------- */

const PT_MONTH: Record<string, number> = {
  janeiro: 0, fevereiro: 1, março: 2, marco: 2, abril: 3, maio: 4, junho: 5,
  julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11
};

function parseDateLoose(s?: string): Date | undefined {
  if (!s) return;
  const t = String(s).trim();

  // ISO: 2025-08-18
  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 0, 0, 0, 0);

  // BR: 18/08/2025
  const br = t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]), 0, 0, 0, 0);

  // "12 de agosto de 2025"
  const pt = t.match(/^(\d{1,2})\s+de\s+([A-Za-zçãéôíóúà]+)\s+de\s+(\d{4})$/i);
  if (pt) {
    const day = Number(pt[1]);
    const mon = PT_MONTH[pt[2].normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()];
    const year = Number(pt[3]);
    if (mon !== undefined) return new Date(year, mon, day, 0, 0, 0, 0);
  }

  return;
}

function normEndOfDay(d?: Date) {
  if (!d) return;
  const out = new Date(d);
  out.setHours(23, 59, 59, 999);
  return out;
}

function parseCommandText(text?: string): Filters {
  const raw = String(text || "").trim();

  // user: aceita <@Uxxxx>, @nome, user:Uxxxx/Uxxxx
  const userMatch =
    raw.match(/<@([A-Z0-9]+)>/)?.[1] ||
    raw.match(/user:([A-Z0-9]+)/i)?.[1] ||
    raw.match(/@([A-Za-z0-9._-]+)/)?.[1];

  // datas
  const from = parseDateLoose(raw.match(/(?:^|\s)from:([^\s]+)/i)?.[1]);
  const to   = parseDateLoose(raw.match(/(?:^|\s)to:([^\s]+)/i)?.[1]);

  // paginação
  const page = Math.max(1, parseInt(raw.match(/page:(\d+)/i)?.[1] || "1", 10));
  const pageSize = Math.min(40, Math.max(1, parseInt(raw.match(/pagesize:(\d+)/i)?.[1] || "10", 10)));

  return { user: userMatch, from, to: normEndOfDay(to), page, pageSize, raw };
}

/* --------------------------- Filtro + Paginação --------------------------- */

function parsePtDateCell(cell: string): Date | undefined {
  // usa apenas a coluna "Data" (dia), pois Início/Fim vêm como strings longas
  return parseDateLoose(cell);
}

function filterItems(items: PairRow[], f: Filters): PairRow[] {
  let out = items;

  if (f.user) {
    const needle = f.user.toLowerCase();
    out = out.filter(it =>
      it.slackIds.some(id => id.toLowerCase() === needle) ||
      it.participants.some(p => p.toLowerCase().includes(needle))
    );
  }

  if (f.from || f.to) {
    out = out.filter(it => {
      const d = parsePtDateCell(it.date);
      if (!d) return false;
      if (f.from && d < f.from) return false;
      if (f.to && d > (f.to as Date)) return false;
      return true;
    });
  }

  return out;
}

function paginate<T>(arr: T[], page: number, pageSize: number) {
  const total = arr.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(Math.max(1, page), totalPages);
  const start = (p - 1) * pageSize;
  const data = arr.slice(start, start + pageSize);
  return { data, page: p, pageSize, total, totalPages };
}

/* ----------------------------- Slack rendering ---------------------------- */

function section(text: string) { return { type: "section", text: { type: "mrkdwn", text } }; }
function header(text: string)  { return { type: "header", text: { type: "plain_text", text } }; }
function divider()             { return { type: "divider" }; }

function formatItemLine(it: PairRow): string {
  const people = it.participants.join(" × ");
  const when = `*${it.date}*\n_${it.start}_ → _${it.end}_`;
  const goal = it.goal.replace(/\*/g, "\\*");
  const dur  = `*${it.duration.text}* (${it.duration.minutes} min)`;
  return `• *${people}*\n${when}\n${goal}\n${dur}`;
}

function renderSlackBlocks(items: PairRow[], f: Filters) {
  const title = "📋 Pair Programming — Registros";
  const chips: string[] = [];
  if (f.user) chips.push(`user: \`${f.user}\``);
  if (f.from) chips.push(`from: \`${f.from.toISOString().slice(0,10)}\``);
  if (f.to) chips.push(`to: \`${(f.to as Date).toISOString().slice(0,10)}\``);

  const hdr = [header(title), divider()];
  if (chips.length) hdr.push(section(chips.join("   ")), divider());

  const rows = items.flatMap(it => [section(formatItemLine(it)), divider()]);
  let blocks = [...hdr, ...rows];

  const MAX_BLOCKS = 50;
  if (blocks.length > MAX_BLOCKS) {
    blocks = blocks.slice(0, MAX_BLOCKS - 2);
    blocks.push(section(`… _truncado_ (mostrando ${items.length} de ${items.length} filtrados)`));
    blocks.push(divider());
  }
  return blocks;
}

/* --------------------------------- HTTP ---------------------------------- */

function doGet(e: GoogleAppsScript.Events.DoGet) {
  const f = parseCommandText([
    e?.parameter?.user ? `user:${e.parameter.user}` : "",
    e?.parameter?.from ? `from:${e.parameter.from}` : "",
    e?.parameter?.to   ? `to:${e.parameter.to}`     : "",
    e?.parameter?.page ? `page:${e.parameter.page}` : "",
    e?.parameter?.pageSize ? `pageSize:${e.parameter.pageSize}` : ""
  ].filter(Boolean).join(" "));

  const all = readSheetAsObjects(SHEET_ID, SHEET_NAME);
  const filtered = filterItems(all, f);
  const pager = paginate(filtered, f.page, f.pageSize);

  return okJson({
    ok: true,
    query: { user: f.user, from: f.from?.toISOString(), to: f.to?.toISOString(), page: pager.page, pageSize: pager.pageSize },
    meta: { total: pager.total, totalPages: pager.totalPages },
    data: pager.data
  });
}

function doPost(e: GoogleAppsScript.Events.DoPost) {
  const params = e?.parameter || {};
  const text = String(params.text || "");
  const f = parseCommandText(text);

  const all = readSheetAsObjects(SHEET_ID, SHEET_NAME);
  const filtered = filterItems(all, f);
  const pager = paginate(filtered, f.page, f.pageSize);

  const blocks = renderSlackBlocks(pager.data, f);

  const payload = {
    response_type: "ephemeral",       // troque para "in_channel" se quiser público
    blocks,
    // HATEOAS-ish hints (para clients automáticos ou debug)
    attachments: [
      {
        color: "#AAAAAA",
        text: `page ${pager.page}/${pager.totalPages} • total ${pager.total}`,
        footer: `filters: "${f.raw || '—'}"`
      }
    ]
  };

  const json = JSON.stringify(payload);
  // fallback de segurança (mensagem plana) se estourar tamanho
  if (json.length > 3500) {
    const textList = pager.data.map(formatItemLine).join("\n\n");
    return okJson({ response_type: "ephemeral", text: textList });
  }
  return okJson(payload);
}

// expor
(globalThis as any).doGet = doGet;
(globalThis as any).doPost = doPost;
