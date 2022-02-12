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
