export interface version {
  name: string;
  releaseDate: number;
  downloadUrl: string;
  rating: number;
  numberOfVotes: number;
  numberOfDownloads: number;
}

export default interface pluginVersions {
  readonly id: number;
  readonly sourceUrl: string;
  supportedVersions: string[];
  versions: version[];
}
