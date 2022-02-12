# slack-manifest-tools

Keep your Slack app manifest files in git and deploy updates as part of your CI/CD pipeline. 
 
Useful for deploying a Slack app across multiple environments such as development, preview, and production while using a single manifest file.

## Installation

> yarn add slack-manifest-tools --dev

## Usage

```shell
Usage: cli [options]

Options:
  -a, --app_id <app_id>               Slack app id. Required for manifest update.
  -at, --accessToken <accessToken>    Slack app configuration access token. Required if refresh token is not provided.
  -c, --create                        Create a Slack app with provided manifest.
  -e, --environment                   Replace placeholders in manifest with environment variables.
  -m, --manifest <manifest>           Path to app manifest file. Required.
  -r, --rotate                        Print new access and refresh tokens to stdout. refreshToken argument is required.
  -rt, --refreshToken <refreshToken>  Slack app configuration refresh token. Valid for only 12 hours. Required if access token is not provided.
  -u, --update                        Update Slack app manifest with provided manifest.
  -v, --validate                      Validate manifest file.
  -h, --help                          display help for command
```

### Updating app manifest and how to use environment variables

To update the manifest of an already existing Slack app run the following command.

```shell
slack-manifest-tools -u -m ./manifest.json -at <accessToken> -a <app_id>
```

When developing a Slack app it's useful to have multiple apps representing different environments such as development, preview, and production. To simplify the process of keeping your manifest file in sync across multiple apps, you can use the `-e` flag to replace placeholders in the manifest with environment variables.

For example in the snippet of the manifest file below, ${APP_NAME} and ${APP_DESCRIPTION} are placeholders that will be replaced with environment variables.

```shell
APP_NAME="Example" slack-manifest-tools -u -m ./manifest.json -at <accessToken> -a <app_id>
```

```json
{
  "display_information": {
    "name": "${APP_NAME}",
    "description": "${APP_DESCRIPTION}",
    "background_color": "#a34761"
  },
  ...
}
```

### Validating app manifest

A manifest file can be validated using the `-v` flag. The manifest file is automatically before any write operations.

```shell
slack-manifest-tools -v -m ./manifest.json -at <accessToken>
```

### Create a new app from a manifest

This will create a new Slack app with the provided manifest and returns the app id, access and refresh tokens to the console.

```shell
slack-manifest-tools -c -m ./manifest.json -at <accessToken>
```

### Rotate access and refresh token

Fetch new Slack configuration access and refresh tokens. The results are printed to stdout. The refresh token is valid for only 12 hours.

```shell
slack-manifest-tools -c -m ./manifest.json -rt <refreshToken>
```

### Configuration

1. Create an app configuration token for your user and workspace. https://api.slack.com/authentication/config-tokens
2. Find your Slack app id.
