export interface PluginVersion {
  sourceUrl?: string;
  downloadUrl: string;
  numberOfDownloads: number;
  rating: number;
  numberOfVotes: number;
  releaseDate: number;
  supportedVersions?: string[];
}

export default interface PluginVersions {
  readonly id: number;
  versions: { name: string; version: PluginVersion }[];
}
