# HugAi 🤖

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)

**轻量级、极简配置的 AI 智能体编排中台**
<br/>
*A Modern, Lightweight Interface for Orchestrating Multi-Agent Systems.*

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [架构模式](#-核心架构模式) • [配置指南](#-配置指南)

</div>

---

## 📖 简介 (Introduction)

**HugAi** 是一个现代化的 AI Agent 前端控制台。它旨在弥合复杂的后端逻辑（如 LangGraph, AutoGen）与最终用户体验之间的鸿沟。

通过 HugAi，你可以通过可视化界面配置智能体团队，观察它们的**思维链 (Chain of Thought)**，并支持在 **Multi-Agent（多智能体协作）**、**Agentic Loop（深度思考）** 和 **Workflow（线性工作流）** 三种模式间无缝切换。

## ✨ 功能特性 (Features)

*   **🧠 可视化思维链 (Visual CoT)**: 实时展示 Agent 的规划、工具调用、反思和执行步骤，不再是黑盒。
*   **🎨 三大编排模式**: 开箱即用的 Supervisor 协作组、ReAct 独立智能体和顺序工作流。
*   **🔌 模型/厂商无关**: 支持 OpenAI, Anthropic, DeepSeek 以及本地 **Ollama** 模型的一键切换。
*   **🛠️ 工具注册中心**: 集中管理 API 工具（Web Search, Calculator, RAG 等），支持自定义 Tool ID。
*   **📚 RAG 知识库管理**: 模拟向量数据库的文件上传、切片与索引状态管理。
*   **🌗 现代 UI 设计**: 基于 Tailwind CSS 构建，支持深色/浅色模式切换，响应式布局。

## 🏗 核心架构模式 (Core Paradigms)

HugAi 不仅仅是一个聊天窗口，它支持 2026 年主流的三种 AI 交互范式：

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

### 前置要求
*   Node.js >= 18
*   npm 或 yarn

### 安装

```bash
# 1. 克隆项目
git clone https://github.com/your-username/hugai-web.git
cd hugai-web

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm start
打开浏览器访问 http://localhost:3000 即可看到界面。
注意: 当前版本包含一个完整的 MockAgentService，您可以在不连接真实后端 LLM 的情况下体验所有 UI 交互和流程。
⚙️ 配置指南 (Configuration)
点击侧边栏的 “系统配置” 进入设置面板：
模型设置:
选择厂商 (OpenAI / Ollama / DeepSeek)。
输入 API Key 和 Base URL (本地 Ollama 请填 http://localhost:11434/v1)。
方案管理 (Schemes):
点击 + 创建新方案。
选择模式 (Multi-Agent / Agentic / Workflow)。
在右侧面板动态添加/删除子智能体或步骤节点。
工具箱:
注册新的 Tool，确保 Tool ID 与后端 Python 函数名一致（例如 duckduckgo_search）。
📂 项目结构
code
Text  文本
src/
├── components/
│   ├── ChatMessage.tsx       # 消息气泡组件
│   ├── ThinkingProcess.tsx   # 思维链可视化核心组件 (✨Core)
│   ├── SettingsPanel.tsx     # 配置与编排面板 (✨Core)
│   └── KnowledgeBase.tsx     # RAG 知识库界面
├── services/
│   └── mockAgentService.ts   # 模拟后端流式响应与逻辑
├── types.ts                  # 全局类型定义 (Agent, Solution, Mode)
└── App.tsx                   # 主入口与状态管理
🤝 贡献 (Contributing)  🤝 贡献
欢迎提交 PR！
Fork 本仓库
创建你的特性分支 (git checkout -b feature/AmazingFeature)
提交更改 (git commit -m 'Add some AmazingFeature')
推送到分支 (git push origin feature/AmazingFeature)
开启 Pull Request
📄 许可证 (License)
本项目采用 MIT 许可证 - 查看 LICENSE 文件了解详情。
<div align="center">
Built with ❤️ for the AI Agent Community.
为 AI Agent 社区用心打造。
</div>
