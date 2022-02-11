# slack-manifest-tools

Slack Manifest Tools

## Getting Started

> yarn add slack-manifest-tools --dev

## Usage

```
Usage: cli [options]

Options:
  -m, --manifest <manifest>  Path to app manifest file. Required.
  -t, --token <token>        Slack app configuration refresh token. Required.
  -a, --app_id <app_id>      Slack app id. Required for manifest update.
  -v, --validate             Validate app manifest file.
  -u, --update               Update Slack app manifest with provided manifest.
  -h, --help                 display help for command
```


**Update manifest**

> slack-manifest-tools -u -m ./manifest.json -t <token> -a <app_id>

**Validate manifest**

> slack-manifest-tools -v -m ./manifest.json -t <token>
 
**Create a new app from a manifest**

> slack-manifest-tools -c -m ./manifest.json -t <token>


### Configuration

1. Create an app configuration token for your user and workspace. https://api.slack.com/authentication/config-tokens
2. Find your Slack app id.
