const { expect, test } = require('@playwright/test');

const baseUrl = process.env.QA_BASE_URL ?? 'http://localhost:8082';

function action(page, name) {
  return page.getByRole('button', { name }).or(page.getByRole('link', { name }));
}

test('room visual smoke creates and leaves a real room', async ({ browser }) => {
  test.setTimeout(60000);

  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const leaderPage = await context.newPage();

  await leaderPage.goto(baseUrl);
  await expect(action(leaderPage, 'Criar sala')).toBeVisible();
  await leaderPage.screenshot({ path: '../../docs/qa/test-runs/2026-05-09-smoke-home.png', fullPage: true });

  await action(leaderPage, 'Criar sala').click();
  await expect(leaderPage.getByText('Criar partida')).toBeVisible();
  await action(leaderPage, 'Criar sala').click();
  await action(leaderPage, 'Usar GPS DEV').click();

  const lobbyTitle = leaderPage.getByText(/Lobby: [A-Z]{4}/);
  await expect(lobbyTitle).toBeVisible({ timeout: 15000 });
  await expect(leaderPage.getByText('2/8')).toBeVisible({ timeout: 15000 });
  await expect(leaderPage.getByText('Regras').first()).toBeVisible({ timeout: 15000 });
  await leaderPage.screenshot({ path: '../../docs/qa/test-runs/2026-05-09-smoke-lobby-created.png', fullPage: true });

  await action(leaderPage, 'Sair').click();
  await expect(action(leaderPage, 'Criar sala')).toBeVisible({ timeout: 15000 });

  await context.close();
});
