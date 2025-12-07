# Elemental Spirits Duel 🎃

A Phaser 3 game inspired by Google's Great Ghoul Duel Halloween game. Compete with up to 8 players (AI-controlled or human) to collect cute neutral spirits using elemental pets!

## Features

✨ **16 Elemental Pet Types:**
- Water 💧 (Level 1)
- Fire 🔥 (Level 1)
- Wind 💨 (Level 1)
- Earth 🌍 (Level 1)
- Leaf 🍃 (Level 5)
- Ice ❄️ (Level 7)
- Glass 🔮 (Level 10)
- Sand 🏜️ (Level 11)
- Wood 🪵 (Level 12)
- Plasma 💥 (Level 13)
- Toxic ☢️ (Level 13)
- Thunder ⚡ (Level 15)
- Shadow 🌑 (Level 17)
- Light ✨ (Level 17)
- Iron 🔩 (Level 19)
- Gold 🏆 (Level 20)

🎮 **Gameplay:**
- Up to 8 players compete simultaneously
- AI-controlled bots fill empty player slots
- Collect cute neutral spirits with big eyes
- 3-minute rounds with score tracking
- Real-time leaderboard
- Team-based competition with unique elemental bases

🎁 **Gift System:**
- **Element Gifts** (Purple) - Unlock additional elemental powers for your team (max 1 gift power at a time)
- **Time Gifts** (Cyan) - Add 20 seconds to the game timer
- **Magnetism Gifts** (Yellow) - Attract all nearby spirits for 10 seconds
- Gifts spawn randomly throughout the match
- Limited capacity: collecting a new gift power replaces the oldest one (FIFO system)

⚡ **Power System:**
- **Primary Power (SPACE)** - Use your elemental pet's unique ability
  - Charge-based system for human players (fills over time and when collecting spirits)
  - 30-second cooldown for AI players
- **Gift Powers (1/2/3)** - Activate collected gift powers
  - 20-second cooldown shared across all gift powers
  - Display shows countdown or "Ready" status
- **Debug Mode** - Unlimited power usage (configure in `src/config.js`)

### Elemental Powers

Each element has a unique power ability:

- **Water** 💧 - Knockback wave that pushes enemies away (3 tile radius + 0.2/level)
- **Fire** 🔥 - Destroys enemy spirits in range, protects own spirits (2 tile radius + 0.2/level, 3 tile knockback)
- **Wind** 💨 - Creates a spinning tornado zone with visible particle rings (1.5 tile radius + 0.2/level, 10 seconds)
- **Earth** 🌍 - Creates a 3-sided wall barrier with right side open (5 tiles, 10 seconds)
- **Leaf** 🍃 - Heal and speed boost for allies in range
- **Ice** ❄️ - Creates a freeze zone that completely stops movement (1.5 tile radius, 5 seconds, auto-removes)
- **Glass** 🔮 - Creates an AI clone that collects spirits for 20 seconds
- **Sand** 🏜️ - Slows enemies to 30% speed in visible zone (2 tile radius, persistent)
- **Wood** 🪵 - Summon wood barriers for defense
- **Plasma** 💥 - Energy blast without scattering spirits (12s base + 0.2s/level duration)
- **Toxic** ☢️ - Poison enemies with 12 second damage over time
- **Thunder** ⚡ - Teleport enemies to your base and steal their spirits (10 second zone)
- **Shadow** 🌑 - Creates black hole zone (2 tiles) with magnetism (6 tiles) - attracts all spirits like Iron when Shadow is inside, makes enemies disappear for 5 seconds, visible white outline for Shadow in black zone
- **Light** ✨ - Teleports to base with +10 bonus, deposits spirits, creates repel/heal zone (3 tiles), smooth camera transition
- **Iron** 🔩 - Magnetism that attracts all spirits in 5-tile radius for 2 seconds
- **Gold** 🏆 - Convert enemies to your team for 15 seconds in a 4-tile radius

