---
title: "LangChain + LangGraph + LangSmith 学习笔记"
description: "面向 Python 开发者，从模型调用、RAG 与 Agent，到有状态工作流、可观测性、评测和部署，梳理三者的定位和协作方式。"
publishDate: "2026-08-27"
tags: ["LangChain", "LangGraph", "LangSmith", "Agent"]
aiAssisted: true
template: false
---

> 面向 Python 开发者的体系化教程：从模型调用、RAG 与 Agent，到有状态工作流、可观测性、评测和生产部署。
>
> **资料时点：2026-08-19**。本文以官方文档和官方发布记录为时效基准，并参考两份本地入门资料重新整理。生态更新很快，落地项目前请再次查看发布说明并锁定依赖。
>
> **内容重心**：正文以 LangChain、LangGraph、LangSmith 的核心概念、当前 API 和三者协作为主；MCP、Deep Agents、A2A 等邻近技术仅保留理解生态所需的内容。
>
> **复审说明**：当前示例已按官方 v1.x 文档复核；带网络、模型或平台依赖的代码仍需配置相应密钥后运行。

---

## 📌 阅读优先级

> 本文按大模型应用开发中的使用频率和投入产出比分级。优先级表示第一次学习应投入的精力，不代表低优先级内容没有价值。

| 标记 | 学习要求 | 常见使用位置 |
| --- | --- | --- |
| 🔥 重点掌握 | 理解原理，能独立修改示例并排查常见问题 | 模型接入、工具调用、Agent、RAG、状态编排、评测与生产治理 |
| 🧩 补充掌握 | 能读懂并知道何时使用，项目需要时可快速落地 | 版本迁移、记忆、MCP、平台能力与部署 |
| 👀 了解即可 | 建立概念边界，不必记 API 或从零实现 | 多智能体扩展、A2A、Deep Agents 和资料索引 |

### 🔥 重点掌握

1. **三者定位与选型（第 2 章）**：决定简单链、Agent、状态图和观测平台分别何时介入。
2. **LangChain 核心基础（第 4 章）**：模型、消息、Prompt、Runnable、结构化输出和工具调用构成应用主链路。
3. **Agent 与上下文工程（第 5 章）**：用于工具选择、动态上下文、中间件、循环保护和行为约束。
4. **记忆与 RAG（第 6～7 章）**：用于多轮会话、知识检索、引用、拒答和检索质量评估。
5. **LangGraph（第 9～10 章）**：用于有状态、可分支、可恢复、可人工审批和可流式输出的复杂流程。
6. **LangSmith 与生产实践（第 11、13～14 章）**：用于追踪、评测、成本分析、故障定位和上线治理。

### 🧩 补充掌握

1. **版本与迁移（第 1、15 章）**：生态变化快，能避免复制旧 API 和过期教程。
2. **环境与项目结构（第 3 章）**：便于依赖锁定、密钥管理和模块拆分。
3. **MCP（第 8.2 节）**：用于按统一协议接入外部工具与上下文，实际项目中越来越常见。
4. **Prompt、Studio 与部署（第 12 章）**：用于提示词版本管理、可视化调试和平台化运行。
5. **学习检查表（第 16 章）**：用于复习和查漏补缺。

### 👀 了解即可

1. **多智能体、Deep Agents 与 A2A（第 8.1、8.3～8.4 节）**：先理解边界，确有跨 Agent 协作需求时再深入。
2. **近期扩展能力（第 1.3 节）**：知道生态方向即可，不要优先追逐所有新功能。
3. **官方资料索引（第 17 章）**：作为查询入口使用，无需专门学习。

---

## 1. 当前版本与关键变化 ★★★

> 🧩 **学习优先级：补充掌握**

### 1.1 本文核对到的版本

| 包 | 2026-08-19 核对到的最新官方发布 | 主要定位 |
| --- | --- | --- |
| `langchain` | `1.3.15`，发布于 2026-08-11 | 高层 Agent 框架与统一模型接口 |
| `langchain-core` | `1.5.6`，发布于 2026-08-17 | 消息、Runnable、工具、模型等基础协议 |
| `langgraph` | `1.2.11`，发布于 2026-08-11 | 有状态、可恢复的 Agent/工作流运行时 |
| `langsmith` SDK | `0.11.0`，发布于 2026-08-14 | Tracing、数据集、评测和平台 API |

版本号只是资料时点快照，不应直接代替项目锁文件。新项目建议使用 `uv.lock`、`poetry.lock` 或固定的 `requirements.txt` 保证可重复构建。

### 1.2 v1.x 之后必须知道的变化

1. **`create_agent` 是标准 Agent API**。`langgraph.prebuilt.create_react_agent` 已弃用，新代码使用 `langchain.agents.create_agent`。
2. **Agent 底层基于 LangGraph**。即使只写 LangChain Agent，也天然可以接入 checkpoint、流式输出、人工审批和持久化。
3. **中间件成为 Agent 扩展主轴**。动态提示词、模型路由、工具筛选、摘要、PII 防护、重试和人工审批都可组合到 Agent 生命周期中。
4. **消息拥有标准内容块 `content_blocks`**。文本、推理、引用、工具调用和多模态内容可以用较统一的结构读取。
5. **`langchain` 顶层命名空间被精简**。旧 Chains、部分 Retrievers、Hub 等迁往 `langchain-classic`；不要把新项目建立在旧导入路径上。
6. **LangGraph 1.x 保持 Graph 核心 API 稳定**，重点继续放在 durable execution、checkpoint、interrupt、streaming 和类型安全。
7. **流式接口已分层**：低层 `stream(..., version="v2")` 提供统一 `StreamPart`；面向应用的新代码优先考虑 `stream_events(..., version="v3")` 的类型化投影。
8. **LangSmith 已不只是 trace 查看器**。它覆盖离线/在线评测、提示词版本、Studio、Agent Server、部署、网关、生产问题分析和自动修复闭环。

> **重点：** 新项目以 `langchain.agents.create_agent` 为 Agent 入口。看到旧教程中的 `langgraph.prebuilt.create_react_agent`、`messages_modifier` 或旧 Chains 导入时，先查迁移指南，不要直接复制。

### 1.3 近期值得关注的能力

- LangChain 1.3 为 Agent 增加 `stream_events(..., version="v3")` 支持。
- LangGraph 1.2 的 Event Streaming 提供 `messages`、`values`、`subgraphs`、`output` 等独立类型化投影。
- LangChain 1.3.15 新增或完善 `AgentMiddleware.trace_policy`、`wrap_tool_call` 的 `state_schema`、标准 `reasoning_effort` 参数，并修复了 HITL 审批可能静默放行等问题。
- LangSmith Engine 可从生产 traces 中聚类问题、分析根因、生成 evaluator/数据集，并提出代码修复。
- LangSmith LLM Gateway 统一多模型入口、trace、限额、费用与数据保护策略；截至本文时点仍标为 **Beta**。
- Deep Agents 在 LangChain Agent 之上提供文件系统、上下文卸载、规划、skills、记忆和子 Agent 等更完整的 harness。

---

## 2. 三者的定位与选型 ★★★★★

> 🔥 **学习优先级：重点掌握**

```text
用户或业务系统
  -> LangChain：模型、Prompt、Tools、RAG、Agent、中间件
  -> LangGraph：状态、节点、路由、持久化、恢复、HITL
       -> 模型服务
       -> 数据库、API、MCP、文件和其他工具

LangChain ..traces / evals..> LangSmith：可观测、评测、Prompt、Studio、部署
LangGraph ..state / runs....> LangSmith
```

### 2.1 一句话理解

- **LangChain**：构建 LLM 应用和 Agent 的高层组件与标准接口。
- **LangGraph**：编排长运行、有状态、可分支、可循环、可暂停恢复的工作流。
- **LangSmith**：观察、测试、评估、调试和部署 LLM/Agent 应用的平台，框架无关。

### 2.2 什么时候用哪个

| 需求 | 建议 |
| --- | --- |
| 单次生成、分类、抽取 | 直接用 LangChain 模型接口 + 结构化输出 |
| 模型需要自主选择工具 | `create_agent` |
| 固定流程、明确步骤 | 普通代码、LCEL 或 LangGraph |
| 流程包含分支、循环、并行、暂停恢复 | LangGraph |
| 复杂长任务需要文件、规划、skills、子 Agent | Deep Agents |
| 调试 Prompt、工具调用和延迟 | LangSmith Tracing |
| 比较模型/Prompt/代码版本 | LangSmith Dataset + Evaluation |
| 托管运行、线程、任务队列、定时任务 | LangSmith Deployment / Agent Server |

### 2.3 一个重要原则

**不要因为任务里有 LLM 就使用 Agent。** 能用确定性流程解决时，优先使用明确的函数、检索和结构化输出；只有当下一步必须由模型根据上下文动态决定时，才让 Agent 接管决策。

---

## 3. 环境、依赖与项目结构 ★★★

> 🧩 **学习优先级：补充掌握**

### 3.1 Python 与虚拟环境

LangChain 当前要求 Python 3.10+。推荐 Python 3.11 或 3.12，并为每个项目使用独立环境。

```bash
python -m venv .venv

# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS / Linux
source .venv/bin/activate
```

### 3.2 安装

