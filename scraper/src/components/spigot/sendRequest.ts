import { Page, TimeoutError } from "puppeteer";

export default async function sendRequest(page: Page, url: string) {
  await page.goto(url);
  for (let i = 0; i < 3; i++) {
    try {
      await page.waitForSelector("div#header");
      break;
    } catch (e) {
      if (!(e instanceof TimeoutError)) {
        throw e;
      }
    }
  }
}
