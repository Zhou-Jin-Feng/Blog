---
title: "Docker 完全学习指南"
description: "从零系统学习 Docker：镜像与容器、进阶用法、容器管理、Docker Compose、清理维护和常见问题。"
publishDate: "2026-08-26"
tags: ["Docker", "部署"]
aiAssisted: true
template: false
---

> 从零开始系统学习 Docker，掌握容器化技术核心能力

## 📌 阅读优先级

> 星级直接写在正文主要章节标题中，用于表示第一次学习应投入的精力；低星级不代表内容无价值。

| 星级 | 分类 | 建议学习深度 |
|---|---|---|
| ★★★★★ | 重点掌握 | 理解原理，能运行、修改、组合并排查常见问题 |
| ★★★ | 补充掌握 | 能读懂并知道何时使用，项目需要时可快速落地 |
| ★ | 了解即可 | 建立概念边界，需要时查询，不必投入大量时间记忆 |

> 建议先完成所有五星章节，再补三星章节；一星章节可在遇到对应场景时查阅。

### ★★★★★ 重点掌握

1. **镜像与容器基础操作（第1.2-1.3节）**
   - 应用场景：打包LLM应用、部署到服务器、本地测试环境
   - 为什么重要：Docker是现代应用部署的标准方式，不会Docker很难部署应用
   - 核心命令：
     - `docker pull nginx`：拉取镜像
     - `docker run -d -p 8080:80 nginx`：后台运行容器并映射端口
     - `docker ps`：查看运行中的容器
     - `docker stop/start`：停止/启动容器
     - `docker rm/rmi`：删除容器/镜像
   - 核心概念：镜像是模板（静态），容器是运行实例（动态）

2. **端口映射（第1.3节）**
   - 应用场景：FastAPI应用监听8000端口，外部访问需要映射
   - 为什么重要：不映射端口外部无法访问容器内的服务
   - 核心语法：`-p 宿主机端口:容器端口`
   - 实战示例：
     ```bash
     # FastAPI应用
     docker run -d -p 8000:8000 my-llm-app
     
     # 多个端口
     docker run -d -p 8000:8000 -p 6379:6379 redis
     ```
   - 常见问题：端口冲突（宿主机端口已被占用）

3. **数据持久化（Volume挂载）（第2.1节）**
   - 应用场景：保存向量数据库、对话历史、模型文件、日志
   - 为什么重要：容器删除后数据会丢失，必须挂载Volume持久化
   - 两种方式：
     - Volume挂载：`-v mydata:/app/data`（Docker管理）
     - 本地目录挂载：`-v /host/path:/container/path`（直接映射）
   - 实战示例：
     ```bash
     # 挂载向量数据库数据
     docker run -d -p 6333:6333 \
       -v qdrant_data:/qdrant/storage \
       qdrant/qdrant
     
     # 挂载本地代码目录（开发调试）
     docker run -d -p 8000:8000 \
       -v $(pwd):/app \
       my-llm-app
     ```

4. **Dockerfile编写（第2.5节）**
   - 应用场景：把自己的LLM应用打包成镜像
   - 为什么重要：有了镜像才能一键部署，不需要手动配置环境
   - 核心指令：
     - `FROM python:3.11`：基础镜像
     - `WORKDIR /app`：工作目录
     - `COPY . .`：复制代码
     - `RUN pip install -r requirements.txt`：安装依赖
     - `CMD ["python", "main.py"]`：启动命令
   - 实战示例：
     ```dockerfile
     FROM python:3.11-slim
     WORKDIR /app
     COPY requirements.txt .
     RUN pip install --no-cache-dir -r requirements.txt
     COPY . .
     CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]
     ```
   - 优化技巧：多阶段构建、优先选择兼容性更稳的 slim 镜像、清理缓存；只有依赖已验证兼容时再考虑 Alpine

5. **Docker Compose多容器编排（第4章）**
   - 应用场景：LLM应用 + 向量数据库 + Redis缓存一起启动
   - 为什么重要：实际项目通常需要多个服务配合，手动启动容器太繁琐
   - 核心配置：
     ```yaml
     version: '3.8'
     services:
       app:
         build: .
         ports:
           - "8000:8000"
         environment:
           - OPENAI_API_KEY=${OPENAI_API_KEY}
         depends_on:
           - qdrant
           - redis
       
       qdrant:
         image: qdrant/qdrant
         ports:
           - "6333:6333"
         volumes:
           - qdrant_data:/qdrant/storage
       
       redis:
         image: redis:alpine
         ports:
           - "6379:6379"
     
     volumes:
       qdrant_data:
     ```
   - 核心命令：
     - `docker-compose up -d`：启动所有服务
     - `docker-compose down`：停止并删除
     - `docker-compose logs -f app`：查看日志

6. **日志查看与调试（第3.2节）**
   - 应用场景：应用报错、性能问题定位、查看运行状态
   - 为什么重要：容器内部运行，不看日志无法排查问题
   - 核心命令：
     - `docker logs -f container_id`：实时查看日志
     - `docker exec -it container_id bash`：进入容器内部
     - `docker stats`：查看资源占用
   - 实战技巧：
     ```bash
     # 查看最近100行日志
     docker logs --tail 100 my-app
     
     # 进入容器检查文件
     docker exec -it my-app bash
     ls /app
     cat /app/logs/error.log
     ```

