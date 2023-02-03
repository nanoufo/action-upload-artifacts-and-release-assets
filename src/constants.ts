export enum Inputs {
  Path = "path",
  IfNoFilesFound = "if-no-files-found",
  RetentionDays = "retention-days",
  UploadReleaseFiles = "upload-release-files",
  ReleaseUploadUrl = "release-upload-url",
  RetryLimit = "retry-limit",
  RetryInterval = "retry-interval",
}

export enum NoFileOptions {
  warn = "warn",
  error = "error",
  ignore = "ignore",
}
