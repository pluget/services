import yargs from "yargs";
import { readFile } from "fs";
import path from "path";
import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import config from "./config";
import launchBrowsers from "./components/launchBrowsers";
import findNewPlugins from "./components/spigot/findNewPlugins";
import { savePluginData } from "./components/spigot/savePluginData";
import unidecode from "unidecode";

Sentry.init({
  dsn: config.sentryDsn,
  tracesSampleRate: 1.0,
});

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
    d: {
      alias: "directory",
      describe: "Directory to save the plugins",
      type: "string",
      default: "../../../repository/",
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
    NUMBER_OF_BROWSERS,
    CHROMIUM_PATH,
    HEADMORE
  );
  const newPlugins = await findNewPlugins(pages, data);
  for (const plugin of newPlugins) {
    await savePluginData(
      plugin,
      argv.d,
      unidecode(plugin.name || "")
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^a-z0-9-]/g, "")
    );
  }
}

if (require.main === module) {
  const transaction = Sentry.startTransaction({
    op: "main",
    name: "plugetScraper main function",
  });
  try {
    main();
  } catch (e) {
    Sentry.captureException(e);
    console.error(e);
  } finally {
    transaction.finish();
  }
}
