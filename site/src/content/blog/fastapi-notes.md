---
title: "FastAPI 学习笔记"
description: "FastAPI 从入门到实战：路由与参数校验、响应模型、中间件、依赖注入、数据库集成、安全认证、WebSocket 和部署。"
publishDate: "2026-09-04"
tags: ["FastAPI", "Python", "后端"]
aiAssisted: true
template: false
---

## 📌 阅读优先级

> 星级直接写在正文主要章节标题中，用于表示第一次学习应投入的精力；低星级不代表内容无价值。

| 星级 | 分类 | 建议学习深度 |
|---|---|---|
| ★★★★★ | 重点掌握 | 理解原理，能运行、修改、组合并排查常见问题 |
| ★★★ | 补充掌握 | 能读懂并知道何时使用，项目需要时可快速落地 |
| ★ | 了解即可 | 建立概念边界，需要时查询，不必投入大量时间记忆 |

> 建议先完成所有五星章节，再补三星章节；一星章节可在遇到对应场景时查阅。

### ★★★★★ 重点掌握

1. **路由与请求处理（见“路由与参数”）**
   - 应用场景：提供对话接口、文档上传、向量检索API、Agent调用接口
   - 为什么重要：这是FastAPI最基础的能力，所有功能都基于此
   - 核心技能：
     - @app.get/post装饰器定义路由
     - 路径参数（/chat/{conversation_id}）
     - 查询参数（?top_k=5&threshold=0.7）
     - 请求体（Body）接收JSON数据
     - Pydantic模型自动校验输入

2. **异步处理（async/await）（贯穿异步路由与外部 I/O 示例）**
   - 应用场景：调用LLM API、查询向量数据库、批量处理请求
   - 为什么重要：LLM应用经常需要等待模型响应、数据库和网络 I/O，合理使用异步可以提高并发利用率
   - 核心技能：
     - async def定义异步路由
     - await调用异步函数（httpx、数据库、Redis）
     - 理解异步vs同步的性能差异
   - 实战价值：减少 I/O 等待造成的线程占用；实际吞吐必须结合模型限流、连接池和压测结果判断

3. **请求校验与响应模型（见“参数校验”和“响应模型”）**
   - 应用场景：验证用户输入、定义API返回格式、自动生成文档
   - 为什么重要：LLM应用的输入输出都需要严格校验，避免非法数据导致崩溃
   - 核心技能：
     - Pydantic模型定义（BaseModel）
     - Field验证（长度、范围、正则）
     - response_model指定返回格式
     - 状态码控制（200/400/500）
   - 实战技巧：输入校验失败自动返回422，前端能识别具体哪个字段错误

4. **依赖注入（Dependency Injection）（见“依赖注入”）**
   - 应用场景：数据库连接复用、用户认证、日志记录、限流
   - 为什么重要：避免每个路由重复写数据库连接、认证逻辑，代码更简洁
   - 核心技能：
     - Depends()机制
     - 数据库会话管理（yield确保关闭连接）
     - 认证依赖（JWT Token验证）
     - 依赖链（依赖可以依赖其他依赖）
   - 实战价值：100个API只需写一次认证逻辑

5. **CORS跨域配置（见“CORS 跨域配置”）**
   - 应用场景：前后端分离部署、浏览器调用API、移动端调用
   - 为什么重要：不配置CORS浏览器会拦截请求，前端无法调用
   - 核心技能：
     - CORSMiddleware配置
     - allow_origins设置（开发用*，生产用具体域名）
     - allow_methods和allow_headers
   - 常见问题：生产环境忘记限制origins导致安全风险

6. **流式响应（StreamingResponse）（见“响应类型与文件返回”）**
   - 应用场景：LLM流式输出（token-by-token显示）、大文件下载、实时日志
   - 为什么重要：LLM生成需要几秒到几十秒，流式输出能实时展示，改善用户体验
   - 核心技能：
     - StreamingResponse使用
     - async generator生成数据流
     - SSE（Server-Sent Events）协议
     - 流式输出的错误处理
   - 实战技巧：与OpenAI stream=True配合，实现ChatGPT式打字效果

7. **WebSocket长连接（见“WebSocket 实时通信”）**
   - 应用场景：实时对话、多轮交互、Agent执行进度推送
   - 为什么重要：HTTP是一问一答，WebSocket支持双向通信，适合实时场景
   - 核心技能：
     - @app.websocket装饰器
     - await websocket.accept()
     - await websocket.send_json()
     - 心跳机制（防止连接断开）
     - 异常处理（连接断开、超时）

### ★★★ 补充掌握

1. **中间件（见“中间件”）**
   - 实用场景：请求日志、性能监控、错误统一处理、限流
   - 价值：不修改每个路由就能加全局功能
   - 实现：@app.middleware("http")装饰器

2. **安全认证（见“安全认证”）**
   - 实用场景：用户登录、API Key验证、权限控制
   - 核心技术：JWT Token、OAuth2、Bearer认证
   - 实战：生成Token、验证Token、刷新Token

3. **数据库集成（见“集成 SQLAlchemy ORM 操作数据库”）**
   - 实用场景：存储用户数据、对话历史、向量检索结果
   - 核心技术：SQLAlchemy ORM、异步驱动、连接池配置
   - 注意：数据库连接必须及时关闭，避免连接泄漏

4. **自动文档（见“自动生成交互式 API 文档”）**
   - 实用价值：自动生成API文档、在线测试接口、团队协作
   - 访问地址：http://localhost:8000/docs
   - 技巧：写好docstring和Pydantic描述，文档自动更新

5. **后台任务（见“后台任务”）**
   - 实用场景：发送邮件、异步写日志、数据预处理
   - 价值：不阻塞API响应，后台执行耗时任务
   - 注意：不适合长时间任务（应该用Celery等任务队列）

6. **生产部署（见“生产部署”）**
   - 核心配置：Uvicorn workers数量、Gunicorn + Uvicorn
   - 容器化：Dockerfile编写、多阶段构建
   - 监控：健康检查接口、日志收集、性能指标

### ★ 了解即可

1. **GraphQL集成** - 前端需要灵活查询时考虑
2. **测试（TestClient）** - 单元测试、集成测试，CI/CD时必须
3. **限流与缓存** - slowapi限流、Redis缓存，高并发时必须
4. **文件上传/下载** - UploadFile、静态文件服务，文档助手必备

---

## 笔记范围 ★

> 👀 **学习优先级：了解即可**
> **使用位置：** 了解笔记范围和学习方式；**学习要求：** 建立概念边界，不必首次记忆细节，需要时再查询。

本笔记系统整理 FastAPI 从入门到实战的知识体系，涵盖路由参数、请求校验、响应模型、中间件、依赖注入、数据库集成、安全认证、WebSocket、CORS 配置、生产部署等核心内容。目标是能用 FastAPI 构建高性能 Web API。

## FastAPI 简介 ★★★

> 🧩 **学习优先级：补充掌握**
> **使用位置：** 理解框架定位、核心组件和适用边界；**学习要求：** 能读懂并知道何时使用，项目需要时可快速落地。

**FastAPI是一个现代、高性能的Python Web框架，专为构建API而设计**。它基于标准的Python类型提示（Type Hints）构建，自2018年底由Sebastián Ramírez(**塞巴斯蒂安·拉米雷斯**)发布以来，已成为Python生态中发展最快的框架之一。

FastAPI的官方网站是：https://fastapi.tiangolo.com。

网站提供多语言支持，中文文档的入口是：https://fastapi.tiangolo.com/zh/

![FastAPI 简介（截图 1）](/images/blog/fastapi-notes/1781778460556.webp)

### 为什么选择 FastAPI？

FastAPI的核心设计目标是解决传统框架（如Flask、Django）在**异步支持、开发效率和性能**上的痛点，其主要优势体现在以下几个方面：

- **🚀 高性能 (High Performance)**：FastAPI的性能与**NodeJS和Go**等语言编写的框架相当，是Python中最快的框架之一。这得益于其底层基于Starlette（ASGI框架）和Pydantic（数据验证库）。在TechEmpower的基准测试中，其性能远超Flask和Django。
- **⚡️ 极速开发 (Fast to Code)**：官方估计，使用FastAPI开发功能的速度能提升约**200%到300%**。这主要归功于其高度依赖类型提示的特性，减少了大量样板代码。
- **🐛 更少错误 (Fewer Bugs)**：借助类型提示和Pydantic的自动数据验证，FastAPI能减少约**40%** 由开发者引起的人为错误。
- **📖 自动生成文档 (Automatic Documentation)**：这是FastAPI最受欢迎的特性之一。它基于**OpenAPI**标准，能自动为你的API生成交互式文档。文档支持 **Swagger UI** 和 **ReDoc** 两种界面，你可以在浏览器中直接调用和测试API。
- **🧩 强大的依赖注入系统 (Dependency Injection)**：FastAPI包含一个极其易用但功能强大的依赖注入系统。依赖项本身也可以有依赖项，形成一个层次结构或依赖图，这一切都由框架自动处理，这有助于保持代码的模块化和可测试性。
- **🔐 安全工具 (Security)**：提供 OAuth2、API Key 等安全方案的集成工具；JWT 的签发与校验通常配合 PyJWT 等库完成。

### 核心架构：Starlette + Pydantic

FastAPI的强大并非凭空而来，它巧妙地站在了巨人的肩膀上：

- **Starlette**：一个轻量级的**ASGI（异步服务器网关接口）** 框架，为FastAPI提供了强大的异步Web工具支持。
- **Pydantic**：一个数据验证和设置管理的库，它利用Python类型提示进行数据验证、序列化和反序列化。

### 适用场景

凭借其高性能和开发效率，FastAPI特别适合以下场景：

