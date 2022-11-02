import {
  DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
  Page,
  TimeoutError,
} from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import BlockResourcesPlugin from "puppeteer-extra-plugin-block-resources";
import yargs from "yargs";
import { readFile } from "fs";
import path from "path";

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

const argv = yargs(process.argv.slice(2))
  .options({
    b: {
      alias: "browsers",
      describe: "Number of browsers to open",
      type: "number",
      default: 6,
    },
    u: {
      alias: "url",
      describe: "URL to open",
      type: "string",
      default: "",
    },
    p: {
      alias: "path",
      describe: "Path to the chromium executable",
      type: "string",
      default: "/usr/bin/chromium",
    },
    h: {
      alias: "headless",
      describe: "Run in headless mode",
      type: "boolean",
      default: false,
    },
    f: {
      alias: "file",
      describe: "File with cached data",
      type: "string",
      default: "/tmp/pluget/spigot.json",
    },
  })
  .parseSync();

const NUMBER_OF_BROWSERS = argv.b;
const URL = argv.u;
const CHROMIUM_PATH = argv.p;
const HEADMORE = argv.h;
const FILE = argv.f;

async function launchBrowsers(numberOfBrowsers: number): Promise<Page[]> {
  const pages = [];
  const pagesToAwait = [];
  for (let i = 0; i < numberOfBrowsers; i++) {
    async function launchBrowser() {
      const browser = await puppeteer.launch({
        executablePath: CHROMIUM_PATH,
        headless: HEADMORE,
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

async function sendRequest(page: Page, url: string) {
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

interface PluginData {
  readonly id: number;
  readonly url: string;
  name?: string;
  description?: string;
  authors?: string[];
  iconUrl?: string;
  numberOfDownloads?: number;
  rating?: number;
  numberOfVotes?: number;
  releasesPageUrl?: string;
  gitUrl?: string;
  donationUrl?: string;
  releaseDate?: number;
  updateDate?: number;
  versions?: string[];
}

async function extractDataUrl(
  page: Page,
  url: string,
  pluginId: number
): Promise<PluginData> {
  await sendRequest(page, url);
  const data: PluginData = {
    id: pluginId,
    url: url,
  };
  const additionalData = await page.$eval("#content", (E) => {
    let iconUrl = E.querySelector<HTMLImageElement>(
      ".resourceInfo>.resourceImage img"
    )?.currentSrc;
    if (
      iconUrl ===
      "https://static.spigotmc.org/styles/spigot/xenresource/resource_icon.png"
    ) {
      iconUrl = undefined;
    }
    let authors =
      E.querySelector(
        ".innerContent article .aboveInfo dl.customResourceFieldcontributors>dd"
      )
        ?.textContent?.split(",")
        .map((E) => E.trim()) || [];
    if (authors.length <= 1) {
      authors = [
        E.querySelector<HTMLAnchorElement>(
          ".sidebar>#resourceInfo dl.author>dd>a"
        )?.textContent || "",
      ];
    }
    return {
      name: E.querySelector(
        ".resourceInfo>h1"
      )?.firstChild?.textContent?.trim(),
      description: E.querySelector(
        ".resourceInfo>p.tagLine"
      )?.textContent?.trim(),
      authors: authors,
      iconUrl: iconUrl,
      numberOfDownloads: parseInt(
        E.querySelector(".sidebar>#resourceInfo dl.downloadCount>dd")
          ?.textContent?.trim()
          .replace(/,/g, "") ?? "-1"
      ),
      rating: parseFloat(
        E.querySelector<HTMLSpanElement>(
          ".sidebar>#resourceInfo .rating .ratings"
        )?.title ?? "-1"
      ),
      numberOfVotes: parseInt(
        E.querySelector(".sidebar>#resourceInfo .rating .Hint")
          ?.textContent?.split(" ")[0]
          .replace(/,/g, "") ?? "-1"
      ),
      releasesPageUrl: E.querySelector<HTMLAnchorElement>(
        ".resourceTabs .resourceTabHistory > a"
      )?.href,
      gitUrl: E.querySelector<HTMLAnchorElement>(
        ".innerContent article .aboveInfo dl.customResourceFieldsource_code>dd>a"
      )?.href,
      donationUrl: E.querySelector<HTMLAnchorElement>(
        ".innerContent article .aboveInfo dl.customResourceFielddonate_link>dd>a"
      )?.href,
      releaseDate: new Date(
        E.querySelector<HTMLElement>(
          ".sidebar>#resourceInfo dl.firstRelease>dd>span,abbr"
        )?.title.replace(/at /g, "") ?? 0
      ).getTime(),
      updateDate: new Date(
        E.querySelector<HTMLElement>(
          ".sidebar>#resourceInfo dl.lastUpdate>dd>span,abbr"
        )?.title.replace(/at /g, "") ?? 0
      ).getTime(),
      versions: Array.prototype.map.call(
        E.querySelectorAll(
          ".innerContent article .aboveInfo dl.customResourceFieldmc_versions>dd>ul>li"
        ),
        (E) => E.textContent?.trim()
      ),
    };
  });
  Object.assign(data, additionalData);
  return data;
}

export async function newPlugins(pages: Page[], data: Record<number, string>) {
  const page = pages[pages.length - 1];
  async function* getPlugins(page: Page) {
    let numberOfPluginsAlreadyInRepository = 0;
    let numberOfPages = 1;
    let i = 1;
    do {
      await sendRequest(
        page,
        `https://www.spigotmc.org/resources/?order=resource_date&page=${i}`
      );
      if (i === 1) {
        numberOfPages = await page.evaluate(() => {
          const element = document.querySelector("nav > a.gt999");
          if (element) {
            return parseInt(element.textContent || "");
          }
          return 1;
        });
      }
      let pluginsOnPage = await page.evaluate(() => {
        const plugins: string[] = [];
        const elements = document.querySelectorAll(
          "ol.resourceList > li.resourceListItem > div > div > h3.title > a"
        );
        elements.forEach((element) => {
          plugins.push(
            "https://www.spigotmc.org/" + element.getAttribute("href") || ""
          );
        });
        return plugins;
      });
      pluginsOnPage = pluginsOnPage.filter((plugin) => {
        const pluginSplitted = plugin.split(".");
        const pluginId = parseInt(
          pluginSplitted[pluginSplitted.length - 1].slice(0, -1)
        );
        if (data[pluginId]) {
          numberOfPluginsAlreadyInRepository += 1;
          return false;
        }
        numberOfPluginsAlreadyInRepository = 0;
        return true;
      });
      yield pluginsOnPage;
      if (numberOfPluginsAlreadyInRepository > 20) {
        return { msg: "Reached duplicate plugins" };
      }
      i++;
    } while (i <= numberOfPages);
    return { msg: "Reached end of the spigot website" };
  }

  const getPluginsInstance = getPlugins(page);
  const pluginsData: PluginData[] = [];

  for await (const plugins of getPluginsInstance) {
    const pagesToAwait: Promise<void>[] = [];
    let i = 0;
    for (const plugin of plugins) {
      const pageNumber = i % (pages.length - 1);
      if (pageNumber === 0) {
        await Promise.all(pagesToAwait);
      }
      //TODO: Check if plugin is already in the repository, after pushing, add it to the repository
      async function getPluginData() {
        const page = pages[pageNumber];
        const pluginId = parseInt(plugin.split(".").pop() || "");
        const pluginData = await extractDataUrl(page, plugin, pluginId);
        pluginsData.push(pluginData);
        console.log(pluginsData[pluginsData.length - 1]);
      }
      pagesToAwait.push(getPluginData());
      await new Promise((resolve) => setTimeout(resolve, 500));
      i++;
    }
  }

  return pluginsData;
}

export async function main() {
  const file: string = await new Promise((resolve, reject) => {
    readFile(
      path.resolve(__dirname, FILE),
      { encoding: "utf-8" },
      (err, data) => {
        if (err) reject(err);
        resolve(data);
      }
    );
  });
  const data = JSON.parse(file);
  console.log("Launching browsers...");
  const pages = await launchBrowsers(NUMBER_OF_BROWSERS);
  await newPlugins(pages, data);
}

if (require.main === module) {
  main();
}
