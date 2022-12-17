import { Dataset, createPlaywrightRouter } from "crawlee";
import * as dotenv from "dotenv";
import urlToCid from "./components/urlToCid.js";

dotenv.config();

export const router = createPlaywrightRouter();

router.addDefaultHandler(async ({ page, enqueueLinks, log }) => {
  await page.waitForSelector("#header"); // wait for the header to load, used to bypass Cloudflare check
  log.info(`enqueueing new URLs`);
  await page.waitForSelector(".PageNav > nav > .scrollable > .items > a");
  const listUrls = page
    .locator(".PageNav > nav > .scrollable > .items > a")
    .evaluateAll((nodes: HTMLAnchorElement[]) =>
      nodes.map((node) => node.href)
    );
  await page.waitForSelector(
    ".resourceList > .resourceListItem > .main > .listBlockInner > h3.title > a"
  );
  const pluginUrls = page
    .locator(
      ".resourceList > .resourceListItem > .main > .listBlockInner > h3.title > a[href]"
    )
    .evaluateAll((nodes: HTMLAnchorElement[]) =>
      nodes.map((node) => node.href)
    );
  await enqueueLinks({
    urls: await listUrls,
    label: "list",
  });
  await enqueueLinks({
    urls: await pluginUrls,
    label: "plugin",
  });
});

router.addHandler("list", async ({ request, page, enqueueLinks, log }) => {
  await page.waitForSelector("#header"); // wait for the header to load, used to bypass Cloudflare check
  const url = request.url;
  log.info(`enqueueing new URLs from ${url}`);
  await page.waitForSelector(".PageNav > nav > .scrollable > .items > a");
  const listUrls = page
    .locator(".PageNav > nav > .scrollable > .items > a")
    .evaluateAll((nodes: HTMLAnchorElement[]) =>
      nodes.map((node) => node.href)
    );
  await page.waitForSelector(
    ".resourceList > .resourceListItem > .main > .listBlockInner > h3.title > a"
  );
  const pluginUrls = page
    .locator(
      ".resourceList > .resourceListItem > .main > .listBlockInner > h3.title > a[href]"
    )
    .evaluateAll((nodes: HTMLAnchorElement[]) =>
      nodes.map((node) => node.href)
    );
  await enqueueLinks({
    urls: await listUrls,
    label: "list",
  });
  await enqueueLinks({
    urls: await pluginUrls,
    label: "plugin",
  });
});