- 构建**高并发API服务**，例如支付网关、实时数据推送服务。
- 作为**微服务架构**中的核心组件。
- 为**机器学习模型**提供高性能的API服务接口。
- 开发需要**WebSocket**实时通信的应用。

### FastAPI、Flask 与 Django 对比

| **对比维度**     | **FastAPI**                                                  | **Flask**                                             | **Django**                                                   |
| :--------------- | :----------------------------------------------------------- | :---------------------------------------------------- | :----------------------------------------------------------- |
| **框架类型**     | 现代异步 Web 框架（偏向 API 开发）                           | 微框架（Micro-framework）                             | 全能型（Batteries-included）全栈框架                         |
| **底层协议**     | **ASGI**（原生异步非阻塞）                                   | **WSGI**（同步阻塞，异步需额外借助 Quart 等）         | **WSGI**（主流），现已部分支持 ASGI（Django 3.1+）           |
| **性能/速度**    | **极高**（Node.js/Go 级别）                                  | 中等                                                  | 相对较低（受限于同步架构和庞大的内置组件）                   |
| **数据验证**     | **原生支持**（基于 Pydantic，自动校验、序列化）              | 需借助第三方库（如 Marshmallow、Pydantic）            | 通过 Forms 或 DRF（Django REST Framework）序列化器           |
| **ORM / 数据库** | 无内置 ORM，需自行集成（SQLAlchemy 等）                      | 无内置 ORM，需自行集成（SQLAlchemy 等）               | **内置强大 ORM**（自带迁移、关联查询、聚合等）               |
| **API 文档**     | **自动生成**（内置 Swagger UI 和 ReDoc，开箱即用）           | 需手动配置或使用扩展（如 Flasgger）                   | 核心无，需借助 DRF 的 drf-yasg 或 Spectacular 生成           |
| **后台管理**     | 无，需自行开发或集成（如 SQLAlchemy Admin）                  | 无，需自行开发（如 Flask-Admin）                      | **内置 Admin 后台**（增删改查开箱即用，功能极强）            |
| **模板引擎**     | 无（推荐作为纯后端 API 使用，可集成 Jinja2）                 | 内置 Jinja2（渲染 HTML 页面非常方便）                 | 内置 Django Template（功能完善，自带标签/过滤器）            |
| **依赖注入**     | **原生支持**（Dependency Injection 机制优雅）                | 需手动实现或借助扩展                                  | 无原生概念，需手动解耦或借助第三方库                         |
| **学习曲线**     | **中等**（需熟悉 Python 类型提示和异步基础）                 | **低**（路由和视图简单直观，2小时入门）               | **较高**（概念极多：MTV、中间件、信号、Form、Admin 等）      |
| **项目结构**     | 高度自由，开发者自行设计                                     | 高度自由，非常灵活                                    | **强约束**（约定大于配置，目录和命名规范严格）               |
| **生态与扩展**   | 较新但增长迅猛，生态围绕异步库（HTTPX、SQLAlchemy Async）    | 生态极其丰富，历经时间考验，扩展极多                  | 生态极其丰富，“万物皆可插”，三方库/中间件海量                |
| **适用场景**     | **高并发 API 服务**、微服务架构、实时聊天/流式响应、前后端分离项目 | **小型项目**、简单 Web 页面、快速原型验证、轻量级 API | **大型企业级 Web 应用**、内容管理系统（CMS）、电商后台、自带后台管理需求的快速开发 |

## 编写 FastAPI Hello World 项目 ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 掌握应用入口、路由和 Uvicorn 启动方式；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

首先磁盘里先新建一个空项目目录fastapi_pro

![编写 FastAPI Hello World 项目（截图 1）](/images/blog/fastapi-notes/1781855717994.webp)

然后打开 PyCharm，点击 New Project，左侧选择 FastAPI，定位到 `fastapi_pro` 目录，选择虚拟环境和 Python 3.11，最后点击 Create 创建项目。

![编写 FastAPI Hello World 项目（截图 2）](/images/blog/fastapi-notes/1781855746809.webp)

目录结构：左侧venv是虚拟环境，包括配置和第三方库，main.py是项目启动入口文件，test_main是项目测试文件。

![编写 FastAPI Hello World 项目（截图 3）](/images/blog/fastapi-notes/1781855888510.webp)

我们点击右上角 绿色 三角形 启动项目

![编写 FastAPI Hello World 项目（截图 4）](/images/blog/fastapi-notes/1781856077010.webp)

接着控制输出，启动成功。

点击按钮运行，相当于执行了  `python.exe -m uvicorn main:app --reload`

![编写 FastAPI Hello World 项目（截图 5）](/images/blog/fastapi-notes/1781856159355.webp)

我们点击 `http://127.0.0.1:8000/`链接测试，说明测试成功。

![编写 FastAPI Hello World 项目（截图 6）](/images/blog/fastapi-notes/1781856427017.webp)

我们来解释下 `python.exe -m uvicorn main:app --reload`

这个命令是**用Python模块方式启动Uvicorn服务器**，来运行一个名为`main.py`文件里的FastAPI（或任意ASGI）应用，并开启了**热重载**功能。它是在Windows环境下开发调试时最常用的启动方式。

我们可以把这条命令拆解成5个部分来理解：

1. `python.exe`

这是Python解释器的可执行文件。在Windows系统中，`.exe`后缀明确指定了要运行的程序。如果你在macOS或Linux上，通常只需要输入`python`或`python3`。

2. `-m`

这是Python的命令行选项，全称是 **“module”**（模块）。它的作用是告诉Python：“**不要执行一个脚本文件，而是去执行一个库（模块）**”。它会去Python的安装路径下寻找名为`uvicorn`的文件夹，并运行里面的`__main__.py`文件。

**对比一下**：

- 不加`-m`，通常需要写完整路径，比如`python C:\path\to\uvicorn\__main__.py ...`。
- 加了`-m`，Python会自动帮你在`sys.path`（系统路径）中搜索这个模块，用起来更简洁、更标准。

3. `uvicorn`

这是要运行的**模块名称**。当Python收到`-m uvicorn`时，它会去执行Uvicorn库的入口代码，相当于启动了这个Web服务器程序。

4. `main:app`

这是告诉Uvicorn**具体要去启动哪个应用**，它由两部分组成，用冒号`:`隔开：

- **main**：指的是`main.py`这个Python文件名（注意，不需要加`.py`后缀）。
- **app**：指的是`main.py`文件中创建的**应用实例变量**。在FastAPI中，通常是`app = FastAPI()`这行代码创建的对象。

如果你的文件名是`server.py`，实例叫`application`，这里就要改成`server:application`。

5. `--reload`

这是一个**开关参数**，意为“重载”。当加上它后，Uvicorn会监听项目目录下的所有Python文件变化。

- **作用**：当你修改了`main.py`或其他导入的代码并保存文件时，Uvicorn会自动检测到变动，并优雅地关闭旧进程、启动新进程。
- **适用场景**：**仅在开发调试阶段使用**，能极大提升开发效率，省去手动重启服务器的麻烦。
- **警告**：**在生产环境（线上服务器）绝对不要加这个参数**，因为文件监听会消耗大量服务器资源，且自动重启可能导致服务中断或状态丢失。

这里自动重载很有用，我们平时开发，经常改代码，加了 --reload，自动冲重新加载，就不用每次点重启按钮了。

比如我们修改下代码，

![编写 FastAPI Hello World 项目（截图 7）](/images/blog/fastapi-notes/1781858351067.webp)

修改代码后，自动重启项目：

![编写 FastAPI Hello World 项目（截图 8）](/images/blog/fastapi-notes/1781858370231.webp)

当然 我们还可以在终端里启动，启动命令 `uvicorn main:app --reload`

效果和前面一样。

![编写 FastAPI Hello World 项目（截图 9）](/images/blog/fastapi-notes/1781857973400.webp)

### Uvicorn 简介

**Uvicorn是一个基于ASGI（异步服务器网关接口）规范的Python Web服务器**，以其“闪电般快速”的性能而闻名。它相当于Python异步Web框架（如FastAPI）的“运行引擎”，负责处理底层的网络连接、HTTP请求解析和响应发送。

## 自动生成交互式 API 文档 ★★★

> 🧩 **学习优先级：补充掌握**
> **使用位置：** 使用 OpenAPI 文档联调和检查接口契约；**学习要求：** 能读懂并知道何时使用，项目需要时可快速落地。

FastAPI 最引人注目的特性之一，就是它能**根据你的代码自动生成交互式 API 文档**。这意味着你不再需要手动维护一份可能随时过时的独立文档，因为代码本身就是文档的唯一真实来源。

### 工作原理

这一强大功能的核心在于 FastAPI 遵循的 **OpenAPI** 标准。

1. **生成 OpenAPI 模式**：当你使用 Python 的类型提示（Type Hints）定义 API 的路径、参数和请求体时，FastAPI 会在后台自动提取这些信息，并生成一个符合 OpenAPI 规范的 JSON 或 YAML 文件。这个文件是一份关于你 API 所有端点的结构化蓝图。
2. **渲染成交互式界面**：基于这份 OpenAPI 蓝图，FastAPI 内置了两种广受欢迎的用户界面来将其渲染成交互式文档。你可以直接在你的应用地址后加上特定路径来访问它们。

### 两大核心文档界面

FastAPI 默认提供了两种交互式 API 文档界面，你可以根据需要选择。

**Swagger UI (/docs)**
这是最常用的一种。它提供了一个可视化的、可交互的界面，清晰地列出了所有 API 端点、请求方法、参数和响应模型。
其最大的亮点是支持 **“Try it out”** 功能，你可以直接在浏览器中填写参数并点击执行，向你的 API 发送真实请求并查看返回结果。这对于开发和调试 API 极其方便。

