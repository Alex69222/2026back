export interface INormalizedQparams {
  searchEmailTerm: string | null;
  searchLoginTerm: string | null;
  searchNameTerm: string | null;
  sortDirection: 1 | -1; // 1: asc, -1: desc
  sortBy: string;
  pageNumber: number;
  pageSize: number;
}
export const qpNormalizer = (qp: any): INormalizedQparams => {
  const sortDirection =
    qp.sortDirection?.toString().trim().toLowerCase() === "asc" ? 1 : -1;

  const pageNumber = isNaN(+qp?.pageNumber) ? 1 : +qp.pageNumber;
  const pageSize = isNaN(+qp?.pageSize) ? 10 : +qp.pageSize;

  const result: INormalizedQparams = {
    searchEmailTerm: qp.searchEmailTerm?.toString().trim() || null,
    searchLoginTerm: qp.searchLoginTerm?.toString().trim() || null,
    searchNameTerm: qp.searchNameTerm?.toString().trim() || null,
    sortBy: qp.sortBy?.toString().trim() || "createdAt",
    sortDirection,
    pageNumber,
    pageSize,
  };

  return result;
};
