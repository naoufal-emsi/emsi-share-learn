
# EMSI Share - Plateforme Collaborative d'Apprentissage

EMSI Share est une plateforme éducative qui modernise l'apprentissage via des ressources pédagogiques, des quiz interactifs, un forum collaboratif et des événements.

## Architecture

- **Frontend**: React avec Tailwind CSS, Shadcn UI
- **Backend**: Django REST Framework
- **Base de données**: PostgreSQL

## Installation et configuration

### Prérequis

- Python 3.8+
- Node.js 18+
- PostgreSQL

### Configuration du Backend

1. Cloner le dépôt
2. Naviguer vers le dossier backend
3. Installer les dépendances Python:
   ```bash
   pip install -r requirements.txt
   ```
4. Configurer la base de données PostgreSQL:
   ```bash
   # Créer une base de données nommée emsi_share
   createdb emsi_share
   # OU
   psql -U postgres -c "CREATE DATABASE emsi_share WITH ENCODING 'UTF8';"
   ```
5. Appliquer les migrations:
   ```bash
   python manage.py migrate
   ```
6. Créer un super-utilisateur (administrateur):
   ```bash
   python create_admin.py
   # OU
   python manage.py createsuperuser
   ```
7. Charger les données initiales (optionnel):
   ```bash
   python manage.py loaddata initial_data.json
   ```
8. Démarrer le serveur:
   ```bash
   python manage.py runserver
   ```

### Configuration du Frontend

1. Naviguer vers le dossier racine du projet
2. Installer les dépendances:
   ```bash
   npm install
   ```
3. Démarrer le serveur de développement:
   ```bash
   npm run dev
   ```

## Comptes de démonstration

- **Administrateur**:
  - Email: admin@emsi.ma
  - Mot de passe: adminpassword

- **Enseignant**:
  - Email: teacher@emsi.ma
  - Mot de passe: password

- **Étudiant**:
  - Email: student@emsi.ma
  - Mot de passe: password

## Fonctionnalités principales

- **Authentification**: Système complet d'inscription et connexion
- **Gestion des ressources**: Chargement, partage et recherche de documents
- **Quiz interactifs**: Création et participation à des quiz
- **Forum de discussion**: Communication entre étudiants et enseignants
- **Calendrier d'événements**: Organisation et inscription aux événements

## API Endpoints

Le backend expose des API RESTful accessibles via:

- **Authentification**: `/api/token/`, `/api/users/register/`
- **Ressources**: `/api/resources/`
- **Quiz**: `/api/quizzes/`
- **Forum**: `/api/forum/topics/`, `/api/forum/posts/`, `/api/forum/replies/`
- **Événements**: `/api/events/`

Documentation complète de l'API accessible via l'interface d'administration Django.

## Déploiement

Pour un déploiement en production:

1. Configurer les variables d'environnement appropriées
2. Utiliser gunicorn ou uwsgi pour le backend Django
3. Construire l'application React pour la production: `npm run build`
4. Servir les fichiers statiques via Nginx

## Contribuer

1. Forker le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Commiter vos changements (`git commit -m 'Add some amazing feature'`)
4. Pousser vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request