**ReDoc (/redoc)**
这是一个备选的 API 文档方案。它的界面风格与 Swagger UI 不同，更侧重于提供一份结构清晰、易于阅读的文档，非常适合用来作为 API 的参考手册。它同样基于你代码生成的 OpenAPI 模式，因此也是实时更新的。

### 如何访问？

启动 FastAPI 应用后，在浏览器中访问以下地址即可：

- **Swagger UI**: `http://你的地址/docs`
- **ReDoc**: `http://你的地址/redoc`

我们来试下吧，浏览器输入：`http://127.0.0.1:8000/docs`

进入Swagger UI doc

![如何访问？（截图 1）](/images/blog/fastapi-notes/1781859095597.webp)

我们在试下"Try it out"功能，点击“Try it out”

![如何访问？（截图 2）](/images/blog/fastapi-notes/1781859324117.webp)

输入 Jack，然后点 "Execute"执行发送请求

![如何访问？（截图 3）](/images/blog/fastapi-notes/1781859393980.webp)

直接响应请求：

![如何访问？（截图 4）](/images/blog/fastapi-notes/1781859446476.webp)

和我们浏览器里执行一样，后面我们模拟表单，以及其他请求信息，使用这个Swagger UI doc特别方便。

![如何访问？（截图 5）](/images/blog/fastapi-notes/1781859486184.webp)

我们在看下 ReDoc ，浏览器输入 `http://127.0.0.1:8000/redoc`，特别适合用来作为 API 的参考手册

![如何访问？（截图 6）](/images/blog/fastapi-notes/1781859639353.webp)

### 核心优势

- **降低维护成本**：API 文档由接口契约生成，但仍要检查描述、示例和兼容性是否准确。
- **提升协作效率**：清晰、准确的文档极大方便了前后端协作和团队沟通。
- **简化测试流程**：交互式界面让开发者可以快速进行自测和联调，无需借助 Postman 等第三方工具。
- **基于开放标准**：基于 OpenAPI 和 JSON Schema 标准，生成的文档还可以用来为多种编程语言自动生成客户端 SDK。

## 路由与参数（路径参数、查询参数与请求体参数） ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 设计对话、检索、任务和资源类 API；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

简单来说，**路由（Routing）就是“根据请求找对应代码”的映射关系**。

在 Web 开发中，它可以拆解为三个核心要素的绑定：

1. **请求方法**（GET、POST、PUT 等）
2. **URL 路径**（如 `/users`、`/items/123`）
3. **处理函数**（执行具体业务逻辑的代码）

**路由的本质**就是定义一张“查找表”：**当客户端用“方法 A”访问“路径 B”时，服务器自动执行“函数 C”**。

以下是 FastAPI 中**路径参数**、**查询参数**和**请求体参数**的详细对比表格，帮你从定义、位置、用途到代码写法一目了然：

| 对比维度                         | **路径参数 (Path Parameters)**                               | **查询参数 (Query Parameters)**                              | **请求体参数 (Request Body)**                                |
| :------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **定义（是什么）**               | URL路径中**固定占位**的动态变量，用于定位具体资源。          | URL路径 **? 之后**的键值对，用于过滤、排序或分页。           | 放在 HTTP **请求体（Body）** 中的完整数据，通常为 JSON 格式。 |
| **在 URL 中的位置**              | 属于路径的一部分，例如： `/users/`**123**                    | 属于路径末尾的查询字符串，例如： `/users?`**age=18&page=1**  | **不在 URL 中**，位于请求报文的独立数据区域（浏览器看不到）。 |
| **常用 HTTP 方法**               | 所有方法（GET、POST、PUT、DELETE）                           | 主要是 **GET** 请求（也可用于 DELETE）                       | 主要是 **POST、PUT、PATCH**（GET 强烈不推荐带 Body）         |
| **典型使用场景**                 | **指定特定资源**： 获取 ID 为 123 的用户，或修改 ID 为 5 的文章。 | **筛选和辅助**： 查询第 2 页、每页 10 条、按价格排序。       | **提交复杂数据**： 注册新用户（包含用户名、密码、邮箱等完整对象），或编辑一篇文章的全文。 |
| **数据复杂度**                   | 简单数据类型（`int`、`str`、`UUID`）                         | 简单数据类型（`int`、`str`、`bool`、`float`）                | **复杂结构**（嵌套对象、数组，通常用 Pydantic 模型定义）     |
| **是否必须传递**                 | **必须**（URL 中缺少对应片段时，路由通常无法匹配并返回 404） | 由默认值决定；没有默认值时必填，有默认值或 `None` 时可选     | 由函数参数是否提供默认值决定；没有默认值时通常必填           |
| **数据暴露位置**                 | 会出现在 URL 和访问日志中                                    | 会出现在 URL、浏览器历史和访问日志中，**不应传敏感信息**     | 不出现在 URL 中，但并不天然安全；传输敏感信息仍必须使用 HTTPS |
| **在 FastAPI 中的定义方式**      | 写在路径字符串的 `{}` 中： `@app.get("/users/{user_id}")` 函数参数同名即可。 | 定义为**非路径参数**的函数参数： `def list(skip: int = 0)`   | 定义为 **Pydantic 模型** 类型： `def create(item: Item)` （其中 `Item` 继承自 `BaseModel`） |
| **能否在函数参数中省略类型注解** | 可以，但**强烈建议加上**（方便数据自动转换和校验）           | 可以，但会失去类型转换、校验和准确的 API 文档                | 应使用 Pydantic 模型或明确类型，否则 FastAPI 无法按预期解析  |

### 路径参数

路径参数**：URL 路径中的可变部分，用于**定位具体资源**（如 `/users/123` 中的 `123`）。

我们看一个实例：

```python
# -------- 1. 路径参数 --------
@app.get("/users/{user_id}")
async def get_user(user_id: int):
    """路径参数：必须提供，用于获取特定用户"""
    return {"user_id": user_id, "name": f"用户_{user_id}"}
```

然后打开浏览器访问 `http://127.0.0.1:8000/docs`，进行测试：

![路径参数（截图 1）](/images/blog/fastapi-notes/1781944368635.webp)

### 查询参数

查询参数：URL 问号后面的键值对，用于**过滤、排序、分页**（如 `/items?start=10&limit=20`）。

我们看一个实例：

```python
# -------- 2. 查询参数 --------
@app.get("/items")
async def list_items(skip: int = 0, limit: int = 10):
    """查询参数：可选，用于分页"""
    return {"skip": skip, "limit": limit, "items": ["item1", "item2"]}
```

然后打开浏览器访问 `http://127.0.0.1:8000/docs`，进行测试：

![查询参数（截图 1）](/images/blog/fastapi-notes/1781945993480.webp)

### 请求体参数

请求体参数：HTTP 请求体（Body）中携带的数据，通常是 JSON，用于**提交/修改复杂数据**（如注册新用户）。

我们看一个实例：

```python
# -------- 3. 请求体参数 --------
class ItemCreate(BaseModel):
    name: str
    price: float

@app.post("/items/")
async def create_item(item: ItemCreate):
    """请求体参数：POST 时传入 JSON"""
    return {"message": "Item created", "item": item}
```

然后打开浏览器访问 `http://127.0.0.1:8000/docs`，进行测试：

![请求体参数（截图 1）](/images/blog/fastapi-notes/1781948373801.webp)

## 参数校验（Path、Query 与 Field） ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 在边界处拦截非法输入并返回明确错误；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

我们基于前面给出的三个示例，详细讲解 **FastAPI 参数校验**，并分别针对**路径参数**、**查询参数**和**请求体**，展示如何使用 `Path`、`Query` 和 `Field` 进行额外约束和校验。

### 常见校验参数一览

| 参数名                      | 适用对象 | 作用                           |
| :-------------------------- | :------- | :----------------------------- |
| `gt` / `ge`                 | 数字     | 大于 / 大于等于                |
| `lt` / `le`                 | 数字     | 小于 / 小于等于                |
| `min_length` / `max_length` | 字符串   | 字符串长度范围                 |
| `pattern`                   | 字符串   | 使用正则表达式匹配             |
| `min_length` / `max_length` | 列表     | 在 Pydantic v2 中也用于限制列表长度 |
| `...`（省略号）             | 所有     | 表示该字段必须提供（无默认值） |
| `default`                   | 所有     | 设置默认值                     |
| `title` / `description`     | 所有     | 用于生成 API 文档              |

### 路径参数（Path Parameters）—— 使用 `Path`

路径参数是 URL 中必需的一部分，比如 `/users/{user_id}`。默认情况下，FastAPI 会根据类型注解进行简单类型转换（如 `int`），但我们可以借助 `Path` 增加校验规则，例如：

- 限定数值范围（`gt`、`ge`、`lt`、`le`）
- 设置描述信息（用于 OpenAPI 文档）
- 使用正则表达式（`pattern`）校验字符串路径参数（不过路径参数通常是数字或短字符串）

我们看下实例：

```python
from fastapi import FastAPI, Path

app = FastAPI()

@app.get("/users/{user_id}")
async def get_user(
    user_id: int = Path(..., title="用户ID", description="必须是正整数", gt=0, le=1000)
):
    """路径参数：必须提供，且为正整数，范围 1~1000"""
    return {"user_id": user_id, "name": f"用户_{user_id}"}
```

然后打开浏览器访问 `http://127.0.0.1:8000/docs`，进行测试：如果输入范围不对，就会报错

![路径参数（Path Parameters）—— 使用 `Path`（截图 1）](/images/blog/fastapi-notes/1781953470668.webp)

### 查询参数（Query Parameters）—— 使用 `Query`

