import { DataRepository } from "../interfaces/DataRepository";
import { PairRow } from "../interfaces/PairRow";
import { Filters } from "../interfaces/Filters";
import { ResponseFormatter } from "../interfaces/ResponseFormatter";
import { FilterService } from "./FilterService";
import { PaginationService } from "./PaginationService";
import { SlackResponse } from "../interfaces/SlackInterfaces";

export class PairProgrammingService {
  constructor(
    private repository: DataRepository<PairRow>,
    private filterService: FilterService,
    private paginationService: PaginationService,
    private responseFormatter: ResponseFormatter
  ) {}

  processRequest(filters: Filters): SlackResponse {
    const allPairs = this.repository.getAll();
    const filteredPairs = this.filterService.filterItems(allPairs, filters);
    const paginatedResult = this.paginationService.paginate(
      filteredPairs,
      filters.page,
      filters.pageSize
    );

    return this.responseFormatter.formatResponse(paginatedResult, filters);
  }
}
