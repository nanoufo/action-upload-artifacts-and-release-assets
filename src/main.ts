import * as core from "@actions/core";
import { getInputs } from "./inputs-helper";
import { findFilesToUpload } from "./search";
import { NoFileOptions } from "./constants";
import { create, UploadOptions } from "@actions/artifact";
import { basename, dirname } from "path";
import { setFailed, setOutput } from "@actions/core";
import { GitHub } from "@actions/github";
import { GitHubReleaser, release, upload } from "./releaser";

async function main(): Promise<void> {
  try {
    const inputs = getInputs();
    const filesToUpload = await findFilesToUpload(inputs.searchPath);
    if (filesToUpload.length === 0) {
      // No files were found, different use cases warrant different types of behavior if nothing is found
      switch (inputs.ifNoFilesFound) {
        case NoFileOptions.warn: {
          core.warning(
            `No files were found with the provided path: ${inputs.searchPath}. No artifacts will be uploaded.`
          );
          break;
        }
        case NoFileOptions.error: {
          core.setFailed(
            `No files were found with the provided path: ${inputs.searchPath}. No artifacts will be uploaded.`
          );
          break;
        }
        case NoFileOptions.ignore: {
          core.info(
            `No files were found with the provided path: ${inputs.searchPath}. No artifacts will be uploaded.`
          );
          break;
        }
      }
    } else {
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
        await artifactClient.uploadArtifact(
          artifactName,
          Array(file),
          rootDirectory,
          options
        );
      }

      /* Create release */
      if (inputs.createRelease) {
        GitHub.plugin([
          require("@octokit/plugin-throttling"),
          require("@octokit/plugin-retry"),
        ]);
        const gh = new GitHub(inputs.githubToken, {
          throttle: {
            onRateLimit: (retryAfter, options) => {
              core.warning(
                `Request quota exhausted for request ${options.method} ${options.url}`
              );
              if (options.request.retryCount === 0) {
                // only retries once
                core.info(`Retrying after ${retryAfter} seconds!`);
                return true;
              }
            },
            onAbuseLimit: (retryAfter, options) => {
              // does not retry, only logs a warning
              core.warning(
                `Abuse detected for request ${options.method} ${options.url}`
              );
            },
          },
        });
        let rel = await release(inputs, new GitHubReleaser(gh));
        for (const path of filesToUpload) {
          await upload(gh, rel.upload_url, path);
        }
        core.info(`🎉 Release ready at ${rel.html_url}`);
        setOutput("release_url", rel.html_url);
        setOutput("release_upload_url", rel.upload_url);
      } else {
        core.info("Skipping release creation");
      }
    }
  } catch (error) {
    setFailed(error.message);
  }
}

main();
