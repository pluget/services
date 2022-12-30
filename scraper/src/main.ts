// For more information, see https://crawlee.dev/
import { PlaywrightCrawler } from "crawlee";
import os from "os";
import { router } from "./routes.js";

let browser = "/usr/bin/chromium";
if (os.type() === 'Linux' && os.version().includes('NixOS')) {
  browser = "/run/current-system/sw/bin/chromium";
}

const startUrls = ["https://www.spigotmc.org/resources"];

const crawler = new PlaywrightCrawler({
  launchContext: {
    launchOptions: {
      executablePath: browser,
    }
  },
  browserPoolOptions: {
    useFingerprints: true,
    fingerprintOptions: {
      fingerprintGeneratorOptions: {
        browsers: [
          {
            name: "edge",
            minVersion: 96,
          },
          {
            name: "chrome",
            minVersion: 96,
          },
          {
            name: "firefox",
            minVersion: 94,
          },
          {
            name: "safari",
            minVersion: 15,
          },
        ],
        devices: ["desktop", "mobile"],
        operatingSystems: ["windows", "macos", "linux"],
      },
    },
  },
  requestHandler: router,
  headless: false,
  maxRequestsPerMinute: 100,
  maxConcurrency: 5,
});

await crawler.run(startUrls);
