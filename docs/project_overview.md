# Palace52 项目总览

## 1. 项目简介

Palace52 是一个全栈记忆训练 Web App，目标是帮助用户用记忆宫殿方法训练完整扑克牌牌组记忆。

项目核心训练方式是：

1. 用户创建或使用默认记忆宫殿路线。
2. 用户为 52 张扑克牌建立个人化图像系统，可以使用 person/action/object，也可以写自定义图像提示。
3. 系统生成洗牌后的训练牌组。
4. 用户在学习阶段把每张牌的图像放入宫殿地点。
5. 用户进入回忆阶段，按顺序输入记住的牌。
6. 系统评分、记录逐牌错误、生成弱项复习卡，并写入排行榜。

当前项目已经具备完整产品闭环的基础：登录、数据持久化、训练、评分、复习、历史记录、仪表盘和排行榜。

## 2. 当前已有功能

### 账号与受保护应用

- 使用 Clerk 处理注册、登录和会话。
- 受保护产品路由包括 dashboard、palaces、cards、training、sessions、reviews 和 leaderboard。
- `middleware.ts` 会保护核心应用页面，未登录用户会被 Clerk 拦截。
- `src/lib/auth.ts` 负责把 Clerk 用户同步为本地数据库用户。

### 新用户初始化

- `ensureStarterContent` 会为新用户创建默认内容。
- 默认内容包括：
  - 一个 `Home Palace` starter palace。
  - 一组 starter palace locations。
  - 52 张牌的 starter card images。

### 记忆宫殿

- 用户可以创建 palace。
- 用户可以为 palace 添加 ordered locations。
- 每个 location 可以有名称、描述和 sensory cue。
- 训练时，牌会按顺序映射到 palace locations；地点数量不足时会循环使用。

### 52 张牌图像系统

- 每个用户可以为每张牌保存个人化图像。
- 每张牌支持：
  - `person`
  - `action`
  - `object`
  - `imagePrompt`
  - `notes`
- 页面会展示完整 52 张牌，并允许逐张保存。

### 训练模式

- 用户可以在 `/training` 生成训练 session。
- 当前支持的 Prisma enum 模式包括：
  - `FULL_DECK`
  - `HALF_DECK`
  - `SPEED`
  - `REVIEW`
- 当前训练 UI 已暴露：
  - Full deck
  - Half deck
  - Speed deck
- `HALF_DECK` 会生成 26 张牌。
- 其他模式当前按完整 52 张牌训练。

### 评分与错误分类

- `src/lib/scoring.ts` 负责评分。
- 系统会按位置比较 expected deck 和 recalled cards。
- 错误类型包括：
  - `CORRECT`
  - `WRONG_CARD`
  - `WRONG_POSITION`
  - `MISSING`
  - `EXTRA`
- 完成 session 后会保存：
  - 总分
  - 准确率
  - 学习时间
  - 回忆时间
  - 每张牌的评分结果
  - 反馈文本

### 弱项复习

- 错误和 misplaced cards 会进入 `ReviewCard` 队列。
- `src/lib/spaced-repetition.ts` 使用类似 SM-2 的间隔复习逻辑。
- 复习卡记录：
  - interval days
  - ease factor
  - repetitions
  - lapses
  - due date
  - last reviewed time
- 用户可以在 `/reviews` 对复习卡打分：
  - Forgot
  - Hard
  - Easy

### 仪表盘

- `/dashboard` 展示训练概览。
- 当前指标包括：
  - best score
  - average accuracy
  - completed sessions
  - due reviews
  - weakest cards
  - improvement history chart
- 图表组件使用 Recharts。

### 训练历史

- `/sessions` 展示已完成 session。
- 每条 session 包含：
  - mode
  - score
  - palace
  - completed date
  - accuracy
  - study time
  - recall time
  - 最多 8 条错误反馈
- 完美回忆会显示成功提示。

### 排行榜

- `/leaderboard` 展示公开排行榜。
- 排名逻辑：
  - 分数高者优先。
  - 分数相同，总时间更短者优先。
- 每个完成的 session 会 upsert 一条 leaderboard entry。

## 3. 技术栈

- Framework: Next.js App Router
- UI: React
- Language: TypeScript
- Styling: Tailwind CSS
- Database ORM: Prisma
- Database: PostgreSQL
- Auth: Clerk
- Charts: Recharts
- Validation: Zod
- Icons: lucide-react
- Package manager: pnpm
- Deployment target: Vercel

## 4. 主要目录结构

