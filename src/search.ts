import * as glob from '@actions/glob'
import {debug, info} from '@actions/core'
import {stat} from 'fs'
import {promisify} from 'util'

const stats = promisify(stat)

function getDefaultGlobOptions(): glob.GlobOptions {
    return {
        followSymbolicLinks: true,
        implicitDescendants: true,
        omitBrokenSymbolicLinks: true
    }
}

export async function findFilesToUpload(
    searchPath: string,
    globOptions?: glob.GlobOptions
): Promise<string[]> {
    const searchResults: string[] = []
    const globber = await glob.create(
        searchPath,
        globOptions || getDefaultGlobOptions()
    )
    const rawSearchResults: string[] = await globber.glob()

    /*
      Directories will be rejected if attempted to be uploaded. This includes just empty
      directories so filter any directories out from the raw search results
    */
    for (const searchResult of rawSearchResults) {
        const fileStats = await stats(searchResult)
        // isDirectory() returns false for symlinks if using fs.lstat(), make sure to use fs.stat() instead
        if (!fileStats.isDirectory()) {
            debug(`File:${searchResult} was found using the provided searchPath`)
            searchResults.push(searchResult)
        } else {
            debug(
                `Removing ${searchResult} from rawSearchResults because it is a directory`
            )
        }
    }

    return searchResults
}
