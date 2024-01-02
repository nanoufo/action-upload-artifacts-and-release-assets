import { NoFileOptions } from "./constants";

export interface ActionInputs {
  githubToken: string | undefined;

  searchPath: string;
  ifNoFilesFound: NoFileOptions;
  retentionDays: number | undefined;
  compressionLevel: number | undefined;
  uploadReleaseFiles: boolean;
  releaseUploadUrl: string | undefined;

  retryLimit: number;
  retryInterval: number;
}
