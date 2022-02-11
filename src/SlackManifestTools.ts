import { readFile } from 'fs/promises'
import fetch from 'node-fetch'

export interface SlackManifestOptions {
  manifest: string;
  token: string
  app_id?: string
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
    const res = await this.rotate()
    return res.token
  }

  public async rotate (): Promise<{
    ok: boolean,
    token: string
    refresh_token: string
  }> {
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

    if (!res.ok) {
      console.error(res)
    }

    return res
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

  public async update (): Promise<{
    'ok': boolean,
    'app_id': string,
    'permissions_updated': boolean
  }> {
    return await this.request('/apps.manifest.update', {
      manifest: await this.getManifest(),
      app_id: this.options.app_id
    })
  }

  public async create (): Promise<{
    'ok': boolean,
    'app_id': string,
    'credentials': {
      'client_id': string
      'client_secret': string
      'verification_token': string
      'signing_secret': string
    },
    'oauth_authorize_url': string
  }> {
    return await this.request('/apps.manifest.create', {
      manifest: await this.getManifest()
    })
  }
}
