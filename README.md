# sirius-xz-agent-ui

`sirius-xz-agent-ui` 是 `sirius-xz-agent` 的前端控制台，覆盖 Agent 概览、问答交互、知识库管理和接口调试。

## 技术栈

- React 18
- Vite
- TypeScript
- 原生 CSS

## 本地启动

```bash
cd projects/sirius-xz-agent-ui
npm install
npm run dev
```

默认开发代理会把以下路径转发到 `http://localhost:8081`：

- `/api`
- `/actuator`

## 后端依赖

项目默认消费 `sirius-xz-agent` 的这些接口：

- `GET /api/agent/summary`
- `GET /api/agent/ask`
- `GET /api/knowledge/documents`
- `POST /api/knowledge/documents`
- `GET /api/knowledge/documents/{id}`

如果后端未启动，前端会自动退回到本地 mock 数据，便于先看 UI 和交互。

## 环境变量

可选设置：

- `VITE_API_BASE_URL`：后端基础地址，默认使用相对路径

## 设计说明

正式设计文档位于：

- `docs/superpowers/specs/2026-04-17-sirius-xz-agent-ui-design.md`
