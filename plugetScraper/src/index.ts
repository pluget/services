import { DEFAULT_INTERCEPT_RESOLUTION_PRIORITY, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import BlockResourcesPlugin from "puppeteer-extra-plugin-block-resources";
import yargs from "yargs";
import { readFile } from "fs";
import path from "path";
import Sentry from "@sentry/node";
import Tracing from "@sentry/tracing";
import config from "./config";
import launchBrowsers from "./components/launchBrowsers";
import findNewPlugins from "./components/spigot/findNewPlugins";

Sentry.init({
  dsn: config.sentryDsn,
  tracesSampleRate: 1.0,
});

const transaction = Sentry.startTransaction({
  op: "test",
  name: "My First Test Transaction",
});

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
  const pages = await launchBrowsers(
    puppeteer,
    NUMBER_OF_BROWSERS,
    CHROMIUM_PATH,
    HEADMORE
  );
  await findNewPlugins(pages, data);
}

if (require.main === module) {
  main();
}