```bash
python -m pip install --upgrade pip
pip install -U langchain langgraph langsmith python-dotenv pydantic

# 按模型供应商选择，不必全部安装
pip install -U langchain-openai
pip install -U langchain-anthropic
pip install -U langchain-google-genai

# RAG 常用组件，按项目选择
pip install -U langchain-text-splitters langchain-community

# MCP
pip install -U langchain-mcp-adapters fastmcp
```

生产项目应设置兼容范围并生成锁文件，例如：

```bash
uv add "langchain>=1.3,<1.4" "langgraph>=1.2,<1.3" "langsmith>=0.11,<0.12"
uv lock
```

### 3.3 环境变量

```dotenv
# 选择一个真实可用的 provider:model
MODEL_ID=openai:gpt-5.4-mini
OPENAI_API_KEY=...

# LangSmith
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=...
LANGSMITH_PROJECT=lc-lg-ls-study

# 非美国区域按账号设置，例如：
# LANGSMITH_ENDPOINT=https://apac.api.smith.langchain.com
```

安全要求：

- `.env` 必须加入 `.gitignore`。
- 不要在源代码、Prompt、trace metadata 或工具返回值中写入密钥。
- 生产环境使用密钥管理服务，并定期轮换。
- 开启 tracing 前先设计输入/输出脱敏策略。

### 3.4 推荐目录

```text
agent_app/
├── pyproject.toml
├── uv.lock
├── .env.example
├── src/
│   └── agent_app/
│       ├── config.py
│       ├── models.py
│       ├── prompts.py
│       ├── tools.py
│       ├── retrieval.py
│       ├── agent.py
│       ├── graph.py
│       └── schemas.py
├── tests/
│   ├── unit/
│   ├── integration/
│   └── evals/
└── langgraph.json
```

把模型、工具、状态、Prompt 和图拆开，能显著降低后续测试与迁移成本。

---

## 4. LangChain 核心基础 ★★★★★

> 🔥 **学习优先级：重点掌握**

### 4.1 Model：统一模型接口

推荐用 `init_chat_model` 创建模型；也可以直接实例化 provider 包中的类。

```python
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model

load_dotenv()

model = init_chat_model(
    os.environ["MODEL_ID"],
    temperature=0,
    timeout=30,
    max_retries=2,
)

response = model.invoke("用三句话解释 RAG。")
print(response.content)
```

统一调用模式：

| 方法 | 用途 |
| --- | --- |
| `invoke(input)` | 单次同步调用 |
| `ainvoke(input)` | 单次异步调用 |
| `stream(input)` | 同步流式输出 |
| `astream(input)` | 异步流式输出 |
| `batch(inputs)` | 批处理 |
| `abatch(inputs)` | 异步批处理 |

模型选择不能只看榜单。至少评估正确率、工具调用能力、结构化输出、上下文长度、首 token 延迟、吞吐、费用、地区合规和故障率。

### 4.2 Message：模型上下文的基本单位

```python
from langchain.messages import SystemMessage, HumanMessage

messages = [
    SystemMessage("你是严谨的 Python 教师。答案必须给出依据。"),
    HumanMessage("TypedDict 与 Pydantic 状态各有什么取舍？"),
]

reply = model.invoke(messages)
print(reply.content)
```

常见消息类型：

- `SystemMessage`：行为约束与角色。
- `HumanMessage`：用户输入。
- `AIMessage`：模型输出，可能包含 `tool_calls` 和 token usage。
- `ToolMessage`：工具执行结果，必须与对应的 `tool_call_id` 匹配。

现代模型的 `content` 可能不是简单字符串。优先使用 `content_blocks` 统一读取文本、推理、引用、工具调用和多模态内容：

```python
for block in reply.content_blocks:
    if block["type"] == "text":
        print(block["text"])
    elif block["type"] == "tool_call":
        print(block["name"], block["args"])
```

注意：标准内容块的 provider 覆盖仍在扩展，遇到缺失字段时保留对原始 provider metadata 的兼容处理。

### 4.3 Prompt Template

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是{role}。只根据提供的上下文回答；不知道就明确说不知道。"),
    ("human", "上下文：\n{context}\n\n问题：{question}"),
])

messages = prompt.invoke({
    "role": "技术文档助手",
    "context": "LangGraph 使用 checkpoint 保存线程状态。",
    "question": "LangGraph 如何支持恢复？",
})
```

Prompt 的工程要求：

- 系统规则、业务数据和用户输入分层，不要字符串随意拼接。
- 明确输出格式、允许的信息源、拒答条件与工具边界。
- 把长知识放在检索层，不要把整个知识库塞进系统提示词。
- Prompt 变更必须经过版本管理、回归数据集和 A/B 对比。
- Prompt injection 是不可信输入问题，单靠“忽略恶意指令”无法解决。

### 4.4 LCEL 与 Runnable

LCEL 使用 `|` 组合实现 `Runnable` 协议的组件，适合短而确定的流水线。

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_template("用不超过 80 字解释：{topic}")
chain = prompt | model | StrOutputParser()

print(chain.invoke({"topic": "LangGraph reducer"}))
```

可继续使用 `.batch()`、`.stream()`、`.ainvoke()`。当流程出现持久状态、复杂分支、循环、人工审批或故障恢复时，改用 LangGraph 更清晰。

### 4.5 结构化输出

下游程序需要字段时，不要解析自然语言文本。使用 Pydantic、dataclass、TypedDict 或 JSON Schema。

```python
from typing import Literal
from pydantic import BaseModel, Field

class Ticket(BaseModel):
    category: Literal["billing", "technical", "account", "product"]
    priority: Literal["low", "medium", "high", "critical"]
    summary: str
    confidence: float = Field(ge=0, le=1)

structured_model = model.with_structured_output(Ticket)
ticket = structured_model.invoke("支付成功但会员没有生效，已经等待两小时。")
print(ticket.model_dump())
```

Agent 使用 `response_format=`：

```python
from langchain.agents import create_agent

agent = create_agent(
    model=model,
    tools=[],
    response_format=Ticket,
)

result = agent.invoke({
    "messages": [{"role": "user", "content": "账号无法登录，非常紧急。"}]
})
print(result["structured_response"])
```

策略：

- `ProviderStrategy`：使用模型供应商原生 structured output，通常约束更强。
- `ToolStrategy`：通过工具调用生成结构化数据，兼容面更广。
- 直接传 schema 类型：LangChain 根据模型能力自动选择。

结构化输出只保证“形状”，不保证“事实正确”。仍要做业务校验、范围校验和评测。

### 4.6 Tools：把能力交给模型

```python
from decimal import Decimal
from typing import Literal
from langchain.tools import tool

@tool
def calculate(
    left: str,
    operator: Literal["add", "subtract", "multiply", "divide"],
    right: str,
) -> str:
    """执行基础十进制运算。参数必须是十进制数字字符串。"""
    a, b = Decimal(left), Decimal(right)
    operations = {
        "add": lambda: a + b,
        "subtract": lambda: a - b,
        "multiply": lambda: a * b,
        "divide": lambda: a / b,
    }
    if operator == "divide" and b == 0:
        return "错误：除数不能为零"
    return str(operations[operator]())
```

工具设计准则：

1. 名称使用 `snake_case`，跨 provider 兼容性更好。
2. docstring 说明“什么时候使用”和“不应该什么时候使用”。
3. 类型注解和字段描述要足够具体，参数越少越稳。
4. 返回结构化、短小、可判定的结果；大结果写入外部存储并返回引用。
5. 工具内部必须有 timeout、重试、幂等键、权限检查和审计。
6. 读工具与写工具分开；删除、付款、发信等副作用操作必须审批。
7. 禁止对模型生成的字符串直接 `eval`、`exec` 或拼接 SQL/Shell。

工具可以返回字符串、对象、多模态内容或 `Command`。通过 `ToolRuntime`，工具还能安全访问当前 state、runtime context、store、stream writer 和执行信息。

```python
from dataclasses import dataclass
from langchain.tools import ToolRuntime, tool

@dataclass
class RequestContext:
    user_id: str

@tool
def current_user(runtime: ToolRuntime[RequestContext]) -> str:
    """返回当前已认证用户的 ID。"""
    return runtime.context.user_id
```

`runtime` 不会暴露在模型可见的工具参数 schema 中，适合传用户身份、数据库连接或内部配置。

---

## 5. Agent 与上下文工程 ★★★★★

> 🔥 **学习优先级：重点掌握**

### 5.1 Agent 的本质

Agent 是一个循环：

```text
用户输入 -> 模型决策 -> [调用工具 -> 观察结果 -> 再次决策]* -> 最终回答
```

官方当前的简洁表达是：

```text
Agent = Model + Harness
```

Harness 包含 Prompt、工具、状态、记忆、中间件、安全边界、停止条件和运行时。

### 5.2 `create_agent`

```python
from langchain.agents import create_agent

agent = create_agent(
    model=model,
    tools=[calculate],
    system_prompt=(
        "你是中文助理。需要精确计算时必须调用 calculate；"
        "不得猜测工具结果。"
    ),
)

result = agent.invoke({
    "messages": [{"role": "user", "content": "计算 125.5 乘以 8。"}]
})
print(result["messages"][-1].content)
```

关键参数：

| 参数 | 含义 |
| --- | --- |
| `model` | `provider:model` 字符串或模型实例 |
| `tools` | Python callable、LangChain Tool 或工具字典 |
| `system_prompt` | 静态系统提示词；动态提示使用中间件 |
| `middleware` | Agent 生命周期扩展 |
| `response_format` | 最终结构化输出 schema/策略 |
| `state_schema` | 扩展 AgentState |
| `context_schema` | 运行时依赖和用户上下文类型 |
| `checkpointer` | thread 级短期记忆与恢复 |
| `store` | 跨 thread 长期记忆 |