7. **环境变量管理（第2.3节）**
   - 应用场景：配置API Key、数据库连接、模型参数
   - 为什么重要：敏感信息不能写死在代码里，必须用环境变量
   - 三种方式：
     - `-e KEY=VALUE`：命令行传参
     - `--env-file .env`：从文件读取
     - docker-compose.yml的environment
   - 实战示例：
     ```bash
     # 命令行
     docker run -e OPENAI_API_KEY=sk-xxx my-app
     
     # 文件
     docker run --env-file .env my-app
     
     # .env文件内容
     OPENAI_API_KEY=sk-xxx
     QDRANT_URL=http://qdrant:6333
     ```

### ★★★ 补充掌握

1. **自动重启策略（第1.3节）**
   - 实用场景：应用崩溃、服务器重启后自动恢复
   - 重启策略：`--restart=always`（总是重启）
   - 价值：避免半夜服务挂了没人重启

2. **资源限制（第2.4节）**
   - 实用场景：防止某个容器占满CPU/内存导致其他服务崩溃
   - 核心参数：`--memory=2g --cpus=1.5`
   - 价值：资源隔离、防止雪崩

3. **镜像优化（第2.5节）**
   - 实用价值：减小镜像体积、加快拉取速度、降低存储成本
   - 优化技巧：
     - 使用Alpine基础镜像（体积小）
     - 多阶段构建（编译和运行分离）
     - 清理pip缓存（--no-cache-dir）
     - 合并RUN指令减少层数

4. **网络通信（第2.2节）**
   - 实用场景：容器间互相调用（App调用向量数据库）
   - 核心概念：同一网络下容器可以通过服务名访问
   - 实战：docker-compose自动创建网络，服务名即域名

5. **清理与维护（第5章）**
   - 实用场景：磁盘空间不足、清理未使用的镜像/容器
   - 核心命令：
     - `docker system prune -a`：清理所有未使用资源
     - `docker volume prune`：清理未使用的Volume
   - 建议：定期清理避免磁盘爆满

### ★ 了解即可

1. **Docker网络模式详解** - bridge/host/none等，默认够用
2. **Docker Swarm集群** - 多机部署、服务扩展，单机够用暂时不需要
3. **私有镜像仓库** - Harbor搭建，企业内部才需要
4. **安全加固** - 镜像扫描、最小权限，生产环境运维负责

---

## 第一章：Docker 核心基础 ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 构建、运行、检查和管理应用容器；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

### 1.1 Docker 简介

Docker 是一个开源的容器化平台，它允许开发者将应用程序及其依赖打包到一个轻量级、可移植的容器中。

**核心概念：**
- **镜像（Image）**：只读模板，包含运行应用所需的所有内容
- **容器（Container）**：镜像的运行实例，是应用的实际运行环境
- **仓库（Registry）**：存储和分发镜像的服务（如 Docker Hub）

### 1.2 镜像管理命令

#### 1.2.1 搜索镜像

```bash
# 在 Docker Hub 搜索镜像
docker search nginx

# 搜索官方镜像
docker search --filter "is-official=true" nginx
```

#### 1.2.2 拉取镜像

```bash
# 拉取最新版本
docker pull nginx

# 拉取指定版本
docker pull nginx:1.25

# 拉取指定平台镜像
docker pull --platform linux/amd64 nginx
```

#### 1.2.3 查看本地镜像

```bash
# 列出所有镜像
docker images

# 查看镜像详细信息
docker image inspect nginx

# 查看镜像历史层
docker history nginx
```

#### 1.2.4 删除镜像

```bash
# 删除单个镜像
docker rmi nginx:1.25

# 删除多个镜像
docker rmi nginx redis

# 强制删除（即使有容器在使用）
docker rmi -f nginx

# 删除未使用的镜像
docker image prune
```

#### 1.2.5 镜像标签管理

```bash
# 为镜像添加新标签
docker tag nginx:latest mynginx:v1.0

# 推送到仓库（需先登录）
docker login
docker push mynginx:v1.0
```

### 1.3 容器管理命令

#### 1.3.1 创建和运行容器

```bash
# 运行容器（前台运行）
docker run nginx

# 后台运行容器
docker run -d nginx

# 指定容器名称
docker run -d --name my-nginx nginx

# 端口映射：宿主机端口:容器端口
docker run -d -p 8080:80 nginx

# 多个端口映射
docker run -d -p 8080:80 -p 8443:443 nginx

# 自动重启策略
docker run -d --restart=always nginx
```

**常用 restart 策略：**
- `no`：不自动重启（默认）
- `on-failure`：容器异常退出时重启
- `always`：总是重启
- `unless-stopped`：除非手动停止，否则总是重启

#### 1.3.2 查看容器

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括已停止）
docker ps -a

# 查看最近创建的容器
docker ps -l

# 只显示容器 ID
docker ps -q

