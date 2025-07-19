#!/bin/bash

# AI Grader 一键启动脚本
# 同时启动前端和后端服务

set -e  # 遇到错误立即停止

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 AI Grader 一键启动脚本${NC}"
echo "================================="

# 检查必要的命令是否存在
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js 未安装${NC}"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo -e "${RED}❌ Python3 未安装${NC}"; exit 1; }

# 启动后端
start_backend() {
    echo -e "${YELLOW}📦 启动后端服务...${NC}"
    cd backend
    
    # 检查虚拟环境
    if [ ! -d "venv" ]; then
        echo -e "${YELLOW}⚙️  创建虚拟环境...${NC}"
        python3 -m venv venv
    fi
    
    # 激活虚拟环境
    source venv/bin/activate
    
    # 安装依赖
    echo -e "${YELLOW}📥 安装后端依赖...${NC}"
    pip install -r requirements.txt
    
    # 启动后端
    echo -e "${GREEN}✅ 后端启动成功！端口: 5000${NC}"
    python app.py &
    BACKEND_PID=$!
    cd ..
    
    return $BACKEND_PID
}

# 启动前端
start_frontend() {
    echo -e "${YELLOW}🎨 启动前端服务...${NC}"
    cd my-ai-grader
    
    # 检查node_modules
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📥 安装前端依赖...${NC}"
        npm install
    fi
    
    # 启动前端
    echo -e "${GREEN}✅ 前端启动成功！端口: 5173${NC}"
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    return $FRONTEND_PID
}

# 清理函数
cleanup() {
    echo -e "${YELLOW}🛑 正在停止所有服务...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 0
}

# 设置信号处理
trap cleanup SIGINT SIGTERM

# 主程序
main() {
    echo -e "${BLUE}🔍 检查环境...${NC}"
    
    # 启动后端
    start_backend
    sleep 3
    
    # 启动前端
    start_frontend
    sleep 3
    
    echo ""
    echo -e "${GREEN}🎉 AI Grader 启动完成！${NC}"
    echo "================================="
    echo -e "🌐 访问地址: ${BLUE}http://localhost:5173${NC}"
    echo -e "🔧 配置页面: ${BLUE}http://localhost:5173/configuration${NC}"
    echo ""
    echo -e "${YELLOW}按 Ctrl+C 停止所有服务${NC}"
    
    # 等待进程
    wait
}

# 运行主程序
main