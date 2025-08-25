import { PairRow } from "../interfaces/PairRow";
import { Filters } from "../interfaces/Filters";
import { ResponseFormatter } from "../interfaces/ResponseFormatter";
import { SlackResponse } from "../interfaces/SlackInterfaces";
import { SlackBlockBuilder } from "./SlackBlockBuilder";
import { PaginationResult } from "../interfaces/PaginationResult";
import { MAX_BLOCKS, MAX_RESPONSE_SIZE } from "../config/constants";

export class SlackResponseFormatter implements ResponseFormatter {
  private blockBuilder: SlackBlockBuilder;

  constructor() {
    this.blockBuilder = new SlackBlockBuilder();
  }

  formatResponse(
    pairingData: PaginationResult<PairRow>,
    filters: Filters
  ): SlackResponse {
    const blocks = this.renderSlackBlocks(pairingData.data, filters);

    const payload: SlackResponse = {
      response_type: "ephemeral",
      blocks,
      attachments: [
        {
          color: "#AAAAAA",
          text: `page ${pairingData.page}/${pairingData.totalPages} • total ${pairingData.total}`,
          footer: `filters: "${filters.raw || "—"}"`,
        },
      ],
    };

    const json = JSON.stringify(payload);
    // fallback de segurança (mensagem plana) se estourar tamanho
    if (json.length > MAX_RESPONSE_SIZE) {
      const textList = pairingData.data
        .map((item) => this.blockBuilder.formatItemLine(item))
        .join("\n\n");
      return { response_type: "ephemeral", text: textList };
    }
    return payload;
  }

  private renderSlackBlocks(items: PairRow[], filters: Filters) {
    const title = "📋 Pair Programming — Registros";
    const chips: string[] = [];
    if (filters.user) chips.push(`user: \`${filters.user}\``);
    if (filters.from)
      chips.push(`from: \`${filters.from.toISOString().slice(0, 10)}\``);
    if (filters.to)
      chips.push(`to: \`${(filters.to as Date).toISOString().slice(0, 10)}\``);

    const hdr = [this.blockBuilder.header(title), this.blockBuilder.divider()];
    if (chips.length)
      hdr.push(
        this.blockBuilder.section(chips.join("   ")),
        this.blockBuilder.divider()
      );

    const rows = items.flatMap((it) => [
      this.blockBuilder.section(this.blockBuilder.formatItemLine(it)),
      this.blockBuilder.divider(),
    ]);
    let blocks = [...hdr, ...rows];

    if (blocks.length > MAX_BLOCKS) {
      blocks = blocks.slice(0, MAX_BLOCKS - 2);
      blocks.push(
        this.blockBuilder.section(
          `… _truncado_ (mostrando ${items.length} de ${items.length} filtrados)`
        )
      );
      blocks.push(this.blockBuilder.divider());
    }
    return blocks;
  }
}