查询参数是 URL 中 `?` 后面的键值对，通常是可选的，也可以设置默认值。用 `Query` 可以：

- 设置默认值（当然直接赋值也可）
- 校验最大/最小值、字符串长度
- 使用 `pattern` 校验字符串格式
- 设置 `deprecated` 等

我们看一个示例：

```python
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items")
async def list_item(
    skip: int = Query(0, title="跳过条数", ge=0, description="必须 ≥0"),
    limit: int = Query(10, title="返回条数", ge=1, le=100, description="1~100 之间")
):
    """查询参数：可选，带默认值和校验"""
    return {"skip": skip, "limit": limit, "items": ["item1", "item2"]}
```

然后打开浏览器访问 `http://127.0.0.1:8000/docs`，进行测试：如果输入范围不对，就会报错

![查询参数（Query Parameters）—— 使用 `Query`（截图 1）](/images/blog/fastapi-notes/1781953712949.webp)

### 请求体（Request Body）—— 使用 Pydantic + `Field`

请求体通常使用 Pydantic 的 `BaseModel` 定义结构，并在字段上使用 `Field` 添加校验：

- 必填/可选（通过默认值控制）
- 字符串长度（`min_length`、`max_length`）
- 数值范围（`gt`、`ge`、`lt`、`le`）
- 正则匹配（`pattern`）
- 描述信息等

我们看一个实例：

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

class ItemCreate(BaseModel):
    name: str = Field(..., title="物品名称", min_length=2, max_length=50, description="2~50个字符")
    price: float = Field(..., title="价格", gt=0, le=9999.99, description="必须大于0，最多9999.99")
    # 可增加可选字段
    description: str | None = Field(None, max_length=200, description="可选描述，最长200字符")

@app.post("/items")
async def create_item(item: ItemCreate):
    """请求体参数：POST 时传入 JSON，所有字段经过校验"""
    return {"message": "Item created", "item": item}
```

然后打开浏览器访问 `http://127.0.0.1:8000/docs`，进行测试：如果输入字符个数范围不对，就会报错

![请求体（Request Body）—— 使用 Pydantic + `Field`（截图 1）](/images/blog/fastapi-notes/1781953991393.webp)

## Cookie 与 Header 参数获取 ★★★

> 🧩 **学习优先级：补充掌握**
> **使用位置：** 读取认证、追踪和客户端上下文信息；**学习要求：** 能读懂并知道何时使用，项目需要时可快速落地。

**Cookie** 是服务器发送到用户浏览器并保存在本地的一小块数据。它就像网站发给你的“临时身份卡”——浏览器每次发起请求时，都会自动带上这张卡，让服务器能认出你是谁。

下面使用 Pydantic 模型统一接收 Cookie 和 Header，该写法需要 FastAPI 0.115.0 或更高版本；旧版本需要逐个声明参数。

比如在浏览器开发者工具的 Network 面板里点开任意一个请求，Request Headers 里的 `Cookie` 字段就是浏览器自动带上的 Cookie。

我们来看一个官方实例：

```python
class Cookies(BaseModel):
    session_id: str  # 必填，请求里必须有名为 session_id 的 Cookie
    fatebook_tracker: str | None = None  # 可选，没有则为 None
    googall_tracker: str | None = None # 可选，没有则为 None

# Annotated 的作用 把类型（Cookies）和元数据（Cookie()）绑在一起，是 FastAPI 推荐的写法，
# 比旧式 cookies: Cookies = Cookie() 更清晰。
# 如果不指定参数来源，默认从查询参数里去获取。
@app.get("/cookies/")
async def read_cookies(cookies: Annotated[Cookies, Cookie()]):
    return cookies
```

我们测试下：Swagger UI 测试不了，官方文档也有说明。

![Cookie 与 Header 参数获取（截图 1）](/images/blog/fastapi-notes/1782101238589.webp)

所以我们用PostMan测试：

![Cookie 与 Header 参数获取（截图 2）](/images/blog/fastapi-notes/1782101446807.webp)

HTTP请求头部(Header)是一组包含请求信息的键值对，用来描述HTTP请求的各种属性和特征。

我们来看一个官方实例：

```python
class CommonHeaders(BaseModel):
    hostname: str
    save_data: bool
    if_modified_since: str | None = None
    traceparent: str | None = None
    x_tag: list[str] = Field(default_factory=list)


@app.get("/headers/")
async def read_headers(headers: Annotated[CommonHeaders, Header()]):
    return headers
```

然后打开浏览器访问 `http://127.0.0.1:8000/docs`，进行测试

![Cookie 与 Header 参数获取（截图 3）](/images/blog/fastapi-notes/1782102920853.webp)

## 表单数据与模型 ★★★

> 🧩 **学习优先级：补充掌握**
> **使用位置：** 兼容浏览器表单和传统提交方式；**学习要求：** 能读懂并知道何时使用，项目需要时可快速落地。

当你需要接收表单字段而不是 JSON 时，可以使用 `Form`

使用Form之前需要先安装 `python-multipart`

```bash
pip install python-multipart
```

我们来看一个实例：

```python
class FormData(BaseModel):
    username: str
    password: str


@app.post("/login/")
async def login(data: Annotated[FormData, Form()]):
    return data
```

然后打开浏览器访问 `http://127.0.0.1:8000/docs`，进行测试，注意，这里请求信息类型已经是form表单类型了。（之前测试案例是json）

![表单数据与模型（截图 1）](/images/blog/fastapi-notes/1782202551356.webp)

## 请求表单与文件 ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 实现知识库文档上传和批量数据导入；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

FastAPI 支持同时使用 `File` 和 `Form` 定义文件和表单字段。

文件参数常用两种类型：`bytes` 会将整个文件读入内存；`UploadFile` 使用带缓冲的临时文件接口，更适合较大的文件。

我们看一个实例：

```python
@app.post("/files/")
async def create_file(
    file: Annotated[bytes, File()], # 整个文件一次性读进内存
    fileb: Annotated[UploadFile, File()], # 文件流式上传，适合大文件
    token: Annotated[str, Form()],
):
    return {
        "file_size": len(file), # 获取文件大小
        "token": token, # 获取表单参数
        "fileb_content_type": fileb.content_type, # 获取文件类型
    }
```

然后打开浏览器访问 `http://127.0.0.1:8000/docs`，进行测试

![请求表单与文件（截图 1）](/images/blog/fastapi-notes/1782214924928.webp)

## 响应类型与文件返回 ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 实现流式生成、文件下载和自定义响应；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

在FastAPI中，除了默认的JSON响应，你可以通过`response_class`参数或直接返回特定的响应对象，来灵活地返回HTML、文件、纯文本、流媒体等各种类型的内容。

### 响应类型设置方式

在FastAPI中，主要有两种方式来指定非JSON的响应类型：

1. **通过 response_class 参数声明**：在路由装饰器（如 `@app.get()`）中使用 `response_class` 参数，可以声明该接口的响应媒体类型。这会在OpenAPI文档中自动生成相应的说明。
2. **直接返回响应对象**：在路径操作函数中，直接实例化并返回一个具体的响应对象（如 `FileResponse`、`StreamingResponse`）。这种方式更加灵活，适用于需要动态决定响应类型的场景。

### 常用响应类型介绍与实例

#### 1. 返回 HTML 内容

```python
@app.get("/home", response_class=HTMLResponse)
async def get_home():
    return "<h1>Hello, World!</h1>"
```

然后打开浏览器访问 `http://127.0.0.1:8000/docs`，进行测试，返回的是html文件类型

![1. 返回 HTML 内容（截图 1）](/images/blog/fastapi-notes/1782272092883.webp)

#### 2. 返回文件

```python
@app.get("/file")
async def get_file():
    return FileResponse("./files/苹果.png")
```

然后打开浏览器访问 `http://127.0.0.1:8000/docs`，进行测试，返回的是image文件类型

#### 3. 返回流式内容

```python
@app.get("/stream-file")
async def stream_large_file():
    file_path = "./files/苹果落地视频.mp4"
    media_type, _ = mimetypes.guess_type(file_path) # 获取文件类型

    def iterfile():
        with open(file_path, "rb") as file_like:
            # 每次读取 1MB 并 yield 出去
            while chunk := file_like.read(1024 * 1024):  # 1024 * 1024 = 1MB
                yield chunk # yield yield 是 Python 中用来定义生成器（Generator） 的关键字。它可以让一个函数“暂停”并“记住”当前的状态，

    filename = quote(os.path.basename(file_path)) # 对文件名进行 URL 编码
    return StreamingResponse(
        iterfile(),
        media_type=media_type or "application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{filename}"},
    )
```

然后打开浏览器访问 `http://127.0.0.1:8000/docs`，进行测试，返回的是流媒体文件类型

![3. 返回流式内容（截图 1）](/images/blog/fastapi-notes/1782273928813.webp)

#### 4. 请求重定向

```python
@app.get("/redirect")
async def redirect():
    return RedirectResponse(url="https://example.com/")
```

请求 `http://localhost:8000/redirect`,直接跳转 `https://example.com/`

下面汇总常用响应类型。具体代码可参考上面的示例；清单保持简洁，避免在表格中塞入大段代码导致横向滚动。

### FastAPI 响应类型清单与实例

