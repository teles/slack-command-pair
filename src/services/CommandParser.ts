import { Filters } from "../interfaces/Filters";
import { parseDateLoose, normEndOfDay } from "../utils/helpers";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "../config/constants";

export class CommandParser {
  parseCommandText(text?: string): Filters {
    const raw = String(text || "").trim();

    // user: aceita <@Uxxxx>, @nome, user:Uxxxx/Uxxxx
    const userMatch =
      raw.match(/<@([A-Z0-9]+)>/)?.[1] ||
      raw.match(/user:([A-Z0-9]+)/i)?.[1] ||
      raw.match(/@([A-Za-z0-9._-]+)/)?.[1];

    // datas
    const from = parseDateLoose(raw.match(/(?:^|\s)from:([^\s]+)/i)?.[1]);
    const to = parseDateLoose(raw.match(/(?:^|\s)to:([^\s]+)/i)?.[1]);

    // paginação
    const page = Math.max(
      DEFAULT_PAGE,
      parseInt(raw.match(/page:(\d+)/i)?.[1] || String(DEFAULT_PAGE), 10)
    );
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(
        1,
        parseInt(
          raw.match(/pagesize:(\d+)/i)?.[1] || String(DEFAULT_PAGE_SIZE),
          10
        )
      )
    );

    return { user: userMatch, from, to: normEndOfDay(to), page, pageSize, raw };
  }

  parseQueryParams(params: Record<string, string>): Filters {
    return this.parseCommandText(
      [
        params?.user ? `user:${params.user}` : "",
        params?.from ? `from:${params.from}` : "",
        params?.to ? `to:${params.to}` : "",
        params?.page ? `page:${params.page}` : "",
        params?.pageSize ? `pageSize:${params.pageSize}` : "",
      ]
        .filter(Boolean)
        .join(" ")
    );
  }
}
