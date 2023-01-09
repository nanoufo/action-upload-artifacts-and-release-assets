import * as github from "@actions/github";
import * as core from "@actions/core";
import { lstatSync, readFileSync } from "fs";
import { getType } from "mime";
import { basename } from "path";

export interface ReleaseAsset {
  name: string;
  mime: string;
  size: number;
  data: Buffer;
}

export function asset(path: string): ReleaseAsset {
  return {
    name: basename(path),
    mime: mimeOrDefault(path),
    size: lstatSync(path).size,
    data: readFileSync(path),
  };
}

export function mimeOrDefault(path: string): string {
  return getType(path) || "application/octet-stream";
}

export async function uploadReleaseFile(
  gh: ReturnType<typeof github.getOctokit>,
  url: string,
  path: string
): Promise<any> {
  // data has Buffer type but we can't simply pass it to uploadReleaseAsset
  // because it has wrong type declaration, so we have to use 'as any'.
  // https://github.com/octokit/octokit.js/discussions/2087
  // Also uploadReleaseAsset has some other wrong types
  let { name, size, mime, data } = asset(path);
  return await gh.rest.repos.uploadReleaseAsset({
    url,
    headers: {
      "content-length": size,
      "content-type": mime,
    },
    name,
    data: data,
  } as any);
}