| 响应类型 | 主要用途 | 备注 |
| --- | --- | --- |
| `JSONResponse` | 显式返回 JSON 数据 | 普通字典和列表通常无需手动创建它，FastAPI 会自动序列化 |
| `HTMLResponse` | 返回 HTML 内容 | 可通过 `response_class=HTMLResponse` 声明文档中的媒体类型 |
| `PlainTextResponse` | 返回纯文本 | 适合健康检查、简单文本接口 |
| `FileResponse` | 返回本地文件 | 由 Starlette 高效发送文件，并自动处理部分文件响应头 |
| `StreamingResponse` | 流式发送迭代器或异步迭代器产生的数据 | 适合动态流、实时数据或需要自行控制分块读取的场景 |
| `RedirectResponse` | 返回 HTTP 重定向 | 默认使用 307，可通过 `status_code` 指定其他重定向状态码 |
| `ORJSONResponse` | 使用 `orjson` 进行高性能 JSON 序列化 | 需要先安装 `orjson`；仅在确认序列化是瓶颈时使用 |

## 响应模型与返回类型（response_model） ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 稳定输出契约并过滤不应暴露的字段；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

### 什么是响应模型 (response_model)

在 FastAPI 中，**响应模型**指的是你声明的、用于**规定 API 接口返回数据应遵循的格式和结构**的 Pydantic 模型。你可以通过在路径操作函数的**返回类型注解**或**装饰器的 response_model 参数**来声明它。

### 为什么使用响应模型？

使用响应模型的核心价值在于：

- **数据校验与安全保障**：FastAPI 会自动校验返回的数据是否符合模型定义。如果数据无效（例如缺少必填字段），FastAPI 会返回服务器错误，而不是将错误数据返回给客户端。更重要的是，它会**将输出数据限制并过滤为模型中所定义的内容**，这可以避免意外返回敏感信息（如密码），对安全性至关重要。
- **自动生成 API 文档**：响应模型会为你的 API 生成清晰的 JSON Schema，并自动在 Swagger UI (`/docs`) 等交互式文档中展示，方便前端或第三方开发者查看。
- **数据序列化与过滤**：FastAPI 会使用 Pydantic 将你的返回数据（可以是字典、数据库对象等）自动**序列化**为符合模型的 JSON 格式。同时，你可以利用模型的 `exclude`、`include` 等参数精细控制哪些字段出现在最终的响应中。

我们先看一个数据验证实例：

```python
class Item(BaseModel):
    name: str
    price: float
    # 可选字段，默认值为 None
    tax: float | None = None

# 在装饰器中通过 response_model 指定
@app.post("/create_item/", response_model=Item)
async def create_item(item: Item):
    # 假设这里进行了数据库操作，然后返回一个字典
    # FastAPI 会使用 Item 模型来校验和过滤这个字典
    return {"name": item.name, "price": item.price, "tax": item.tax}
```

如果我们把return里的price属性去掉，就会报错。

![为什么使用响应模型？（截图 1）](/images/blog/fastapi-notes/1782286195373.webp)

![为什么使用响应模型？（截图 2）](/images/blog/fastapi-notes/1782286223513.webp)

我们在看一个比较实用的例子，用户返回信息不带密码，重新定义一个新的用户类UserOut作为返回类型。

```python
class UserIn(BaseModel):
    username: str
    password: str
    full_name: str | None = None


class UserOut(BaseModel):
    username: str
    full_name: str | None = None


@app.post("/user/", response_model=UserOut)
async def create_user(user: UserIn):
    return user
```

然后打开浏览器访问 `http://127.0.0.1:8000/docs`，进行测试

![为什么使用响应模型？（截图 3）](/images/blog/fastapi-notes/1782286649312.webp)

## 异常处理（HTTPException）与响应状态码（status_code） ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 统一表达客户端错误、服务错误和业务失败；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

在 FastAPI 中，**HTTPException** 是一个内置的异常类，用于在 API 处理过程中**主动抛出 HTTP 错误响应**。当你的业务逻辑遇到问题（如资源不存在、权限不足、参数无效等）时，你可以抛出 HTTPException，FastAPI 会捕获它并自动将其转换为符合 HTTP 规范的 JSON 错误响应（包含状态码和详细信息）。

使用 HTTPException 的核心优势：

- **标准化错误响应**：返回标准的 HTTP 状态码和错误信息，方便客户端处理。
- **自动生成文档**：异常信息会出现在 OpenAPI 文档中（如果声明了 `responses`），提高 API 的可理解性。
- **与依赖注入等机制无缝集成**：可以在依赖项、中间件等任何位置抛出。

我们看一个实例：

```python
@app.get("/items/{item_id}")
async def read_item(item_id: int):
    if item_id < 1:
        # 抛出 HTTPException，状态码 400，并附带详细信息
        raise HTTPException(status_code=400, detail="ID必须大于0")
    # 模拟查询，假设只有 id=1 存在
    if item_id != 1:
        raise HTTPException(status_code=404, detail="Item项不存在")
    return {"item_id": item_id, "name": "Sample Item"}
```

参数说明

- `status_code`：HTTP 状态码（如 400、404、403、500 等），可以是整数或 `fastapi.status` 中定义的常量（推荐使用）。
- `detail`：错误描述信息，可以是字符串或可转为 JSON 的对象（如字典、列表）。
- `headers`（可选）：可以添加自定义响应头。

然后打开浏览器访问 `http://127.0.0.1:8000/docs`，进行测试

![异常处理（HTTPException）与响应状态码（status_code）（截图 1）](/images/blog/fastapi-notes/1782288397993.webp)

## 中间件 ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 实现请求追踪、日志、耗时统计和统一安全策略；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

### 1. 什么是中间件

**中间件（Middleware）** 是在 HTTP 请求到达路由处理函数**之前**，以及响应返回客户端**之前**，插入的一层可编程逻辑。

你可以把它理解为请求/响应管道中的「拦截器」：

- **请求阶段**：从外到内依次执行，可对请求做校验、日志、鉴权等
- **响应阶段**：从内到外依次返回，可对响应做压缩、加 Header、统一格式化等

FastAPI 基于 **Starlette** 实现，中间件机制与 Starlette 完全一致。

---

### 2. 中间件工作原理

![2. 中间件工作原理（截图 1）](/images/blog/fastapi-notes/1782373887786.webp)

#### 2.1 核心流程

```text
客户端
  │  HTTP Request
  ▼
┌─────────────────┐
│   Middleware    │  ← 请求进入：预处理（日志、鉴权、计时…）
└────────┬────────┘
         ▼
┌─────────────────┐
│  FastAPI 路由   │  ← 执行业务逻辑（path operation）
└────────┬────────┘
         │  HTTP Response
         ▼
┌─────────────────┐
│   Middleware    │  ← 响应返回：后处理（加 Header、压缩…）
└────────┬────────┘
         ▼
       客户端
```

#### 2.2 关键概念

| 概念        | 说明                                                     |
| ----------- | -------------------------------------------------------- |
| `call_next` | 调用下一个中间件或最终路由，必须 `await`                 |
| 洋葱模型    | 多个中间件像洋葱一样层层包裹，请求由外向内，响应由内向外 |
| ASGI        | FastAPI 是 ASGI 应用，中间件需支持异步                   |

---

### 3. 多个中间件的执行顺序

![3. 多个中间件的执行顺序（截图 1）](/images/blog/fastapi-notes/1782373943672.webp)

#### 3.1 注册顺序与执行顺序

**重要规则：后注册（`add_middleware` 后调用）的中间件，在请求阶段最先执行。**

假设注册顺序为：

```python
app.add_middleware(MiddlewareA)  # 第 1 个注册
app.add_middleware(MiddlewareB)  # 第 2 个注册
app.add_middleware(MiddlewareC)  # 第 3 个注册（最后注册）
```

实际执行顺序：

| 阶段         | 执行顺序         |
| ------------ | ---------------- |
| **请求进入** | C → B → A → 路由 |
| **响应返回** | 路由 → A → B → C |

#### 3.2 洋葱模型示意

```text
        ┌──────────────────────────────┐
        │         Middleware C         │  ← 最后注册，请求最先经过
        │  ┌────────────────────────┐│
        │  │      Middleware B      ││
        │  │  ┌──────────────────┐  ││
        │  │  │   Middleware A   │  ││
        │  │  │  ┌────────────┐  │  ││
        │  │  │  │  路由处理   │  │  ││  ← 核心逻辑
        │  │  │  └────────────┘  │  ││
        │  │  └──────────────────┘  ││
        │  └────────────────────────┘│
        └──────────────────────────────┘

请求：C → B → A → 路由
响应：路由 → A → B → C
```

---

### 4. 中间件的两种实例

我们使用 `@app.middleware("http")`注解即可实现中间件。

我们先看一个简单示例：

```python
@app.middleware("http")
async def my_middleware1(request, call_next):
    print("中间件1 - > 执行前")
    response = await call_next(request)
    print("中间件1 - > 执行后")
    return response

@app.get("/")
async def root():
    return {"message": "你好，FastAPI 333!"}

@app.get("/helloWorld")
async def helloWorld():
    return {"message": "你好，helloWorld !"}
```

浏览器请求 `http://127.0.0.1:8000/helloWorld`

控制台输出：

![4. 中间件的两种实例（截图 1）](/images/blog/fastapi-notes/1782374875053.webp)

我们浏览器再请求下：`http://127.0.0.1:8000/`

控制台输出：

![4. 中间件的两种实例（截图 2）](/images/blog/fastapi-notes/1782375186412.webp)

说明所有请求处理方法都共享中间件

我们再添加一个中间件

```python
@app.middleware("http")
async def my_middleware1(request, call_next):
    print("中间件1 - > 执行前")
    response = await call_next(request)
    print("中间件1 - > 执行后")
    return response

@app.middleware("http")
async def my_middleware2(request, call_next):
    print("中间件2 - > 执行前")
    response = await call_next(request)
    print("中间件2 - > 执行后")
    return response
```

浏览器请求 `http://127.0.0.1:8000/helloWorld`

![4. 中间件的两种实例（截图 3）](/images/blog/fastapi-notes/1782375426299.webp)

