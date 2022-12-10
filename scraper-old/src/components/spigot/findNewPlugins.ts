import { Page } from "puppeteer";
import PluginData from "./pluginData";
import sendRequest from "./sendRequest";
import extractDataFromUrl from "./extractDataFromUrl";

async function* getListOfPlugins(
  page: Page,
  alreadyExistingPlugins: Record<number, string>
): AsyncGenerator<string[]> {
  let numberOfPluginsAlreadyInRepository = 0;
  let numberOfPages = 1;
  let i = 1;
  do {
    try {
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
      let urlsOfPluginsOnPage: string[] = await page.evaluate(() => {
        const urlsOfPlugins: string[] = [];
        const elements = document.querySelectorAll(
          "ol.resourceList > li.resourceListItem > div > div > h3.title > a"
        );
        elements.forEach((element) => {
          urlsOfPlugins.push(
            "https://www.spigotmc.org/" + element.getAttribute("href") || ""
          );
        });
        return urlsOfPlugins;
      });
      urlsOfPluginsOnPage = urlsOfPluginsOnPage.filter((plugin) => {
        const pluginSplitted = plugin.split(".");
        const pluginId = parseInt(
          pluginSplitted[pluginSplitted.length - 1].slice(0, -1)
        );
        if (alreadyExistingPlugins[pluginId]) {
          numberOfPluginsAlreadyInRepository += 1;
          return false;
        }
        numberOfPluginsAlreadyInRepository = 0;
        return true;
      });
      yield urlsOfPluginsOnPage;
      if (numberOfPluginsAlreadyInRepository > 20) {
        return { msg: "Reached duplicate plugins" };
      }
    } catch (e) {
      console.log(e);
      i--;
    }
    i++;
  } while (i <= numberOfPages);
  return { msg: "Reached end of the spigot website" };
}

export default async function findNewPlugins(
  pages: Page[],
  alreadyExistingPlugins: Record<number, string>
): Promise<PluginData[]> {
  const page = pages[pages.length - 1];

  const getListOfPluginsInstance: AsyncGenerator<string[]> = getListOfPlugins(
    page,
    alreadyExistingPlugins
  );
  const pluginsData: PluginData[] = [];

  // Iterate over the list of plugins pages
  for await (const listOfUrlsOfPlugins of getListOfPluginsInstance) {
    const pagesToAwait: Promise<void>[] = [];
    let i = 0;
    for (const pluginUrl of listOfUrlsOfPlugins) {
      const currentPage = i % (pages.length - 1);
      if (currentPage === 0) {
        await Promise.all(pagesToAwait);
      }
      async function getPluginData(
        pages: Page[],
        currentPage: number,
        pluginUrl: string
      ) {
        const page = pages[currentPage];
        const pluginId = parseInt(pluginUrl.split(".").pop() || "-1");
        if (!alreadyExistingPlugins[pluginId]) {
          try {
            const pluginData = await extractDataFromUrl(
              page,
              pluginUrl,
              pluginId
            );
            pluginsData.push(pluginData);
            console.log(pluginData);
            alreadyExistingPlugins[pluginId] = pluginUrl;
          } catch (e) {
            console.error(e);
          }
        }
      }
      pagesToAwait.push(getPluginData(pages, currentPage, pluginUrl));
      await new Promise((resolve) => setTimeout(resolve, 500));
      i++;
    }
  }

  return pluginsData;
}