# 查看容器详细信息
docker inspect my-nginx
```

#### 1.3.3 容器生命周期管理

```bash
# 启动已停止的容器
docker start my-nginx

# 停止运行中的容器
docker stop my-nginx

# 强制停止容器
docker kill my-nginx

# 重启容器
docker restart my-nginx

# 暂停容器
docker pause my-nginx

# 恢复暂停的容器
docker unpause my-nginx

# 删除容器（必须先停止）
docker rm my-nginx

# 强制删除运行中的容器
docker rm -f my-nginx

# 删除所有已停止的容器
docker container prune
```

#### 1.3.4 容器交互

```bash
# 进入运行中的容器（推荐）
docker exec -it my-nginx bash

# 如果容器没有 bash，使用 sh
docker exec -it my-nginx sh

# 在容器中执行单个命令
docker exec my-nginx ls /usr/share/nginx/html

# 以 root 用户进入容器
docker exec -it --user root my-nginx bash

# 附加到容器的标准输出（不推荐用于交互）
docker attach my-nginx
```

**exec vs attach 的区别：**
- `exec`：在容器中启动新进程，退出不会停止容器
- `attach`：附加到容器主进程，退出会停止容器

---

## 第二章：进阶用法 ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 处理持久化、网络、配置、资源限制和镜像构建；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

### 2.1 数据卷（Volume）管理

容器数据默认存储在可写层，容器删除后数据丢失。Volume 用于持久化数据。

#### 2.1.1 Volume 基础操作

```bash
# 创建命名数据卷
docker volume create my-volume

# 查看所有数据卷
docker volume ls

# 查看数据卷详细信息
docker volume inspect my-volume

# 删除数据卷
docker volume rm my-volume

# 清理未使用的数据卷
docker volume prune
```

#### 2.1.2 使用 Volume

```bash
# 使用命名数据卷
docker run -d -v my-volume:/usr/share/nginx/html --name nginx1 nginx

# 使用匿名数据卷
docker run -d -v /usr/share/nginx/html --name nginx2 nginx

# 绑定挂载（Bind Mount）：宿主机路径:容器路径
docker run -d -v /home/user/html:/usr/share/nginx/html nginx

# Windows 路径示例
docker run -d -v C:/Users/user/html:/usr/share/nginx/html nginx

# 只读挂载
docker run -d -v my-volume:/usr/share/nginx/html:ro nginx
```

**三种挂载方式对比：**

| 类型 | 语法 | 适用场景 |
|------|------|----------|
| Volume | `-v volume-name:/path` | 生产环境数据持久化 |
| Bind Mount | `-v /host/path:/container/path` | 开发环境代码同步 |
| tmpfs | `--tmpfs /path` | 临时数据，不需要持久化 |

#### 2.1.3 Volume 高级用法

```bash
# 使用 --mount 语法（更明确）
docker run -d \
  --mount source=my-volume,target=/usr/share/nginx/html \
  nginx

# 多个数据卷
docker run -d \
  -v volume1:/data1 \
  -v volume2:/data2 \
  nginx

# 从其他容器挂载数据卷
docker run -d --name nginx1 -v my-volume:/data nginx
docker run -d --name nginx2 --volumes-from nginx1 nginx
```

### 2.2 网络管理

Docker 提供多种网络模式，用于容器间通信和外部访问。

#### 2.2.1 网络基础命令

```bash
# 查看所有网络
docker network ls

# 查看网络详细信息
docker network inspect bridge

# 创建自定义网络
docker network create my-network

# 删除网络
docker network rm my-network

# 清理未使用的网络
docker network prune
```

#### 2.2.2 网络模式

```bash
# bridge 模式（默认）：容器有独立网络命名空间
docker run -d --network bridge nginx

# host 模式：容器使用宿主机网络
docker run -d --network host nginx

# none 模式：容器无网络
docker run -d --network none nginx

# container 模式：共享其他容器的网络
docker run -d --name nginx1 nginx
docker run -d --network container:nginx1 busybox
```

#### 2.2.3 自定义网络

```bash
# 创建自定义桥接网络
docker network create --driver bridge my-bridge

# 指定子网和网关
docker network create \
  --driver bridge \
  --subnet 172.20.0.0/16 \
  --gateway 172.20.0.1 \
  my-custom-network

# 在自定义网络中运行容器
docker run -d --network my-custom-network --name web nginx
docker run -d --network my-custom-network --name db mysql

# 容器加入网络
docker network connect my-custom-network my-container

# 容器断开网络
docker network disconnect my-custom-network my-container
```

**自定义网络的优势：**
- 自动 DNS 解析：容器可通过容器名互相访问
- 更好的隔离性
- 可动态连接/断开网络

### 2.3 环境变量

```bash
# 传递单个环境变量
docker run -d -e MYSQL_ROOT_PASSWORD=secret mysql

# 传递多个环境变量
docker run -d \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=mydb \
  -e MYSQL_USER=user \
  mysql

# 从文件加载环境变量
# 创建 env.list 文件
# MYSQL_ROOT_PASSWORD=secret
# MYSQL_DATABASE=mydb
docker run -d --env-file env.list mysql

