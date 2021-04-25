import {NoFileOptions} from './constants'

export interface ActionInputs {
    githubToken: string
    githubRef: string

    searchPath: string
    ifNoFilesFound: NoFileOptions
    retentionDays: number|undefined
    createRelease: boolean
    releaseRepository: string
    releaseName: string|undefined
    releaseIsPrerelease: boolean
    releaseIsDraft: boolean
    releaseBodyPath: string|undefined
    releaseBody: string|undefined
    releaseTagName: string|undefined
}