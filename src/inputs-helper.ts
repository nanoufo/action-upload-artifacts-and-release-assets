import * as core from "@actions/core";
import { ActionInputs } from "./action-inputs";
import { Inputs, NoFileOptions } from "./constants";
import { env } from "process";
import { InputOptions } from "@actions/core";

interface GetInputHelper<T> {
  (name: string, options: InputOptions & { required: true }): T;
  (name: string, options?: InputOptions): T | undefined;
}

interface ValueParser<T> {
  (value: string): T;
}

const makeInputHelper = <T>(parser: ValueParser<T>): GetInputHelper<T> => {
  return (name: string, options?: InputOptions): any => {
    const value = core.getInput(name, options);
    if (value === "" && options?.required !== true) {
      // core.getInput returns "" if the value is not defined
      return undefined;
    }
    try {
      return parser(value);
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid value for ${name}: ${errMessage}`);
    }
  };
};

const makeEnumInputHelper = <T extends Record<string, string>>(
  enumT: T
): GetInputHelper<T[keyof T]> => {
  const enumValues = Object.values(enumT);
  return makeInputHelper((valueStr) => {
    if (!enumValues.includes(valueStr)) {
      throw Error("value must be one of " + enumValues.join(", "));
    }
    return valueStr as T[keyof T];
  });
};

const getBooleanInput = makeInputHelper((valueStr) => {
  const trueValues = ["true", "yes", "on"];
  const falseValues = ["false", "no", "off"];
  if (trueValues.indexOf(valueStr.toLowerCase()) >= 0) {
    return true;
  } else if (falseValues.indexOf(valueStr.toLowerCase()) >= 0) {
    return false;
  } else {
    throw Error(`bad boolean value: ${valueStr}`);
  }
});
const getNumberInput = makeInputHelper((valueStr) => {
  const valueAsNumber = parseInt(valueStr);
  if (isNaN(valueAsNumber)) {
    throw Error(`invalid number: ${valueStr}`);
  }
  return valueAsNumber;
});
const getStringInput = makeInputHelper((valueStr) => valueStr);
const getNoFilesFoundInput = makeEnumInputHelper(NoFileOptions);

export function getInputs(): ActionInputs {
  // Note: required means that
  //   a value must be provided when calling the action
  //   - OR -
  //   a default value must be defined in action.yml
  const inputs: ActionInputs = {
    githubToken: env.GITHUB_TOKEN,
    searchPath: getStringInput(Inputs.Path, { required: true }),
    ifNoFilesFound: getNoFilesFoundInput(Inputs.IfNoFilesFound, {
      required: true,
    }),
    retentionDays: getNumberInput(Inputs.RetentionDays),
    releaseUploadUrl: getStringInput(Inputs.ReleaseUploadUrl),
    uploadReleaseFiles: getBooleanInput(Inputs.UploadReleaseFiles, {
      required: true,
    }),
    retryLimit: getNumberInput(Inputs.RetryLimit, { required: true }),
    retryInterval: getNumberInput(Inputs.RetryInterval, { required: true }),
  };

  if (inputs.uploadReleaseFiles) {
    if (inputs.githubToken === undefined) {
      throw Error(
        `${Inputs.UploadReleaseFiles} is true but GITHUB_TOKEN is not provided`
      );
    }
    if (inputs.releaseUploadUrl === undefined) {
      throw Error(
        `${Inputs.UploadReleaseFiles} is true but ${Inputs.ReleaseUploadUrl} is not provided`
      );
    }
    if (inputs.retryLimit < 0 || inputs.retryLimit > 10) {
      throw Error(
        `${Inputs.RetryLimit} must be between 0 and 10, but it is ${inputs.retryLimit}`
      );
    }
    if (inputs.retryInterval < 1 || inputs.retryInterval > 10) {
      throw Error(
        `${Inputs.RetryInterval} must be between 1 and 10, but it is ${inputs.retryInterval}`
      );
    }
  }

  return inputs;
}
