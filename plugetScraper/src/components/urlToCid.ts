import * as dotenv from "dotenv";
import { NFTStorage, File } from "nft.storage";
import mime from "mime";
import fs from "fs";
import path from "path";
import { Page } from "puppeteer";
import Config from "../config";
import launchBrowsers from "./launchBrowsers";

export async function urlToFile(url: string, page: Page): Promise<File> {
  const response = await page.goto(url);
  const buffer = (await response?.buffer()) || Buffer.from("");
  const filename = path.basename(url);
  const mimeType = mime.getType(filename) ?? undefined;
  return new File([buffer], filename, { type: mimeType });
}

export default async function urlToCid(
  url: string,
  apiKey: string,
  page: Page
): Promise<string> {
  const client = new NFTStorage({ token: apiKey });
  const file = await urlToFile(url, page);
  const cid: string = await client.storeBlob(file);
  return cid;
}

if (require.main === module) {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
  async function main() {
    const NFT_STORAGE_API_KEY = process.env.NFT_STORAGE_API_KEY || "";
    const url =
      "https://www.spigotmc.org/data/resource_icons/9/9089.jpg?1564514296";
    const page = (await launchBrowsers(1, "/usr/bin/chromium", false))[0];
    urlToCid(url, NFT_STORAGE_API_KEY, page).then((cid) => {
      console.log(cid);
    });
  }
  main();
}
