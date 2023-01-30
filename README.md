# GitHub Action for End-of-Life (EOL) Scanning

[![Test Status][test-img]][test]
[![GitHub release](https://img.shields.io/github/release/noqcks/xeol-action.svg)](https://github.com/noqcks/xeol-action/releases/latest)
[![License: MIT](https://img.shields.io/github/license/noqcks/xeol-action)](https://img.shields.io/github/license/noqcks/xeol-action)

:zap: _Find End-of-life (EOL) software in files or containers at lightning speed_ :zap:

This is a GitHub Action for invoking the [Xeol](https://github.com/noqcks/xeol) scanner and returning the end-of-life (EOL) packages,
and fail if an out-of-date package is found.

Use this in your workflows to quickly verify files or containers' content after a build and before pushing, allowing PRs, or deploying updates.

The action invokes the `xeol` command-line tool, with these benefits:

- Runs locally, without sending data outbound - no credentials required!
- Speedy scan operations
- Scans both paths and container images

By default, a scan will produce very detailed output on system packages like an RPM or DEB, but also language-based packages. These are some of the supported packages and libraries:

Supported Linux Distributions:

- Alpine
- BusyBox
- CentOS and RedHat
- Debian and Debian-based distros like Ubuntu

Supported packages and libraries:

- Ruby Bundles
- Python Wheel, Egg, `requirements.txt`
- JavaScript NPM/Yarn
- Java JAR/EAR/WAR, Jenkins plugins JPI/HPI
- Go modules

## Container scanning

The simplest workflow for scanning a `localbuild/testimage` container:

```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v1

- name: build local container
  uses: docker/build-push-action@v2
  with:
    tags: localbuild/testimage:latest
    push: false
    load: true

- name: Scan image
  uses: noqcks/xeol-action@v3
  with:
    image: "localbuild/testimage:latest"
```

## Directory scanning

To scan a directory, add the following step:

```yaml
- name: Scan current project
  uses: noqcks/xeol-action@v3
  with:
    path: "."
```

The `path` key allows any valid path for the current project. The root of the path (`"."` in this example) is the repository root.

## Scanning an SBOM file

Use the `sbom` key to scan an SBOM file:

```yaml
- name: Create SBOM
  uses: anchore/sbom-action@v0
  with:
    format: spdx-json
    output-file: "${{ github.event.repository.name }}-sbom.spdx.json"

- name: Scan SBOM
  uses: noqcks/xeol-action@v3
  with:
    sbom: "${{ github.event.repository.name }}-sbom.spdx.json"
```

## Failing a build on EOL package found

By default, the action will fail if it finds any out-of-date software.

You change the `fail-build` field to `false` to avoid failing the build in the case that an out-of-date package is found:

```yaml
- name: Scan image
  uses: noqcks/xeol-action@v3
  with:
    image: "localbuild/testimage:latest"
    fail-build: false
```

### Action Inputs

The inputs `image`, `path`, and `sbom` are mutually exclusive to specify the source to scan; all the other keys are optional. These are all the available keys to configure this action, along with the defaults:

| Input Name          | Description                                                                                                                                                                                                                                                      | Default Value |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `image`             | The image to scan                                                                                                                                                                                                                                                | N/A           |
| `path`              | The file path to scan                                                                                                                                                                                                                                            | N/A           |
| `sbom`              | The SBOM to scan                                                                                                                                                                                                                                                 | N/A           |
| `registry-username` | The registry username to use when authenticating to an external registry                                                                                                                                                                                         |               |
| `registry-password` | The registry password to use when authenticating to an external registry                                                                                                                                                                                         |               |
| `fail-build`        | Fail the build if an end-of-life (EOL) software is found                                                                                                                   | `true`        |
| `output-format`     | Set the output parameter after successful action execution. Valid choices are `json`, and `table`, where `table` output will print to the console instead of generating a file.                                                                         | `table`       |


### Action Outputs

| Output Name | Description                                                  | Type   |
| ----------- | ------------------------------------------------------------ | ------ |
| `json`      | Path to the report file , if `output-format` is `json`       | string |

### Example Workflow

Assuming your repository has a Dockerfile in the root directory:

```yaml
name: Container Image CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build the container image
        run: docker build . --file Dockerfile --tag localbuild/testimage:latest
      - uses: noqcks/xeol-action@v3
        with:
          image: "localbuild/testimage:latest"
          fail-build: true
```

## noqcks/xeol-action/download-xeol

A sub-action to [download Xeol](download-xeol/action.yml).

Input parameters:

| Parameter       | Description                                                                                                  | Default |
| --------------- | ------------------------------------------------------------------------------------------------------------ | ------- |
| `xeol-version` | An optional Xeol version to download, defaults to the pinned version in [XeolVersion.js](XeolVersion.js). |         |

Output parameters:

| Parameter | Description                                                          |
| --------- | -------------------------------------------------------------------- |
| `cmd`     | a reference to the [Xeol](https://github.com/noqcks/xeol) binary. |

`cmd` can be referenced in a workflow like other output parameters:
`${{ steps.<step-id>.outputs.cmd }}`

Example usage:

```yaml
- uses: noqcks/xeol-action/download-xeol@v3
  id: xeol
- run: ${{steps.xeol.outputs.cmd}} dir:.
```

## Contributing

We love contributions, feedback, and bug reports. For issues with the invocation of this action, file [issues](https://github.com/noqcks/xeol-action/issues) in this repository.

For contributing, see [Contributing](CONTRIBUTING.md).

## More Information

For documentation on Xeol itself, including other output capabilities, see the [xeol project](https://github.com/noqcks/xeol)

[test]: https://github.com/noqcks/xeol-action
[test-img]: https://github.com/noqcks/xeol-action/workflows/Tests/badge.svg

## Diagnostics

This action makes extensive use of GitHub Action debug logging,
which can be enabled as [described here](https://github.com/actions/toolkit/blob/master/docs/action-debugging.md)
by setting a secret in your repository of `ACTIONS_STEP_DEBUG` to `true`.
