/// <reference types="google-apps-script" />
import { PairRow } from "../interfaces/PairRow";
import { DataRepository } from "../interfaces/DataRepository";
import { findIdx, norm, parseDurationToMinutes } from "../utils/helpers";

export class SheetRepository implements DataRepository<PairRow> {
  private readonly HEADER_MAP = {
    data: ["data", "date"],
    inicio: ["início", "inicio", "start"],
    fim: ["fim", "end"],
    participantes: ["participantes", "pairs", "people"],
    objetivo: ["objetivo do pair", "objetivo", "goal", "activity"],
    horas: ["horas", "duração", "duration"],
    slackIds: ["slack ids", "slack", "ids"],
  };

  constructor(
    private readonly spreadsheetId: string,
    private readonly sheetName: string
  ) {}

  getAll(): PairRow[] {
    const ss = SpreadsheetApp.openById(this.spreadsheetId);
    const sh = ss.getSheetByName(this.sheetName);
    if (!sh) return [];

    const values = sh.getDataRange().getValues();
    if (values.length < 2) return [];

    const headers = values[0].map(norm);
    const idx = {
      date: findIdx(headers, this.HEADER_MAP.data),
      start: findIdx(headers, this.HEADER_MAP.inicio),
      end: findIdx(headers, this.HEADER_MAP.fim),
      participants: findIdx(headers, this.HEADER_MAP.participantes),
      goal: findIdx(headers, this.HEADER_MAP.objetivo),
      duration: findIdx(headers, this.HEADER_MAP.horas),
      slackIds: findIdx(headers, this.HEADER_MAP.slackIds),
    };

    return values.slice(1).reduce<PairRow[]>((acc, row) => {
      if (row.every((cell) => norm(cell) === "")) return acc; // pula linha vazia

      const durationText = norm(row[idx.duration]);
      const participants = norm(row[idx.participants])
        .split(/\s*,\s*/)
        .filter(Boolean);

      const slackIds = norm(row[idx.slackIds])
        .split(/\s*,\s*/)
        .filter(Boolean);

      acc.push({
        date: norm(row[idx.date]),
        start: norm(row[idx.start]),
        end: norm(row[idx.end]),
        participants,
        goal: norm(row[idx.goal]),
        duration: {
          text: durationText,
          minutes: parseDurationToMinutes(durationText),
        },
        slackIds,
      });
      return acc;
    }, []);
  }
}
