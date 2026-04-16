import { describe, it, expect } from 'vitest'
import { checkAchievements } from '../../utils/streak.js'

describe('checkAchievements', () => {
  function makeUser(overrides = {}) {
    return {
      totalWorkouts: 0,
      streak: 0,
      achievements: [
        { id: 1, name: '初次打卡', icon: 'star', unlocked: false },
        { id: 2, name: '连续7天', icon: 'flame', unlocked: false },
        { id: 3, name: '累计10次', icon: 'dumbbell', unlocked: false },
        { id: 4, name: '连续30天', icon: 'crown', unlocked: false }
      ],
      ...overrides
    }
  }

  it('应在首次训练时解锁「初次打卡」', () => {
    const user = makeUser({ totalWorkouts: 1 })
    const unlocked = checkAchievements(user)
    expect(unlocked).toContain(1)
    expect(user.achievements.find(a => a.id === 1).unlocked).toBe(true)
  })

  it('不应重复解锁已获得的成就', () => {
    const user = makeUser({ totalWorkouts: 5 })
    user.achievements.find(a => a.id === 1).unlocked = true
    const unlocked = checkAchievements(user)
    expect(unlocked).not.toContain(1)
  })

  it('应在连续7天时解锁「连续7天」', () => {
    const user = makeUser({ streak: 7 })
    const unlocked = checkAchievements(user)
    expect(unlocked).toContain(2)
  })

  it('应在累计10次时解锁「累计10次」', () => {
    const user = makeUser({ totalWorkouts: 10 })
    const unlocked = checkAchievements(user)
    expect(unlocked).toContain(3)
  })

  it('应在连续30天时解锁「连续30天」', () => {
    const user = makeUser({ streak: 30 })
    const unlocked = checkAchievements(user)
    expect(unlocked).toContain(4)
  })

  it('不应在条件不满足时解锁任何成就', () => {
    const user = makeUser({ totalWorkouts: 0, streak: 0 })
    const unlocked = checkAchievements(user)
    expect(unlocked).toHaveLength(0)
  })

  it('可同时解锁多个成就', () => {
    const user = makeUser({ totalWorkouts: 15, streak: 10 })
    const unlocked = checkAchievements(user)
    expect(unlocked).toContain(1)
    expect(unlocked).toContain(2)
    expect(unlocked).toContain(3)
    expect(unlocked).toHaveLength(3)
  })

  it('边界值: totalWorkouts=0 不解锁初次打卡', () => {
    const user = makeUser({ totalWorkouts: 0 })
    const unlocked = checkAchievements(user)
    expect(unlocked).not.toContain(1)
  })

  it('边界值: streak=6 不解锁连续7天', () => {
    const user = makeUser({ streak: 6 })
    const unlocked = checkAchievements(user)
    expect(unlocked).not.toContain(2)
  })

  it('边界值: streak=29 不解锁连续30天', () => {
    const user = makeUser({ streak: 29 })
    const unlocked = checkAchievements(user)
    expect(unlocked).not.toContain(4)
  })
})
