import { useMemo, useState } from 'react'
import { useLocalStorage } from '@uidotdev/usehooks'

import {
  determineLocale,
  availableLocales,
} from '@helpers/i18n/availableLocales'
import { loadTranslations } from '@helpers/i18n/loadTranslations'

const I18nPicker = () => {
  const [localeCookie, setLocaleCookie] = useLocalStorage('locale', null)
  const [currentLocale, setCurrentLocale] = useState(
    localeCookie || determineLocale(),
  )

  const sortedLocales = useMemo(() => {
    const displays = new Intl.DisplayNames(currentLocale, {
      type: 'language',
      languageDisplay: 'standard',
    })

    return availableLocales
      .map((locale) => {
        return { id: locale, display: displays.of(locale) }
      })
      .sort((a, b) => {
        a.display.localeCompare(b.display, currentLocale)
      })
  }, [currentLocale])

  return (
    <label className="lang-selector">
      <select
        className="small"
        onChange={async (e) => {
          setLocaleCookie(e.target.value)
          await loadTranslations(e.target.value)
          setCurrentLocale(e.target.value)
        }}
        defaultValue={currentLocale}
      >
        {sortedLocales.map((locale) => {
          return (
            <option value={locale.id} key={`locale-${locale.id}`}>
              {locale.display}
            </option>
          )
        })}
      </select>
    </label>
  )
}

export default I18nPicker
