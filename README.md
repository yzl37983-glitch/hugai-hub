<div align="center">
# HugAi 🤖
  
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)
![LangGraph](https://img.shields.io/badge/LangGraph-0.1-green)

**轻量级、极简配置的企业级 AI 智能体中台**
<br/>
*A Modern, Lightweight Interface for Orchestrating Multi-Agent Systems.*

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [架构模式](#-核心架构模式) • [配置指南](#-配置指南)

</div>

---

## 📖 简介 (Introduction)

**HugAi** 是一个现代化的全栈 AI Agent 平台。它旨在弥合复杂的后端逻辑（基于 LangGraph）与最终用户体验之间的鸿沟。

通过 HugAi，你可以通过可视化界面配置智能体团队，观察它们的**思维链 (Chain of Thought)**，并支持在 **Multi-Agent（多智能体协作）**、**Agentic Loop（深度思考）** 和 **Workflow（线性工作流）** 三种模式间无缝切换。

## ✨ 功能特性 (Features)

*   **🧠 可视化思维链 (Visual CoT)**: 实时展示 Agent 的规划、工具调用、反思和执行步骤，不再是黑盒。
*   **🎨 三大编排模式**: 开箱即用的 Supervisor 协作组、ReAct 独立智能体和顺序工作流。
*   **🔌 模型/厂商无关**: 支持 OpenAI, Anthropic, DeepSeek 以及本地 **Ollama** 模型的一键切换。
*   **🛠️ 工具注册中心**: 集中管理 API 工具（Web Search, Calculator, RAG 等），支持自定义 Tool ID。
*   **📚 RAG 知识库管理**: 模拟向量数据库的文件上传、切片与索引状态管理。
*   **🌗 现代 UI 设计**: 基于 React 19 + Tailwind CSS 构建，支持深色/浅色模式切换，响应式布局。
*   **🕸️ 强大的后端**: 基于 **LangGraph** 和 **FastAPI** 构建，支持复杂的图编排和流式输出。

## 🏗 核心架构模式 (Core Paradigms)

HugAi 支持 2026 年主流的三种 AI 交互范式：

### 1. Multi-Agent Team (协作模式)
采用 **Supervisor-Worker** 架构。
*   **原理**: 用户指令 -> Supervisor (意图识别) -> 路由给 Search/RAG/Chat Agent。
*   **场景**: 复杂的综合性任务，如“帮我查一下特斯拉股价并写一份简报”。

### 2. Agentic Loop (自主模式)
基于 **System 2 (慢思考)** 理论。
*   **原理**: 单体智能体内部运行 ReAct (Reason+Act) 循环。
*   **流程**: 思考 (Plan) -> 执行 (Act) -> 观察 (Observe) -> 反思 (Reflect) -> 修正。
*   **场景**: 需要深度推理、数学计算或代码生成的任务。

### 3. Workflow (工作流模式)
确定性的 **Sequential Chain**。
*   **原理**: Step 1 输出 -> Step 2 输入 -> Step 3 输出。
*   **场景**: 标准化作业流程（SOP），如“大纲生成 -> 内容扩写 -> 润色翻译”。

## 🚀 快速开始 (Getting Started)

本项目采用前后端分离架构。

### 前置要求
*   Node.js >= 18
*   Python >= 3.10

### 1. 启动后端 (Python / LangGraph)

后端负责运行 LLM 逻辑和 Agent 图编排。

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 配置环境变量 (推荐复制 .env.example)
# export OPENAI_API_KEY=sk-...

# 启动服务器 (默认端口 8000)
python server.py
```

启动成功后，访问 `http://localhost:8000/docs` 可查看 API 文档。

### 2. 启动前端 (React)

前端负责界面交互和配置管理。

```bash
# 回到项目根目录
npm install

# 启动开发服务器
npm start
```

打开浏览器访问 `http://localhost:3000` 即可开始使用。

> **提示**: 默认情况下，前端使用 `mockAgentService.ts` 进行演示。如需连接真实后端，请在前端代码中切换 API 调用逻辑。

## ⚙️ 配置指南 (Configuration)

### 前端配置
点击侧边栏的 **“系统配置”** 进入设置面板：
1.  **模型设置**: 选择厂商 (OpenAI / Ollama) 和模型名称。
2.  **方案管理**: 动态添加/删除子智能体，修改 System Prompt。
3.  **工具箱**: 注册新工具，Tool ID 需与后端函数名对应。

### 后端配置 (`backend/config.yaml`)
后端行为由配置文件驱动：

```yaml
llm:
  provider: "openai"
  model: "gpt-4-turbo"

agents:
  supervisor:
    name: "Supervisor"
  workers:
    - name: "SearchAgent"
      tools: ["duckduckgo_search"]
```

## 📂 项目结构

```text
root/
├── backend/                  # Python 后端
│   ├── core/                 # 核心逻辑 (State, Tools)
│   ├── graph/                # LangGraph 图定义 (Nodes, Workflow)
│   ├── config.yaml           # 后端配置文件
│   └── server.py             # FastAPI / LangServe 入口
├── src/                      # React 前端
│   ├── components/           # UI 组件 (ChatMessage, SettingsPanel)
│   ├── services/             # API 服务 (Mock & Real)
│   ├── types.ts              # 类型定义
│   └── App.tsx               # 主入口
├── public/
└── README.md
```

## 🤝 贡献 (Contributing)

欢迎提交 PR！
1.  Fork 本仓库
2.  创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3.  提交更改 (`git commit -m 'Add some AmazingFeature'`)
4.  推送到分支 (`git push origin feature/AmazingFeature`)
5.  开启 Pull Request

## 📄 许可证 (License)

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

<div align="center">
  Built with ❤️ for the AI Agent Community.
</div>
