import { IPaginationModel } from "../types/pagination/pagination-model";

export const paginateItems = <T>({
  items,
  totalCount,
  page,
  pageSize,
}: {
  items: Array<T>;
  totalCount: number;
  page: number;
  pageSize: number;
}): IPaginationModel<T> => {
  return {
    totalCount,
    items,
    page: page,
    pagesCount: Math.ceil(totalCount / pageSize),
    pageSize: pageSize,
  };
};
