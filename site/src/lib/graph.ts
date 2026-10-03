import { collectContent } from './content';
import { contentKinds, kindMeta, type ContentKind } from './kinds';

export type NodeKind = 'root' | 'hub' | 'item' | 'tag';
export type NodeGroup = ContentKind | 'root' | 'tag';

export interface GraphNode {
  kind: NodeKind;
  group: NodeGroup;
  label: string;
  title: string;
  summary: string;
  href?: string;
  depth: number;
  r: number;
  x: number;
  y: number;
}

export interface GraphLink {
  source: number;
  target: number;
  kind: 'tree' | 'tag' | 'relation';
}

export const GRAPH_WIDTH = 640;
export const GRAPH_HEIGHT = 520;

const MAX_ITEMS_PER_KIND = 8;
const MAX_TAGS = 20;

/** 每类内容只取前几条上图，避免节点过密。 */
async function collectItems() {
  const items = await collectContent();
  return contentKinds.flatMap((kind) => items.filter((item) => item.kind === kind).slice(0, MAX_ITEMS_PER_KIND));
}

/** 字符串哈希 + mulberry32，保证每次构建布局一致。 */
function seeded(key: string) {
  let h = 1779033703 ^ key.length;
  for (let i = 0; i < key.length; i += 1) {
    h = Math.imul(h ^ key.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function buildGraph() {
  const items = await collectItems();
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  nodes.push({ kind: 'root', group: 'root', label: '', title: '个人工程实践手记', summary: '所有内容从这里展开。', depth: 0, r: 9, x: 0, y: 0 });

  const kinds = contentKinds.filter((kind) => items.some((item) => item.kind === kind));
  const hubIndex = new Map<ContentKind, number>();
  const counts = new Map<ContentKind, number>();
  kinds.forEach((kind, k) => {
    const count = items.filter((item) => item.kind === kind).length;
    const angle = -Math.PI / 2 + (k / kinds.length) * Math.PI * 2;
    counts.set(kind, count);
    hubIndex.set(kind, nodes.length);
    links.push({ source: 0, target: nodes.length, kind: 'tree' });
    nodes.push({
      kind: 'hub', group: kind, label: kindMeta[kind].hub, title: kindMeta[kind].hub,
      summary: `共 ${count} ${kindMeta[kind].unit}`, href: kindMeta[kind].href,
      depth: 1, r: 11, x: Math.cos(angle) * 110, y: Math.sin(angle) * 110,
    });
  });

  const itemIndex = new Map<string, number>();
  for (const item of items) {
    const hub = hubIndex.get(item.kind)!;
    const random = seeded(item.key);
    const base = Math.atan2(nodes[hub].y, nodes[hub].x) + (random() - 0.5) * 1.2;
    itemIndex.set(item.key, nodes.length);
    links.push({ source: hub, target: nodes.length, kind: 'tree' });
    nodes.push({
      kind: 'item', group: item.kind, label: item.title, title: item.title, summary: item.summary, href: item.href,
      depth: 2, r: 6.5, x: Math.cos(base) * 210, y: Math.sin(base) * 210,
    });
  }

  for (const item of items) {
    if (!item.relatedKey) continue;
    const related = itemIndex.get(item.relatedKey);
    if (related !== undefined) links.push({ source: itemIndex.get(item.key)!, target: related, kind: 'relation' });
  }

  const tagUsage = new Map<string, string[]>();
  for (const item of items) {
    for (const tag of item.tags) tagUsage.set(tag, [...(tagUsage.get(tag) ?? []), item.key]);
  }
  const tags = [...tagUsage.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, MAX_TAGS);
  for (const [tag, keys] of tags) {
    const first = nodes[itemIndex.get(keys[0])!];
    const random = seeded(`tag:${tag}`);
    const angle = Math.atan2(first.y, first.x) + (random() - 0.5) * 0.9;
    const index = nodes.length;
    nodes.push({
      kind: 'tag', group: 'tag', label: tag, title: tag, summary: `关联 ${keys.length} 条内容`,
      depth: 3, r: 3.5, x: Math.cos(angle) * 290, y: Math.sin(angle) * 290,
    });
    for (const key of keys) links.push({ source: itemIndex.get(key)!, target: index, kind: 'tag' });
  }

  layout(nodes, links);

  return {
    nodes,
    links,
    groups: kinds.map((kind) => ({ kind, label: kindMeta[kind].label, count: counts.get(kind) ?? 0 })),
  };
}

/** 构建期的力导向布局：连线弹簧 + 节点斥力 + 向心力 + 碰撞，跑完再缩放进固定画布。 */
function layout(nodes: GraphNode[], links: GraphLink[]) {
  const n = nodes.length;
  const vx = new Float64Array(n);
  const vy = new Float64Array(n);
  const degree = new Array<number>(n).fill(0);
  for (const link of links) {
    degree[link.source] += 1;
    degree[link.target] += 1;
  }
  const charge = nodes.map((node) => (node.kind === 'root' || node.kind === 'hub' ? -520 : node.kind === 'item' ? -260 : -110));
  const pad = nodes.map((node) => (node.kind === 'tag' ? 16 : node.kind === 'hub' ? 22 : 12));
  const distance = links.map((link) => {
    if (link.kind === 'relation') return 140;
    if (link.kind === 'tag') return 46;
    return nodes[link.source].kind === 'root' ? 100 : 76;
  });
  const strength = links.map((link) => (link.kind === 'relation' ? 0.15 : 1 / Math.min(degree[link.source], degree[link.target])));

  const iterations = 360;
  const alphaDecay = 1 - Math.pow(0.001, 1 / iterations);
  let alpha = 1;

  for (let step = 0; step < iterations; step += 1) {
    alpha += (0 - alpha) * alphaDecay;

    links.forEach((link, l) => {
      const s = link.source;
      const t = link.target;
      let dx = nodes[t].x + vx[t] - nodes[s].x - vx[s];
      let dy = nodes[t].y + vy[t] - nodes[s].y - vy[s];
      const length = Math.hypot(dx, dy) || 1e-6;
      const k = ((length - distance[l]) / length) * alpha * strength[l];
      dx *= k;
      dy *= k;
      const bias = degree[s] / (degree[s] + degree[t]);
      vx[t] -= dx * bias;
      vy[t] -= dy * bias;
      vx[s] += dx * (1 - bias);
      vy[s] += dy * (1 - bias);
    });

    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const d2 = Math.max(dx * dx + dy * dy, 1);
        vx[i] += (dx * charge[j] * alpha) / d2;
        vy[i] += (dy * charge[j] * alpha) / d2;
        vx[j] -= (dx * charge[i] * alpha) / d2;
        vy[j] -= (dy * charge[i] * alpha) / d2;
      }
    }

    for (let i = 0; i < n; i += 1) {
      vx[i] -= nodes[i].x * 0.03 * alpha;
      vy[i] -= nodes[i].y * 0.03 * alpha;
      if (nodes[i].kind === 'root') {
        vx[i] = 0;
        vy[i] = 0;
        continue;
      }
      vx[i] *= 0.6;
      vy[i] *= 0.6;
      nodes[i].x += vx[i];
      nodes[i].y += vy[i];
    }

    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const d = Math.hypot(dx, dy) || 1e-6;
        const min = nodes[i].r + nodes[j].r + Math.max(pad[i], pad[j]);
        if (d >= min) continue;
        const push = ((min - d) / d) * 0.5;
        if (nodes[i].kind !== 'root') {
          nodes[i].x -= dx * push;
          nodes[i].y -= dy * push;
        }
        if (nodes[j].kind !== 'root') {
          nodes[j].x += dx * push;
          nodes[j].y += dy * push;
        }
      }
    }
  }

  // 标签文字会向外伸出，左右多留边距。
  const xs = nodes.map((node) => node.x);
  const ys = nodes.map((node) => node.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const scale = Math.min((GRAPH_WIDTH - 200) / Math.max(maxX - minX, 1), (GRAPH_HEIGHT - 90) / Math.max(maxY - minY, 1), 1.5);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  for (const node of nodes) {
    node.x = Math.round((node.x - cx) * scale * 10) / 10;
    node.y = Math.round((node.y - cy) * scale * 10) / 10;
  }
}
