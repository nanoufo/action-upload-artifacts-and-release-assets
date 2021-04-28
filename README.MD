## action-upload-artifacts-and-release-assets
This action can upload multiple files individually as artifacts and release files.

### Example
Note: for stability of builds it is recommended to use fixed version of this action instead of using head of `main` branch.

In this example two artifacts will be uploaded (if files are present).
Passing `GITHUB_TOKEN` is required for release uploads but is optional for artifact uploads.
```
      - name: Upload artifact and release
        uses: flying-ufo/action-upload-artifacts-and-release@main
        with:
          path: |
            x.txt
            y.txt
          upload-release-files: true
          release-upload-url: <UPLOAD URL HERE>
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Inputs
`boolean` values are case-insensitive and must be either `true`/`yes`/`on` or `false`/`no`/`off`.

| Name | Type | Description |
| ---- | ---  | ----------- |
| path | string | _Required_. List of globs that match uploaded files, separated by a newline. Each file that is matched by a glob is uploaded individually, directories are ignored. |
| if-no-files-found | enum (warn/error/ignore) | Strategy to use where there are no files to upload at least for one line of the path. Default is `warn`. |
| upload-release-files  | boolean | Whether to upload files to release. If `false`, only artifacts will be uploaded. Default is `false`. |
| release-upload-url  | string | URL to use to upload release files. |