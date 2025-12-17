# Elemental Magnetism 🎮

Un jeu Phaser 3 avec **deux modes de jeu** : un mode collection d'esprits inspiré de Great Ghoul Duel de Google, et un mode plateforme avec 18 chapitres élémentaires.

## 🎯 Modes de Jeu

### Mode Collection (Jeu Principal)
Compétition jusqu'à 8 joueurs pour collecter des esprits avec vos mascottes élémentaires!

### Mode Plateforme
Aventure solo à travers 18 chapitres avec ennemis, boss et pouvoirs élémentaires!

---

## 🌟 Mode Collection - Caractéristiques

✨ **17 Types Élémentaires:**
- Water 💧 (Niveau 1)
- Fire 🔥 (Niveau 1)
- Wind 💨 (Niveau 1)
- Earth 🌍 (Niveau 1)
- Nature 🍃 (Niveau 5)
- Ice ❄️ (Niveau 7)
- Lightning ⚡ (Niveau 10)
- Metal 🔩 (Niveau 11)
- Wood 🪵 (Niveau 12)
- Shadow 🌑 (Niveau 13)
- Light ✨ (Niveau 13)
- Poison ☢️ (Niveau 15)
- Sound 🔊 (Niveau 17)
- Psychic 🔮 (Niveau 17)
- Gravity 🌀 (Niveau 19)
- Time ⏰ (Niveau 20)
- Space 🌌 (Niveau 21)

🎮 **Gameplay:**
- Jusqu'à 8 joueurs simultanés
- IA contrôle les emplacements vides
- Collectez des esprits neutres mignons
- Rounds de 3 minutes avec suivi de score
- Classement en temps réel
- Compétition par équipe avec bases élémentaires uniques

🎁 **Système de Cadeaux:**
- **Cadeaux Élémentaires** (Violet) - Débloquez des pouvoirs supplémentaires (max 1 pouvoir cadeau)
- **Cadeaux Temps** (Cyan) - Ajoutez 20 secondes au chrono
- **Cadeaux Magnétisme** (Jaune) - Attirez tous les esprits proches pendant 10 secondes
- Apparition aléatoire durant la partie
- Capacité limitée : FIFO (premier entré, premier sorti)

⚡ **Système de Pouvoirs:**
- **Pouvoir Principal (ESPACE)** - Capacité unique de votre élément
  - Système de charge pour joueurs humains
  - Cooldown 30 secondes pour IA
- **Pouvoirs Cadeaux (1/2/3)** - Activez les pouvoirs collectés
  - Cooldown 20 secondes partagé
- **Mode Debug** - Pouvoirs illimités (configurable dans `src/config.js`)

### Pouvoirs Élémentaires

- **Water** 💧 - Vague de recul qui repousse les ennemis ET détache leurs esprits (immunité water) (rayon 3 tuiles + 0.2/niveau)
- **Fire** 🔥 - Détruit les esprits ennemis, protège les vôtres (rayon 2 tuiles + 0.2/niveau)
- **Wind** 💨 - Crée une zone tornade avec particules visibles (rayon 1.5 tuiles + 0.2/niveau, 10 secondes)
- **Earth** 🌍 - Mur de 3 côtés ouvert à droite (5 tuiles, 10 secondes)
- **Nature** 🍃 - Soigne et booste la vitesse des alliés
- **Ice** ❄️ - Zone de gel qui stoppe complètement le mouvement (rayon 1.5 tuiles, 5 secondes)
- **Lightning** ⚡ - Téléporte les ennemis à votre base et vole leurs esprits (zone 10 secondes)
- **Metal** 🔩 - Magnétisme qui attire tous les esprits (rayon 5 tuiles, 2 secondes)
- **Wood** 🪵 - Invoque des barrières de bois défensives
- **Shadow** 🌑 - Trou noir (2 tuiles) avec magnétisme (6 tuiles), fait disparaître les ennemis 5 secondes
- **Light** ✨ - Téléportation à la base avec +10 bonus, zone de répulsion/soin (3 tuiles)
- **Poison** ☢️ - Empoisonne les ennemis pendant 12 secondes
- **Sound** 🔊 - Clone IA qui collecte pendant 20 secondes
- **Psychic** 💥 - Explosion d'énergie sans disperser les esprits (12s base + 0.2s/niveau)
- **Gravity** 🌀 - Ralentit les ennemis à 30% dans la zone (rayon 2 tuiles)
- **Time** ⏰ - [À définir]
- **Space** 🌌 - Convertit les ennemis en alliés pendant 15 secondes (rayon 4 tuiles)

