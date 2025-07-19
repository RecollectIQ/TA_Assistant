# AI Grader

## Update Log / Version History

### v0.2.2 (2025-07-19, 部署优化)

#### 🚀 新功能亮点
- **一键启动脚本**：新增`start.sh`一键启动前后端服务
- **部署优化**：简化启动流程，无需手动启动多个服务
- **端口管理**：自动检查并清理占用端口
- **用户体验**：统一启动界面，彩色状态输出

#### 📋 具体更新内容
1. **一键启动系统**
   - 新增`./start.sh`脚本，一键启动前后端
   - 自动检查依赖安装状态
   - 智能端口冲突检测和清理
   - 彩色终端输出，启动状态清晰可视

2. **部署流程简化**
   - 无需手动启动多个终端
   - 自动激活Python虚拟环境
   - 自动检测并安装缺失依赖
   - Ctrl+C统一关闭所有服务

### v0.2.1 (2025-07-17, 重大功能升级)

#### 🚀 新功能亮点
- **多图标准答案系统**：支持上传多张标准答案图片，AI智能分析并生成评分标准
- **批量批改功能**：一次性上传全班作业，自动批量评分并生成报告
- **结果管理系统**：完整的批改历史记录，支持图表分析和数据导出
- **配置管理中心**：统一管理API密钥、AI模型选择和高级参数设置
- **全新用户界面**：3步向导式操作流程，拖拽上传，实时预览

#### 📋 具体更新内容
1. **多图标准答案分析**
   - 支持最多10张标准答案图片上传
   - AI智能分析所有图片内容，生成综合分析报告
   - 自动生成JSON格式的评分标准
   - 支持图片拖拽排序

2. **批量学生作业批改**
   - 支持最多50份学生作业同时上传
   - 实时进度追踪（进度条显示）
   - 支持ZIP压缩包批量上传
   - 自动从文件名提取学生学号
   - 批量导出CSV/JSON/PDF格式结果

3. **结果分析与历史管理**
   - 完整的批改历史数据库
   - 智能筛选（按日期、学生、成绩范围）
   - 成绩分布图表可视化
   - 支持重新批改和结果编辑
   - 一键导出全班成绩报告

4. **配置管理优化**
   - 支持OpenAI GPT-4o、Claude 3.5等多种AI模型
   - API密钥安全加密存储
   - 实时连接测试功能
   - 高级参数设置（超时时间、最大token数）

### v0.0.2 (2025-05-15, MVP版本)
- **MVP完成**：实现端到端的AI辅助批改工作流
- 标准答案分析：上传标准答案图片，AI生成文本分析和建议评分标准
- 学生作业批改：基于标准答案和评分标准自动评分
- 增强反馈展示：AI评分结果以Markdown格式展示

## 🎯 项目简介
AI Grader是一个基于Web的智能批改系统，使用AI技术自动批改图像格式的学生作业。系统采用Vue.js前端+Python Flask后端架构，支持OpenAI、Claude等多种AI模型。

## 📁 项目结构

```
AI_Grader/
├── my-ai-grader/          # Vue.js 3前端应用
│   ├── src/
│   │   ├── views/        # 页面组件
│   │   │   ├── ConfigurationView.vue    # 配置管理
│   │   │   ├── StandardAnswerView.vue   # 标准答案设置
│   │   │   ├── BatchGradingView.vue     # 批量批改
│   │   │   ├── ResultsView.vue          # 结果分析
│   │   │   └── ...
│   │   ├── components/   # 通用组件
│   │   │   ├── common/  # 基础组件
│   │   │   ├── upload/  # 上传组件
│   │   │   └── layout/  # 布局组件
│   │   ├── stores/       # Pinia状态管理
│   │   ├── types/        # TypeScript类型定义
│   │   └── services/     # API服务层
├── backend/              # Python Flask后端
├── .kiro/               # 设计文档和任务清单
└── README.md
```

## 🛠️ 环境要求

### 前端要求 (`my-ai-grader/`)：
- Node.js (v18.x 或更高版本)
- npm (通常随Node.js一起安装)

### 后端要求 (`backend/`)：
- Python 3.9+
- pip (Python包管理器)

