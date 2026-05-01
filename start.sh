#!/bin/bash
# 德州扑克AI训练软件 - 启动脚本

echo "=========================================="
echo "  德州扑克AI训练软件 - 启动中..."
echo "=========================================="

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo "正在安装前端依赖..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "正在安装后端依赖..."
    cd backend
    npm install
    cd ..
fi

# 启动后端
echo ""
echo "正在启动后端服务器..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 3

# 检查后端是否启动成功
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✓ 后端服务器启动成功 (端口: 3001)"
else
    echo "✗ 后端服务器启动失败"
    exit 1
fi

# 启动前端
echo ""
echo "正在启动前端..."
npm run dev &
FRONTEND_PID=$!

# 等待前端启动
sleep 5

echo ""
echo "=========================================="
echo "  启动完成！"
echo "=========================================="
echo ""
echo "  前端地址: http://localhost:5173"
echo "  后端地址: http://localhost:3001"
echo ""
echo "  按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
wait
