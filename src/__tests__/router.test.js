import mockAxios from 'jest-mock-axios'

import { DruxtRouter } from '..'

const baseURL = 'https://example.com'

const testArticle = { type: 'node--article', id: '98f36405-e1c4-4d8a-a9f9-4d4f6d414e96' }
const testPage = { type: 'node--page', id: '4eb8bcc1-3b2e-4663-89cd-b8ca6d4d0cc9' }

jest.mock('axios')

const router = new DruxtRouter(baseURL, {})

describe('DruxtRouter', () => {
  beforeEach(() => {
    mockAxios.reset()
  })

  test('constructor', () => {
    // Throw error if 'baseURL' not provided.
    expect(() => { return new DruxtRouter() }).toThrow('The \'baseURL\' parameter is required.')

    // Ensure class type.
    expect(new DruxtRouter(baseURL)).toBeInstanceOf(DruxtRouter)
  })

  test('axiosSettings', () => {
    const headers = { 'X-DruxtRouter': true }
    const mockRouter = new DruxtRouter(baseURL, {
      axios: { headers }
    })
    expect(mockRouter).toBeInstanceOf(DruxtRouter)

    expect(mockAxios.create).toHaveBeenCalledWith({ baseURL, headers })
  })

  test('get - entity', async () => {
    const { route } = await router.get('/')

    expect(route.component).toBe('druxt-entity')
    expect(route.type).toBe('entity')
    expect(route.props).toHaveProperty('type')
    expect(route.props).toHaveProperty('uuid')
  })

  test('get - views', async () => {
    const { route } = await router.get('/view')

    expect(route.component).toBe('druxt-view')
    expect(route.type).toBe('views')
    expect(route.props).toHaveProperty('display')
    expect(route.props).toHaveProperty('view')
  })

  test('get - error', async () => {
    const { route } = await router.get('/error')

    expect(route.error).toHaveProperty('message')
    expect(route.error).toHaveProperty('statusCode', 404)
  })

  test('getRedirect', () => {
    let redirect

    // Route provided redirect.
    redirect = router.getRedirect(null, {
      redirect: [{ to: '/' }]
    })
    expect(redirect).toBe('/')

    // Root redirect.
    redirect = router.getRedirect('/', {
      isHomePath: true
    })
    expect(redirect).toBe(false)

    redirect = router.getRedirect('/node/1', {
      isHomePath: true
    })
    expect(redirect).toBe('/')

    // Clean url redirect.
    redirect = router.getRedirect('/node/2', {
      canonical: 'https://example.com/clean-url'
    })
    expect(redirect).toBe('/clean-url')

    // No redirect.
    redirect = router.getRedirect(null, {})
    expect(redirect).toBe(false)
  })

  test('getResource', async () => {
    const entity = await router.getResource(testArticle)

    expect(entity).toHaveProperty('type', testArticle.type)

    const empty = await router.getResource()
    expect(empty).toBe(false)
  })

  test('getResourceByRoute', async () => {
    const route = require('../__fixtures__/data/0a01adaa07e9dfcc3c0cabc37339505a.json')
    const entity = await router.getResourceByRoute(route)

    expect(entity).toHaveProperty('id', testPage.id)
    expect(entity).toHaveProperty('type', testPage.type)
  })

  test('getRoute', async () => {
    // Get the route of the homepage.
    let route = await router.getRoute('/')

    expect(route).toHaveProperty('canonical')
    expect(route).toHaveProperty('component')
    expect(route).toHaveProperty('error')
    expect(route).toHaveProperty('isHomePath', true)
    expect(route).toHaveProperty('jsonapi')
    expect(route).toHaveProperty('label')
    expect(route).toHaveProperty('props')
    expect(route).toHaveProperty('redirect')
    expect(route).toHaveProperty('type')

    // Get the route of node/1.
    route = await router.getRoute('/node/1')

    expect(route).toHaveProperty('isHomePath', false)
  })
})
