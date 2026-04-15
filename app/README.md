# FitPro - 移动端健身训练应用

一款面向中文用户的移动端健身训练应用，提供训练计划制定、训练执行记录、打卡签到、数据统计等完整功能。

## 功能概览

### 训练计划

- **预设训练计划**：内置增肌、减脂、家庭训练三大目标方向的多套训练计划
- **自定义计划编辑**：支持添加/删除/拖拽排序训练动作，自由组合训练内容
- **周期化管理**：基于 WeekPlan 的周计划系统，每周自动生成训练日程，支持不同目标独立排期
- **动作库**：内置丰富的动作库，支持按部位/类型筛选

### 训练执行

- **计时器**：内置训练计时器，支持动作间休息计时
- **实时记录**：训练过程中实时记录每组次数/重量/时长
- **自定义动作**：支持在训练中添加自定义动作

### 打卡与成就

- **每日签到**：训练完成后自动打卡，支持手动补签
- **连续打卡统计**：自动计算连续训练天数
- **成就系统**：基于服务器端逻辑的成就计算

### 数据统计

- **训练数据可视化**：展示训练频率、训练时长等历史数据
- **个人统计面板**：查看累计训练次数、总时长等个人数据

### 用户系统

- **注册/登录**：基于 JWT 的用户认证系统
- **个人资料管理**：支持修改个人信息、目标设置
- **暗色主题 UI**：专为移动端优化的暗色界面设计

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3（Composition API + `<script setup>`） |
| 构建工具 | Vite 8 |
| 路由 | Vue Router 4 |
| 后端框架 | Express 4 |
| 数据库 | MongoDB（Mongoose 8） |
| 认证 | JWT（Access Token + Refresh Token） |
| 样式 | 纯 CSS（暗色主题，移动端优先） |

## 项目结构

```
app/
├── src/                        # 前端源码
│   ├── views/                  # 页面视图
│   │   ├── Home.vue            # 首页（今日训练概览）
│   │   ├── Plan.vue            # 训练计划列表
│   │   ├── PlanEdit.vue        # 计划编辑（添加/排序动作）
│   │   ├── Workout.vue         # 训练执行页（计时器+记录）
│   │   ├── CheckIn.vue         # 打卡页面
│   │   ├── Stats.vue           # 数据统计
│   │   ├── Profile.vue         # 个人中心
│   │   ├── Login.vue           # 登录/注册
│   │   └── Exercises.vue       # 动作库
│   ├── components/             # 公共组件
│   │   ├── TabBar.vue          # 底部导航栏
│   │   ├── ExerciseCard.vue    # 动作卡片
│   │   └── Timer.vue           # 训练计时器
│   ├── router/                 # 路由配置
│   ├── utils/                  # 工具模块
│   │   ├── api.js              # API 请求封装（JWT 自动刷新）
│   │   └── storage.js          # 数据存储层（带内存缓存）
│   └── assets/                 # 静态资源（字体、图标）
├── server/                     # 后端源码
│   ├── server.js               # 服务入口
│   ├── models/                 # Mongoose 数据模型
│   │   ├── User.js             # 用户
│   │   ├── WorkoutPlan.js      # 训练计划
│   │   ├── WeekPlan.js         # 周计划
│   │   ├── WorkoutRecord.js    # 训练记录
│   │   ├── CheckIn.js          # 打卡记录
│   │   └── Exercise.js         # 动作库
│   ├── routes/                 # API 路由
│   │   ├── auth.js             # /api/auth    认证
│   │   ├── users.js            # /api/users   用户
│   │   ├── plans.js            # /api/plans   计划
│   │   ├── records.js          # /api/records 训练记录
│   │   ├── checkin.js          # /api/checkin 打卡
│   │   └── exercises.js        # /api/exercises 动作库
│   ├── middleware/             # 中间件（JWT 鉴权）
│   ├── utils/                  # 工具（打卡连续天数计算等）
│   ├── seed/                   # 数据库种子脚本
│   └── .env.example            # 环境变量模板
└── vite.config.js              # Vite 配置（含 API 代理）
```

## 环境要求

- **Node.js** >= 18
- **MongoDB** >= 6.0
- **npm** >= 9

## 安装步骤

### 1. 克隆项目

```bash
git clone <repository-url>
cd app
```

### 2. 安装前端依赖

```bash
npm install
```

### 3. 安装后端依赖

```bash
cd server
npm install
```

### 4. 配置环境变量

```bash
cd server
cp .env.example .env
```

编辑 `server/.env`，修改以下配置：

```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/sports_app
JWT_SECRET=替换为你的密钥
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=30d
```

> 确保 MongoDB 已启动并且连接地址正确。

### 5. 初始化数据库（可选）

首次使用时，运行种子脚本导入预设训练计划和动作库：

```bash
cd server
npm run seed
```

## 启动开发

需要同时启动前端和后端两个服务。

### 终端 1 — 启动后端

```bash
cd server
npm run dev
```

后端运行在 `http://localhost:3001`。

### 终端 2 — 启动前端

```bash
npm run dev
```

前端运行在 `http://localhost:5173`，Vite 会自动将 `/api` 请求代理到后端。

打开浏览器访问 `http://localhost:5173` 即可使用。

## 生产构建

```bash
# 构建前端
npm run build

# 启动后端生产服务
cd server
npm start
```

构建产物输出到 `dist/` 目录，可部署到任意静态文件服务器（Nginx、Apache 等）。

## API 接口

| 分组 | 路径 | 说明 |
|------|------|------|
| 认证 | `POST /api/auth/register` | 用户注册 |
| 认证 | `POST /api/auth/login` | 用户登录 |
| 认证 | `POST /api/auth/refresh` | 刷新 Token |
| 用户 | `GET /api/users/profile` | 获取个人信息 |
| 用户 | `PUT /api/users/profile` | 更新个人信息 |
| 计划 | `GET /api/plans` | 获取训练计划列表 |
| 计划 | `POST /api/plans` | 创建自定义计划 |
| 计划 | `GET /api/week-plan/list` | 获取周计划（首次自动初始化） |
| 记录 | `POST /api/records` | 提交训练记录（原子操作） |
| 记录 | `GET /api/records` | 获取训练历史 |
| 打卡 | `GET /api/checkin` | 获取打卡记录 |
| 打卡 | `POST /api/checkin` | 手动打卡 |
| 动作库 | `GET /api/exercises` | 获取动作列表 |

> 除登录和注册外，所有接口均需在请求头中携带 JWT：`Authorization: Bearer <token>`。

## 设计规范

- **暗色主题**：背景 `#0a0a0a`，卡片 `#141414`，强调色 `#39ff14`（荧光绿）
- **字体**：Inter
- **移动端优先**：视口锁定 `maximum-scale=1.0, user-scalable=no`
- **底部弹出面板**：使用 `<Teleport to="body">` + CSS 过渡动画实现

## 页面截图预览

| 页面 | 说明 |
|------|------|
| 首页 | 今日训练计划概览与快捷入口 |
| 计划页 | 按目标分类的训练计划列表 |
| 计划编辑 | 拖拽排序动作、自定义训练内容 |
| 训练页 | 计时器 + 实时记录训练数据 |
| 打卡页 | 日历视图查看打卡记录 |
| 统计页 | 训练数据可视化 |
| 个人中心 | 个人信息与设置 |

## License

Private