```txt
src/
  app/
    (app)/                 真实产品路由，登录后使用
    (auth)/                Clerk sign-in 和 sign-up 页面
    actions/               Server actions
    api/health/            健康检查 API
    globals.css            全局样式和产品主题
    layout.tsx             Root layout 和 Clerk provider
    page.tsx               Public landing page
  components/
    app/                   App shell、图表、卡片展示组件
    build-palace/          旧版 palace builder demo 组件
    play/                  旧版 play demo 组件
    training/              训练 cockpit
    ui/                    Button、Card、Form 等基础组件
  lib/
    auth.ts                Clerk 用户同步和权限要求
    cards.ts               52 张牌定义和洗牌逻辑
    dashboard.ts           Dashboard 聚合统计
    defaults.ts            Starter palace 和 starter card images
    prisma.ts              Prisma singleton
    sample-palace.ts       旧版 sample/demo 数据
    scoring.ts             回忆评分逻辑
    spaced-repetition.ts   间隔复习调度逻辑
    utils.ts               格式化和工具函数
prisma/
  schema.prisma            Prisma 数据模型
docs/
  architecture.md          架构说明
  local-testing.md         本地测试清单
```

## 5. 页面路由

### 真实产品路由

- `/dashboard`: 训练仪表盘。
- `/palaces`: 记忆宫殿和地点管理。
- `/cards`: 52 张牌图像系统。
- `/training`: 洗牌训练、学习、回忆和评分。
- `/sessions`: 训练历史和错误回顾。
- `/reviews`: 弱项牌间隔复习。
- `/leaderboard`: 排行榜。

### 认证路由

- `/sign-in`: Clerk 登录页面。
- `/sign-up`: Clerk 注册页面。

### Public / 其他路由

- `/`: Public landing page。
- `/api/health`: 健康检查，检查 app、database URL、Clerk keys 和数据库连接。

### 旧版 sample/demo 路由

这些页面主要使用 sample data 或早期原型组件，后续应该统一整理：

- `/play`
- `/build-palace`
- `/my-memory-palace`
- `/preview`
- `/leaderboard-dashboard`

建议后续把这些页面重定向到真实产品路由，或明确标注为 demo/preview，避免用户误入两套体验。

## 6. 数据模型概览

核心 Prisma schema 位于 `prisma/schema.prisma`。

### User

本地用户模型，使用 `clerkUserId` 关联 Clerk 用户。

主要关联：

- palaces
- cardImages
- sessions
- reviewCards
- leaderboardRows

### Palace

用户拥有的记忆宫殿。

主要字段：

- name
- description
- isDefault

主要关联：

- user
- locations
- sessions

### PalaceLocation

记忆宫殿中的有序地点。

主要字段：

- name
- description
- order
- cue

同一个 palace 内 `order` 唯一。

### CardImage

用户对某张牌的个人化图像系统。

主要字段：

- rank
- suit
- person
- action
- object
- imagePrompt
- notes

同一用户的同一张牌只能有一条记录。

### TrainingSession

一次训练 session。

主要字段：

- mode
- status
- deck
- recall
- score
- accuracy
- memorizationMs
- recallMs
- completedAt

主要关联：

- user
- palace
- cardResults
- leaderboardEntry

### SessionCardResult

一次训练中单张牌的评分结果。

主要字段：

- expectedRank
- expectedSuit
- recalledRank
- recalledSuit
- expectedIndex
- recalledIndex
- isCorrect
- mistakeType
- feedback

### ReviewCard

弱项牌的间隔复习状态。

主要字段：

- rank
- suit
- intervalDays
- easeFactor
- repetitions
- lapses
- dueAt
- lastReviewedAt

同一用户的同一张牌只能有一条复习记录。

### LeaderboardEntry

排行榜记录，每个完成的 training session 对应一条。

主要字段：

- mode
- score
- accuracy
- memorizationMs
- recallMs
- totalTimeMs

## 7. 核心业务流程

### 新用户初始化流程

1. 用户进入 dashboard 或 training。
2. 页面调用 `ensureStarterContent`。
3. 系统检查该用户是否已有 palace 和 card images。
4. 如果没有 palace，则创建默认 `Home Palace` 和 starter locations。
5. 如果没有 card images，则创建 starter 52-card image system。

### 训练流程

1. 用户在 `/training` 选择 palace route 和 mode。
2. `createTrainingSession` 生成洗牌后的 deck。
3. 系统保存 `TrainingSession`，状态为 `IN_PROGRESS`。
4. 前端进入 study phase，展示每张牌、宫殿地点和 image prompt。
5. 用户点击 start recall。
6. 前端记录 memorization time，并进入 recall phase。
7. 用户按顺序输入回忆的牌。
8. 用户提交后调用 `completeTrainingSession`。

