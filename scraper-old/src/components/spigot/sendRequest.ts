import { Page, TimeoutError } from "puppeteer";

export default async function sendRequest(page: Page, url: string) {
  for (let i = 0; i < 3; i++) {
    try {
      await Promise.all([
        page.waitForNavigation(),
        page.waitForSelector("div#header"),
        page.goto(url),
      ]);
      break;
    } catch (e) {
      if (i === 2) {
        throw e;
      } else {
        if (!(e instanceof TimeoutError)) {
          throw e;
        }
      }
    }
  }
}
