import { PairRow } from "../interfaces/PairRow";
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
}
