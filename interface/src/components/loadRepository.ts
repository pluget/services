import path from "path";
import fs from "fs-extra";
import { Dirent } from "fs";

export async function listDirs(dir: string) {
  const dirs = [];
  for (const file of (
    await fs.readdir(dir, {
      withFileTypes: true,
    })
  ).filter(
    (file: Dirent) => file.isDirectory() && !file.name.startsWith(".")
  )) {
    dirs.push(file.name);
  }
  return dirs;
}

export default async function loadRepository(pathToRepository: string) {
  const folders = [];
  for (const rootFolder of await listDirs(pathToRepository)) {
    const rootPath = path.resolve(pathToRepository, rootFolder);
    const foldersInPath = await listDirs(rootPath);
    for (const folder of foldersInPath) {
      folders.push(path.resolve(rootPath, folder));
    }
  }
  console.log(folders);
  return folders;
}

if (require.main === module) {
  loadRepository(path.resolve(__dirname, "../../../../repository/"));
}
