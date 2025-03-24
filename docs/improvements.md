# Family Nexus - Liste des Améliorations

## Gestion des Photos
- [ ] Upload multiple de photos (batch upload)
- [ ] Interface drag-and-drop pour l'upload
- [ ] Fonctionnalités d'édition de photos
  - [ ] Recadrage
  - [ ] Rotation
  - [ ] Ajustements basiques (luminosité, contraste)
- [ ] Support des albums/collections
- [ ] Téléchargement des photos
- [ ] Partage de photos via liens

## Améliorations UI/UX
- [ ] Ajout de skeletons pour le chargement
- [ ] Défilement infini pour la grille de photos
- [ ] Mode diaporama
- [ ] Amélioration de la réactivité mobile
- [ ] Support du mode sombre
- [ ] Meilleure gestion des erreurs
- [ ] Tooltips et textes d'aide

## Organisation des Photos
- [ ] Filtres de recherche avancés
  - [ ] Plages de dates
  - [ ] Lieux
  - [ ] Personnes
- [ ] Suggestions de tags par IA
- [ ] Détection/reconnaissance faciale
- [ ] Clustering des photos sur une carte
- [ ] Champs de métadonnées personnalisés

## Personnes & Généalogie
- [ ] Visualisation de l'arbre généalogique
- [ ] Amélioration des pages de profil
- [ ] Interface de gestion des relations
- [ ] Vue chronologique des photos par personne
- [ ] Suivi des événements
  - [ ] Anniversaires
  - [ ] Dates importantes
- [ ] Gestion des groupes familiaux

## Sécurité & Authentification
- [ ] Implémenter un système d'authentification complet
  - [ ] Ajouter une table users avec les champs nécessaires (email, password_hash, etc.)
  - [ ] Créer les endpoints d'authentification (login, register, logout)
  - [ ] Ajouter un système de sessions ou JWT
  - [ ] Gérer les rôles utilisateurs (admin, user, etc.)
- [ ] Sécuriser les endpoints avec des middlewares d'authentification
- [ ] Ajouter la validation CSRF pour les formulaires
- [ ] Mettre en place une gestion des permissions par ressource
- [ ] Système d'authentification
- [ ] Contrôle d'accès basé sur les rôles
- [ ] Albums privés/partagés
- [ ] Paramètres de confidentialité des photos
- [ ] Mécanismes de partage sécurisé

## Performance
- [ ] Optimisation et redimensionnement des images
- [ ] Mise en cache côté client
- [ ] Optimisation des requêtes base de données
- [ ] Options de compression d'images
- [ ] Chargement progressif des images

## Intégration & Export
- [ ] Import depuis d'autres services photos
- [ ] Fonctionnalité de sauvegarde
- [ ] Options d'export
  - [ ] ZIP
  - [ ] Albums PDF
- [ ] Import/export GEDCOM pour données généalogiques
- [ ] Partage sur réseaux sociaux

## Qualité de Vie
- [ ] Raccourcis clavier
- [ ] Fonctionnalité annuler/rétablir
- [ ] Opérations en masse
  - [ ] Tags
  - [ ] Déplacement
  - [ ] Suppression
- [ ] Commentaires et descriptions de photos
- [ ] Journal d'activité/historique

## Notes
- Priorité : Commencer par les améliorations UI/UX et la gestion des photos
- Mettre à jour cette liste au fur et à mesure de l'avancement
- Ajouter des dates cibles pour chaque fonctionnalité
- Marquer les dépendances entre les fonctionnalités