# 查看容器环境变量
docker exec my-container env
```

### 2.4 资源限制

限制容器资源使用，防止单个容器占用过多资源。

#### 2.4.1 内存限制

```bash
# 限制内存为 512MB
docker run -d -m 512m nginx

# 限制内存和交换分区
docker run -d -m 512m --memory-swap 1g nginx

# 内存预留（软限制）
docker run -d --memory-reservation 256m nginx
```

#### 2.4.2 CPU 限制

```bash
# 限制 CPU 份额（相对权重）
docker run -d --cpu-shares 512 nginx

# 限制 CPU 核心数
docker run -d --cpus 1.5 nginx

# 指定使用的 CPU 核心
docker run -d --cpuset-cpus 0,1 nginx
```

#### 2.4.3 综合示例

```bash
# 综合资源限制
docker run -d \
  --name limited-container \
  -m 512m \
  --cpus 1.0 \
  --restart unless-stopped \
  nginx
```

### 2.5 Dockerfile 编写

Dockerfile 是构建自定义镜像的脚本文件。

#### 2.5.1 基础指令

```dockerfile
# 基础镜像
FROM nginx:latest

# 维护者信息
LABEL maintainer="your-email@example.com"

# 工作目录
WORKDIR /app

# 复制文件
COPY index.html /usr/share/nginx/html/

# 添加文件（支持 URL 和自动解压）
ADD app.tar.gz /app/

# 运行命令（构建时执行）
RUN apt-get update && apt-get install -y curl

# 环境变量
ENV APP_ENV=production

# 暴露端口
EXPOSE 80 443

# 数据卷
VOLUME /data

# 启动命令（容器运行时执行）
CMD ["nginx", "-g", "daemon off;"]
```

#### 2.5.2 多阶段构建

```dockerfile
# 第一阶段：构建
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 第二阶段：运行
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2.5.3 构建镜像

```bash
# 基础构建
docker build -t myapp:v1.0 .

# 指定 Dockerfile
docker build -f Dockerfile.prod -t myapp:prod .

# 使用构建参数
docker build --build-arg VERSION=1.0 -t myapp:v1.0 .

# 不使用缓存
docker build --no-cache -t myapp:v1.0 .
```

#### 2.5.4 Dockerfile 最佳实践

```dockerfile
# 1. 使用具体版本标签
FROM node:18.17-alpine

# 2. 合并 RUN 命令减少层数
RUN apt-get update && \
    apt-get install -y curl vim && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# 3. 使用 .dockerignore 排除不必要文件
# .dockerignore 文件内容：
# node_modules
# .git
# *.log

# 4. 利用构建缓存，将变化少的指令放前面
COPY package*.json ./
RUN npm install
COPY . .

# 5. 使用非 root 用户运行
RUN useradd -m myuser
USER myuser

# 6. 使用 ENTRYPOINT + CMD 组合
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
```

---

## 第三章：容器管理进阶 ★★★

> 🧩 **学习优先级：补充掌握**
> **使用位置：** 按需诊断容器状态、日志、资源和镜像迁移；**学习要求：** 能读懂并知道何时使用，项目需要时可快速落地。

### 3.1 容器辅助命令

#### 3.1.1 复制文件

```bash
# 从容器复制到宿主机
docker cp my-container:/path/to/file.txt /local/path/

# 从宿主机复制到容器
docker cp /local/path/file.txt my-container:/path/to/

# 复制目录
docker cp my-container:/app /local/backup/
```

#### 3.1.2 查看容器统计信息

```bash
# 实时查看容器资源使用
docker stats

# 查看指定容器
docker stats my-container

# 查看所有容器（包括已停止）
docker stats --all

# 不实时更新，只显示一次
docker stats --no-stream
```

#### 3.1.3 查看容器进程

```bash
# 查看容器内进程
docker top my-container

# 查看容器端口映射
docker port my-container
```

### 3.2 日志管理

#### 3.2.1 查看容器日志

```bash
# 查看全部日志
docker logs my-container

# 实时跟踪日志（类似 tail -f）
docker logs -f my-container

# 显示最近 100 行
docker logs --tail 100 my-container

# 显示时间戳
docker logs -t my-container

# 查看特定时间段日志
docker logs --since 2024-01-01T00:00:00 my-container
docker logs --since 1h my-container
```

#### 3.2.2 日志驱动配置

```bash
# 使用 JSON 文件日志驱动（默认）
docker run -d --log-driver json-file nginx

# 限制日志大小
docker run -d \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  nginx

# 使用 syslog
docker run -d --log-driver syslog nginx

# 禁用日志
docker run -d --log-driver none nginx
```

### 3.3 容器监控

#### 3.3.1 查看容器变更

```bash
# 查看容器文件系统变更
docker diff my-container
```

输出说明：
- `A`：文件或目录被添加
- `C`：文件或目录被修改
- `D`：文件或目录被删除

#### 3.3.2 容器事件监控

```bash
# 实时监控 Docker 事件
docker events

# 过滤特定容器事件
docker events --filter container=my-container

# 过滤事件类型
docker events --filter event=start
docker events --filter event=stop
```

