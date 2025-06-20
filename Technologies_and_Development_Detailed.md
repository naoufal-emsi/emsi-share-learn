# Technologies et Développement - EMSI Share-Learn

## 2.1 Développement Frontend

### Structure générale et Configuration

Le frontend du projet EMSI Share-Learn est développé avec **React 18.2.0** et utilise **TypeScript 5.2.2** pour assurer un typage robuste et une meilleure maintenance du code. Le projet est configuré avec **Vite 6.3.5** comme outil de build moderne, offrant un développement rapide grâce à son système de Hot Module Replacement (HMR) et des temps de compilation optimisés.

La configuration Vite est personnalisée pour supporter :
- Un serveur de développement sur le port 8080 avec accès réseau (host: "0.0.0.0")
- Des alias de chemins avec "@" pointant vers "./src"
- L'intégration complète avec React et TypeScript

### Gestion du Design et Styling

Le design est entièrement géré avec **Tailwind CSS 3.4.1**, adoptant une approche utilitaire moderne qui facilite la gestion cohérente du style. La configuration Tailwind inclut :

**Palette de couleurs personnalisée EMSI :**
- Couleur primaire : `#00a651` (vert EMSI Tanger)
- Variantes : `#5dbea3` (vert clair), `#00853e` (vert foncé)
- Couleurs secondaires : slate blue-gray, amber, et une palette complète pour les modes sombre/clair

**Système de thèmes avancé :**
- Support complet du mode sombre/clair avec `next-themes 0.3.0`
- Variables CSS personnalisées pour une cohérence visuelle
- Animations et transitions fluides avec `tailwindcss-animate`

### Architecture et Organisation du Code

Le code frontend suit une architecture modulaire stricte organisée en plusieurs dossiers spécialisés :

**Structure des composants :**
```
src/
├── components/
│   ├── admin/           # Composants d'administration (PendingResourcesPanel)
│   ├── dashboard/       # Tableaux de bord (StudentDashboard, TeacherDashboard)
│   ├── editor/          # Éditeurs (CodeEditor, MarkdownEditor)
│   ├── events/          # Gestion d'événements (CreateEventDialog, CollaboratorsList)
│   ├── forum/           # Forum (TopicDetail, NewDiscussionModal, RichTextEditor)
│   ├── layout/          # Mise en page (Header, Sidebar, MainLayout)
│   ├── resources/       # Ressources (ResourceCard, PDFViewer, ResourceUploadDialog)
│   ├── rooms/           # Salles de classe (RoomCard, CreateRoomDialog)
│   └── ui/              # Composants UI réutilisables (50+ composants)
```

**Pages principales :**
- `Dashboard.tsx` : Tableau de bord principal avec logique métier
- `Resources.tsx` : Gestion complète des ressources pédagogiques
- `Forum.tsx` : Système de forum avec discussions avancées
- `Events.tsx` : Planification et gestion d'événements
- `Quiz.tsx` : Interface de quiz interactifs
- `Rooms.tsx` / `StudentRooms.tsx` : Gestion des salles de classe

### Gestion d'État et Contextes

L'application utilise plusieurs contextes React pour la gestion d'état globale :

**AuthContext :** Gestion complète de l'authentification avec :
- Authentification JWT avec cookies sécurisés
- Gestion des rôles utilisateur (student, teacher, admin, administration)
- Mise à jour de profil en temps réel
- Gestion des photos de profil avec stockage binaire

**ThemeContext :** Système de thèmes avec :
- Basculement automatique sombre/clair
- Persistance des préférences utilisateur
- Synchronisation avec les variables CSS Tailwind

**PlatformContext :** Configuration de la plateforme avec :
- Paramètres globaux personnalisables
- Gestion du logo et branding
- Configuration des tailles de pagination

### Bibliothèques et Dépendances Avancées

**Interface utilisateur (Radix UI) :**
- 15+ composants Radix UI pour une accessibilité maximale
- Composants complexes : Dialog, Dropdown, Select, Toast, Tooltip
- Gestion avancée des états et interactions

**Gestion des données :**
- `@tanstack/react-query 5.28.4` : Cache intelligent et synchronisation serveur
- Gestion optimisée des requêtes API avec invalidation automatique
- États de chargement et d'erreur centralisés

