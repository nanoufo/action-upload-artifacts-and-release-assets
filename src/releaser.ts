import { GitHub } from "@actions/github";
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
  gh: GitHub,
  url: string,
  path: string
): Promise<any> {
  let { name, size, mime, data } = asset(path);
  return await gh.repos.uploadReleaseAsset({
    url,
    headers: {
      "content-length": size,
      "content-type": mime,
    },
    name,
    data,
  });
}
