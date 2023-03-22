# action-upload-artifacts-and-release-assets

This action can upload multiple files individually as artifacts and release files.

## Example

Note: for stability of builds it is recommended to use fixed version of this action instead of using head of `main` branch.

In this example two artifacts will be uploaded (if files are present).

```yaml
- name: Upload artifact and release
  uses: nanoufo/action-upload-artifacts-and-release-assets@main  
  with:
    path: |
      x.txt
      y.txt
    upload-release-files: true
    release-upload-url: <UPLOAD URL HERE>
```

## Permissions
The following job permissions are required for this action if you need to upload release assets.
You may add the following lines [to the job or workflow](https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs) if you want to follow the principle of least privilege, by default such permissions are provided.

```
# optional: add to the job entry
permissions:
  contents: write
```

## Inputs

`boolean` values are case-insensitive and must be either `true`/`yes`/`on` or `false`/`no`/`off`.

| Name | Type | Description |
| ---- | ---  | ----------- |
| path | string | _Required_. List of globs that match uploaded files, separated by a newline. Each file that is matched by a glob is uploaded individually, directories are ignored. |
| if-no-files-found | enum (`warn`/`error`/`ignore`) | Strategy to use where there are no files to upload at least for one line of the path. Default is `warn`. |
| upload-release-files  | boolean | Whether to upload files to release. If `false`, only artifacts will be uploaded. Default is `false`. |
| release-upload-url  | string | URL to use to upload release files. |
| retry-limit  | number | The number of retries to make if uploading release files fails (see #5). Default is `3`. Use `0` to disable retries.) |
| retry-interval  | number | The number of seconds to wait between upload attempts. Default is `3`. |
| github-token    | string | GitHub token to use for uploading release files. By default, it uses the built-in token, but it can be changed to a custom PAT. |
