 Documentation du Workflow GitHub Actions: Auto Release

 Objectif du Workflow

Ce workflow GitHub Actions, nommé "Auto Release", est conçu pour automatiser le processus de construction et de publication (release) d'une application Python chaque fois qu'un commit sur la branche `main` contient le mot-clé "nouvelle version". Le workflow gère également la génération de nouvelles versions en fonction du contenu du message de commit, en respectant les principes du versionnement sémantique pour les mises à jour majeures, mineures et de patch.

 Déclencheur du Workflow

Le workflow est déclenché par des `push` sur la branche `main` du dépôt.

yaml
on:
  push:
    branches:
      - main


 Permissions

Le workflow nécessite des permissions pour écrire le contenu du dépôt et gérer les issues.

yaml
permissions:
  contents: write
  issues: write


 Jobs et Étapes

 1. Vérification du Message de Commit

- Action : Vérifie si le dernier message de commit contient le mot-clé "nouvelle version".
- Conditionnelle : Si le mot-clé est trouvé, la variable `SHOULD_RUN` est définie à `true`, autorisant les étapes suivantes.

 2. Configuration de l'Environnement Python

- Action : Configure l'environnement avec Python 3.12.2.
- Conditionnelle : S'exécute uniquement si `SHOULD_RUN` est `true`.

 3. Installation des Dépendances

- Action : Installe les dépendances Python spécifiées dans `requirements.txt`.
- Conditionnelle : S'exécute uniquement si `SHOULD_RUN` est `true`.

 4. Construction de l'Application

- Action : Utilise PyInstaller pour construire un exécutable à partir du script `main.py`.
- Conditionnelle : S'exécute uniquement si `SHOULD_RUN` est `true`.

 5. Archivage de l'Exécutable

- Action : Archive l'exécutable pour utilisation dans les étapes ultérieures ou pour le téléchargement.
- Conditionnelle : S'exécute uniquement si `SHOULD_RUN` est `true`.

 6. Génération d'une Nouvelle Version

- Action : Génère un nouveau tag de version basé sur le dernier tag et le contenu du message de commit. Incrémente la version majeure, mineure ou de patch en fonction des mots-clés "majeure", "mineure", ou "patch" dans le message de commit.

 7. Création de la Release GitHub

- Action : Crée une release GitHub avec le nouveau tag généré et y attache l'exécutable.
- Conditionnelle : S'exécute uniquement si `SHOULD_RUN` est `true`.