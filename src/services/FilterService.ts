import { PairRow } from "../interfaces/PairRow";
import { Filters } from "../interfaces/Filters";
import { parseDateLoose } from "../utils/helpers";

export class FilterService {
  filterItems(items: PairRow[], filters: Filters): PairRow[] {
    let filteredItems = items;

    if (filters.user) {
      const needle = filters.user.toLowerCase();
      filteredItems = filteredItems.filter(
        (item) =>
          item.slackIds.some((id) => id.toLowerCase() === needle) ||
          item.participants.some((p) => p.toLowerCase().includes(needle))
      );
    }

    if (filters.from || filters.to) {
      filteredItems = filteredItems.filter((item) => {
        const date = this.parsePtDateCell(item.date);
        if (!date) return false;
        if (filters.from && date < filters.from) return false;
        if (filters.to && date > (filters.to as Date)) return false;
        return true;
      });
    }

    return filteredItems;
  }

  private parsePtDateCell(cell: string): Date | undefined {
    return parseDateLoose(cell);
  }
}
