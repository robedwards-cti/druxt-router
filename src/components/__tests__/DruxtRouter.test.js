import mockAxios from 'jest-mock-axios'
import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import { DruxtRouter, DruxtRouterComponent, DruxtRouterStore } from '../..'

jest.mock('axios')

// Setup local vue instance.
const localVue = createLocalVue()
localVue.use(Vuex)

const stubs = ['DruxtEntity']

let store

const mountComponent = (fullpath) => {
  const mocks = {
    $fetchState: {
      pending: true
    },
    $redirect: jest.fn(),
    $route: { fullpath },
    app: {
      context: {
        error: jest.fn()
      }
    }
  }

  const propsData = {}

  return mount(DruxtRouterComponent, { localVue, mocks, propsData, store, stubs })
}

describe('DruxtRouterComponent', () => {
  beforeEach(() => {
    // Setup vuex store.
    store = new Vuex.Store()

    DruxtRouterStore({ store })
    store.$druxtRouter = () => new DruxtRouter('https://demo-api.druxjs.org')
  })

  test('Homepage', async () => {
    // Mount component.
    const wrapper = mountComponent('/')
    await wrapper.vm.$options.fetch.call(wrapper.vm)

    expect(mockAxios.get).toHaveBeenNthCalledWith(1, '/router/translate-path?path=/', expect.any(Object))

    wrapper.vm.head = DruxtRouterComponent.head

    expect(wrapper.vm.title).toBe('Welcome to Contenta CMS!')

    expect(wrapper.vm.head()).toStrictEqual({
      title: 'Welcome to Contenta CMS!',
      link: [{
        href: 'http://contenta.druxt.localhost/welcome',
        rel: 'canonical'
      }],
      meta: false
    })

    expect(wrapper.vm.component.is).toBe('DruxtWrapper')
    expect(wrapper.vm.component.options).toStrictEqual([
      'DruxtRouterEntityFront',
      'DruxtRouterEntity',
      'DruxtRouterDefault'
    ])

    expect(wrapper.vm.title).toBe('Welcome to Contenta CMS!')
    expect(wrapper.vm.props).toStrictEqual({
      type: 'node--page',
      uuid: '4eb8bcc1-3b2e-4663-89cd-b8ca6d4d0cc9'
    })

    expect(wrapper.vm.route).toHaveProperty('type', 'entity')
    expect(wrapper.vm.route).toHaveProperty('label')
    expect(wrapper.vm.route).toHaveProperty('canonical')
    expect(wrapper.vm.route).toHaveProperty('isHomePath', true)
    expect(wrapper.vm.route).toHaveProperty('redirect', false)
  })

  test('Redirect', async () => {
    // Mount component.
    const wrapper = mountComponent('/node/6')
    await wrapper.vm.$options.fetch.call(wrapper.vm)

    expect(wrapper.vm.$redirect).toBeCalledWith('/')
    expect(wrapper.vm.redirect).toBe('/')
  })

  test('Empty', () => {
    // Mount component.
    const wrapper = mountComponent(undefined)

    expect(wrapper.vm.entity).toBe(undefined)
    expect(wrapper.vm.props).toBe(false)
    expect(wrapper.vm.component.is).toBe('DruxtWrapper')
    expect(wrapper.vm.component.options).toStrictEqual([])
  })
})
