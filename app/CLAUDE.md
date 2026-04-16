# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FitPro — a Chinese-language mobile fitness training app. Vue 3 + Vite frontend with Express + MongoDB backend. Dark theme UI optimized for mobile viewports.

## Commands

**Frontend (from project root):**
- `npm run dev` — start Vite dev server (port 5173)
- `npm run build` — production build to `dist/`
- `npm run test` — run frontend unit & component tests (Vitest)
- `npm run test:watch` — run tests in watch mode
- `npm run test:coverage` — run tests with coverage report

**Backend (from `server/` directory):**
- `npm run dev` — start server with `node --watch` (port 3001)
- `npm run seed` — seed MongoDB with plans, week plans, and exercise library
- `npm run test` — run backend unit & integration tests (Vitest + Supertest + in-memory MongoDB)
- `npm run test:watch` — run tests in watch mode
- `npm run test:coverage` — run tests with coverage report

Both must run simultaneously for development. Vite proxies `/api` requests to `http://localhost:3001`.

## Architecture

### Frontend

- **No TypeScript, no Pinia/Vuex.** Pure Vue 3 Composition API with `<script setup>` SFCs.
- **8 views:** Home, Plan, PlanEdit, Workout, Stats, Profile, CheckIn, Login
- **3 shared components:** ExerciseCard, TabBar, Timer (in `src/components/`)
- **API client** (`src/utils/api.js`): Hand-rolled `fetch` wrapper with JWT auto-refresh on 401. Tokens stored in `localStorage` as `sports_token` / `sports_refresh_token`. Exports: `auth`, `users`, `plans`, `records`, `checkin`, `exercises`.
- **Storage layer** (`src/utils/storage.js`): Async wrapper over `api.js` with in-memory caching. Preserves original function signatures from the pre-backend localStorage era.
- **Router** (`src/router/index.js`): Global `beforeEach` guard redirects unauthenticated users to `/login`. TabBar hidden on `/workout`, `/checkin`, `/login`, and routes with `meta.hideTabBar`.

### Backend

- **Express 4 + Mongoose 8** on port 3001. Config via `server/.env` (see `server/.env.example`).
- **6 route groups:** `/api/auth`, `/api/users`, `/api/plans`, `/api/records`, `/api/checkin`, `/api/exercises` — all auth-protected via `authMiddleware`.
- **6 Mongoose models:** User, WorkoutPlan (embedded exercises), WeekPlan, WorkoutRecord, CheckIn, Exercise (library).
- **JWT auth:** Access token 1h, refresh token 30d. Middleware in `server/middleware/auth.js`.
- **WeekPlan lazy init:** Template plans (`user: null`) are cloned per-user on first `GET /week-plan/list` access. Each user-goal combo gets independent weekly schedule.
- **Atomic record creation:** `POST /api/records` creates WorkoutRecord + CheckIn + updates User stats + recalculates streak in one operation.
- **Streak/achievements:** Server-side logic in `server/utils/streak.js`.

### Data Flow

```
Plan.vue → PlanEdit.vue (configure exercises) → Workout.vue (execute training)
                                          ↓
                                   POST /api/records (atomic)
                                          ↓
                                   CheckIn.vue / Stats.vue
```

Custom exercises are passed from PlanEdit to Workout via `router.push` with `history.state.customExercises`.

### Design System

- Dark theme: `#0a0a0a` background, `#141414` cards, `#39ff14` accent (green)
- Font: Inter (loaded from `src/assets/fonts/`)
- Icons: Static PNGs in `src/assets/images/` — no icon library
- Bottom-sheet modals: Use `<Teleport to="body">` with CSS transitions (pattern in Profile.vue, Plan.vue, PlanEdit.vue)
- Mobile-first: Viewport locked to `maximum-scale=1.0, user-scalable=no`

## Key Conventions

- All user-facing text is in Chinese (Simplified)
- Exercise duration fields use seconds internally; displayed as minutes in UI
- `goal` field enum: `'增肌'` (muscle), `'减脂'` (fat loss), `'家庭训练'` (home)
- WeekPlan `dayOrder`: 0=Monday through 6=Sunday
- WorkoutPlan `id` field is a custom string (e.g., `'plan_001'`), not MongoDB `_id`

## Testing

### Testing Stack

- **Frontend:** Vitest + @vue/test-utils + jsdom
- **Backend:** Vitest + Supertest + MongoDB (本地 `mongodb://localhost:27017/fitpro_test`)
- **Coverage:** @vitest/coverage-v8

**注意:** 后端集成测试需要本地 MongoDB 服务运行。CI 环境使用 GitHub Actions MongoDB service container。

### Test Directory Structure

```
src/tests/
  unit/          # 前端单元测试 (api, storage)
  components/    # 前端组件测试 (Timer, ExerciseCard, TabBar)
server/tests/
  unit/          # 后端单元测试 (streak, 纯函数)
  integration/   # 后端集成测试 (auth, users, records, exercises, plans)
```

### TDD Workflow (测试驱动开发)

新增功能或修复 bug 时，**必须先写测试**：

1. **Red** — 写一个失败的测试，描述期望行为
2. **Green** — 编写最少代码使测试通过
3. **Refactor** — 重构代码，确保测试仍然通过

### Test Writing Guidelines

- **后端集成测试**: 使用 `tests/helper.js` 的 `connectDB/disconnectDB/clearDB` 管理数据库生命周期，每个测试文件独立启停 MongoMemoryServer
- **后端纯函数**: 直接导入测试，不需要数据库
- **前端组件**: 使用 `@vue/test-utils` 的 `mount`，mock `localStorage` 和 `fetch`
- **前端工具函数**: mock 依赖模块，测试正常路径和异常降级

### CI Acceptance Criteria (CI 验收标准)

**所有 CI 检查通过是合并 PR 的前提条件。** GitHub Actions CI workflow (`.github/workflows/ci.yml`) 包含：

1. **Build** — 前端构建必须成功
2. **Backend Tests** — 后端所有测试必须通过
3. **Frontend Tests** — 前端所有测试必须通过
4. **CI Gate** — 以上全部成功才算 CI 通过

**规则：**
- 任何 PR 必须等 CI 全绿才能合并
- 新增功能必须附带测试
- 修复 bug 必须附带回归测试
- 不允许跳过或注释掉失败的测试
