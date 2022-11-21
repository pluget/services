import PluginData from "./pluginData";
import { pluginVersion as PluginVersion } from "./pluginVersions";
import fs from "fs";

export async function savePluginData(
  pluginData: PluginData,
  repositoryPath: string,
  pluginName: string
) {
  const pluginDataPath = `${repositoryPath}/${pluginName[0]}/${pluginName}/spigot.json`;
  fs.writeFileSync(pluginDataPath, JSON.stringify(pluginData, null, 2));
}

export async function savePluginVersionData(
  pluginVersionData: PluginVersion,
  repositoryPath: string,
  pluginName: string,
  version: string
) {
  const pluginDataPath = `${repositoryPath}/${pluginName[0]}/${pluginName}/versions/${version}/spigot.json`;
  fs.writeFileSync(pluginDataPath, JSON.stringify(pluginVersionData, null, 2));
}
