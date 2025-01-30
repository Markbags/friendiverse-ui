import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { I18nProvider } from '@lingui/react'
import { i18n } from '@lingui/core'
import { Trans } from '@lingui/react/macro'
import { loadInitialTranslations } from '@helpers/i18n/loadTranslations.js'
import I18nPicker from '@components/i18n/I18nPicker.jsx'

// TODO RTL
await loadInitialTranslations()

function App() {
  const [count, setCount] = useState(0)

  return (
    <I18nProvider i18n={i18n}>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <h1>
        <Trans>This should be translated.</Trans>
      </h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <I18nPicker />
    </I18nProvider>
  )
}

export default App
