import { readFile } from 'fs/promises'
import fetch from 'node-fetch'

export interface SlackManifestOptions {
  manifest: string;
  token: string
}

const SLACK_API = 'https://slack.com/api'

export class SlackManifestTools {
  private readonly options: SlackManifestOptions

  constructor (options: SlackManifestOptions) {
    this.options = options
  }

  public async getManifest (): Promise<string> {
    const filePath = this.options.manifest
    return await readFile(filePath, 'utf8')
  }

  public async getAccessToken (): Promise<string> {
    const body = {
      refresh_token: this.options.token
    }

    const res = await (await fetch(SLACK_API + '/tooling.tokens.rotate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json'
      },
      body: new URLSearchParams(Object.entries(body)).toString()
    })).json() as {
      ok: boolean,
      token: string
      refresh_token: string
    }

    return res.token
  }

  public async request (method: string, params: object = {}): Promise<any> {
    const accessToken = await this.getAccessToken()

    const body = JSON.stringify({
      ...params
    })

    const res = await fetch(SLACK_API + method, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      },
      body
    })

    return await res.json()
  }

  public async validate (): Promise<boolean> {
    const res = await this.request('/apps.manifest.validate', {
      manifest: await this.getManifest()
    })

    return !!res?.ok
  }
}
