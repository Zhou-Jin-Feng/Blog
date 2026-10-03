import type { APIRoute } from 'astro';
import { navItems } from '../data/site';
import { collectContent } from '../lib/content';
import { formatDate } from '../lib/format';
import { kindMeta } from '../lib/kinds';

const pageSummaries: Record<string, string> = {
  '/': '站点首页和内容关系图。',
  '/blog/': '按时间整理的学习笔记与工程实践文章。',
  '/projects/': '个人工程实践项目、技术栈和本人贡献。',
  '/docs/': '按版本和更新时间整理的技术文档。',
  '/video/': '项目演示视频和文字摘要。',
  '/downloads/': '公开下载资料、文件类型、大小和版本信息。',
  '/resume/': '网页版简历摘要和脱敏 PDF 下载入口。',
  '/timeline/': '教育、项目与实践经历时间线。',
  '/about/': '个人介绍、技术方向和公开联系方式。',
};

export const GET: APIRoute = async () => {
  const entries = [
    ...(await collectContent()).map((item) => ({
      type: kindMeta[item.kind].label,
      title: item.title,
      summary: item.summary,
      href: item.href,
      tags: [...item.tags, ...item.facets],
      date: item.date && formatDate(item.date),
    })),
    ...navItems.map((item) => ({ type: '页面', title: item.label, summary: pageSummaries[item.href] ?? '', href: item.href, tags: [] })),
  ];

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
