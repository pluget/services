import { Page } from "puppeteer";
import PluginData from "./pluginData";
import sendRequest from "./sendRequest";
import extractDataFromUrl from "./extractDataFromUrl";

export default async function findNewPlugins(
  pages: Page[],
  data: Record<number, string>
) {
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
        const pluginData = await extractDataFromUrl(page, plugin, pluginId);
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
