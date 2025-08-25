// This file is now obsolete. The functionality has been moved to:
// - /src/interfaces/PairRow.ts (for the type definition)
// - /src/services/SheetRepository.ts (for the data access)
// - /src/utils/helpers.ts (for utility functions)

// This file is kept temporarily for backward compatibility but should be removed in future versions.

import { PairRow } from "./interfaces/PairRow";
import { SheetRepository } from "./services/SheetRepository";
import { parseDurationToMinutes as parseMinutes } from "./utils/helpers";

// Re-export the type for backward compatibility
export type { PairRow };

// Re-export utility functions for backward compatibility
export const parseDurationToMinutes = parseMinutes;

// Provide the old function to maintain backward compatibility
export function readSheetAsObjects(
  spreadsheetId: string,
  sheetName: string
): PairRow[] {
  const repository = new SheetRepository(spreadsheetId, sheetName);
  return repository.getAll();
}