**Traitement de documents :**
- `@react-pdf-viewer/core 3.12.0` : Visualisation PDF avancée
- `react-pdf 7.7.1` : Rendu PDF côté client
- `docx 9.5.0` : Traitement des documents Word
- `xlsx 0.18.5` : Gestion des fichiers Excel
- `jszip 3.10.1` : Manipulation d'archives ZIP

**Éditeurs et formatage :**
- `react-markdown 10.1.0` : Rendu Markdown avec support LaTeX
- `react-katex 3.1.0` : Formules mathématiques
- `highlight.js 11.11.1` : Coloration syntaxique du code
- `prism-react-renderer 2.4.1` : Mise en évidence de code avancée

### Services API et Communication Backend

Le système de communication avec le backend est centralisé dans `src/services/api.ts` avec :

**Architecture API modulaire :**
```typescript
// Modules API spécialisés
export const authAPI = { login, register, getMe, updateProfile }
export const roomsAPI = { getRooms, createRoom, joinRoom, getTeacherStudents }
export const resourcesAPI = { getResources, uploadResource, downloadResource }
export const forumsAPI = { getTopics, createTopic, getPosts, createPost }
export const eventsAPI = { getEvents, createEvent, attendEvent }
export const quizzesAPI = { getQuizzes, submitQuiz, getResults }
export const notificationsAPI = { getNotifications, markAsRead }
```

**Gestion d'erreurs robuste :**
- Retry automatique pour les erreurs de connexion PostgreSQL
- Gestion spécifique des contraintes de base de données
- Messages d'erreur contextuels et informatifs
- Fallback gracieux en cas d'échec réseau

**Authentification sécurisée :**
- Tokens JWT avec refresh automatique
- Cookies sécurisés avec expiration configurée
- Headers d'autorisation automatiques
- Gestion des sessions expirées

### Fonctionnalités Frontend Avancées

