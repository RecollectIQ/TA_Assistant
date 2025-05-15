# AI Grader - Detailed Technical Implementation Plan

This document outlines the technical implementation steps for building the AI Grader application.

**🚀 How to Run the Project**

**Frontend (Vue.js - `my-ai-grader` directory):**

1.  **Prerequisites:**
    - Node.js (v18.x or later recommended)
    - npm (usually comes with Node.js)
2.  **Navigate to Frontend Project Directory:**
    Make sure you are in the `my-ai-grader` subdirectory from the workspace root:
    ```bash
    cd my-ai-grader
    ```
3.  **Install Dependencies (if not already done or if `package.json` changed):**
    ```bash
    npm install
    ```
4.  **Run the Frontend Development Server:**
    ```bash
    npm run dev
    ```
    The frontend application should typically be available at `http://localhost:5173`.

**Backend (Python/Flask - `backend` directory):**

1.  **Prerequisites:**
    - Python 3.x (check `venv` or project specifics for exact version if needed)
    - pip (Python package installer)
2.  **Navigate to Backend Directory (from workspace root):**
    ```bash
    cd backend
    ```
3.  **Create and Activate Virtual Environment (if not already done or if you prefer a fresh one):**
    It appears a `venv` directory already exists. To activate it:
    ```bash
    # For macOS/Linux
    source venv/bin/activate
    # For Windows
    # venv\Scripts\activate
    ```
    If you need to create it for the first time (and `venv` directory doesn't exist or is corrupted):
    ```bash
    python3 -m venv venv
    # Then activate as above
    ```
4.  **Install Dependencies (if not already done or if `requirements.txt` changed):**
    ```bash
    pip install -r requirements.txt
    ```
5.  **Set Up Environment Variables (if applicable):**
    If the application requires environment variables (e.g., API keys in a `.env` file), ensure they are correctly set up in the `backend` directory. (e.g., create a `.env` file with `OPENAI_API_KEY=your_key_here`).
6.  **Run the Flask Server:**
    The `app.py` seems to be the main application file.
    ```bash
    flask run
    # Or, if flask command is not found directly, you might use:
    # python -m flask run
    # Or directly:
    # python app.py
    ```
    The backend API will likely be available at a default Flask port (e.g., `http://localhost:5000`) or as configured in `app.py`.

---

**11.1 模块一：Web 应用基础框架与核心 UI 搭建 (Frontend Core & Shell)**

- **11.1.1 项目初始化与构建配置** ✅ **Completed**

  - 任务：使用 Vite 创建 Vue.js 项目 (`npm create vite@latest my-ai-grader -- --template vue-ts`)。 - ✅
  - 配置：TypeScript 支持，ESLint，Prettier，路径别名 (`@/*`)。 - ✅
  - 目标：建立基础项目结构，确保开发和构建流程顺畅。 - ✅
  - _Details: Project created, ESLint, Prettier, and TS configured. Path alias `@/*` set up. Lint and format scripts added to `package.json`. Frontend source (`my-ai-grader/src/`) contains a default `components/HelloWorld.vue` (can be cleaned up) and a newly discovered `config/default_prompt.txt` (purpose likely related to default LLM prompts)._

- **11.1.2 路由系统搭建** ✅ **Completed**

  - 技术：Vue Router (`vue-router`)。 - ✅
  - 任务：
    - 定义主路由表 (例如 `/`, `/profile-management`, `/grading`)。 - ✅ (HomeView, ProfileManagementView, GradingView routes defined)
    - 实现基础的导航守卫（如果需要，例如简单的进入前确认）。 - (Not yet implemented)
  - 组件：`App.vue` (承载 `router-view`)。 - ✅
  - 目标：建立应用内页面跳转机制。 - ✅
  - _Details: Vue Router installed and configured. Basic views created and router integrated into `main.ts` and `App.vue`._

- **11.1.3 UI 库集成与全局配置** ✅ **Completed**

  - 技术：Element Plus (`element-plus`)。 - ✅
  - 任务：
    - 完整引入或按需引入 Element Plus 组件。 - ✅ (Globally imported)
    - 配置全局主题（如果需要自定义）。 - (Not yet implemented)
    - 封装常用的 Element Plus 组件组合（可选，例如一个带特定校验的表单项）。 - (Not yet implemented)
  - 目标：确保 UI 组件可用并统一风格。 - ✅
  - _Details: Element Plus and icons installed and globally imported in `main.ts`. Basic views enhanced with Element Plus components._

- **11.1.4 应用核心布局组件** ✅ **Completed**

  - 技术：Element Plus (`ElContainer`, `ElHeader`, `ElAside`, `ElMain`, `ElFooter`)。 - ✅
  - 组件：
    - `MainLayout.vue`: (Conceptual, `App.vue` serves this role) - ✅ (`App.vue` uses `ElContainer`, `ElHeader`, `ElMain` for main layout)
    - `HeaderComponent.vue`: (Part of `App.vue`) - ✅ (`ElMenu` in `App.vue` header for navigation)
    - `SidebarComponent.vue` (占位): (Conceptual, `ElAside` used directly in `GradingView.vue`)
    - `FooterComponent.vue`: (Not yet implemented, can be added to `App.vue` if needed)
  - 任务：
    - 搭建应用主框架的静态结构。 - ✅
    - 实现响应式布局调整（例如，侧边栏的收起/展开）。 - (Not yet implemented)
  - 目标：定义应用整体视觉框架。 - ✅
  - _Details: `App.vue` provides the main layout. `GradingView.vue` implements its own two-column layout using Element Plus layout components._

- **11.1.5 主内容区布局 (两栏)** ✅ **Completed (within `GradingView.vue`)**

  - 组件：`GradingViewLayout.vue` (Implemented directly in `GradingView.vue`) - ✅
  - 任务：
    - 在 `ElMain` 内部实现左右两栏布局。 - ✅ (Achieved in `GradingView.vue` with `ElMain` for image and `ElAside` for results)
    - 左侧：图片展示区 (占位，具体由模块三实现)。 - ✅ (Placeholder with `ElUpload` and `ElImage` for preview in `GradingView.vue`)
    - 右侧：结果侧边栏 (占位，具体由模块五实现)。 - ✅ (Placeholders for "Overall Summary", "Detailed Feedback", "Actions" in `GradingView.vue`)
  - 目标：为核心功能区提供布局基础。 - ✅
  - _Details: `GradingView.vue` features a two-column layout with an image upload/display area and a results sidebar, populated with Element Plus components._

- **11.1.6 全局样式与资源管理** ⚠️ **Partially Addressed / Needs Review**
  - 文件：`src/assets/main.css` (或 `scss/main.scss` 如果使用 Sass)。
    - _Note: The `src/main.ts` file in `my-ai-grader` imports both `./assets/main.css` (which does **not** exist and was causing an HMR error) and `./style.css` (which **does** exist at `my-ai-grader/src/style.css` and seems to be the actual global stylesheet). The HMR error related to `./assets/main.css` needs to be resolved by removing the import or creating the file if intended for future use. For now, `my-ai-grader/src/style.css` is providing global styles._
  - 任务：
    - 定义全局基础样式、重置样式、通用工具类。 - (Partially, `my-ai-grader/src/style.css` has some base styles from Vite template)
    - 管理静态资源 (如图片、字体)。 - (Basic asset `vue.svg` in `src/assets`)
  - 规范：Vue 组件的 `<style scoped>` 用于组件局部样式。 - ✅ (Being followed)
  - 目标：统一应用视觉风格，管理静态资源。

**11.2 模块二：\"题目配置档案 (Problem Profile)\"管理 (Frontend Logic & Storage)**

- **11.2.1 Pinia 状态管理设置** ✅ **Completed (Initial setup)**

  - 技术：Pinia (`pinia`)。 - ✅
  - 任务：
    - 创建 Pinia 实例并集成到 Vue 应用。 - ✅
    - 定义 `problemProfileStore.js` (或 `.ts`)。 - (We created `gradingStore.ts` in `my-ai-grader/src/stores/` instead, can be refactored or `problemProfileStore` added later)
  - 目标：建立集中的状态管理机制。 - ✅
  - _Details: Pinia installed and initialized in `main.ts`. A basic `gradingStore.ts` (located at `my-ai-grader/src/stores/gradingStore.ts`) has been created for `imageUrl`. Still resolving a "Cannot find module '@/stores/gradingStore'" type error. **Additionally, a potentially redundant `gradingStore.ts` exists at the workspace root level in `src/stores/gradingStore.ts`. This needs investigation to determine if it's used or can be removed.**_

- **11.2.2 Problem Profile Store 模块** (Not yet started)

  - Store：`problemProfileStore`
  - State：
    - `currentProfile: ProblemProfile | null`
    - `profilesList: ProblemProfile[]` (如果需要管理多个 Profile)
    - `isLoading: boolean`
    - `error: string | null`
  - Actions：
    - `loadProfilesFromStorage()`
    - `saveProfilesToStorage()`
    - `addProfile(profileData: Omit<ProblemProfile, 'id'>)`
    - `updateProfile(profile: ProblemProfile)`
    - `deleteProfile(profileId: string)`
    - `selectProfile(profileId: string)`
    - `importProfileFromFile(file: File)`
    - `exportProfileToFile(profileId: string)`
  - Getters：
    - `getProfileById(id: string): ProblemProfile | undefined`
    - `activeProfileDetails: ProblemProfile | null`
  - 目标：集中管理 Problem Profile 的增删改查及导入导出逻辑。

- **11.2.3 Problem Profile 数据结构定义**

  - 接口/类型定义 (TypeScript)：`ProblemProfile.ts`

    ```typescript
    interface RubricItem {
      id: string; // e.g., r1, r2
      criterionName: string;
      maxPoints: number;
      description?: string;
    }

    interface LLMExpectedOutputFormat {
      rubric_scores: Array<{
        criterion_id: string;
        score: number;
        justification: string;
      }>;
      total_score: number;
      overall_comment: string;
    }

    interface ProblemProfile {
      id: string; // unique_profile_id_timestamp
      name: string;
      rubric: RubricItem[];
      masterPrompt: string;
      llmExpectedOutputFormat?: LLMExpectedOutputFormat; // 可选
    }
    ```

  - 目标：明确数据结构，方便类型检查和开发。

- **11.2.4 Local Storage 服务封装**

  - 模块：`localStorageService.js` (或 `.ts`)
  - 函数：
    - `saveProblemProfiles(profiles: ProblemProfile[]): void`
    - `loadProblemProfiles(): ProblemProfile[] | null`
  - 目标：封装 Local Storage 的读写操作，使其与 Pinia Store 解耦。

- **11.2.5 文件导入/导出服务封装**

  - 模块：`fileService.js` (或 `.ts`)
  - 函数：
    - `readJsonFile(file: File): Promise<any>` (使用 FileReader API)
    - `triggerJsonDownload(data: any, filename: string): void` (使用 Blob 和 <a> 标签)
  - 目标：封装文件读写逻辑，使其可复用。

- **11.2.6 Profile 创建/编辑 UI 组件**

  - 组件：`ProfileEditorDialog.vue`
  - 技术：`ElDialog`, `ElForm`, `ElFormItem`, `ElInput`, `ElInputNumber`, `ElButton`.
  - 功能：
    - 表单用于输入/编辑 Profile 的 `name`, `rubric` (动态增删条目), `masterPrompt`。
    - Rubric 每一项应包含 `criterionName`, `maxPoints`, `description`。
    - 表单校验。
    - 提交后调用 Pinia store 的 action 保存。
  - 目标：提供用户创建和修改 Problem Profile 的界面。

- **11.2.7 Profile 列表展示与管理 UI 组件 (可选)**

  - 组件：`ProfileListTable.vue` (如果需要管理多个 Profile)
  - 技术：`ElTable`, `ElButton` (编辑、删除、导出、选择使用)。
  - 功能：
    - 展示已保存的 Profiles 列表。
    - 提供操作按钮，调用 Pinia store 的 action。
  - 目标：如果需要，提供管理多个 Profile 的界面。

- **11.2.8 Profile 选择器 UI 组件**
  - 组件：`ProfileSelector.vue`
  - 技术：`ElSelect` 或 `ElRadioGroup`。
  - 功能：允许用户从已有的 Profiles 中选择一个作为当前活动的 Profile。
  - 目标：方便用户切换不同的题目配置。

**11.3 模块三：批次创建与图片处理 (Frontend Image Handling)**

- **11.3.1 图片上传组件封装** ✅ **Completed (Implemented directly in `GradingView.vue`)**

  - 组件：`ImageUploader.vue` (Functionality integrated into `GradingView.vue` using `ElUpload`) - ✅
  - 技术：Element Plus 的 `ElUpload` 组件 (配置 `multiple`, `accept=\"image/*\"`, `before-upload`, `on-success`/`on-change`) 或原生 `<input type=\"file\">`。 - ✅
  - 功能：
    - 支持多图片上传。- (Currently set up for single image upload via `ElUpload`'s default, can be changed with `multiple` prop)
    - 文件类型、大小限制（前端校验）。 - ✅ (`beforeImageUpload` in `GradingView.vue`)
    - 上传成功后，将文件对象列表传递给 Pinia Store。 - (Currently sets `imageUrl` in `gradingStore` for local preview)
  - 目标：提供用户上传待批改图片的界面。 - ✅
  - _Details: `GradingView.vue` includes an `ElUpload` component for image drag & drop and selection, with local preview functionality. `customImageUpload`, `handleImageSuccess`, `beforeImageUpload` functions implemented._

- **11.3.2 图片处理与预览服务** ⚠️ **Partially Implemented (Local Preview)**

  - 模块：`imageService.js` (或 `.ts`) - (Not created as a separate service yet; logic is within `GradingView.vue`)
  - 函数：
    - `convertFileToBase64(file: File): Promise<string>` (使用 `FileReader.readAsDataURL`)。 - (Similar logic used in `customImageUpload` via `URL.createObjectURL` for preview)
    - （可选）`resizeImage(base64Image: string, maxWidth: number, maxHeight: number): Promise<string>` (如果需要前端压缩)。 - (Not yet implemented)
  - 目标：封装图片数据转换逻辑。

- **11.3.3 图片状态管理 (Pinia Store)** ✅ **Completed (Basic for `imageUrl`)**

  - Store：`imageStore.js` (或 `.ts`) 或扩展 `problemProfileStore` - (Used `gradingStore.ts` for `imageUrl`) - ✅
  - State：
    - `uploadedImages: Array<{ id: string, name: string, base64Data: string, fileObject?: File, gradingResult?: any }>` - (Currently only `imageUrl: string | null` in `gradingStore`)
    - `currentImageIndex: number` - (Not yet implemented)
    - `isProcessing: boolean` (标记是否正在处理某张图片) - (Not yet implemented)
  - Actions：
    - `addImages(files: File[])` - (Currently `setImageUrl(url: string | null)` in `gradingStore`)
    - `removeImage(imageId: string)` - (Not yet implemented)
    - `setCurrentIndex(index: number)` - (Not yet implemented)
    - `clearImages()` - (Not yet implemented)
    - `updateImageGradingResult(imageId: string, result: any)` - (Not yet implemented)
  - Getters：
    - `currentImage: { id: string, name: string, base64Data: string } | null` - (Effectively `imageUrl` from `gradingStore`)
    - `hasNextImage: boolean` - (Not yet implemented)
    - `hasPreviousImage: boolean` - (Not yet implemented)
  - 目标：管理已上传的图片列表及其状态。 - (Basic image URL management achieved)
  - _Details: `gradingStore.ts` manages `imageUrl` for preview. More complex image state management is pending._

- **11.3.4 图片展示区 UI 组件** ✅ **Completed (in `GradingView.vue`)**

  - 组件：`ImageViewer.vue` (Functionality integrated into `GradingView.vue` using `ElImage`) - ✅
  - 技术：`<img>` 标签，可能配合缩放/拖拽库。 - ✅ (`ElImage` component used)
  - 功能：
    - 显示当前选中的图片 (从 Pinia Store 获取 `currentImage.base64Data`)。 - ✅ (Displays image from `gradingStore.imageUrl`)
    - （可选）支持图片放大、缩小、拖动查看。 - (Not yet implemented, `ElImage` has some built-in preview features)
  - 目标：清晰展示待批改的图片。 - ✅

- **11.3.5 图片导航控制 UI 组件** (Not yet started)

**11.4 模块四：LLM 集成与处理逻辑 (Local Backend Proxy - Python/Flask)**

- **11.4.0 辅助工具与脚本 (Placeholder)**

  - _Note: This section is a placeholder for any helper scripts or tools related to the backend that are not part of the main Flask application flow but support development or deployment._
  - `backend/check_new_api_env.py`: A Python script found in the backend directory. Its exact purpose is TBD but likely related to checking or configuring the environment for API calls (e.g., to an LLM service).

- **11.4.1 Flask 应用基础设置** ✅ **Completed**

  - 文件：`app.py` - ✅
  - 任务：
    - 创建 Flask app 实例。 - ✅
    - 配置 `python-dotenv` 加载 `.env` 文件。 - ✅ (`load_dotenv()` called)
    - 配置 `flask-cors` 以允许跨域请求。 - ✅ (Configured for `http://localhost:5173`)
  - 环境变量 (`.env`): `OPENAI_COMPATIBLE_API_URL`, `OPENAI_COMPATIBLE_API_KEY` (expected by `app.py`). - ✅
  - 目标：搭建 Flask 服务基础。 - ✅
  - _Details: Flask app instance created in `backend/app.py`, CORS configured for frontend, `python-dotenv` used for environment variables like `OPENAI_COMPATIBLE_API_URL` and `OPENAI_COMPATIBLE_API_KEY`._

- **11.4.2 API 端点定义 (`/api/grade_image`)** ⚠️ **Partially Implemented**

  - 路由：`@app.route('/api/grade_image', methods=['POST'])` - (Implemented as `@app.route('/api/grade', methods=['POST'])` in `backend/app.py`)
  - 请求体解析：
    - 从 JSON 请求中获取 `imageData` (Base64 字符串) 和 `problemProfile` (JSON 对象)。 - (Currently gets `imageData` and `prompt`; `problemProfile` not yet integrated)
    - 进行基本的请求体验证 (例如，必要字段是否存在)。 - ✅ (Basic checks for `data`, `imageData`, `prompt` exist)
  - 目标：定义接收前端请求的接口。
  - _Details: Endpoint `/api/grade` is defined in `backend/app.py` and accepts `imageData` and `prompt`. Basic request validation is present. Integration of `problemProfile` for request parsing is pending._

- **11.4.3 OpenAI API 调用服务** ⚠️ **Partially Implemented (Logic exists but not encapsulated as planned)**

  - 模块：`openai_service.py` - (Not created; logic is currently within `backend/app.py`)
  - 函数：`call_openai_vision_api(image_data_base64: str, profile: dict) -> dict` - (Not created; logic is currently within `backend/app.py`)
  - 逻辑：
    - 从环境变量获取 API 密钥。 - ✅ (Done in `app.py`)
    - 构造符合 OpenAI GPT-4 Vision API 的请求头和请求体。 - ✅ (Basic payload for `gpt-4.1` constructed in `app.py`)
    - 请求体中包含 `model`, `messages` (system prompt, user prompt with rubric, image_url), `max_tokens`, `response_format` (尝试 JSON Mode)。 - (Model `gpt-4.1` used, basic messages with text and image_url. Rubric/system prompt/response_format not explicitly detailed as per plan yet).
    - 使用 `requests.post` 发送请求。 - ✅ (Done in `app.py`)
    - 初步处理响应 (例如，检查 HTTP 状态码)。 - ✅ (Done in `app.py`)
  - 依赖：`requests` - ✅ (Used in `app.py`)
  - 目标：封装调用 OpenAI API 的核心逻辑。
  - _Details: API call logic (request construction, sending, initial response handling for `gpt-4.1` model) is directly implemented within the `/api/grade` endpoint in `backend/app.py`. It has not been encapsulated into a separate `openai_service.py` module or `call_openai_vision_api` function as originally planned._

- **11.4.4 Prompt 构造逻辑** ⚠️ **Minimally Implemented**

  - 模块：`prompt_builder.py` (或在 `openai_service.py` 内) - (Not created)
  - 函数：`construct_openai_payload(image_data_base64: str, profile: dict) -> dict` - (Not created)
  - 逻辑：
    - 根据 `problemProfile` 中的 `masterPrompt` 和 `rubric` 动态生成 `messages` 数组。 - (Not implemented; currently uses `prompt` directly from request)
    - 确保 `image_url` 格式正确 (`data:image/jpeg;base64,{image_data_base64}` 或其他支持的图片类型)。 - (Assumes frontend sends correct Data URL)
    - （可选）根据 `profile.llmExpectedOutputFormat` 强化对输出格式的提示。 - (Not implemented)
  - 目标：灵活、准确地根据 Problem Profile 构建发送给 LLM 的 Prompt。
  - _Details: The current implementation in `backend/app.py` uses the `prompt` text directly from the frontend request. The planned dynamic and complex prompt construction based on `problemProfile` (especially `rubric` and `masterPrompt`) has not been implemented. No separate `prompt_builder.py` exists._

- **11.4.5 错误处理与响应格式化** ⚠️ **Partially Implemented**

  - 在 `/api/grade_image` 端点中： (Implemented in `/api/grade` endpoint)
    - 捕获 `requests` 库的异常 (网络错误、超时等)。 - ✅
    - 捕获 `openai_service` 中可能抛出的自定义异常 (例如，API 密钥错误，无效响应)。 - (No separate `openai_service`, so general exceptions are caught in `app.py`)
    - 检查 OpenAI API 返回的响应状态码和错误信息。 - ✅
    - 将成功和错误信息统一结构化后返回给前端 (例如 `{ "success": true, "data": ... }` 或 `{ "success": false, "error": { "message": ..., "code": ... } }`)。 - ✅ (Errors are returned as JSON with an `error` key; success returns AI result directly)
  - 目标：提供清晰、一致的 API 响应给前端。
  - _Details: The `/api/grade` endpoint in `backend/app.py` includes basic `try-except` blocks for `requests` exceptions and general errors. It also handles non-200 responses from the external API. Errors are returned in JSON format. More specific error structuring (e.g. `success` boolean, `error.code`) could be enhanced._

- **11.4.6 本地服务运行配置** ✅ **Completed (Basic setup)**

  - 命令：`flask run` - ✅
  - 环境变量设置：`FLASK_APP=app.py`, `FLASK_ENV=development` (或 `production`)。 - (Implicitly works with `flask run`; `app.run(debug=True)` in `if __name__ == '__main__'` block also present)
  - （可选）使用 `gunicorn` 或 `waitress` 等 WSGI 服务器进行生产环境部署。 - (Not yet implemented)
  - 目标：确保后端服务可以稳定运行。 - ✅ (Basic local run is stable)
  - _Details: Backend can be run using `flask run`. The `app.py` also includes a standard `if __name__ == '__main__': app.run()` block. Advanced deployment with WSGI servers is not yet configured._

**11.5 模块五：结果侧边栏展示与编辑功能 (Frontend UI & Interaction)**

- **11.5.1 评分结果数据结构定义 (前端)**

  - 接口/类型定义 (TypeScript)：`GradingResult.ts` (可能与 `LLMExpectedOutputFormat` 类似或基于它)

    ```typescript
    interface RubricScoreClient extends RubricItem {
      // 继承自 ProblemProfile 的 RubricItem
      score?: number;
      justification?: string;
    }

    interface GradingResult {
      profileId: string; // 关联的Problem Profile ID
      imageId: string; // 关联的图片ID
      rubricScores: RubricScoreClient[]; // 结合了评分标准和实际得分
      totalScore?: number;
      overallComment?: string;
      rawLLMOutput?: any; // 存储原始LLM输出，供调试
      isDirty?: boolean; // 标记用户是否编辑过
    }
    ```

  - 目标：定义前端用于展示和编辑的评分结果数据结构。

- **11.5.2 结果状态管理 (Pinia Store)**

  - Store：`gradingResultStore.js` (或 `.ts`) 或扩展 `imageStore` / `problemProfileStore`
  - State：
    - `currentGradingResult: GradingResult | null`
    - `history: Map<string, GradingResult>` (imageId -> GradingResult，用于存储已批改图片的最终结果)
    - `isLoading: boolean` (评分请求进行中)
  - Actions：
    - `fetchGradingResult(imageData: string, profile: ProblemProfile, imageId: string)` (调用后端 API)
    - `updateRubricScore(criterionId: string, newScore: number)`
    - `updateRubricJustification(criterionId: string, newJustification: string)`
    - `updateOverallComment(comment: string)`
    - `saveCurrentEdits()` (如果需要持久化编辑，MVP 阶段可能仅更新内存)
    - `loadResultForImage(imageId: string, profile: ProblemProfile)` (从 history 或 profile 默认结构加载)
  - Getters：
    - `calculatedTotalScore: number` (基于 `currentGradingResult.rubricScores` 动态计算)
  - 目标：管理从后端获取的评分结果以及用户在前端的编辑。

- **11.5.3 结果展示主组件**

  - 组件：`GradingSidebar.vue` 或 `ResultsPanel.vue`
  - 技术：`ElCard`, `ElDescriptions` (用于展示总体信息如题目名称、总分)。
  - 功能：
    - 作为侧边栏的容器。
    - 显示当前题目配置名称。
    - 显示整体评分信息 (如总分、总体评语)。
    - 条件渲染：有结果时显示结果，无结果时显示提示信息或加载状态。
  - 目标：提供评分结果的整体视图。

- **11.5.4 Rubric 评分项渲染组件**

  - 组件：`RubricItemEditor.vue` (或在 `GradingSidebar.vue` 内循环渲染)
  - 技术：`ElForm`, `ElFormItem`, `ElInputNumber` (编辑分数, `min`/`max` 来自 Profile), `ElInput` (type="textarea", `autosize`, 编辑理由)。
  - Props：`rubricItemData: RubricScoreClient`, `profileRubricItem: RubricItem` (用于获取 maxPoints 等定义)
  - 功能：
    - 展示单个评分标准的名称、描述、最高分。
    - 允许用户编辑该项的得分和文字理由。
    - 使用 `v-model` 双向绑定到 Pinia Store 中的 `currentGradingResult` 的对应项。
  - 目标：为每个评分标准提供独立的编辑区域。

- **11.5.5 总分计算与显示**

  - 位置：`GradingSidebar.vue` 或其子组件。
  - 技术：Vue 的计算属性 (computed property) 或 Pinia getter (`calculatedTotalScore`)。
  - 功能：动态计算并显示所有评分项的总分。
  - 目标：实时反馈总分变化。

- **11.5.6 状态更新与操作按钮**
  - 组件：`GradingActions.vue` (或集成在 `GradingSidebar.vue` 中)
  - 技术：`ElButton`
  - 功能：
    - "获取评分"按钮：触发 `gradingResultStore.fetchGradingResult` action (传递当前图片和 Profile)。
    - （可选）"保存当前编辑"按钮：如果需要将用户在前端的修改持久化（例如，更新 `gradingResultStore.history`，或未来同步到后端）。MVP 阶段可能仅更新内存状态。
    - （可选）"重置修改"按钮：撤销用户在当前结果上的编辑。
  - 目标：提供用户触发评分和管理编辑内容的操作。

通过以上更详细的技术路线和模块拆分，开发团队应该能更清晰地理解每个子模块的实现方式、依赖关系和关键技术点，从而更高效地进行开发和协作。