### 5.3 Context Engineering

上下文工程不是“把更多内容放进 Prompt”，而是**在正确时机给模型正确的信息与能力**。

可分为三层：

| 层 | 典型内容 | 生命周期 |
| --- | --- | --- |
| Model Context | system prompt、messages、可用 tools、模型、response schema | 每次模型调用，可临时变化 |
| Tool Context | state、store、用户身份、API/DB 依赖、执行信息 | 每次工具调用 |
| Lifecycle Context | 摘要、审计、重试、审批、限额、状态变更 | 整个 Agent 生命周期 |

实践要点：

- 只给当前步骤所需的工具，减少误选和 token 消耗。
- 长会话采用 trim、summary 或 context offloading，而不是无限追加。
- 用户身份与权限放在 runtime context，不让模型自行声明。
- 模型路由应依据任务难度、成本和合规策略，而不是让用户直接指定任意模型。
- 检索结果应包含来源、时间、权限和相关性信息。

### 5.4 Middleware

自定义中间件可在以下钩子接入：

| Hook | 时机 | 常见用途 |
| --- | --- | --- |
| `before_agent` | Agent 开始前 | 校验输入、加载记忆 |
| `before_model` | 每次模型调用前 | 动态 Prompt、裁剪消息 |
| `wrap_model_call` | 包裹模型调用 | 模型路由、重试、缓存、审计 |
| `wrap_tool_call` | 包裹工具调用 | 权限、重试、参数清洗、日志 |
| `after_model` | 模型返回后 | 输出校验、guardrail |
| `after_agent` | Agent 完成后 | 保存结果、清理资源 |

当前官方内置中间件覆盖：

- Tool error / Tool retry
- Model retry / Model fallback
- Summarization
- Human-in-the-loop
- Model call limit / Tool call limit
- PII detection
- To-do list
- LLM tool selector / Provider tool search
- Shell tool / Filesystem middleware / File search
- Subagent
- Rubric grading
- Context editing
- LLM tool emulator

示例：摘要 + PII 防护 + 敏感工具审批。

```python
from langchain.agents import create_agent
from langchain.agents.middleware import (
    HumanInTheLoopMiddleware,
    PIIMiddleware,
    SummarizationMiddleware,
)
from langgraph.checkpoint.memory import InMemorySaver

safe_agent = create_agent(
    model=model,
    tools=[calculate],
    checkpointer=InMemorySaver(),
    middleware=[
        PIIMiddleware("email", strategy="redact", apply_to_input=True),
        SummarizationMiddleware(
            model=model,
            trigger={"tokens": 4000},
            keep=("messages", 20),
        ),
        HumanInTheLoopMiddleware(
            interrupt_on={
                # 实际项目替换成 send_email、payment 等写操作
                "calculate": {
                    "allowed_decisions": ["approve", "edit", "reject"]
                }
            }
        ),
    ],
)
```

`HumanInTheLoopMiddleware` 暂停后，恢复 payload 与直接调用 `interrupt()` 的简单布尔值不同。它要求按待审核 action 的顺序提交 decisions：

```python
from langgraph.types import Command

# 先用相同 thread_id 调用 safe_agent，并让受控工具触发 interrupt。
# 审核界面取得待审批 actions 后，再提交下面的 decisions 恢复执行。
safe_agent.invoke(
    Command(resume={"decisions": [{"type": "approve"}]}),
    config={"configurable": {"thread_id": "review-001"}},
    version="v2",
)
```

可用决定包括 `approve`、`edit`、`reject` 和 `respond`，实际可用集合由每个工具的 `allowed_decisions` 限制。拒绝有副作用的工具应使用 `reject`；`respond` 表示人工代替工具提供成功结果，不能当作拒绝使用。

中间件的顺序会影响行为。先画出数据流，再决定脱敏、重试、审批、缓存和记录的先后关系。

### 5.5 停止条件与循环保护

- 使用模型/工具调用次数中间件限制调用量。
- LangGraph 的 `recursion_limit` 放在 config 顶层：

```python
config = {
    "recursion_limit": 50,
    "configurable": {"thread_id": "conversation-001"},
}
result = agent.invoke(inputs, config=config)
```

- 图内可使用 `RemainingSteps` 在触发硬错误前优雅结束。
- 对重复工具调用、空结果循环、同参数重试建立检测器。
- timeout、token budget、费用 budget 与业务 SLA 都应是独立限制。

---

## 6. 记忆系统 ★★★★★

> 🔥 **学习优先级：重点掌握**

### 6.1 短期记忆与长期记忆

| 类型 | LangGraph 实现 | 作用域 | 适合存储 |
| --- | --- | --- | --- |
| 短期记忆 | Checkpointer | 单个 `thread_id` | 消息、步骤状态、interrupt、恢复点 |
| 长期记忆 | Store | 跨 thread | 用户偏好、事实、画像、共享知识 |

不要把“模型上下文”“checkpoint 历史”“长期用户记忆”和“业务数据库”混为一体。

### 6.2 短期记忆

```python
from langchain.agents import create_agent
from langgraph.checkpoint.memory import InMemorySaver

agent = create_agent(
    model=model,
    tools=[],
    checkpointer=InMemorySaver(),
)

config = {"configurable": {"thread_id": "user-42-session-1"}}

agent.invoke(
    {"messages": [{"role": "user", "content": "我喜欢简洁答案。"}]},
    config=config,
)
result = agent.invoke(
    {"messages": [{"role": "user", "content": "我的偏好是什么？"}]},
    config=config,
)
```

`InMemorySaver` 只用于开发和测试，进程重启后会丢失数据。生产环境使用 PostgreSQL 等持久化 checkpointer。

> **注意：** Checkpoint 是 thread 内的执行状态，不是跨会话的用户数据库。生产系统不要把 `InMemorySaver` 当持久化方案，也不要把所有用户资料无限写入消息历史。

长会话处理方法：

1. trim：仅传最近 N 条或最近 N tokens。
2. delete：明确删除不再需要的消息。
3. summarize：把早期历史压缩成摘要并写回 state。
4. offload：大工具结果放文件/对象存储，只在上下文中保留索引。

### 6.3 长期记忆

LangGraph Store 用 `(namespace, key, value)` 保存 JSON 文档。namespace 常包含租户和用户 ID。

```python
from dataclasses import dataclass
from langchain.agents import create_agent
from langchain.tools import ToolRuntime, tool
from langgraph.store.memory import InMemoryStore

@dataclass
class UserContext:
    user_id: str

@tool
def save_preference(
    key: str,
    value: str,
    runtime: ToolRuntime[UserContext],
) -> str:
    """保存当前用户明确要求记住的偏好。"""
    namespace = ("users", runtime.context.user_id, "preferences")
    runtime.store.put(namespace, key, {"value": value})
    return "偏好已保存"

store = InMemoryStore()
agent = create_agent(
    model=model,
    tools=[save_preference],
    context_schema=UserContext,
    store=store,
)
```

长期记忆的三种常见类型：

- **Semantic memory**：用户事实和偏好。
- **Episodic memory**：过去任务及其结果。
- **Procedural memory**：成功策略、规则、skills 或 Prompt。

记忆必须有写入条件、来源、时间戳、置信度、过期规则、可删除机制和租户隔离。不要让模型把每句话都永久记住。

---

## 7. RAG 检索增强生成 ★★★★★

> 🔥 **学习优先级：重点掌握**

### 7.1 为什么需要 RAG

模型有两个根本限制：上下文有限、训练知识存在截止时间。RAG 在运行时取回相关外部知识，使回答有更好的时效性、可追溯性和私域覆盖。

```text
索引：数据源 -> Loader -> Document -> 切分与元数据 -> Embedding -> 向量 / 搜索索引
查询：用户问题 -> 查询改写/过滤 -> 向量 / 搜索索引 -> 召回 -> 重排/压缩 -> LLM 生成 -> 答案 + 引用
```

### 7.2 RAG 的组成

1. Loader：从 PDF、HTML、数据库、SaaS 或对象存储读取。
2. Document：标准化正文与 metadata。
3. Splitter：按语义/结构/长度切块。
4. Embedding：把文本映射为向量。
5. Index：向量库、全文索引或混合检索系统。
6. Retriever：封装查询、过滤、top-k。
7. Reranker：对候选片段二次排序。
8. Generator：依据检索内容生成并引用来源。

如果已有 SQL、CRM、搜索引擎或文档 API，不要为了使用 LangChain 强行重建向量库。可以把现有查询封装为工具或 Retriever。

### 7.3 三种 RAG 架构

| 架构 | 流程 | 优点 | 局限 |
| --- | --- | --- | --- |
| 2-Step RAG | 检索一次 -> 生成一次 | 快、便宜、可预测 | 不擅长复杂多跳问题 |
| Agentic RAG | Agent 决定是否/如何检索 | 灵活、可多源查询 | 延迟和成本更高，需防循环 |
| Hybrid RAG | 确定性检索骨架 + Agent 决策 | 平衡控制与灵活性 | 设计和评测更复杂 |

### 7.4 最小语义检索示例

