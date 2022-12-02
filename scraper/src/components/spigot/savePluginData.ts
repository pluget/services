import PluginData from "./pluginData";
import { pluginVersion as PluginVersion } from "./pluginVersions";
import fs from "fs-extra";
import nameToStdName from "../nameToStdName";

export async function savePluginData(
  pluginData: PluginData,
  repositoryPath: string,
  pluginName: string,
  pluginDescription: string
) {
  const duplicateNames = [];
  let pluginStdName = "";
  let pluginDataPath = "";
  do {
    pluginStdName = await nameToStdName(
      pluginName,
      pluginDescription,
      duplicateNames
    );
    duplicateNames.push(pluginStdName);
    pluginDataPath = `${repositoryPath}/${pluginStdName[0]}/${pluginStdName}`;
  } while (fs.existsSync(pluginDataPath));

  await fs.ensureDir(pluginDataPath);

  fs.writeFile(
    pluginDataPath + "/spigot.json",
    JSON.stringify(pluginData, null, 2)
  );
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
