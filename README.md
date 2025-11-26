# Elemental Spirits Duel 🎃

A Phaser 3 game inspired by Google's Great Ghoul Duel Halloween game. Compete with up to 8 players (AI-controlled or human) to collect cute neutral spirits using elemental pets!

## Features

✨ **14 Elemental Pet Types:**
- Water 💧
- Fire 🔥
- Wind 💨
- Earth 🌍
- Leaf 🍃
- Ice ❄️
- Glass 🔮
- Sand 🏜️
- Thunder ⚡
- Shadow 🌑
- Wood 🪵
- Light ✨
- Plasma 💥
- Toxic ☢️

🎮 **Gameplay:**
- Up to 8 players compete simultaneously
- AI-controlled bots fill empty player slots
- Collect cute neutral spirits with big eyes
- 2-minute rounds with score tracking
- Real-time leaderboard

🤖 **Smart AI:**
- AI players have unique personalities
- Different aggression levels
- Strategic spirit collection
- Dynamic behavior adaptation

## How to Play

### Controls
- **Arrow Keys** or **WASD** - Move your elemental pet
- Navigate close to spirits to collect them automatically

### Game Rules
1. Select your elemental pet type from the menu
2. Collect as many neutral spirits as possible in 2 minutes
3. AI players will compete against you
4. The player with the most spirits wins!

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
│   │   └── Spirit.js         # Collectible spirit class
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
- `MAX_PLAYERS` - Maximum number of players (default: 8)
- `SPIRIT_COUNT` - Number of spirits to collect (default: 50)
- `GAME_TIME` - Game duration in seconds (default: 120)
- `PLAYER_SPEED` - Movement speed (default: 200)

## Credits

Inspired by Google's Great Ghoul Duel Halloween 2022 game.

## License

MIT License - Feel free to use and modify!

---

**Have fun collecting spirits! 👻✨**
