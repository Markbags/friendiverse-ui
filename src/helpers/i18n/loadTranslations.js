import { i18n } from '@lingui/core'

import { determineLocale, DEFAULT_LANG } from './availableLocales'

export async function loadTranslations(locale) {
  try {
    const { messages } = await import(`@locales/${locale}/messages.po`)
    i18n.loadAndActivate({ locale, messages })
  } catch (error) {
    console.error('Error loading i18n. Loading default as fallback', error)
    const { messages } = await import(`@locales/${locale}/messages.po`)
    i18n.loadAndActivate({ locale: DEFAULT_LANG, messages })
  }
}

export async function loadInitialTranslations() {
  const locale = determineLocale()
  await loadTranslations(locale)
}
