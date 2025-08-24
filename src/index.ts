/// <reference types="google-apps-script" />
import { readSheetAsObjects } from "./sheet";

const SHEET_ID = "1o5xABbxLZVhn8Fl1ixz2MIzC1iXLOBQLJUFCK1SVMsE";
const SHEET_NAME = "Pair";

// Helpers -------------------------------------------------------------

function okJson(o: unknown) {
  return ContentService
    .createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

function slackHeaderBlock(title: string) {
  return { type: "header", text: { type: "plain_text", text: title } };
}

function slackDivider() {
  return { type: "divider" };
}

function formatItemLine(it: ReturnType<typeof readSheetAsObjects>[number]): string {
  const people = it.participants.join(" × ");
  const when = `*${it.date}*\n_${it.start}_ → _${it.end}_`;
  const goal = it.goal.replace(/\*/g, "\\*"); // escapar asteriscos para mrkdwn
  const dur  = `*${it.duration.text}* (${it.duration.minutes} min)`;
  return `• *${people}*\n${when}\n${goal}\n${dur}`;
}

function toSlackBlocks(items: ReturnType<typeof readSheetAsObjects>) {
  const MAX_BLOCKS = 50;               // limite seguro do Slack
  const head = [slackHeaderBlock("📋 Pair Programming — Registros"), slackDivider()];

  const itemBlocks = items.flatMap((it) => ([
    { type: "section", text: { type: "mrkdwn", text: formatItemLine(it) } },
    slackDivider()
  ]));

  let blocks = [...head, ...itemBlocks];

  // truncar se exceder limite
  if (blocks.length > MAX_BLOCKS) {
    blocks = blocks.slice(0, MAX_BLOCKS - 2);
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `… _resultado truncado_ (${items.length} itens no total)` }
    } as {
      type: "section";
      text: { type: "mrkdwn"; text: string };
    });
    blocks.push(slackDivider());
  }
  return blocks;
}

// Web GET mantém o JSON "público" para debug/observabilidade -----------
function doGet(_e: GoogleAppsScript.Events.DoGet) {
  const data = readSheetAsObjects(SHEET_ID, SHEET_NAME);
  return okJson({
    ok: true,
    count: data.length,
    data
  });
}

// Slash command (POST) -------------------------------------------------
function doPost(e: GoogleAppsScript.Events.DoPost) {
  // Slack envia application/x-www-form-urlencoded
  const params = e?.parameter || {};
  const isSlack = !!params.command && !!params.user_id;

  const items = readSheetAsObjects(SHEET_ID, SHEET_NAME);

  if (isSlack) {
    // resposta imediata ao slash command
    const blocks = toSlackBlocks(items);

    const payload = {
      response_type: "ephemeral", // "in_channel" para mensagem pública
      blocks
    };

    // Fallback: se por algum motivo exceder limites de tamanho
    const json = JSON.stringify(payload);
    if (json.length > 3600 * 4) { // heurística conservadora
      return okJson({
        response_type: "ephemeral",
        text: items.map(formatItemLine).join("\n\n")
      });
    }
    return okJson(payload);
  }

  // não-Slack: devolve JSON básico
  return okJson({ ok: true, count: items.length, data: items });
}

// expor no escopo global do GAS
(globalThis as any).doGet  = doGet;
(globalThis as any).doPost = doPost;
