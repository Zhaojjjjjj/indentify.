<div align="center">
  <h1>🔍 img Identify</h1>
  <p>基于 AI 的智能图像识别系统</p>

<img src="https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue.js">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Element_Plus-2.x-409EFF?style=for-the-badge&logo=element&logoColor=white" alt="Element Plus">
</div>

## ✨ 项目简介

**img Identify** 是一个现代化的 Web 应用程序，利用先进的机器学习模型为用户提供实时的图像物体检测服务。通过简洁直观的界面，用户可以轻松上传图片并获得准确的物体识别结果。

### 🎯 核心特性

- **🚀 实时检测** - 基于 Web Worker 的异步处理，确保流畅的用户体验
- **🎨 现代界面** - 采用 TailwindCSS 和 Element Plus 构建的响应式设计
- **🌐 多语言支持** - 智能中英文标签映射，本地化显示检测结果
- **📱 响应式设计** - 完美适配桌面端和移动端设备
- **⚡ 高性能** - 基于 Vite 构建，支持热重载和快速开发
- **🔧 TypeScript** - 完整的类型安全保障

### 🛠️ 技术栈

| 技术         | 版本 | 用途       |
| ------------ | ---- | ---------- |
| Vue.js       | 3.x  | 前端框架   |
| TypeScript   | 5.x  | 类型安全   |
| Vite         | 5.x  | 构建工具   |
| TailwindCSS  | 3.x  | 样式框架   |
| Element Plus | 2.x  | UI 组件库  |
| UnoCSS       | -    | 原子化 CSS |
| Animate.css  | -    | 动画效果   |

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0

### 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 📁 项目结构

```
img-identify/
├── src/
│   ├── components/          # Vue 组件
│   │   ├── HeaderBar.vue    # 顶部导航栏
│   │   ├── UploadArea.vue   # 文件上传区域
│   │   └── ImagePreview.vue # 图片预览和结果展示
│   ├── composables/         # 组合式函数
│   │   ├── useBlackHoleAnimation.ts  # 背景动画逻辑
│   │   └── useImageDetection.ts      # 图像检测逻辑
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   ├── utils/               # 工具函数
│   │   └── labelMap.ts      # 标签映射
│   ├── lib/                 # 第三方库工具
│   │   └── utils.ts         # 通用工具函数
│   ├── App.vue              # 根组件
│   ├── main.js              # 应用入口
│   └── index.css            # 全局样式
├── public/                  # 静态资源
├── index.html               # HTML 模板
├── vite.config.js           # Vite 配置
├── package.json             # 项目配置
└── README.md                # 项目文档
```

## 🎮 使用指南

### 1. 上传图片

- 点击上传区域或拖拽图片文件
- 支持 JPG、PNG、GIF 等常见格式
- 文件大小限制：10MB

### 2. 查看结果

- 系统自动分析上传的图片
- 实时显示检测进度
- 在图片上标注识别的物体

### 3. 结果解读

- 彩色边框标识不同物体
- 标签显示物体名称和置信度
- 支持中文本地化显示

## 🔧 配置说明

### 自定义配置

- **检测模型**：在 `useImageDetection.ts` 中配置模型参数
- **样式主题**：在 `index.css` 中修改 CSS 变量
- **动画效果**：在 `useBlackHoleAnimation.ts` 中调整动画参数

## 🤝 贡献指南

我们欢迎所有形式的贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 开发规范

- 使用 TypeScript 进行类型安全开发
- 遵循 Vue 3 Composition API 最佳实践
- 使用箭头函数和现代 ES6+ 语法
- 保持代码简洁和可维护性

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

<div align="center">
  <p>如果这个项目对你有帮助，请给它一个 ⭐️</p>
  <p>Made with ❤️ by the img Identify Team</p>
</div>
