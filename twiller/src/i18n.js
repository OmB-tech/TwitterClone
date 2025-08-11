import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false,
    resources: {
      en: { translation: { home: 'Home', explore: 'Explore', notifications: 'Notifications', messages: 'Messages', tweet: 'Tweet' } },
      es: { translation: { home: 'Inicio', explore: 'Explorar', notifications: 'Notificaciones', messages: 'Mensajes', tweet: 'Twittear' } },
      hi: { translation: { home: 'होम', explore: 'अन्वेषण', notifications: 'सूचनाएं', messages: 'संदेश', tweet: 'ट्वीट' } },
      fr: { translation: { home: 'Accueil', explore: 'Explorer', notifications: 'Notifications', messages: 'Messages', tweet: 'Tweeter' } },
      pt: { translation: { home: 'Página Inicial', explore: 'Explorar', notifications: 'Notificações', messages: 'Mensagens', tweet: 'Tweetar' } },
      zh: { translation: { home: '家', explore: '探索', notifications: '通知', messages: '留言', tweet: '鸣叫' } },
    }
  });

export default i18n;