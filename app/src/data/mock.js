// 训练计划数据
const workoutPlans = {
  plan_001: {
    id: 'plan_001',
    name: '全身燃脂训练',
    type: 'HIIT',
    duration: 35,
    calories: 320,
    difficulty: '中等难度',
    exercises: [
      {
        name: '深蹲',
        description: '标准深蹲 · 全程保持背部挺直',
        sets: 4,
        reps: 12,
        unit: '次',
        rest: 15,
        duration: 0
      },
      {
        name: '俯卧撑',
        description: '标准俯卧撑 · 身体保持一条直线',
        sets: 3,
        reps: 15,
        unit: '次',
        rest: 15,
        duration: 0
      },
      {
        name: '平板支撑',
        description: '核心收紧 · 呼吸均匀',
        sets: 3,
        reps: 60,
        unit: '秒',
        rest: 20,
        duration: 60
      },
      {
        name: '开合跳',
        description: '轻盈跳跃 · 手臂完全伸展',
        sets: 3,
        reps: 30,
        unit: '秒',
        rest: 15,
        duration: 30
      },
      {
        name: '弓步蹲',
        description: '左右交替 · 前膝不超过脚尖',
        sets: 3,
        reps: 16,
        unit: '次',
        rest: 15,
        duration: 0
      },
      {
        name: '仰卧起坐',
        description: '腹部发力 · 不要拉脖子',
        sets: 3,
        reps: 20,
        unit: '次',
        rest: 15,
        duration: 0
      }
    ]
  }
}

// 周计划数据
const weekPlan = [
  { day: '周一', label: '今天', name: '胸肩推力训练', duration: '45分钟', tags: ['6个动作'], planId: 'plan_001' },
  { day: '周二', label: '明天', name: '背部核心训练', duration: '40分钟', tags: ['5个动作'], planId: 'plan_001' },
  { day: '周三', label: '后天', name: '主动恢复 · 休息日', duration: '', tags: ['拉伸放松'], planId: null, isRest: true },
  { day: '周四', label: '', name: '腿部爆发训练', duration: '50分钟', tags: ['高强度'], planId: 'plan_001' },
  { day: '周五', label: '', name: '全身HIIT冲刺', duration: '35分钟', tags: ['燃脂'], planId: 'plan_001' },
  { day: '周六', label: '', name: '户外跑步 + 拉伸', duration: '', tags: ['有氧'], planId: null },
  { day: '周日', label: '', name: '完全休息日', duration: '', tags: ['休息'], planId: null, isRest: true }
]

// 激励文案
const motivations = [
  '坚持就是胜利，继续保持！',
  '今天的汗水，是明天的勋章！',
  '每一步都是进步！',
  '你比昨天更强了！',
  '没有捷径，只有坚持！',
  '今天的努力，未来的你会感谢！',
  '挑战自己，超越极限！'
]

// 默认用户数据
const defaultUser = {
  nickname: '健身达人',
  avatar: '',
  streak: 3,
  goal: '减脂',
  totalWorkouts: 12,
  totalMinutes: 420,
  achievements: [
    { id: 1, name: '初次打卡', icon: 'star', unlocked: true },
    { id: 2, name: '连续7天', icon: 'flame', unlocked: false },
    { id: 3, name: '累计10次', icon: 'dumbbell', unlocked: true },
    { id: 4, name: '连续30天', icon: 'crown', unlocked: false }
  ]
}

export { workoutPlans, weekPlan, motivations, defaultUser }
