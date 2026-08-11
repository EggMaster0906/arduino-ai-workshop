import { expect, test, type Page } from "@playwright/test";

const courseId = "arduino-ai-intro";

async function startAnonymousSession(page: Page) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Arduino.*生成式 AI/ })).toBeVisible();
  await page.getByTestId("student-display-name").fill("測試同學");
  await page.getByTestId("course-start").click();
  await expect(page).toHaveURL(new RegExp(`#/course/${courseId}/level/1-0`));
}

async function openTeacherLevel(page: Page, levelId: string) {
  await page.goto(`/?teacherMode=1#/course/${courseId}/level/${levelId}`);
  await expect(page.getByTestId("lesson-page")).toBeVisible();
}

async function buildServoGatePrompt(page: Page) {
  await page.goto("/#/prompt?task=servo-gate");
  await expect(page.getByTestId("prompt-task-servo-gate")).toBeVisible();
  await submitServoGatePrompt(page);
  await expect(page).toHaveURL(/#\/preview/);
}

async function submitServoGatePrompt(page: Page) {
  await page.getByTestId("prompt-field-goal").fill("做一個可以開關的簡易柵欄");
  await page.getByTestId("prompt-field-hardware-uno").check();
  await page.getByTestId("prompt-field-hardware-sg90").check();
  await page.getByTestId("prompt-field-control").fill("從 Serial Monitor 輸入 OPEN 或 CLOSE");
  await page.getByTestId("prompt-field-logic").fill("OPEN 時 Servo 到 90°；CLOSE 時 Servo 回到 0°。");
  await page
    .getByTestId("prompt-field-aiHelp")
    .selectOption({ label: "寫完整程式，並逐段解釋" });
  await page.getByTestId("prompt-coach-submit").click();
  await expect(page.getByTestId("prompt-clarification")).toContainText("訊號線");
  await page.getByTestId("prompt-field-servoPin").fill("D9");
  await page.getByTestId("prompt-coach-submit").click();
}

async function pasteExternalCode(page: Page) {
  await page.getByTestId("open-external-code-paste").click();
  await expect(page).toHaveURL(/#\/coding/);
  await page.getByTestId("external-code-input").fill(`#include <Servo.h>

Servo motor;
void setup() { motor.attach(9); }
void loop() { motor.write(90); }`);
  await page.getByTestId("external-code-save").click();
  await expect(page.getByTestId("external-code-preview")).toContainText("#include <Servo.h>");
}

test.describe("最終驗收情境 A–F", () => {
  test("第二章流程圖會顯示，且 2-3 答對後可前往下一關", async ({ page }) => {
    await startAnonymousSession(page);

    await openTeacherLevel(page, "2-2");
    await expect(page.getByTestId("diagram").locator("svg")).toBeVisible();
    await page.getByTestId("exercise-2-2-logic-option-logic").check();
    await expect(page.getByTestId("complete-level")).toBeDisabled();
    await page.getByRole("link", { name: "前往 Prompt Builder" }).click();
    await expect(page.getByTestId("prompt-task-servo-gate")).toBeVisible();
    await submitServoGatePrompt(page);
    await expect(page).toHaveURL(new RegExp(`#/course/${courseId}/level/2-2`));
    await expect(page.getByTestId("complete-level")).toBeEnabled();
    await page.getByTestId("complete-level").click();

    await expect(page).toHaveURL(new RegExp(`#/course/${courseId}/level/2-3`));
    await expect(page.getByTestId("diagram").locator("svg")).toBeVisible();
    await page.getByTestId("exercise-2-3-role-option-ask").check();
    await expect(page.getByTestId("complete-level")).toBeEnabled();
    await page.getByTestId("complete-level").click();
    await expect(page).toHaveURL(new RegExp(`#/course/${courseId}/level/2-4`));

    await openTeacherLevel(page, "2-final");
    await expect(page.getByTestId("diagram").locator("svg")).toBeVisible();
  });

  test("Scenario A：Arduino 基礎教材可由 1-0 走到 1-Final", async ({ page }) => {
    await startAnonymousSession(page);

    const expectedLevels = [
      ["1-0", "1-0｜認識 Arduino"],
      ["1-1", "1-1｜程式怎麼運作？"],
      ["1-2", "1-2｜變數：幫資料取名字"],
      ["1-3", "1-3｜Arduino 怎麼感覺外面的世界？"],
      ["1-4", "1-4｜看看 Arduino 看到了什麼"],
      ["1-5", "1-5｜把一種數值變成另一種"],
      ["1-6", "1-6｜讓 Arduino 控制現實世界"],
      ["1-final", "1-Final｜光控伺服馬達"],
    ] as const;

    for (const [levelId, title] of expectedLevels) {
      await openTeacherLevel(page, levelId);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
    }

    await expect(page.getByTestId("hardware-task-1-final")).toContainText("光控 Servo");
    await expect(page.getByTestId("exercise-1-final-input")).toBeVisible();
    await expect(page.getByTestId("exercise-1-final-process")).toBeVisible();
    await expect(page.getByTestId("exercise-1-final-output")).toBeVisible();
  });

  test("Scenario B：Prompt Coach 先澄清 Servo 腳位，再產生完整 Prompt", async ({ page }) => {
    await startAnonymousSession(page);
    await buildServoGatePrompt(page);

    await expect(page.getByTestId("prompt-preview")).toBeVisible();
    await expect(page.getByTestId("structured-requirement")).toContainText("D9");
    await expect(page.getByTestId("final-prompt")).toContainText("不要自行假設");
  });

  test("Scenario C：學生可將外部 AI 程式貼回學習區並進行實測", async ({ page }) => {
    await startAnonymousSession(page);
    await buildServoGatePrompt(page);
    await pasteExternalCode(page);

    await expect(page.getByTestId("external-code-note")).toBeVisible();
    await expect(page.getByRole("group", { name: "第一次測試結果如何？" })).toBeVisible();
  });

  test("Scenario D：Servo 不動時，Debug Flow 先給檢查順序而非整份重寫", async ({ page }) => {
    await startAnonymousSession(page);
    await buildServoGatePrompt(page);
    await pasteExternalCode(page);
    await page.getByTestId("test-result-no-response").check();
    await page.getByTestId("test-result-continue").click();
    await expect(page).toHaveURL(/#\/debug/);

    await page.getByTestId("debug-problem").fill("Compile 成功、Upload 成功，但 Servo 不動。");
    await page.getByTestId("debug-hardware-state").fill("訊號線接 D9，紅線接 5V，棕線接 GND。 ");
    await page.getByTestId("debug-attempted-fixes").fill("已重新 Upload，也確認有輸入 OPEN。");
    await page.getByTestId("debug-submit").click();

    await expect(page.getByTestId("debug-checks")).toContainText("訊號線");
    await expect(page.getByTestId("debug-result")).toContainText("給外部 AI 的 Debug Prompt");
  });

  test("Scenario E：重新整理後，匿名本機 Session、答案與進度仍保留", async ({ page }) => {
    await startAnonymousSession(page);
    await openTeacherLevel(page, "1-0");
    await page.getByTestId("exercise-1-0-ipo-option-output").check();
    await page.getByTestId("complete-level").click();

    await page.reload();
    await expect(page.getByTestId("student-display-name-current")).toHaveText("測試同學");
    await expect(page.getByTestId("course-progress")).toContainText("1 / 16");
    await page.goto(`/#/course/${courseId}/level/1-0`);
    await expect(page.getByTestId("exercise-1-0-ipo-option-output")).toBeChecked();
  });

  test("Scenario F：新的瀏覽器 Context 能直接開啟首頁，不需要 GitHub／網站帳號", async ({ browser }) => {
    const freshPage = await browser.newPage();
    const response = await freshPage.goto("/");

    expect(response?.ok()).toBe(true);
    await expect(freshPage.getByTestId("course-start")).toBeVisible();
    await expect(freshPage.getByTestId("student-display-name")).toBeVisible();
    await expect(freshPage.getByText("登入 GitHub", { exact: false })).toHaveCount(0);
    await freshPage.close();
  });
});
