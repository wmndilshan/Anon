import { paginateResult } from './pagination-query.dto';

describe('paginateResult', () => {
  it('returns correct shape for a basic page', () => {
    const result = paginateResult(['a', 'b', 'c'], 50, 2, 10);
    expect(result).toEqual({
      items: ['a', 'b', 'c'],
      total: 50,
      page: 2,
      pageSize: 10,
      pageCount: 5,
    });
  });

  it('rounds up pageCount when there is a remainder', () => {
    const result = paginateResult([], 21, 1, 20);
    expect(result.pageCount).toBe(2);
  });

  it('returns pageCount 0 when total is 0', () => {
    const result = paginateResult([], 0, 1, 20);
    expect(result.pageCount).toBe(0);
  });

  it('returns pageCount 1 when total equals pageSize', () => {
    const result = paginateResult(['x'], 5, 1, 5);
    expect(result.pageCount).toBe(1);
  });
});
