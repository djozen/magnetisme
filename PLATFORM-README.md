# Elemental Balls - Platform Adventure

Un jeu de plateforme inspiré des 17 éléments du jeu original Elemental Balls Duel.

## 🎮 Concept

Parcourez **18 chapitres** (17 éléments + boss final) avec **4-6 niveaux** chacun. Chaque chapitre est thématiquement lié à un terrain élémentaire avec des ennemis, boss et décors uniques.

## 📋 Structure des Chapitres

### Chapitres 1-17 (Éléments)
1. **Earth** - Cavernes souterraines
2. **Fire** - Royaume volcanique
3. **Water** - Profondeurs aquatiques  
4. **Wind** - Îles flottantes
5. **Nature** - Forêt enchantée
6. **Lightning** - Royaume des tempêtes
7. **Ice** - Toundra gelée
8. **Shadow** - Royaume des ombres
9. **Light** - Sanctuaire céleste
10. **Metal** - Forteresse mécanique
11. **Poison** - Marais toxiques
12. **Psychic** - Paysage mental
13. **Wood** - Temple ancien
14. **Sound** - Chambres résonnantes
15. **Gold** - Coffre au trésor
16. **Glass** - Palais de cristal
17. **Void** - Vide infini

### Chapitre 18 - Boss Final
**Ultimate Challenge** - Affrontez le Maître de tous les éléments dans un niveau mélangeant décors et ennemis des 17 chapitres.

## 🎯 Structure des Niveaux

Chaque chapitre contient **5 niveaux** :

- **Niveaux 1-3** : Niveaux normaux avec difficulté progressive
- **Niveau 4** : Boss intermédiaire de l'élément
- **Niveau 5 (avant-dernier)** : Combat contre un joueur IA de cet élément
- **Niveau 6 (dernier)** : Boss final original et impressionnant

## 👾 Ennemis

### Ennemis de Base
Chaque élément possède **2 types d'ennemis** avec comportements uniques :
- **Terre** : Rock Golem, Tunnel Mole
- **Feu** : Living Flame, Fire Dragon
- **Eau** : Water Bubble, Aqua Shark
- Etc.

### Boss
- **Boss Intermédiaires** (Niveau 4) : Boss thématique de l'élément
- **Boss IA** (Avant-dernier niveau) : Joueur contrôlé par IA
- **Boss Finaux** : Boss originaux impressionnants
  - Earthquake Leviathan (Earth)
  - Inferno Phoenix (Fire)
  - Tsunami Serpent (Water)
  - Hurricane Dragon (Wind)
  - Etc.
- **Boss Ultime** : Elemental Overlord (maîtrise tous les éléments)

## ⚡ Pouvoirs

### Pouvoirs Élémentaires
Chaque élément possède un pouvoir unique :
- **Earth** : Rock Throw
- **Fire** : Fireball
- **Water** : Water Jet
- **Lightning** : Lightning Bolt
- Etc.

### Pouvoirs Cadeaux (Gift Powers)
Collectez des power-ups spéciaux :
- **Shield** : Invincibilité temporaire
- **Speed** : Augmente la vitesse
- **Power Up** : Double les dégâts
- **Heal** : Restaure la santé
- **Multi Shot** : Tire 3 projectiles

## 🎮 Contrôles

### Déplacement
- **←/→** ou **A/D** : Déplacer
- **↑** ou **W** ou **Espace** : Sauter
- **↓** ou **S** : Descendre (plateformes)

### Combat
- **Clic gauche** ou **Ctrl** : Tirer (pouvoir élémentaire)
- **1-5** : Utiliser pouvoir cadeau

### Mode Debug
- **Ctrl + N** : Niveau suivant
- **Ctrl + P** : Niveau précédent
- **Ctrl + H** : Afficher/masquer hitboxes
- **Ctrl + I** : Mode invincible

## 📊 Progression

- **Scores** : Collectez des boules et battez des ennemis
- **Débloquer** : Complétez des chapitres pour débloquer le suivant
- **Niveaux** : Votre niveau de joueur augmente avec les chapitres complétés
- **Éléments** : Débloquez de nouveaux éléments en progressant

## 🔧 Mode Debug

En mode debug, vous pouvez :
- Sélectionner n'importe quel chapitre
- Sélectionner n'importe quel niveau dans un chapitre
- Passer au niveau suivant/précédent avec Ctrl+N/P
- Afficher les hitboxes
- Activer l'invincibilité

## 🏆 Objectifs

1. Traverser les 17 chapitres élémentaires
2. Battre tous les boss
3. Collecter le maximum de boules
4. Obtenir les meilleurs scores
5. Affronter le Boss Ultime

## 📝 Notes de Développement

### Différences avec le jeu original
- Le personnage **Fish** est remplacé par **Bubble** (bulles d'eau)
- Terminologie : "Balls/Boules" au lieu de "Spirits/Esprits"
- Gameplay plateforme au lieu d'arène
- Système de niveaux et chapitres structurés
- Ennemis et boss uniques par élément

### Fichiers Principaux
- `ChapterConfig.js` - Configuration des 18 chapitres
- `EnemyTypes.js` - Définitions des ennemis (34 types)
- `BossTypes.js` - Définitions des boss (51 boss + boss ultime)
- `PlatformConfig.js` - Configuration du jeu
- `PlatformProgress.js` - Système de progression
- `ChapterSelectScene.js` - Sélection chapitre/niveau
- `PlatformScene.js` - Scène de jeu principale

## 🚀 Lancement

```bash
npm install
npm run dev
```

Ouvrez `http://localhost:3000` dans votre navigateur.

---

**Bon jeu et que les éléments soient avec vous ! ⚡🔥💧🌍**
