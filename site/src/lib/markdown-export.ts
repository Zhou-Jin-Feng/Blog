import type { CollectionEntry } from 'astro:content';
import { formatDate } from './format';

export const AI_NOTE = '本文由作者整理，AI 辅助润色。';

/** 一篇可以下载 Markdown 原文的内容：文章或文档。 */
export interface Downloadable {
  title: string;
  summary: string;
  date: Date;
  /** 网页地址。 */
  page: string;
  /** Markdown 文件地址，由 `[slug].md.ts` 在构建时生成。 */
  file: string;
  /** 浏览器保存时建议的文件名。 */
  fileName: string;
  markdown: (site: URL) => string;
}

export function fromPost(post: CollectionEntry<'blog'>): Downloadable {
  const { title, description, publishDate, updatedDate, aiAssisted } = post.data;
  return downloadable({ title, summary: description, date: updatedDate ?? publishDate, page: `/blog/${post.id}/`, file: `/blog/${post.id}.md`, body: post.body, aiAssisted });
}

export function fromDoc(doc: CollectionEntry<'docs'>): Downloadable {
  const { title, summary, updatedDate, version, aiAssisted } = doc.data;
  return downloadable({ title, summary, date: updatedDate, version, page: `/docs/${doc.id}/`, file: `/docs/${doc.id}.md`, body: doc.body, aiAssisted });
}

function downloadable(source: { title: string; summary: string; date: Date; version?: string; page: string; file: string; body?: string; aiAssisted: boolean }): Downloadable {
  const { title, summary, date, version, page, file, body = '', aiAssisted } = source;
  return {
    title,
    summary,
    date,
    page,
    file,
    fileName: `${title.replace(/[\\/:*?"<>|]/g, '-').trim()}.md`,
    markdown: (site) =>
      [
        `# ${title}`,
        '',
        `> ${summary}`,
        '>',
        `> 原文：${[new URL(page, site), version, formatDate(date)].filter(Boolean).join(' · ')}`,
        '',
        absolutize(body.trim(), site),
        ...(aiAssisted ? ['', '---', '', AI_NOTE] : []),
        '',
      ].join('\n'),
  };
}

/** 站内链接和图片（`](/...)`）改成绝对地址，下载后离线打开也能访问；代码块里的内容不动。 */
function absolutize(markdown: string, site: URL) {
  let inFence = false;
  return markdown
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
      return inFence ? line : line.replace(/\]\((\/[^)\s]*)/g, (_, path: string) => `](${new URL(path, site)}`);
    })
    .join('\n');
}
