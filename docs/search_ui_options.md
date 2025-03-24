# Options d'Interface de Recherche

## 1. Barre de Recherche Unifiée
- **Description** : Une barre de recherche unique en haut de l'application
- **Fonctionnement** :
  - Recherche instantanée pendant la frappe
  - Résultats groupés par type (Photos/Personnes)
  - Utilise : `search_photos` et `search_people`
- **Avantages** :
  - Simple et intuitif
  - Rapide pour les recherches générales
  - Interface familière (style Google)
- **Inconvénients** :
  - Moins précis pour les recherches avancées
  - Pas de filtres spécifiques

## 2. Recherche Avancée avec Filtres
- **Description** : Interface avec onglets et filtres détaillés
- **Fonctionnement** :
  - Onglets Photos/Personnes
  - Panneau de filtres à gauche
  - Zone de résultats à droite
- **Photos** :
  - Barre de recherche textuelle (`search_photos`)
  - Filtres :
    - Date de prise de vue
    - Tags
    - Personnes présentes
    - Lieu
  - Utilise : `get_photos` pour les filtres
- **Personnes** :
  - Barre de recherche textuelle (`search_people`)
  - Filtres :
    - Date de naissance
    - Date de décès
    - Vivant/Décédé
    - Relations familiales
  - Utilise : `get_people` pour les filtres

## 3. Solution Hybride (Recommandée)
- **Description** : Combine les deux approches
- **Fonctionnement** :
  1. Barre de recherche rapide en haut
     - Toujours accessible
     - Résultats instantanés
     - Utilise : `search_photos` et `search_people`
  
  2. Bouton "Recherche avancée"
     - Ouvre une interface avec filtres
     - Onglets Photos/Personnes
     - Tous les filtres disponibles
     - Utilise : `get_photos` et `get_people`
     - Peut combiner recherche textuelle et filtres

- **Avantages** :
  - Flexible pour tous les cas d'usage
  - Simple par défaut, puissant si nécessaire
  - Meilleure expérience utilisateur

## Exemple d'Implémentation (Solution Hybride)

```typescript
// Components/SearchBar.tsx
interface SearchBar {
  mode: 'quick' | 'advanced';
  type?: 'photos' | 'persons';
  onSearch: (query: string) => void;
}

// Components/SearchFilters.tsx
interface SearchFilters {
  type: 'photos' | 'persons';
  onFilter: (criteria: SearchCriteria) => void;
}

// Pages/Search.tsx
interface SearchCriteria {
  query?: string;
  filters?: {
    startDate?: Date;
    endDate?: Date;
    tags?: string[];
    people?: number[];
    location?: string;
    // ... autres filtres
  };
}
```

## Flux de Navigation

1. Depuis n'importe quelle page :
   - Recherche rapide via la barre en haut
   - Résultats dans une dropdown ou redirection vers page de résultats

2. Page de recherche dédiée :
   - Accessible via "Recherche avancée"
   - Filtres persistants pendant la session
   - Possibilité de sauvegarder des recherches favorites

3. Galerie Photos et Liste des Personnes :
   - Filtres rapides contextuels
   - Tri et organisation des résultats
   - Vue en grille/liste configurable
