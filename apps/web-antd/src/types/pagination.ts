interface PaginationResult {
  items: Array<any>;
  page: number;
  size: number;
  total: number;
  total_pages: number;
  links: any;
}

export type { PaginationResult };
