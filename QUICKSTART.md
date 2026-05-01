# 德州扑克AI训练软件

## 快速开始

### 方法一：使用启动脚本（推荐）

```bash
cd /mnt/c/Users/Administrator/Desktop/poker-ai-trainer
./start.sh
```

脚本会自动：
1. 安装依赖（如果需要）
2. 启动后端服务器
3. 启动前端开发服务器
4. 打开浏览器访问 http://localhost:5173

### 方法二：手动启动

**启动后端：**
```bash
cd backend
npm run dev
```

**启动前端（新终端）：**
```bash
npm run dev
```

然后访问 http://localhost:5173

## 功能说明

### 1. 手牌历史分析
- 点击"手牌历史"
- 从PokerStars等平台复制手牌记录
- 粘贴到输入框
- 点击"解析手牌"
- 点击"AI分析"获取详细反馈

### 2. 训练模式
- 点击"训练"
- 选择弱项（翻前、位置、下注大小等）
- 点击"生成训练题"
- 回答问题，查看解释

### 3. 范围训练
- 点击"范围训练"
- 选择位置和筹码深度
- 回答"这手牌该不该加注？"
- 查看正确答案和完整范围表

## 数据存储

- 所有数据保存在浏览器本地存储中
- 不需要注册账号即可使用
- 清除浏览器数据会丢失进度

## API配置

已配置的API密钥：
- OpenAI: 已配置（用于AI分析）

如需修改，编辑 `backend/.env` 文件。

## 在线访问

Vercel部署地址：https://poker-ai-trainer-lemon.vercel.app/

如果显示404，需要在Vercel点击"Redeploy"重新部署。

## 技术支持

- GitHub: https://github.com/Elryzhoy/poker-ai-trainer
- Email: 577839849@qq.com
