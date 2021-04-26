import * as core from "@actions/core";
import { ActionInputs } from "./action-inputs";
import { Inputs, NoFileOptions } from "./constants";
import { readFileSync } from "fs";
import { env } from "process";

function getBooleanInput(name: string): boolean | undefined {
  const value = getStringInput(name);
  if (value === undefined) {
    return undefined;
  }
  if (value === "true") {
    return true;
  } else if (value === "false") {
    return false;
  } else {
    throw Error(`Bad boolean value: ${value}`);
  }
}

function getNumberInput(name: string): number | undefined {
  const value = getStringInput(name);
  if (value === undefined) {
    return undefined;
  }
  const valueAsNumber = parseInt(value);
  if (isNaN(valueAsNumber)) {
    throw Error(`Invalid number: ${value}`);
  }
  return valueAsNumber;
}

function getStringInput(name: string): string | undefined {
  return core.getInput(name) || undefined;
}

function getRequiredStringInput(name: string): string {
  return core.getInput(name, { required: true });
}

export function getInputs(): ActionInputs {
  const ifNoFilesFound = core.getInput(Inputs.IfNoFilesFound);
  const noFileBehavior: NoFileOptions = NoFileOptions[ifNoFilesFound];

  if (!noFileBehavior) {
    core.setFailed(
      `Unrecognized ${
        Inputs.IfNoFilesFound
      } input. Provided: ${ifNoFilesFound}. Available options: ${Object.keys(
        NoFileOptions
      )}`
    );
  }

  return {
    searchPath: getRequiredStringInput(Inputs.Path),
    ifNoFilesFound: noFileBehavior,
    retentionDays: getNumberInput(Inputs.RetentionDays),
    releaseRepository:
      getStringInput(Inputs.ReleaseRepository) ?? env.GITHUB_REPOSITORY ?? "",
    githubToken: env.GITHUB_TOKEN ?? "",
    githubRef: env.GITHUB_REF ?? "",
    createRelease: getBooleanInput(Inputs.CreateRelease) ?? false,
    releaseName: getStringInput(Inputs.ReleaseName),
    releaseTagName: getStringInput(Inputs.ReleaseTagName),
    releaseBody: getStringInput(Inputs.ReleaseBody),
    releaseBodyPath: getStringInput(Inputs.ReleaseBodyPath),
    releaseIsDraft: getBooleanInput(Inputs.ReleaseIsDraft) ?? false,
    releaseIsPrerelease: getBooleanInput(Inputs.ReleaseIsPrerelease) ?? false,
  };
}

export function releaseBody(inputs: ActionInputs): string | undefined {
  return (
    (inputs.releaseBodyPath &&
      readFileSync(inputs.releaseBodyPath).toString("utf8")) ||
    inputs.releaseBody
  );
}