🤖 **Smart AI:**
- AI players have unique personalities
- Different aggression levels (30%-80%)
- Strategic spirit collection (prioritizes close spirits <300 units)
- 30-second power cooldown (no power usage in first 30 seconds)
- Optional gift power sharing (can use team's collected gift powers)

📈 **Progression System:**
- **Global Score** - Earn XP points for each victory (game score ÷ 100)
- **Level Up** - Unlock new elemental pets as you level up:
  - Level 1: 0-249 points (+250 to level 2)
  - Level 2: 250-749 points (+500 to level 3)
  - Level 3: 750-1749 points (+1000 to level 4)
  - Level 4: 1750-2999 points (+1250 to level 5)
  - Each subsequent level requires +250 more points
- **Persistent Progress** - Score and level saved in browser localStorage
- **Element Unlocking** - New elements unlock at specific levels (see list above)
- **Victory Rewards** - Only human players earn XP when their team wins

## How to Play

### Controls
- **Arrow Keys** or **WASD** - Move your elemental pet
- **SPACE** - Activate your primary elemental power (charge-based)
- **1** - Use first gift power (20-second cooldown)
- **2** - Use second gift power (20-second cooldown)
- **3** - Use third gift power (20-second cooldown)
- **ENTER** - Return to menu when game ends
- Navigate close to spirits to collect them automatically

### Game Rules
1. **Select Your Element** - Choose from available elemental pets (unlock more by leveling up!)
2. **Collect Spirits** - Gather as many neutral spirits as possible in 3 minutes
3. **Use Powers Strategically** - Each element has unique abilities to help or hinder
4. **Collect Gifts** - Find rare gift orbs for bonus powers, time, or magnetism
5. **Team Victory** - Work with AI teammates to outscore other teams
6. **Earn XP** - Win to earn experience points and level up
7. **Unlock Elements** - Reach higher levels to unlock powerful new elemental pets!

### Gameplay Options
- **Friendly Fire** - Toggle whether ally players are affected by powers
- **Gift Power Sharing** - Allow AI teammates to use collected gift powers (5% chance per decision)
- **Choose Terrain** - Enable terrain selection after choosing your element
- **Player Speed** - Adjust movement speed for all players (100-400)
- **Spirit Speed** - Adjust how fast spirits follow players (100-500)

**Note:** Options can be configured in-game or by editing `game-options.json` file. See [GAME-OPTIONS-README.md](./GAME-OPTIONS-README.md) for details.

### Tips
- Collect spirits to charge your primary power faster
- Use gift powers strategically during team fights
- Different elements counter each other - choose wisely!
- AI teammates will help collect spirits and use powers
- Return to your team's base to safely deposit spirits
- Watch for gift orbs - they provide significant advantages!

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development

Built with:
- **Phaser 3.87.0** - HTML5 game framework
- **Vite 6.0** - Fast build tool and dev server
- **JavaScript ES6+** - Modern JavaScript

## Project Structure

```
magnetisme/
├── src/
│   ├── scenes/
│   │   ├── BootScene.js      # Initial loading scene
│   │   ├── MenuScene.js      # Element selection menu
│   │   └── GameScene.js      # Main game scene
│   ├── entities/
│   │   ├── Player.js         # Player character class
│   │   ├── PlayerShapes.js   # Visual designs for players
│   │   ├── Spirit.js         # Collectible spirit class
│   │   └── Gift.js           # Gift/powerup class
│   ├── systems/
│   │   ├── PowerSystem.js    # Elemental power implementations
│   │   └── PlayerProgress.js # Level and progression system
│   ├── ai/
│   │   └── AIController.js   # AI behavior logic
│   ├── config.js             # Game configuration
│   └── main.js               # Game entry point
├── index.html                # HTML entry point
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies
```

## Game Configuration

Customize the game in `src/config.js`:

### Core Settings
- `MAX_PLAYERS` - Maximum number of players (default: 8)
- `MAX_TEAMS` - Maximum number of teams (default: 4)
- `SPIRIT_COUNT` - Number of spirits in play (default: 100)
- `GAME_TIME` - Game duration in seconds (default: 180)
- `PLAYER_SPEED` - Movement speed (default: 200)
- `WORLD_WIDTH` / `WORLD_HEIGHT` - Game world size (default: 2560x1920)
- `VISIBILITY_RANGE` - Fog of war range (default: 320px / 4 tiles)

### Power System
- `POWER_CHARGE_RATE` - Passive charge rate (default: 0.05)
- `POWER_BONUS_PER_SPIRIT` - Charge gained per spirit collected (default: 2)
- `MAX_POWER_CHARGE` - Maximum charge capacity (default: 100)

### Gift System
- `MAX_GIFT_POWERS` - Maximum gift powers held simultaneously (default: 1, max: 3)
- Gift power cooldown: 20 seconds (shared)
- Gift spawn timer: Random intervals

### Gameplay Options
- `FRIENDLY_FIRE` - Allies affected by powers (default: true)
- `DEBUG_MODE` - **Enable to show all elements, next level info, and unlimited powers** (default: false)

### Element Configuration
Each element in `ELEMENTS` has:
- `name` - Display name
- `color` - Team color (hex)
- `key` - Internal identifier
- `requiredLevel` - Level needed to unlock (1-20)

## Debug Mode

To enable debug features, edit `src/config.js`:

```javascript
export const GAME_CONFIG = {
  // ... other settings ...
  DEBUG_MODE: true  // Enable debug mode
};
```

Debug mode enables:
- ✅ View all 16 elements (including locked ones)
- ✅ See next level requirements
- ✅ Unlimited primary power usage (no charge needed)
- ✅ Unlimited gift power usage (no cooldown)

## Progression System Details

### Score Calculation
- Victory XP = (Team's Final Spirit Count) ÷ 100
- Example: Winning with 150 spirits = 1 XP point

### Level Thresholds
| Level | Score Required | Points to Next |
|-------|---------------|----------------|
| 1     | 0             | 250            |
| 2     | 250           | 500            |
| 3     | 750           | 1000           |
| 4     | 1750          | 1250           |
| 5     | 3000          | 1500           |
| 6+    | ...           | +250 each      |

### Element Unlock Progression
- **Tier 1** (Level 1): Water, Fire, Wind, Earth
- **Tier 2** (Level 5-7): Leaf, Ice
- **Tier 3** (Level 10-13): Glass, Sand, Wood, Plasma, Toxic
- **Tier 4** (Level 15-17): Thunder, Shadow, Light
- **Tier 5** (Level 19-20): Iron, Gold

### Data Persistence
- Progress saved to browser `localStorage`
- Key: `magnetisme_progress`
- Stored data: `globalScore`, `level`, `victories`
- Persists across browser sessions

## Credits

Inspired by Google's Great Ghoul Duel Halloween 2022 game.

## License

MIT License - Feel free to use and modify!

---

**Have fun collecting spirits! 👻✨**
