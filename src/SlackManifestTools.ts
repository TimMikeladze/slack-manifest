import { readFile } from 'fs/promises'
import fetch from 'node-fetch'
import { resolve } from 'path'

export interface SlackManifestOptions {
  manifest: string;
  accessToken?: string
  refreshToken?: string
  app_id?: string
  environment?: boolean
}

const SLACK_API = 'https://slack.com/api'

export class SlackManifestTools {
  private readonly options: SlackManifestOptions

  constructor (options: SlackManifestOptions) {
    this.options = options
  }

  public async getManifest (): Promise<string> {
    const filePath = this.options.manifest

    const extension = filePath.split('.').pop()

    if (extension === 'ts' || extension === 'tsx') {
      return JSON.stringify((await import(resolve(filePath))).default.default)
    } else if (extension === 'json') {
      let data = await readFile(filePath, 'utf8')

      if (this.options.environment) {
        data = data.replace(/\${(.*?)\}/g, function (match, token) {
          return process.env[token]
        })
      }

      return data
    } else {
      throw new Error(`Unsupported file extension: ${extension}`)
    }
  }

  public async getAccessToken (): Promise<string> {
    if (this.options.accessToken) {
      return this.options.accessToken
    }
    const res = await this.rotate()
    return res.token
  }

  public async rotate (): Promise<{
    ok: boolean,
    token: string
    refresh_token: string
  }> {
    const body = {
      refresh_token: this.options.refreshToken
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
