#!/usr/bin/env node

import { Command } from 'commander'
import { SlackManifestTools } from './SlackManifestTools'

interface CommanderOptions {
}

(async () => {
  const program = new Command()

  program.parse(process.argv)

  const options: CommanderOptions = program.opts()

  const smt = new SlackManifestTools({})
})()