router.addHandler("plugin", async ({ request, page, log }) => {
  await page.waitForSelector("#header"); // wait for the header to load, used to bypass Cloudflare check
  const title = await page.title();
  log.info(`${title}`, { url: request.loadedUrl });

  if (
    page.locator("#content") === null ||
    page.locator(".resourceInfo>h1") === null
  ) {
    throw new Error("No content found");
  }

  let id = parseInt(request.loadedUrl?.split(".")?.pop()?.slice(0, -1) ?? "-1");
  let url = request.loadedUrl;

  let iconUrl: string | undefined = undefined;
  if ((await page.locator(".resourceInfo>.resourceImage img").count()) > 0) {
    iconUrl =
      (await page
        .locator(".resourceInfo>.resourceImage img")
        .evaluate((el: HTMLImageElement) => el.src)) ?? undefined;
    if (
      iconUrl ===
      "https://static.spigotmc.org/styles/spigot/xenresource/resource_icon.png"
    ) {
      iconUrl = undefined;
    }
  }

  let authors: string[] = [];
  if (
    (await page
      .locator(
        ".innerContent article .aboveInfo dl.customResourceFieldcontributors > dd"
      )
      .count()) > 0
  ) {
    (
      await page
        .locator(
          ".innerContent article .aboveInfo dl.customResourceFieldcontributors>dd"
        )
        .textContent()
    )
      ?.split(",")
      .map((E) => E.trim()) ?? [];
  }
  if (
    authors.length <= 1 &&
    (await page.locator(".sidebar>#resourceInfo dl.author>dd>a").count()) > 0
  ) {
    authors = [
      (await page
        .locator(".sidebar>#resourceInfo dl.author>dd>a")
        .textContent()) ?? "",
    ];
  }

  let name: string = "";
  if ((await page.locator(".resourceInfo>h1").count()) > 0) {
    name =
      (await page.locator(".resourceInfo>h1")?.first().textContent())?.trim() ??
      "";
  }

  let description: string = "";
  if ((await page.locator(".resourceInfo>p.tagLine").count()) > 0) {
    description =
      (await page.locator(".resourceInfo>p.tagLine")?.textContent())?.trim() ??
      "";
  }

  let numberOfDownloads: number | undefined = undefined;
  if (
    (await page.locator(".sidebar>#resourceInfo dl.downloadCount>dd").count()) >
    0
  ) {
    numberOfDownloads = parseInt(
      (
        await page
          .locator(".sidebar>#resourceInfo dl.downloadCount>dd")
          ?.textContent()
      )
        ?.trim()
        .replace(/,/g, "") ?? "-1"
    );
    if (isNaN(numberOfDownloads) || numberOfDownloads < 0) {
      numberOfDownloads = undefined;
    }
  }

  let rating: number | undefined = undefined;
  if (
    (await page.locator(".sidebar>#resourceInfo .rating .ratings").count()) > 0
  ) {
    rating = parseFloat(
      (await page
        .locator(".sidebar>#resourceInfo .rating .ratings")
        .getAttribute("title")) ?? "-1"
    );
    if (isNaN(rating) || rating < 0) {
      rating = undefined;
    }
  }

  let numberOfVotes: number | undefined = undefined;
  if (
    (await page.locator(".sidebar>#resourceInfo .rating .Hint").count()) > 0
  ) {
    numberOfVotes = parseInt(
      (await page.locator(".sidebar>#resourceInfo .rating .Hint").textContent())
        ?.split(" ")[0]
        .replace(/,/g, "") ?? "-1"
    );
    if (isNaN(numberOfVotes) || numberOfVotes < 0) {
      numberOfVotes = undefined;
    }
  }

  let releasesPageUrl: string | undefined = undefined;
  if (
    (await page.locator(".resourceTabs .resourceTabHistory > a").count()) > 0
  ) {
    releasesPageUrl =
      (await page
        .locator(".resourceTabs .resourceTabHistory > a")
        .evaluate((el: HTMLAnchorElement) => el.href)) ?? undefined;
  }

  let gitUrl: string | undefined = undefined;
  if (
    (await page
      .locator(
        ".innerContent article .aboveInfo dl.customResourceFieldsource_code>dd>a"
      )
      .count()) > 0
  ) {
    gitUrl =
      (await page
        .locator(
          ".innerContent article .aboveInfo dl.customResourceFieldsource_code>dd>a"
        )
        .getAttribute("href")) ?? undefined;
  }

  let donationUrl: string | undefined = undefined;
  if (
    (await page
      .locator(
        ".innerContent article .aboveInfo dl.customResourceFielddonation_link>dd>a"
      )
      .count()) > 0
  ) {
    donationUrl =
      (await page
        .locator(
          ".innerContent article .aboveInfo dl.customResourceFielddonate_link>dd>a"
        )
        .getAttribute("href")) ?? undefined;
  }

  let releaseDate: number | undefined = undefined;
  if (
    (await page
      .locator(".sidebar>#resourceInfo dl.firstRelease>dd>span,abbr[title]")
      .count()) > 0
  ) {
    releaseDate = new Date(
      (
        await page
          .locator(".sidebar>#resourceInfo dl.firstRelease>dd>span,abbr[title]")
          .first()
          .getAttribute("title")
      )?.replace(/at /g, "") ?? 0
    ).getTime();
    if (isNaN(releaseDate) || releaseDate <= 0) {
      releaseDate = undefined;
    }
  }

  let updateDate: number | undefined = undefined;
  if (
    (await page
      .locator(".sidebar>#resourceInfo dl.lastUpdate>dd>span,abbr[title]")
      .count()) > 0
  ) {
    updateDate = new Date(
      (
        await page
          .locator(".sidebar>#resourceInfo dl.lastUpdate>dd>span,abbr[title]")
          .first()
          .getAttribute("title")
      )?.replace(/at /g, "") ?? 0
    ).getTime();
    if (isNaN(updateDate) || updateDate <= 0) {
      updateDate = undefined;
    }
  }

  let versions: string[] = [];
  if (
    (await page
      .locator(
        ".innerContent article .aboveInfo dl.customResourceFieldmc_versions>dd>ul>li"
      )
      .count()) > 0
  ) {
    versions = await page
      .locator(
        ".innerContent article .aboveInfo dl.customResourceFieldmc_versions>dd>ul>li"
      )
      .allTextContents()
      .then((el) => el.map((el) => el.trim()));
  }

  let iconCid: string | undefined = undefined;
  if (iconUrl) {
    iconCid = await urlToCid(
      iconUrl,
      process.env.NFT_STORAGE_API_KEY || "",
      page
    );
  }

  const object = {
    id,
    url,
    name,
    description,
    authors,
    iconUrl,
    iconCid,
    numberOfDownloads,
    rating,
    numberOfVotes,
    releasesPageUrl,
    gitUrl,
    donationUrl,
    releaseDate,
    updateDate,
    versions,
  };

  log.info(JSON.stringify(object, null, 2));

  await Dataset.pushData({
    url: request.loadedUrl,
    object,
  });
});
