import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { navItems } from '../data/site';
import { formatDate } from '../lib/format';

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
  const [posts, projects, docs, videos, downloads] = await Promise.all([
    getCollection('blog', ({ data }) => !data.draft),
    getCollection('projects'),
    getCollection('docs'),
    getCollection('videos'),
    getCollection('downloads'),
  ]);

  const entries = [
    ...posts
      .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf())
      .map((post) => ({ type: '文章', title: post.data.title, summary: post.data.description, href: `/blog/${post.id}/`, tags: post.data.tags, date: formatDate(post.data.publishDate) })),
    ...projects.map((project) => ({ type: '项目', title: project.data.title, summary: project.data.summary, href: `/projects/${project.id}/`, tags: [...project.data.techStack, project.data.status] })),
    ...docs.map((doc) => ({ type: '文档', title: doc.data.title, summary: doc.data.summary, href: `/docs/${doc.id}/`, tags: [doc.data.version], date: formatDate(doc.data.updatedDate) })),
    ...videos.map((video) => ({ type: '视频', title: video.data.title, summary: video.data.summary, href: '/video/', tags: [video.data.platform] })),
    ...downloads.map((item) => ({ type: '下载', title: item.data.title, summary: item.data.summary, href: '/downloads/', tags: [item.data.fileType] })),
    ...navItems.map((item) => ({ type: '页面', title: item.label, summary: pageSummaries[item.href] ?? '', href: item.href, tags: [] })),
  ];

  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