```python
from langchain_core.documents import Document
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

docs = [
    Document(
        page_content="LangGraph 的 checkpointer 保存 thread 内的图状态。",
        metadata={"source": "internal-guide", "version": "2026-08"},
    ),
    Document(
        page_content="LangSmith 可记录 trace，并对数据集运行离线评测。",
        metadata={"source": "internal-guide", "version": "2026-08"},
    ),
]

splitter = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=50)
chunks = splitter.split_documents(docs)

vector_store = InMemoryVectorStore(
    embedding=OpenAIEmbeddings(model="text-embedding-3-small")
)
vector_store.add_documents(chunks)

hits = vector_store.similarity_search("如何保存会话状态？", k=3)
for hit in hits:
    print(hit.page_content, hit.metadata)
```

`InMemoryVectorStore` 仅适合教学。生产环境根据数据规模、过滤需求、延迟、备份、权限和运维能力选择实际索引。

### 7.5 Agentic RAG 工具

```python
from langchain.tools import tool

@tool
def retrieve_docs(query: str) -> str:
    """检索内部技术文档。回答内部框架、配置和流程问题时使用。"""
    hits = vector_store.similarity_search(query, k=4)
    return "\n\n".join(
        f"来源={doc.metadata.get('source')}\n{doc.page_content}"
        for doc in hits
    )
```

把它传给 `create_agent` 后，模型可决定何时检索。更严格的系统应要求“涉及内部事实必须检索”，并对没有证据的回答拒答。

### 7.6 提升 RAG 质量

- **切分**：按标题、段落、代码块和表格边界切，不只按字符数。
- **元数据**：保留来源、页码、版本、更新时间、ACL、语言和文档类型。
- **混合检索**：dense + BM25/全文检索，兼顾语义和精确关键词。
- **查询改写**：处理缩写、多轮指代、拼写和多跳问题。
- **过滤**：先做租户/权限/时间过滤，再做相似度检索。
- **重排**：cross-encoder 或 LLM reranker 只处理小候选集。
- **Contextual compression**：仅提取与问题相关的片段。
- **引用**：答案句子应能映射到文档 ID/页码，不能只在末尾堆链接。
- **拒答**：证据不足、冲突或过期时明确返回不确定。
- **增量索引**：使用文档 hash、版本和删除标记，避免重复向量。

### 7.7 RAG 评测

至少分开评测：

| 层 | 指标示例 |
| --- | --- |
| Retrieval | Recall@k、MRR、nDCG、命中率、ACL 泄漏率 |
| Generation | correctness、faithfulness、引用准确率、完整性 |
| End-to-end | 任务成功率、延迟、token、费用、拒答质量 |

只评最终回答会掩盖“检索错但模型碰巧答对”和“检索对但生成错”这两类不同问题。

---

## 8. LangChain 扩展边界：多智能体与 MCP ★★★

> 🧩 **学习优先级：补充掌握**

### 8.1 多智能体模式

| 模式 | 机制 | 适合场景 |
| --- | --- | --- |
| Subagents | 主 Agent 把子 Agent 当工具调用 | 集中协调、隔离上下文 |
| Handoffs | 状态变化触发角色/工具/Prompt 切换 | 客服转接、阶段式对话 |
| Skills | 单 Agent 按需加载专业知识和指令 | 大量领域能力、节省上下文 |
| Router | 分类后路由到一个或多个专家 | 多领域问答、并行处理 |
| Custom workflow | LangGraph 自定义混合流程 | 复杂确定性 + Agentic 编排 |

选择多 Agent 前先问：单 Agent + 更好的工具描述、context engineering 或结构化路由能否解决？每增加一个 Agent 都会增加模型调用、上下文复制、延迟和故障面。

### 8.2 MCP

Model Context Protocol 标准化应用向模型提供 tools、resources 和 prompts 的方式。LangChain 通过 `langchain-mcp-adapters` 接入。

```python
import asyncio
import os
from langchain.agents import create_agent
from langchain_mcp_adapters.client import MultiServerMCPClient

async def main() -> None:
    client = MultiServerMCPClient({
        "docs": {
            "transport": "http",
            "url": "https://docs.langchain.com/mcp",
        },
        "local_math": {
            "transport": "stdio",
            "command": "python",
            "args": ["/absolute/path/to/math_server.py"],
        },
    })

    tools = await client.get_tools()
    agent = create_agent(model=os.environ["MODEL_ID"], tools=tools)
    result = await agent.ainvoke({
        "messages": [{"role": "user", "content": "解释 LangGraph 的 Command。"}]
    })
    print(result["messages"][-1].content)

asyncio.run(main())
```

要点：

- `MultiServerMCPClient` 默认无状态，每次工具调用建立并清理 session。
- 需要服务端会话上下文时，显式使用 `client.session()` 管理持久 session。
- HTTP 适合远程服务；stdio 适合本地子进程。
- 老的 SSE transport 已被 MCP 规范弃用，新项目使用 streamable HTTP。
- MCP 还支持 resources、prompts、structured/multimodal content、progress、logging、elicitation 和拦截器。
- 对远程 MCP server 实施 allowlist、OAuth/短期令牌、schema 校验、超时和最小权限。
- MCP server 返回的描述和内容仍是不可信输入，不能绕过审批策略。

### 8.3 Deep Agents

Deep Agents 是 LangChain Agent 之上的更高层 harness，预装文件系统、上下文卸载、memory、skills、规划、子 Agent 和人工介入。只需定制模型、工具和中间件时用 `create_agent`；需要完全控制状态机时用 LangGraph；只有确实需要上述长任务能力时再引入 Deep Agents。

### 8.4 A2A 与外部互操作

MCP 主要解决“Agent 如何接工具与上下文”；A2A 主要解决“Agent/服务如何互相通信”。LangSmith Agent Server 提供相关接口。对本学习主线而言，掌握这一边界即可；跨服务落地时再深入认证、幂等、超时和 trace propagation。

---

## 9. LangGraph 核心原理与 Graph API ★★★★★

> 🔥 **学习优先级：重点掌握**

### 9.1 心智模型

LangGraph 采用受 Pregel 启发的消息传递模型，以离散 **super-step** 推进：同一 super-step 内满足条件的节点可并行执行，节点结果通过 reducer 合并进状态，再进入下一步。

核心元素：

- **State**：图执行期间共享的数据。
- **Node**：读取 state/context 并返回局部更新的函数。
- **Edge**：决定控制流。
- **Reducer**：定义并发或连续更新如何合并。
- **Checkpointer**：在步骤边界保存 thread 状态。
- **Store**：保存跨 thread 的长期数据。

### 9.2 State 与 Reducer

```python
import operator
from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages
from langchain.messages import AnyMessage

class AppState(TypedDict):
    question: str
    answer: str                    # 默认：新值覆盖旧值
    logs: Annotated[list[str], operator.add]
    messages: Annotated[list[AnyMessage], add_messages]
```

Reducer 要点：

- 没有 reducer 的字段默认覆盖。
- `operator.add` 适合数值累加和简单列表拼接。
- 消息使用 `add_messages`，它能依据 message ID 更新已有消息并完成序列化处理。
- 并行节点同时写同一字段时必须有确定的 reducer，否则可能抛并发更新错误或产生不可解释结果。
- reducer 应满足结合性，最好也满足交换性，避免并行顺序影响结果。

State schema 可用 `TypedDict`、dataclass 或 Pydantic。`TypedDict` 轻量；Pydantic 提供运行时校验但有额外开销。还可以设置独立的 input/output/private schema 限制图边界。

### 9.3 最小 Graph API 示例

```python
import operator
from typing import Annotated, Literal
from typing_extensions import TypedDict
from langgraph.graph import END, START, StateGraph

class State(TypedDict):
    value: int
    route: str
    logs: Annotated[list[str], operator.add]

def increment(state: State) -> dict:
    value = state["value"] + 1
    return {"value": value, "logs": [f"increment -> {value}"]}

def classify(state: State) -> dict:
    route = "even" if state["value"] % 2 == 0 else "odd"
    return {"route": route, "logs": [f"route -> {route}"]}

def report_even(state: State) -> dict:
    return {"logs": ["结果是偶数"]}

def report_odd(state: State) -> dict:
    return {"logs": ["结果是奇数"]}

def route(state: State) -> Literal["even", "odd"]:
    return state["route"]

builder = StateGraph(State)
builder.add_node("increment", increment)
builder.add_node("classify", classify)
builder.add_node("even", report_even)
builder.add_node("odd", report_odd)

builder.add_edge(START, "increment")
builder.add_edge("increment", "classify")
builder.add_conditional_edges(
    "classify",
    route,
    {"even": "even", "odd": "odd"},
)
builder.add_edge("even", END)
builder.add_edge("odd", END)

graph = builder.compile()
result = graph.invoke({"value": 4, "route": "", "logs": []})
print(result)
```

节点只返回变化字段，不需要返回完整 state。`compile()` 会进行结构校验，并注入 checkpointer、store、interrupt 和 cache 等运行能力。

### 9.4 路由方式

#### 普通边

```python
builder.add_edge("a", "b")
```

#### 条件边

```python
builder.add_conditional_edges("router", choose_next, {
    "search": "search_node",
    "answer": "answer_node",
})
```

#### `Command`

当节点要同时更新状态和跳转时使用 `Command`：

