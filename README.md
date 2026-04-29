# 🃏 PokerAI Pro - 德州扑克AI训练平台

一个使用AI技术帮助用户提升德州扑克技能的在线训练平台。

## ✨ 主要功能

- 🤖 **AI对手训练** - 与不同难度的AI对手进行实战训练
- 📊 **智能复盘分析** - AI自动分析你的每一手牌，提供改进建议
- 🎯 **个性化训练** - 根据你的水平定制专属训练计划
- 🏆 **成就系统** - 完关挑战获得成就徽章
- 🌙 **深色/浅色模式** - 自适应主题切换
- 📱 **响应式设计** - 完美支持电脑和手机

## 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **UI组件**: ShadCN UI + Tailwind CSS v3
- **构建工具**: Vite
- **路由**: React Router v6
- **认证**: Firebase Auth (邮箱密码 + Google登录)
- **图标**: Lucide React

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，然后填入你的 Firebase 配置：

```bash
cp .env.example .env
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看效果。

## 📁 项目结构

```
poker-ai-trainer/
├── public/                    # 静态资源
│   └── favicon.svg           # 网站图标
├── src/
│   ├── components/           # 组件
│   │   ├── ui/              # UI基础组件 (ShadCN)
│   │   ├── Navbar.tsx       # 顶部导航栏
│   │   ├── Sidebar.tsx      # 侧边栏
│   │   ├── Footer.tsx       # 页脚
│   │   ├── ProtectedRoute.tsx # 路由保护
│   │   └── LoadingSpinner.tsx # 加载动画
│   ├── contexts/            # 上下文
│   │   ├── AuthContext.tsx  # 认证上下文
│   │   └── ThemeContext.tsx # 主题上下文
│   ├── pages/               # 页面
│   │   ├── Home.tsx         # 首页
│   │   ├── Login.tsx        # 登录页
│   │   ├── Register.tsx     # 注册页
│   │   ├── Profile.tsx      # 个人中心
│   │   ├── Training.tsx     # 训练中心
│   │   └── Review.tsx       # 复盘分析
│   ├── lib/                 # 工具库
│   │   ├── utils.ts         # 工具函数
│   │   └── firebase.ts      # Firebase配置
│   ├── App.tsx              # 主应用
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── .env.example             # 环境变量示例
├── .gitignore               # Git忽略文件
├── index.html               # HTML入口
├── package.json             # 项目配置
├── tailwind.config.ts       # Tailwind配置
├── tsconfig.json            # TypeScript配置
└── vite.config.ts           # Vite配置
```

## 🔥 Firebase 设置

1. 访问 [Firebase Console](https://console.firebase.google.com)
2. 创建一个新项目
3. 在项目设置中添加 Web 应用
4. 复制配置信息到 `.env` 文件
5. 在 Authentication 中启用：
   - Email/Password 登录方式
   - Google 登录方式

## 📦 构建部署

### 构建生产版本

```bash
npm run build
```

### 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 添加环境变量
4. 部署完成

## 🎨 自定义主题

编辑 `src/index.css` 中的 CSS 变量来自定义主题颜色：

```css
:root {
  --primary: 142 76% 26%;      /* 主色调 */
  --secondary: 45 93% 47%;     /* 辅助色 */
  --accent: 210 40% 96.1%;     /* 强调色 */
}
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系我们

- 邮箱: support@pokerai.com
- 官网: https://pokerai.com
