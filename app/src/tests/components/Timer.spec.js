import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import Timer from '../../components/Timer.vue'

describe('Timer.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应正确显示初始时间', () => {
    const wrapper = mount(Timer, {
      props: { seconds: 90 }
    })

    expect(wrapper.text()).toContain('01:30')
  })

  it('应显示 00:00 当 seconds=0', () => {
    const wrapper = mount(Timer, {
      props: { seconds: 0 }
    })

    expect(wrapper.text()).toContain('00:00')
  })

  it('手动 start 后应开始倒计时', async () => {
    const wrapper = mount(Timer, {
      props: { seconds: 5 }
    })

    wrapper.vm.start()
    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('00:04')
  })

  it('stop 后应停止倒计时', async () => {
    const wrapper = mount(Timer, {
      props: { seconds: 5 }
    })

    wrapper.vm.start()
    vi.advanceTimersByTime(2000)
    await wrapper.vm.$nextTick()

    wrapper.vm.stop()
    vi.advanceTimersByTime(3000)
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('00:03')
  })

  it('倒计时结束应触发 complete 事件', async () => {
    const wrapper = mount(Timer, {
      props: { seconds: 2 }
    })

    wrapper.vm.start()
    vi.advanceTimersByTime(3000)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('complete')).toBeTruthy()
  })

  it('每秒应触发 tick 事件', async () => {
    const wrapper = mount(Timer, {
      props: { seconds: 3 }
    })

    wrapper.vm.start()
    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('tick')).toBeTruthy()
    expect(wrapper.emitted('tick')[0]).toEqual([2])
  })

  it('reset 方法应重置到初始时间', async () => {
    const wrapper = mount(Timer, {
      props: { seconds: 10 }
    })

    wrapper.vm.start()
    vi.advanceTimersByTime(5000)
    await wrapper.vm.$nextTick()

    wrapper.vm.reset()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('00:10')
  })

  it('seconds prop 变化应更新显示', async () => {
    const wrapper = mount(Timer, {
      props: { seconds: 60 }
    })

    expect(wrapper.text()).toContain('01:00')

    await wrapper.setProps({ seconds: 120 })
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('02:00')
  })

  it('isRunning 应添加 active class', () => {
    const wrapper = mount(Timer, {
      props: { seconds: 60, isRunning: true }
    })

    expect(wrapper.find('.timer-display').classes()).toContain('active')
  })

  it('remaining 应可访问', () => {
    const wrapper = mount(Timer, {
      props: { seconds: 42 }
    })

    expect(wrapper.vm.remaining).toBe(42)
  })
})