```python
from typing import Literal
from langgraph.types import Command

def decide(state: State) -> Command[Literal["even", "odd"]]:
    target = "even" if state["value"] % 2 == 0 else "odd"
    return Command(
        update={"route": target, "logs": [f"goto {target}"]},
        goto=target,
    )
```

不要从同一节点同时定义静态 edge 和 `Command(goto=...)`，否则两个路径都可能执行。仅路由用条件边；更新 + 路由用 `Command`。

子图可使用 `Command(graph=Command.PARENT, goto=...)` 跳回父图。共享字段需要合适 reducer。

#### `Send`

动态 map-reduce 使用 `Send` 为未知数量的任务创建并行分支：

```python
from langgraph.types import Send

def fan_out(state):
    return [Send("process_item", {"item": item}) for item in state["items"]]
```

### 9.5 Node 的工程要求

- 节点尽量小、单一职责、可独立测试。
- 持久化图可能重放节点，因此节点应确定且幂等。
- 外部副作用使用幂等键或拆到 `task` 中。
- 不要在 state 中放数据库连接、客户端、文件句柄等不可序列化对象；放进 runtime context。
- 对昂贵且确定的节点可设置 `CachePolicy(ttl=...)`。
- 节点可接收 `Runtime[Context]`，读取 context、store、execution info 和 stream writer。

### 9.6 Graph API 与 Functional API

| 维度 | Graph API | Functional API |
| --- | --- | --- |
| 表达方式 | 显式 state、node、edge | `@entrypoint` + `@task`，接近普通 Python |
| 可视化 | 最清晰 | 控制流隐含在代码中 |
| 复杂分支/并行 | 强 | 适合已有代码渐进改造 |
| 状态 schema | 显式 | 较少样板代码 |
| 推荐场景 | 新建复杂工作流 | 给现有函数增加持久化与恢复 |

Functional API 的 `task` 结果会记录，重放时可复用。必须认真处理 determinism、side effect 和 idempotency；非确定性行为应放在 task 内，而不是让控制流在重放时漂移。

### 9.7 Functional API 最小示例

`@entrypoint` 定义工作流入口，`@task` 把外部调用或昂贵步骤变成可记录、可重放的任务。入口函数只接收一个位置参数；多字段输入用字典或 dataclass 封装。

```python
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.func import entrypoint, task

@task
def normalize(text: str) -> str:
    """模拟一个可独立记录和重试的处理步骤。"""
    return " ".join(text.strip().split())

@entrypoint(checkpointer=InMemorySaver())
def clean_text_workflow(payload: dict) -> dict:
    cleaned = normalize(payload["text"]).result()
    return {"cleaned": cleaned}

config = {"configurable": {"thread_id": "clean-text-001"}}
result = clean_text_workflow.invoke(
    {"text": "  LangGraph   Functional API  "},
    config=config,
)
print(result)
```

恢复时 entrypoint 会从函数开头重新执行，但已经成功持久化的 task 结果会从 checkpoint 读取，不会重复计算。输入、输出和 task 结果必须可序列化。

### 9.8 常见工作流模式

- 顺序流水线：extract -> transform -> validate -> persist。
- Routing：分类后选择一个路径。
- Parallelization：多个独立节点并发，reducer 合并。
- Orchestrator-worker：动态拆分任务并通过 `Send` 分发。
- Evaluator-optimizer：生成 -> 评价 -> 未通过则循环改进。
- Agent loop：模型 -> tools -> 模型，直到没有工具调用。
- Supervisor：中心节点调度专业 Agent。

所有循环都必须有语义退出条件、最大步数和失败出口。

---

## 10. LangGraph 持久化、人工介入与流式输出 ★★★★★

> 🔥 **学习优先级：重点掌握**

### 10.1 Checkpointer 与 Store

```python
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.store.memory import InMemoryStore

graph = builder.compile(
    checkpointer=InMemorySaver(),
    store=InMemoryStore(),
)

config = {"configurable": {"thread_id": "thread-001"}}
result = graph.invoke(initial_state, config=config)
```

生产选项：

- `langgraph-checkpoint-sqlite`：本地实验和单机工作流。
- `langgraph-checkpoint-postgres`：生产级，支持同步/异步 saver。
- Azure Cosmos DB 集成：Azure 环境。
- 自定义实现 `BaseCheckpointSaver`：已有存储系统。

安全与运维：

- `InMemorySaver` 不跨进程重启。
- PostgreSQL `thread_id` 建议不超过 255 字符，使用 UUID/hash。
- checkpoint 会增长，必须配置保留/清理策略。
- 可使用 `EncryptedSerializer` 对持久状态进行 AES 加密。
- Agent Server 会管理 checkpointer/store，部署代码中不要重复配置。

### 10.2 Durable Execution

Durable execution 的核心不是“永不失败”，而是失败后从 checkpoint 继续，而不是从头重做。

为保证正确恢复：

1. 节点/任务必须可重放。
2. 外部写操作必须幂等，例如使用 `thread_id + step_id` 作为业务幂等键。
3. 随机数、当前时间、网络响应等非确定性值应在 task 内记录结果。
4. 副作用尽量放在 interrupt 之后；必须放在之前时确保重复执行安全。
5. 区分 transient error、permanent error 和 human-decision-required。

### 10.3 节点级容错：Retry、Timeout 与 Error Handler

LangGraph 1.2 可在节点上分别配置重试、超时和最终错误处理。执行顺序是：**节点尝试 -> 匹配重试策略 -> 重试耗尽后进入 error handler**。

```python
from langgraph.types import RetryPolicy, TimeoutPolicy

builder.add_node(
    "call_remote_api",
    call_remote_api,  # async def 节点
    retry_policy=RetryPolicy(max_attempts=3),
    timeout=TimeoutPolicy(run_timeout=30, idle_timeout=10),
)
```

要点：

- `max_attempts` 包含第一次执行；它不同于 LangChain 中间件的 `max_retries`。
- 默认 `retry_on` 会避开多数非瞬时错误，并重试常见 HTTP 5xx 与 `NodeTimeoutError`；业务异常需要自定义过滤函数。
- 节点 timeout 当前只适用于异步节点；同步阻塞 I/O 应通过 `asyncio.to_thread` 包装。
- 超时会清除本次尝试的缓冲写入，再由 retry policy 决定是否重试。
- `error_handler` 在重试耗尽后执行，可返回 state 更新或 `Command` 进入补偿路径。
- 多个节点采用相同策略时，用 `builder.set_node_defaults(...)` 统一配置；子图需要单独设置。
- 业务副作用仍必须幂等，框架重试不能替代业务幂等键。

### 10.4 Human-in-the-loop 与 `interrupt`

```python
from typing_extensions import TypedDict
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command, interrupt

class ApprovalState(TypedDict):
    action: str
    approved: bool

def review(state: ApprovalState) -> dict:
    decision = interrupt({
        "question": "是否批准该操作？",
        "action": state["action"],
    })
    return {"approved": bool(decision)}

builder = StateGraph(ApprovalState)
builder.add_node("review", review)
builder.add_edge(START, "review")
builder.add_edge("review", END)
approval_graph = builder.compile(checkpointer=InMemorySaver())

config = {"configurable": {"thread_id": "approval-001"}}
approval_graph.invoke(
    {"action": "向客户发送退款确认邮件", "approved": False},
    config=config,
)

# 人工决定后恢复；resume 值成为 interrupt() 的返回值
final = approval_graph.invoke(Command(resume=True), config=config)
```

Interrupt 规则：

- 不要用 `try/except` 包围 `interrupt()`。
- 不要改变同一节点内多个 interrupt 的顺序。
- interrupt payload 使用可序列化的简单值。
- interrupt 前的副作用必须幂等。
- 恢复使用 `Command(resume=...)`；正常完成后的下一轮会话传普通 state 输入，不要传单独 `Command(update=...)`。

### 10.5 低层 Streaming v2

LangGraph `stream`/`astream` 的模式：

| 模式 | 内容 |
| --- | --- |
| `values` | 每步后的完整 state |
| `updates` | 节点产生的局部 state 更新 |
| `messages` | LLM token/chunk + metadata |
| `custom` | 节点通过 stream writer 发出的自定义数据 |
| `checkpoints` | checkpoint 事件，需要 checkpointer |
| `tasks` | task 开始/结束、结果与错误，需要 checkpointer |
| `debug` | 最完整的调试事件 |

LangGraph 1.1+ 的新代码传 `version="v2"` 获取统一 `StreamPart`：

```python
for part in graph.stream(
    initial_state,
    stream_mode=["updates", "custom"],
    version="v2",
):
    if part["type"] == "updates":
        print("state update:", part["data"])
    elif part["type"] == "custom":
        print("custom event:", part["data"])
```

### 10.6 Event Streaming v3

面向应用和前端的当前推荐是 `stream_events(..., version="v3")`。该接口从 LangGraph 1.2 开始提供，LangChain Agent 从 1.3 开始支持。它在一条底层事件流之上提供互不抢占的类型化投影：

- `stream.messages`：文本、reasoning、tool-call 增量。
- `stream.values`：状态投影。
- `stream.subgraphs`：子图。
- `stream.output`：最终输出。
- LangChain Agent 还有 `stream.tool_calls`、命名子 Agent 的 `stream.subagents`。
- `stream.extensions`：自定义 transformer 投影。

```python
stream = agent.stream_events(
    {"messages": [{"role": "user", "content": "解释 durable execution"}]},
    version="v3",
)

for message in stream.messages:
    for text_delta in message.text:
        print(text_delta, end="", flush=True)

final_output = stream.output
```

