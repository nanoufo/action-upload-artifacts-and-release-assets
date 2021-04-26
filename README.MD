## action-upload-artifacts-and-release
This action can upload multiple files individually as artifacts 
and create a release with the same files.

### Example
Note: for stability of builds it is recommended to use fixed version of this action instead of using head of `main` branch.

In this example two artifacts will be uploaded (if files are present) and a release will
be created with the same files.
Passing `GITHUB_TOKEN` is required for a release but is optional for artifact uploads.
```
      - name: Upload artifact and release
        uses: flying-ufo/action-upload-artifacts-and-release@main
        with:
          path: |
            x.txt
            y.txt
          create-release: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Inputs
`boolean` values must be either `true` or `false`.

| Name | Type | Description |
| ---- | ---  | ----------- |
| path | string | _Required_. List of globs that match uploaded files, separated by a newline. Each file that is matched by a glob is uploaded individually, directories are ignored. |
| if-no-files-found | enum (warn/error/ignore) | Strategy to use where there are no files to upload. Default is `warn`. |
| create-release  | boolean | Whether to create release. If `false`, only artifacts will be uploaded. Default is `false`.|
| release-repository  | string | Repository to create release for in format `username/reponame`. Default is current repository name. |
| release-name  | string | Name of a release. Default is tag name. |
| release-tag-name  | string | Name of a release tag. Default is current tag or `refs/heads/branch`. |
| release-body  | string | Content of a release body.  |
| release-body-path  | string | Path to file with a content of release body. |
| release-is-draft  | boolean | Whether a created release is a draft. Default is `false`. |
| release-is-prerelease  | boolean | Whether a created release is a prerelease. Default is `false`. |