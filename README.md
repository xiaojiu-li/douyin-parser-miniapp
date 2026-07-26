# 抖音解析小程序

基于 Taro + NestJS 的抖音视频解析工具,支持 H5 与微信小程序双端。

## 功能

- 粘贴抖音分享链接,一键解析视频元信息
- 展示视频封面、标题、作者、点赞/播放数
- 复制无水印视频链接
- 本地历史记录(最近 5 条)
- 深色主题(品牌色 `#fe2c55` / `#25f4ee`)

## 技术栈

- **前端**:Taro 4 + React 18 + TypeScript + Tailwind CSS 4
- **UI 组件**:自实现的 shadcn/ui 风格组件库(`src/components/ui/*`)
- **图标**:`lucide-react-taro`
- **后端**:NestJS 10 + Axios
- **包管理**:pnpm(强制)

## 目录结构

```
/workspace
├── src/                         # Taro 前端源码
│   ├── app.tsx                  # 应用入口
│   ├── app.config.ts            # Taro 全局配置
│   ├── app.css                  # 全局样式 + Tailwind 入口
│   ├── components/ui/           # shadcn/ui 风格组件库
│   ├── lib/utils.ts             # cn() 等工具函数
│   ├── network.ts               # 网络请求封装(自动拼接 PROJECT_DOMAIN)
│   ├── pages/index/             # 抖音解析首页
│   ├── types/                   # 共享类型定义
│   └── utils/                   # 业务工具函数
├── projects/server/             # NestJS 后端
│   ├── src/
│   │   ├── app.module.ts        # 根模块
│   │   ├── app.controller.ts    # /api、/api/health
│   │   ├── douyin/              # 抖音解析模块
│   │   │   ├── douyin.controller.ts   # POST /api/douyin/parse
│   │   │   ├── douyin.service.ts      # 解析逻辑
│   │   │   └── dto/parse.dto.ts       # 请求校验
│   │   ├── types/
│   │   └── main.ts              # 服务入口(端口 3000)
│   └── tsconfig.json
├── config/                      # Taro 构建配置
├── nest-cli.json                # NestJS CLI 配置
├── .github/workflows/
│   ├── ci.yml                   # CI:build + 启动验证
│   └── run.yml                  # 手动触发:启动服务 5 分钟
└── package.json
```

## 本地开发

```bash
# 1. 安装依赖
pnpm install

# 2. 同时启动前端 H5 + 后端服务
pnpm dev
# 前端:http://localhost:5000
# 后端:http://localhost:3000/api

# 或者分别启动:
pnpm dev:h5       # 仅前端
pnpm dev:server   # 仅后端
```

## 生产构建

```bash
pnpm build        # 构建后端 + H5
pnpm start        # 启动后端服务
```

## 在 GitHub 上运行

### 方式 1:CI 自动验证

推送到 `main` / `master` 分支或发起 PR 时,`.github/workflows/ci.yml` 会自动:
1. 安装依赖
2. 构建后端 + H5
3. 启动后端服务
4. 调用 `/api/health` 与 `/api/douyin/parse` 验证
5. 上传构建产物作为 artifact

### 方式 2:手动启动服务

在仓库 **Actions** 标签页选择 `Run Server` workflow,点击 `Run workflow`:
- 可指定运行时长(1-10 分钟,默认 5 分钟)
- Runner 会启动 NestJS 服务并打印健康检查结果
- 注意:GitHub-hosted runner 不对外暴露端口,该 workflow 主要用于验证服务可启动

## API 文档

### `GET /api`

返回服务标识字符串。

### `GET /api/health`

```json
{ "status": "ok", "uptime": 12.34, "ts": 1785041596000 }
```

### `POST /api/douyin/parse`

请求体:
```json
{ "text": "抖音分享文本,含 v.douyin.com 短链" }
```

响应:
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "title": "视频标题",
    "cover": "https://...",
    "videoUrl": "https://...",
    "authorName": "作者昵称",
    "authorAvatar": "https://...",
    "likeCount": 1234,
    "playCount": 5678,
    "desc": "原始分享文案"
  }
}
```

## 免责声明

本项目仅供学习交流使用,请勿用于商业用途或大量抓取。使用本项目产生的任何法律责任由使用者自行承担。
