import { getInputs } from "./inputs-helper";
import { findFilesToUpload } from "./search";
import { NoFileOptions } from "./constants";
import { create, UploadOptions } from "@actions/artifact";
import { basename, dirname } from "path";
import { setFailed } from "@actions/core";
import * as github from "@actions/github";
import * as core from "@actions/core";
import { uploadReleaseFile } from "./releaser";

async function main(): Promise<void> {
  try {
    const inputs = getInputs();

    /* Find files to upload */
    const filesToUpload = Array<string>();
    const pathLines = inputs.searchPath.split("\n").map((line) => line.trim());
    for (const pathLine of pathLines) {
      const paths = await findFilesToUpload(pathLine);
      if (paths.length !== 0) {
        paths.forEach((path) => {
          if (filesToUpload.indexOf(path) < 0) {
            filesToUpload.push(path);
          }
        });
      } else {
        switch (inputs.ifNoFilesFound) {
          case NoFileOptions.warn: {
            core.warning(
              `No files were found with the provided path: ${pathLine}.`
            );
            break;
          }
          case NoFileOptions.error: {
            core.setFailed(
              `No files were found with the provided path: ${pathLine}.`
            );
            return;
          }
          case NoFileOptions.ignore: {
            break;
          }
        }
      }
    }

    const s = filesToUpload.length === 1 ? "" : "s";
    core.info(
      `With the provided path, there will be ${filesToUpload.length} file${s} uploaded`
    );

    /* Upload artifacts */
    const artifactClient = create();
    const options: UploadOptions = {
      continueOnError: false,
      retentionDays: inputs.retentionDays,
    };
    for (const file of filesToUpload) {
      const rootDirectory = dirname(file);
      const artifactName = basename(file);
      core.info(`⬆️ Uploading artifact ${artifactName}...`);
      await artifactClient.uploadArtifact(
        artifactName,
        Array(file),
        rootDirectory,
        options
      );
    }

    /* Upload release files */
    if (inputs.uploadReleaseFiles) {
      const gh = github.getOctokit(inputs.githubToken!);
      for (const path of filesToUpload) {
        let fileUploaded = false;
        for (let i = 0; i <= inputs.retryLimit; i++) {
          core.info(
            `⬆️ Uploading release file ${basename(path)} (attempt ${i + 1})...`
          );
          try {
            await uploadReleaseFile(gh, inputs.releaseUploadUrl!, path);
            fileUploaded = true;
            break;
          } catch (error) {
            core.warning(`Failed to upload release file: ${error}`);
            core.info(
              `Waiting ${inputs.retryInterval} seconds before retrying...`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, inputs.retryInterval * 1000)
            );
          }
        }
        if (!fileUploaded) {
          throw new Error(
            `Too many failed upload attempts for ${basename(path)}, giving up`
          );
        }
      }
    }
  } catch (error) {
    setFailed(error instanceof Error ? error : String(error));
  }
}

main();
