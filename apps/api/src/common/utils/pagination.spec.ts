import { describe, expect, it } from 'vitest';
import { paginate } from './pagination';
import { slugify } from './slug';

describe('pagination utils', () => {
  it('paginates results with correct meta', () => {
    const result = paginate(['a', 'b'], 10, 1, 2);
    expect(result.data).toEqual(['a', 'b']);
    expect(result.meta).toEqual({
      page: 1,
      limit: 2,
      total: 10,
      totalPages: 5,
    });
  });

  it('slugifies organization names', () => {
    expect(slugify('Demo Organization')).toBe('demo-organization');
    expect(slugify('  Hello World!  ')).toBe('hello-world');
  });
});
