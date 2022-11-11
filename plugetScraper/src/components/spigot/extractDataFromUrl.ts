import { Page } from "puppeteer";
import PluginData from "./pluginData";
import sendRequest from "./sendRequest";

export default async function extractDataFromUrl(
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