### 3.4 容器导出与导入

```bash
# 导出容器为 tar 文件
docker export my-container > container-backup.tar

# 导入 tar 文件为镜像
docker import container-backup.tar myimage:v1.0

# 保存镜像为 tar 文件
docker save -o nginx-image.tar nginx:latest

# 加载镜像 tar 文件
docker load -i nginx-image.tar
```

**export/import vs save/load 的区别：**
- `export/import`：导出容器，丢失历史和元数据
- `save/load`：保存镜像，保留完整历史和元数据

---

## 第四章：Docker Compose ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 编排 API、数据库、向量库和缓存等多服务环境；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

Docker Compose 是用于定义和运行多容器 Docker 应用的工具。

### 4.1 Docker Compose 基础

#### 4.1.1 安装 Docker Compose

```bash
# Linux 安装
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

Docker Desktop (Windows/Mac) 自带 Docker Compose。

#### 4.1.2 基础 docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html
    networks:
      - my-network

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: mydb
    volumes:
      - db-data:/var/lib/mysql
    networks:
      - my-network

networks:
  my-network:
    driver: bridge

volumes:
  db-data:
```

#### 4.1.3 Compose 常用命令

```bash
# 启动所有服务（后台运行）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs

# 实时跟踪日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs web

# 停止所有服务
docker-compose stop

# 停止并删除容器、网络
docker-compose down

# 停止并删除容器、网络、数据卷
docker-compose down -v

# 重启服务
docker-compose restart

# 重新构建镜像
docker-compose build

# 构建并启动
docker-compose up -d --build
```

### 4.2 Compose 进阶配置

#### 4.2.1 使用 Dockerfile 构建

```yaml
version: '3.8'

services:
  app:
    build:
      context: ./app
      dockerfile: Dockerfile
      args:
        - VERSION=1.0
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
```

#### 4.2.2 依赖关系

```yaml
version: '3.8'

services:
  web:
    image: nginx
    depends_on:
      - app
      - db

  app:
    image: myapp
    depends_on:
      - db

  db:
    image: postgres
```

#### 4.2.3 健康检查

```yaml
version: '3.8'

services:
  db:
    image: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

#### 4.2.4 资源限制

```yaml
version: '3.8'

services:
  app:
    image: myapp
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 4.3 完整示例：WordPress + MySQL

```yaml
version: '3.8'

services:
  wordpress:
    image: wordpress:latest
    container_name: my-wordpress
    restart: always
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db
      WORDPRESS_DB_USER: wordpress
      WORDPRESS_DB_PASSWORD: wordpress_password
      WORDPRESS_DB_NAME: wordpress_db
    volumes:
      - wordpress-data:/var/www/html
    depends_on:
      - db
    networks:
      - wp-network

  db:
    image: mysql:8.0
    container_name: my-mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: wordpress_db
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress_password
    volumes:
      - db-data:/var/lib/mysql
    networks:
      - wp-network

volumes:
  wordpress-data:
  db-data:

networks:
  wp-network:
    driver: bridge
```

使用方法：
```bash
# 保存为 docker-compose.yml
# 启动服务
docker-compose up -d

# 访问 http://localhost:8080
```

---

## 第五章：清理与维护 ★★★

> 🧩 **学习优先级：补充掌握**
> **使用位置：** 控制磁盘占用、日志增长和无用资源；**学习要求：** 能读懂并知道何时使用，项目需要时可快速落地。

Docker 使用过程中会积累大量未使用的镜像、容器、网络和数据卷，需要定期清理。

### 5.1 查看 Docker 磁盘使用

```bash
# 查看 Docker 占用的磁盘空间
docker system df

# 详细查看
docker system df -v
```

输出示例：
```
TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE
Images          10        5         2.5GB     1.2GB (48%)
Containers      15        3         500MB     300MB (60%)
Local Volumes   5         2         1GB       500MB (50%)
Build Cache     20        0         800MB     800MB (100%)
```

### 5.2 清理命令

#### 5.2.1 清理容器

```bash
# 删除所有已停止的容器
docker container prune

# 强制删除（不提示确认）
docker container prune -f

# 删除特定时间之前的容器
docker container prune --filter "until=24h"
```

#### 5.2.2 清理镜像

```bash
# 删除未使用的镜像（悬空镜像）
docker image prune

# 删除所有未使用的镜像（包括未被任何容器使用的）
docker image prune -a

# 删除特定时间之前的镜像
docker image prune -a --filter "until=48h"
```

#### 5.2.3 清理网络

```bash
# 删除未使用的网络
docker network prune

# 强制删除
docker network prune -f
```

#### 5.2.4 清理数据卷

```bash
# 删除未使用的数据卷（谨慎操作！）
docker volume prune

# 强制删除
docker volume prune -f
```

#### 5.2.5 一键清理

```bash
# 清理所有未使用的对象（容器、镜像、网络、构建缓存）
docker system prune

# 清理所有未使用的对象（包括数据卷）
docker system prune --volumes

# 清理所有未使用的对象（包括使用中的镜像）
docker system prune -a

# 完全清理（谨慎使用！）
docker system prune -a --volumes -f
```

