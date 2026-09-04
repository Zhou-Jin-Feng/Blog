export const siteConfig = {
  name: '个人工程实践手记',
  description: '记录学习笔记、技术文档与个人工程实践的中文博客模板。',
  email: '2644897763@qq.com',
  githubUrl: 'https://github.com/Zhou-Jin-Feng/Blog',
};

export const navItems = [
  { href: '/', label: '首页' },
  { href: '/blog/', label: '博客' },
  { href: '/projects/', label: '项目' },
  { href: '/docs/', label: '文档' },
  { href: '/video/', label: '视频' },
  { href: '/downloads/', label: '下载' },
  { href: '/resume/', label: '简历' },
  { href: '/timeline/', label: '履历' },
  { href: '/about/', label: '关于' },
];

export const timelineItems = [
  {
    period: 'YYYY-MM',
    type: '教育 / 项目 / 实践',
    title: '[待替换] 经历标题',
    description: '这里填写一段可公开的经历说明，替换真实内容后再发布。',
    result: '这里填写可验证的成果或承担的职责。',
  },
  {
    period: 'YYYY-MM - YYYY-MM',
    type: '项目实践',
    title: '[待替换] 项目经历',
    description: '这里填写项目背景、目标和公开范围。',
    result: '这里填写结果、指标或复盘链接。',
  },
];

export const resumeSections = [
  {
    title: '个人概述',
    content: '这里替换为一段简洁的个人定位、技术方向和工程实践重点。',
  },
  {
    title: '核心能力',
    content: '这里替换为经过真实项目验证的语言、框架、工具和协作能力。',
  },
  {
    title: '代表项目',
    content: '这里替换为项目目标、本人贡献、结果和公开链接。',
  },
];
