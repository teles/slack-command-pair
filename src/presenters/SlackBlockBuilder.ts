import { PairRow } from "../interfaces/PairRow";
import { SummaryResult } from "../interfaces/SummaryResult";
import { SlackBlock } from "../interfaces/SlackInterfaces";

export class SlackBlockBuilder {
  section(text: string): SlackBlock {
    return { type: "section", text: { type: "mrkdwn", text } };
  }

  header(text: string): SlackBlock {
    return { type: "header", text: { type: "plain_text", text } };
  }

  divider(): SlackBlock {
    return { type: "divider" };
  }

  formatItemLine(item: PairRow): string {
    const people = item.participants.join(" × ");
    const when = `*${item.date}*\n_${item.start}_ → _${item.end}_`;
    const goal = item.goal.replace(/\*/g, "\\*");
    const dur = `*${item.duration.text}* (${item.duration.minutes} min)`;
    return `• *${people}*\n${when}\n${goal}\n${dur}`;
  }

  formatSummaryBlocks(summary: SummaryResult): SlackBlock[] {
    const blocks: SlackBlock[] = [];

    // Header
    blocks.push(this.header("📊 Resumo de Pair Programming"));
    blocks.push(this.divider());

    // Período
    const fromStr = summary.dateRange.from.toLocaleDateString("pt-BR");
    const toStr = summary.dateRange.to.toLocaleDateString("pt-BR");
    blocks.push(this.section(`📅 *Período:* ${fromStr} até ${toStr}`));
    blocks.push(this.divider());

    // Totais gerais
    blocks.push(
      this.section(
        `🎯 *Total de sessões:* ${summary.totalSessions}\n` +
          `⏱️ *Tempo total:* ${summary.totalHours} (${summary.totalMinutes} min)\n` +
          `👥 *Participantes únicos:* ${summary.uniqueParticipants.length}`
      )
    );
    blocks.push(this.divider());

    // Estatísticas por participante
    if (summary.participantStats.length > 0) {
      blocks.push(this.section("👤 *Por participante:*"));

      const participantLines = summary.participantStats
        .slice(0, 10) // Limitar a 10 participantes para não exceder limites do Slack
        .map(
          (stat) =>
            `• *${stat.name}*: ${stat.sessions} sessão${
              stat.sessions !== 1 ? "ões" : ""
            } • ${stat.hours}`
        );

      blocks.push(this.section(participantLines.join("\n")));

      if (summary.participantStats.length > 10) {
        blocks.push(
          this.section(
            `_... e mais ${
              summary.participantStats.length - 10
            } participante(s)_`
          )
        );
      }
    }

    return blocks;
  }
}
