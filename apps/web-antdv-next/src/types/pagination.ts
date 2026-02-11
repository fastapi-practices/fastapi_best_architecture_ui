interface PaginationResult<T> {
  items: Array<T>;
  page: number;
  size: number;
  total: number;
  total_pages: number;
  links: any;
}

export type { PaginationResult };
