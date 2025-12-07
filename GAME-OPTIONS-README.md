# Game Options Configuration

## How to Customize Game Options

You can manually edit the `game-options.json` file to customize your game experience.

### File Location
```
magnetisme/game-options.json
```

### Available Options

#### `friendlyFire` (boolean)
- **Default:** `false`
- **Description:** When `true`, friendly fire is enabled (allies are affected by powers)
- **Values:** `true` or `false`

#### `giftPowerSharing` (boolean)
- **Default:** `false`
- **Description:** When `true`, allies can use gift powers
- **Values:** `true` or `false`

#### `canChooseTerrain` (boolean)
- **Default:** `false`
- **Description:** When `true`, shows terrain selection after choosing element
- **Values:** `true` or `false`

#### `playerSpeed` (number)
- **Default:** `200`
- **Description:** Movement speed for all players (both AI and controlled)
- **Range:** `100` to `400`
- **Recommended:** `150` - `250` for balanced gameplay

#### `spiritSpeed` (number)
- **Default:** `250`
- **Description:** Speed at which spirits follow players
- **Range:** `100` to `500`
- **Recommended:** `200` - `350` for good responsiveness

### Example Configuration

```json
{
  "friendlyFire": false,
  "giftPowerSharing": true,
  "canChooseTerrain": true,
  "playerSpeed": 220,
  "ballSpeed": 300
}
```

### How to Apply Changes

#### Method 1: Using the Save Button (Recommended)
1. Configure options in the game menu using checkboxes and sliders
2. Click the **"💾 Save Options"** button at the bottom left
3. A `game-options.json` file will be downloaded
4. Replace the existing `game-options.json` in your game folder with the downloaded file
5. Refresh the game (F5)

#### Method 2: Manual Editing
1. Open `game-options.json` in any text editor
2. Modify the values according to your preferences
3. Save the file
4. Refresh the game in your browser (F5)

### Notes

- The file must be valid JSON (use quotes for strings, no trailing commas)
- Invalid values will fallback to defaults
- Changes take effect on next game start
- You can also modify options in-game (they will be logged in console but file must be edited manually)
