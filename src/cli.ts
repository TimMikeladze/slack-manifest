#!/usr/bin/env node

import { Command } from 'commander'
import { SlackManifestTools } from './SlackManifestTools'

interface CommanderOptions {
  manifest: string
  validate?: boolean
  update?: boolean
  token: string
}

(async () => {
  const program = new Command()

  program.option('-m, --manifest <manifest>', 'path to app manifest file')
  program.option('-t, --token <token>', 'slack app configuration refresh token')
  program.option('-v, --validate', 'validate app manifest file')
  program.option('-u, --update', 'update app manifest file')

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
    token: options.token
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
})()
