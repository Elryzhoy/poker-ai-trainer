# 德州扑克AI训练软件

AI原生德州扑克水平训练软件，核心壁垒：个性化AI教练+实时弱点诊断闭环。

## 功能特性

### MVP功能（第1-4周）

#### 1. 手牌历史导入与AI分析
- 支持平台：PokerStars、GGPoker、888poker、PartyPoker、Winamax
- 自动解析手牌历史
- AI自动标注：
  - EV损失计算
  - 位置错误识别
  - 范围错误识别
- 自然语言解释（基于权威教材）
- 个人错误统计报告

#### 2. 智能错题训练
- 根据错误报告自动生成同类型题目
- 每题即时详细解释
- 无限量题目生成
- 正确率追踪

#### 3. 翻前范围训练
- 覆盖所有位置（UTG/MP/CO/BTN/SB/BB）
- 不同筹码深度（20BB/50BB/100BB/200BB）
- 开池/3bet/4bet/跟注范围
- 自动记录正确率
- 弱项强化训练

### v1.0功能（第5-8周）

#### AI对战系统
- 多风格AI：紧凶/松凶/鱼/职业
- 多人桌：单挑/6人桌/满桌
- 多筹码：100BB/200BB/深筹码
- 实时决策反馈

#### 社区功能
- 手牌分享
- 讨论区
- 排行榜

### 付费版功能（第9-12周）

#### 订阅系统
- 免费版：基础功能
- 基础版：$9.99/月
- 专业版：$29.99/月
- 企业版：定制

#### 支付集成
- Stripe支付
- 退款政策

## 技术栈

- **前端**：React 18 + TypeScript + Tailwind CSS + ShadCN UI
- **后端**：Node.js + Express
- **数据库**：Supabase PostgreSQL
- **认证**：Supabase Auth
- **部署**：Vercel (前端) + AWS Lambda (AI计算)
- **AI层**：OpenAI GPT-4o + RAG知识库 + 轻量级GTO Solver

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Elryzhoy/poker-ai-trainer.git
cd poker-ai-trainer
```

### 2. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend
npm install
cd ..
```

### 3. 配置环境变量

```bash
# 复制后端环境变量文件
cp backend/.env.example backend/.env

# 编辑 backend/.env 文件，填入你的配置：
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - OPENAI_API_KEY
```

### 4. 启动开发服务器

```bash
# 启动后端（在 backend 目录）
cd backend
npm run dev

# 启动前端（在根目录）
npm run dev
```

访问 http://localhost:5173 查看应用。

## 项目结构

```
poker-ai-trainer/
├── src/                    # 前端源代码
│   ├── components/         # React组件
│   ├── contexts/           # React上下文
│   ├── pages/              # 页面组件
│   ├── lib/                # 工具函数
│   └── main.tsx            # 入口文件
├── backend/                # 后端源代码
│   ├── src/
│   │   ├── routes/         # API路由
│   │   ├── services/       # 业务逻辑
│   │   ├── config/         # 配置文件
│   │   └── index.js        # 入口文件
│   └── package.json
├── public/                 # 静态资源
├── package.json            # 前端依赖
├── vite.config.ts          # Vite配置
├── tailwind.config.ts      # Tailwind配置
└── README.md
```

## API文档

### 手牌历史API

- `POST /api/hand-history/upload` - 上传手牌历史
- `POST /api/hand-history/analyze` - AI分析手牌
- `GET /api/hand-history/stats` - 获取统计信息

### 训练API

- `POST /api/training/generate` - 生成训练题
- `POST /api/training/submit` - 提交答案
- `GET /api/training/stats` - 获取训练统计
- `POST /api/training/daily` - 获取每日训练

### 范围API

- `GET /api/range/:position/:stackDepth` - 获取范围
- `GET /api/range/quiz` - 获取范围测验
- `POST /api/range/check` - 检查手牌是否在范围内

### AI API

- `POST /api/ai/analyze` - AI分析手牌
- `POST /api/ai/generate-questions` - 生成训练题
- `POST /api/ai/error-report` - 生成错误报告

## 成本控制

- 单用户单次100手牌复盘 ≤ 10000 Token
- 每日100道训练题 ≤ 5000 Token
- 1000用户内月服务器成本 ≤ $300

## 免责声明

本软件仅供学习和娱乐目的使用。所有扑克训练内容不构成赌博建议。用户应遵守当地法律法规。

## 许可证

MIT License

## 联系方式

- GitHub: https://github.com/Elryzhoy/poker-ai-trainer
- Email: 577839849@qq.com
