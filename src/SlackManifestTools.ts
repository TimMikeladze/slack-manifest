import { readFile } from 'fs/promises'
import fetch from 'node-fetch'
import { resolve } from 'path'

export interface SlackManifestOptions {
  manifest?: string;
  accessToken?: string
  refreshToken?: string
  app_id?: string
  environment?: boolean
}

const SLACK_API = 'https://slack.com/api'

export interface Manifest {
  _metadata?: {
    major_version?: number;
    minor_version?: number;
  }
  display_information: {
    name: string
    description?: string
    long_description?: string
    background_color?: string
  }
  settings?: {
    allowed_up_address_ranges?: string[]
    event_subscriptions?: {
      request_url?: string
      bot_events?: string[]
      user_events?: string[]
    }
    interactivity?: {
      is_enabled?: boolean
      request_url?: string
      message_menu_options_url?: string
    }
    deploy_enabled?: boolean
    socket_mode_enabled?: boolean
    org_deploy_enabled?: boolean
    token_rotation_enabled?: boolean
  }
  features?: {
    app_home?: {
      home_tab_enabled?: boolean
      messages_tab_enabled?: boolean
      messages_tab_read_only_enabled?: boolean
    }
    bot_user?: {
      display_name?: string
      always_online?: boolean
    }
    shortcuts?: {
      name: string
      type: string
      callback_id: string
      description: string
    }[]
    slash_commands?: {
      command: string
      description: string
      url?: string
      usage_hint?: string
      should_escape?: boolean
    }[]
    workflow_steps?: {
      name: string
      callback_id: string
    }[]
    unfurl_domain?: string[]
  }
  oauth_config?: {
    redirect_urls?: string[]
    scopes?: {
      bot?: string[]
      user?: string[]
    }
  }
}

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

  public async delete (): Promise<{
    ok: boolean
    error?: string
  }> {
    return await this.request('/apps.manifest.delete', {
      app_id: this.options.app_id
    })
  }
}
