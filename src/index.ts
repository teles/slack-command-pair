/// <reference types="google-apps-script" />
import { SHEET_ID, SHEET_NAME } from "./config/constants";
import { SheetRepository } from "./services/SheetRepository";
import { FilterService } from "./services/FilterService";
import { PaginationService } from "./services/PaginationService";
import { CommandParser } from "./services/CommandParser";
import { SlackResponseFormatter } from "./presenters/SlackResponseFormatter";
import { PairProgrammingService } from "./services/PairProgrammingService";
import { okJson } from "./utils/helpers";

// Initialize services (dependency injection)
const repository = new SheetRepository(SHEET_ID, SHEET_NAME);
const filterService = new FilterService();
const paginationService = new PaginationService();
const responseFormatter = new SlackResponseFormatter();
const commandParser = new CommandParser();
const pairProgrammingService = new PairProgrammingService(
  repository,
  filterService,
  paginationService,
  responseFormatter
);

/**
 * Handles HTTP GET requests
 */
function doGet(e: GoogleAppsScript.Events.DoGet) {
  const filters = commandParser.parseQueryParams(e?.parameter || {});
  const response = pairProgrammingService.processRequest(filters);

  return okJson({
    ok: true,
    query: {
      user: filters.user,
      from: filters.from?.toISOString(),
      to: filters.to?.toISOString(),
      page: filters.page,
      pageSize: filters.pageSize,
    },
    // Response data will be included here
    ...response,
  });
}

/**
 * Handles HTTP POST requests
 */
function doPost(e: GoogleAppsScript.Events.DoPost) {
  const params = e?.parameter || {};
  const text = String(params.text || "");
  const filters = commandParser.parseCommandText(text);
  const response = pairProgrammingService.processRequest(filters);
  return okJson(response);
}

// Export functions for Google Apps Script
(globalThis as any).doGet = doGet;
(globalThis as any).doPost = doPost;
