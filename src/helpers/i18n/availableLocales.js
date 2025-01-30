import {
  fromNavigator,
  fromStorage,
  fromUrl,
  multipleDetect,
} from '@lingui/detect-locale'

// TODO determine how we want to use env things, most likely dotenv
// Vite automatically adds env vars into import.meta.env
const env_default = import.meta.env.DEFAULT_LANG
export const DEFAULT_LANG = env_default ? env_default : 'en'

// TODO currently Phanpy has a script we might also want one
//import catalogs from './data/catalogs.json'
const catalogs = [
  {
    code: 'ca-ES',
    name: 'Catalan',
    completion: 55,
  },
  {
    code: 'en',
    name: 'English',
    completion: 100,
  },
]

// Get locales that's >= X% translated
const PERCENTAGE_THRESHOLD = import.meta.env.LANG_THRESHOLD || 50

export const availableLocales = [
  ...catalogs
    .filter(({ completion }) => completion >= PERCENTAGE_THRESHOLD)
    .map(({ code }) => code),
]

export const determineLocale = () => {
  const languages = multipleDetect(
    fromUrl('locale'),
    fromStorage('locale'),
    fromNavigator(),
    DEFAULT_LANG,
  )
  const matchedLang = languages.find((l) => availableLocales.includes(l))

  return matchedLang ? matchedLang : DEFAULT_LANG
}
