import { Page } from "puppeteer";
import { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import BlockResourcesPlugin from "puppeteer-extra-plugin-block-resources";

export default async function launchBrowsers(
  numberOfBrowsers: number,
  CHROMIUM_PATH: string,
  HEADLESS: boolean
): Promise<Page[]> {
  puppeteer.use(StealthPlugin());
  puppeteer.use(
    AdblockerPlugin({
      blockTrackers: true,
      blockTrackersAndAnnoyances: true,
      interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
    })
  );
  puppeteer.use(
    BlockResourcesPlugin({
      blockedTypes: new Set([
        "stylesheet",
        "media",
        "texttrack",
        "eventsource",
        "websocket",
        "manifest",
        "other",
      ]),
      interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
    })
  );
  const pages = [];
  const pagesToAwait = [];
  for (let i = 0; i < numberOfBrowsers; i++) {
    async function launchBrowser() {
      const browser = await puppeteer.launch({
        executablePath: CHROMIUM_PATH,
        headless: HEADLESS,
      });

      const pages = await browser.pages();
      pages[0].close();
      return await browser.newPage();
    }
    pagesToAwait.push(launchBrowser());
  }
  pages.push(...(await Promise.all(pagesToAwait)));
  return pages;
}