### 5.3 定期维护脚本

```bash
#!/bin/bash
# docker-cleanup.sh - Docker 定期清理脚本

echo "开始清理 Docker..."

# 清理已停止的容器
echo "清理已停止的容器..."
docker container prune -f

# 清理悬空镜像
echo "清理悬空镜像..."
docker image prune -f

# 清理未使用的网络
echo "清理未使用的网络..."
docker network prune -f

# 清理未使用的构建缓存
echo "清理构建缓存..."
docker builder prune -f

# 显示清理后的磁盘使用情况
echo "清理完成！当前磁盘使用情况："
docker system df

echo "Docker 清理完成！"
```

使用方法：
```bash
chmod +x docker-cleanup.sh
./docker-cleanup.sh
```

### 5.4 监控最佳实践

```bash
# 定期检查 Docker 磁盘使用
# 添加到 crontab，每天凌晨 2 点执行
# crontab -e
# 0 2 * * * /path/to/docker-cleanup.sh >> /var/log/docker-cleanup.log 2>&1

# 设置日志轮转
# 在 /etc/docker/daemon.json 中配置
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# 重启 Docker 服务使配置生效
sudo systemctl restart docker
```

---

## 第六章：学习路线图 ★★★

> 🧩 **学习优先级：补充掌握**
> **使用位置：** 规划练习顺序和部署能力提升路径；**学习要求：** 能读懂并知道何时使用，项目需要时可快速落地。

### 6.1 初级阶段（1-2 周）

**目标：掌握 Docker 基础操作**

#### 学习内容
1. Docker 概念理解
   - 镜像、容器、仓库的关系
   - Docker 架构和工作原理
   
2. 基础命令练习
   - 镜像操作：pull、images、rmi
   - 容器操作：run、ps、stop、rm
   - 容器交互：exec、logs

#### 实践项目
```bash
# 项目 1：运行一个 Nginx 静态网站
docker run -d -p 8080:80 -v $(pwd)/html:/usr/share/nginx/html nginx

# 项目 2：运行 MySQL 数据库
docker run -d \
  --name my-mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -v mysql-data:/var/lib/mysql \
  -p 3306:3306 \
  mysql:8.0

# 项目 3：进入容器调试
docker exec -it my-mysql bash
mysql -u root -p
```

#### 学习检查清单
- [ ] 能够搜索和拉取镜像
- [ ] 能够启动、停止、删除容器
- [ ] 理解端口映射的作用
- [ ] 能够进入容器执行命令
- [ ] 能够查看容器日志

### 6.2 中级阶段（2-3 周）

**目标：掌握 Docker 进阶特性**

#### 学习内容
1. 数据持久化
   - Volume 的三种挂载方式
   - 数据卷管理和备份
   
2. 网络管理
   - 理解 Docker 网络模式
   - 自定义网络和容器通信
   
3. Dockerfile 编写
   - 常用指令和最佳实践
   - 多阶段构建优化镜像大小

#### 实践项目
```dockerfile
# 项目 4：构建自定义 Node.js 应用镜像
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm install --production
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```bash
# 项目 5：自定义网络和容器通信
docker network create my-app-network
docker run -d --name db --network my-app-network postgres
docker run -d --name app --network my-app-network myapp
# app 容器中可以通过 db 主机名访问数据库
```

#### 学习检查清单
- [ ] 能够使用 Volume 持久化数据
- [ ] 理解不同网络模式的区别
- [ ] 能够创建自定义网络
- [ ] 能够编写基础 Dockerfile
- [ ] 能够构建自定义镜像

### 6.3 高级阶段（3-4 周）

**目标：掌握生产环境最佳实践**

#### 学习内容
1. Docker Compose
   - 多容器应用编排
   - 环境变量和配置管理
   
2. 镜像优化
   - 减小镜像体积
   - 安全最佳实践
   
3. 监控和日志
   - 容器监控
   - 日志管理和聚合

#### 实践项目
```yaml
# 项目 6：完整的微服务应用
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - app-network

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/mydb
    depends_on:
      - db
      - redis
    networks:
      - app-network

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=mydb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    networks:
      - app-network

networks:
  app-network:

volumes:
  db-data:
