import { PairRow } from "../interfaces/PairRow";
import { SlackResponse } from "../interfaces/SlackInterfaces";
import { Filters } from "../interfaces/Filters";
import { PaginationResult } from "../interfaces/PaginationResult";

export interface ResponseFormatter {
  formatResponse(
    pairingData: PaginationResult<PairRow>,
    filters: Filters
  ): SlackResponse;
}
