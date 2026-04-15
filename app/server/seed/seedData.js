export const workoutPlansSeed = [
  // ===== 减脂 =====
  {
    id: 'plan_001',
    name: '全身燃脂训练',
    type: 'HIIT',
    duration: 35,
    calories: 320,
    difficulty: '中等难度',
    goal: '减脂',
    exercises: [
      { name: '深蹲', description: '标准深蹲 · 全程保持背部挺直', sets: 4, reps: 12, unit: '次', rest: 15, duration: 0 },
      { name: '俯卧撑', description: '标准俯卧撑 · 身体保持一条直线', sets: 3, reps: 15, unit: '次', rest: 15, duration: 0 },
      { name: '平板支撑', description: '核心收紧 · 呼吸均匀', sets: 3, reps: 60, unit: '秒', rest: 20, duration: 60 },
      { name: '开合跳', description: '轻盈跳跃 · 手臂完全伸展', sets: 3, reps: 30, unit: '秒', rest: 15, duration: 30 },
      { name: '弓步蹲', description: '左右交替 · 前膝不超过脚尖', sets: 3, reps: 16, unit: '次', rest: 15, duration: 0 },
      { name: '仰卧起坐', description: '腹部发力 · 不要拉脖子', sets: 3, reps: 20, unit: '次', rest: 15, duration: 0 }
    ]
  },
  {
    id: 'plan_002',
    name: '高效燃脂HIIT',
    type: 'HIIT',
    duration: 25,
    calories: 280,
    difficulty: '高强度',
    goal: '减脂',
    exercises: [
      { name: '波比跳', description: '全身爆发 · 动作连贯', sets: 4, reps: 10, unit: '次', rest: 20, duration: 0 },
      { name: '高抬腿', description: '膝盖抬至腰部 · 保持节奏', sets: 3, reps: 30, unit: '秒', rest: 15, duration: 30 },
      { name: '登山者', description: '核心稳定 · 快速交替', sets: 3, reps: 20, unit: '次', rest: 15, duration: 0 },
      { name: '深蹲跳', description: '爆发跳跃 · 落地缓冲', sets: 3, reps: 12, unit: '次', rest: 20, duration: 0 },
      { name: '俄罗斯转体', description: '核心发力 · 控制速度', sets: 3, reps: 20, unit: '次', rest: 15, duration: 0 }
    ]
  },
  {
    id: 'plan_003',
    name: '有氧燃脂慢跑',
    type: '有氧',
    duration: 40,
    calories: 350,
    difficulty: '低难度',
    goal: '减脂',
    exercises: [
      { name: '原地慢跑', description: '保持匀速 · 呼吸节奏', sets: 1, reps: 300, unit: '秒', rest: 0, duration: 300 },
      { name: '开合跳', description: '热身恢复', sets: 2, reps: 20, unit: '次', rest: 10, duration: 0 },
      { name: '高抬腿', description: '加速燃脂', sets: 2, reps: 20, unit: '次', rest: 10, duration: 0 },
      { name: '拉伸放松', description: '全身拉伸 · 深呼吸', sets: 1, reps: 120, unit: '秒', rest: 0, duration: 120 }
    ]
  },
  // ===== 增肌 =====
  {
    id: 'plan_004',
    name: '胸肩推力训练',
    type: '力量',
    duration: 45,
    calories: 280,
    difficulty: '中等难度',
    goal: '增肌',
    exercises: [
      { name: '俯卧撑', description: '宽距 · 胸部发力', sets: 4, reps: 15, unit: '次', rest: 20, duration: 0 },
      { name: '钻石俯卧撑', description: '窄距 · 三头肌发力', sets: 3, reps: 12, unit: '次', rest: 20, duration: 0 },
      { name: '肩上推举', description: '双手持物上推 · 核心收紧', sets: 4, reps: 12, unit: '次', rest: 20, duration: 0 },
      { name: '侧平举', description: '控制速度 · 感受肩部发力', sets: 3, reps: 15, unit: '次', rest: 15, duration: 0 },
      { name: '前平举', description: '交替抬起 · 不要耸肩', sets: 3, reps: 12, unit: '次', rest: 15, duration: 0 },
      { name: '平板支撑', description: '核心稳定 · 收紧腹部', sets: 3, reps: 45, unit: '秒', rest: 15, duration: 45 }
    ]
  },
  {
    id: 'plan_005',
    name: '背部核心训练',
    type: '力量',
    duration: 40,
    calories: 250,
    difficulty: '中等难度',
    goal: '增肌',
    exercises: [
      { name: '引体向上', description: '全程控制 · 慢下快上', sets: 4, reps: 8, unit: '次', rest: 20, duration: 0 },
      { name: '超人式', description: '俯卧抬起 · 感受背部收缩', sets: 3, reps: 15, unit: '次', rest: 15, duration: 0 },
      { name: '反向划船', description: '背部发力 · 肩胛骨收紧', sets: 4, reps: 12, unit: '次', rest: 20, duration: 0 },
      { name: '仰卧抬腿', description: '下腹发力 · 不要用惯性', sets: 3, reps: 15, unit: '次', rest: 15, duration: 0 },
      { name: '平板支撑', description: '核心稳定 · 匀速呼吸', sets: 3, reps: 45, unit: '秒', rest: 15, duration: 45 }
    ]
  },
  {
    id: 'plan_006',
    name: '腿部爆发训练',
    type: '力量',
    duration: 50,
    calories: 380,
    difficulty: '高强度',
    goal: '增肌',
    exercises: [
      { name: '深蹲', description: '臀部向后坐 · 膝盖不超过脚尖', sets: 5, reps: 15, unit: '次', rest: 20, duration: 0 },
      { name: '保加利亚分腿蹲', description: '后脚垫高 · 前腿发力', sets: 4, reps: 12, unit: '次', rest: 20, duration: 0 },
      { name: '罗马尼亚硬拉', description: '髋关节铰链 · 感受腿后侧', sets: 4, reps: 12, unit: '次', rest: 20, duration: 0 },
      { name: '小腿提踵', description: '顶峰收缩 · 控制下放', sets: 4, reps: 20, unit: '次', rest: 15, duration: 0 },
      { name: '弓步蹲', description: '交替进行 · 步幅适中', sets: 3, reps: 16, unit: '次', rest: 15, duration: 0 },
      { name: '臀桥', description: '顶峰保持2秒 · 臀部发力', sets: 3, reps: 15, unit: '次', rest: 15, duration: 0 }
    ]
  },
  // ===== 家庭训练 =====
  {
    id: 'plan_007',
    name: '居家全身训练',
    type: '综合',
    duration: 30,
    calories: 200,
    difficulty: '低难度',
    goal: '家庭训练',
    exercises: [
      { name: '徒手深蹲', description: '自重深蹲 · 量力而行', sets: 3, reps: 15, unit: '次', rest: 15, duration: 0 },
      { name: '俯卧撑', description: '可跪姿 · 保持标准', sets: 3, reps: 10, unit: '次', rest: 15, duration: 0 },
      { name: '平板支撑', description: '核心稳定 · 坚持住', sets: 2, reps: 30, unit: '秒', rest: 15, duration: 30 },
      { name: '仰卧起坐', description: '腹部发力', sets: 3, reps: 15, unit: '次', rest: 15, duration: 0 },
      { name: '开合跳', description: '轻松跳跃', sets: 2, reps: 20, unit: '次', rest: 10, duration: 0 }
    ]
  },
  {
    id: 'plan_008',
    name: '办公室拉伸放松',
    type: '拉伸',
    duration: 20,
    calories: 80,
    difficulty: '低难度',
    goal: '家庭训练',
    exercises: [
      { name: '颈部拉伸', description: '左右缓慢转动', sets: 1, reps: 60, unit: '秒', rest: 0, duration: 60 },
      { name: '肩部环绕', description: '前后各10圈', sets: 2, reps: 10, unit: '次', rest: 10, duration: 0 },
      { name: '猫牛式', description: '脊柱灵活 · 配合呼吸', sets: 2, reps: 10, unit: '次', rest: 10, duration: 0 },
      { name: '坐姿前屈', description: '拉伸腿后侧', sets: 1, reps: 45, unit: '秒', rest: 0, duration: 45 },
      { name: '胸部拉伸', description: '门框拉伸', sets: 1, reps: 30, unit: '秒', rest: 0, duration: 30 }
    ]
  }
]

