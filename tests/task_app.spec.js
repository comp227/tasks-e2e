const { test, describe, expect, beforeEach } = require('@playwright/test')

describe('Task app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3001/api/testing/reset')
    await request.post('http://localhost:3001/api/users', {
      data: {
        name: 'Superuser',
        username: 'root',
        password: 'tigers'
      }
    })

    await page.goto('http://localhost:5173')
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
    await page.getByRole('button', { name: 'login' }).click()
    await page.getByLabel('username').fill('root')
    await page.getByLabel('password').fill('tigers')

    await page.getByRole('button', { name: 'login' }).click()

    await expect(page.getByText('Superuser logged in')).toBeVisible()
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'login' }).click()
      await page.getByLabel('username').fill('root')
      await page.getByLabel('password').fill('tigers')
      await page.getByRole('button', { name: 'login' }).click()
    })

    test('a new task can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'new task' }).click()
      await page.getByRole('textbox').fill('a task created by playwright')
      await page.getByRole('button', { name: 'save' }).click()
      await expect(page.getByText('a task created by playwright')).toBeVisible()
    })

    describe('and a task exists', () => {
      beforeEach(async ({ page }) => {
        await page.getByRole('button', { name: 'new task' }).click()
        await page.getByRole('textbox').fill('another task by playwright')
        await page.getByRole('button', { name: 'save' }).click()
      })

      test('importance can be changed', async ({ page }) => {
        await page.getByRole('button', { name: 'make not important' }).click()
        await expect(page.getByText('make important')).toBeVisible()
      })
    })
  })
})