选择原则：

- UI、聊天、工具状态展示：Event Streaming v3。
- 运行时诊断、checkpoint/task 细节：低层 stream mode v2。
- 自定义领域事件：stream transformer 或 `custom` channel。

### 10.7 子图、Time Travel 与缓存

- **Subgraph**：把领域流程编译后作为父图节点；注意 state schema 与 checkpoint namespace。
- **Time travel**：查看历史 checkpoint，从某个状态分叉重跑，用于调试和场景探索。
- **Node cache**：给确定、昂贵节点设置 TTL；缓存键不能忽略租户、权限或关键输入。
- **Graph migration**：持久化线程存在时修改 state schema 或图结构要做兼容计划和回归测试。
- **Visualization**：`graph.get_graph().draw_mermaid()` 可输出图结构。

---

## 11. LangSmith 可观测性与评测 ★★★★★

> 🔥 **学习优先级：重点掌握**

### 11.1 LangSmith 的数据模型

| 概念 | 含义 |
| --- | --- |
| Run | 单个工作单元，类似 OpenTelemetry span，如模型、工具、检索调用 |
| Trace | 一次业务操作产生的 run 树 |
| Thread | 多轮会话的一组 traces |
| Trajectory | 将 thread 展平为按顺序排列的消息/动作路径 |
| Project | traces 的逻辑集合，常按环境/服务划分 |
| Feedback | 人工、代码或模型对 run/trace/thread 的评分 |

一个 trace 当前最多接受 25,000 个 runs。复杂图应避免无意义的细粒度 span 和失控循环。

### 11.2 开启 LangChain/LangGraph tracing

```bash
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY="..."
export LANGSMITH_PROJECT="support-agent-dev"
```

Windows PowerShell：

```powershell
$env:LANGSMITH_TRACING = "true"
$env:LANGSMITH_API_KEY = "..."
$env:LANGSMITH_PROJECT = "support-agent-dev"
```

LangChain 和 LangGraph 组件通常会自动产生嵌套 trace。非 LangChain 代码使用 `@traceable`：

```python
from langsmith import traceable

@traceable(run_type="retriever", name="search_internal_docs")
def search_internal_docs(query: str) -> list[dict]:
    return [{"id": "doc-1", "score": 0.91}]
```

也可使用 provider wrapper 自动记录原生 SDK 调用，例如 `wrap_openai(OpenAI())`。

调用时通过 `RunnableConfig` 添加可检索的名称、标签和元数据。LangGraph 的 `configurable.thread_id` 用于状态持久化；同时在 metadata 中记录相同 ID，可明确关联 LangSmith 多轮 traces：

```python
thread_id = "support-thread-001"
config = {
    "configurable": {"thread_id": thread_id},
    "run_name": "support_turn",
    "tags": ["production", "support-agent"],
    "metadata": {
        "thread_id": thread_id,
        "release_version": "2026.08.19",
        "prompt_version": "support-answer:production",
        "tenant_id_hash": "tenant_8f31...",
    },
}

result = agent.invoke(inputs, config=config)
```

父 Runnable 的 tags 和 metadata 会被子 Runnable 继承。字段名应稳定，敏感标识先匿名化；不要把高基数字段随意做 tag，通常放 metadata 更合适。

### 11.3 Trace 应记录什么

- inputs/outputs：经脱敏后的必要数据。
- tags：版本、环境、功能、实验组。
- metadata：用户匿名 ID、租户、Prompt 版本、模型、部署版本。
- latency：整体、模型、工具、检索各阶段。
- token/cost：按模型、租户、功能聚合。
- errors/retries：错误类型、重试次数和最终结果。
- feedback：用户赞踩、人工标签、在线 evaluator 分数。

不应记录：密钥、密码、完整身份证/银行卡、未经授权的文档正文、MCP 凭证和其他敏感 payload。需要时启用输入/输出 masking，并验证流式输出也经过脱敏。

> **注意：** 开启 tracing 等于新增一条数据流。上线前必须确认字段分级、脱敏、区域 endpoint、访问控制和保留期；调试便利不能替代隐私与合规设计。

生产项目还应配置项目级 Alerts，对 run count、cost、errors、feedback score 和 latency 设置阈值。告警可以投递到 Slack、PagerDuty、Dynatrace 或 webhook；阈值先用历史预览校准，避免噪声过大。Trace 采样、在线 evaluator 采样和告警是三件事，应分别配置。

### 11.4 Evaluation 基本模型

LangSmith 评测由三部分组成：

1. **Dataset**：测试 inputs 和可选 reference outputs。
2. **Target function**：被测试的模型、链、Agent 或完整系统。
3. **Evaluator**：对输出、轨迹或中间步骤评分。

离线与在线评测：

| 类型 | 对象 | 用途 |
| --- | --- | --- |
| Offline | dataset examples | 回归、基准、版本比较、发布门禁 |
| Online | 生产 runs/threads | 质量监控、异常发现、采样、真实反馈 |

在线 evaluator 应先用 filters 缩小目标 runs，再配置 sampling rate 控制费用；可对历史 runs 做一次性 backfill。LLM-as-a-judge 还应设置每周 spend limit，避免生产流量增长带来不可控评测开销。多轮对话用 thread-level evaluator，不要只评价单个 run。

Evaluator 类型：

- 代码规则：快速、稳定，适合格式、关键字段、工具参数和安全规则。
- 人工评审：质量最高但慢，适合金标和争议样本。
- LLM-as-judge：覆盖开放式质量，必须校准偏差和费用。
- Pairwise：比较 A/B 两个版本，通常比绝对打分稳定。
- Trajectory evaluator：评估工具选择、顺序、冗余调用和多轮策略。
- Composite evaluator：组合多个评分形成发布标准。

### 11.5 最小评测示例

```python
from langsmith import Client

client = Client()

dataset = client.create_dataset(
    dataset_name="routing-regression",
    description="客服路由回归集",
)
client.create_examples(
    dataset_id=dataset.id,
    examples=[
        {
            "inputs": {"text": "支付成功但会员未到账"},
            "outputs": {"category": "billing"},
        },
        {
            "inputs": {"text": "页面持续返回 500"},
            "outputs": {"category": "technical"},
        },
    ],
)

def target(inputs: dict) -> dict:
    # 替换为真实分类链或 Agent
    text = inputs["text"]
    category = "technical" if "500" in text else "billing"
    return {"category": category}

def exact_match(inputs: dict, outputs: dict, reference_outputs: dict) -> dict:
    return {
        "key": "category_exact_match",
        "score": float(outputs["category"] == reference_outputs["category"]),
    }

results = client.evaluate(
    target,
    data="routing-regression",
    evaluators=[exact_match],
    experiment_prefix="router-v1",
    max_concurrency=2,
)
print(results)
```

对开放式任务可使用 `openevals` 的预置 evaluator 或自定义 LLM-as-judge。先用 5-10 个高质量人工样本定义“好”，再扩展数据集。

### 11.6 评测闭环

```text
生产 trace -> 发现失败 -> 加入 annotation queue
             -> 人工标注 -> 形成 dataset example
             -> 离线实验 -> 对比版本 -> 发布
             -> 在线 evaluator -> 再次监控
```

好的数据集应包含正常样本、边界条件、历史事故、对抗输入、权限隔离、长上下文、多轮对话和工具失败。不要只收集“容易答对”的样本。

---

## 12. LangSmith 提示词、Studio 与部署 ★★★

> 🧩 **学习优先级：补充掌握**

### 12.1 Prompt 管理

LangSmith 支持 Prompt commits、diff、tags、Staging/Production 环境、owners 和 webhook。

```python
from langsmith import Client

client = Client()

# 拉取当前 Production 指向的版本
prompt = client.pull_prompt("support-answer:production")

# 推送新版本；生产环境应先经过数据集评测再移动 tag
# client.push_prompt("support-answer", object=prompt_template)
```

推荐流程：

```text
修改 Prompt -> commit -> 离线 experiment -> 人工抽检
            -> promote to staging -> 影子/小流量验证
            -> promote to production -> 持续在线评测
```

标签是版本指针，不是副本。生产代码引用 `:production`，回滚时移动指针，不必改代码。

### 12.2 Studio

LangSmith Studio 是兼容 Agent Server API 的 Agent IDE，可用于：

- 可视化图结构、节点路径和中间 state。
- 运行 Agent、管理 assistants 和 threads。
- 修改 Prompt、查看 traces。
- 对 dataset 运行 experiments。
- 管理长期记忆。
- 使用 time travel 调试。
- 从本地 Agent Server 一键部署到 LangSmith Cloud。

Graph mode 展示节点和状态细节；Chat mode 更适合业务人员测试基于 `MessagesState` 的 Agent。

### 12.3 Agent Server 与 Deployment

LangSmith Deployment 是面向 Agent 的工作流运行时，提供 durable execution、实时流、横向扩展和任务队列。核心资源：

- Assistant：某个 graph 的配置实例。
- Thread：持久会话。
- Run：一次执行，可前台、后台或流式。
- Cron job：定时执行。

Agent Server 默认管理：

- PostgreSQL 中的 assistants、threads、runs、cron jobs。
- checkpoint 短期记忆与 store 长期记忆。
- task queue、worker、并发和运行恢复。
- streaming、HITL、webhooks、MCP、A2A 和 distributed tracing。

