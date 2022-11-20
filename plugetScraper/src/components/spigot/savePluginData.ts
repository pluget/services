import { default as PluginDataSpigot } from "./pluginData";
import fs from "fs";

export async function savePluginData(
  pluginData: PluginDataSpigot,
  repositoryPath: string,
  pluginName: string
) {
  const pluginDataPath = `${repositoryPath}/${pluginName[0]}/${pluginName}/spigot.json`;
  fs.writeFileSync(pluginDataPath, JSON.stringify(pluginData, null, 2));
}
