export const siteConfig = {
  name: '个人工程实践手记',
  description: '记录学习笔记、技术文档与个人工程实践的中文博客。',
  email: '2644897763@qq.com',
  wechat: 'ZJF2644897763',
  // 博客仓库是私有的，访客打不开，这里指向个人主页。
  githubUrl: 'https://github.com/Zhou-Jin-Feng',
};

/** 浏览器地址栏颜色，与 global.css 里 --bg 的浅色、深色值保持一致。 */
export const themeColors = { light: '#e9efeb', dark: '#0f1d20' };

/**
 * 栏目开关。演示视频还没有真实内容，先隐藏：导航、星图和搜索面板里都不出现，/video/ 也不生成。
 * 做好视频后改成 true，并把 content/videos/ 里的模板条目换成真实视频。
 */
export const features = { videos: false };

/** summary 显示在搜索面板的“页面”结果里。 */
export const navItems = [
  { href: '/', label: '首页', summary: '站点首页和内容关系图。' },
  { href: '/blog/', label: '博客', summary: '按时间整理的学习笔记与工程实践文章。' },
  { href: '/projects/', label: '项目', summary: '个人工程实践项目、技术栈和本人贡献。' },
  { href: '/docs/', label: '文档', summary: '按版本和更新时间整理的技术文档。' },
  ...(features.videos ? [{ href: '/video/', label: '视频', summary: '项目演示视频和文字摘要。' }] : []),
  { href: '/downloads/', label: '下载', summary: '文章、笔记和文档的 Markdown 原文下载。' },
  { href: '/resume/', label: '简历', summary: '网页版简历：求职意向、专业技能和项目经历摘要。' },
  { href: '/timeline/', label: '履历', summary: '教育、项目与实践经历时间线。' },
  { href: '/about/', label: '关于', summary: '个人介绍、技术方向和公开联系方式。' },
];