验证了后注册中间件的是先执行。

## 依赖注入 ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 复用认证、数据库会话、限流和公共服务；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

### 什么是依赖注入

依赖注入（Dependency Injection, DI）是一种设计模式，核心思想是将**对象的创建与使用分离**，通过外部注入的方式为组件提供所需的依赖，而不是在组件内部直接实例化。

在 FastAPI 中，依赖注入系统让你可以在路径操作函数中**声明**自己需要什么资源（如数据库连接、用户认证、配置等），FastAPI 框架会**自动准备**这些资源并“注入”到你的函数中。

---

### 为什么使用依赖注入

| 优势         | 说明                                                         |
| :----------- | :----------------------------------------------------------- |
| **代码复用** | 将通用逻辑（如认证、数据库连接）抽取为可复用的依赖，避免重复代码 |
| **解耦**     | 业务逻辑与基础设施（数据库、外部服务）分离，降低组件间的耦合度 |
| **简化测试** | 测试时可以轻松 Mock 依赖项，隔离被测代码，无需实际连接数据库或调用外部服务 |
| **类型安全** | 结合 Python 类型注解，支持 IDE 静态检查，避免运行时类型错误  |
| **自动文档** | 依赖参数会自动出现在 Swagger API 文档中                      |

---

### 核心概念

#### 1. `Depends` - 依赖注入的关键

FastAPI 通过 `Depends` 实现依赖注入。你定义一个**依赖函数**（可以是普通函数或异步函数），然后在路径操作函数的参数中使用 `Depends(依赖函数)` 来注入。

#### 2. 依赖函数

依赖函数和普通的路径操作函数几乎一样——它可以接收路径参数、查询参数、请求体等，也可以使用 `async/await`。它的返回值会作为参数传递给路径操作函数。

我们来看一个实例，定义一个公共分页方法 common_parameters，其他地方可以通过Depends注入。

```python
async def common_parameters(
        q: str | None = None,
        skip: int = 0,
        limit: int = 100):
    return {"q": q, "skip": skip, "limit": limit}


@app.get("/items/")
async def read_items(commons: Annotated[dict, Depends(common_parameters)]):
    return commons


@app.get("/users/")
async def read_users():
    return "users info !"
```

浏览器请求：`http://127.0.0.1:8000/docs`,测试下哈。

![2. 依赖函数（截图 1）](/images/blog/fastapi-notes/1782379222677.webp)

## 集成 SQLAlchemy ORM 操作数据库 ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 持久化用户、会话、任务和业务数据；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

FastAPI 是目前非常流行的 Python 异步 Web 框架，而 SQLAlchemy 则是 Python 生态中最强大、最成熟的 ORM（对象关系映射）工具。将两者结合，可以快速构建出高性能、类型安全且易于维护的 Web 应用。本文将从零开始，带你完成 FastAPI 与 SQLAlchemy 的集成，实现数据库的建表及完整的增删改查（CRUD）功能。

### 整体架构

```text
fastapi_pro/
├── main.py              # FastAPI 入口（已有）
├── database.py          # 数据库连接与 Session 管理
├── models/
│   └── item.py          # SQLAlchemy ORM 模型（对应表 t_item）
├── schemas/
│   └── item.py          # Pydantic 模型（请求/响应校验）
├── crud/
│   └── item.py          # 数据库 CRUD 操作
└── routers/
    └── item.py          # Item 相关 API 路由
```

数据流向如下：

```text
HTTP 请求 → FastAPI 路由 → Pydantic 校验 → CRUD 层 → SQLAlchemy Session → MySQL
```

这与项目中已有的写法一致：路由层负责接收参数，Pydantic 负责校验，`HTTPException` 负责错误响应，`response_model` 负责过滤返回字段。

### 一、安装依赖

在项目虚拟环境中安装：

```bash
pip install sqlalchemy pymysql cryptography
```

| 包名           | 作用                       |
| -------------- | -------------------------- |
| `sqlalchemy`   | ORM 框架                   |
| `pymysql`      | MySQL 驱动                 |
| `cryptography` | pymysql 连接加密时可能需要 |

### 二、创建数据库

在 MySQL 中先创建数据库（库名以 `db_` 开头）：

```sql
CREATE DATABASE IF NOT EXISTS db_fastapi_pro
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
```

---

### 三、数据库连接配置

新建 `database.py`，统一管理引擎、Session 与依赖注入：

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# 教学示例直接写出连接串；实际项目应从环境变量读取密码
SQLALCHEMY_DATABASE_URL = (
    "mysql+pymysql://root:123456@127.0.0.1:3308/db_fastapi_pro?charset=utf8mb4"
)

# 创建引擎
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,   # 连接池自动检测断线重连
    pool_recycle=3600,     # 每小时回收连接，避免 MySQL 8 小时超时
)

# Session 工厂
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


