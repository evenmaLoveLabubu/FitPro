import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import TabBar from '../../components/TabBar.vue'

function createTestRouter(initialPath = '/') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>home</div>' } },
      { path: '/plan', component: { template: '<div>plan</div>' } },
      { path: '/stats', component: { template: '<div>stats</div>' } },
      { path: '/profile', component: { template: '<div>profile</div>' } }
    ]
  })
  router.push(initialPath)
  return router
}

describe('TabBar.vue', () => {
  it('应渲染 4 个 tab', async () => {
    const router = createTestRouter('/')
    const wrapper = mount(TabBar, {
      global: { plugins: [router] }
    })
    await router.isReady()

    const tabs = wrapper.findAll('.tab-item')
    expect(tabs).toHaveLength(4)
  })

  it('应显示正确的 tab 标签', async () => {
    const router = createTestRouter('/')
    const wrapper = mount(TabBar, {
      global: { plugins: [router] }
    })
    await router.isReady()

    const labels = wrapper.findAll('.tab-label').map(el => el.text())
    expect(labels).toEqual(['首页', '计划', '统计', '我的'])
  })

  it('当前路由应有 active class', async () => {
    const router = createTestRouter('/')
    const wrapper = mount(TabBar, {
      global: { plugins: [router] }
    })
    await router.isReady()

    const tabs = wrapper.findAll('.tab-item')
    expect(tabs[0].classes()).toContain('active')
    expect(tabs[1].classes()).not.toContain('active')
  })

  it('切换路由后 active 应更新', async () => {
    const router = createTestRouter('/')
    const wrapper = mount(TabBar, {
      global: { plugins: [router] }
    })
    await router.isReady()

    expect(wrapper.findAll('.tab-item')[0].classes()).toContain('active')

    await router.push('/plan')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('.tab-item')[0].classes()).not.toContain('active')
    expect(wrapper.findAll('.tab-item')[1].classes()).toContain('active')
  })

  it('tab 应为 router-link', async () => {
    const router = createTestRouter('/')
    const wrapper = mount(TabBar, {
      global: { plugins: [router] }
    })
    await router.isReady()

    const tabs = wrapper.findAll('a')
    expect(tabs).toHaveLength(4)
    expect(tabs[0].attributes('href')).toBe('/')
    expect(tabs[1].attributes('href')).toBe('/plan')
  })
})