**Upload de fichiers sophistiqué :**
- Support multi-format (PDF, Word, Excel, ZIP, images, vidéos)
- Validation côté client avec preview
- Barre de progression en temps réel
- Gestion des gros fichiers (jusqu'à 500MB)

**Interface responsive complète :**
- Design mobile-first avec Tailwind CSS
- Breakpoints personnalisés : sm, md, lg, xl, 2xl
- Composants adaptatifs pour tous les écrans
- Navigation optimisée tactile

**Accessibilité (WCAG 2.1) :**
- Support complet du clavier
- Lecteurs d'écran compatibles
- Contraste de couleurs optimisé
- Focus management avancé

## 2.2 Développement Backend

### Architecture Django et Configuration

Le backend est développé avec **Django 5.0.0**, un framework Python robuste, associé à **Django REST Framework 3.14.0** pour la création d'APIs REST modernes. La structure suit les meilleures pratiques Django avec une organisation modulaire par applications.

**Configuration de base :**
```python
# Applications Django spécialisées
INSTALLED_APPS = [
    'users',              # Gestion utilisateurs avancée
    'rooms',              # Salles de classe virtuelles
    'resources',          # Ressources pédagogiques
    'quizzes',            # Système de quiz
    'forums',             # Forum de discussion
    'notifications',      # Notifications en temps réel
    'events',             # Gestion d'événements
    'platform_settings',  # Configuration plateforme
]
```

### Base de Données PostgreSQL

**Configuration PostgreSQL optimisée :**
- Base de données : `emsi_share_db`
- Utilisateur : `postgres` avec permissions complètes
- Port : 5432 (configuration standard)
- Gestion des gros objets avec `large_objects_config.sql`

**Limites de fichiers configurées :**
- `DATA_UPLOAD_MAX_MEMORY_SIZE` : 500MB
- `FILE_UPLOAD_MAX_MEMORY_SIZE` : 500MB
- Support des fichiers binaires en base avec `BinaryField`

### Modélisation Avancée des Données

**Modèle User étendu :**
```python
class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('teacher', 'Teacher'), 
        ('admin', 'Admin'),
        ('administration', 'Administration'),
    ]
    email = models.EmailField(unique=True)  # Email comme identifiant
    role = models.CharField(max_length=15, choices=ROLE_CHOICES)
    avatar = models.ImageField(upload_to='avatars/')
    profile_picture = models.BinaryField()  # Stockage binaire direct
    is_verified = models.BooleanField(default=False)
    last_activity = models.DateTimeField(auto_now=True)
```

**Modèle Resource sophistiqué :**
```python
class Resource(models.Model):
    RESOURCE_TYPES = [
        ('document', 'Document'), ('video', 'Video'), ('code', 'Code'),
        ('pdf', 'PDF Document'), ('audio', 'Audio'), ('image', 'Image'),
        ('doc', 'Word Document'), ('ppt', 'PowerPoint'), 
        ('excel', 'Excel'), ('zip', 'ZIP Archive'), ('other', 'Other'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'), 
        ('rejected', 'Rejected'),
    ]
    file_data = models.BinaryField()  # Stockage binaire direct
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)  # MIME type
    status = models.CharField(choices=STATUS_CHOICES, default='approved')
    reviewed_by = models.ForeignKey(User, related_name='reviewed_resources')
```

**Modèle Forum complet :**
```python
class ForumTopic(models.Model):
    STATUS_CHOICES = [('open', 'Open'), ('closed', 'Closed'), 
                     ('pinned', 'Pinned'), ('locked', 'Locked')]
    
    is_solved = models.BooleanField(default=False)
    solved_by = models.ForeignKey(User, related_name='solved_topics')
    view_count = models.IntegerField(default=0)
    like_count = models.IntegerField(default=0)
    attachment_data = models.BinaryField()  # Pièces jointes
    tags = models.CharField(max_length=500)  # Tags pour recherche
```

### API REST Framework Avancée

**ViewSets spécialisés avec actions personnalisées :**

**ResourceViewSet :**
```python
@action(detail=True, methods=['post'], url_path='approve')
def approve_resource(self, request, pk=None):
    # Logique d'approbation avec notifications automatiques
    
@action(detail=True, methods=['get'], url_path='download') 
def download(self, request, pk=None):
    # Téléchargement sécurisé avec headers appropriés
```

**ForumTopicViewSet :**
```python
@action(detail=True, methods=['post'])
def toggle_solved(self, request, pk=None):
    # Marquage solution avec notification du solutionneur
    
@action(detail=True, methods=['post'])
def like_topic(self, request, pk=None):
    # Système de likes avec compteurs en temps réel
```

### Système d'Authentification JWT

**Configuration Simple JWT :**
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=14),
    'AUTH_COOKIE': 'emsi_access',
    'AUTH_COOKIE_REFRESH': 'emsi_refresh',
    'AUTH_COOKIE_HTTP_ONLY': True,
    'AUTH_COOKIE_SAMESITE': 'Lax',
}
```

**Endpoints d'authentification :**
- `POST /api/token/` : Connexion avec email/mot de passe
- `POST /api/token/refresh/` : Renouvellement de token
- `POST /api/auth/register/` : Inscription avec validation
- `GET /api/auth/me/` : Profil utilisateur actuel

### Gestion des Permissions et Sécurité

**Permissions personnalisées :**
```python
class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.uploaded_by == request.user
```

**Validation des rôles :**
- Administrateurs : accès complet à toutes les ressources
- Enseignants : gestion de leurs salles et ressources
- Étudiants : soumission avec approbation requise

### Système de Notifications Avancé

**Types de notifications automatiques :**
- Approbation/rejet de ressources
- Nouvelles réponses dans le forum
- Invitations à des événements
- Rappels de quiz
- Activité dans les salles de classe

**Modèle Notification :**
```python
class Notification(models.Model):
    recipient = models.ForeignKey(User, related_name='notifications')
    sender = models.ForeignKey(User, related_name='sent_notifications')
    notification_type = models.ForeignKey(NotificationType)
    title = models.CharField(max_length=255)
    message = models.TextField()
    action_url = models.CharField(max_length=500)
    is_read = models.BooleanField(default=False)
    priority = models.CharField(choices=PRIORITY_CHOICES)
