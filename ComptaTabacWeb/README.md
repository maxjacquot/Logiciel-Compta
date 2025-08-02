
# React + Vite

Ce projet utilise Vite et React pour l'interface web.

## Intégration Make.com

Après le traitement du fichier par le backend, le fichier modifié est envoyé automatiquement à Make.com via un webhook.

**Le call Make.com est fait avec le compte : jacquotmaximepro@gmail.com**

Configure l'URL du webhook dans le fichier `.env.production` avec la variable `VITE_MAKE_WEBHOOK_URL`.

## ESLint et configuration avancée

Pour une application de production, il est recommandé d'utiliser TypeScript avec des règles de lint adaptées. Voir le [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) pour plus d'informations.