```

#### 学习检查清单
- [ ] 能够使用 Docker Compose 编排多容器应用
- [ ] 理解镜像优化技巧
- [ ] 能够实现容器日志管理
- [ ] 能够监控容器资源使用
- [ ] 理解容器安全最佳实践

### 6.4 专家阶段（持续学习）

**目标：深入理解 Docker 生态**

#### 扩展方向
1. **容器编排**
   - Kubernetes 基础
   - Docker Swarm
   
2. **CI/CD 集成**
   - GitLab CI/CD + Docker
   - Jenkins + Docker
   
3. **镜像仓库**
   - 搭建私有 Registry
   - Harbor 企业级仓库
   
4. **安全加固**
   - 镜像扫描（Trivy、Clair）
   - 运行时安全（AppArmor、SELinux）

### 6.5 学习资源推荐

#### 官方文档
- Docker 官方文档：https://docs.docker.com/
- Docker Hub：https://hub.docker.com/

#### 在线练习
- Play with Docker：https://labs.play-with-docker.com/
- Katacoda Docker 课程：https://www.katacoda.com/courses/docker

#### 书籍推荐
- 《Docker 从入门到实践》
- 《Docker 容器与容器云》
- 《Kubernetes 权威指南》

---

## 第七章：常见问题 FAQ ★★★★★

> 🔥 **学习优先级：重点掌握**
> **使用位置：** 定位容器退出、端口、网络、数据和安全问题；**学习要求：** 理解原理，能独立修改、组合使用并排查常见问题。

### 7.1 安装和配置

**Q1: Docker 和 Docker Desktop 有什么区别？**

A: 
- Docker Engine：核心引擎，Linux 原生支持
- Docker Desktop：适用于 Windows/Mac 的图形化工具，内置 Docker Engine

**Q2: Windows 上 Docker Desktop 无法启动怎么办？**

A: 
```bash
# 检查 WSL2 是否启用
wsl --list --verbose

# 更新 WSL2
wsl --update

# 确保已启用虚拟化（BIOS 设置）
# Intel: VT-x
# AMD: AMD-V
```

**Q3: 如何配置 Docker 镜像加速器？**

A: 编辑 `/etc/docker/daemon.json`（Linux）或 Docker Desktop 设置（Windows/Mac）：
```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://registry.docker-cn.com"
  ]
}
```

重启 Docker：
```bash
sudo systemctl restart docker
```

### 7.2 容器运行问题

**Q4: 容器启动后立即退出？**

A: 
```bash
# 查看容器退出原因
docker logs <container-id>

# 查看容器详细信息
docker inspect <container-id>

# 常见原因：
# 1. 容器内主进程执行完毕
# 2. 配置错误（环境变量、挂载路径）
# 3. 端口冲突
```

**Q5: 如何查看容器内运行的进程？**

A:
```bash
# 查看容器进程
docker top <container-name>

# 进入容器查看
docker exec -it <container-name> ps aux
```

**Q6: 端口已被占用怎么办？**

A:
```bash
# Linux/Mac 查看端口占用
sudo lsof -i :8080

# Windows 查看端口占用
netstat -ano | findstr :8080

# 更换端口或停止占用进程
docker run -d -p 8081:80 nginx
```

### 7.3 数据和网络

**Q7: 容器删除后数据丢失怎么办？**

A: 使用 Volume 持久化数据：
```bash
# 创建命名数据卷
docker volume create my-data

# 使用数据卷
docker run -d -v my-data:/data nginx

# 即使容器删除，数据卷仍然保留
```

**Q8: 容器之间无法通信？**

A:
```bash
# 检查容器是否在同一网络
docker network inspect bridge

# 使用自定义网络
docker network create my-network
docker run -d --name web --network my-network nginx
docker run -d --name app --network my-network myapp

# app 容器中可以通过 "web" 主机名访问 nginx
```

**Q9: 如何备份和恢复数据卷？**

A:
```bash
# 备份数据卷
docker run --rm \
  -v my-volume:/source \
  -v $(pwd):/backup \
  alpine tar czf /backup/volume-backup.tar.gz -C /source .

# 恢复数据卷
docker run --rm \
  -v my-volume:/target \
  -v $(pwd):/backup \
  alpine tar xzf /backup/volume-backup.tar.gz -C /target
```

### 7.4 镜像问题

**Q10: 镜像拉取速度慢或失败？**

A:
```bash
# 1. 配置镜像加速器（见 Q3）
# 2. 使用代理
docker pull --platform linux/amd64 nginx

# 3. 手动下载镜像 tar 包并导入
docker load -i nginx.tar
```

**Q11: 如何减小镜像体积？**

A:
```dockerfile
# 1. 使用 alpine 基础镜像
FROM node:18-alpine

# 2. 多阶段构建
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:18-alpine
COPY --from=builder /app/dist ./dist

# 3. 清理缓存
RUN apt-get update && apt-get install -y curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 4. 合并 RUN 命令
RUN command1 && command2 && command3
```

**Q12: 悬空镜像（dangling images）是什么？**

A:
```bash
# 悬空镜像：没有标签的镜像，通常是构建过程中的中间镜像
# 查看悬空镜像
docker images -f dangling=true

# 删除悬空镜像
docker image prune
```

### 7.5 Docker Compose

**Q13: docker-compose 和 docker compose 有什么区别？**

A:
- `docker-compose`：独立的 Python 工具（V1，已弃用）
- `docker compose`：Docker CLI 插件（V2，推荐使用）

```bash
# 两者命令基本相同
docker-compose up -d
docker compose up -d  # 推荐
```

**Q14: Compose 文件中环境变量如何使用？**

A:
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    image: myapp
    environment:
      - DB_HOST=${DB_HOST:-localhost}  # 默认值
      - DB_PORT=${DB_PORT}
```

```bash
# .env 文件
DB_HOST=database
DB_PORT=5432

# 启动时会自动读取 .env 文件
docker compose up -d
```

