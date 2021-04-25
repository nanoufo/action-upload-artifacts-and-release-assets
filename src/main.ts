import * as core from '@actions/core'
import {getInputs} from "./inputs-helper";
import {findFilesToUpload} from "./search";
import {NoFileOptions} from "./constants";
import {create, UploadOptions} from "@actions/artifact";
import {basename, dirname} from "path"

async function main(): Promise<void> {
    const inputs = getInputs()
    const filesToUpload = await findFilesToUpload(inputs.searchPath)
    if (filesToUpload.length === 0) {
        // No files were found, different use cases warrant different types of behavior if nothing is found
        switch (inputs.ifNoFilesFound) {
            case NoFileOptions.warn: {
                core.warning(
                    `No files were found with the provided path: ${inputs.searchPath}. No artifacts will be uploaded.`
                )
                break
            }
            case NoFileOptions.error: {
                core.setFailed(
                    `No files were found with the provided path: ${inputs.searchPath}. No artifacts will be uploaded.`
                )
                break
            }
            case NoFileOptions.ignore: {
                core.info(
                    `No files were found with the provided path: ${inputs.searchPath}. No artifacts will be uploaded.`
                )
                break
            }
        }
    } else {
        const s = filesToUpload.length === 1 ? '' : 's'
        core.info(
            `With the provided path, there will be ${filesToUpload.length} file${s} uploaded`
        )

        const artifactClient = create()
        const options: UploadOptions = {
            continueOnError: false
        }
        if (inputs.retentionDays) {
            options.retentionDays = inputs.retentionDays
        }

        for (const file of filesToUpload) {
            const rootDirectory = dirname(file)
            const artifactName = basename(file)
            const uploadResponse = await artifactClient.uploadArtifact(
                artifactName,
                Array(file),
                rootDirectory,
                options
            )

            if (uploadResponse.failedItems.length > 0) {
                core.setFailed(
                    `An error was encountered when uploading ${uploadResponse.artifactName}. There were ${uploadResponse.failedItems.length} items that failed to upload.`
                )
                break
            } else {
                core.info(
                    `Artifact ${uploadResponse.artifactName} has been successfully uploaded!`
                )
            }
        }
    }
}

main()