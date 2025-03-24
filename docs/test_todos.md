# Tests à implémenter

## PhotoService

### Tests pour search_photos
- [x] Test avec requête vide
- [x] Test de recherche par titre
- [x] Test de recherche par tags
- [x] Test de recherche par lieu
- [x] Test de recherche par personnes
- [x] Test avec plusieurs termes de recherche
- [x] Test insensible à la casse

### Tests pour get_photos
- [ ] Test avec critères vides
- [ ] Test de filtrage par tags
- [ ] Test de filtrage par personnes
- [ ] Test de filtrage par dates
- [ ] Test de filtrage par lieu
- [ ] Test avec plusieurs critères combinés
- [ ] Test avec critères invalides

## PersonService

### Tests pour search_people
- [ ] Test avec requête vide
- [ ] Test de recherche par nom
- [ ] Test de recherche par biographie
- [ ] Test avec plusieurs termes de recherche
- [ ] Test insensible à la casse
- [ ] Test de l'ordre alphabétique
- [ ] Test de la limite de résultats

### Tests pour get_people
- [ ] Test avec critères vides
- [ ] Test de filtrage par date de naissance
- [ ] Test de filtrage par date de décès
- [ ] Test de filtrage personnes vivantes/décédées
- [ ] Test avec plusieurs critères combinés
- [ ] Test avec dates invalides
- [ ] Test de l'ordre alphabétique

## Routes API

### Tests pour /api/photos/search
- [ ] Test de recherche textuelle simple
- [ ] Test de filtrage par critères
- [ ] Test de recherche combinée (texte + critères)
- [ ] Test avec paramètres invalides
- [ ] Test de gestion des erreurs

### Tests pour /api/persons/search
- [ ] Test de recherche textuelle simple
- [ ] Test de filtrage par dates
- [ ] Test de filtrage vivants/décédés
- [ ] Test de recherche combinée
- [ ] Test avec dates invalides
- [ ] Test de gestion des erreurs

## Notes d'implémentation
- Utiliser pytest pour tous les tests
- Créer des fixtures réutilisables pour les données de test
- Tester les cas limites et les erreurs
- Vérifier la pagination et les limites de résultats
- S'assurer que les tests sont indépendants et isolés