## 📦 安装步骤

### 1. 克隆项目
```bash
git clone <your-repository-url>
cd AI_Grader
```

### 2. 安装前端依赖
```bash
cd my-ai-grader
npm install
```

### 3. 安装后端依赖
```bash
cd backend

# 创建Python虚拟环境
python3 -m venv venv

# 激活虚拟环境
# macOS/Linux:
source venv/bin/activate
# Windows:
# venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
```

### 4. 配置API密钥
在 `backend/` 目录下创建 `.env` 文件：

```env
OPENAI_COMPATIBLE_API_URL="https://api.openai.com/v1/chat/completions"
OPENAI_COMPATIBLE_API_KEY="your_api_key_here"
```

支持的AI模型：
- OpenAI GPT-4o
- OpenAI GPT-4o Mini
- Claude 3.5 Sonnet
- Claude 3.5 Haiku

## 🚀 启动项目

### 🆕 一键启动（推荐）
```bash
./start.sh
```
脚本会自动：
- 检查并安装前后端依赖
- 启动后端服务（端口5000）
- 启动前端服务（端口5173）
- 显示彩色启动状态
- 按Ctrl+C统一关闭所有服务

### 手动启动（备用）

#### 启动后端（端口5000）：
```bash
cd backend
source venv/bin/activate  # 激活虚拟环境
python app.py
```

#### 启动前端（端口5173）：
```bash
cd my-ai-grader
npm run dev
```

访问地址：
- 前端：http://localhost:5173
- 后端：http://localhost:5000

## 🎯 使用流程

### 新手快速上手：

1. **首次使用配置**
   - 访问 http://localhost:5173/configuration
   - 输入你的AI模型API密钥
   - 测试连接是否成功

2. **设置标准答案**
   - 访问 http://localhost:5173/standard-answer
   - 上传1-10张标准答案图片
   - 等待AI分析完成
   - 确认或修改评分标准

3. **批量批改作业**
   - 访问 http://localhost:5173/batch-grading
   - 上传全班学生作业图片（最多50份）
   - 选择对应的标准答案
   - 开始自动批改

4. **查看结果**
   - 访问 http://localhost:5173/results
   - 查看成绩分布图表
   - 导出CSV成绩表
   - 可重新批改个别学生作业

## 📋 可用脚本

### 前端开发命令（在my-ai-grader/目录下）：
```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产版本
npm run lint     # 代码检查
npm run format   # 代码格式化
```

### 后端开发命令（在backend/目录下）：
```bash
python app.py    # 启动Flask服务器
python -m pytest # 运行测试（如果有）
```

## 🔌 API接口说明

### 主要接口：
- `POST /api/analyze_answer` - 分析标准答案图片
- `POST /api/grade` - 批改学生作业
- `POST /api/analyze_multi_answer` - 多图标准答案分析
- `POST /api/batch_grade` - 批量批改作业
- `GET /api/greet` - 连接测试

## 📊 功能特色

### 多图标准答案分析
- 支持最多10张标准答案图片
- AI智能分析所有图片内容
- 自动生成评分标准JSON

### 批量作业批改
- 一次性处理50份学生作业
- 实时进度显示
- 支持ZIP文件上传
- 自动提取学生学号

### 智能结果管理
- 完整的批改历史记录
- 成绩分布图表
- 多维度筛选搜索
- 一键导出全班成绩

### 多AI模型支持
- OpenAI GPT-4o/4o Mini
- Claude 3.5 Sonnet/Haiku
- 自定义API端点

## 🐛 常见问题

### Q: 连接AI模型失败怎么办？
A: 检查配置文件中的API密钥和端点URL是否正确，确保网络连接正常。

### Q: 图片上传失败？
A: 检查图片格式（支持JPG、PNG），单张图片大小不超过5MB。

### Q: 批量批改速度慢？
A: 可以调整并发设置，或使用更快的AI模型（如GPT-4o Mini）。

## 📞 技术支持

如有问题，请查看项目Issues或联系开发团队。

---

**版本**: v0.2.2  
**更新日期**: 2025-07-19  
**状态**: 生产就绪 ✨