const { test, describe, expect, beforeEach } = require('@playwright/test')
const { loginWith, createTask } = require('./helper')

describe('Task app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
      data: {
        name: 'Pacific Tests',
        username: 'test',
        password: 'pacific'
      }
    })

    await page.goto('/')
  })

  test('front page can be opened', async ({ page }) => {
    const locator = page.getByText('Tasks')
    await expect(locator).toBeVisible()
    await expect(
      page.getByText(
        'Task app, Department of Computer Science, University of the Pacific 2025'
      )
    ).toBeVisible()
  })

  test('user can log in', async ({ page }) => {
    await loginWith(page, 'test', 'pacific')
    await expect(page.getByText('Pacific Tests logged in')).toBeVisible()
  })

  test('login fails with wrong password', async ({ page }) => {
    await loginWith(page, 'test', 'wrong')

    const errorDiv = page.locator('.error')
    await expect(errorDiv).toContainText('wrong credentials')
    await expect(errorDiv).toHaveCSS('border-style', 'solid')
    await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')

    await expect(page.getByText('Pacific Tests logged in')).not.toBeVisible()
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'test', 'pacific')
    })

    test('a new task can be created', async ({ page }) => {
      await createTask(page, 'a task created by playwright')
      await expect(page.getByText('a task created by playwright')).toBeVisible()
    })

    describe('and several tasks exists', () => {
      beforeEach(async ({ page }) => {
        await createTask(page, 'first task', true)
        await createTask(page, 'second task', true)
        await createTask(page, 'third task', true)
      })

      test('one of those can be made nonimportant', async ({ page }) => {
        await page.pause()
        const otherTaskText = page.getByText('second task')
        const otherTaskElement = otherTaskText.locator('..')

        await otherTaskElement
          .getByRole('button', { name: 'make not important' })
          .click()
        await expect(otherTaskElement.getByText('make important')).toBeVisible()
      })
    })
  })
})
