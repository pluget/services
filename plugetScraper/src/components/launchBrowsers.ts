import { Page } from "puppeteer";
import { PuppeteerExtra } from "puppeteer-extra";

export default async function launchBrowsers(
  puppeteer: PuppeteerExtra,
  numberOfBrowsers: number,
  CHROMIUM_PATH: string,
  HEADLESS: boolean
): Promise<Page[]> {
  const pages = [];
  const pagesToAwait = [];
  for (let i = 0; i < numberOfBrowsers; i++) {
    async function launchBrowser() {
      const browser = await puppeteer.launch({
        executablePath: CHROMIUM_PATH,
        headless: HEADLESS,
      });

      let pages = await browser.pages();
      pages[0].close();
      return await browser.newPage();
    }
    pagesToAwait.push(launchBrowser());
  }
  pages.push(...(await Promise.all(pagesToAwait)));
  return pages;
}