部署 graph 时优先导出已编译 `CompiledGraph`，服务启动时只编译一次；仅当每个 run 都必须定制图时才使用 factory function。

部署形态：

| 形态 | 控制面 | 数据面/Agent Server | 适合 |
| --- | --- | --- | --- |
| Cloud | LangChain 托管 | LangChain 托管 | 快速生产化 |
| Hybrid | LangChain 托管 | 自有基础设施 | VPC/数据驻留 |
| Self-hosted with control plane | 自托管 | 自托管 | 企业全栈控制 |
| Standalone Agent Server | 无托管控制面 | Docker/K8s 自托管 | 只需要运行时 |

### 12.4 2026 扩展能力

| 能力 | 作用 | 状态/注意事项 |
| --- | --- | --- |
| LangSmith Engine | 从生产 trace 发现重复问题、分析根因、生成 evaluator/数据集并提出 PR | 需要控制代码和数据访问权限 |
| Insights / Chat | 聚类分析错误和使用模式，并以对话方式分析 traces、prompts、experiments | 结论仍需人工核验 |
| LLM Gateway | 多 provider 统一入口、trace、fallback、限流、费用与数据保护 | 截至本文时点为 Beta |
| 平台互操作 | LangSmith MCP Server、telemetry export、Fleet 等 | 按团队治理与部署需求选用，不是三 Lang 入门前置知识 |

LLM Gateway 支持 OpenAI Chat Completions、Anthropic Messages 和 OpenAI Responses 风格入口，并可按用户/workspace/API key 设置费用与速率策略。不要因为有统一网关就忽略各 provider 的能力差异。

---

## 13. 三者集成示例 ★★★★★

> 🔥 **学习优先级：重点掌握**

下面是一个最小“知识工具 + 结构化结果 + 线程记忆 + LangSmith trace”示例。`create_agent` 本身运行在 LangGraph 上，因此三者已经形成闭环。

### 13.1 `.env`

```dotenv
MODEL_ID=openai:gpt-5.4-mini
OPENAI_API_KEY=...
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=...
LANGSMITH_PROJECT=framework-study-agent
```

### 13.2 `app.py`

```python
import os
from typing import Literal

from dotenv import load_dotenv
from pydantic import BaseModel, Field
from langchain.agents import create_agent
from langchain.agents.middleware import ModelRetryMiddleware, ToolRetryMiddleware
from langchain.chat_models import init_chat_model
from langchain.tools import tool
from langgraph.checkpoint.memory import InMemorySaver

load_dotenv()

KNOWLEDGE = {
    "langchain": (
        "LangChain 提供模型、消息、工具、结构化输出、RAG 和 create_agent。"
    ),
    "langgraph": (
        "LangGraph 提供 state、node、edge、checkpoint、interrupt 和 durable execution。"
    ),
    "langsmith": (
        "LangSmith 提供 tracing、evaluation、prompt 管理、Studio 与 deployment。"
    ),
}

@tool
def search_framework_docs(topic: str) -> str:
    """查询 LangChain、LangGraph 或 LangSmith 的学习摘要。"""
    normalized = topic.strip().lower()
    for key, value in KNOWLEDGE.items():
        if key in normalized:
            return f"source=local-study-note\n{value}"
    return "未找到相关资料；不要猜测。"

class StudyAnswer(BaseModel):
    answer: str = Field(description="简洁、准确的中文回答")
    sources: list[str] = Field(description="使用过的来源标识")
    confidence: float = Field(ge=0, le=1)

model = init_chat_model(
    os.environ["MODEL_ID"],
    temperature=0,
    timeout=30,
)

agent = create_agent(
    model=model,
    tools=[search_framework_docs],
    system_prompt=(
        "你是框架学习助手。涉及 LangChain、LangGraph、LangSmith 的事实时，"
        "先调用资料工具。证据不足就说明不知道。"
    ),
    response_format=StudyAnswer,
    checkpointer=InMemorySaver(),
    middleware=[
        ModelRetryMiddleware(max_retries=2),
        ToolRetryMiddleware(max_retries=2),
    ],
)

config = {
    "recursion_limit": 30,
    "configurable": {"thread_id": "study-session-001"},
}

result = agent.invoke(
    {
        "messages": [
            {
                "role": "user",
                "content": "LangGraph 的主要职责是什么？",
            }
        ]
    },
    config=config,
)

print(result["structured_response"].model_dump_json(indent=2))
```

### 13.3 这段代码对应的能力

```text
LangChain: init_chat_model + @tool + create_agent + middleware + structured output
LangGraph: create_agent 的运行时 + InMemorySaver + thread_id + recursion_limit
LangSmith: 环境变量自动 tracing，记录模型、工具、状态与延迟
```

生产化时替换：

- 本地字典 -> 带权限过滤、重排和引用的检索系统。
- `InMemorySaver` -> PostgreSQL checkpointer 或 Agent Server 管理的 persistence。
- 固定 thread ID -> 业务生成的稳定 UUID。
- 简单重试 -> 按错误类型、退避和幂等策略重试。
- 开发 trace -> 脱敏、采样、项目隔离、告警和在线 evaluator。

---

## 14. 生产工程实践 ★★★★★

> 🔥 **学习优先级：重点掌握**

### 14.1 可靠性

- 模型、工具、检索分别设置 timeout，不能只设置总超时。
- 仅对瞬时错误重试，并使用指数退避和 jitter。
- 写操作使用 idempotency key，避免恢复/重试造成重复副作用。
- 设置 fallback 时记录为何切换，避免质量下降不可见。
- 设计“部分成功”“人工接管”“安全失败”路径。
- 所有循环设置语义退出条件和硬上限。
- 为模型输出、工具输入/输出和 state 更新建立 schema。

### 14.2 安全

- 认证和授权由代码执行，不能让模型判定自己是否有权限。
- 工具实施最小权限；读写分离；高风险写操作要求 HITL。
- 对 URL、路径、SQL、Shell、模板和文件类型做 allowlist/校验。
- 对网页、文档、MCP 和工具返回内容按不可信输入处理。
- 检索必须在召回前应用租户与 ACL 过滤，不能只在生成后过滤。
- 使用 sandbox 运行代码；限制 CPU、内存、网络、文件系统和运行时间。
- trace、checkpoint、store、Prompt 和数据集都要有访问控制与保留期。
- PII/密钥脱敏覆盖普通响应、错误日志和流式事件。

### 14.3 成本与性能

- 先测 token 构成：system、历史、检索、工具结果、最终输出。
- 用摘要、选择性工具和 context offloading 控制上下文。
- 简单路由/抽取使用更小模型；复杂步骤再升级模型。
- 批处理 embedding 和离线评测；异步并发时设置上限。
- 检索 top-k 不要盲目增大，配合 rerank 和压缩。
- 缓存只用于可安全复用的确定性结果，缓存键包含版本和权限维度。
- 在 LangSmith 按项目、模型、租户和功能观察 P50/P95/P99 延迟与费用。

### 14.4 测试金字塔

1. **纯函数单测**：reducer、路由、格式化、权限、解析。
2. **工具契约测试**：schema、timeout、错误映射、幂等。
3. **图路径测试**：关键分支、循环退出、interrupt/resume、恢复。
4. **模型集成测试**：真实 provider 的工具调用与结构化输出。
5. **离线 eval**：数据集上的质量、费用和延迟回归。
6. **在线 eval/监控**：生产采样、用户反馈、异常和漂移。

不要要求每次模型调用输出完全相同的字符串。测试结构、事实、约束、工具轨迹和可接受阈值。

LangChain 单测优先使用 fake chat model 和内存持久化，避免真实 API 带来的波动；集成测试再调用真实 provider。LangGraph 测试中应为每个用例重新编译图并创建新的 `InMemorySaver`，也可通过 `compiled_graph.nodes["node_name"].invoke(...)` 单独测试节点。涉及恢复的测试必须使用固定 `thread_id` 覆盖 interrupt、checkpoint 和重复执行路径。

### 14.5 发布门禁示例

```text
必须通过：
- 关键工具参数合法率 >= 99%
- 高风险工具未经批准执行次数 = 0
- RAG 引用准确率 >= 95%
- 核心数据集任务成功率不得比 production 下降超过 1%
- P95 延迟和平均费用在预算内
- 所有已知事故样本通过
```

阈值必须由具体业务风险决定，不能照搬。

### 14.6 可观测性字段建议

```text
release_version, prompt_version, model_id, model_provider,
tenant_id_hash, user_id_hash, thread_id, request_type,
tool_names, retrieval_index_version, dataset_slice,
token_input, token_output, cost, latency_ms,
retry_count, error_type, safety_decision
```

用户/租户 ID 应匿名化。Metadata 命名要稳定，才能持续做聚合和版本对比。

---

## 15. 旧资料迁移与常见误区 ★★★

> 🧩 **学习优先级：补充掌握**

两份本地材料适合建立基础直觉，但以下内容应按当前 API 修正：

