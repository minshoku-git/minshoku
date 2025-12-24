import z from 'zod';

// 共通のソート・ページネーション部分
export const SortItemsSchema = z.object({
  nextPage: z.number().int().min(0),
  sortColumn: z.string(),
  ascending: z.boolean(),
});
