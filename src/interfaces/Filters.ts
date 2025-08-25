export interface Filters {
  user?: string; // slack id (Uxxxx) ou nome
  from?: Date; // inclusive (normalizado p/ 00:00)
  to?: Date; // inclusive (normalizado p/ 23:59)
  page: number;
  pageSize: number;
  raw: string; // o texto original do comando, p/ exibir no header
  sum?: boolean; // modo de soma - exibe totais em vez de lista
}
