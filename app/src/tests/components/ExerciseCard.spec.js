import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExerciseCard from '../../components/ExerciseCard.vue'

const mockExercise = {
  name: '俯卧撑',
  sets: 3,
  reps: 15,
  unit: '次'
}

describe('ExerciseCard.vue', () => {
  it('应渲染动作名称和详情', () => {
    const wrapper = mount(ExerciseCard, {
      props: { exercise: mockExercise, index: 0 }
    })

    expect(wrapper.text()).toContain('俯卧撑')
    expect(wrapper.text()).toContain('3组 x 15次')
  })

  it('应显示正确的序号', () => {
    const wrapper = mount(ExerciseCard, {
      props: { exercise: mockExercise, index: 2 }
    })

    expect(wrapper.find('.exercise-number').text()).toBe('3')
  })

  it('默认状态应显示"待完成"', () => {
    const wrapper = mount(ExerciseCard, {
      props: { exercise: mockExercise, index: 0 }
    })

    expect(wrapper.find('.exercise-status').text()).toBe('待完成')
  })

  it('isCurrent=true 应显示"进行中"', () => {
    const wrapper = mount(ExerciseCard, {
      props: { exercise: mockExercise, index: 0, isCurrent: true }
    })

    expect(wrapper.find('.exercise-status').text()).toBe('进行中')
    expect(wrapper.find('.exercise-card').classes()).toContain('current')
  })

  it('isCompleted=true 应显示勾号', () => {
    const wrapper = mount(ExerciseCard, {
      props: { exercise: mockExercise, index: 0, isCompleted: true }
    })

    expect(wrapper.find('.exercise-status').text()).toContain('✓')
    expect(wrapper.find('.exercise-card').classes()).toContain('completed')
  })

  it('isCurrent 优先于 isCompleted', () => {
    const wrapper = mount(ExerciseCard, {
      props: { exercise: mockExercise, index: 0, isCurrent: true, isCompleted: true }
    })

    expect(wrapper.find('.exercise-status').text()).toBe('进行中')
  })
})
