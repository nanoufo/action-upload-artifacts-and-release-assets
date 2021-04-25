export enum Inputs {
    Path = 'path',
    IfNoFilesFound = 'if-no-files-found',
    RetentionDays = 'retention-days',
    CreateRelease = 'create-release',
    ReleaseRepository = 'release-repository',
    ReleaseName = 'release-name',
    ReleaseTagName = 'release-tag-name',
    ReleaseBody = 'release-body',
    ReleaseBodyPath = 'release-body-path',
    ReleaseIsDraft = 'release-is-draft',
    ReleaseIsPrerelease = 'release-is-prerelease',
}

export enum NoFileOptions {
    warn = 'warn',
    error = 'error',
    ignore = 'ignore'
}
