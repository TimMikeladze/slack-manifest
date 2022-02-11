#!/usr/bin/env node

import { Command } from 'commander'
import { SlackManifestTools } from './SlackManifestTools'

interface CommanderOptions {
  manifest: string
  validate?: boolean
  update?: boolean
  token: string
  app_id?: string
}

(async () => {
  const program = new Command()

  program.option('-m, --manifest <manifest>', 'Path to app manifest file. Required.')
  program.option('-t, --token <token>', 'Slack app configuration refresh token. Required.')
  program.option('-a, --app_id <app_id>', 'Slack app id. Required for manifest update.')
  program.option('-v, --validate', 'Validate manifest file.')
  program.option('-u, --update', 'Update Slack app manifest with provided manifest.')

  program.parse(process.argv)

  const options: CommanderOptions = program.opts()

  if (!options.manifest) {
    console.error('manifest file is required')
    process.exit(1)
  }

  if (!options.token) {
    console.error('slack app configuration token is required')
    process.exit(1)
  }

  const smt = new SlackManifestTools({
    manifest: options.manifest,
    token: options.token,
    app_id: options.app_id
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
      process.exit(1)
    }
  }
})()