**Q15: 如何查看 Compose 服务的日志？**

A:
```bash
# 查看所有服务日志
docker compose logs

# 查看特定服务
docker compose logs web

# 实时跟踪
docker compose logs -f web

# 最近 100 行
docker compose logs --tail 100
```

### 7.6 性能和资源

**Q16: Docker 占用磁盘空间过大？**

A:
```bash
# 查看磁盘使用
docker system df

# 清理未使用的资源
docker system prune -a --volumes

# 配置日志大小限制
# /etc/docker/daemon.json
{
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

**Q17: 如何限制容器资源使用？**

A:
```bash
# 限制内存和 CPU
docker run -d \
  --memory 512m \
  --cpus 1.0 \
  nginx

# 查看容器资源使用
docker stats
```

**Q18: 容器性能监控工具推荐？**

A:
```bash
# 1. docker stats（内置）
docker stats

# 2. cAdvisor（Google 开源）
docker run -d \
  -p 8080:8080 \
  -v /:/rootfs:ro \
  -v /var/run:/var/run:ro \
  -v /sys:/sys:ro \
  -v /var/lib/docker/:/var/lib/docker:ro \
  google/cadvisor:latest

# 3. Portainer（Web UI）
docker run -d \
  -p 9000:9000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  portainer/portainer-ce
```

### 7.7 安全问题

**Q19: Docker 容器安全吗？**

A: 
容器提供一定程度的隔离，但不是完全隔离。安全最佳实践：

```bash
# 1. 使用非 root 用户运行
docker run -d --user 1000:1000 nginx

# 2. 只读根文件系统
docker run -d --read-only nginx

# 3. 限制能力
docker run -d --cap-drop ALL --cap-add NET_BIND_SERVICE nginx

# 4. 使用官方镜像
docker pull nginx:1.25  # 指定版本

# 5. 扫描镜像漏洞
docker scan nginx:latest
```

**Q20: 如何保护敏感信息（密码、密钥）？**

A:
```bash
# 1. 使用 Docker Secrets（Swarm 模式）
echo "my_secret_password" | docker secret create db_password -

# 2. 使用环境变量文件（不提交到版本控制）
docker run --env-file .env.local myapp

# 3. 使用外部密钥管理系统
# - HashiCorp Vault
# - AWS Secrets Manager
# - Azure Key Vault
```

---

## 附录：快速参考 ★★★

> 🧩 **学习优先级：补充掌握**
> **使用位置：** 开发和部署时快速查询命令；**学习要求：** 能读懂并知道何时使用，项目需要时可快速落地。

### 常用命令速查表

```bash
# 镜像操作
docker pull <image>          # 拉取镜像
docker images                # 列出镜像
docker rmi <image>           # 删除镜像
docker build -t <name> .     # 构建镜像

# 容器操作
docker run -d <image>        # 后台运行容器
docker ps                    # 查看运行中的容器
docker ps -a                 # 查看所有容器
docker stop <container>      # 停止容器
docker start <container>     # 启动容器
docker restart <container>   # 重启容器
docker rm <container>        # 删除容器

# 容器交互
docker exec -it <container> bash  # 进入容器
docker logs -f <container>        # 查看日志
docker cp <src> <dst>             # 复制文件

# 网络和数据卷
docker network ls            # 列出网络
docker volume ls             # 列出数据卷
docker network create <name> # 创建网络
docker volume create <name>  # 创建数据卷

# 清理命令
docker system prune          # 清理未使用的资源
docker image prune           # 清理未使用的镜像
docker container prune       # 清理停止的容器

# Compose 命令
docker compose up -d         # 启动服务
docker compose down          # 停止服务
docker compose logs -f       # 查看日志
docker compose ps            # 查看服务状态
```

### 资源链接

- **官方文档**: https://docs.docker.com/
- **Docker Hub**: https://hub.docker.com/
- **社区论坛**: https://forums.docker.com/
- **GitHub**: https://github.com/docker

---

## 结语 ★

> 👀 **学习优先级：了解即可**
> **使用位置：** 回顾学习方向，不需要单独投入时间记忆；**学习要求：** 建立概念边界，不必首次记忆细节，需要时再查询。

Docker 是现代应用开发和部署的基础工具。通过本指南的系统学习，你应该能够：

 ✅ 理解 Docker 核心概念和工作原理  
	✅ 熟练使用 Docker 命令管理容器和镜像  
	✅ 编写 Dockerfile 构建自定义镜像  
	✅ 使用 Docker Compose 编排多容器应用  
	✅ 掌握生产环境的最佳实践  

**下一步学习方向：**
- Kubernetes 容器编排
- CI/CD 集成实践
- 微服务架构设计
- 云原生应用开发

**持续学习建议：**
- 多动手实践，从简单项目开始
- 关注官方博客和社区动态
- 参与开源项目，学习最佳实践
- 考虑获得 Docker 认证（DCA）

祝你学习顺利，容器化之旅愉快！🐳

---

**文档版本**: v1.0  
**最后更新**: 2026-08-03  
**作者**: Claude AI  
**许可**: 本文档采用 CC BY-SA 4.0 许可协议
