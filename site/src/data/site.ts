export const siteConfig = {
  name: '个人工程实践手记',
  description: '记录学习笔记、技术文档与个人工程实践的中文博客模板。',
  email: '2644897763@qq.com',
  githubUrl: 'https://github.com/Zhou-Jin-Feng/Blog',
};

/** 浏览器地址栏颜色，与 global.css 里 --bg 的浅色、深色值保持一致。 */
export const themeColors = { light: '#e9efeb', dark: '#0f1d20' };

/** summary 显示在搜索面板的“页面”结果里。 */
export const navItems = [
  { href: '/', label: '首页', summary: '站点首页和内容关系图。' },
  { href: '/blog/', label: '博客', summary: '按时间整理的学习笔记与工程实践文章。' },
  { href: '/projects/', label: '项目', summary: '个人工程实践项目、技术栈和本人贡献。' },
  { href: '/docs/', label: '文档', summary: '按版本和更新时间整理的技术文档。' },
  { href: '/video/', label: '视频', summary: '项目演示视频和文字摘要。' },
  { href: '/downloads/', label: '下载', summary: '公开下载资料、文件类型、大小和版本信息。' },
  { href: '/resume/', label: '简历', summary: '网页版简历摘要和脱敏 PDF 下载入口。' },
  { href: '/timeline/', label: '履历', summary: '教育、项目与实践经历时间线。' },
  { href: '/about/', label: '关于', summary: '个人介绍、技术方向和公开联系方式。' },
];
