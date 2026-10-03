/** 五类内容的显示名称和栏目信息。不依赖 astro:content，浏览器端脚本也能引用。 */
export type ContentKind = 'post' | 'project' | 'doc' | 'video' | 'download';

export const kindMeta: Record<ContentKind, { label: string; hub: string; href: string; unit: string }> = {
  post: { label: '文章', hub: '博客', href: '/blog/', unit: '篇文章' },
  project: { label: '项目', hub: '项目', href: '/projects/', unit: '个项目' },
  doc: { label: '文档', hub: '文档', href: '/docs/', unit: '份文档' },
  video: { label: '视频', hub: '视频', href: '/video/', unit: '个视频' },
  download: { label: '下载', hub: '下载', href: '/downloads/', unit: '份资料' },
};

export const contentKinds = Object.keys(kindMeta) as ContentKind[];