### 评分流程

1. 系统读取 session 中的 expected deck。
2. `scoreRecall` 对比 expected deck 和 recalled codes。
3. 系统生成总分、准确率、逐牌结果和反馈。
4. 数据库事务中更新 training session。
5. 删除旧的 card results。
6. 写入新的 `SessionCardResult`。
7. 对错误牌 upsert `ReviewCard`。
8. upsert `LeaderboardEntry`。
9. revalidate dashboard、sessions、reviews 和 leaderboard。

### 复习流程

1. 错误牌进入 `ReviewCard` 队列。
2. `/reviews` 按 due date 和 lapses 排序展示复习卡。
3. 用户选择 Forgot、Hard 或 Easy。
4. `gradeReviewCard` 根据评分调用 `nextReviewState`。
5. 系统更新 interval、ease factor、repetitions、lapses 和 due date。

### 排行榜流程

1. 完成训练 session 时写入或更新 leaderboard entry。
2. `/leaderboard` 查询前 50 条记录。
3. 查询按 `score desc` 和 `totalTimeMs asc` 排序。

## 8. 本地运行

项目使用 pnpm。

推荐流程：

```bash
pnpm install
cp .env.example .env.local
pnpm prisma:migrate
pnpm dev
```

打开：

```txt
http://localhost:3000
```

健康检查：

```txt
http://localhost:3000/api/health
```

`.env.local` 需要配置以下变量名：

```env
DATABASE_URL="..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```

不要把真实 `.env.local`、数据库密码或 Clerk secret 提交到仓库。

## 9. 验证命令

常用验证命令：

```bash
pnpm prisma:generate
pnpm typecheck
pnpm lint
pnpm build
```

组合验证命令：

```bash
pnpm verify
```

注意：

- `pnpm build` 可能需要访问 Google font assets 或其他构建资源。
- 本地需要 Node.js 22 或更新版本。
- 当前项目根目录已有 `node_modules` 和 `.next`，说明曾经运行过安装或构建相关流程。

## 10. 当前状态

### 已确认

- 项目是 Next.js App Router 全栈应用。
- 真实产品功能主要集中在 `src/app/(app)`。
- 旧 demo/sample 页面仍存在，主要依赖 `src/lib/sample-palace.ts`。
- TypeScript 检查已通过。
- ESLint 检查已通过。

### 环境注意事项

- 当前普通 shell PATH 中找不到 `node`、`npm` 和 `pnpm`。
- Codex 桌面环境提供了捆绑 Node runtime，可以用于执行 TypeScript 和 ESLint 验证。
- 如果要在普通终端运行项目，需要先安装或配置 Node.js、corepack 和 pnpm。

## 11. 下一步建议

当前阶段不急着上线，推荐先继续做功能和界面完成度。

### 优先级 1: 训练体验升级

- 给 `/training` 增加可见计时器、进度和阶段状态。
- 改善回忆输入体验，避免 52 个长下拉框太慢。
- 增加重复牌提示、未填项提示和提交前检查。
- 结果页增加完整错题对照和错误类型筛选。
- 明确 `SPEED` 模式的特殊规则。

### 优先级 2: 复习系统升级

- `/reviews` 默认突出 due cards。
- 增加 Upcoming 视图。
- 做成真正的 recall/reveal/grade 复习流程。
- 复习后显示下一次 due 时间和 interval 变化。

### 优先级 3: 宫殿和卡片管理

- `/palaces` 增加编辑、删除、重排地点。
- `/cards` 增加按花色分组。
- `/cards` 增加完成度统计。
- `/cards` 增加只看未完成或已完成筛选。
- 卡片保存后增加成功和失败反馈。

### 优先级 4: UI 和产品质感

- 统一真实产品页面和旧 demo 页面视觉语言。
- 整理旧路由，避免出现两套不同产品体验。
- 改善移动端训练、卡片编辑和排行榜体验。
- 补齐空状态、加载状态、错误状态和 pending 状态。

### 优先级 5: 上线前准备

上线可以放到后期，接近完成品后再处理：

- 生产 PostgreSQL。
- Clerk production 配置。
- Vercel 环境变量。
- Prisma migration。
- 完整手动验收。
- 部署后健康检查。

## 12. 不包含的内容

本文件是项目级总览，不包含：

- 源码全文。
- `pnpm-lock.yaml` 全文。
- `.next` 构建产物。
- `node_modules` 内容。
- 真实 `.env.local`。
- 数据库密码。
- Clerk secret。
- 机器本地缓存路径中的敏感信息。

这些内容不适合写进项目说明文档。