# SQLAlchemy 2.0 声明式基类
class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI 依赖：每个请求独立 Session，用完自动关闭"""
    db = SessionLocal()
    try:
        yield db  # 暂停在这里，把 db 交给 FastAPI
    finally:
        db.close()
```

**要点说明：**

- `get_db()` 通过 `yield` 实现资源型依赖注入，可在路由中用 `Depends(get_db)` 获取 Session。
- 每个 HTTP 请求使用独立 Session，避免线程/协程间共享连接。
- `yield` 会把 `get_db()` 变成生成器依赖。FastAPI 按「获取资源 → 执行接口 → 执行清理代码」的顺序运行。

---

### 四、定义 ORM 模型（建表）

新建 `models/item.py`，定义与 `t_item` 表映射的 ORM 类：

```python
from datetime import datetime

from sqlalchemy import String, Float, DateTime, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class ItemModel(Base):
    """物品表 ORM 模型，对应数据库表 t_item"""

    __tablename__ = "t_item"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, comment="主键ID")
    name: Mapped[str] = mapped_column(String(50), nullable=False, comment="物品名称")
    price: Mapped[float] = mapped_column(Float, nullable=False, comment="价格")
    description: Mapped[str | None] = mapped_column(Text, nullable=True, comment="描述")
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, comment="创建时间"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.now, onupdate=datetime.now, comment="更新时间"
    )
```

### 自动建表

在应用启动时执行 `Base.metadata.create_all()`，SQLAlchemy 会根据模型自动创建 `t_item` 表：

```python
from database import engine, Base
from models.item import ItemModel  # 必须导入，否则模型不会注册

# 创建所有表（已存在的表不会重复创建）
Base.metadata.create_all(bind=engine)
```

`create_all()` 适合教学和本地原型；生产项目应使用 Alembic 管理可追踪、可回滚的数据库迁移。

自动建表，刷新sqlyog

![自动建表（截图 1）](/images/blog/fastapi-notes/1782462132760.webp)

![自动建表（截图 2）](/images/blog/fastapi-notes/1782462161975.webp)

等价于执行以下 SQL：

```sql
CREATE TABLE t_item (
    id          INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name        VARCHAR(50)  NOT NULL COMMENT '物品名称',
    price       FLOAT        NOT NULL COMMENT '价格',
    description TEXT         NULL COMMENT '描述',
    created_at  DATETIME     NOT NULL COMMENT '创建时间',
    updated_at  DATETIME     NOT NULL COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### 五、Pydantic 模型（请求/响应）

新建 `schemas/item.py`。字段校验规则参考 `main.py` 中已有的 `ItemCreate`：

```python
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ItemCreate(BaseModel):
    """创建物品时的请求体"""
    name: str = Field(..., min_length=2, max_length=50, description="物品名称，2~50个字符")
    price: float = Field(..., gt=0, le=9999.99, description="价格，必须大于0")
    description: str | None = Field(None, max_length=200, description="可选描述")


class ItemUpdate(BaseModel):
    """更新物品时的请求体（字段均可选）"""
    name: str | None = Field(None, min_length=2, max_length=50)
    price: float | None = Field(None, gt=0, le=9999.99)
    description: str | None = Field(None, max_length=200)


class ItemOut(BaseModel):
    """返回给客户端的数据结构"""
    id: int
    name: str
    price: float
    description: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
```

`from_attributes=True` 允许 Pydantic 直接从 SQLAlchemy ORM 对象读取属性，无需手动转字典。

示例中的价格使用 `float` 便于入门。真实金额应优先使用 Python 的 `Decimal` 和数据库的 `Numeric`，避免浮点精度误差。

---

### 六、CRUD 操作

新建 `crud/item.py`，封装对 `t_item` 表的增删改查：

```python
from sqlalchemy import select
from sqlalchemy.orm import Session

from models.item import ItemModel
from schemas.item import ItemCreate, ItemUpdate


# -------- 增（Create）--------
def create_item(db: Session, item: ItemCreate) -> ItemModel:
    db_item = ItemModel(
        name=item.name,
        price=item.price,
        description=item.description,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


# -------- 查（Read）--------
def get_item(db: Session, item_id: int) -> ItemModel | None:
    return db.get(ItemModel, item_id)


def get_items(db: Session, skip: int = 0, limit: int = 10) -> list[ItemModel]:
    statement = select(ItemModel).offset(skip).limit(limit)
    return list(db.scalars(statement).all())


# -------- 改（Update）--------
def update_item(db: Session, item_id: int, item: ItemUpdate) -> ItemModel | None:
    db_item = get_item(db, item_id)
    if not db_item:
        return None

    update_data = item.model_dump(
        exclude_unset=True)  # 排除未设置的字段  model_dump() 会把模型转成普通字典  exclude_unset=True 是关键：只包含客户端在 JSON 里实际传了的字段，没传的字段不会出现在字典里。
    for field, value in update_data.items():
        setattr(db_item, field, value)  # 设置字段值

    db.commit()
    db.refresh(db_item)
    return db_item


# -------- 删（Delete）--------
def delete_item(db: Session, item_id: int) -> bool:
    db_item = get_item(db, item_id)
    if not db_item:
        return False

    db.delete(db_item)
    db.commit()
    return True

```

### CRUD 对应 SQL 说明

| 操作   | ORM 方法                            | 等价 SQL                                    |
| ------ | ----------------------------------- | ------------------------------------------- |
| 增     | `db.add()` + `db.commit()`          | `INSERT INTO t_item ...`                    |
| 查单条 | `db.get()`                          | 按主键查询                                  |
| 查列表 | `db.scalars(select(...)).all()`     | `SELECT * FROM t_item LIMIT ? OFFSET ?`     |
| 改     | `setattr()` + `db.commit()`         | `UPDATE t_item SET ... WHERE id = ?`        |
| 删     | `db.delete()` + `db.commit()`       | `DELETE FROM t_item WHERE id = ?`           |

---

### 七、FastAPI 路由集成

新建 `routers/item.py`，将 CRUD 暴露为 REST API：

```python
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from crud import item as item_crud
from database import get_db
from schemas.item import ItemCreate, ItemUpdate, ItemOut

router = APIRouter(prefix="/items", tags=["物品管理"])

DbSession = Annotated[Session, Depends(get_db)]


@router.post("/", response_model=ItemOut, summary="新增物品")
def create_item(item: ItemCreate, db: DbSession):
    return item_crud.create_item(db, item)


@router.get("/", response_model=list[ItemOut], summary="物品列表（分页）")
def list_items(
    db: DbSession,
    skip: int = Query(0, ge=0, title="跳过条数"),
    limit: int = Query(10, ge=1, le=100, title="返回条数"),
):
    return item_crud.get_items(db, skip=skip, limit=limit)


@router.get("/{item_id}", response_model=ItemOut, summary="查询单个物品")
def read_item(item_id: int, db: DbSession):
    db_item = item_crud.get_item(db, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item项不存在")
    return db_item


@router.put("/{item_id}", response_model=ItemOut, summary="更新物品")
def update_item(item_id: int, item: ItemUpdate, db: DbSession):
    db_item = item_crud.update_item(db, item_id, item)
    if not db_item:
        raise HTTPException(status_code=404, detail="Item项不存在")
    return db_item


@router.delete("/{item_id}", summary="删除物品")
def remove_item(item_id: int, db: DbSession):
    success = item_crud.delete_item(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item项不存在")
    return {"message": "删除成功", "item_id": item_id}
```

404 错误处理方式与 `main.py` 中 `read_item` 接口一致：

```python
# main.py 中的写法
if item_id != 1:
    raise HTTPException(status_code=404, detail="Item项不存在")
```

---

### 八、注册路由并启动

在 `main.py`（或新建 `main_db.py`）中整合：

```python
from contextlib import asynccontextmanager

from fastapi import FastAPI

from database import engine, Base
from models.item import ItemModel
from routers.item import router as item_router


# 这段代码是 FastAPI 的应用生命周期（lifespan）管理，用来在服务启动时做初始化，在服务关闭时做清理。
@asynccontextmanager # 异步上下文管理器
async def lifespan(app: FastAPI):
    # ===== 启动时执行 =====
    Base.metadata.create_all(bind=engine)
    yield  # 应用运行中...
    # ===== 关闭时执行（Ctrl+C、重启、进程退出）=====
    engine.dispose()  # 释放数据库连接池
    print("应用已关闭")


app = FastAPI(title="FastAPI + SQLAlchemy 示例", lifespan=lifespan)

# 注册路由
app.include_router(item_router)


@app.get("/")
async def root():
    return {"message": "你好，FastAPI + SQLAlchemy!"}
```

启动服务：

```bash
uvicorn main_db:app --reload
```

访问 Swagger 文档：`http://127.0.0.1:8000/docs`

---

### 九、API 测试示例

![九、API 测试示例（截图 1）](/images/blog/fastapi-notes/1782463256143.webp)

新增测试：

![九、API 测试示例（截图 2）](/images/blog/fastapi-notes/1782463338937.webp)

查询测试：

![九、API 测试示例（截图 3）](/images/blog/fastapi-notes/1782463363551.webp)

单个查询：

![九、API 测试示例（截图 4）](/images/blog/fastapi-notes/1782463526714.webp)

更新操作：

![九、API 测试示例（截图 5）](/images/blog/fastapi-notes/1782463578792.webp)

删除测试：

![九、API 测试示例（截图 6）](/images/blog/fastapi-notes/1782463622976.webp)

## CORS 跨域配置 ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 支持浏览器前后端分离并限制可信来源；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

在前后端分离的架构中，前端（如 Vue、React）和后端（FastAPI）通常部署在不同的域名或端口下。浏览器出于安全考虑，会阻止跨域请求，这就是**跨域资源共享（CORS, Cross-Origin Resource Sharing）** 问题。

### 什么是 CORS

CORS 是一种浏览器安全机制，用于控制哪些外部域名可以访问你的 API。当前端从 `http://localhost:3000` 请求后端 `http://localhost:8000/api` 时，如果后端没有配置 CORS，浏览器会报错：

```text
Access to fetch at 'http://localhost:8000/api' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

### FastAPI 中配置 CORS

FastAPI 提供了 `CORSMiddleware` 中间件来处理跨域问题：

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 配置允许的源
origins = [
    "http://localhost:3000",      # 本地开发前端
    "http://localhost:8080",      # 备用前端端口
    "https://yourapp.com",        # 生产环境域名
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           # 允许的源列表
    allow_credentials=True,          # 允许携带 Cookie
    allow_methods=["*"],             # 允许所有 HTTP 方法（GET、POST 等）
    allow_headers=["*"],             # 允许所有请求头
)

@app.get("/api/items")
async def get_items():
    return {"items": ["item1", "item2"]}
```

### 参数说明

| 参数                  | 说明                                                         | 推荐值                        |
| --------------------- | ------------------------------------------------------------ | ----------------------------- |
| `allow_origins`       | 允许访问的域名列表。`["*"]` 表示允许所有域（**生产环境禁用**） | 明确指定域名列表              |
| `allow_credentials`   | 是否允许请求携带 Cookie、Authorization 等凭证                | `True`（需要认证时）          |
| `allow_methods`       | 允许的 HTTP 方法                                             | `["*"]` 或 `["GET", "POST"]`  |
| `allow_headers`       | 允许的请求头                                                 | `["*"]` 或明确指定            |
| `expose_headers`      | 允许前端访问的响应头                                         | 如 `["X-Total-Count"]`        |
| `max_age`             | 预检请求（OPTIONS）的缓存时间（秒）                          | `3600`（1小时）               |

### 开发环境 vs 生产环境

**开发环境**（快速测试）：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],         # 仅适合不携带凭证的公开接口
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

需要携带 Cookie 等凭证时，即使在开发环境也应明确列出源，例如 `http://localhost:3000`，不要使用通配符 `*`。

**生产环境**（安全配置）：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourapp.com",
        "https://admin.yourapp.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=3600,
)
```

## 后台任务（Background Tasks） ★★★

> 🧩 **学习优先级：补充掌握**
> **使用位置：** 处理轻量、无需可靠队列的响应后任务；**学习要求：** 能读懂并知道何时使用，项目需要时可快速落地。

在某些场景下，你希望在返回响应给客户端**之后**再执行一些耗时操作（如发送邮件、记录日志、清理缓存），而不让用户等待。FastAPI 的 `BackgroundTasks` 可以优雅地实现这一需求。

### 使用场景

- 发送邮件通知（用户注册成功后发送欢迎邮件）
- 记录操作日志到数据库
- 异步处理文件上传（如图片压缩、格式转换）
- 清理临时文件或过期数据

### 基础用法

```python
from fastapi import FastAPI, BackgroundTasks

app = FastAPI()

def write_log(message: str):
    """后台任务函数：写入日志"""
    with open("log.txt", "a") as f:
        f.write(f"{message}\n")

@app.post("/send-notification/")
async def send_notification(email: str, background_tasks: BackgroundTasks):
    # 立即返回响应
    background_tasks.add_task(write_log, f"邮件已发送到 {email}")
    return {"message": "通知已排队发送"}
```

**执行流程：**
1. 用户请求 `/send-notification/`
2. 接口立即返回 `{"message": "通知已排队发送"}`
3. 响应发送后，后台执行 `write_log()` 函数

### 传递多个参数

```python
def send_email(email: str, subject: str, body: str):
    print(f"发送邮件到 {email}：{subject}")
    # 实际发送逻辑...

@app.post("/register/")
async def register_user(username: str, email: str, background_tasks: BackgroundTasks):
    # 模拟用户注册
    background_tasks.add_task(send_email, email, "欢迎注册", f"欢迎 {username}！")
    return {"message": "注册成功"}
```

### 添加多个后台任务

```python
@app.post("/process/")
async def process_data(background_tasks: BackgroundTasks):
    background_tasks.add_task(write_log, "任务1：数据处理开始")
    background_tasks.add_task(write_log, "任务2：发送通知")
    background_tasks.add_task(write_log, "任务3：清理缓存")
    return {"message": "处理中"}
```

### 注意事项

- **不适合长时间任务**：任务在响应发送后由同一个应用进程继续执行，会占用该进程资源，不适合长时间或 CPU 密集型操作。
- **不保证可靠性**：如果服务器在任务执行中崩溃，任务会丢失。生产环境建议使用 **Celery** 或 **RQ** 等专业任务队列。
- **异步任务**：如果后台函数是异步的（`async def`），FastAPI 会自动用 `await` 调用。

## WebSocket 实时通信 ★★★

> 🧩 **学习优先级：补充掌握**
> **使用位置：** 实现双向实时交互和 Agent 进度推送；**学习要求：** 能读懂并知道何时使用，项目需要时可快速落地。

WebSocket 是一种在客户端和服务器之间建立**持久连接**的协议，支持**全双工通信**（双向实时传输数据），非常适合聊天应用、实时推送、在线协作等场景。

### WebSocket vs HTTP

| 特性       | HTTP                     | WebSocket              |
| ---------- | ------------------------ | ---------------------- |
| 连接方式   | 请求-响应（短连接）      | 持久连接（长连接）     |
| 通信方向   | 单向（客户端主动请求）   | 双向（服务器可主动推送）|
| 延迟       | 每次请求都需要建立连接   | 低延迟（连接保持打开） |
| 适用场景   | 传统 API、RESTful 接口   | 聊天、实时推送、游戏   |

### FastAPI 实现 WebSocket

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()  # 接受连接
    try:
        while True:
            # 接收客户端消息
            data = await websocket.receive_text()
            # 发送响应
            await websocket.send_text(f"服务器收到: {data}")
    except WebSocketDisconnect:
        print("客户端断开连接")
```

### 前端测试代码（HTML）

```html
<!DOCTYPE html>
<html>
<head><title>WebSocket 测试</title></head>
<body>
    <h1>WebSocket 实时通信</h1>
    <input id="messageInput" type="text" placeholder="输入消息">
    <button onclick="sendMessage()">发送</button>
    <div id="messages"></div>

    <script>
        const ws = new WebSocket("ws://localhost:8000/ws");
        
        ws.onmessage = function(event) {
            const messages = document.getElementById('messages');
            messages.innerHTML += '<p>' + event.data + '</p>';
        };

        function sendMessage() {
            const input = document.getElementById('messageInput');
            ws.send(input.value);
            input.value = '';
        }
    </script>
</body>
</html>
```

### 聊天室示例（多人通信）

```python
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List

app = FastAPI()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        """广播消息给所有连接"""
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f"客户端 {client_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"客户端 {client_id} 离开了聊天室")
```

## 安全认证（OAuth2 + JWT） ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 保护接口并建立用户身份与权限边界；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

在生产环境中，API 通常需要验证用户身份。FastAPI 提供 OAuth2 的请求解析与依赖工具；JWT 的签发和校验由 PyJWT 等专用库完成。

### 认证流程

1. 用户提交用户名和密码
2. 服务器验证成功后，生成 JWT Token
3. 客户端在后续请求中携带 Token（通常放在 `Authorization: Bearer <token>` 头中）
4. 服务器验证 Token 合法性，返回数据

### 安装依赖

```bash
pip install "pyjwt[crypto]" "pwdlib[argon2]" python-multipart
```

### 完整示例

```python
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from pydantic import BaseModel

# ========== 配置 ==========
SECRET_KEY = "your-secret-key-keep-it-safe"  # 生产环境使用环境变量
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# 密码哈希工具（推荐配置当前使用 Argon2）
password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

# ========== 模拟数据库 ==========
fake_users_db = {
    "admin": {
        "username": "admin",
        "hashed_password": password_hash.hash("admin123"),
        "email": "admin@example.com",
    }
}

# ========== 数据模型 ==========
class Token(BaseModel):
    access_token: str
    token_type: str

class User(BaseModel):
    username: str
    email: str

# ========== 工具函数 ==========
def verify_password(plain_password, hashed_password):
    return password_hash.verify(plain_password, hashed_password)

def get_user(username: str):
    if username in fake_users_db:
        return fake_users_db[username]

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user or not verify_password(password, user["hashed_password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证凭证",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception
    
    user = get_user(username)
    if user is None:
        raise credentials_exception
    return User(username=user["username"], email=user["email"])

# ========== 路由 ==========
@app.post("/token", response_model=Token)
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=User)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user

@app.get("/protected")
async def protected_route(current_user: Annotated[User, Depends(get_current_user)]):
    return {"message": f"你好, {current_user.username}！这是受保护的资源"}
```

生产环境不要把 `SECRET_KEY` 写在源码中，应从环境变量读取，并使用密码学安全的随机值。例如可运行 `python -c "import secrets; print(secrets.token_hex(32))"` 生成密钥。

### 测试流程

1. **获取 Token**：POST 请求 `/token`，表单数据：`username=admin&password=admin123`
2. **访问受保护路由**：GET 请求 `/protected`，添加请求头：`Authorization: Bearer <你的token>`

## 静态文件服务 ★

> 👀 **学习优先级：了解即可**
> **使用位置：** 小型管理页或原型需要时按需使用；**学习要求：** 建立概念边界，不必首次记忆细节，需要时再查询。

FastAPI 可以轻松提供静态文件服务（如图片、CSS、JavaScript 文件），适合前后端混合部署或提供媒体文件下载。

### 挂载静态文件目录

```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# 挂载静态文件目录
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return {"message": "访问 /static/image.png 查看静态文件"}
```

**目录结构：**

```text
fastapi_pro/
├── main.py
└── static/
    ├── image.png
    ├── style.css
    └── script.js
```

访问 `http://localhost:8000/static/image.png` 即可查看图片。

### 返回 HTML 页面

```python
from fastapi.responses import HTMLResponse

@app.get("/", response_class=HTMLResponse)
async def read_root():
    return """
    <html>
        <head><title>FastAPI</title></head>
        <body>
            <h1>欢迎使用 FastAPI</h1>
            <img src="/static/image.png" />
        </body>
    </html>
    """
```

## 配置管理（Settings） ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 隔离环境配置、密钥和部署参数；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

生产环境中，数据库密码、API 密钥等敏感信息不应硬编码在代码中，应通过**环境变量**管理。FastAPI 推荐使用 `pydantic-settings` 来实现配置管理。

### 安装依赖

```bash
pip install pydantic-settings
```

### 创建配置文件

新建 `config.py`：

```python
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "FastAPI 应用"
    database_url: str
    secret_key: str
    debug: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

settings = Settings()
```

### 创建 `.env` 文件

```dotenv
DATABASE_URL=mysql+pymysql://root:123456@localhost:3306/db_fastapi_pro
SECRET_KEY=your-secret-key-change-in-production
DEBUG=true
```

### 在应用中使用

```python
from fastapi import FastAPI
from config import settings

app = FastAPI(title=settings.app_name, debug=settings.debug)

@app.get("/info")
async def info():
    return {
        "app_name": settings.app_name,
        "debug": settings.debug,
    }
```

**注意：** `.env` 文件应添加到 `.gitignore`，不要提交到版本控制。

## 生产部署 ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 正确设置进程、容器、代理和运行环境；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

### 使用 Uvicorn + Gunicorn

在 Linux 生产环境中，可以使用 Gunicorn 管理多个 Uvicorn Worker：

```bash
pip install gunicorn uvicorn-worker
gunicorn main:app -w 4 -k uvicorn_worker.UvicornWorker --bind 0.0.0.0:8000
```

- `-w 4`：启动 4 个工作进程
- `-k uvicorn_worker.UvicornWorker`：使用独立的 Uvicorn Worker 包；旧的 `uvicorn.workers` 模块已弃用
- Gunicorn 不原生支持 Windows；Windows 本地测试可使用 `uvicorn main:app --workers 4`

### 使用 Docker 部署

**Dockerfile：**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**构建并运行：**

```bash
docker build -t fastapi-app .
docker run -d -p 8000:8000 fastapi-app
```

### 使用 Nginx 反向代理

**nginx.conf：**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 最佳实践总结 ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 组织项目结构并完成性能、安全和发布检查；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

### 项目结构建议

```text
fastapi_pro/
├── app/
│   ├── __init__.py
│   ├── main.py              # 应用入口
│   ├── config.py            # 配置管理
│   ├── database.py          # 数据库连接
│   ├── models/              # ORM 模型
│   ├── schemas/             # Pydantic 模型
│   ├── crud/                # 数据库操作
│   ├── routers/             # API 路由
│   ├── dependencies.py      # 依赖注入
│   └── utils.py             # 工具函数
├── tests/                   # 测试文件
├── static/                  # 静态文件
├── .env                     # 环境变量（不提交）
├── .gitignore
├── requirements.txt
└── README.md
```

### 开发规范

1. **使用类型注解**：充分利用 Python 类型提示，提高代码可维护性
2. **响应模型过滤**：使用 `response_model` 避免返回敏感信息
3. **依赖注入复用**：将通用逻辑（认证、数据库连接）抽取为依赖
4. **异常统一处理**：使用 `HTTPException` 返回标准错误
5. **环境变量管理**：敏感信息通过 `.env` 配置，不硬编码
6. **API 版本管理**：使用路由前缀区分版本（如 `/api/v1/`）
7. **日志记录**：使用 Python `logging` 模块记录关键操作
8. **编写测试**：使用 `pytest` + `TestClient` 进行单元测试

### 性能优化建议

- 使用**异步数据库驱动**（如 `asyncpg`、`aiomysql`）
- 启用 **API 响应缓存**（如 Redis）
- 使用 **连接池**管理数据库连接
- 启用 **压缩中间件**（Gzip）减少传输大小
- 配置 **限流中间件**防止 API 滥用
- 使用 **CDN** 加速静态文件访问

---

**总结：** 这份笔记梳理了 FastAPI 的核心知识体系，从基础的路由参数到生产级的安全认证和部署方案。FastAPI 的高性能、易用性和自动文档生成特性，使其成为构建现代 Web API 的首选框架。建议结合实际项目进行实践，深入理解异步编程、依赖注入和数据库操作的最佳实践。
