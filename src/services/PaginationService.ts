import { PaginationResult } from "../interfaces/PaginationResult";

export class PaginationService {
  paginate<T>(items: T[], page: number, pageSize: number): PaginationResult<T> {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const validPage = Math.min(Math.max(1, page), totalPages);
    const start = (validPage - 1) * pageSize;
    const data = items.slice(start, start + pageSize);

    return {
      data,
      page: validPage,
      pageSize,
      total,
      totalPages,
    };
  }
}
