import unidecode from "unidecode";

export default function nameToStdName(name: string): string {
  return unidecode(name)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");
}
