#!/usr/bin/env node

import { Command } from 'commander'
import { SlackManifestTools } from './SlackManifestTools'

interface CommanderOptions {
  manifest: string
  validate?: boolean
  update?: boolean
  create?: boolean
  delete?: boolean
  accessToken?: string
  refreshToken?: string
  app_id?: string
  rotate?: boolean
  environment?:boolean
}

(async () => {
  const program = new Command()

  program.option('-a, --app_id <app_id>', 'Slack app id. Required for manifest update.')
  program.option('-at, --accessToken <accessToken>', 'Slack app configuration access token. Required if refresh token is not provided.')
  program.option('-c, --create', 'Create a Slack app with provided manifest.')
  program.option('-d, --delete', 'Delete a Slack app. app_id argument is required.')
  program.option('-e, --environment', 'Replace placeholders in manifest with environment variables.')
  program.option('-m, --manifest <manifest>', 'Path to app manifest file. Required.')
  program.option('-r, --rotate', 'Print new access and refresh tokens to stdout. refreshToken argument is required.')
  program.option('-rt, --refreshToken <refreshToken>', 'Slack app configuration refresh token. Valid for only 12 hours. Required if access token is not provided.')
  program.option('-u, --update', 'Update Slack app manifest with provided manifest.')
  program.option('-v, --validate', 'Validate manifest file.')

  program.parse(process.argv)

  const options: CommanderOptions = program.opts()

  if (!options.manifest && !options.delete) {
    console.error('manifest file is required')
    process.exit(1)
  }

  if (!options.accessToken && !options.refreshToken) {
    console.error('slack app configuration access or refresh token is required')
    process.exit(1)
  }

  const smt = new SlackManifestTools({
    manifest: options.manifest,
    accessToken: options.accessToken,
    refreshToken: options.refreshToken,
    app_id: options.app_id,
    environment: options.environment
  })

  if (options.validate) {
    const valid = await smt.validate()
    if (valid) {
      console.log('manifest is valid')
    } else {
      console.error('manifest is invalid')
      process.exit(1)
    }
  }

  if (options.update) {
    const res = await smt.update()

    if (res.ok) {
      console.log('manifest updated')
    } else {
      console.error('manifest update failed')
      console.log(res)
      process.exit(1)
    }
  } else if (options.create) {
    const res = await smt.create()

    if (res.ok) {
      console.log(res)
    } else {
      console.error('app creation failed')
      console.log(res)
      process.exit(1)
    }
  } else if (options.rotate) {
    const res = await smt.rotate()

    if (res.ok) {
      console.log(res)
    } else {
      console.error('token generation failed')
      console.log(res)
      process.exit(1)
    }
  } else if (options.delete) {
    const res = await smt.delete()

    if (res.ok) {
      console.log('app deleted')
    } else {
      console.error('app deletion failed')
      console.log(res)
      process.exit(1)
    }
  }
})()
