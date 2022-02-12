# slack-manifest

Keep your Slack app manifest files in git and deploy updates as part of your CI/CD pipeline. 
 
Useful for deploying a Slack app across multiple environments such as development, preview, and production while using a single manifest file.

## Installation

> yarn add slack-manifest --dev

## Usage

```shell
Usage: cli [options]

Options:
  -a, --app_id <app_id>               Slack app id. Required for manifest update.
  -at, --accessToken <accessToken>    Slack app configuration access token. Required if refresh token is not provided.
  -c, --create                        Create a Slack app with provided manifest.
  -d, --delete                        Delete a Slack app. app_id argument is required.
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
slack-manifest -u -m ./manifest.json -at <accessToken> -a <app_id>
```

When developing a Slack app it's useful to have multiple apps representing different environments such as development, preview, and production. To simplify the process of keeping your manifest file in sync across multiple apps, you can use the `-e` flag to replace placeholders in the manifest with environment variables.

For example in the snippet of the manifest file below, ${APP_NAME} and ${APP_DESCRIPTION} are placeholders that will be replaced with environment variables.

```shell
APP_NAME="Example" slack-manifest -u -m ./manifest.json -at <accessToken> -a <app_id>
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

### Typesafe manifests with Typescript

You can define the app manifest file as a Typescript module. This provides the benefit of type checking your manifest. 

First install dependencies:

```shell
yarn install ts-node typescript --dev
```

Now create a Typescript file that exports the manifest. This file will be loaded during runtime and the default export will be used. You can use it to run additional code like loading env variables.

```typescript
try {
  require('dotenv').config();
} catch (err) {}

import { Manifest } from 'slack-manifest/dist';

const manifest: Manifest = {
  display_information: {
    name: process.env.SLACK_APP_NAME,
    description: process.env.SLACK_APP_DESCRIPTION,
    background_color: '#a34761',
  },
};

export default manifest;
```

In order to run `slack-manifest` use `node --experimental-specifier-resolution=node --loader ts-node/esm node_modules/slack-manifest/dist/cli.modern.js`

For example:

```shell
node --experimental-specifier-resolution=node --loader ts-node/esm node_modules/slack-manifest/dist/cli.modern.js -u -m ./manifest.ts -at <accessToken> -a <app_id>
```

### Validating app manifest

A manifest file can be validated using the `-v` flag. The manifest file is automatically validated before a create or update operation.

```shell
slack-manifest -v -m ./manifest.json -at <accessToken>
```

### Create a new app from a manifest

This will create a new Slack app with the provided manifest and returns the app id, access and refresh tokens to the console.

```shell
slack-manifest -c -m ./manifest.json -at <accessToken>
```

### Delete an existing app

This will permanently delete an existing Slack app.

```shell
slack-manifest -d -at <accessToken> -a <app_id>
```

### Rotate access and refresh token

Fetch new Slack configuration access and refresh tokens. The results are printed to stdout. The refresh token is valid for only 12 hours.

```shell
slack-manifest -c -m ./manifest.json -rt <refreshToken>
```

### Configuration

1. Create an app configuration token for your user and workspace. https://api.slack.com/authentication/config-tokens
2. Find your Slack app id.
