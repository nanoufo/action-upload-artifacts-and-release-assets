import * as core from '@actions/core'
import {ActionInputs} from "./action-inputs";
import {Inputs, NoFileOptions} from "./constants";

export function getInputs(): ActionInputs {
    const path = core.getInput(Inputs.Path, {required: true})
    const ifNoFilesFound = core.getInput(Inputs.IfNoFilesFound)
    const noFileBehavior: NoFileOptions = NoFileOptions[ifNoFilesFound]

    if (!noFileBehavior) {
        core.setFailed(
            `Unrecognized ${
                Inputs.IfNoFilesFound
            } input. Provided: ${ifNoFilesFound}. Available options: ${Object.keys(
                NoFileOptions
            )}`
        )
    }

    const inputs = {
        searchPath: path,
        ifNoFilesFound: noFileBehavior
    } as ActionInputs

    const retentionDaysStr = core.getInput(Inputs.RetentionDays)
    if (retentionDaysStr) {
        inputs.retentionDays = parseInt(retentionDaysStr)
        if (isNaN(inputs.retentionDays)) {
            core.setFailed('Invalid retention-days')
        }
    }

    return inputs
}