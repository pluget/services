export default interface PluginData {
  readonly id: number;
  readonly url: string;
  name?: string;
  description?: string;
  authors?: string[];
  iconUrl?: string;
  numberOfDownloads?: number;
  rating?: number;
  numberOfVotes?: number;
  releasesPageUrl?: string;
  gitUrl?: string;
  donationUrl?: string;
  releaseDate?: number;
  updateDate?: number;
  versions?: string[];
}
