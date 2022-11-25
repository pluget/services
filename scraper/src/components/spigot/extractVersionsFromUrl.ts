import { Page } from "puppeteer";
import launchBrowsers from "../launchBrowsers";
import { default as pluginVersions, pluginVersion } from "./pluginVersions";
import sendRequest from "./sendRequest";

export default async function extractVersionsFromUrl(
  page: Page,
  url: string,
  pluginId: number,
  supportedVersions: string[]
): Promise<pluginVersions> {
  await sendRequest(page, url);
  const data: pluginVersions = {
    id: pluginId,
    versions: [],
  };
  const additionalData = await page.$eval("#content", (E) => {
    const versions: { name: string; version: pluginVersion }[] = [];
    const table = E.querySelector("table.dataTable.resourceHistory > tbody");
    if (table) {
      const rows = Array.from(table.querySelectorAll("tr"));
      rows.shift();
      for (const row of rows) {
        const version: string =
          row.querySelector("td.version")?.textContent ?? "";
        let releaseDate: number = parseInt(
          row
            .querySelector("td.releaseDate > abbr")
            ?.getAttribute("data-time") ?? "-1"
        );
        if (releaseDate === -1) {
          releaseDate =
            new Date(
              row
                .querySelector<HTMLSpanElement>("td.releaseDate > span")
                ?.title.replace(/at /g, "") ?? 0
            ).getTime() ?? -1;
        }
        const downloadUrl: string =
          row.querySelector("td.download > a")?.getAttribute("href") || "";
        const rating: number =
          parseFloat(
            row.querySelector<HTMLSpanElement>(
              "td.rating > .rating > dl > dd > span.RatingValue > span.Number"
            )?.textContent ?? "-0.5"
          ) * 2;
        const numberOfVotes: number = parseInt(
          row
            .querySelector<HTMLSpanElement>(
              "td.rating > .rating > dl > dd > span.Hint"
            )
            ?.textContent?.split(" ")[0] ?? "-1"
        );
        const numberOfDownloads: number = parseInt(
          row
            .querySelector<HTMLSpanElement>("td.downloads")
            ?.textContent?.replace(/, /g, "") ?? "-1"
        );
        versions.push({
          name: version,
          version: {
            downloadUrl,
            numberOfDownloads,
            rating,
            numberOfVotes,
            releaseDate,
          },
        });
      }
    }
    return versions;
  });
  for (const version of additionalData) {
    Object.assign(version, { sourceUrl: url });
    Object.assign(version, { supportedVersions: supportedVersions });
  }
  Object.assign(data, { versions: additionalData });
  return data;
}

if (require.main === module) {
  async function main() {
    const page = (await launchBrowsers(1, "/usr/bin/chromium", false))[0];
    console.log(
      await extractVersionsFromUrl(
        page,
        "https://www.spigotmc.org/resources/essentialsx.9089/history",
        9089,
        [
          "1.8",
          "1.9",
          "1.10",
          "1.11",
          "1.12",
          "1.13",
          "1.14",
          "1.15",
          "1.16",
          "1.17",
          "1.18",
          "1.19",
        ]
      )
    );
  }
  main();
}
