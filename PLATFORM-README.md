# Elemental Balls - Platform Adventure

Un jeu de plateforme inspiré des 17 éléments du jeu original Elemental Balls Duel.

## 🎮 Concept

Parcourez **18 chapitres** (17 éléments + boss final) avec **4-6 niveaux** chacun. Chaque chapitre est thématiquement lié à un terrain élémentaire avec des ennemis, boss et décors uniques.

## 📋 Structure des Chapitres

**IMPORTANT** : Le joueur ne passera **JAMAIS** par le chapitre de son propre élément. Par exemple, si vous jouez avec l'élément Fire, vous ne verrez pas le chapitre Fire dans la sélection.

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
- **Niveau 4** : Boss intermédiaire de l'élément du chapitre
- **Niveau 5 (dernier)** : Boss final original et impressionnant

**Note** : Le boss IA (joueur contrôlé par IA) a été retiré pour simplifier la structure.

## 👾 Ennemis

### Ennemis de Base
Chaque élément possède **4 types d'ennemis** avec comportements uniques :
- **Terre** : Rock Golem, Tunnel Mole, Rolling Boulder, Earth Worm
- **Feu** : Living Flame, Fire Dragon, Flame Imp, Fire Elemental
- **Eau** : Water Bubble, Aqua Shark, Electric Jellyfish, Tidal Wave
- **Vent** : Wind Wisp, Mini Tornado, Sky Harpy, Storm Cloud
- **Nature** : Thorny Vine, Tree Guardian, Spore Mushroom, Forest Fairy
- **Lightning** : Electric Spark, Thunder Cloud, Electric Eel, Living Bolt
- **Ice** : Ice Shard, Frost Yeti, Ice Penguin, Frost Crystal
- **Shadow** : Shadow Wraith, Dark Demon, Nightmare Bat, Living Shadow
- **Light** : Light Ray, Radiant Angel, Light Prism, Holy Wisp
- **Metal** : Spinning Blade, Steel Robot, Iron Gear, Auto Turret
- **Poison** : Toxic Slime, Venom Spider, Toxic Serpent, Venus Flytrap
- **Psychic** : Mind Orb, Psi Brain, All-Seeing Eye, Poltergeist
- **Wood** : Wooden Puppet, Forest Spirit, Rolling Log, Wood Archer
- **Sound** : Sound Wave, Echo Beast, Boom Box, Musical Note
- **Gold** : Living Coin, Gold Guardian, Golden Statue, Mimic Chest
- **Glass** : Glass Shard, Crystal Prism, Mirror Image, Crystal Chandelier
- **Void** : Void Hole, Void Entity, Void Tendril, Entropy Orb

**Total : 68 types d'ennemis**

### Boss
- **Boss Intermédiaires** (Niveau 4) : Boss thématique de l'élément
- **Boss Finaux** (Niveau 5) : Boss originaux impressionnants
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
- **Le joueur ne peut PAS jouer son propre chapitre élémentaire**
- Ennemis et boss uniques par élément (68 ennemis, 52 boss)

### Fichiers Principaux
- `ChapterConfig.js` - Configuration des 18 chapitres
- `EnemyTypes.js` - Définitions des ennemis (68 types - 4 par élément)
- `BossTypes.js` - Définitions des boss (52 boss + boss ultime)
- `PlatformConfig.js` - Configuration du jeu
- `PlatformProgress.js` - Système de progression
- `ChapterSelectScene.js` - Sélection de chapitre (exclut l'élément du joueur)
- `LevelSelectScene.js` - Sélection de niveau
- `PlatformScene.js` - Scène de jeu principale

## 🚀 Lancement

```bash
npm install
npm run dev
```

Ouvrez `http://localhost:3000` dans votre navigateur.

---

**Bon jeu et que les éléments soient avec vous ! ⚡🔥💧🌍**