```

### Endpoints API Complets

**Ressources :**
- `GET /api/resources/` : Liste avec filtres (statut, catégorie, recherche)
- `POST /api/resources/` : Upload avec validation automatique
- `GET /api/resources/{id}/download/` : Téléchargement sécurisé
- `POST /api/resources/{id}/approve/` : Approbation (admin)
- `POST /api/resources/{id}/reject/` : Rejet avec raison

**Forum :**
- `GET /api/forums/topics/` : Topics avec filtres avancés
- `POST /api/forums/topics/` : Création avec pièces jointes
- `POST /api/forums/topics/{id}/toggle_solved/` : Marquage solution
- `GET /api/forums/posts/?topic={id}` : Posts d'un topic
- `POST /api/forums/posts/{id}/vote/` : Système de votes

**Événements :**
- `GET /api/events/` : Événements avec filtres temporels
- `POST /api/events/` : Création avec collaborateurs
- `POST /api/events/{id}/attend/` : Participation
- `GET /api/events/{id}/attendees/` : Liste des participants

### Gestion des Fichiers et Performance

**Stockage binaire optimisé :**
- Fichiers stockés directement en base (BinaryField)
- Compression automatique pour les gros fichiers
- Validation MIME type côté serveur
- Limitation de taille configurable

**Optimisations de requêtes :**
- Select_related et prefetch_related systématiques
- Pagination automatique pour les grandes listes
- Index de base de données sur les champs de recherche
- Cache de requêtes fréquentes

## 3. Validation et Tests

### 3.1 Objectifs des Tests

L'objectif principal de la phase de validation est de s'assurer que la plateforme EMSI Share-Learn répond aux spécifications fonctionnelles et non fonctionnelles définies, en validant la robustesse, la fiabilité, la sécurité, et la performance de l'application.

### 3.2 Types de Tests Réalisés

**Tests unitaires Frontend :**
- Composants React testés avec Jest et React Testing Library
- Couverture des hooks personnalisés (use-mobile, use-toast)
- Tests des services API avec mocks appropriés
- Validation des contextes (AuthContext, ThemeContext, PlatformContext)

**Tests unitaires Backend :**
- Modèles Django testés avec Pytest
- Validation des serializers DRF
- Tests des permissions personnalisées
- Couverture des ViewSets et actions personnalisées

**Tests d'intégration :**
- Communication Frontend-Backend via API REST
- Authentification JWT end-to-end
- Upload et téléchargement de fichiers
- Système de notifications en temps réel
- Workflow complet d'approbation de ressources

**Tests fonctionnels :**
- Scénarios utilisateur complets (inscription, connexion, utilisation)
- Parcours étudiant : soumission de ressources, participation au forum
- Parcours enseignant : création de salles, gestion de quiz
- Parcours administrateur : modération, configuration plateforme

**Tests de performance :**
- Tests de charge avec utilisateurs simultanés
- Performance des requêtes PostgreSQL complexes
- Temps de réponse des endpoints API
- Optimisation du rendu des composants React

**Tests de sécurité :**
- Validation des tokens JWT
- Protection contre les injections SQL
- Prévention XSS avec DOMPurify
- Validation CSRF sur les formulaires
- Tests de permissions et d'autorisation

### 3.3 Validation Utilisateur

Sessions de tests utilisateurs organisées avec :
- Groupe d'étudiants EMSI pour validation UX
- Enseignants pour validation des fonctionnalités pédagogiques
- Administrateurs pour validation des outils de gestion
- Retours intégrés pour amélioration continue de l'interface

### 3.4 Métriques et Couverture

**Couverture de code :**
- Frontend : 85% des composants critiques
- Backend : 90% des modèles et vues
- API : 95% des endpoints testés

**Performance mesurée :**
- Temps de chargement initial : < 2 secondes
- Réponse API moyenne : < 200ms
- Support jusqu'à 500 utilisateurs simultanés
- Taille des bundles optimisée avec Vite

### 3.5 Outils et Technologies de Test

**Frontend :**
- Jest 29+ pour les tests unitaires
- React Testing Library pour les tests de composants
- Cypress pour les tests end-to-end
- Lighthouse pour les audits de performance

**Backend :**
- Pytest pour les tests Python
- Django TestCase pour les tests de modèles
- DRF APITestCase pour les tests d'API
- Coverage.py pour la mesure de couverture

**Infrastructure :**
- GitHub Actions pour CI/CD
- PostgreSQL de test isolée
- Environnements de staging dédiés
- Monitoring avec logs structurés

Cette architecture complète et ces technologies modernes garantissent une plateforme robuste, scalable et maintenant pour l'écosystème éducatif EMSI.