🤖 **IA Intelligente:**
- Personnalités uniques pour chaque IA
- Niveaux d'agressivité variés (30%-80%)
- Collection stratégique (priorité esprits proches <300 unités)
- Cooldown pouvoir 30 secondes (pas d'utilisation les 30 premières secondes)
- Partage de pouvoirs cadeaux optionnel

📈 **Système de Progression:**
- **Score Global** - Gagnez des points XP pour chaque victoire (score ÷ 100)
- **Montée de Niveau** - Débloquez de nouveaux éléments en progressant (1-21)
- **Progrès Persistants** - Score et niveau sauvegardés dans le navigateur
- **Récompenses de Victoire** - Seuls les joueurs humains gagnent de l'XP

---

## 🎮 Mode Plateforme - Caractéristiques

🌍 **18 Chapitres Élémentaires:**
Chaque élément a son propre chapitre avec ennemis et boss thématiques

⭐ **Système de Chapitres:**
- **Chapitres Starter** (Niveau 1): Earth, Fire, Wind, Wood - Sélection aléatoire (exclut votre élément)
- Progression à travers 18 chapitres complets
- 68 types d'ennemis avec 8 designs différents
- 52 boss uniques (dont 18 boss finaux)
- Chaque chapitre a 4 ennemis élémentaires uniques

🎨 **Designs Originaux:**
- **Personnages**: 8 créatures organiques (slime, fluffy, fish, dragon, beast, crystal, plant, wavy)
- **Joueurs**: Forme spécifique par élément
- **Ennemis**: 8 designs variés, couleur selon le chapitre, marchent sur les plateformes
- **Boss**: Forme dragon agrandie avec couronne dorée

🌋 **Environnements:**
- Sol continu avec trous élémentaires dangereux
- Types de trous: feu, glace, vent, void, lumière, ombre, foudre, poison
- Effets visuels: particules animées, lueurs pulsantes
- Plateformes à différentes hauteurs
- Arrière-plans dégradés avec particules

🎯 **Système de Combat:**
- Saut ajusté pour atteindre les plateformes (hauteur 550)
- Ennemis marchent sur le sol (gravité 800)
- Quelques ennemis volants (gravité réduite)
- Système de vie pour joueur, ennemis et boss
- Pouvoirs élémentaires adaptés au combat

### Contrôles Mode Plateforme
- **Flèches / WASD** - Déplacement
- **ESPACE / W / Z / Flèche Haut** - Saut
- **SHIFT / CTRL / E** - Pouvoir élémentaire
- **ESC** - Retour au menu

---

## 🎮 Comment Jouer (Mode Collection)

### Contrôles
- **Flèches** ou **WASD** - Déplacez votre mascotte élémentaire
- **ESPACE** - Activez votre pouvoir élémentaire principal
- **1** - Utilisez le premier pouvoir cadeau (cooldown 20s)
- **2** - Utilisez le deuxième pouvoir cadeau (cooldown 20s)
- **3** - Utilisez le troisième pouvoir cadeau (cooldown 20s)
- **ENTRÉE** - Retour au menu en fin de partie
- Approchez-vous des esprits pour les collecter automatiquement

### Règles du Jeu
1. **Choisissez Votre Élément** - Sélectionnez parmi les éléments disponibles
2. **Collectez des Esprits** - Rassemblez un maximum d'esprits en 3 minutes
3. **Utilisez les Pouvoirs** - Chaque élément a des capacités uniques
4. **Collectez les Cadeaux** - Trouvez des orbes rares pour des bonus
5. **Victoire d'Équipe** - Collaborez avec les IA pour battre les autres équipes
6. **Gagnez de l'XP** - Victoire = points d'expérience
7. **Débloquez des Éléments** - Montez de niveau pour de nouveaux éléments!

### Options de Jeu
- **Tir Ami** - Les pouvoirs affectent-ils les alliés?
- **Partage Cadeaux IA** - Les IA peuvent-elles utiliser vos cadeaux? (5% de chance)
- **Choix Terrain** - Sélection du terrain après l'élément
- **Vitesse Joueur** - Ajustez la vitesse de mouvement (100-400)
- **Vitesse Esprits** - Vitesse de suivi des esprits (100-500)

**Note:** Options configurables en jeu ou via `game-options.json`. Voir [GAME-OPTIONS-README.md](./GAME-OPTIONS-README.md).

### Astuces
- Collectez des esprits pour charger votre pouvoir plus vite
- Utilisez les pouvoirs cadeaux stratégiquement
- Les éléments se contrent mutuellement
- Les IA alliées aident à collecter
- Retournez à votre base pour déposer en sécurité
- Surveillez les cadeaux - avantage significatif!

---

---

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Prévisualiser le build de production
npm run preview
```

## 🛠️ Développement

Construit avec:
- **Phaser 3.90.0** - Framework de jeu HTML5
- **Vite 6.0** - Outil de build rapide et serveur de dev
- **JavaScript ES6+** - JavaScript moderne

## 📁 Structure du Projet

```
magnetisme/
├── src/
│   ├── scenes/
│   │   ├── BootScene.js         # Scène de chargement initial
│   │   ├── MenuScene.js         # Menu sélection d'élément
│   │   ├── GameScene.js         # Scène principale (collection)
│   │   ├── PlatformScene.js     # Scène de plateforme
│   │   ├── ChapterSelectScene.js # Sélection de chapitre
│   │   └── LevelSelectScene.js  # Sélection de niveau
│   ├── entities/
│   │   ├── Player.js            # Classe joueur (collection)
│   │   ├── PlayerShapes.js      # 8 designs de créatures
│   │   ├── Spirit.js            # Classe esprit à collectionner
│   │   └── Gift.js              # Classe cadeau/powerup
│   ├── platform/
│   │   ├── PlatformPlayer.js    # Joueur mode plateforme
│   │   ├── Enemy.js             # 68 types d'ennemis
│   │   ├── Boss.js              # 52 boss
│   │   ├── PlatformConfig.js    # Config plateforme
│   │   ├── ChapterConfig.js     # 18 chapitres
│   │   └── EnemyTypes.js        # Types d'ennemis
│   ├── systems/
│   │   ├── PowerSystem.js       # Implémentations des pouvoirs
│   │   ├── PlayerProgress.js    # Système de niveaux
│   │   └── TerrainSystem.js     # Système de terrain
│   ├── ai/
│   │   └── AIController.js      # Logique comportement IA
│   ├── config.js                # Configuration du jeu
│   └── main.js                  # Point d'entrée
├── index.html                   # Point d'entrée HTML
├── vite.config.js               # Configuration Vite
├── package.json                 # Dépendances
├── README.md                    # Ce fichier
├── PLATFORM-README.md           # Documentation mode plateforme
└── GAME-OPTIONS-README.md       # Documentation options
```

## ⚙️ Configuration du Jeu

Personnalisez le jeu dans `src/config.js`:

### Paramètres Principaux
- `MAX_PLAYERS` - Nombre maximum de joueurs (défaut: 8)
- `MAX_TEAMS` - Nombre maximum d'équipes (défaut: 4)
- `SPIRIT_COUNT` - Nombre d'esprits en jeu (défaut: 100)
- `GAME_TIME` - Durée du jeu en secondes (défaut: 180)
- `PLAYER_SPEED` - Vitesse de déplacement (défaut: 200)
- `WORLD_WIDTH` / `WORLD_HEIGHT` - Taille du monde (défaut: 2560x1920)
- `VISIBILITY_RANGE` - Portée brouillard de guerre (défaut: 320px / 4 tuiles)

### Système de Pouvoirs
- `POWER_CHARGE_RATE` - Taux de charge passif (défaut: 0.05)
- `POWER_BONUS_PER_SPIRIT` - Charge gagnée par esprit (défaut: 2)
- `MAX_POWER_CHARGE` - Capacité de charge maximale (défaut: 100)

### Système de Cadeaux
- `MAX_GIFT_POWERS` - Pouvoirs cadeaux max simultanés (défaut: 1, max: 3)
- Cooldown pouvoirs cadeaux: 20 secondes (partagé)
- Timer apparition cadeaux: Intervalles aléatoires

### Options de Gameplay
- `FRIENDLY_FIRE` - Alliés affectés par les pouvoirs (défaut: true)
- `DEBUG_MODE` - **Active tous les éléments, infos niveau suivant, et pouvoirs illimités** (défaut: false)

## 🐛 Mode Debug

Pour activer les fonctionnalités debug, éditez `src/config.js`:

```javascript
export const GAME_CONFIG = {
  // ... autres paramètres ...
  DEBUG_MODE: true  // Activer le mode debug
};
```

Le mode debug active:
- ✅ Voir tous les 17 éléments (y compris verrouillés)
- ✅ Voir les requis du niveau suivant
- ✅ Pouvoirs primaires illimités (pas de charge nécessaire)
- ✅ Pouvoirs cadeaux illimités (pas de cooldown)

## 📊 Détails Système de Progression

### Calcul du Score
- XP de Victoire = (Nombre d'Esprits de l'Équipe) ÷ 100
- Exemple: Gagner avec 150 esprits = 1 point XP

### Seuils de Niveaux
| Niveau | Score Requis | Points au Suivant |
|--------|--------------|-------------------|
| 1      | 0            | 100               |
| 2      | 100          | 150               |
| 3      | 250          | 200               |
| 4      | 450          | 250               |
| 5      | 700          | 300               |
| 6      | 1000         | 350               |
| 7      | 1350         | 400               |
| 8+     | ...          | +50 chaque        |

**Formule**: Chaque niveau nécessite 100 + (niveau - 1) × 50 points
- Niveau 1→2: 100 points
- Niveau 2→3: 150 points
- Niveau 3→4: 200 points
- etc.

### Progression Déblocage Éléments
- **Tier 1** (Niveau 1): Water, Fire, Wind, Earth
- **Tier 2** (Niveau 5-7): Nature, Ice
- **Tier 3** (Niveau 10-13): Lightning, Metal, Wood, Shadow, Light
- **Tier 4** (Niveau 15-17): Poison, Sound, Psychic
- **Tier 5** (Niveau 19-21): Gravity, Time, Space

### Persistance des Données
- Progrès sauvegardé dans `localStorage` du navigateur
- Clé: `magnetisme_progress`
- Données stockées: `globalScore`, `level`, `victories`
- Persiste entre les sessions du navigateur

---

## 🎯 Crédits

Inspiré par le jeu Halloween 2022 Great Ghoul Duel de Google.

Mode plateforme original avec 18 chapitres élémentaires, 68 ennemis et 52 boss.

## 📄 Licence

Licence MIT - Libre d'utilisation et de modification!

---

**Amusez-vous à collecter des esprits et à vaincre des boss! 👻✨🎮**
