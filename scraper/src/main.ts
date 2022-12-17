// For more information, see https://crawlee.dev/
import { PlaywrightCrawler } from "crawlee";
import { router } from "./routes.js";

const startUrls = ["https://www.spigotmc.org/resources"];

const crawler = new PlaywrightCrawler({
  // browserPoolOptions: {
  //   useFingerprints: true,
  //   fingerprintOptions: {
  //     fingerprintGeneratorOptions: {
  //       browsers: [
  //         {
  //           name: "edge",
  //           minVersion: 96,
  //         },
  //         {
  //           name: "chrome",
  //           minVersion: 96,
  //         },
  //         {
  //           name: "firefox",
  //           minVersion: 94,
  //         },
  //         {
  //           name: "safari",
  //           minVersion: 15,
  //         },
  //       ],
  //       devices: ["desktop", "mobile"],
  //       operatingSystems: ["windows", "macos", "linux"],
  //     },
  //   },
  // },
  requestHandler: router,
  headless: false,
  maxRequestsPerMinute: 100,
  maxConcurrency: 2,
});

await crawler.run(startUrls);
