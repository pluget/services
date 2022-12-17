import { NFTStorage, File } from "nft.storage";
import mime from "mime";
import path from "path";
import { Page } from "playwright";

export async function urlToFile(url: string, page: Page): Promise<File> {
  const response = await page.goto(url);
  const buffer = (await response?.body()) || Buffer.from("");
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
