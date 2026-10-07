---
title: "SenseNova Token Burner：多 API Key 积分消耗面板"
summary: "轻量的 Windows 11 桌面面板，管理多个 API Key 按目标消耗 Flash-Lite 专属积分，支持批量、定时、核查保护与深浅色主题。"
role: "个人项目，独立完成需求调研、架构设计、WinForms 桌面端开发与自动化测试。"
techStack: ["C#", ".NET", "WinForms", "Windows 11"]
status: "已完成"
period: "2026.10.05 - 2026.10.07"
repoUrl: "https://github.com/Zhou-Jin-Feng/sensenova-token-burner"
featured: false
template: false
---

## 背景与目标

SenseNova 为特定模型（Flash-Lite）提供专属积分额度，若不及时消耗容易过期失效。SenseNova Token Burner 是一款面向 Windows 11 的轻量桌面面板，用于管理多个 API Key 并按既定目标自动化消耗专属积分 tokens，同时杜绝误扣通用积分。

该项目采用 C# + WinForms 原生开发，打包为自包含的独立 .NET 安装包，无需安装 Python、Node.js 或额外的浏览器运行环境。

## 主要工作

- **多 Key 管理与加密存储**：API Key 通过当前 Windows 用户的 DPAPI 进行本地强加密存储，配置文件、界面与日志中均不出现明文；支持自定义 Key 别名与额度分组。
- **燃烧仪表与进度追踪**：每个 Key 独立展示已确认 tokens、目标额度、在途预留、确认速率及预计完成时间，并提供最近 30 分钟的分时用量折线。
- **安全核查与并发控制**：设计严格的安全防护机制，联网发请求前强制二次确认目标规模与额度风险；连接测试仅使用只读 GET 模型列表；未知状态拦截人工核查而不盲目重试；支持全局与单 Key 并发控制（默认 3）。
- **桌面体验与定时任务**：支持窗口最小化到系统托盘后台常驻、浅色/深色主题自由切换；内置可选的定时轮询机制（默认间隔 5 小时），上一轮未结束时自动跳过避免重叠。

## 评测与取舍

基于 1.2 亿 tokens（约 58,000 点专属积分）经验阈值设计保护边界，客户端仅在用户授权后发请求，不自动查询官方余额。

全量自动化测试 351 项全部通过（覆盖连接 GET-only、取消零请求、未保存拦截、单 Key 并发、异常恢复等）；mock 资源采样下峰值内存仅 94.7–98.1 MiB，空闲 CPU 约 0.1%，极大减轻系统负担。

## 当前状态

2026 年 10 月 5 日开始开发（首次提交），至 2026 年 10 月 7 日完成 v1.0 并发布开源。代码见 [GitHub 仓库](https://github.com/Zhou-Jin-Feng/sensenova-token-burner)。