| 旧写法/观点 | 当前建议 | 原因 |
| --- | --- | --- |
| `langgraph.prebuilt.create_react_agent` | `langchain.agents.create_agent` | LangGraph v1 已弃用前者 |
| `messages_modifier=SystemMessage(...)` | `system_prompt=` 或动态 Prompt middleware | 新 Agent API 的标准入口 |
| `MemorySaver()` | 文档当前主要使用 `InMemorySaver()` | 名称更明确；仅适合开发 |
| `LANGCHAIN_TRACING_V2=true` | `LANGSMITH_TRACING=true` | 当前 LangSmith 配置名称 |
| `agent.invoke(..., recursion_limit=10)` | `config={"recursion_limit": 10, ...}` | recursion limit 是 config 顶层键 |
| `eval(expression)` 作为计算工具 | 显式运算符或受限解析器 | 模型输入不可信，存在代码执行风险 |
| 直接无限追加消息 | trim、summary、offload + checkpoint | 控制上下文、延迟和费用 |
| 所有状态都放 `messages` | 业务字段放 typed state，长期信息放 store | 可维护、可测试、可恢复 |
| 只设置 API key 就算可观测 | 项目、metadata、feedback、eval、脱敏和告警一起设计 | Trace 本身不等于质量保障 |
| 旧 `langchain.chains` 导入 | 新代码优先 Agent/Runnable；必要时使用 `langchain-classic` | v1 命名空间已精简 |
| 只使用 `stream_mode` tuple | 新应用优先 Event Streaming v3；低层用 v2 StreamPart | 类型更清晰，前端更易消费 |
| “LangChain 做零件，LangGraph 搭流程” | 仍可作为入门比喻，但 `create_agent` 已构建在 LangGraph 上 | 二者关系更深，不是完全独立层 |

其他常见误区：

- **温度为 0 不等于确定性**：供应商实现、并行、模型版本和基础设施仍可能产生差异。
- **结构化输出不等于正确输出**：schema 合法也可能事实错误。
- **检索到文档不等于回答 grounded**：需要 faithfulness 与 citation eval。
- **多 Agent 不天然更强**：可能只是增加调用次数和上下文损失。
- **Checkpoint 不等于长期记忆**：checkpoint 是 thread 状态；Store 才是跨 thread 记忆。
- **模型能调用工具不代表工具安全**：安全边界必须在工具和中间件中执行。
- **Tracing 不应默认记录一切**：先做数据分类、脱敏和保留策略。

---

## 16. 学习路线与知识检查表 ★★★

> 🧩 **学习优先级：补充掌握**

### 16.1 四阶段路线

#### 阶段一：模型与确定性链路

- 模型 `invoke/stream/batch`。
- Message、Prompt、content blocks。
- LCEL/Runnable。
- Pydantic 结构化输出。
- 用 LangSmith 查看第一次 trace。

练习：做一个结构化工单分类器，并用 20 条数据集做回归。

#### 阶段二：Tools、Agent 与 RAG

- `@tool`、schema、ToolRuntime。
- `create_agent` 与 Agent loop。
- middleware、重试、限额、guardrails。
- 2-Step RAG、Agentic RAG、引用与检索评测。
- short-term / long-term memory。

练习：做一个只能根据内部文档回答、证据不足会拒答的客服 Agent。

#### 阶段三：LangGraph

- State、reducer、node、edge、super-step。
- conditional edge、`Command`、`Send`。
- checkpoint、store、interrupt/resume。
- subgraph、streaming v2、event streaming v3。
- 幂等、恢复、time travel 和图测试。

练习：做一个“检索 -> 生成 -> 评价 -> 不合格则改进 -> 高风险操作人工审批”的图。

#### 阶段四：LangSmith 与生产化

- traces、threads、trajectories、feedback。
- datasets、offline/online eval、annotation queue。
- Prompt staging/production 与回滚。
- Studio、本地 Agent Server、Deployment。
- Engine、Insights、Gateway、MCP/A2A。
- 成本、安全、SLO、发布门禁。

练习：把阶段三的图部署为 Agent Server，以 dataset 作为 CI 发布门禁，并为生产 trace 配置在线 evaluator。

### 16.2 核心检查表

- [ ] 能解释 LangChain、LangGraph、LangSmith 的边界和组合关系。
- [ ] 能用当前 `create_agent`，不再依赖已弃用 `create_react_agent`。
- [ ] 能区分 state、runtime context、checkpointer 和 store。
- [ ] 能为并行 state 更新选择正确 reducer。
- [ ] 能用 `Command` 更新状态并路由，用 `Send` 做动态 fan-out。
- [ ] 能实现 interrupt/resume，且副作用具备幂等性。
- [ ] 能区分 stream mode v2 与 Event Streaming v3。
- [ ] 能实现带引用的 RAG，并分别评测 retrieval 和 generation。
- [ ] 能用 middleware 做重试、限额、摘要、PII 和审批。
- [ ] 能安全接入 MCP，并理解默认无状态 session。
- [ ] 能在 LangSmith 中建立 dataset、experiment 和 evaluator。
- [ ] 能把生产失败样本回流到离线回归集。
- [ ] 能说明 Agent Server 的 assistant/thread/run/cron 资源。
- [ ] 能为 trace、checkpoint、store 和工具设计数据安全策略。

---

## 17. 官方资料索引 ★

> 👀 **学习优先级：了解即可**

### 17.1 本文参考的本地资料

- 《AI开发基础：Langchain框架从入门到实战开发-附代码》
- 《AI开发基础：Langgraph框架从入门到实战开发智能体-附带完整可运行代码》

本地资料用于教学结构与基础示例参考；涉及版本和 API 时，以以下官方在线资料为准。

### 17.2 LangChain

- [LangChain Overview](https://docs.langchain.com/oss/python/langchain/overview)
- [LangChain v1 新特性](https://docs.langchain.com/oss/python/releases/langchain-v1)
- [Agents](https://docs.langchain.com/oss/python/langchain/agents)
- [Models](https://docs.langchain.com/oss/python/langchain/models)
- [Messages 与标准内容块](https://docs.langchain.com/oss/python/langchain/messages)
- [Tools](https://docs.langchain.com/oss/python/langchain/tools)
- [Structured Output](https://docs.langchain.com/oss/python/langchain/structured-output)
- [Middleware](https://docs.langchain.com/oss/python/langchain/middleware)
- [Context Engineering](https://docs.langchain.com/oss/python/langchain/context-engineering)
- [Retrieval / RAG](https://docs.langchain.com/oss/python/langchain/retrieval)
- [Multi-agent](https://docs.langchain.com/oss/python/langchain/multi-agent)
- [MCP](https://docs.langchain.com/oss/python/langchain/mcp)
- [Event Streaming](https://docs.langchain.com/oss/python/langchain/event-streaming)
- [LangChain 1.3.15 Release](https://github.com/langchain-ai/langchain/releases/tag/langchain%3D%3D1.3.15)

### 17.3 LangGraph

- [LangGraph Overview](https://docs.langchain.com/oss/python/langgraph/overview)
- [LangGraph v1 新特性](https://docs.langchain.com/oss/python/releases/langgraph-v1)
- [Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api)
- [Functional API](https://docs.langchain.com/oss/python/langgraph/functional-api)
- [Fault Tolerance](https://docs.langchain.com/oss/python/langgraph/fault-tolerance)
- [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
- [Checkpointers](https://docs.langchain.com/oss/python/langgraph/checkpointers)
- [Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)
- [Streaming v2](https://docs.langchain.com/oss/python/langgraph/streaming)
- [Event Streaming v3](https://docs.langchain.com/oss/python/langgraph/event-streaming)
- [LangGraph 1.2.11 Release](https://github.com/langchain-ai/langgraph/releases/tag/1.2.11)

### 17.4 LangSmith

- [LangSmith Observability](https://docs.langchain.com/langsmith/observability)
- [Observability Concepts](https://docs.langchain.com/langsmith/observability-concepts)
- [Tracing Quickstart](https://docs.langchain.com/langsmith/observability-quickstart)
- [Trace 中添加 Metadata 与 Tags](https://docs.langchain.com/langsmith/add-metadata-tags)
- [Alerts](https://docs.langchain.com/langsmith/alerts)
- [Evaluation Concepts](https://docs.langchain.com/langsmith/evaluation-concepts)
- [Evaluation Quickstart](https://docs.langchain.com/langsmith/evaluation-quickstart)
- [Online Evaluation](https://docs.langchain.com/langsmith/online-evaluations-llm-as-judge)
- [Prompt 管理](https://docs.langchain.com/langsmith/manage-prompts)
- [LangSmith Studio](https://docs.langchain.com/langsmith/studio)
- [LangSmith Deployment](https://docs.langchain.com/langsmith/deployment)
- [Agent Server](https://docs.langchain.com/langsmith/core-capabilities)
- [LangSmith Engine](https://docs.langchain.com/langsmith/engine-overview)
- [LLM Gateway](https://docs.langchain.com/langsmith/llm-gateway)
- [LangSmith SDK 0.11.0 Release](https://github.com/langchain-ai/langsmith-sdk/releases/tag/v0.11.0)

### 17.5 扩展

- [Deep Agents](https://docs.langchain.com/oss/python/deepagents/overview)
- [LangChain 官方文档总索引](https://docs.langchain.com/llms.txt)
- [Python API Reference](https://reference.langchain.com/python/)

---

## 结语

最实用的学习顺序不是同时记住所有类名，而是建立一条可验证的工程闭环：

```text
用 LangChain 构建能力
-> 用 LangGraph 管理状态与执行
-> 用 LangSmith 看见行为并量化质量
-> 把生产失败变成数据集
-> 再迭代 Prompt、工具、检索、模型和图
```

当这条闭环能够稳定运行时，Agent 才从“会演示”进入“可维护、可评估、可上线”的阶段。
