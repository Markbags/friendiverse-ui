const {
  DEV,
  PHANPY_CLIENT_NAME: CLIENT_NAME,
  PHANPY_WEBSITE: WEBSITE,
} = import.meta.env

const SCOPES = 'read write follow push'

function dec2hex(dec) {
  return ('0' + dec.toString(16)).slice(-2)
}
export function verifier() {
  var array = new Uint32Array(56 / 2)
  window.crypto.getRandomValues(array)
  return Array.from(array, dec2hex).join('')
}
function sha256(plain) {
  // returns promise ArrayBuffer
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}
function base64urlencode(a) {
  let str = ''
  const bytes = new Uint8Array(a)
  const len = bytes.byteLength
  for (var i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i])
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
export async function generateCodeChallenge(v) {
  const hashed = await sha256(v)
  return base64urlencode(hashed)
}

// If /.well-known/oauth-authorization-server exists and code_challenge_methods_supported includes "S256", means support PKCE
export async function supportsPKCE({ instanceURL }) {
  if (!instanceURL) return false
  try {
    const res = await fetch(
      `https://${instanceURL}/.well-known/oauth-authorization-server`,
    )
    if (!res.ok || res.status !== 200) return false
    const json = await res.json()
    if (json.code_challenge_methods_supported?.includes('S256')) return true
    return false
  } catch (e) {
    return false
  }
}

// For debugging
window.__generateCodeChallenge = generateCodeChallenge

/*
  PHANPY_WEBSITE is set to the default official site.
  It's used in pre-built releases, so there's no way to change it dynamically
  without rebuilding.
  Therefore, we can't use it as redirect_uri.
  We only use PHANPY_WEBSITE if it's "same" as current location URL.

  Very basic check based on location.hostname for now
*/
const sameSite = WEBSITE
  ? WEBSITE.toLowerCase().includes(location.hostname)
  : false
const currentLocation = location.origin + location.pathname
const REDIRECT_URI = DEV || !sameSite ? currentLocation : WEBSITE

export async function registerApplication({ instanceURL }) {
  const registrationParams = new URLSearchParams({
    client_name: CLIENT_NAME,
    redirect_uris: REDIRECT_URI,
    scopes: SCOPES,
    website: WEBSITE,
  })
  const registrationResponse = await fetch(
    `https://${instanceURL}/api/v1/apps`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: registrationParams.toString(),
    },
  )
  const registrationJSON = await registrationResponse.json()
  console.log({ registrationJSON })
  return registrationJSON
}

export async function getPKCEAuthorizationURL({ instanceURL, client_id }) {
  const codeVerifier = verifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const params = new URLSearchParams({
    client_id,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
  })
  const authorizationURL = `https://${instanceURL}/oauth/authorize?${params.toString()}`
  return [authorizationURL, codeVerifier]
}

export async function getAuthorizationURL({ instanceURL, client_id }) {
  const authorizationParams = new URLSearchParams({
    client_id,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    // redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
    response_type: 'code',
  })
  const authorizationURL = `https://${instanceURL}/oauth/authorize?${authorizationParams.toString()}`
  return authorizationURL
}

export async function getAccessToken({
  instanceURL,
  client_id,
  client_secret,
  code,
  code_verifier,
}) {
  const params = new URLSearchParams({
    client_id,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
    code,
    scope: SCOPES,
    // client_secret,
    // code_verifier,
  })
  if (client_secret) {
    params.append('client_secret', client_secret)
  }
  if (code_verifier) {
    params.append('code_verifier', code_verifier)
  }
  const tokenResponse = await fetch(`https://${instanceURL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
  const tokenJSON = await tokenResponse.json()
  console.log({ tokenJSON })
  return tokenJSON
}
