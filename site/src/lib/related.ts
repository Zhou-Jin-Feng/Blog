import type { ContentItem } from './content';

export interface RelatedItem extends ContentItem {
  /** 与当前内容共有的标签，按对方的标签顺序。 */
  shared: string[];
}

/**
 * 按标签重合度挑相关内容（文章用标签，项目用技术栈，不区分大小写）。
 * 共同标签多的在前；一样多时，共同标签越少见越靠前（大家都有的 Python 不如只有两篇共有的 LangChain 说明问题）；
 * 再一样就按日期从新到旧。没有共同标签的不算相关，宁缺毋滥。
 */
export function relatedTo(key: string, items: ContentItem[], limit = 3): RelatedItem[] {
  const self = items.find((item) => item.key === key);
  if (!self) return [];
  const norm = (tag: string) => tag.toLowerCase();
  const usage = new Map<string, number>();
  for (const item of items) {
    for (const tag of new Set(item.tags.map(norm))) usage.set(tag, (usage.get(tag) ?? 0) + 1);
  }
  const own = new Set(self.tags.map(norm));

  return items
    .filter((item) => item.key !== key)
    .map((item) => {
      const shared = item.tags.filter((tag) => own.has(norm(tag)));
      const rarity = shared.reduce((sum, tag) => sum + 1 / usage.get(norm(tag))!, 0);
      return { item, shared, rarity };
    })
    .filter(({ shared }) => shared.length > 0)
    .sort((a, b) =>
      b.shared.length - a.shared.length
      || b.rarity - a.rarity
      || (b.item.date?.valueOf() ?? 0) - (a.item.date?.valueOf() ?? 0))
    .slice(0, limit)
    .map(({ item, shared }) => ({ ...item, shared }));
}