export const weekPlanSeed = {
  '减脂': [
    { dayOrder: 0, day: '周一', name: '全身燃脂训练', duration: '35分钟', tags: ['6个动作', '燃脂'], planId: 'plan_001', isRest: false },
    { dayOrder: 1, day: '周二', name: '有氧燃脂慢跑', duration: '40分钟', tags: ['有氧', '耐力'], planId: 'plan_003', isRest: false },
    { dayOrder: 2, day: '周三', name: '主动恢复 · 休息日', duration: '', tags: ['拉伸放松'], planId: null, isRest: true },
    { dayOrder: 3, day: '周四', name: '高效燃脂HIIT', duration: '25分钟', tags: ['高强度', 'HIIT'], planId: 'plan_002', isRest: false },
    { dayOrder: 4, day: '周五', name: '全身燃脂训练', duration: '35分钟', tags: ['6个动作', '燃脂'], planId: 'plan_001', isRest: false },
    { dayOrder: 5, day: '周六', name: '户外跑步 + 拉伸', duration: '', tags: ['有氧'], planId: null, isRest: false },
    { dayOrder: 6, day: '周日', name: '完全休息日', duration: '', tags: ['休息'], planId: null, isRest: true }
  ],
  '增肌': [
    { dayOrder: 0, day: '周一', name: '胸肩推力训练', duration: '45分钟', tags: ['6个动作', '推力'], planId: 'plan_004', isRest: false },
    { dayOrder: 1, day: '周二', name: '背部核心训练', duration: '40分钟', tags: ['5个动作', '拉力'], planId: 'plan_005', isRest: false },
    { dayOrder: 2, day: '周三', name: '主动恢复 · 休息日', duration: '', tags: ['拉伸放松'], planId: null, isRest: true },
    { dayOrder: 3, day: '周四', name: '腿部爆发训练', duration: '50分钟', tags: ['6个动作', '高强度'], planId: 'plan_006', isRest: false },
    { dayOrder: 4, day: '周五', name: '胸肩推力训练', duration: '45分钟', tags: ['6个动作', '推力'], planId: 'plan_004', isRest: false },
    { dayOrder: 5, day: '周六', name: '背部核心训练', duration: '40分钟', tags: ['5个动作', '拉力'], planId: 'plan_005', isRest: false },
    { dayOrder: 6, day: '周日', name: '完全休息日', duration: '', tags: ['休息'], planId: null, isRest: true }
  ],
  '家庭训练': [
    { dayOrder: 0, day: '周一', name: '居家全身训练', duration: '30分钟', tags: ['5个动作'], planId: 'plan_007', isRest: false },
    { dayOrder: 1, day: '周二', name: '办公室拉伸放松', duration: '20分钟', tags: ['拉伸'], planId: 'plan_008', isRest: false },
    { dayOrder: 2, day: '周三', name: '居家全身训练', duration: '30分钟', tags: ['5个动作'], planId: 'plan_007', isRest: false },
    { dayOrder: 3, day: '周四', name: '休息日', duration: '', tags: ['休息'], planId: null, isRest: true },
    { dayOrder: 4, day: '周五', name: '居家全身训练', duration: '30分钟', tags: ['5个动作'], planId: 'plan_007', isRest: false },
    { dayOrder: 5, day: '周六', name: '办公室拉伸放松', duration: '20分钟', tags: ['拉伸'], planId: 'plan_008', isRest: false },
    { dayOrder: 6, day: '周日', name: '休息日', duration: '', tags: ['休息'], planId: null, isRest: true }
  ]
}
