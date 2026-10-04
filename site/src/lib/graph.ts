import { forceLink, forceManyBody, forceRadial, forceSimulation, forceX, forceY, type SimulationLinkDatum, type SimulationNodeDatum } from 'd3-force';
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
  const sectors = new Map<ContentKind, { angle: number; sector: number }>();
  // 栏目按子树大小分扇区（1 + 内容数 + 标签数的一半），第一个栏目居中朝上。内容多的栏目角度大，标签不会挤在一侧。
  const weights = kinds.map((kind) => {
    const own = items.filter((item) => item.kind === kind);
    return 1 + own.length + new Set(own.flatMap((item) => item.tags)).size / 2;
  });
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let sectorStart = -Math.PI / 2 - (weights[0] / total) * Math.PI;
  kinds.forEach((kind, k) => {
    const count = items.filter((item) => item.kind === kind).length;
    const sector = (weights[k] / total) * Math.PI * 2;
    const angle = sectorStart + sector / 2;
    sectorStart += sector;
    sectors.set(kind, { angle, sector });
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
    // 同栏目的内容在扇区内均匀排开，再加一点确定的抖动。
    const siblings = items.filter((other) => other.kind === item.kind);
    const { angle, sector } = sectors.get(item.kind)!;
    const step = Math.min((sector * 0.8) / siblings.length, 0.6);
    const base = angle + (siblings.indexOf(item) - (siblings.length - 1) / 2) * step + (seeded(item.key)() - 0.5) * 0.15;
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
    // 放在所有关联内容的平均方向上：共享的标签落在几条内容之间，专属的标签靠向各自的内容。
    const direction = keys.reduce((sum, key) => {
      const item = nodes[itemIndex.get(key)!];
      const length = Math.hypot(item.x, item.y) || 1;
      return { x: sum.x + item.x / length, y: sum.y + item.y / length };
    }, { x: 0, y: 0 });
    const angle = Math.atan2(direction.y, direction.x) + (seeded(`tag:${tag}`)() - 0.5) * 0.3;
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

/** 标签字号（SVG 单位），与 global.css 的 `.graph text` 一致。 */
const TAG_FONT = 11.5;
const HUB_FONT = 13.5;
/**
 * 浏览器端用 `--lk` 放大标签，画布越窄字越大；窄于 520px 进入紧凑模式、隐藏标签文字（见 ContentGraph.astro）。
 * 所以按 520px 宽时的字号估算标签占位，更宽的屏幕上只会更松。
 */
const LABEL_SCALE = Math.pow(GRAPH_WIDTH / 520, 0.75);

/** 估算文字宽度：汉字约 1em，ASCII 约 0.6em。 */
function textWidth(text: string, size: number) {
  let em = 0;
  for (const ch of text) em += ch.charCodeAt(0) < 0x2e80 ? 0.6 : 1.02;
  return em * size;
}

type Box = [left: number, top: number, right: number, bottom: number];

/** 节点连同标签占用的矩形，坐标相对节点中心。标签摆放与 ContentGraph.astro 的 labelOf 一致。 */
function boxOf(node: GraphNode, x: number): Box {
  const { r } = node;
  if (node.kind === 'tag') {
    const size = TAG_FONT * LABEL_SCALE;
    const reach = r + 5 + textWidth(node.label, size) + 2;
    const half = size * 0.6 + 1;
    return x >= 0 ? [-r - 2, -half, reach, half] : [-reach, -half, r + 2, half];
  }
  if (node.kind === 'hub') {
    const size = HUB_FONT * LABEL_SCALE;
    const half = Math.max(r + 6, textWidth(node.label, size) / 2 + 2);
    return [-half, -(r + 6), half, r + 17 + size * 0.2 + 2];
  }
  const pad = r + (node.kind === 'root' ? 6 : 5);
  return [-pad, -pad, pad, pad];
}

interface SimNode extends SimulationNodeDatum {
  node: GraphNode;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  kind: GraphLink['kind'];
}

/** 矩形碰撞。forceCollide 只认圆，而标签是横向的长条，所以按矩形推开，沿重叠较少的方向。 */
function forceBoxes(gap: number) {
  let list: SimNode[] = [];
  const force = () => {
    for (let i = 0; i < list.length; i += 1) {
      for (let j = i + 1; j < list.length; j += 1) {
        const a = list[i];
        const b = list[j];
        const ax = a.x! + a.vx!;
        const ay = a.y! + a.vy!;
        const bx = b.x! + b.vx!;
        const by = b.y! + b.vy!;
        const ba = boxOf(a.node, ax);
        const bb = boxOf(b.node, bx);
        const overlapX = Math.min(ax + ba[2], bx + bb[2]) - Math.max(ax + ba[0], bx + bb[0]) + gap;
        const overlapY = Math.min(ay + ba[3], by + bb[3]) - Math.max(ay + ba[1], by + bb[1]) + gap;
        if (overlapX <= 0 || overlapY <= 0) continue;
        // 固定的节点（起点）不动，由另一方全部让开。
        const shareA = a.fx != null ? 0 : b.fx != null ? 1 : 0.5;
        if (overlapX < overlapY) {
          const dir = bx + (bb[0] + bb[2]) / 2 >= ax + (ba[0] + ba[2]) / 2 ? 1 : -1;
          a.vx! -= dir * overlapX * shareA;
          b.vx! += dir * overlapX * (1 - shareA);
        } else {
          const dir = by + (bb[1] + bb[3]) / 2 >= ay + (ba[1] + ba[3]) / 2 ? 1 : -1;
          a.vy! -= dir * overlapY * shareA;
          b.vy! += dir * overlapY * (1 - shareA);
        }
      }
    }
  };
  force.initialize = (nodes: SimNode[]) => {
    list = nodes;
  };
  return force;
}

/** 把节点连同标签限制在画布内。布局不再整体缩放，标签占位才能和实际显示一致。 */
function forceBounds(margin: number) {
  let list: SimNode[] = [];
  const force = () => {
    for (const item of list) {
      const box = boxOf(item.node, item.x!);
      const x = item.x! + item.vx!;
      const y = item.y! + item.vy!;
      const [minX, maxX] = [-GRAPH_WIDTH / 2 + margin - box[0], GRAPH_WIDTH / 2 - margin - box[2]];
      const [minY, maxY] = [-GRAPH_HEIGHT / 2 + margin - box[1], GRAPH_HEIGHT / 2 - margin - box[3]];
      if (x < minX) item.vx! += minX - x;
      else if (x > maxX) item.vx! += maxX - x;
      if (y < minY) item.vy! += minY - y;
      else if (y > maxY) item.vy! += maxY - y;
    }
  };
  force.initialize = (nodes: SimNode[]) => {
    list = nodes;
  };
  return force;
}

/** 构建期的力导向布局（d3-force）：连线弹簧 + 节点斥力 + 向心力 + 矩形碰撞 + 画布边界。起点固定在原点。 */
function layout(nodes: GraphNode[], links: GraphLink[]) {
  const simNodes: SimNode[] = nodes.map((node) => ({
    node, x: node.x, y: node.y, ...(node.kind === 'root' && { fx: 0, fy: 0 }),
  }));
  const simLinks: SimLink[] = links.map(({ source, target, kind }) => ({ source, target, kind }));
  const charge = { root: -500, hub: -420, item: -420, tag: -180 };

  const degree = new Array<number>(nodes.length).fill(0);
  for (const { source, target } of links) {
    degree[source] += 1;
    degree[target] += 1;
  }
  // 强度沿用 d3 的默认公式（1 / 两端较小的度数）；关联线只是提示，拉得轻一点。
  const strength = links.map((l) => (l.kind === 'relation' ? 0.1 : 1 / Math.min(degree[l.source], degree[l.target])));
  const distance = links.map((l) => {
    if (l.kind === 'relation') return 140;
    if (l.kind === 'tag') return 70;
    return nodes[l.source].kind === 'root' ? 75 : 60;
  });

  const simulation = forceSimulation(simNodes)
    .force('link', forceLink<SimNode, SimLink>(simLinks).distance((_, i) => distance[i]).strength((_, i) => strength[i]))
    .force('charge', forceManyBody<SimNode>().strength(({ node }) => charge[node.kind]))
    .force('x', forceX<SimNode>(0).strength(0.05))
    .force('y', forceY<SimNode>(0).strength(0.0625))
    // 标签沿外圈散开，不往一处堆。
    .force('ring', forceRadial<SimNode>(235).strength(({ node }) => (node.kind === 'tag' ? 0.1 : 0)))
    .force('boxes', forceBoxes(3))
    .force('bounds', forceBounds(8))
    .stop();
  // 静态布局的标准写法：一次跑完到 alphaMin 所需的步数。
  simulation.tick(Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())));

  for (const { node, x, y } of simNodes) {
    node.x = Math.round(x! * 10) / 10;
    node.y = Math.round(y! * 10) / 10;
  }
}
