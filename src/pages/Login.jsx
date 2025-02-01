import { useEffect, useRef, useState, useCallback } from 'react'
import Link, { useSearchParams } from 'react-router-dom'

// TODO EVERYTHING

import './login.css'
// TODO remove / make our own
import logo from '@assets/logo.svg'

import { Trans, useLingui } from '@lingui/react/macro'

// Fuzzy searching
import Fuse from 'fuse.js'

import I18nPicker from '@components/i18n/I18nPicker'
import Loader from '@components/Loader'
import INSTANCES from '@/data/instances.js'

import {
  getAuthorizationURL,
  getPKCEAuthorizationURL,
  registerApplication,
  supportsPKCE,
} from '../utils/auth'

import store from '../utils/store'

import useTitle from '../utils/useTitle'

const { PHANPY_DEFAULT_INSTANCE: DEFAULT_INSTANCE } = import.meta.env

function Login() {
  const { t } = useLingui()
  useTitle(t`Log in`, '/login')
  const instanceURLRef = useRef()
  const cachedInstanceURL = store.local.get('instanceURL')
  const [uiState, setUIState] = useState('default')
  const [searchParams] = useSearchParams()
  const instance = searchParams.get('instance')
  const [instanceText, setInstanceText] = useState(
    instance || cachedInstanceURL?.toLowerCase() || '',
  )

  const searcher = useRef()
  useEffect(() => {
    searcher.current = new Fuse(INSTANCES)
  }, [])

  const submitInstance = (instanceURL) => {
    if (!instanceURL) return
    ;(async () => {
      // WEB_DOMAIN vs LOCAL_DOMAIN negotiation time
      // https://docs.joinmastodon.org/admin/config/#web_domain
      try {
        const res = await fetch(`https://${instanceURL}/.well-known/host-meta`) // returns XML
        const text = await res.text()
        // Parse XML
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(text, 'text/xml')
        // Get Link[template]
        const link = xmlDoc.getElementsByTagName('Link')[0]
        const template = link.getAttribute('template')
        const url = URL.parse(template)
        const { host } = url // host includes the port
        if (instanceURL !== host) {
          console.log(`💫 ${instanceURL} -> ${host}`)
          instanceURL = host
        }
      } catch (e) {
        // Silently fail
        console.error(e)
      }

      store.local.set('instanceURL', instanceURL)

      setUIState('loading')
      try {
        const { client_id, client_secret, vapid_key } =
          await registerApplication({
            instanceURL,
          })

        const authPKCE = await supportsPKCE({ instanceURL })
        console.log({ authPKCE })
        if (authPKCE) {
          if (client_id && client_secret) {
            store.sessionCookie.set('clientID', client_id)
            store.sessionCookie.set('clientSecret', client_secret)
            store.sessionCookie.set('vapidKey', vapid_key)

            const [url, verifier] = await getPKCEAuthorizationURL({
              instanceURL,
              client_id,
            })
            store.sessionCookie.set('codeVerifier', verifier)
            location.href = url
          } else {
            alert(t`Failed to register application`)
          }
        } else {
          if (client_id && client_secret) {
            store.sessionCookie.set('clientID', client_id)
            store.sessionCookie.set('clientSecret', client_secret)
            store.sessionCookie.set('vapidKey', vapid_key)

            location.href = await getAuthorizationURL({
              instanceURL,
              client_id,
            })
          } else {
            alert(t`Failed to register application`)
          }
        }
        setUIState('default')
      } catch (e) {
        console.error(e)
        setUIState('error')
      }
    })()
  }

  const cleanInstanceText = instanceText
    ? instanceText
        .replace(/^https?:\/\//, '') // Remove protocol from instance URL
        .replace(/\/+$/, '') // Remove trailing slash
        .replace(/^@?[^@]+@/, '') // Remove @?acct@
        .trim()
    : null

  const instanceTextLooksLikeDomain =
    /[^\s\r\n\t\/\\]+\.[^\s\r\n\t\/\\]+/.test(cleanInstanceText) &&
    !/[\s\/\\@]/.test(cleanInstanceText)

  const instancesSuggestions = cleanInstanceText
    ? searcher.current
        ?.search(cleanInstanceText, {
          limit: 10,
        })
        ?.map((match) => match.item)
    : []

  const selectedInstanceText = instanceTextLooksLikeDomain
    ? cleanInstanceText
    : instancesSuggestions?.length
      ? instancesSuggestions[0]
      : instanceText
        ? instancesList.find((instance) => instance.includes(instanceText))
        : null

  const onSubmit = useCallback((e) => {
    e.preventDefault()
    submitInstance(selectedInstanceText)
  }, [])

  return (
    <main id="login" style={{ textAlign: 'center' }}>
      <form onSubmit={onSubmit}>
        <h1>
          <img src={logo} alt="" width="80" height="80" />
          <br />
          <Trans>Log in</Trans>
        </h1>
        <label>
          <p>
            <Trans>Instance</Trans>
          </p>
          <input
            value={instanceText}
            required
            type="text"
            className="large"
            id="instanceURL"
            ref={instanceURLRef}
            disabled={uiState === 'loading'}
            // list="instances-list"
            autoCorrect="off"
            autoCapitalize="off"
            autoComplete="off"
            spellCheck={false}
            placeholder={t`instance domain`}
            onInput={(e) => {
              setInstanceText(e.target.value)
            }}
            dir="auto"
          />
          {instancesSuggestions?.length > 0 ? (
            <ul id="instances-suggestions">
              {instancesSuggestions.map((instance, i) => (
                <li>
                  <button
                    type="button"
                    className="plain5"
                    onClick={() => {
                      submitInstance(instance)
                    }}
                  >
                    {instance}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div id="instances-eg">
              <Trans>e.g. &ldquo;mastodon.social&rdquo;</Trans>
            </div>
          )}
        </label>
        {uiState === 'error' && (
          <p className="error">
            <Trans>
              Failed to log in. Please try again or try another instance.
            </Trans>
          </p>
        )}
        <div>
          <button
            disabled={
              uiState === 'loading' || !instanceText || !selectedInstanceText
            }
          >
            {selectedInstanceText
              ? t`Continue with ${selectedInstanceText}`
              : t`Continue`}
          </button>{' '}
        </div>
        <Loader hidden={uiState !== 'loading'} />
        <hr />
        {!DEFAULT_INSTANCE && (
          <p>
            <a href="https://joinmastodon.org/servers" target="_blank">
              <Trans>{"Don't have an account? Create one!"}</Trans>
            </a>
          </p>
        )}
        <p>
          <Link to="/">
            <Trans>Go home</Trans>
          </Link>
        </p>
        <I18nPicker />
      </form>
    </main>
  )
}

export default Login
