export type FacebookSDK = {
  init(options: {
    appId: string
    version: string
    autoLogAppEvents: boolean
    xfbml: boolean
  }): void
  login(
    callback: (response: { authResponse?: { code?: string } }) => void,
    options: {
      config_id: string
      response_type: "code"
      override_default_response_type: true
      extras: { setup: Record<string, never> }
    }
  ): void
}
declare global {
  interface Window {
    FB?: FacebookSDK
    fbAsyncInit?: () => void
  }
}
let loading: Promise<FacebookSDK> | undefined
export function loadFacebookSDK(): Promise<FacebookSDK> {
  if (window.FB) return Promise.resolve(window.FB)
  if (loading) return loading
  loading = new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      loading = undefined
      reject(new Error("Meta connection window could not be loaded."))
    }, 15000)
    window.fbAsyncInit = () => {
      window.clearTimeout(timeout)
      if (window.FB) resolve(window.FB)
      else reject(new Error("Meta SDK unavailable"))
    }
    const existing = document.getElementById("acroma-facebook-sdk")
    if (existing) existing.remove()
    const script = document.createElement("script")
    script.id = "acroma-facebook-sdk"
    script.src = "https://connect.facebook.net/en_US/sdk.js"
    script.async = true
    script.crossOrigin = "anonymous"
    script.onerror = () => {
      window.clearTimeout(timeout)
      loading = undefined
      reject(new Error("Allow the Meta connection window and try again."))
    }
    document.head.appendChild(script)
  })
  return loading
}

export function initializeSignupSDK(
  sdk: NonNullable<Window["FB"]>,
  config: { appId: string; graphVersion: string }
) {
  sdk.init({
    appId: config.appId,
    version: config.graphVersion,
    autoLogAppEvents: false,
    xfbml: false,
  })
}
