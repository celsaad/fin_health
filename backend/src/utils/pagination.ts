export function getPagination(query: { page?: string; limit?: string }): {
  skip: number;
  take: number;
  page: number;
} {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const take = Math.min(100, Math.max(1, parseInt(query.limit || '20', 10) || 20));
  const skip = (page - 1) * take;

  return { skip, take, page };
}
