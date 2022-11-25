export interface pluginVersion {
  sourceUrl?: string;
  downloadUrl: string;
  numberOfDownloads: number;
  rating: number;
  numberOfVotes: number;
  releaseDate: number;
  supportedVersions?: string[];
}

export default interface pluginVersions {
  readonly id: number;
  versions: { name: string; version: pluginVersion }[];
}
