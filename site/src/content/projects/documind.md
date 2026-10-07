---
title: "DocuMind：支持可选重排的 RAG 知识库系统"
summary: "面向本地文档的知识库，支持文档管理、流式问答与引用定位，并提供不调用生成模型的独立纯检索接口。"
role: "个人项目，独立完成需求设计、架构、前后端开发、测试与评测。"
techStack: ["Python", "FastAPI", "React", "TypeScript", "Milvus", "LangChain", "Docker"]
status: "进行中"
period: "2026.08 - 至今"
repoUrl: "https://github.com/Zhou-Jin-Feng/DocuMind"
featured: true
template: false
---

## 背景与目标

DocuMind 面向本地文档构建知识库，提供文档管理、流式问答和引用定位。除了问答，它还提供一个独立的纯检索接口（不调用生成模型），作为 [ScholarTrace](/projects/scholartrace/) 的全文证据检索服务，已完成真实联调。

## 主要工作

- **检索与问答**：支持 PDF / DOCX / TXT 解析、分块和 Milvus 检索；Web 问答提供标准与质量优先两种模式，质量模式对 Dense 候选执行本地 Cross-Encoder 重排，支持模型准备、超时与繁忙回退，纯检索接口的契约保持兼容。
- **数据一致性**：用 source → claim → build → validate → activate → cleanup 状态机管理文档与索引的生命周期；实现活动索引原子切换、幂等摄取与崩溃恢复，并在检索链路强校验身份，阻断对失效索引的访问。
- **前端与交互**：拆分 React 会话与消息模块，合并 SSE token 更新，完善引用定位、停止生成与窄屏交互；界面展示模型准备状态、实际使用的模式及回退原因。在固定 Mock 基准下，React 渲染提交次数的中位数从 172 次降到 52 次。

## 评测与取舍

在新冻结的 30 题验收集里，对 24 道可回答题评测：开启重排后 MRR@3 从 0.7778 提升到 0.9306，Recall@3 不下降。

代价是延迟：在 CPU 上，质量模式 100 次预热检索的来源返回 P95 为 2.31 秒。所以默认用标准模式，质量模式作为可选项。

## 当前状态

2026 年 8 月开始开发，仍在持续迭代。代码见 [GitHub 仓库](https://github.com/Zhou-Jin-Feng/DocuMind)。
