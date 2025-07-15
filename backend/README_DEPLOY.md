# Déploiement du backend Flask

## 1. Installer les dépendances

```bash
pip install -r requirements.txt
```

## 2. Lancer en production avec gunicorn

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 3. Sécuriser CORS

Modifie la ligne dans `app.py` :

```python
CORS(app, resources={r"/*": {"origins": "https://ton-frontend.com"}})
```

## 4. Reverse proxy (optionnel mais recommandé)

Utilise Nginx ou Apache pour HTTPS et la montée en charge.

## 5. Variables d'environnement

Configure le port, le mode debug, etc. via des variables d'environnement si besoin.

## 6. Limite d'upload

La taille des fichiers est limitée à 10 Mo par défaut (`MAX_CONTENT_LENGTH`).

## 7. Logs

Ajoute une solution de logs si nécessaire pour la production.

---

Pour toute question, demande à GitHub Copilot !
