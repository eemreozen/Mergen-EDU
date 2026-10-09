import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslation from './locales/en.json'
import trTranslation from './locales/tr.json'

const savedLanguage = typeof window !== 'undefined' 
  ? localStorage.getItem('projectpath_lang') || 'tr'
  : 'tr'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: trTranslation },
      en: { translation: enTranslation },
    },
    lng: savedLanguage,
    fallbackLng: 'tr',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
