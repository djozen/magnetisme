import { ELEMENTS, GAME_CONFIG } from '../config.js';

// Terrain configurations with interactive elements
export const TERRAINS = {
  water: {
    key: 'water',
    name: 'Aquatic Realm',
    requiredLevel: 8,
    useNaturalBase: false,
    description: 'Underwater kingdom with storms'
  },
  waterLight: {
    key: 'waterLight',
    name: 'Rainy Plains',
    requiredLevel: 1,
    useNaturalBase: true,
    description: 'Windy plains with heavy rain'
  },
  fire: {
    key: 'fire',
    name: 'Volcanic Wasteland',
    requiredLevel: 1,
    useNaturalBase: false,
    description: 'Active volcanoes and lava flows'
  },
  wind: {
    key: 'wind',
    name: 'Storm Plains',
    requiredLevel: 1,
    useNaturalBase: true,
    description: 'Massive tornadoes with varying sizes, light rain, Wind moves 50% faster'
  },
  earth: {
    key: 'earth',
    name: 'Rocky Mountains',
    requiredLevel: 1,
    useNaturalBase: false,
    description: 'Dry mountainous terrain'
  },
  leaf: {
    key: 'leaf',
    name: 'Grassy Plains',
    requiredLevel: 5,
    useNaturalBase: true,
    description: 'Open grassland with flowers'
  },
  ice: {
    key: 'ice',
    name: 'Frozen Tundra',
    requiredLevel: 7,
    useNaturalBase: false,
    description: 'Snowy mountains with blizzards'
  },
  glass: {
    key: 'glass',
    name: 'Mirror Castle',
    requiredLevel: 10,
    useNaturalBase: false,
    description: 'Reflective maze of mirrors'
  },
  sand: {
    key: 'sand',
    name: 'Desert Dunes',
    requiredLevel: 11,
    useNaturalBase: false,
    description: 'Quicksand and sandstorms'
  },
  wood: {
    key: 'wood',
    name: 'Ancient Forest',
    requiredLevel: 12,
    useNaturalBase: true,
    description: 'Dense woodland with many trees'
  },
  plasma: {
    key: 'plasma',
    name: 'Power Plant',
    requiredLevel: 13,
    useNaturalBase: false,
    description: 'Industrial facility with plasma'
  },
  toxic: {
    key: 'toxic',
    name: 'Chemical Factory',
    requiredLevel: 13,
    useNaturalBase: false,
    description: 'Toxic waste facility'
  },
  thunder: {
    key: 'thunder',
    name: 'Electric Plant',
    requiredLevel: 15,
    useNaturalBase: false,
    description: 'High voltage facility'
  },
  shadow: {
    key: 'shadow',
    name: 'Void Wasteland',
    requiredLevel: 17,
    useNaturalBase: false,
    description: 'Dark realm with black holes'
  },
  light: {
    key: 'light',
    name: 'Ancient Temple',
    requiredLevel: 17,
    useNaturalBase: false,
    description: 'Ruined marble sanctuary'
  },
  iron: {
    key: 'iron',
    name: 'Steel Mill',
    requiredLevel: 19,
    useNaturalBase: false,
    description: 'Industrial complex'
  },
  gold: {
    key: 'gold',
    name: 'Treasure Vault',
    requiredLevel: 20,
    useNaturalBase: false,
    description: 'Golden treasure chamber'
  }
};

export class TerrainSystem {
  constructor(scene) {
    this.scene = scene;
    this.currentTerrain = null;
    this.hazards = []; // Interactive terrain hazards
    this.effects = []; // Visual effects
    this.decorations = []; // Decorative elements
    this.mirrors = []; // Glass terrain mirrors
    this.playerReflections = []; // Player reflections on floor
    this.mirrorReflections = []; // Player reflections in mirrors
  }

  // Determine terrain based on game rules
  selectTerrain(playerElement, players, selectedTerrain = null) {
    // Manual selection
    if (selectedTerrain) {
      // En mode DEBUG, toujours retourner le terrain sélectionné sans vérifier le niveau
      if (this.scene.debugMode) {
        return TERRAINS[selectedTerrain.key];
      }
      
      // Si c'est water, vérifier le niveau du joueur
      if (selectedTerrain.key === 'water') {
        const humanPlayer = players.find(p => !p.isAI);
        const playerLevel = humanPlayer ? humanPlayer.level : 1;
        return playerLevel >= 8 ? TERRAINS.water : TERRAINS.waterLight;
      }
      return TERRAINS[selectedTerrain.key];
    }

    // Find first enemy AI player
    const humanPlayer = players.find(p => !p.isAI);
    const humanTeam = humanPlayer ? humanPlayer.teamId : 0;
    const enemyAI = players.find(p => p.isAI && p.teamId !== humanTeam);

    if (enemyAI && enemyAI.element) {
      // Si l'ennemi est water, vérifier le niveau (sauf en DEBUG)
      if (enemyAI.element.key === 'water' && !this.scene.debugMode) {
        const playerLevel = humanPlayer ? humanPlayer.level : 1;
        return playerLevel >= 8 ? TERRAINS.water : TERRAINS.waterLight;
      }
      return TERRAINS[enemyAI.element.key];
    } else if (playerElement) {
      // Si le joueur est water, vérifier le niveau (sauf en DEBUG)
      if (playerElement.key === 'water' && !this.scene.debugMode) {
        const playerLevel = humanPlayer ? humanPlayer.level : 1;
        return playerLevel >= 8 ? TERRAINS.water : TERRAINS.waterLight;
      }
      return TERRAINS[playerElement.key];
    }

    return TERRAINS.water;
  }

  // Create complete terrain
  createTerrain(terrain, width, height, basePositions = []) {
    this.currentTerrain = terrain.key; // Store terrain key for updates
    // Store base positions to check when creating obstacles
    this.basePositions = basePositions;
    this.clearTerrain();

    // Create base environment (skip for water terrain - fully custom)
    if (terrain.key !== 'water') {
      if (terrain.useNaturalBase) {
        this.createNaturalBase(width, height);
      } else {
        this.createThemedBackground(terrain, width, height);
      }
    }

    // Create terrain-specific elements
    switch (terrain.key) {
      case 'water':
        this.createWaterTerrain(width, height);
        break;
      case 'waterLight':
        this.createWaterLightTerrain(width, height);
        break;
      case 'fire':
        this.createFireTerrain(width, height);
        break;
      case 'wind':
        this.createStormTerrain(width, height);
        break;
      case 'earth':
        this.createEarthTerrain(width, height);
        break;
      case 'leaf':
        this.createLeafTerrain(width, height);
        break;
      case 'ice':
        this.createIceTerrain(width, height);
        break;
      case 'glass':
        this.createGlassTerrain(width, height);
        break;
      case 'sand':
        this.createSandTerrain(width, height);
        break;
      case 'wood':
        this.createWoodTerrain(width, height);
        break;
      case 'plasma':
        this.createPlasmaTerrain(width, height);
        break;
      case 'toxic':
        this.createToxicTerrain(width, height);
        break;
      case 'thunder':
        this.createThunderTerrain(width, height);
        break;
      case 'shadow':
        this.createShadowTerrain(width, height);
        break;
      case 'light':
        this.createLightTerrain(width, height);
        break;
      case 'iron':
        this.createIronTerrain(width, height);
        break;
      case 'gold':
        this.createGoldTerrain(width, height);
        break;
    }
  }

  clearTerrain() {
    // Clean up hazards
    this.hazards.forEach(h => {
      if (h.sprite) h.sprite.destroy();
      if (h.graphics) h.graphics.destroy();
      if (h.timer) h.timer.remove();
    });
    this.hazards = [];

    // Clean up effects
    this.effects.forEach(e => {
      if (e.destroy) e.destroy();
    });
    this.effects = [];
  }
  
  // Helper method to check if position is near any base
  // Minimum 2 tuiles (160px) pour tous les obstacles
  isNearBase(x, y, minDistance = 80) {
    if (!this.basePositions || this.basePositions.length === 0) {
      return false;
    }
    
    // Forcer un minimum de 1 tuile (80px)
    const actualMinDistance = Math.max(minDistance, 80);
    
    return this.basePositions.some(base => {
      const dist = Phaser.Math.Distance.Between(x, y, base.x, base.y);
      return dist < (base.radius || actualMinDistance);
    });
  }
  
  // Helper method to create void obstacles (2 rectangles on sides of bridge)
  createVoidSideObstacles(voidX, voidY, voidRadius, bridgeAngle) {
    const cos = Math.cos(bridgeAngle);
    const sin = Math.sin(bridgeAngle);
    const offset = voidRadius * 0.7;
    
    // Obstacle côté gauche du pont (perpendiculaire au pont)
    const sideObstacle1 = this.scene.add.rectangle(
      voidX + offset * (-sin),
      voidY + offset * cos,
      voidRadius * 1.4,
      voidRadius * 1.2,
      0x000000,
      0
    );
    sideObstacle1.setRotation(bridgeAngle);
    this.addObstacle(sideObstacle1);
    
    // Obstacle côté droit du pont
    const sideObstacle2 = this.scene.add.rectangle(
      voidX - offset * (-sin),
      voidY - offset * cos,
      voidRadius * 1.4,
      voidRadius * 1.2,
      0x000000,
      0
    );
    sideObstacle2.setRotation(bridgeAngle);
    this.addObstacle(sideObstacle2);
  }
  
  // Helper method to create bridges with hazard zones around (generic for all terrains)
  createBridgeWithHazardZone(terrainType, voidX, voidY, voidRadius, bridgeAngle, voidColor = 0x000000) {
    const bridgeLength = voidRadius * 3.0;
    const bridgeWidth = 50;
    
    // Créer les obstacles de chaque côté du pont
    this.createVoidSideObstacles(voidX, voidY, voidRadius, bridgeAngle);
    
    const cos = Math.cos(bridgeAngle);
    const sin = Math.sin(bridgeAngle);
    const halfLength = bridgeLength / 2;
    const halfWidth = bridgeWidth / 2;
    
    const bridge = this.scene.add.graphics();
    
    // Calculer les 4 coins du pont tourné
    const corners = [
      { x: -halfLength * cos - (-halfWidth) * sin, y: -halfLength * sin + (-halfWidth) * cos },
      { x: halfLength * cos - (-halfWidth) * sin, y: halfLength * sin + (-halfWidth) * cos },
      { x: halfLength * cos - halfWidth * sin, y: halfLength * sin + halfWidth * cos },
      { x: -halfLength * cos - halfWidth * sin, y: -halfLength * sin + halfWidth * cos }
    ];
    
    // Design du pont selon le terrain
    switch(terrainType) {
      case 'wood':
      case 'leaf':
      case 'earth':
        // Pont en bois
        bridge.fillStyle(0x8b4513, 1);
        bridge.beginPath();
        bridge.moveTo(voidX + corners[0].x, voidY + corners[0].y);
        for (let c = 1; c < corners.length; c++) {
          bridge.lineTo(voidX + corners[c].x, voidY + corners[c].y);
        }
        bridge.closePath();
        bridge.fillPath();
        
        // Planches
        bridge.fillStyle(0x654321, 1);
        for (let i = -halfLength; i < halfLength; i += 15) {
          const plankX1 = voidX + i * cos - halfWidth * sin;
          const plankY1 = voidY + i * sin + halfWidth * cos;
          const plankX2 = voidX + i * cos + halfWidth * sin;
          const plankY2 = voidY + i * sin - halfWidth * cos;
          bridge.lineStyle(3, 0x654321);
          bridge.lineBetween(plankX1, plankY1, plankX2, plankY2);
        }
        break;
        
      case 'ice':
        // Pont gelé transparent
        bridge.fillStyle(0xb0e0e6, 0.8);
        bridge.beginPath();
        bridge.moveTo(voidX + corners[0].x, voidY + corners[0].y);
        for (let c = 1; c < corners.length; c++) {
          bridge.lineTo(voidX + corners[c].x, voidY + corners[c].y);
        }
        bridge.closePath();
        bridge.fillPath();
        
        // Reflets glacés
        bridge.fillStyle(0xffffff, 0.5);
        const innerCorners = corners.map(c => ({
          x: c.x * 0.9,
          y: c.y * 0.9
        }));
        bridge.beginPath();
        bridge.moveTo(voidX + innerCorners[0].x, voidY + innerCorners[0].y);
        for (let c = 1; c < innerCorners.length; c++) {
          bridge.lineTo(voidX + innerCorners[c].x, voidY + innerCorners[c].y);
        }
        bridge.closePath();
        bridge.fillPath();
        break;
        
      case 'fire':
      case 'iron':
      case 'shadow':
      case 'plasma':
      case 'toxic':
      case 'thunder':
        // Pont métallique
        bridge.fillStyle(0x708090, 1);
        bridge.beginPath();
        bridge.moveTo(voidX + corners[0].x, voidY + corners[0].y);
        for (let c = 1; c < corners.length; c++) {
          bridge.lineTo(voidX + corners[c].x, voidY + corners[c].y);
        }
        bridge.closePath();
        bridge.fillPath();
        
        // Rivets
        bridge.fillStyle(0x404040, 1);
        for (let r = -halfLength; r < halfLength; r += 30) {
          const rivetX1 = voidX + r * cos - halfWidth * 0.8 * sin;
          const rivetY1 = voidY + r * sin + halfWidth * 0.8 * cos;
          const rivetX2 = voidX + r * cos + halfWidth * 0.8 * sin;
          const rivetY2 = voidY + r * sin - halfWidth * 0.8 * cos;
          
          bridge.fillCircle(rivetX1, rivetY1, 3);
          bridge.fillCircle(rivetX2, rivetY2, 3);
        }
        break;
        
      case 'glass':
        // Pont en verre
        bridge.fillStyle(0xf0f8ff, 0.6);
        bridge.beginPath();
        bridge.moveTo(voidX + corners[0].x, voidY + corners[0].y);
        for (let c = 1; c < corners.length; c++) {
          bridge.lineTo(voidX + corners[c].x, voidY + corners[c].y);
        }
        bridge.closePath();
        bridge.fillPath();
        
        bridge.lineStyle(2, 0xe0ffff);
        bridge.strokePath();
        break;
        
      case 'water':
      case 'waterLight':
        // Pont en bois rustique
        bridge.fillStyle(0x8b4513, 1);
        bridge.beginPath();
        bridge.moveTo(voidX + corners[0].x, voidY + corners[0].y);
        for (let c = 1; c < corners.length; c++) {
          bridge.lineTo(voidX + corners[c].x, voidY + corners[c].y);
        }
        bridge.closePath();
        bridge.fillPath();
        
        // Planches
        bridge.fillStyle(0x654321, 1);
        for (let i = -halfLength; i < halfLength; i += 20) {
          const plankX1 = voidX + i * cos - halfWidth * sin;
          const plankY1 = voidY + i * sin + halfWidth * cos;
          const plankX2 = voidX + i * cos + halfWidth * sin;
          const plankY2 = voidY + i * sin - halfWidth * cos;
          bridge.lineStyle(4, 0x654321);
          bridge.lineBetween(plankX1, plankY1, plankX2, plankY2);
        }
        break;
        
      case 'wind':
        // Pont suspendu léger
        bridge.fillStyle(0xd3d3d3, 0.9);
        bridge.beginPath();
        bridge.moveTo(voidX + corners[0].x, voidY + corners[0].y);
        for (let c = 1; c < corners.length; c++) {
          bridge.lineTo(voidX + corners[c].x, voidY + corners[c].y);
        }
        bridge.closePath();
        bridge.fillPath();
        
        // Câbles
        bridge.lineStyle(2, 0xa9a9a9);
        bridge.lineBetween(
          voidX + corners[0].x, voidY + corners[0].y,
          voidX + corners[1].x, voidY + corners[1].y
        );
        bridge.lineBetween(
          voidX + corners[2].x, voidY + corners[2].y,
          voidX + corners[3].x, voidY + corners[3].y
        );
        break;
        
      case 'light':
        // Pont lumineux
        bridge.fillStyle(0xfffacd, 1);
        bridge.beginPath();
        bridge.moveTo(voidX + corners[0].x, voidY + corners[0].y);
        for (let c = 1; c < corners.length; c++) {
          bridge.lineTo(voidX + corners[c].x, voidY + corners[c].y);
        }
        bridge.closePath();
        bridge.fillPath();
        
        // Bordure lumineuse
        bridge.lineStyle(3, 0xffffe0);
        bridge.strokePath();
        break;
        
      default:
        // Pont par défaut
        bridge.fillStyle(0x808080, 1);
        bridge.beginPath();
        bridge.moveTo(voidX + corners[0].x, voidY + corners[0].y);
        for (let c = 1; c < corners.length; c++) {
          bridge.lineTo(voidX + corners[c].x, voidY + corners[c].y);
        }
        bridge.closePath();
        bridge.fillPath();
        break;
    }
    
    bridge.setDepth(3);
    this.effects.push(bridge);
  }
  
  // Helper method to safely add obstacles
  addObstacle(obstacle) {
    if (this.scene.obstacles && this.scene.obstacles.add) {
      this.scene.physics.add.existing(obstacle, true);
      this.scene.obstacles.add(obstacle);
    }
  }

  createNaturalBase(width, height) {
    // Sky
    const sky = this.scene.add.graphics();
    sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98D8C8, 0x98D8C8, 1);
    sky.fillRect(0, 0, width, height);
    sky.setDepth(0);
    this.effects.push(sky);

    // Grass
    const grass = this.scene.add.graphics();
    grass.fillStyle(0x6b9d47, 1);
    grass.fillRect(0, 0, width, height);
    grass.setDepth(0);
    this.effects.push(grass);

    // Grass blades
    for (let i = 0; i < 300; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const blade = this.scene.add.graphics();
      blade.lineStyle(1, 0x5d8a3a, 0.3);
      blade.lineBetween(x, y, x + Phaser.Math.Between(-2, 2), y - Phaser.Math.Between(3, 8));
      blade.setDepth(1);
      this.effects.push(blade);
    }
  }

  createThemedBackground(terrain, width, height) {
    const colors = this.getTerrainColors(terrain.key);
    
    const bg = this.scene.add.graphics();
    bg.fillGradientStyle(colors.sky, colors.sky, colors.ground, colors.ground, 1);
    bg.fillRect(0, 0, width, height);
    bg.setDepth(0);
    this.effects.push(bg);
  }

  getTerrainColors(key) {
    const colorMap = {
      fire: { sky: 0x331100, ground: 0x8b0000 },
      earth: { sky: 0x8b7355, ground: 0x654321 },
      ice: { sky: 0x87ceeb, ground: 0xf0f8ff },
      glass: { sky: 0xe6f3ff, ground: 0xffffff },
      sand: { sky: 0xffd700, ground: 0xf4a460 },
      plasma: { sky: 0x2f2f2f, ground: 0x1a1a1a },
      toxic: { sky: 0x556b2f, ground: 0x2f4f2f },
      thunder: { sky: 0x2f2f2f, ground: 0x1a1a1a },
      shadow: { sky: 0x000000, ground: 0x1c1c1c },
      light: { sky: 0xfffacd, ground: 0xf5f5dc },
      iron: { sky: 0x2f2f2f, ground: 0x696969 },
      gold: { sky: 0xb8860b, ground: 0xdaa520 }
    };
    return colorMap[key] || { sky: 0x87CEEB, ground: 0x6b9d47 };
  }

  // WATER TERRAIN - Underwater with storms (Level 8+)
  createWaterTerrain(width, height) {
    console.log('Creating Aquatic Realm terrain!');
    
    // 1. Sol de sable
    const sand = this.scene.add.graphics();
    sand.fillStyle(0xc2b280, 1);
    sand.fillRect(0, 0, width, height);
    sand.setDepth(1);
    this.effects.push(sand);

    // 2. Voile bleu transparent (effet sous-marin)
    const blueVeil = this.scene.add.graphics();
    blueVeil.fillStyle(0x1e90ff, 0.15);
    blueVeil.fillRect(0, 0, width, height);
    blueVeil.setDepth(2);
    this.effects.push(blueVeil);

    // 3. Vagues animées (effet visuel)
    const waveCount = 6;
    for (let w = 0; w < waveCount; w++) {
      const wave = this.scene.add.graphics();
      const y = 60 + w * 100;
      wave.lineStyle(10, 0x87cefa, 0.18 + 0.08 * Math.random());
      wave.beginPath();
      for (let x = 0; x < width; x += 30) {
        const waveY = y + Math.sin((x + w * 60) / 60) * 12;
        wave.lineTo(x, waveY);
      }
      wave.strokePath();
      wave.setDepth(2);
      this.effects.push(wave);
      // Animation oscillation
      this.scene.tweens.add({
        targets: wave,
        alpha: { from: 0.18, to: 0.32 },
        x: "+=16",
        duration: 2200 + Math.random() * 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        onUpdate: () => {
          wave.clear();
          wave.lineStyle(10, 0x87cefa, wave.alpha);
          wave.beginPath();
          for (let x = 0; x < width; x += 30) {
            const waveY = y + Math.sin((x + w * 60 + wave.x) / 60) * 12;
            wave.lineTo(x, waveY);
          }
          wave.strokePath();
        }
      });
    }

    // 4. Amas d'algues décoratives - Beaucoup plus nombreuses avec certains très grands
    for (let i = 0; i < 40; i++) { // Augmenté à 40 amas
      const clusterX = Phaser.Math.Between(80, width - 80);
      const clusterY = Phaser.Math.Between(80, height - 80);
      // 20% de chance d'avoir un GROS amas (50-60 algues), sinon petit amas (3-5)
      const isLargeCluster = Math.random() < 0.2;
      const algaeInCluster = isLargeCluster ? Phaser.Math.Between(50, 60) : Phaser.Math.Between(3, 5);
      const spreadRadius = isLargeCluster ? 120 : 40; // Plus étalé pour les gros amas
      
      for (let j = 0; j < algaeInCluster; j++) {
        const algaeX = clusterX + Phaser.Math.Between(-spreadRadius, spreadRadius);
        const algaeY = clusterY + Phaser.Math.Between(-spreadRadius, spreadRadius);
        const algaeHeight = Phaser.Math.Between(40, 80);
        
        const algae = this.scene.add.graphics();
        algae.fillStyle(0x2e8b57, 0.5);
        algae.fillEllipse(algaeX, algaeY, 18, 10);
        
        // Tiges ondulées
        for (let s = 0; s < 3; s++) {
          const offsetX = s * 6 - 6;
          algae.beginPath();
          algae.moveTo(algaeX + offsetX, algaeY);
          for (let h = 0; h < algaeHeight; h += 8) {
            const waveX = algaeX + offsetX + Math.sin(h / 8) * 4;
            algae.lineTo(waveX, algaeY - h);
          }
          algae.lineStyle(3, 0x228b22, 0.5);
          algae.strokePath();
        }
        algae.setDepth(10);  // Depth supérieur aux spirits (9) pour les cacher
        this.effects.push(algae);
      }
    }

    // 6. Obstacles : pierres (style sand + algues), trésors (style gold), épaves (design complexe)
    const obstacleTypes = ['rock', 'treasure', 'wreck'];
    for (let i = 0; i < 10; i++) {
      const type = obstacleTypes[Phaser.Math.Between(0, obstacleTypes.length - 1)];
      const x = Phaser.Math.Between(80, width - 80);
      const y = Phaser.Math.Between(80, height - 80);
      if (this.isNearBase(x, y, 300)) continue;
      let obs;
      
      if (type === 'rock') {
        // Rocher style terrain sand avec forme irrégulière
        const rockSize = Phaser.Math.Between(35, 60);
        const rock = this.scene.add.graphics();
        rock.fillStyle(0x708090, 1); // Gris pierre
        
        // Forme irrégulière (polygone)
        rock.beginPath();
        rock.moveTo(x, y - rockSize * 0.8);
        rock.lineTo(x + rockSize * 0.6, y - rockSize * 0.4);
        rock.lineTo(x + rockSize * 0.7, y + rockSize * 0.3);
        rock.lineTo(x + rockSize * 0.2, y + rockSize * 0.5);
        rock.lineTo(x - rockSize * 0.5, y + rockSize * 0.4);
        rock.lineTo(x - rockSize * 0.6, y - rockSize * 0.2);
        rock.closePath();
        rock.fillPath();
        
        // Ombrage
        rock.fillStyle(0x556b7f, 0.5);
        rock.fillCircle(x + rockSize * 0.2, y + rockSize * 0.1, rockSize * 0.3);
        
        // Highlight
        rock.fillStyle(0x8a9aa8, 0.4);
        rock.fillCircle(x - rockSize * 0.2, y - rockSize * 0.3, rockSize * 0.25);
        
        rock.setDepth(6);
        this.effects.push(rock);
        
        // Algues sur la pierre (2-3 petites algues)
        const algaeCount = Phaser.Math.Between(2, 3);
        for (let a = 0; a < algaeCount; a++) {
          const algae = this.scene.add.graphics();
          algae.fillStyle(0x2e8b57, 0.6);
          const algaeX = x + Phaser.Math.Between(-15, 15);
          const algaeY = y - rockSize * 0.3;
          algae.fillEllipse(algaeX, algaeY, 12, 6);
          
          // Tige courte
          algae.beginPath();
          algae.moveTo(algaeX, algaeY);
          for (let h = 0; h < 20; h += 5) {
            const waveX = algaeX + Math.sin(h / 5) * 3;
            algae.lineTo(waveX, algaeY - h);
          }
          algae.lineStyle(2, 0x228b22, 0.5);
          algae.strokePath();
          algae.setDepth(7);
          this.effects.push(algae);
        }
        
        // Obstacle physique (pierre)
        obs = this.scene.add.circle(x, y, rockSize * 0.5, 0x000000, 0);
        this.scene.physics.add.existing(obs, true);
        this.scene.obstacles.add(obs);
        this.effects.push(obs);
        
      } else if (type === 'treasure') {
        // Trésor style terrain gold (coffre avec pièces)
        const chest = this.scene.add.graphics();
        // Coffre en bois
        chest.fillStyle(0x8b4513, 1);
        chest.fillRoundedRect(x - 25, y - 15, 50, 35, 3);
        // Couvercle doré (courbé)
        chest.fillStyle(0xdaa520, 1);
        chest.fillEllipse(x, y - 20, 25, 15);
        chest.fillRect(x - 25, y - 20, 50, 5);
        // Bordure dorée
        chest.lineStyle(2, 0xffd700);
        chest.strokeRoundedRect(x - 25, y - 15, 50, 35, 3);
        // Pièces qui débordent
        chest.fillStyle(0xffd700, 1);
        for (let c = 0; c < 8; c++) {
          const coinX = x + Phaser.Math.Between(-30, 30);
          const coinY = y + Phaser.Math.Between(-25, 25);
          chest.fillCircle(coinX, coinY, 4);
          chest.fillStyle(0xffed4e, 1);
          chest.fillCircle(coinX, coinY, 2.5);
          chest.fillStyle(0xffd700, 1);
        }
        chest.setDepth(6);
        this.effects.push(chest);
        
        // Obstacle physique (trésor)
        obs = this.scene.add.rectangle(x, y, 50, 35, 0x000000, 0);
        this.scene.physics.add.existing(obs, true);
        this.scene.obstacles.add(obs);
        this.effects.push(obs);
        
      } else if (type === 'wreck') {
        // Épave de bateau BEAUCOUP plus grande et complexe
        const wreck = this.scene.add.graphics();
        const angle = Phaser.Math.Between(-30, 30);
        const scale = Phaser.Math.FloatBetween(2.0, 3.0); // BEAUCOUP plus grande (était 1.2-1.8)
        
        // Coque principale inférieure (plus sombre)
        wreck.fillStyle(0x6d4c29, 1);
        wreck.fillRoundedRect(x - 60 * scale, y + 5 * scale, 120 * scale, 25 * scale, 5);
        
        // Coque principale supérieure
        wreck.fillStyle(0x8b5a2b, 1);
        wreck.fillRoundedRect(x - 55 * scale, y - 15 * scale, 110 * scale, 35 * scale, 5);
        
        // Pont supérieur
        wreck.fillStyle(0xa0522d, 1);
        wreck.fillRect(x - 48 * scale, y - 8 * scale, 96 * scale, 8 * scale);
        
        // Cabine principale (rectangulaire)
        wreck.fillStyle(0x8b5a2b, 1);
        wreck.fillRoundedRect(x - 20 * scale, y - 25 * scale, 40 * scale, 18 * scale, 3);
        
        // Cabine arrière (plus petite)
        wreck.fillRoundedRect(x - 40 * scale, y - 22 * scale, 18 * scale, 15 * scale, 3);
        
        // Grand mât cassé principal
        wreck.fillStyle(0xdeb887, 1);
        wreck.fillRect(x + 25 * scale, y - 70 * scale, 10 * scale, 55 * scale);
        
        // Deuxième mât (plus petit, oblique)
        wreck.fillRect(x - 15 * scale, y - 50 * scale, 8 * scale, 35 * scale);
        
        // Grande voile déchirée (principale)
        wreck.fillStyle(0xf5f5dc, 0.6);
        wreck.beginPath();
        wreck.moveTo(x + 25 * scale, y - 65 * scale);
        wreck.lineTo(x + 60 * scale, y - 55 * scale);
        wreck.lineTo(x + 50 * scale, y - 30 * scale);
        wreck.lineTo(x + 25 * scale, y - 35 * scale);
        wreck.closePath();
        wreck.fillPath();
        
        // Deuxième voile (plus petite)
        wreck.beginPath();
        wreck.moveTo(x - 15 * scale, y - 45 * scale);
        wreck.lineTo(x + 5 * scale, y - 38 * scale);
        wreck.lineTo(x, y - 20 * scale);
        wreck.lineTo(x - 15 * scale, y - 25 * scale);
        wreck.closePath();
        wreck.fillPath();
        
        // Planches cassées (détails)
        wreck.fillStyle(0xa0522d, 1);
        wreck.fillRect(x - 45 * scale, y - 12 * scale, 35 * scale, 7 * scale);
        wreck.fillRect(x + 15 * scale, y + 4 * scale, 30 * scale, 6 * scale);
        wreck.fillRect(x - 25 * scale, y + 8 * scale, 28 * scale, 8 * scale);
        
        // Hublots (plusieurs)
        wreck.fillStyle(0x4682b4, 0.7);
        wreck.fillCircle(x - 35 * scale, y, 5 * scale);
        wreck.fillCircle(x - 15 * scale, y, 5 * scale);
        wreck.fillCircle(x + 5 * scale, y, 5 * scale);
        wreck.fillCircle(x + 25 * scale, y, 5 * scale);
        
        // 70% de chance d'avoir un GROS amas d'or (au lieu de 50%)
        if (Math.random() < 0.7) {
          wreck.fillStyle(0xffd700, 1);
          for (let c = 0; c < 25; c++) { // 25 pièces au lieu de 15
            const coinX = x + Phaser.Math.Between(-60 * scale, -30 * scale);
            const coinY = y + Phaser.Math.Between(-5 * scale, 20 * scale);
            wreck.fillCircle(coinX, coinY, 5);
            wreck.fillStyle(0xffed4e, 1);
            wreck.fillCircle(coinX, coinY, 3);
            wreck.fillStyle(0xffd700, 1);
          }
        }
        
        // Appliquer rotation globale
        wreck.setAngle(angle);
        wreck.setDepth(6);
        this.effects.push(wreck);
        
        // Obstacle physique (beaucoup plus grand) - Les épaves sont des obstacles
        obs = this.scene.add.rectangle(x, y, 120 * scale, 65 * scale, 0x000000, 0);
        obs.setAngle(angle);
        this.scene.physics.add.existing(obs, true);
        this.scene.obstacles.add(obs);
        this.effects.push(obs);
      }
    }

    // 7. Poissons animés (5 types)
    const fishColors = [0xff6347, 0x4682b4, 0x32cd32, 0xffc0cb, 0xffff00];
    for (let i = 0; i < 12; i++) {
      const color = fishColors[i % fishColors.length];
      const fish = this.scene.add.graphics();
      const fx = Phaser.Math.Between(60, width - 60);
      const fy = Phaser.Math.Between(60, height - 60);
      // Corps
      fish.fillStyle(color, 0.85);
      fish.fillEllipse(fx, fy, 22, 10);
      // Queue
      fish.fillStyle(color, 0.7);
      fish.beginPath();
      fish.moveTo(fx - 10, fy);
      fish.lineTo(fx - 22, fy - 7);
      fish.lineTo(fx - 22, fy + 7);
      fish.closePath();
      fish.fillPath();
      // Oeil
      fish.fillStyle(0x000000, 1);
      fish.fillCircle(fx + 7, fy - 2, 1.5);
      fish.setDepth(7);  // Décor, inférieur aux spirits (9)
      this.effects.push(fish);
      
      // Animation nage avec orientation
      const targetX = fx + Phaser.Math.Between(-80, 80);
      const targetY = fy + Phaser.Math.Between(-30, 30);
      let lastX = fx;
      
      this.scene.tweens.add({
        targets: fish,
        x: targetX,
        y: targetY,
        duration: Phaser.Math.Between(3500, 6000),
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 2000,
        onUpdate: (tween, target) => {
          // Orienter le poisson selon sa direction actuelle
          const currentX = target.x;
          const deltaX = currentX - lastX;
          if (Math.abs(deltaX) > 0.5) { // Seuil pour éviter les oscillations
            if (deltaX < 0) {
              target.scaleX = -1; // Regarder à gauche
            } else {
              target.scaleX = 1;  // Regarder à droite
            }
            lastX = currentX;
          }
        }
      });
    }

    // 9. Tornades permanentes (3 max) comme waterLight terrain
    const tornadoCount = 3;
    const tornados = [];
    let tornadoAttempts = 0;
    const minTornadoDist = 500; // Distance minimale entre tornades
    
    while (tornados.length < tornadoCount && tornadoAttempts < 50) {
      tornadoAttempts++;
      const tornadoX = Phaser.Math.Between(300, width - 300);
      const tornadoY = Phaser.Math.Between(300, height - 300);
      
      // Skip if near base
      if (this.isNearBase(tornadoX, tornadoY, 350)) {
        continue;
      }
      
      // Check distance from other tornados
      let tooClose = false;
      for (const other of tornados) {
        const dist = Phaser.Math.Distance.Between(tornadoX, tornadoY, other.x, other.y);
        if (dist < minTornadoDist) {
          tooClose = true;
          break;
        }
      }
      
      if (!tooClose) {
        tornados.push({ x: tornadoX, y: tornadoY });
        this.createWindPowerZone(tornadoX, tornadoY);
      }
    }

    // 10. Zones de pluie (pas d'éclairs)
    this.createRainZones(width, height);
  }

  // WATER LIGHT TERRAIN (Level 1-7) - Rainy Plains like Wind
  createWaterLightTerrain(width, height) {
    // Rainy Plains - Base naturelle avec BEAUCOUP de pluie, lacs bleus opaques et tornades
    
    // BEAUCOUP de lacs bleus opaques (10-15 lacs de formes variées et arrondies)
    const lakeCount = Phaser.Math.Between(10, 15);
    const lakes = [];
    let attempts = 0;
    const maxAttempts = 100;
    
    while (lakes.length < lakeCount && attempts < maxAttempts) {
      attempts++;
      const lakeX = Phaser.Math.Between(200, width - 200);
      const lakeY = Phaser.Math.Between(200, height - 200);
      const lakeRadius = Phaser.Math.Between(80, 140);
      
      // Skip if near base
      if (this.isNearBase(lakeX, lakeY, 250)) {
        continue;
      }
      
      // Lac bleu opaque avec forme organique (plusieurs cercles fusionnés)
      const lake = this.scene.add.graphics();
      lake.fillStyle(0x1e90ff, 1); // Bleu opaque
      
      // Forme organique en combinant plusieurs cercles
      const numBlobs = Phaser.Math.Between(3, 5);
      for (let b = 0; b < numBlobs; b++) {
        const angle = (b / numBlobs) * Math.PI * 2;
        const blobOffset = lakeRadius * 0.4;
        const blobX = lakeX + Math.cos(angle) * blobOffset;
        const blobY = lakeY + Math.sin(angle) * blobOffset;
        const blobRadius = lakeRadius * Phaser.Math.FloatBetween(0.6, 0.8);
        lake.fillCircle(blobX, blobY, blobRadius);
      }
      // Centre du lac
      lake.fillCircle(lakeX, lakeY, lakeRadius);
      lake.setDepth(1);
      this.effects.push(lake);
      
      lakes.push({ x: lakeX, y: lakeY, radius: lakeRadius });
    }
    
    // Seulement 4 lacs MAX avec ponts, le reste sans pont
    const lakesWithBridges = lakes.slice(0, 4);
    lakesWithBridges.forEach((lake) => {
      const bridgeAngle = Math.random() * Math.PI * 2;
      
      // Cercle bleu opaque autour du pont (plus large que le lac)
      const waterCircle = this.scene.add.circle(
        lake.x, 
        lake.y, 
        lake.radius + 30, 
        0x4682b4, 
        0.8
      );
      waterCircle.setDepth(2);
      this.effects.push(waterCircle);
      
      // Pont
      this.createBridgeWithHazardZone('water', lake.x, lake.y, lake.radius, bridgeAngle, 0x1e90ff);
    });
    
    // Les lacs sans pont sont des OBSTACLES PHYSIQUES
    const lakesWithoutBridges = lakes.slice(4);
    lakesWithoutBridges.forEach((lake) => {
      const lakeObstacle = this.scene.add.circle(lake.x, lake.y, lake.radius, 0x000000, 0);
      this.addObstacle(lakeObstacle);
    });
    
    // BEAUCOUP de zones de pluie permanente avec nuages (8-12 zones)
    const rainZoneCount = Phaser.Math.Between(8, 12);
    for (let i = 0; i < rainZoneCount; i++) {
      const zoneX = Phaser.Math.Between(150, width - 150);
      const zoneY = Phaser.Math.Between(150, height - 150);
      const zoneRadius = Phaser.Math.Between(100, 180);
      
      // Nuage gris au-dessus de la zone
      const cloud = this.scene.add.graphics();
      cloud.fillStyle(0x808080, 0.7);
      
      // Nuage composé de plusieurs cercles
      const cloudBlobs = Phaser.Math.Between(3, 5);
      for (let c = 0; c < cloudBlobs; c++) {
        const cloudOffsetX = (c - cloudBlobs / 2) * 40;
        const cloudOffsetY = -zoneRadius - 80 + Math.random() * 20;
        const cloudRadius = Phaser.Math.Between(30, 50);
        cloud.fillCircle(zoneX + cloudOffsetX, zoneY + cloudOffsetY, cloudRadius);
      }
      cloud.setDepth(14);
      this.effects.push(cloud);
      
      // Cercle bleu au sol (sans bordure)
      const groundCircle = this.scene.add.circle(zoneX, zoneY, zoneRadius, 0x4682b4, 0.4);
      groundCircle.setDepth(1);
      this.effects.push(groundCircle);
      
      // Particules de pluie PLUS VISIBLES (60-80 gouttes par zone)
      for (let j = 0; j < 70; j++) {
        const dropX = zoneX + Phaser.Math.Between(-zoneRadius, zoneRadius);
        const dropY = zoneY - zoneRadius - 100 + Phaser.Math.Between(0, 50);
        
        if (Phaser.Math.Distance.Between(dropX, zoneY, zoneX, zoneY) < zoneRadius) {
          // Gouttes plus longues et plus épaisses
          const drop = this.scene.add.graphics();
          drop.lineStyle(3, 0xffffff, 0.8); // Blanc et plus opaque
          drop.lineBetween(0, 0, 0, 18); // Plus longues
          drop.setPosition(dropX, dropY);
          drop.setDepth(16);
          
          // Animation de chute permanente depuis le nuage
          this.scene.tweens.add({
            targets: drop,
            y: zoneY + zoneRadius + 50,
            alpha: 0,
            duration: 1000,
            repeat: -1,
            delay: Math.random() * 1000
          });
          
          this.effects.push(drop);
        }
      }
      
      // Hazard de ralentissement (tous sauf Water)
      const rainHazard = {
        type: 'rain',
        x: zoneX,
        y: zoneY,
        radius: zoneRadius,
        update: (time, delta, players) => {
          players.forEach(player => {
            if (!player.active) return;
            
            // Water players are immune to rain slowdown
            if (player.element === 'water' || player.element === 'waterLight') return;
            
            const dist = Phaser.Math.Distance.Between(zoneX, zoneY, player.x, player.y);
            
            if (dist < zoneRadius) {
              // Diviser la vitesse par 3
              if (player.body) {
                player.body.velocity.x /= 3;
                player.body.velocity.y /= 3;
              }
            }
          });
        }
      };
      
      this.hazards.push(rainHazard);
    }
    
    // Tornades permanentes (3 max) = Pouvoir Wind fixe sur le terrain
    const tornadoCount = 3;
    const tornados = [];
    let tornadoAttempts = 0;
    const minTornadoDist = 500; // Distance minimale entre tornades
    
    while (tornados.length < tornadoCount && tornadoAttempts < 50) {
      tornadoAttempts++;
      const tornadoX = Phaser.Math.Between(300, width - 300);
      const tornadoY = Phaser.Math.Between(300, height - 300);
      
      // Skip if near base
      if (this.isNearBase(tornadoX, tornadoY, 350)) {
        continue;
      }
      
      // Check distance from other tornados
      let tooClose = false;
      for (const other of tornados) {
        const dist = Phaser.Math.Distance.Between(tornadoX, tornadoY, other.x, other.y);
        if (dist < minTornadoDist) {
          tooClose = true;
          break;
        }
      }
      
      if (!tooClose) {
        tornados.push({ x: tornadoX, y: tornadoY });
        this.createWindPowerZone(tornadoX, tornadoY);
      }
    }
  }

  // STORM TERRAIN - Storm Plains (identique à Rainy Plains mais moins de pluie, beaucoup plus de tornades)
  createStormTerrain(width, height) {
    // Base naturelle visible (herbe verte + arbres + eau + pierres + ponts)
    // Créée par createNaturalEnvironment dans GameScene
    
    // Peu de lacs (3-5 total, premier avec pont, reste obstacles)
    const lakeCount = Phaser.Math.Between(3, 5);
    const lakes = [];
    let attempts = 0;
    const maxAttempts = 50;
    
    while (lakes.length < lakeCount && attempts < maxAttempts) {
      attempts++;
      const lakeX = Phaser.Math.Between(200, width - 200);
      const lakeY = Phaser.Math.Between(200, height - 200);
      const lakeRadius = Phaser.Math.Between(80, 140);
      
      if (this.isNearBase(lakeX, lakeY, 250)) continue;
      
      const lake = this.scene.add.graphics();
      lake.fillStyle(0x1e90ff, 1);
      const numBlobs = Phaser.Math.Between(3, 5);
      for (let b = 0; b < numBlobs; b++) {
        const angle = (b / numBlobs) * Math.PI * 2;
        const blobOffset = lakeRadius * 0.4;
        const blobX = lakeX + Math.cos(angle) * blobOffset;
        const blobY = lakeY + Math.sin(angle) * blobOffset;
        const blobRadius = lakeRadius * Phaser.Math.FloatBetween(0.6, 0.8);
        lake.fillCircle(blobX, blobY, blobRadius);
      }
      lake.fillCircle(lakeX, lakeY, lakeRadius);
      lake.setDepth(1);
      this.effects.push(lake);
      lakes.push({ x: lakeX, y: lakeY, radius: lakeRadius });
    }
    
    // Premier lac avec pont, reste obstacles
    if (lakes.length > 0) {
      const bridgeLake = lakes[0];
      const bridgeAngle = Math.random() * Math.PI * 2;
      const waterCircle = this.scene.add.circle(
        bridgeLake.x, bridgeLake.y, bridgeLake.radius + 30, 0x4682b4, 0.8
      );
      waterCircle.setDepth(2);
      this.effects.push(waterCircle);
      this.createBridgeWithHazardZone('water', bridgeLake.x, bridgeLake.y, bridgeLake.radius, bridgeAngle, 0x1e90ff);
    }
    
    lakes.slice(1).forEach((lake) => {
      const lakeObstacle = this.scene.add.circle(lake.x, lake.y, lake.radius, 0x000000, 0);
      this.addObstacle(lakeObstacle);
    });
    
    // Peu de zones de pluie (3 max) - exactement comme Rainy Plains
    const rainZoneCount = 3;
    for (let i = 0; i < rainZoneCount; i++) {
      const zoneX = Phaser.Math.Between(150, width - 150);
      const zoneY = Phaser.Math.Between(150, height - 150);
      const zoneRadius = Phaser.Math.Between(100, 180);
      
      // Nuage gris au-dessus de la zone
      const cloud = this.scene.add.graphics();
      cloud.fillStyle(0x808080, 0.7);
      
      // Nuage composé de plusieurs cercles
      const cloudBlobs = Phaser.Math.Between(3, 5);
      for (let c = 0; c < cloudBlobs; c++) {
        const cloudOffsetX = (c - cloudBlobs / 2) * 40;
        const cloudOffsetY = -zoneRadius - 80 + Math.random() * 20;
        const cloudRadius = Phaser.Math.Between(30, 50);
        cloud.fillCircle(zoneX + cloudOffsetX, zoneY + cloudOffsetY, cloudRadius);
      }
      cloud.setDepth(14);
      this.effects.push(cloud);
      
      // Cercle bleu au sol (sans bordure)
      const groundCircle = this.scene.add.circle(zoneX, zoneY, zoneRadius, 0x4682b4, 0.4);
      groundCircle.setDepth(1);
      this.effects.push(groundCircle);
      
      // Particules de pluie PLUS VISIBLES (60-80 gouttes par zone)
      for (let j = 0; j < 70; j++) {
        const dropX = zoneX + Phaser.Math.Between(-zoneRadius, zoneRadius);
        const dropY = zoneY - zoneRadius - 100 + Phaser.Math.Between(0, 50);
        
        if (Phaser.Math.Distance.Between(dropX, zoneY, zoneX, zoneY) < zoneRadius) {
          // Gouttes plus longues et plus épaisses
          const drop = this.scene.add.graphics();
          drop.lineStyle(3, 0xffffff, 0.8); // Blanc et plus opaque
          drop.lineBetween(0, 0, 0, 18); // Plus longues
          drop.setPosition(dropX, dropY);
          drop.setDepth(16);
          
          // Animation de chute permanente depuis le nuage
          this.scene.tweens.add({
            targets: drop,
            y: zoneY + zoneRadius + 50,
            alpha: 0,
            duration: 1000,
            repeat: -1,
            delay: Math.random() * 1000
          });
          
          this.effects.push(drop);
        }
      }
      
      // Hazard de ralentissement (tous sauf Water)
      const rainHazard = {
        type: 'rain',
        x: zoneX,
        y: zoneY,
        radius: zoneRadius,
        update: (time, delta, players) => {
          players.forEach(player => {
            if (!player.active) return;
            
            // Water players are immune to rain slowdown
            if (player.element && player.element.key === 'water') return;
            
            const dist = Phaser.Math.Distance.Between(zoneX, zoneY, player.x, player.y);
            
            if (dist < zoneRadius) {
              // Diviser la vitesse par 3
              if (player.body) {
                player.body.velocity.x /= 3;
                player.body.velocity.y /= 3;
              }
            }
          });
        }
      };
      
      this.hazards.push(rainHazard);
    }
    
    // BEAUCOUP de tornades (8-12) avec rayons variables (1-2 tuiles)
    const tornadoCount = Phaser.Math.Between(8, 12);
    const tornados = [];
    let tornadoAttempts = 0;
    const minTornadoDist = 400;
    
    while (tornados.length < tornadoCount && tornadoAttempts < 100) {
      tornadoAttempts++;
      const tornadoX = Phaser.Math.Between(300, width - 300);
      const tornadoY = Phaser.Math.Between(300, height - 300);
      const tornadoRadius = GAME_CONFIG.TILE_SIZE * Phaser.Math.FloatBetween(1, 2); // 1-2 tuiles
      
      if (this.isNearBase(tornadoX, tornadoY, 350)) continue;
      
      let tooClose = false;
      for (const other of tornados) {
        const dist = Phaser.Math.Distance.Between(tornadoX, tornadoY, other.x, other.y);
        if (dist < minTornadoDist) {
          tooClose = true;
          break;
        }
      }
      
      if (!tooClose) {
        tornados.push({ x: tornadoX, y: tornadoY, radius: tornadoRadius });
        this.createWindPowerZone(tornadoX, tornadoY, tornadoRadius);
      }
    }
    
    // Bonus de vitesse pour Wind sur ce terrain
    const windSpeedBonus = {
      type: 'windSpeedBonus',
      update: (time, delta, players) => {
        players.forEach(player => {
          if (player.element && player.element.key === 'wind') {
            if (!player.stormSpeedBoosted) {
              player.stormSpeedBoosted = true;
              if (player.body) {
                player.body.maxVelocity.x *= 1.5;
                player.body.maxVelocity.y *= 1.5;
              }
            }
          }
        });
      }
    };
    this.hazards.push(windSpeedBonus);
    
    // Animation de vent partout sur le terrain (particules de vent)
    for (let i = 0; i < 40; i++) {
      const windX = Phaser.Math.Between(0, width);
      const windY = Phaser.Math.Between(0, height);
      
      // Particule de vent (ligne blanche semi-transparente)
      const windParticle = this.scene.add.graphics();
      windParticle.lineStyle(2, 0xffffff, 0.3);
      windParticle.lineBetween(0, 0, 30, 0);
      windParticle.setPosition(windX, windY);
      windParticle.setDepth(20);
      
      // Animation de déplacement horizontal
      this.scene.tweens.add({
        targets: windParticle,
        x: windX + 200,
        alpha: 0,
        duration: 2000,
        repeat: -1,
        delay: Math.random() * 2000,
        onRepeat: () => {
          windParticle.x = Phaser.Math.Between(0, width);
          windParticle.y = Phaser.Math.Between(0, height);
          windParticle.alpha = 0.3;
        }
      });
      
      this.effects.push(windParticle);
    }
  }

  // FIRE TERRAIN - Volcanic avec forêt brûlante
  createFireTerrain(width, height) {
    // Brown rocky ground with lava
    const ground = this.scene.add.graphics();
    ground.fillStyle(0x654321, 1);
    ground.fillRect(0, 0, width, height);
    ground.setDepth(0);
    this.effects.push(ground);

    // Lava pools (6-8 pools) avec ponts - PAS D'OBSTACLES SUR LA LAVE
    const lavaCount = Phaser.Math.Between(6, 8);
    const lavas = [];
    let attempts = 0;
    const maxAttempts = 80;
    
    while (lavas.length < lavaCount && attempts < maxAttempts) {
      attempts++;
      const lavaX = Phaser.Math.Between(200, width - 200);
      const lavaY = Phaser.Math.Between(200, height - 200);
      const lavaSize = Phaser.Math.Between(100, 150);
      
      // Skip if near base
      if (this.isNearBase(lavaX, lavaY, 250)) {
        continue;
      }
      
      // Lava body avec animation de bulles
      const lava = this.scene.add.graphics();
      lava.fillStyle(0xff4500, 1);
      lava.fillCircle(lavaX, lavaY, lavaSize);
      lava.setDepth(1);
      this.effects.push(lava);
      
      // Inner molten core (plus clair)
      const core = this.scene.add.graphics();
      core.fillStyle(0xff6600, 0.8);
      core.fillCircle(lavaX, lavaY, lavaSize * 0.6);
      core.setDepth(2);
      this.effects.push(core);
      
      // Lava glow pulsant
      const glow = this.scene.add.graphics();
      glow.fillStyle(0xff8c00, 0.4);
      glow.fillCircle(lavaX, lavaY, lavaSize + 30);
      glow.setDepth(1);
      this.effects.push(glow);
      
      // Animation de pulsation de la lave
      this.scene.tweens.add({
        targets: glow,
        alpha: { from: 0.4, to: 0.1 },
        duration: 1500,
        yoyo: true,
        repeat: -1
      });
      
      // Animation du core (rotation des couleurs)
      this.scene.tweens.add({
        targets: core,
        alpha: { from: 0.8, to: 0.5 },
        duration: 800,
        yoyo: true,
        repeat: -1
      });
      
      lavas.push({ x: lavaX, y: lavaY, radius: lavaSize });
    }
    
    // Ponts métalliques traversant les laves
    lavas.forEach((lava) => {
      const bridgeAngle = Math.random() * Math.PI * 2;
      this.createBridgeWithHazardZone('fire', lava.x, lava.y, lava.radius, bridgeAngle, 0xff4500);
    });

    // FORÊT BRÛLANTE - Arbres en feu (20-30 arbres)
    const burningTreeCount = Phaser.Math.Between(20, 30);
    for (let i = 0; i < burningTreeCount; i++) {
      const treeX = Phaser.Math.Between(100, width - 100);
      const treeY = Phaser.Math.Between(100, height - 100);
      
      if (this.isNearBase(treeX, treeY, 200)) continue;
      
      // Tronc carbonisé (noir/gris foncé)
      const trunk = this.scene.add.graphics();
      trunk.fillStyle(0x1a1a1a, 1);
      trunk.fillRect(treeX - 10, treeY - 50, 20, 50);
      
      // Texture du tronc (fissures)
      trunk.lineStyle(2, 0x0d0d0d, 0.6);
      for (let j = 0; j < 3; j++) {
        trunk.lineBetween(treeX - 10, treeY - 45 + j * 15, treeX + 10, treeY - 40 + j * 15);
      }
      trunk.setDepth(5);
      this.effects.push(trunk);
      
      // Branches brûlées
      const branches = this.scene.add.graphics();
      branches.lineStyle(4, 0x2f2f2f);
      branches.beginPath();
      branches.moveTo(treeX, treeY - 45);
      branches.lineTo(treeX - 20, treeY - 60);
      branches.moveTo(treeX, treeY - 40);
      branches.lineTo(treeX + 18, treeY - 58);
      branches.moveTo(treeX, treeY - 30);
      branches.lineTo(treeX - 15, treeY - 42);
      branches.strokePath();
      branches.setDepth(5);
      this.effects.push(branches);
      
      // FLAMMES sur l'arbre (particules de feu)
      const fireHeight = treeY - 50;
      for (let f = 0; f < 4; f++) {
        const flameX = treeX + Phaser.Math.Between(-15, 15);
        const flameY = fireHeight + Phaser.Math.Between(-10, 10);
        
        const flame = this.scene.add.circle(flameX, flameY, 6, 0xff4500, 0.9);
        flame.setDepth(6);
        this.effects.push(flame);
        
        // Animation vacillante des flammes
        this.scene.tweens.add({
          targets: flame,
          y: flameY - 20,
          alpha: 0,
          scaleX: { from: 1, to: 0.5 },
          scaleY: { from: 1, to: 1.5 },
          duration: Phaser.Math.Between(800, 1500),
          repeat: -1,
          onRepeat: () => {
            flame.y = flameY;
            flame.alpha = 0.9;
            flame.scaleX = 1;
            flame.scaleY = 1;
          }
        });
      }
      
      // Lueur orange sous l'arbre
      const emberGlow = this.scene.add.circle(treeX, treeY, 25, 0xff6600, 0.3);
      emberGlow.setDepth(1);
      this.effects.push(emberGlow);
      
      this.scene.tweens.add({
        targets: emberGlow,
        alpha: { from: 0.3, to: 0.1 },
        duration: 1000,
        yoyo: true,
        repeat: -1
      });
    }

    // VOLCANS (3-5 avec différentes tailles)
    const volcanoCount = Phaser.Math.Between(3, 5);
    for (let i = 0; i < volcanoCount; i++) {
      const volcanoX = Phaser.Math.Between(250, width - 250);
      const volcanoY = Phaser.Math.Between(250, height - 250);
      
      if (this.isNearBase(volcanoX, volcanoY, 300)) continue;
      
      const volcanoSize = Phaser.Math.Between(80, 140);
      
      // Corps du volcan (cône gris foncé)
      const volcano = this.scene.add.graphics();
      volcano.fillStyle(0x4a4a4a, 1);
      volcano.beginPath();
      volcano.moveTo(volcanoX, volcanoY - volcanoSize); // Sommet
      volcano.lineTo(volcanoX + volcanoSize * 0.8, volcanoY + volcanoSize * 0.3); // Base droite
      volcano.lineTo(volcanoX - volcanoSize * 0.8, volcanoY + volcanoSize * 0.3); // Base gauche
      volcano.closePath();
      volcano.fillPath();
      volcano.setDepth(3);
      this.effects.push(volcano);
      
      // Ombre du volcan
      volcano.fillStyle(0x2a2a2a, 0.5);
      volcano.fillTriangle(
        volcanoX + 10, volcanoY - volcanoSize + 10,
        volcanoX + volcanoSize * 0.8 + 10, volcanoY + volcanoSize * 0.3 + 10,
        volcanoX - volcanoSize * 0.8 + 10, volcanoY + volcanoSize * 0.3 + 10
      );
      
      // Cratère au sommet (lave rouge)
      const crater = this.scene.add.circle(volcanoX, volcanoY - volcanoSize + 15, 12, 0xff4500, 1);
      crater.setDepth(4);
      this.effects.push(crater);
      
      // Lueur du cratère
      const craterGlow = this.scene.add.circle(volcanoX, volcanoY - volcanoSize + 15, 20, 0xff8c00, 0.4);
      craterGlow.setDepth(4);
      this.effects.push(craterGlow);
      
      this.scene.tweens.add({
        targets: [crater, craterGlow],
        alpha: { from: 1, to: 0.5 },
        duration: 1200,
        yoyo: true,
        repeat: -1
      });
      
      // Fumée/cendres du volcan (particules grises qui montent)
      for (let s = 0; s < 3; s++) {
        const smoke = this.scene.add.circle(
          volcanoX + Phaser.Math.Between(-8, 8),
          volcanoY - volcanoSize + 15,
          Phaser.Math.Between(6, 10),
          0x808080,
          0.6
        );
        smoke.setDepth(5);
        this.effects.push(smoke);
        
        this.scene.tweens.add({
          targets: smoke,
          y: volcanoY - volcanoSize - 60,
          alpha: 0,
          scaleX: { from: 1, to: 2 },
          scaleY: { from: 1, to: 2 },
          duration: Phaser.Math.Between(2000, 3000),
          repeat: -1,
          delay: s * 400,
          onRepeat: () => {
            smoke.y = volcanoY - volcanoSize + 15;
            smoke.alpha = 0.6;
            smoke.scaleX = 1;
            smoke.scaleY = 1;
          }
        });
      }
    }

    // ROCHES VOLCANIQUES (12-18 roches)
    const volcanicRockCount = Phaser.Math.Between(12, 18);
    for (let i = 0; i < volcanicRockCount; i++) {
      const rockX = Phaser.Math.Between(100, width - 100);
      const rockY = Phaser.Math.Between(100, height - 100);
      
      if (this.isNearBase(rockX, rockY, 200)) continue;
      
      const rockSize = Phaser.Math.Between(30, 55);
      
      // Rocher volcanique avec forme irrégulière
      const rock = this.scene.add.graphics();
      rock.fillStyle(0x4a4a4a, 1); // Gris foncé volcanique
      
      rock.beginPath();
      rock.moveTo(rockX, rockY - rockSize * 0.8);
      rock.lineTo(rockX + rockSize * 0.6, rockY - rockSize * 0.3);
      rock.lineTo(rockX + rockSize * 0.5, rockY + rockSize * 0.4);
      rock.lineTo(rockX - rockSize * 0.4, rockY + rockSize * 0.5);
      rock.lineTo(rockX - rockSize * 0.7, rockY);
      rock.lineTo(rockX - rockSize * 0.3, rockY - rockSize * 0.5);
      rock.closePath();
      rock.fillPath();
      
      // Ombrage
      rock.fillStyle(0x2a2a2a, 0.5);
      rock.fillCircle(rockX + rockSize * 0.1, rockY + rockSize * 0.1, rockSize * 0.3);
      
      // Highlight rouge (chaleur)
      rock.fillStyle(0xff4500, 0.2);
      rock.fillCircle(rockX - rockSize * 0.2, rockY - rockSize * 0.2, rockSize * 0.2);
      
      rock.setDepth(4);
      this.effects.push(rock);
      
      // Obstacle physique
      const rockObstacle = this.scene.add.circle(rockX, rockY, rockSize * 0.5, 0x000000, 0);
      this.addObstacle(rockObstacle);
    }

    // AUCUN AUTRE OBSTACLE - terrain complètement traversable (sauf laves avec ponts et roches)
  }

  // EARTH TERRAIN - Mountains
  createEarthTerrain(width, height) {
    // Brown rocky terrain
    const ground = this.scene.add.graphics();
    ground.fillStyle(0x654321, 1);
    ground.fillRect(0, 0, width, height);
    ground.setDepth(0);
    this.effects.push(ground);

    // ROCHES VARIÉES (4 formes différentes, 18-24 roches)
    const rockCount = Phaser.Math.Between(18, 24);
    const rockShapes = [
      // Forme 1: Rocher arrondi irrégulier
      (x, y, size, graphics) => {
        graphics.fillStyle(0x8b7355, 1);
        graphics.beginPath();
        graphics.moveTo(x, y - size * 0.9);
        graphics.lineTo(x + size * 0.7, y - size * 0.4);
        graphics.lineTo(x + size * 0.6, y + size * 0.3);
        graphics.lineTo(x + size * 0.2, y + size * 0.5);
        graphics.lineTo(x - size * 0.5, y + size * 0.4);
        graphics.lineTo(x - size * 0.7, y - size * 0.2);
        graphics.lineTo(x - size * 0.3, y - size * 0.6);
        graphics.closePath();
        graphics.fillPath();
      },
      // Forme 2: Rocher anguleux
      (x, y, size, graphics) => {
        graphics.fillStyle(0x8b7355, 1);
        graphics.beginPath();
        graphics.moveTo(x, y - size);
        graphics.lineTo(x + size * 0.8, y - size * 0.2);
        graphics.lineTo(x + size * 0.5, y + size * 0.4);
        graphics.lineTo(x - size * 0.3, y + size * 0.5);
        graphics.lineTo(x - size * 0.8, y);
        graphics.lineTo(x - size * 0.4, y - size * 0.5);
        graphics.closePath();
        graphics.fillPath();
      },
      // Forme 3: Rocher plat large
      (x, y, size, graphics) => {
        graphics.fillStyle(0x8b7355, 1);
        graphics.beginPath();
        graphics.moveTo(x, y - size * 0.6);
        graphics.lineTo(x + size * 0.9, y - size * 0.3);
        graphics.lineTo(x + size * 0.8, y + size * 0.4);
        graphics.lineTo(x - size * 0.8, y + size * 0.4);
        graphics.lineTo(x - size * 0.9, y - size * 0.3);
        graphics.closePath();
        graphics.fillPath();
      },
      // Forme 4: Rocher compact arrondi
      (x, y, size, graphics) => {
        graphics.fillStyle(0x8b7355, 1);
        graphics.beginPath();
        graphics.moveTo(x, y - size * 0.7);
        graphics.lineTo(x + size * 0.6, y - size * 0.5);
        graphics.lineTo(x + size * 0.7, y + size * 0.2);
        graphics.lineTo(x + size * 0.3, y + size * 0.5);
        graphics.lineTo(x - size * 0.4, y + size * 0.4);
        graphics.lineTo(x - size * 0.6, y);
        graphics.lineTo(x - size * 0.4, y - size * 0.6);
        graphics.closePath();
        graphics.fillPath();
      }
    ];
    
    for (let i = 0; i < rockCount; i++) {
      const rockX = Phaser.Math.Between(50, width - 50);
      const rockY = Phaser.Math.Between(50, height - 50);
      const rockSize = Phaser.Math.Between(35, 65);
      
      if (this.isNearBase(rockX, rockY, 200)) continue;
      
      const rock = this.scene.add.graphics();
      
      // Choisir une forme aléatoire
      const shapeIndex = Phaser.Math.Between(0, 3);
      rockShapes[shapeIndex](rockX, rockY, rockSize, rock);
      
      // Ombrage pour le relief
      rock.fillStyle(0x654321, 0.5);
      rock.fillCircle(rockX + rockSize * 0.15, rockY + rockSize * 0.1, rockSize * 0.35);
      
      // Highlight (partie ensoleillée)
      rock.fillStyle(0xa0826d, 0.4);
      rock.fillCircle(rockX - rockSize * 0.2, rockY - rockSize * 0.3, rockSize * 0.25);
      
      rock.setDepth(5);
      this.effects.push(rock);
      
      // OBSTACLE PHYSIQUE - rocher
      const rockObstacle = this.scene.add.circle(rockX, rockY, rockSize * 0.5, 0x000000, 0);
      this.addObstacle(rockObstacle);
    }

    // GOUFFRES avec ponts en bois (3-5 gouffres)
    const creviceCount = Phaser.Math.Between(3, 5);
    const crevices = [];
    let creviceAttempts = 0;
    const maxCreviceAttempts = 50;
    
    while (crevices.length < creviceCount && creviceAttempts < maxCreviceAttempts) {
      creviceAttempts++;
      const creviceX = Phaser.Math.Between(200, width - 200);
      const creviceY = Phaser.Math.Between(200, height - 200);
      const creviceRadius = Phaser.Math.Between(80, 120);
      
      // Skip if near base
      if (this.isNearBase(creviceX, creviceY, 250)) {
        continue;
      }
      
      // Gouffre (cercle noir profond)
      const crevice = this.scene.add.circle(creviceX, creviceY, creviceRadius, 0x1a1a1a, 1);
      crevice.setDepth(1);
      this.effects.push(crevice);
      
      // Bordure rocheuse du gouffre
      const creviceBorder = this.scene.add.graphics();
      creviceBorder.lineStyle(4, 0x654321, 0.6);
      creviceBorder.strokeCircle(creviceX, creviceY, creviceRadius);
      creviceBorder.setDepth(2);
      this.effects.push(creviceBorder);
      
      crevices.push({ x: creviceX, y: creviceY, radius: creviceRadius });
    }
    
    // Ponts en bois traversant les gouffres + obstacles sur les côtés
    crevices.forEach((crevice) => {
      const bridgeAngle = Math.random() * Math.PI * 2;
      const bridgeLength = crevice.radius * 3.0;
      const bridgeWidth = 50;
      
      // Créer les obstacles de chaque côté du pont (parties non couvertes du cercle)
      this.createVoidSideObstacles(crevice.x, crevice.y, crevice.radius, bridgeAngle);
      
      const bridgeCenterX = crevice.x;
      const bridgeCenterY = crevice.y;
      
      // Calculer les 4 coins du rectangle tourné
      const cos = Math.cos(bridgeAngle);
      const sin = Math.sin(bridgeAngle);
      const halfLength = bridgeLength / 2;
      const halfWidth = bridgeWidth / 2;
      
      // Pont en bois avec rectangle tourné
      const bridge = this.scene.add.graphics();
      bridge.fillStyle(0x8b6914, 1); // Marron bois
      
      // Dessiner le pont comme un polygone tourné
      const corners = [
        { x: -halfLength * cos - (-halfWidth) * sin, y: -halfLength * sin + (-halfWidth) * cos },
        { x: halfLength * cos - (-halfWidth) * sin, y: halfLength * sin + (-halfWidth) * cos },
        { x: halfLength * cos - halfWidth * sin, y: halfLength * sin + halfWidth * cos },
        { x: -halfLength * cos - halfWidth * sin, y: -halfLength * sin + halfWidth * cos }
      ];
      
      bridge.beginPath();
      bridge.moveTo(bridgeCenterX + corners[0].x, bridgeCenterY + corners[0].y);
      for (let c = 1; c < corners.length; c++) {
        bridge.lineTo(bridgeCenterX + corners[c].x, bridgeCenterY + corners[c].y);
      }
      bridge.closePath();
      bridge.fillPath();
      
      // Planches en bois (lignes transversales)
      bridge.lineStyle(3, 0x654321, 0.6);
      for (let r = -halfLength; r < halfLength; r += 25) {
        const plankX1 = bridgeCenterX + r * cos - halfWidth * sin;
        const plankY1 = bridgeCenterY + r * sin + halfWidth * cos;
        const plankX2 = bridgeCenterX + r * cos + halfWidth * sin;
        const plankY2 = bridgeCenterY + r * sin - halfWidth * cos;
        
        bridge.lineBetween(plankX1, plankY1, plankX2, plankY2);
      }
      
      bridge.setDepth(3);
      this.effects.push(bridge);
    });

    // PONTS EN BOIS décoratifs (3-4 ponts sans gouffres)
    const bridgeCount = Phaser.Math.Between(3, 4);
    for (let i = 0; i < bridgeCount; i++) {
      const bridgeX = Phaser.Math.Between(200, width - 200);
      const bridgeY = Phaser.Math.Between(200, height - 200);
      
      if (this.isNearBase(bridgeX, bridgeY, 250)) continue;
      
      const bridgeLength = Phaser.Math.Between(120, 180);
      const bridgeWidth = 50;
      const bridgeAngle = Math.random() * Math.PI * 2;
      
      // Pont en bois
      const bridge = this.scene.add.graphics();
      bridge.fillStyle(0x8b6914, 1); // Marron bois
      
      // Planches du pont
      const numPlanks = 5;
      for (let p = 0; p < numPlanks; p++) {
        const offset = (p - numPlanks/2) * (bridgeLength / numPlanks);
        bridge.fillRect(
          bridgeX + Math.cos(bridgeAngle) * offset - bridgeWidth/2,
          bridgeY + Math.sin(bridgeAngle) * offset - 8,
          bridgeWidth,
          12
        );
      }
      
      bridge.setDepth(3);
      this.effects.push(bridge);
      
      // Cercles noirs de chaque côté du pont (décoration)
      const circleRadius = 8;
      const circleOffset = bridgeLength / 2;
      
      for (let side = -1; side <= 1; side += 2) {
        const circleX = bridgeX + Math.cos(bridgeAngle) * circleOffset * side;
        const circleY = bridgeY + Math.sin(bridgeAngle) * circleOffset * side;
        
        const blackCircle = this.scene.add.circle(circleX, circleY, circleRadius, 0x000000, 1);
        blackCircle.setDepth(4);
        this.effects.push(blackCircle);
      }
    }
  }

  // LEAF TERRAIN - Jungle
  // LEAF TERRAIN - Base naturelle visible avec feuilles mortes
  createLeafTerrain(width, height) {
    // Base naturelle visible (herbe verte + arbres + eau + pierres + ponts)
    // Créée par createNaturalEnvironment dans GameScene
    
    // Feuilles mortes au sol (30-40)
    for (let i = 0; i < 35; i++) {
      const leafX = Phaser.Math.Between(0, width);
      const leafY = Phaser.Math.Between(0, height);
      const leafColor = Phaser.Utils.Array.GetRandom([0x8b4513, 0xa0522d, 0xcd853f, 0xdaa520]);
      
      const leaf = this.scene.add.graphics();
      leaf.fillStyle(leafColor, 0.8);
      leaf.fillEllipse(leafX, leafY, 12, 8);
      leaf.setDepth(2);
      this.effects.push(leaf);
    }
  }

  // ICE TERRAIN - Snowy mountains
  createIceTerrain(width, height) {
    // Snow ground - gris-bleu plus clair
    const snow = this.scene.add.graphics();
    snow.fillStyle(0xd8e4f0, 1); // Gris-bleu plus clair
    snow.fillRect(0, 0, width, height);
    snow.setDepth(0);
    this.effects.push(snow);

    // Petits lacs gelés (obstacles) - cercles bleus avec effet de glace
    for (let i = 0; i < 25; i++) {
      const iceX = Phaser.Math.Between(0, width);
      const iceY = Phaser.Math.Between(0, height);
      const iceSize = Phaser.Math.Between(40, 80);
      
      if (this.isNearBase(iceX, iceY, 200)) continue;
      
      const ice = this.scene.add.graphics();
      
      // Lac gelé avec dégradé bleu
      ice.fillStyle(0x4169e1, 0.9); // Bleu royal foncé
      ice.fillEllipse(iceX, iceY, iceSize, iceSize * 0.6);
      
      // Reflet de glace (plus clair au centre)
      ice.fillStyle(0x87ceeb, 0.6);
      ice.fillEllipse(iceX - iceSize * 0.15, iceY - iceSize * 0.1, iceSize * 0.4, iceSize * 0.25);
      
      // Bord blanc givré
      ice.lineStyle(2, 0xffffff, 0.7);
      ice.strokeEllipse(iceX, iceY, iceSize, iceSize * 0.6);
      
      ice.setDepth(1);
      this.effects.push(ice);
      
      // OBSTACLE PHYSIQUE - lac gelé
      const lakeObstacle = this.scene.add.ellipse(iceX, iceY, iceSize, iceSize * 0.6, 0x000000, 0);
      this.addObstacle(lakeObstacle);
    }

    // Snowmen obstacles (3-4) - Réduit de 7 à 3-4
    for (let i = 0; i < Phaser.Math.Between(3, 4); i++) {
      const snowmanX = Phaser.Math.Between(100, width - 100);
      const snowmanY = Phaser.Math.Between(100, height - 100);
      
      if (this.isNearBase(snowmanX, snowmanY, 250)) continue;
      
      // Bottom snowball
      const bottom = this.scene.add.circle(snowmanX, snowmanY, 20, 0xffffff);
      bottom.setDepth(5);
      this.effects.push(bottom);
      
      // Middle snowball
      const middle = this.scene.add.circle(snowmanX, snowmanY - 30, 15, 0xffffff);
      middle.setDepth(5);
      this.effects.push(middle);
      
      // Top snowball (head)
      const head = this.scene.add.circle(snowmanX, snowmanY - 50, 10, 0xffffff);
      head.setDepth(5);
      this.effects.push(head);
      
      // Eyes
      const leftEye = this.scene.add.circle(snowmanX - 3, snowmanY - 52, 2, 0x000000);
      leftEye.setDepth(5);
      this.effects.push(leftEye);
      
      const rightEye = this.scene.add.circle(snowmanX + 3, snowmanY - 52, 2, 0x000000);
      rightEye.setDepth(5);
      this.effects.push(rightEye);
      
      // Carrot nose
      const nose = this.scene.add.graphics();
      nose.fillStyle(0xff8c00, 1);
      nose.beginPath();
      nose.moveTo(snowmanX, snowmanY - 50);
      nose.lineTo(snowmanX + 8, snowmanY - 49);
      nose.lineTo(snowmanX, snowmanY - 48);
      nose.closePath();
      nose.fillPath();
      nose.setDepth(5);
      this.effects.push(nose);
      
      // OBSTACLE PHYSIQUE - bonhomme de neige
      const snowmanObstacle = this.scene.add.circle(snowmanX, snowmanY - 15, 25, 0x000000, 0);
      this.addObstacle(snowmanObstacle);
    }

    // Arbres enneigés (10-15) - Style naturel comme terrain par défaut
    for (let i = 0; i < Phaser.Math.Between(10, 15); i++) {
      const treeX = Phaser.Math.Between(100, width - 100);
      const treeY = Phaser.Math.Between(100, height - 100);
      
      if (this.isNearBase(treeX, treeY, 250)) continue;
      
      const tree = this.scene.add.graphics();
      
      // Tronc brun naturel
      tree.fillStyle(0x4a2511, 1);
      tree.fillRect(treeX - 6, treeY - 40, 12, 40);
      
      // Feuillage enneigé - forme organique comme terrain par défaut
      tree.fillStyle(0xffffff, 1);
      // Couches de neige superposées
      tree.fillCircle(treeX, treeY - 50, 25);
      tree.fillCircle(treeX - 15, treeY - 45, 18);
      tree.fillCircle(treeX + 15, treeY - 45, 18);
      tree.fillCircle(treeX, treeY - 35, 20);
      
      // Ombres de branches sous la neige
      tree.fillStyle(0x2d5016, 0.3);
      tree.fillCircle(treeX - 8, treeY - 42, 12);
      tree.fillCircle(treeX + 8, treeY - 42, 12);
      
      tree.setDepth(5);
      this.effects.push(tree);
      
      // OBSTACLE PHYSIQUE
      const treeObstacle = this.scene.add.rectangle(treeX, treeY - 20, 12, 40, 0x000000, 0);
      this.addObstacle(treeObstacle);
    }

    // Roches enneigées (12-18) - Style naturel comme terrain Earth
    for (let i = 0; i < Phaser.Math.Between(12, 18); i++) {
      const rockX = Phaser.Math.Between(80, width - 80);
      const rockY = Phaser.Math.Between(80, height - 80);
      const rockSize = Phaser.Math.Between(30, 60);
      
      if (this.isNearBase(rockX, rockY, 250)) continue;
      
      const rock = this.scene.add.graphics();
      
      // Choisir une forme aléatoire parmi 4 styles naturels
      const style = i % 4;
      
      if (style === 0) {
        // Roche irrégulière
        rock.fillStyle(0x696969, 1);
        rock.beginPath();
        rock.moveTo(rockX, rockY - rockSize);
        rock.lineTo(rockX + rockSize * 0.8, rockY - rockSize * 0.3);
        rock.lineTo(rockX + rockSize * 0.5, rockY + rockSize * 0.2);
        rock.lineTo(rockX - rockSize * 0.6, rockY + rockSize * 0.3);
        rock.lineTo(rockX - rockSize * 0.4, rockY - rockSize * 0.5);
        rock.closePath();
        rock.fillPath();
      } else if (style === 1) {
        // Roche angulaire
        rock.fillStyle(0x778899, 1);
        rock.beginPath();
        rock.moveTo(rockX, rockY - rockSize * 0.9);
        rock.lineTo(rockX + rockSize * 0.7, rockY);
        rock.lineTo(rockX - rockSize * 0.5, rockY + rockSize * 0.2);
        rock.closePath();
        rock.fillPath();
      } else if (style === 2) {
        // Roche plate
        rock.fillStyle(0x808080, 1);
        rock.fillEllipse(rockX, rockY, rockSize * 1.2, rockSize * 0.6);
      } else {
        // Roche compacte
        rock.fillStyle(0x696969, 1);
        rock.beginPath();
        rock.moveTo(rockX, rockY - rockSize * 0.7);
        rock.lineTo(rockX + rockSize * 0.6, rockY + rockSize * 0.3);
        rock.lineTo(rockX - rockSize * 0.6, rockY + rockSize * 0.3);
        rock.closePath();
        rock.fillPath();
      }
      
      // Neige sur le dessus - adaptée à la forme
      rock.fillStyle(0xffffff, 0.95);
      if (style === 2) {
        rock.fillEllipse(rockX, rockY - rockSize * 0.2, rockSize * 0.9, rockSize * 0.3);
      } else {
        rock.fillCircle(rockX, rockY - rockSize * 0.6, rockSize * 0.4);
      }
      
      // Relief et highlights
      rock.fillStyle(0xffffff, 0.3);
      rock.fillCircle(rockX - rockSize * 0.2, rockY - rockSize * 0.3, rockSize * 0.15);
      
      rock.setDepth(5);
      this.effects.push(rock);
      
      // OBSTACLE PHYSIQUE adapté à la taille
      const obstacleSize = rockSize * 0.8;
      const rockObstacle = this.scene.add.ellipse(
        rockX, rockY,
        obstacleSize, obstacleSize * 0.6,
        0x000000, 0
      );
      this.addObstacle(rockObstacle);
    }

    // Frozen lakes avec effets variés (3-5 lacs de tailles variées)
    const lakeCount = Phaser.Math.Between(3, 5);
    const lakes = [];
    let attempts = 0;
    const maxAttempts = 50;
    
    while (lakes.length < lakeCount && attempts < maxAttempts) {
      attempts++;
      const lakeX = Phaser.Math.Between(250, width - 250);
      const lakeY = Phaser.Math.Between(250, height - 250);
      const lakeRadius = Phaser.Math.Between(60, 150); // Tailles plus variées
      
      // Skip if near base
      if (this.isNearBase(lakeX, lakeY, 300)) {
        continue;
      }
      
      // Type d'effet aléatoire pour chaque lac
      const effectType = Phaser.Math.Between(1, 3);
      
      const lake = this.scene.add.graphics();
      
      if (effectType === 1) {
        // Lac obstacle (glace épaisse bleue)
        lake.fillStyle(0x4169e1, 0.8);
      } else if (effectType === 2) {
        // Lac ralentissant (glace fine bleu clair)
        lake.fillStyle(0x87ceeb, 0.6);
      } else {
        // Lac qui gèle (glace transparente)
        lake.fillStyle(0xb0e0e6, 0.5);
      }
      
      lake.fillCircle(lakeX, lakeY, lakeRadius);
      lake.setDepth(1);
      this.effects.push(lake);
      
      lakes.push({ x: lakeX, y: lakeY, radius: lakeRadius, effectType: effectType });
    }
    
    // Traiter chaque lac selon son type
    lakes.forEach((lake) => {
      if (lake.effectType === 1) {
        // Obstacle - ajouter un obstacle physique
        const lakeObstacle = this.scene.add.circle(lake.x, lake.y, lake.radius, 0x000000, 0);
        this.addObstacle(lakeObstacle);
      } else if (lake.effectType === 2) {
        // Ralentissement - ajouter hazard de ralentissement
        this.hazards.push({
          type: 'iceLake',
          x: lake.x,
          y: lake.y,
          radius: lake.radius,
          duration: Infinity,
          elapsed: 0
        });
      } else {
        // Gel 2 sec - ajouter hazard de gel
        this.hazards.push({
          type: 'freezeLake',
          x: lake.x,
          y: lake.y,
          radius: lake.radius,
          duration: Infinity,
          elapsed: 0
        });
      }
    });

    // Tornades de neige (1-2) - plus petites et mieux réparties, avec même pouvoir que Wind/Water
    const tornadoCount = Phaser.Math.Between(1, 2);
    const tornadoPositions = [];
    
    for (let i = 0; i < tornadoCount; i++) {
      let tornadoX, tornadoY;
      let validPosition = false;
      let tornadoAttempts = 0;
      
      while (!validPosition && tornadoAttempts < 30) {
        tornadoX = Phaser.Math.Between(300, width - 300);
        tornadoY = Phaser.Math.Between(300, height - 300);
        
        // Vérifier distance des bases
        if (this.isNearBase(tornadoX, tornadoY, 350)) {
          tornadoAttempts++;
          continue;
        }
        
        // Vérifier distance des autres tornades (min 400px)
        const tooClose = tornadoPositions.some(pos => 
          Phaser.Math.Distance.Between(tornadoX, tornadoY, pos.x, pos.y) < 400
        );
        
        if (!tooClose) {
          validPosition = true;
        }
        tornadoAttempts++;
      }
      
      if (validPosition) {
        tornadoPositions.push({ x: tornadoX, y: tornadoY });
        
        // Tornado zone avec rotation 2 sec (même que Wind/Water terrain)
        this.createWindPowerZone(tornadoX, tornadoY, GAME_CONFIG.TILE_SIZE * 2, null, true);
      }
    }

    // Periodic snowfall - plus visible
    this.createSnowfall(width, height);
  }

  // WIND TERRAIN - Base naturelle visible avec tornades
  // GLASS TERRAIN - Mirror castle (vrai terrain glass)
  createGlassTerrain(width, height) {
    // Lighter reflective floor with mirror effect (gris clair brillant)
    const floor = this.scene.add.graphics();
    floor.fillGradientStyle(0xc0d0e0, 0xb0c0d0, 0xc0d0e0, 0xb0c0d0, 1);
    floor.fillRect(0, 0, width, height);
    floor.setDepth(0);
    this.effects.push(floor);

    // Reflective shine pattern on floor (plus visibles)
    for (let i = 0; i < 100; i++) {
      const shimmerX = Phaser.Math.Between(0, width);
      const shimmerY = Phaser.Math.Between(0, height);
      
      const shimmer = this.scene.add.circle(shimmerX, shimmerY, Phaser.Math.Between(2, 5), 0xffffff, 0.5);
      shimmer.setDepth(1);
      
      this.scene.tweens.add({
        targets: shimmer,
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 2000),
        yoyo: true,
        repeat: -1
      });
      
      this.effects.push(shimmer);
    }
    
    console.log('Glass terrain created - reflections will be enabled');

    // Glass furniture types (obstacles)
    const glassFurnitureTypes = [
      // Glass Chair
      () => {
        const chair = this.scene.add.graphics();
        chair.fillStyle(0x8888ff, 0.4);
        chair.lineStyle(3, 0xaaaaff, 0.8);
        // Seat
        chair.strokeRect(-15, 0, 30, 20);
        chair.fillRect(-15, 0, 30, 20);
        // Backrest
        chair.strokeRect(-15, -25, 30, 25);
        chair.fillRect(-15, -25, 30, 25);
        // Legs
        chair.lineStyle(2, 0xaaaaff, 0.8);
        chair.lineBetween(-12, 20, -12, 32);
        chair.lineBetween(7, 20, 7, 32);
        // Shine effect
        chair.fillStyle(0xffffff, 0.3);
        chair.fillRect(-12, -20, 24, 8);
        return chair;
      },
      // Glass Desk
      () => {
        const desk = this.scene.add.graphics();
        desk.fillStyle(0x8888ff, 0.4);
        desk.lineStyle(3, 0xaaaaff, 0.8);
        // Desktop
        desk.strokeRect(-30, -15, 60, 30);
        desk.fillRect(-30, -15, 60, 30);
        // Legs
        desk.lineStyle(2, 0xaaaaff, 0.8);
        desk.lineBetween(-28, 15, -28, 30);
        desk.lineBetween(22, 15, 22, 30);
        // Glass shine
        desk.fillStyle(0xffffff, 0.4);
        desk.fillRect(-25, -12, 50, 5);
        return desk;
      },
      // Glass Table
      () => {
        const table = this.scene.add.graphics();
        table.fillStyle(0x8888ff, 0.4);
        table.lineStyle(3, 0xaaaaff, 0.8);
        // Tabletop
        table.strokeRect(-35, -5, 70, 10);
        table.fillRect(-35, -5, 70, 10);
        // Legs
        table.lineStyle(2, 0xaaaaff, 0.8);
        table.lineBetween(-32, 5, -32, 25);
        table.lineBetween(24, 5, 24, 25);
        // Reflective surface
        table.fillStyle(0xffffff, 0.5);
        table.fillRect(-35, -5, 70, 3);
        return table;
      },
      // Glass Bed
      () => {
        const bed = this.scene.add.graphics();
        bed.fillStyle(0x8888ff, 0.4);
        bed.lineStyle(3, 0xaaaaff, 0.8);
        // Mattress
        bed.strokeRect(-40, -10, 80, 35);
        bed.fillRect(-40, -10, 80, 35);
        // Headboard
        bed.strokeRect(-40, -30, 10, 30);
        bed.fillRect(-40, -30, 10, 30);
        // Footboard
        bed.strokeRect(30, -20, 10, 30);
        bed.fillRect(30, -20, 10, 30);
        // Glass shine
        bed.fillStyle(0xffffff, 0.4);
        bed.fillRect(-40, -10, 80, 5);
        return bed;
      },
      // Glass Bench
      () => {
        const bench = this.scene.add.graphics();
        bench.fillStyle(0x8888ff, 0.4);
        bench.lineStyle(3, 0xaaaaff, 0.8);
        // Seat
        bench.strokeRect(-40, -8, 80, 16);
        bench.fillRect(-40, -8, 80, 16);
        // Legs
        bench.lineStyle(2, 0xaaaaff, 0.8);
        bench.lineBetween(-35, 8, -35, 26);
        bench.lineBetween(25, 8, 25, 26);
        // Reflective highlights
        bench.fillStyle(0xffffff, 0.5);
        for (let i = 0; i < 5; i++) {
          bench.fillCircle(-30 + i * 15, 0, 3);
        }
        return bench;
      }
    ];

    // Mirror types - ONLY SQUARE mirrors, lighter and more reflective
    const mirrorTypes = [
      // Square mirror - light and reflective
      (x, y, size) => {
        const mirror = this.scene.add.graphics();
        mirror.setPosition(x, y);
        // Silver frame
        mirror.lineStyle(5, 0xc0c0c0, 1);
        mirror.strokeRect(-size, -size, size * 2, size * 2);
        // Light reflective glass surface
        mirror.fillStyle(0xd0e0f0, 0.7);
        mirror.fillRect(-size + 5, -size + 5, size * 2 - 10, size * 2 - 10);
        // Bright shine
        mirror.fillStyle(0xffffff, 0.6);
        mirror.fillRect(-size * 0.7, -size * 0.7, size * 0.8, size * 0.8);
        // Edge highlights
        mirror.lineStyle(2, 0xffffff, 0.5);
        mirror.strokeRect(-size + 5, -size + 5, size * 2 - 10, size * 2 - 10);
        return { graphics: mirror, x, y, size, shape: 'square' };
      }
    ];

    // Create 12-18 mirrors of various shapes (obstacles with reflections)
    const numMirrors = Phaser.Math.Between(12, 18);
    this.mirrors = []; // Store mirrors for reflection updates
    
    for (let i = 0; i < numMirrors; i++) {
      let mirrorX, mirrorY, attempts = 0;
      let validPosition = false;
      
      // Try to find valid position away from bases
      const tileSize = GAME_CONFIG.TILE_SIZE || 80;
      const minDistanceFromBase = tileSize * 2;
      
      while (!validPosition && attempts < 50) {
        mirrorX = Phaser.Math.Between(100, width - 100);
        mirrorY = Phaser.Math.Between(100, height - 100);
        
        if (!this.isNearBase(mirrorX, mirrorY, minDistanceFromBase)) {
          validPosition = true;
        }
        attempts++;
      }
      
      if (!validPosition) continue;
      
      // Random size and type
      const mirrorSize = Phaser.Math.Between(30, 60);
      const mirrorType = Phaser.Utils.Array.GetRandom(mirrorTypes);
      const mirrorObj = mirrorType(mirrorX, mirrorY, mirrorSize);
      
      mirrorObj.graphics.setDepth(5);
      this.effects.push(mirrorObj.graphics);
      this.mirrors.push(mirrorObj);
      
      // Create obstacle for mirror
      const obstacleSize = mirrorObj.shape === 'tall' ? mirrorSize * 1.2 : mirrorSize;
      const obstacle = this.scene.add.circle(mirrorX, mirrorY, obstacleSize, 0x000000, 0);
      this.addObstacle(obstacle);
    }

    // Create 15-20 glass furniture obstacles
    const numFurniture = Phaser.Math.Between(15, 20);
    const tileSize = GAME_CONFIG.TILE_SIZE || 80;
    const minDistanceFromBase = tileSize * 2;
    
    for (let i = 0; i < numFurniture; i++) {
      let furnitureX, furnitureY, attempts = 0;
      let validPosition = false;
      
      while (!validPosition && attempts < 50) {
        furnitureX = Phaser.Math.Between(100, width - 100);
        furnitureY = Phaser.Math.Between(100, height - 100);
        
        if (!this.isNearBase(furnitureX, furnitureY, minDistanceFromBase)) {
          validPosition = true;
        }
        attempts++;
      }
      
      if (!validPosition) continue;
      
      const furnitureType = Phaser.Utils.Array.GetRandom(glassFurnitureTypes);
      const furniture = furnitureType();
      furniture.setPosition(furnitureX, furnitureY);
      furniture.setDepth(5);
      
      this.effects.push(furniture);
      
      // Create obstacle
      const obstacle = this.scene.add.circle(furnitureX, furnitureY, 40, 0x000000, 0);
      this.addObstacle(obstacle);
    }
  }

  // SAND TERRAIN - Desert (vrai terrain sand)
  createSandTerrain(width, height) {
    // Sand ground - couleur sable très clair
    const sand = this.scene.add.graphics();
    sand.fillStyle(0xf5deb3, 1); // Wheat/beige très clair
    sand.fillRect(0, 0, width, height);
    sand.setDepth(0);
    this.effects.push(sand);

    // 1. DUNES VISIBLES (montagnes de sable arrondies)
    const duneCount = Phaser.Math.Between(10, 15);
    for (let i = 0; i < duneCount; i++) {
      const x = Phaser.Math.Between(150, width - 150);
      const y = Phaser.Math.Between(150, height - 150);
      
      if (this.isNearBase(x, y, 250)) continue;
      
      const duneWidth = Phaser.Math.Between(150, 250);
      const duneHeight = Phaser.Math.Between(80, 140);
      
      // Base de la dune (plus foncée)
      const dune = this.scene.add.graphics();
      dune.fillStyle(0xe3c797, 0.8); // Beige doré
      dune.fillEllipse(x, y + duneHeight * 0.2, duneWidth, duneHeight * 0.7);
      
      // Sommet de la dune (plus clair)
      dune.fillStyle(0xf0daa8, 0.9);
      dune.fillEllipse(x, y, duneWidth * 0.8, duneHeight * 0.6);
      
      // Ombre sur le côté
      dune.fillStyle(0xd4b896, 0.5);
      dune.fillEllipse(x + duneWidth * 0.25, y + duneHeight * 0.1, duneWidth * 0.4, duneHeight * 0.5);
      
      dune.setDepth(2);
      this.effects.push(dune);
      
      // Obstacle physique pour la dune
      const duneObstacle = this.scene.add.ellipse(x, y, duneWidth * 0.6, duneHeight * 0.5, 0x000000, 0);
      this.addObstacle(duneObstacle);
    }
    
    // 2. CACTUS (obstacles avec forme organique)
    const cactusCount = Phaser.Math.Between(15, 25);
    for (let i = 0; i < cactusCount; i++) {
      const x = Phaser.Math.Between(100, width - 100);
      const y = Phaser.Math.Between(100, height - 100);
      
      if (this.isNearBase(x, y, 200)) continue;
      
      const cactusHeight = Phaser.Math.Between(40, 70);
      const cactusWidth = Phaser.Math.Between(20, 35);
      
      // Corps du cactus avec forme arrondie (ellipse verticale)
      const cactus = this.scene.add.graphics();
      cactus.fillStyle(0x3a6b35, 1); // Vert cactus
      cactus.fillEllipse(x, y - cactusHeight/2, cactusWidth * 0.9, cactusHeight);
      
      // Segment supérieur plus étroit
      cactus.fillEllipse(x, y - cactusHeight * 0.7, cactusWidth * 0.7, cactusHeight * 0.4);
      
      // Bras latéraux arrondis (parfois)
      if (Math.random() > 0.5) {
        const armY = y - cactusHeight * 0.6;
        const armLength = cactusWidth * 1.3;
        const armThickness = cactusWidth * 0.6;
        // Bras gauche avec courbure
        cactus.fillEllipse(x - armLength/2, armY, armLength, armThickness);
        cactus.fillEllipse(x - armLength * 0.7, armY - armThickness * 0.5, armThickness, armLength * 0.6);
      }
      if (Math.random() > 0.5) {
        const armY = y - cactusHeight * 0.5;
        const armLength = cactusWidth * 1.3;
        const armThickness = cactusWidth * 0.6;
        // Bras droit avec courbure
        cactus.fillEllipse(x + armLength/2, armY, armLength, armThickness);
        cactus.fillEllipse(x + armLength * 0.7, armY - armThickness * 0.4, armThickness, armLength * 0.6);
      }
      
      // Épines (petits traits)
      cactus.lineStyle(2, 0xf4e4c1);
      for (let j = 0; j < 6; j++) {
        const spikeY = y - cactusHeight + (j * cactusHeight / 6);
        cactus.lineBetween(x - cactusWidth/2, spikeY, x - cactusWidth/2 - 8, spikeY);
        cactus.lineBetween(x + cactusWidth/2, spikeY, x + cactusWidth/2 + 8, spikeY);
      }
      
      cactus.setDepth(2);
      this.effects.push(cactus);
      
      // Ajouter comme obstacle physique
      const cactusObstacle = this.scene.add.circle(x, y, Math.max(cactusWidth, cactusHeight) * 0.5, 0x000000, 0);
      this.addObstacle(cactusObstacle);
    }
    
    // 3. TORNADES DE SABLE (2-3 zones permanentes - moins fortes que Wind)
    const sandTornadoCount = Phaser.Math.Between(2, 3);
    for (let i = 0; i < sandTornadoCount; i++) {
      const x = Phaser.Math.Between(200, width - 200);
      const y = Phaser.Math.Between(200, height - 200);
      
      if (this.isNearBase(x, y, 300)) continue;
      
      const radius = Phaser.Math.Between(50, 80); // Plus petites que Wind
      
      // Utiliser createWindPowerZone avec couleur sable et force réduite
      this.createWindPowerZone(x, y, radius, 0xf5deb3, true); // Couleur sable clair, sandTornado=true
    }
    
    // 4. SABLES MOUVANTS (zones de piège - taille variée 1-3 tuiles)
    const quicksandCount = Phaser.Math.Between(5, 8);
    for (let i = 0; i < quicksandCount; i++) {
      const x = Phaser.Math.Between(200, width - 200);
      const y = Phaser.Math.Between(200, height - 200);
      
      if (this.isNearBase(x, y, 250)) continue;
      
      // Taille variée de 1 à 2 tuiles
      const tileSize = GAME_CONFIG.TILE_SIZE;
      const radiusInTiles = Phaser.Math.FloatBetween(1, 2);
      const radius = tileSize * radiusInTiles;
      
      // Zone visuelle (sable plus foncé avec gradient)
      const quicksandZone = this.scene.add.graphics();
      quicksandZone.fillStyle(0xc9a876, 0.8); // Sable foncé
      quicksandZone.fillCircle(x, y, radius);
      
      // Centre plus foncé
      quicksandZone.fillStyle(0xb89968, 0.6);
      quicksandZone.fillCircle(x, y, radius * 0.7);
      
      quicksandZone.setDepth(1);
      this.effects.push(quicksandZone);
      
      // Bordure ondulée animée
      quicksandZone.lineStyle(4, 0xa68a5a, 0.6);
      quicksandZone.strokeCircle(x, y, radius);
      
      // Animation de pulsation pour montrer le danger
      this.scene.tweens.add({
        targets: quicksandZone,
        alpha: { from: 0.8, to: 0.5 },
        duration: 2000,
        yoyo: true,
        repeat: -1
      });
      
      // Ajouter comme hazard (détache esprits + ralentit)
      this.hazards.push({
        type: 'quicksand',
        x: x,
        y: y,
        radius: radius,
        graphics: quicksandZone
      });
    }
    
    // 5. ROCHERS DE SABLE (design amélioré)
    const rockCount = Phaser.Math.Between(8, 12);
    for (let i = 0; i < rockCount; i++) {
      const rockX = Phaser.Math.Between(100, width - 100);
      const rockY = Phaser.Math.Between(100, height - 100);
      
      if (this.isNearBase(rockX, rockY, 200)) continue;
      
      const rockSize = Phaser.Math.Between(35, 60);
      
      // Rocher avec forme irrégulière
      const rock = this.scene.add.graphics();
      rock.fillStyle(0xb8956a, 1); // Beige rocailleux
      
      // Forme irrégulière (polygone)
      rock.beginPath();
      rock.moveTo(rockX, rockY - rockSize * 0.8);
      rock.lineTo(rockX + rockSize * 0.6, rockY - rockSize * 0.4);
      rock.lineTo(rockX + rockSize * 0.7, rockY + rockSize * 0.3);
      rock.lineTo(rockX + rockSize * 0.2, rockY + rockSize * 0.5);
      rock.lineTo(rockX - rockSize * 0.5, rockY + rockSize * 0.4);
      rock.lineTo(rockX - rockSize * 0.6, rockY - rockSize * 0.2);
      rock.closePath();
      rock.fillPath();
      
      // Ombrage pour le relief
      rock.fillStyle(0x9d7f58, 0.5);
      rock.fillCircle(rockX + rockSize * 0.2, rockY + rockSize * 0.1, rockSize * 0.3);
      
      // Highlight (partie ensoleillée)
      rock.fillStyle(0xd4b896, 0.4);
      rock.fillCircle(rockX - rockSize * 0.2, rockY - rockSize * 0.3, rockSize * 0.25);
      
      rock.setDepth(4);
      this.effects.push(rock);
      
      // Obstacle physique
      const rockObstacle = this.scene.add.circle(rockX, rockY, rockSize * 0.5, 0x000000, 0);
      this.addObstacle(rockObstacle);
    }
    
    // Animation de vent de sable (particules horizontales comme Wind)
    for (let i = 0; i < 35; i++) {
      const windX = Phaser.Math.Between(0, width);
      const windY = Phaser.Math.Between(0, height);
      
      // Particule de vent (ligne beige semi-transparente)
      const windParticle = this.scene.add.graphics();
      windParticle.lineStyle(2, 0xd4b896, 0.4); // Couleur sable
      windParticle.lineBetween(0, 0, 25, 0);
      windParticle.setPosition(windX, windY);
      windParticle.setDepth(20);
      
      // Animation de déplacement horizontal
      this.scene.tweens.add({
        targets: windParticle,
        x: windX + 180,
        alpha: 0,
        duration: 2200,
        repeat: -1,
        delay: Math.random() * 2000,
        onRepeat: () => {
          windParticle.x = Phaser.Math.Between(0, width);
          windParticle.y = Phaser.Math.Between(0, height);
          windParticle.alpha = 0.4;
        }
      });
      
      this.effects.push(windParticle);
    }
  }

  // WOOD TERRAIN - Base naturelle visible (utilise les arbres/eau/pierres du maze naturel)
  createWoodTerrain(width, height) {
    // Ancient Forest - Dense avec beaucoup d'arbres
    
    // Grands arbres anciens (25-35 arbres)
    const treeCount = Phaser.Math.Between(25, 35);
    for (let i = 0; i < treeCount; i++) {
      const treeX = Phaser.Math.Between(100, width - 100);
      const treeY = Phaser.Math.Between(100, height - 100);
      
      // Skip if near base
      if (this.isNearBase(treeX, treeY, 200)) {
        continue;
      }
      
      const trunkWidth = Phaser.Math.Between(25, 40);
      const trunkHeight = Phaser.Math.Between(80, 120);
      const crownRadius = Phaser.Math.Between(50, 80);
      
      // Tronc
      const trunk = this.scene.add.rectangle(
        treeX, treeY, 
        trunkWidth, trunkHeight, 
        0x4a3020
      );
      trunk.setDepth(4);
      this.decorations.push(trunk);
      
      // Couronne feuillue (3-4 cercles superposés)
      const crownLayers = Phaser.Math.Between(3, 4);
      for (let layer = 0; layer < crownLayers; layer++) {
        const layerRadius = crownRadius - layer * 10;
        const offsetX = Phaser.Math.Between(-15, 15);
        const offsetY = Phaser.Math.Between(-15, 15);
        const crown = this.scene.add.circle(
          treeX + offsetX,
          treeY - trunkHeight/2 - layerRadius + offsetY,
          layerRadius,
          0x228b22,
          0.8
        );
        crown.setDepth(5);
        this.decorations.push(crown);
      }
      
      // Obstacle du tronc
      const treeObstacle = this.scene.add.rectangle(
        treeX, treeY,
        trunkWidth + 10, trunkHeight + 10,
        0x000000, 0
      );
      this.addObstacle(treeObstacle);
    }
    
    // Petits arbustes (15-20)
    const bushCount = Phaser.Math.Between(15, 20);
    for (let i = 0; i < bushCount; i++) {
      const bushX = Phaser.Math.Between(100, width - 100);
      const bushY = Phaser.Math.Between(100, height - 100);
      
      if (this.isNearBase(bushX, bushY, 150)) {
        continue;
      }
      
      const bushRadius = Phaser.Math.Between(20, 35);
      const bush = this.scene.add.circle(bushX, bushY, bushRadius, 0x2d5016, 1);
      bush.setDepth(3);
      this.decorations.push(bush);
      
      // Petit obstacle
      const bushObstacle = this.scene.add.circle(bushX, bushY, bushRadius + 5, 0x000000, 0);
      this.addObstacle(bushObstacle);
    }
    
    // Souches d'arbres coupés (8-12)
    const stumpCount = Phaser.Math.Between(8, 12);
    for (let i = 0; i < stumpCount; i++) {
      const stumpX = Phaser.Math.Between(100, width - 100);
      const stumpY = Phaser.Math.Between(100, height - 100);
      
      if (this.isNearBase(stumpX, stumpY, 150)) {
        continue;
      }
      
      const stumpRadius = Phaser.Math.Between(25, 40);
      
      // Souche
      const stump = this.scene.add.circle(stumpX, stumpY, stumpRadius, 0x5d4037, 1);
      stump.setDepth(2);
      this.decorations.push(stump);
      
      // Anneaux de croissance
      const rings = this.scene.add.graphics();
      rings.lineStyle(2, 0x3e2723, 0.8);
      for (let r = stumpRadius * 0.3; r < stumpRadius; r += 8) {
        rings.strokeCircle(stumpX, stumpY, r);
      }
      rings.setDepth(2);
      this.decorations.push(rings);
      
      // Obstacle
      const stumpObstacle = this.scene.add.circle(stumpX, stumpY, stumpRadius + 5, 0x000000, 0);
      this.addObstacle(stumpObstacle);
    }
    
    // Rochers couverts de mousse (10-15)
    const rockCount = Phaser.Math.Between(10, 15);
    for (let i = 0; i < rockCount; i++) {
      const rockX = Phaser.Math.Between(100, width - 100);
      const rockY = Phaser.Math.Between(100, height - 100);
      
      if (this.isNearBase(rockX, rockY, 150)) {
        continue;
      }
      
      const rockWidth = Phaser.Math.Between(40, 70);
      const rockHeight = Phaser.Math.Between(30, 50);
      
      // Rocher gris
      const rock = this.scene.add.ellipse(rockX, rockY, rockWidth, rockHeight, 0x696969, 1);
      rock.setDepth(2);
      this.decorations.push(rock);
      
      // Mousse verte sur le rocher
      const moss = this.scene.add.ellipse(
        rockX - rockWidth * 0.2,
        rockY - rockHeight * 0.2,
        rockWidth * 0.5,
        rockHeight * 0.4,
        0x3cb371,
        0.7
      );
      moss.setDepth(2);
      this.decorations.push(moss);
      
      // Obstacle
      const rockObstacle = this.scene.add.ellipse(rockX, rockY, rockWidth + 10, rockHeight + 10, 0x000000, 0);
      this.addObstacle(rockObstacle);
    }
  }

  // PLASMA TERRAIN - Power plant
  createPlasmaTerrain(width, height) {
    // Industrial factory base
    this.createFactoryBase(width, height);
    
    // Trous noirs (vides) - PAS D'OBSTACLES (3-4 trous visuels seulement)
    const voidCount = Phaser.Math.Between(3, 4);
    const voids = [];
    let attempts = 0;
    const maxAttempts = 50;
    
    while (voids.length < voidCount && attempts < maxAttempts) {
      attempts++;
      const voidX = Phaser.Math.Between(200, width - 200);
      const voidY = Phaser.Math.Between(200, height - 200);
      const voidRadius = Phaser.Math.Between(90, 130);
      
      // Skip if near base
      if (this.isNearBase(voidX, voidY, 250)) {
        continue;
      }
      
      // Cercle noir simple - VISUEL SEULEMENT, PAS D'OBSTACLE
      const voidCircle = this.scene.add.circle(voidX, voidY, voidRadius, 0x000000, 1);
      voidCircle.setDepth(1);
      this.effects.push(voidCircle);
      
      voids.push({ x: voidX, y: voidY, radius: voidRadius });
    }
    
    // Ponts longs traversant les trous noirs + obstacles sur les côtés
    voids.forEach((void1) => {
      const bridgeAngle = Math.random() * Math.PI * 2;
      const bridgeLength = void1.radius * 3.0;
      const bridgeWidth = 50;
      
      // Créer les obstacles de chaque côté du pont (parties non couvertes du cercle)
      this.createVoidSideObstacles(void1.x, void1.y, void1.radius, bridgeAngle);
      
      const bridgeCenterX = void1.x;
      const bridgeCenterY = void1.y;
      
      const cos = Math.cos(bridgeAngle);
      const sin = Math.sin(bridgeAngle);
      const halfLength = bridgeLength / 2;
      const halfWidth = bridgeWidth / 2;
      
      const bridge = this.scene.add.graphics();
      bridge.fillStyle(0x708090, 1);
      
      const corners = [
        { x: -halfLength * cos - (-halfWidth) * sin, y: -halfLength * sin + (-halfWidth) * cos },
        { x: halfLength * cos - (-halfWidth) * sin, y: halfLength * sin + (-halfWidth) * cos },
        { x: halfLength * cos - halfWidth * sin, y: halfLength * sin + halfWidth * cos },
        { x: -halfLength * cos - halfWidth * sin, y: -halfLength * sin + halfWidth * cos }
      ];
      
      bridge.beginPath();
      bridge.moveTo(bridgeCenterX + corners[0].x, bridgeCenterY + corners[0].y);
      for (let c = 1; c < corners.length; c++) {
        bridge.lineTo(bridgeCenterX + corners[c].x, bridgeCenterY + corners[c].y);
      }
      bridge.closePath();
      bridge.fillPath();
      
      bridge.fillStyle(0x404040, 1);
      for (let r = -halfLength; r < halfLength; r += 30) {
        const rivetX1 = bridgeCenterX + r * cos - halfWidth * 0.8 * sin;
        const rivetY1 = bridgeCenterY + r * sin + halfWidth * 0.8 * cos;
        const rivetX2 = bridgeCenterX + r * cos + halfWidth * 0.8 * sin;
        const rivetY2 = bridgeCenterY + r * sin - halfWidth * 0.8 * cos;
        
        bridge.fillCircle(rivetX1, rivetY1, 3);
        bridge.fillCircle(rivetX2, rivetY2, 3);
      }
      
      bridge.setDepth(3);
      this.effects.push(bridge);
    });
    
    // Escaliers accélérateurs (3 escaliers) - NON-OBSTACLES
    const stairCount = 3;
    for (let i = 0; i < stairCount; i++) {
      const stairX = Phaser.Math.Between(150, width - 150);
      const stairY = Phaser.Math.Between(150, height - 150);
      const stairWidth = 80;
      const stairHeight = 120;
      const isVertical = Math.random() < 0.5;
      
      const stairs = this.scene.add.graphics();
      stairs.fillStyle(0x808080, 1);
      
      if (isVertical) {
        stairs.fillRect(stairX - stairWidth/2, stairY - stairHeight/2, stairWidth, stairHeight);
        stairs.fillStyle(0x606060, 1);
        for (let s = 0; s < 6; s++) {
          const stepY = stairY - stairHeight/2 + s * (stairHeight/6);
          stairs.fillRect(stairX - stairWidth/2, stepY, stairWidth, 3);
        }
      } else {
        stairs.fillRect(stairX - stairHeight/2, stairY - stairWidth/2, stairHeight, stairWidth);
        stairs.fillStyle(0x606060, 1);
        for (let s = 0; s < 6; s++) {
          const stepX = stairX - stairHeight/2 + s * (stairHeight/6);
          stairs.fillRect(stepX, stairY - stairWidth/2, 3, stairWidth);
        }
      }
      
      stairs.setDepth(3);
      this.effects.push(stairs);
      
      const speedBoost = {
        type: 'speedboost',
        x: stairX,
        y: stairY,
        width: isVertical ? stairWidth : stairHeight,
        height: isVertical ? stairHeight : stairWidth,
        update: (time, delta, players) => {
          players.forEach(player => {
            if (!player.active) return;
            
            const inZone = Math.abs(player.x - speedBoost.x) < speedBoost.width/2 &&
                          Math.abs(player.y - speedBoost.y) < speedBoost.height/2;
            
            if (inZone) {
              if (!player.onStairs) {
                player.onStairs = true;
                player.originalSpeed = player.moveSpeed;
                player.moveSpeed *= 1.5;
              }
            } else if (player.onStairs) {
              player.onStairs = false;
              if (player.originalSpeed) {
                player.moveSpeed = player.originalSpeed;
              }
            }
          });
        }
      };
      
      this.hazards.push(speedBoost);
    }
    
    // Industrial machinery (6-8 machines) - OBSTACLES PHYSIQUES
    for (let i = 0; i < 7; i++) {
      const machineX = Phaser.Math.Between(100, width - 100);
      const machineY = Phaser.Math.Between(100, height - 100);
      const machineSize = Phaser.Math.Between(30, 50);
      
      const machine = this.scene.add.graphics();
      machine.fillStyle(0x4a4a4a, 1);
      machine.fillRect(machineX - machineSize/2, machineY - machineSize, machineSize, machineSize);
      
      // Control panel
      machine.fillStyle(0x1e90ff, 1);
      machine.fillRect(machineX - machineSize/3, machineY - machineSize + 5, machineSize/1.5, 15);
      
      // Warning lights
      const light = this.scene.add.circle(machineX, machineY - machineSize + 12, 3, 0xff0000);
      light.setDepth(6);
      this.effects.push(light);
      
      this.scene.tweens.add({
        targets: light,
        alpha: 0.2,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
      
      machine.setDepth(5);
      this.effects.push(machine);
      
      // OBSTACLE PHYSIQUE
      const machineObstacle = this.scene.add.rectangle(machineX, machineY - machineSize/2, machineSize, machineSize, 0x000000, 0);
      this.addObstacle(machineObstacle);
    }
    
    // Metal crates (4-6) - OBSTACLES PHYSIQUES
    for (let i = 0; i < 5; i++) {
      const crateX = Phaser.Math.Between(100, width - 100);
      const crateY = Phaser.Math.Between(100, height - 100);
      const crateSize = Phaser.Math.Between(25, 40);
      
      const crate = this.scene.add.graphics();
      crate.fillStyle(0x696969, 1);
      crate.fillRect(crateX - crateSize/2, crateY - crateSize, crateSize, crateSize);
      crate.lineStyle(2, 0x404040);
      crate.strokeRect(crateX - crateSize/2, crateY - crateSize, crateSize, crateSize);
      crate.lineStyle(1, 0xffff00);
      // Warning stripes
      for (let s = 0; s < 3; s++) {
        const y = crateY - crateSize + (s * crateSize / 3);
        crate.lineBetween(crateX - crateSize/2, y, crateX + crateSize/2, y);
      }
      crate.setDepth(5);
      this.effects.push(crate);
      
      // OBSTACLE PHYSIQUE
      const crateObstacle = this.scene.add.rectangle(crateX, crateY - crateSize/2, crateSize, crateSize, 0x000000, 0);
      this.addObstacle(crateObstacle);
    }
    
    // Plasma walls/barriers (3-5)
    for (let i = 0; i < 4; i++) {
      const wallX = Phaser.Math.Between(200, width - 200);
      const wallY = Phaser.Math.Between(200, height - 200);
      const wallLength = Phaser.Math.Between(60, 100);
      
      const plasmaWall = this.scene.add.graphics();
      plasmaWall.lineStyle(8, 0xff00ff, 0.8);
      plasmaWall.lineBetween(wallX, wallY, wallX + wallLength, wallY);
      plasmaWall.setDepth(6);
      this.effects.push(plasmaWall);
      
      // Glow effect
      this.scene.tweens.add({
        targets: plasmaWall,
        alpha: 0.4,
        duration: 800,
        yoyo: true,
        repeat: -1
      });
      
      // Hazard - touching removes spirits
      const hazard = {
        type: 'plasmawall',
        x1: wallX,
        y: wallY,
        x2: wallX + wallLength,
        update: (time, delta, players) => {
          players.forEach(player => {
            if (!player.active) return;
            const playerSpirits = this.scene.spirits.filter(s => s.followingPlayer === player);
            if (playerSpirits.length === 0) return;
            
            // Check if player intersects wall
            const nearWall = player.y >= wallY - 10 && player.y <= wallY + 10 &&
                            player.x >= wallX && player.x <= wallX + wallLength;
            
            if (nearWall && Math.random() < 0.03) {
              const spirit = playerSpirits[playerSpirits.length - 1];
              if (spirit) {
                spirit.followingPlayer = null;
                this.scene.tweens.add({
                  targets: spirit,
                  alpha: 0,
                  duration: 300,
                  onComplete: () => spirit.destroy()
                });
              }
            }
          });
        }
      };
      this.hazards.push(hazard);
    }
  }

  // TOXIC TERRAIN - Chemical factory
  createToxicTerrain(width, height) {
    // Same as plasma industrial base
    this.createFactoryBase(width, height);
    
    // Trous noirs (vides) - PAS D'OBSTACLES (3-4 trous visuels seulement)
    const voidCount = Phaser.Math.Between(3, 4);
    const voids = [];
    let attempts = 0;
    const maxAttempts = 50;
    
    while (voids.length < voidCount && attempts < maxAttempts) {
      attempts++;
      const voidX = Phaser.Math.Between(200, width - 200);
      const voidY = Phaser.Math.Between(200, height - 200);
      const voidRadius = Phaser.Math.Between(90, 130);
      
      // Skip if near base
      if (this.isNearBase(voidX, voidY, 250)) {
        continue;
      }
      
      // Cercle noir simple - VISUEL SEULEMENT, PAS D'OBSTACLE
      const voidCircle = this.scene.add.circle(voidX, voidY, voidRadius, 0x000000, 1);
      voidCircle.setDepth(1);
      this.effects.push(voidCircle);
      
      voids.push({ x: voidX, y: voidY, radius: voidRadius });
    }
    
    // Ponts longs traversant les trous noirs + obstacles sur les côtés
    voids.forEach((void1) => {
      const bridgeAngle = Math.random() * Math.PI * 2;
      const bridgeLength = void1.radius * 3.0;
      const bridgeWidth = 50;
      
      // Créer les obstacles de chaque côté du pont (parties non couvertes du cercle)
      this.createVoidSideObstacles(void1.x, void1.y, void1.radius, bridgeAngle);
      
      const bridgeCenterX = void1.x;
      const bridgeCenterY = void1.y;
      
      const cos = Math.cos(bridgeAngle);
      const sin = Math.sin(bridgeAngle);
      const halfLength = bridgeLength / 2;
      const halfWidth = bridgeWidth / 2;
      
      const bridge = this.scene.add.graphics();
      bridge.fillStyle(0x708090, 1);
      
      const corners = [
        { x: -halfLength * cos - (-halfWidth) * sin, y: -halfLength * sin + (-halfWidth) * cos },
        { x: halfLength * cos - (-halfWidth) * sin, y: halfLength * sin + (-halfWidth) * cos },
        { x: halfLength * cos - halfWidth * sin, y: halfLength * sin + halfWidth * cos },
        { x: -halfLength * cos - halfWidth * sin, y: -halfLength * sin + halfWidth * cos }
      ];
      
      bridge.beginPath();
      bridge.moveTo(bridgeCenterX + corners[0].x, bridgeCenterY + corners[0].y);
      for (let c = 1; c < corners.length; c++) {
        bridge.lineTo(bridgeCenterX + corners[c].x, bridgeCenterY + corners[c].y);
      }
      bridge.closePath();
      bridge.fillPath();
      
      bridge.fillStyle(0x404040, 1);
      for (let r = -halfLength; r < halfLength; r += 30) {
        const rivetX1 = bridgeCenterX + r * cos - halfWidth * 0.8 * sin;
        const rivetY1 = bridgeCenterY + r * sin + halfWidth * 0.8 * cos;
        const rivetX2 = bridgeCenterX + r * cos + halfWidth * 0.8 * sin;
        const rivetY2 = bridgeCenterY + r * sin - halfWidth * 0.8 * cos;
        
        bridge.fillCircle(rivetX1, rivetY1, 3);
        bridge.fillCircle(rivetX2, rivetY2, 3);
      }
      
      bridge.setDepth(3);
      this.effects.push(bridge);
    });
    
    // Escaliers accélérateurs (3 escaliers) - NON-OBSTACLES
    const stairCount = 3;
    for (let i = 0; i < stairCount; i++) {
      const stairX = Phaser.Math.Between(150, width - 150);
      const stairY = Phaser.Math.Between(150, height - 150);
      const stairWidth = 80;
      const stairHeight = 120;
      const isVertical = Math.random() < 0.5;
      
      const stairs = this.scene.add.graphics();
      stairs.fillStyle(0x808080, 1);
      
      if (isVertical) {
        stairs.fillRect(stairX - stairWidth/2, stairY - stairHeight/2, stairWidth, stairHeight);
        stairs.fillStyle(0x606060, 1);
        for (let s = 0; s < 6; s++) {
          const stepY = stairY - stairHeight/2 + s * (stairHeight/6);
          stairs.fillRect(stairX - stairWidth/2, stepY, stairWidth, 3);
        }
      } else {
        stairs.fillRect(stairX - stairHeight/2, stairY - stairWidth/2, stairHeight, stairWidth);
        stairs.fillStyle(0x606060, 1);
        for (let s = 0; s < 6; s++) {
          const stepX = stairX - stairHeight/2 + s * (stairHeight/6);
          stairs.fillRect(stepX, stairY - stairWidth/2, 3, stairWidth);
        }
      }
      
      stairs.setDepth(3);
      this.effects.push(stairs);
      
      const speedBoost = {
        type: 'speedboost',
        x: stairX,
        y: stairY,
        width: isVertical ? stairWidth : stairHeight,
        height: isVertical ? stairHeight : stairWidth,
        update: (time, delta, players) => {
          players.forEach(player => {
            if (!player.active) return;
            
            const inZone = Math.abs(player.x - speedBoost.x) < speedBoost.width/2 &&
                          Math.abs(player.y - speedBoost.y) < speedBoost.height/2;
            
            if (inZone) {
              if (!player.onStairs) {
                player.onStairs = true;
                player.originalSpeed = player.moveSpeed;
                player.moveSpeed *= 1.5;
              }
            } else if (player.onStairs) {
              player.onStairs = false;
              if (player.originalSpeed) {
                player.moveSpeed = player.originalSpeed;
              }
            }
          });
        }
      };
      
      this.hazards.push(speedBoost);
    }
    
    // Industrial pipes (4-6) - OBSTACLES PHYSIQUES
    for (let i = 0; i < 5; i++) {
      const pipeX = Phaser.Math.Between(150, width - 150);
      const pipeY = Phaser.Math.Between(150, height - 150);
      const pipeLength = Phaser.Math.Between(60, 120);
      const horizontal = Math.random() > 0.5;
      
      const pipe = this.scene.add.graphics();
      pipe.fillStyle(0x4a4a4a, 1);
      
      if (horizontal) {
        pipe.fillRect(pipeX - pipeLength/2, pipeY - 8, pipeLength, 16);
        // Joints
        pipe.fillCircle(pipeX - pipeLength/2, pipeY, 12);
        pipe.fillCircle(pipeX + pipeLength/2, pipeY, 12);
      } else {
        pipe.fillRect(pipeX - 8, pipeY - pipeLength/2, 16, pipeLength);
        pipe.fillCircle(pipeX, pipeY - pipeLength/2, 12);
        pipe.fillCircle(pipeX, pipeY + pipeLength/2, 12);
      }
      
      pipe.setDepth(5);
      this.effects.push(pipe);
      
      // OBSTACLE PHYSIQUE
      const pipeObstacle = horizontal 
        ? this.scene.add.rectangle(pipeX, pipeY, pipeLength, 16, 0x000000, 0)
        : this.scene.add.rectangle(pipeX, pipeY, 16, pipeLength, 0x000000, 0);
      this.addObstacle(pipeObstacle);
    }
    
    // Metal containers (5-8) - OBSTACLES PHYSIQUES
    for (let i = 0; i < 6; i++) {
      const containerX = Phaser.Math.Between(120, width - 120);
      const containerY = Phaser.Math.Between(120, height - 120);
      
      const container = this.scene.add.graphics();
      container.fillStyle(0x808080, 1);
      container.fillRect(containerX - 35, containerY - 45, 70, 45);
      container.lineStyle(2, 0x606060);
      container.strokeRect(containerX - 35, containerY - 45, 70, 45);
      
      // Hazard markings
      container.lineStyle(3, 0xffff00);
      container.strokeRect(containerX - 30, containerY - 40, 60, 35);
      
      container.setDepth(5);
      this.effects.push(container);
      
      // OBSTACLE PHYSIQUE
      const containerObstacle = this.scene.add.rectangle(containerX, containerY - 22, 70, 45, 0x000000, 0);
      this.addObstacle(containerObstacle);
    }
    
    // Toxic barrels amélio rés (12-15) - OBSTACLES PHYSIQUES
    for (let i = 0; i < 13; i++) {
      const barrelX = Phaser.Math.Between(100, width - 100);
      const barrelY = Phaser.Math.Between(100, height - 100);
      
      const barrel = this.scene.add.graphics();
      
      // Corps du baril (vert toxique avec reflets)
      barrel.fillStyle(0x00ff00, 1);
      barrel.fillRect(barrelX - 18, barrelY - 28, 36, 56);
      
      // Reflet sombre côté gauche
      barrel.fillStyle(0x00cc00, 0.6);
      barrel.fillRect(barrelX - 18, barrelY - 28, 10, 56);
      
      // Reflet clair côté droit
      barrel.fillStyle(0x66ff66, 0.4);
      barrel.fillRect(barrelX + 8, barrelY - 28, 10, 56);
      
      // Bandes métalliques horizontales
      barrel.fillStyle(0x404040, 1);
      barrel.fillRect(barrelX - 18, barrelY - 28, 36, 4);
      barrel.fillRect(barrelX - 18, barrelY - 8, 36, 4);
      barrel.fillRect(barrelX - 18, barrelY + 12, 36, 4);
      barrel.fillRect(barrelX - 18, barrelY + 24, 36, 4);
      
      // Symbole de danger toxique (crâne stylisé)
      barrel.fillStyle(0x000000, 1);
      // Tête du crâne
      barrel.fillCircle(barrelX, barrelY - 10, 10);
      // Yeux
      barrel.fillStyle(0x00ff00, 1);
      barrel.fillCircle(barrelX - 4, barrelY - 12, 3);
      barrel.fillCircle(barrelX + 4, barrelY - 12, 3);
      // Os croisés
      barrel.fillStyle(0x000000, 1);
      barrel.fillRect(barrelX - 8, barrelY + 2, 16, 3);
      barrel.fillRect(barrelX - 1, barrelY - 2, 3, 12);
      
      // Texte "TOXIC"
      barrel.fillStyle(0xffff00, 1);
      barrel.fillRect(barrelX - 10, barrelY + 15, 3, 6);
      barrel.fillRect(barrelX - 10, barrelY + 15, 6, 3);
      barrel.fillRect(barrelX + 4, barrelY + 15, 6, 6);
      
      barrel.setDepth(5);
      this.effects.push(barrel);
      
      // OBSTACLE PHYSIQUE
      const barrelObstacle = this.scene.add.rectangle(barrelX, barrelY, 36, 56, 0x000000, 0);
      this.addObstacle(barrelObstacle);
    }

    // Green toxic puddles (6-10)
    for (let i = 0; i < 8; i++) {
      const puddleX = Phaser.Math.Between(150, width - 150);
      const puddleY = Phaser.Math.Between(150, height - 150);
      const puddleSize = Phaser.Math.Between(40, 70);
      
      const puddle = this.scene.add.graphics();
      puddle.fillStyle(0x00ff00, 0.6);
      puddle.fillEllipse(puddleX, puddleY, puddleSize, puddleSize * 0.7);
      puddle.setDepth(2);
      this.effects.push(puddle);
      
      // Bubbling animation
      this.scene.time.addEvent({
        delay: Phaser.Math.Between(1000, 2000),
        callback: () => {
          const bubble = this.scene.add.circle(
            puddleX + Phaser.Math.Between(-puddleSize/2, puddleSize/2),
            puddleY,
            Phaser.Math.Between(3, 6),
            0x7cfc00,
            0.8
          );
          bubble.setDepth(3);
          
          this.scene.tweens.add({
            targets: bubble,
            y: puddleY - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => bubble.destroy()
          });
        },
        loop: true
      });

      // Toxic damage hazard
      const hazard = {
        type: 'toxicpuddle',
        x: puddleX,
        y: puddleY,
        radius: puddleSize / 2,
        update: (time, delta, players) => {
          players.forEach(player => {
            if (!player.active) return;
            const playerSpirits = this.scene.spirits.filter(s => s.followingPlayer === player);
            if (playerSpirits.length === 0) return;
            
            const dist = Phaser.Math.Distance.Between(puddleX, puddleY, player.x, player.y);
            if (dist < hazard.radius && Math.random() < 0.015) {
              const spirit = playerSpirits[playerSpirits.length - 1];
              if (spirit) {
                spirit.followingPlayer = null;
                this.scene.tweens.add({
                  targets: spirit,
                  alpha: 0,
                  tint: 0x00ff00,
                  duration: 500,
                  onComplete: () => spirit.destroy()
                });
              }
            }
          });
        }
      };
      
      this.hazards.push(hazard);
    }
  }

  // THUNDER TERRAIN - Electric plant
  createThunderTerrain(width, height) {
    // Industrial factory base - same as plasma
    this.createFactoryBase(width, height);
    
    // Trous noirs (vides) - PAS D'OBSTACLES (3-4 trous visuels seulement)
    const voidCount = Phaser.Math.Between(3, 4);
    const voids = [];
    let attempts = 0;
    const maxAttempts = 50;
    
    while (voids.length < voidCount && attempts < maxAttempts) {
      attempts++;
      const voidX = Phaser.Math.Between(200, width - 200);
      const voidY = Phaser.Math.Between(200, height - 200);
      const voidRadius = Phaser.Math.Between(90, 130);
      
      // Skip if near base
      if (this.isNearBase(voidX, voidY, 250)) {
        continue;
      }
      
      // Cercle noir simple - VISUEL SEULEMENT, PAS D'OBSTACLE
      const voidCircle = this.scene.add.circle(voidX, voidY, voidRadius, 0x000000, 1);
      voidCircle.setDepth(1);
      this.effects.push(voidCircle);
      
      voids.push({ x: voidX, y: voidY, radius: voidRadius });
    }
    
    // Ponts longs traversant les trous noirs + obstacles sur les côtés
    voids.forEach((void1) => {
      const bridgeAngle = Math.random() * Math.PI * 2;
      const bridgeLength = void1.radius * 3.0;
      const bridgeWidth = 50;
      
      // Créer les obstacles de chaque côté du pont (parties non couvertes du cercle)
      this.createVoidSideObstacles(void1.x, void1.y, void1.radius, bridgeAngle);
      
      const bridgeCenterX = void1.x;
      const bridgeCenterY = void1.y;
      
      const cos = Math.cos(bridgeAngle);
      const sin = Math.sin(bridgeAngle);
      const halfLength = bridgeLength / 2;
      const halfWidth = bridgeWidth / 2;
      
      const bridge = this.scene.add.graphics();
      bridge.fillStyle(0x708090, 1);
      
      const corners = [
        { x: -halfLength * cos - (-halfWidth) * sin, y: -halfLength * sin + (-halfWidth) * cos },
        { x: halfLength * cos - (-halfWidth) * sin, y: halfLength * sin + (-halfWidth) * cos },
        { x: halfLength * cos - halfWidth * sin, y: halfLength * sin + halfWidth * cos },
        { x: -halfLength * cos - halfWidth * sin, y: -halfLength * sin + halfWidth * cos }
      ];
      
      bridge.beginPath();
      bridge.moveTo(bridgeCenterX + corners[0].x, bridgeCenterY + corners[0].y);
      for (let c = 1; c < corners.length; c++) {
        bridge.lineTo(bridgeCenterX + corners[c].x, bridgeCenterY + corners[c].y);
      }
      bridge.closePath();
      bridge.fillPath();
      
      bridge.fillStyle(0x404040, 1);
      for (let r = -halfLength; r < halfLength; r += 30) {
        const rivetX1 = bridgeCenterX + r * cos - halfWidth * 0.8 * sin;
        const rivetY1 = bridgeCenterY + r * sin + halfWidth * 0.8 * cos;
        const rivetX2 = bridgeCenterX + r * cos + halfWidth * 0.8 * sin;
        const rivetY2 = bridgeCenterY + r * sin - halfWidth * 0.8 * cos;
        
        bridge.fillCircle(rivetX1, rivetY1, 3);
        bridge.fillCircle(rivetX2, rivetY2, 3);
      }
      
      bridge.setDepth(3);
      this.effects.push(bridge);
    });
    
    // Escaliers accélérateurs (3 escaliers) - NON-OBSTACLES
    const stairCount = 3;
    for (let i = 0; i < stairCount; i++) {
      const stairX = Phaser.Math.Between(150, width - 150);
      const stairY = Phaser.Math.Between(150, height - 150);
      const stairWidth = 80;
      const stairHeight = 120;
      const isVertical = Math.random() < 0.5;
      
      const stairs = this.scene.add.graphics();
      stairs.fillStyle(0x808080, 1);
      
      if (isVertical) {
        stairs.fillRect(stairX - stairWidth/2, stairY - stairHeight/2, stairWidth, stairHeight);
        stairs.fillStyle(0x606060, 1);
        for (let s = 0; s < 6; s++) {
          const stepY = stairY - stairHeight/2 + s * (stairHeight/6);
          stairs.fillRect(stairX - stairWidth/2, stepY, stairWidth, 3);
        }
      } else {
        stairs.fillRect(stairX - stairHeight/2, stairY - stairWidth/2, stairHeight, stairWidth);
        stairs.fillStyle(0x606060, 1);
        for (let s = 0; s < 6; s++) {
          const stepX = stairX - stairHeight/2 + s * (stairHeight/6);
          stairs.fillRect(stepX, stairY - stairWidth/2, 3, stairWidth);
        }
      }
      
      stairs.setDepth(3);
      this.effects.push(stairs);
      
      const speedBoost = {
        type: 'speedboost',
        x: stairX,
        y: stairY,
        width: isVertical ? stairWidth : stairHeight,
        height: isVertical ? stairHeight : stairWidth,
        update: (time, delta, players) => {
          players.forEach(player => {
            if (!player.active) return;
            
            const inZone = Math.abs(player.x - speedBoost.x) < speedBoost.width/2 &&
                          Math.abs(player.y - speedBoost.y) < speedBoost.height/2;
            
            if (inZone) {
              if (!player.onStairs) {
                player.onStairs = true;
                player.originalSpeed = player.moveSpeed;
                player.moveSpeed *= 1.5;
              }
            } else if (player.onStairs) {
              player.onStairs = false;
              if (player.originalSpeed) {
                player.moveSpeed = player.originalSpeed;
              }
            }
          });
        }
      };
      
      this.hazards.push(speedBoost);
    }
    
    // Large transformers (4-6) - OBSTACLES PHYSIQUES
    for (let i = 0; i < 5; i++) {
      const transX = Phaser.Math.Between(150, width - 150);
      const transY = Phaser.Math.Between(150, height - 150);
      
      const transformer = this.scene.add.graphics();
      transformer.fillStyle(0x4a4a4a, 1);
      transformer.fillRect(transX - 30, transY - 50, 60, 50);
      
      // Cooling fins
      transformer.lineStyle(2, 0x606060);
      for (let f = 0; f < 5; f++) {
        const finY = transY - 45 + (f * 10);
        transformer.lineBetween(transX - 30, finY, transX - 35, finY);
        transformer.lineBetween(transX + 30, finY, transX + 35, finY);
      }
      
      transformer.setDepth(5);
      this.effects.push(transformer);
      
      // OBSTACLE PHYSIQUE
      const transformerObstacle = this.scene.add.rectangle(transX, transY - 25, 60, 50, 0x000000, 0);
      this.addObstacle(transformerObstacle);
    }
    
    // Add lightning generators (6-8 machines) - OBSTACLES PHYSIQUES
    const machineCount = Phaser.Math.Between(6, 8);
    for (let i = 0; i < machineCount; i++) {
      const machineX = Phaser.Math.Between(120, width - 120);
      const machineY = Phaser.Math.Between(120, height - 120);
      
      // Machine body
      const machine = this.scene.add.graphics();
      machine.fillStyle(0x4a4a4a, 1);
      machine.fillRect(machineX - 25, machineY - 30, 50, 60);
      machine.setDepth(5);
      this.effects.push(machine);
      
      // Lightning rod
      machine.lineStyle(3, 0xffff00);
      machine.lineBetween(machineX, machineY - 30, machineX, machineY - 60);
      
      // Electric coils
      machine.fillStyle(0xffd700, 1);
      machine.fillCircle(machineX, machineY - 60, 8);
      
      // OBSTACLE PHYSIQUE
      const machineObstacle = this.scene.add.rectangle(machineX, machineY, 50, 60, 0x000000, 0);
      this.addObstacle(machineObstacle);
      
      // Sparks animation
      this.scene.time.addEvent({
        delay: Phaser.Math.Between(800, 1500),
        callback: () => {
          const spark = this.scene.add.circle(
            machineX + Phaser.Math.Between(-5, 5),
            machineY - 60,
            Phaser.Math.Between(2, 4),
            0xffff00
          );
          spark.setDepth(7);
          
          this.scene.tweens.add({
            targets: spark,
            y: spark.y - 20,
            alpha: 0,
            duration: 300,
            onComplete: () => spark.destroy()
          });
        },
        loop: true
      });
    }
    
    // Electric cables between machines (5-8)
    for (let i = 0; i < 6; i++) {
      const cable1X = Phaser.Math.Between(100, width - 100);
      const cable1Y = Phaser.Math.Between(100, height - 100);
      const cable2X = cable1X + Phaser.Math.Between(80, 150);
      const cable2Y = cable1Y + Phaser.Math.Between(-50, 50);
      
      const cable = this.scene.add.graphics();
      cable.lineStyle(3, 0x404040);
      cable.lineBetween(cable1X, cable1Y, cable2X, cable2Y);
      cable.setDepth(4);
      this.effects.push(cable);
      
      // Electrical arc along cable
      this.scene.time.addEvent({
        delay: Phaser.Math.Between(2000, 4000),
        callback: () => {
          const arcProgress = Math.random();
          const arcX = cable1X + (cable2X - cable1X) * arcProgress;
          const arcY = cable1Y + (cable2Y - cable1Y) * arcProgress;
          
          const arc = this.scene.add.circle(arcX, arcY, 8, 0x00ffff, 0.8);
          arc.setDepth(20);
          
          this.scene.tweens.add({
            targets: arc,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => arc.destroy()
          });
        },
        loop: true
      });
    }

    // Frequent visible lightning strikes
    this.createLightningHazard(width, height);
  }

  // SHADOW TERRAIN - Void wasteland
  createShadowTerrain(width, height) {
    // Dark gray ground
    const ground = this.scene.add.graphics();
    ground.fillStyle(0x1c1c1c, 1);
    ground.fillRect(0, 0, width, height);
    ground.setDepth(0);
    this.effects.push(ground);

    // Darker patches
    for (let i = 0; i < 15; i++) {
      const patchX = Phaser.Math.Between(0, width);
      const patchY = Phaser.Math.Between(0, height);
      const patchSize = Phaser.Math.Between(60, 120);
      
      const patch = this.scene.add.graphics();
      patch.fillStyle(0x0a0a0a, 0.6);
      patch.fillCircle(patchX, patchY, patchSize);
      patch.setDepth(1);
      this.effects.push(patch);
    }

    // Cercles noirs OBSTACLES PHYSIQUES (15-20)
    const circleCount = Phaser.Math.Between(15, 20);
    for (let i = 0; i < circleCount; i++) {
      const circleX = Phaser.Math.Between(100, width - 100);
      const circleY = Phaser.Math.Between(100, height - 100);
      const circleRadius = Phaser.Math.Between(20, 40);
      
      if (this.isNearBase(circleX, circleY, 200)) continue;
      
      // Cercle noir visuel
      const circle = this.scene.add.circle(circleX, circleY, circleRadius, 0x000000, 1);
      circle.setDepth(3);
      this.effects.push(circle);
      
      // OBSTACLE PHYSIQUE
      const circleObstacle = this.scene.add.circle(circleX, circleY, circleRadius, 0x000000, 0);
      this.addObstacle(circleObstacle);
    }

    // Rocky terrain like earth/fire mix (8-12 rocks) - OBSTACLES PHYSIQUES
    for (let i = 0; i < 10; i++) {
      const rockX = Phaser.Math.Between(50, width - 50);
      const rockY = Phaser.Math.Between(50, height - 50);
      const rockSize = Phaser.Math.Between(30, 60);
      
      const rock = this.scene.add.graphics();
      rock.fillStyle(0x2f2f2f, 1);
      rock.beginPath();
      rock.moveTo(rockX, rockY - rockSize);
      rock.lineTo(rockX + rockSize * 0.6, rockY + rockSize * 0.3);
      rock.lineTo(rockX - rockSize * 0.6, rockY + rockSize * 0.3);
      rock.closePath();
      rock.fillPath();
      rock.setDepth(5);
      this.effects.push(rock);
      
      // OBSTACLE PHYSIQUE
      const rockObstacle = this.scene.add.triangle(
        rockX, rockY - rockSize/3,
        0, -rockSize * 0.5,
        rockSize * 0.5, rockSize * 0.3,
        -rockSize * 0.5, rockSize * 0.3,
        0x000000, 0
      );
      this.addObstacle(rockObstacle);
    }

    // TROUS NOIRS VOID avec effet Shadow (3-4 zones permanentes)
    const blackHoleCount = Phaser.Math.Between(3, 4);
    for (let i = 0; i < blackHoleCount; i++) {
      const bhX = Phaser.Math.Between(300, width - 300);
      const bhY = Phaser.Math.Between(300, height - 300);
      
      // Skip if near base
      if (this.isNearBase(bhX, bhY, 350)) continue;
      
      const disappearRadius = GAME_CONFIG.TILE_SIZE * 1.2; // Plus petit
      const magnetRadius = GAME_CONFIG.TILE_SIZE * 4; // Zone magnétique réduite
      
      // DESIGN AMÉLIORÉ du trou noir void
      // Cercle extérieur gris sombre (aura)
      const outerRing = this.scene.add.circle(bhX, bhY, disappearRadius + 15, 0x4a4a4a, 0.4);
      outerRing.setDepth(98);
      this.effects.push(outerRing);
      
      // Spirale grise animée
      const spiral = this.scene.add.graphics();
      spiral.lineStyle(3, 0x666666, 0.7);
      for (let angle = 0; angle < Math.PI * 6; angle += 0.2) {
        const r = (angle / (Math.PI * 6)) * disappearRadius;
        const x = bhX + Math.cos(angle) * r;
        const y = bhY + Math.sin(angle) * r;
        if (angle === 0) {
          spiral.beginPath();
          spiral.moveTo(x, y);
        } else {
          spiral.lineTo(x, y);
        }
      }
      spiral.strokePath();
      spiral.setDepth(100);
      this.effects.push(spiral);
      
      // Centre gris profond (différent des obstacles)
      const blackHole = this.scene.add.circle(bhX, bhY, disappearRadius, 0x2a2a2a, 1);
      blackHole.setDepth(101);
      this.effects.push(blackHole);
      
      // Particules grises tourbillonnantes
      for (let p = 0; p < 8; p++) {
        const particle = this.scene.add.circle(
          bhX + Math.cos(p) * disappearRadius,
          bhY + Math.sin(p) * disappearRadius,
          3,
          0x666666,
          0.8
        );
        particle.setDepth(102);
        this.effects.push(particle);
        
        // Animation orbitale
        this.scene.tweens.add({
          targets: particle,
          x: bhX,
          y: bhY,
          duration: 3000,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
      
      // Zone de magnétisme (cercle gris transparent)
      const magnetZone = this.scene.add.circle(bhX, bhY, magnetRadius, 0x4a4a4a, 0.15);
      magnetZone.setDepth(99);
      this.effects.push(magnetZone);
      
      // Animation de rotation de la spirale
      this.scene.tweens.add({
        targets: [spiral, outerRing],
        rotation: -Math.PI * 2,
        duration: 8000,
        repeat: -1
      });
      
      // Pulsation du centre
      this.scene.tweens.add({
        targets: blackHole,
        scale: { from: 1, to: 1.1 },
        alpha: { from: 1, to: 0.8 },
        duration: 2000,
        yoyo: true,
        repeat: -1
      });
      
      // Ajouter hazard avec mêmes caractéristiques que shadowPower
      this.hazards.push({
        type: 'shadowPower',
        x: bhX,
        y: bhY,
        radius: disappearRadius,
        magnetRadius: magnetRadius,
        magnetize: true,
        immuneType: 'shadow', // Shadow est immunisé
        graphics: blackHole,
        duration: Infinity,
        elapsed: 0
      });
    }
  }

  // LIGHT TERRAIN - Ancient temple
  createLightTerrain(width, height) {
    // Grey-blue marble floor
    const marble = this.scene.add.graphics();
    marble.fillStyle(0x778899, 1);
    marble.fillRect(0, 0, width, height);
    
    // Marble tiles pattern with lighter lines
    marble.lineStyle(2, 0x98a8b8, 0.6);
    for (let x = 0; x < width; x += 80) {
      marble.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 80) {
      marble.lineBetween(0, y, width, y);
    }
    
    marble.setDepth(0);
    this.effects.push(marble);

    // 5 types of ruin obstacles
    
    // Type 1: Broken columns (4-6) - OBSTACLES PHYSIQUES
    for (let i = 0; i < 5; i++) {
      const colX = Phaser.Math.Between(100, width - 100);
      const colY = Phaser.Math.Between(100, height - 100);
      
      const column = this.scene.add.graphics();
      column.fillStyle(0xffffff, 1);
      column.fillRect(colX - 15, colY - 60, 30, 60);
      
      // Fluting
      column.lineStyle(1, 0xe6e6fa);
      for (let f = 0; f < 5; f++) {
        column.lineBetween(colX - 10 + f * 5, colY - 60, colX - 10 + f * 5, colY);
      }
      
      // Capital
      column.fillStyle(0xfffacd, 1);
      column.fillRect(colX - 20, colY - 70, 40, 10);
      
      column.setDepth(5);
      this.effects.push(column);
      
      // OBSTACLE PHYSIQUE
      const columnObstacle = this.scene.add.rectangle(colX, colY - 30, 30, 60, 0x000000, 0);
      this.addObstacle(columnObstacle);
    }

    // Type 2: Fallen arches (3-4) - OBSTACLES PHYSIQUES
    for (let i = 0; i < 3; i++) {
      const archX = Phaser.Math.Between(150, width - 150);
      const archY = Phaser.Math.Between(150, height - 150);
      
      const arch = this.scene.add.graphics();
      arch.lineStyle(8, 0xffffff);
      arch.strokeCircle(archX, archY, 40);
      arch.fillStyle(0xffffff, 1);
      arch.fillRect(archX - 50, archY, 20, 40);
      arch.fillRect(archX + 30, archY, 20, 40);
      arch.setDepth(5);
      this.effects.push(arch);
      
      // OBSTACLE PHYSIQUE
      const archObstacle = this.scene.add.circle(archX, archY, 40, 0x000000, 0);
      this.addObstacle(archObstacle);
    }

    // Type 3: Stone pedestals (4-5) - OBSTACLES PHYSIQUES
    for (let i = 0; i < 4; i++) {
      const pedX = Phaser.Math.Between(100, width - 100);
      const pedY = Phaser.Math.Between(100, height - 100);
      
      const pedestal = this.scene.add.graphics();
      pedestal.fillStyle(0xf0e68c, 1);
      pedestal.fillRect(pedX - 25, pedY - 15, 50, 30);
      pedestal.fillStyle(0xffffff, 1);
      pedestal.fillRect(pedX - 20, pedY - 30, 40, 15);
      pedestal.setDepth(5);
      this.effects.push(pedestal);
      
      // OBSTACLE PHYSIQUE
      const pedestalObstacle = this.scene.add.rectangle(pedX, pedY - 7, 50, 30, 0x000000, 0);
      this.addObstacle(pedestalObstacle);
    }

    // Type 4: Altar pieces (2-3) - OBSTACLES PHYSIQUES
    for (let i = 0; i < 2; i++) {
      const altarX = Phaser.Math.Between(200, width - 200);
      const altarY = Phaser.Math.Between(200, height - 200);
      
      const altar = this.scene.add.graphics();
      altar.fillStyle(0xfffacd, 1);
      altar.fillRect(altarX - 40, altarY - 20, 80, 40);
      
      // Steps
      altar.fillStyle(0xffffff, 1);
      altar.fillRect(altarX - 50, altarY + 20, 100, 10);
      altar.fillRect(altarX - 45, altarY + 30, 90, 10);
      
      altar.setDepth(5);
      this.effects.push(altar);
      
      // OBSTACLE PHYSIQUE
      const altarObstacle = this.scene.add.rectangle(altarX, altarY, 80, 40, 0x000000, 0);
      this.addObstacle(altarObstacle);
    }

    // Type 5: Broken walls (3-4) - OBSTACLES PHYSIQUES
    for (let i = 0; i < 3; i++) {
      const wallX = Phaser.Math.Between(100, width - 100);
      const wallY = Phaser.Math.Between(100, height - 100);
      
      const wall = this.scene.add.graphics();
      wall.fillStyle(0xffffff, 1);
      
      // Irregular broken top
      wall.beginPath();
      wall.moveTo(wallX, wallY - 50);
      wall.lineTo(wallX + 20, wallY - 45);
      wall.lineTo(wallX + 25, wallY - 55);
      wall.lineTo(wallX + 40, wallY - 40);
      wall.lineTo(wallX + 60, wallY - 50);
      wall.lineTo(wallX + 60, wallY);
      wall.lineTo(wallX, wallY);
      wall.closePath();
      wall.fillPath();
      
      wall.setDepth(5);
      this.effects.push(wall);
      
      // OBSTACLE PHYSIQUE
      const wallObstacle = this.scene.add.rectangle(wallX + 30, wallY - 25, 60, 50, 0x000000, 0);
      this.addObstacle(wallObstacle);
    }

    // Cercles de lumière intense avec ponts lumineux (2-3)
    const lightCircleCount = Phaser.Math.Between(2, 3);
    const lightCircles = [];
    let attempts = 0;
    const maxAttempts = 50;
    
    while (lightCircles.length < lightCircleCount && attempts < maxAttempts) {
      attempts++;
      const lcX = Phaser.Math.Between(250, width - 250);
      const lcY = Phaser.Math.Between(250, height - 250);
      const lcRadius = Phaser.Math.Between(90, 130);
      
      // Skip if near base
      if (this.isNearBase(lcX, lcY, 250)) {
        continue;
      }
      
      // Cercle lumineux blanc
      const lightCircle = this.scene.add.circle(lcX, lcY, lcRadius, 0xffffff, 0.8);
      lightCircle.setDepth(1);
      this.effects.push(lightCircle);
      
      lightCircles.push({ x: lcX, y: lcY, radius: lcRadius });
    }
    
    // Ponts lumineux traversant les cercles
    lightCircles.forEach((lc) => {
      const bridgeAngle = Math.random() * Math.PI * 2;
      this.createBridgeWithHazardZone('light', lc.x, lc.y, lc.radius, bridgeAngle, 0xffffff);
    });

    // Light beam hazards (rare, 1-2)
    this.createLightBeams(width, height);
  }

  // IRON TERRAIN - Steel mill
  // IRON TERRAIN - Industrial factory  
  createIronTerrain(width, height) {
    // Industrial factory base
    this.createFactoryBase(width, height);
    
    // Trous noirs (vides) - PAS D'OBSTACLES (5-7 trous visuels seulement)
    const voidCount = Phaser.Math.Between(5, 7);
    const voids = [];
    let attempts = 0;
    const maxAttempts = 100;
    
    while (voids.length < voidCount && attempts < maxAttempts) {
      attempts++;
      const voidX = Phaser.Math.Between(200, width - 200);
      const voidY = Phaser.Math.Between(200, height - 200);
      const voidRadius = Phaser.Math.Between(90, 130);
      
      // Skip if near base
      if (this.isNearBase(voidX, voidY, 250)) {
        continue;
      }
      
      // Cercle noir simple - VISUEL SEULEMENT, PAS D'OBSTACLE
      const voidCircle = this.scene.add.circle(voidX, voidY, voidRadius, 0x000000, 1);
      voidCircle.setDepth(1);
      this.effects.push(voidCircle);
      
      voids.push({ x: voidX, y: voidY, radius: voidRadius });
    }
    
    // Ponts longs traversant les trous noirs + obstacles sur les côtés
    voids.forEach((void1) => {
      const bridgeAngle = Math.random() * Math.PI * 2;
      const bridgeLength = void1.radius * 3.0;
      const bridgeWidth = 50;
      
      // Créer les obstacles de chaque côté du pont (parties non couvertes du cercle)
      this.createVoidSideObstacles(void1.x, void1.y, void1.radius, bridgeAngle);
      
      const bridgeCenterX = void1.x;
      const bridgeCenterY = void1.y;
      
      // Calculer les 4 coins du rectangle tourné
      const cos = Math.cos(bridgeAngle);
      const sin = Math.sin(bridgeAngle);
      const halfLength = bridgeLength / 2;
      const halfWidth = bridgeWidth / 2;
      
      // Pont métallique avec rectangle tourné
      const bridge = this.scene.add.graphics();
      bridge.fillStyle(0x708090, 1);
      
      // Dessiner le pont comme un polygone tourné
      const corners = [
        { x: -halfLength * cos - (-halfWidth) * sin, y: -halfLength * sin + (-halfWidth) * cos },
        { x: halfLength * cos - (-halfWidth) * sin, y: halfLength * sin + (-halfWidth) * cos },
        { x: halfLength * cos - halfWidth * sin, y: halfLength * sin + halfWidth * cos },
        { x: -halfLength * cos - halfWidth * sin, y: -halfLength * sin + halfWidth * cos }
      ];
      
      bridge.beginPath();
      bridge.moveTo(bridgeCenterX + corners[0].x, bridgeCenterY + corners[0].y);
      for (let c = 1; c < corners.length; c++) {
        bridge.lineTo(bridgeCenterX + corners[c].x, bridgeCenterY + corners[c].y);
      }
      bridge.closePath();
      bridge.fillPath();
      
      // Rivets le long du pont
      bridge.fillStyle(0x404040, 1);
      for (let r = -halfLength; r < halfLength; r += 30) {
        const rivetX1 = bridgeCenterX + r * cos - halfWidth * 0.8 * sin;
        const rivetY1 = bridgeCenterY + r * sin + halfWidth * 0.8 * cos;
        const rivetX2 = bridgeCenterX + r * cos + halfWidth * 0.8 * sin;
        const rivetY2 = bridgeCenterY + r * sin - halfWidth * 0.8 * cos;
        
        bridge.fillCircle(rivetX1, rivetY1, 3);
        bridge.fillCircle(rivetX2, rivetY2, 3);
      }
      
      bridge.setDepth(3);
      this.effects.push(bridge);
    });
    
    // Escaliers accélérateurs (4-5 escaliers) - NON-OBSTACLES
    const stairCount = Phaser.Math.Between(4, 5);
    for (let i = 0; i < stairCount; i++) {
      const stairX = Phaser.Math.Between(150, width - 150);
      const stairY = Phaser.Math.Between(150, height - 150);
      const stairWidth = 80;
      const stairHeight = 120;
      const isVertical = Math.random() < 0.5;
      
      // Escalier métallique
      const stairs = this.scene.add.graphics();
      stairs.fillStyle(0x808080, 1);
      
      if (isVertical) {
        // Escalier vertical
        stairs.fillRect(stairX - stairWidth/2, stairY - stairHeight/2, stairWidth, stairHeight);
        
        // Marches
        stairs.fillStyle(0x606060, 1);
        for (let s = 0; s < 6; s++) {
          const stepY = stairY - stairHeight/2 + s * (stairHeight/6);
          stairs.fillRect(stairX - stairWidth/2, stepY, stairWidth, 3);
        }
      } else {
        // Escalier horizontal
        stairs.fillRect(stairX - stairHeight/2, stairY - stairWidth/2, stairHeight, stairWidth);
        
        // Marches
        stairs.fillStyle(0x606060, 1);
        for (let s = 0; s < 6; s++) {
          const stepX = stairX - stairHeight/2 + s * (stairHeight/6);
          stairs.fillRect(stepX, stairY - stairWidth/2, 3, stairWidth);
        }
      }
      
      stairs.setDepth(3);
      this.effects.push(stairs);
      
      // Zone d'accélération (hazard qui booste la vitesse)
      const speedBoost = {
        type: 'speedboost',
        x: stairX,
        y: stairY,
        width: isVertical ? stairWidth : stairHeight,
        height: isVertical ? stairHeight : stairWidth,
        isVertical: isVertical,
        update: (time, delta, players) => {
          players.forEach(player => {
            if (!player.active) return;
            
            const inZone = Math.abs(player.x - speedBoost.x) < speedBoost.width/2 &&
                          Math.abs(player.y - speedBoost.y) < speedBoost.height/2;
            
            if (inZone) {
              // Accélération de 50%
              if (!player.onStairs) {
                player.onStairs = true;
                player.originalSpeed = player.moveSpeed;
                player.moveSpeed *= 1.5;
              }
            } else if (player.onStairs) {
              // Restaurer vitesse normale
              player.onStairs = false;
              if (player.originalSpeed) {
                player.moveSpeed = player.originalSpeed;
              }
            }
          });
        }
      };
      
      this.hazards.push(speedBoost);
    }
    
    // Magnetic machines (max 3) - OBSTACLES PHYSIQUES + Pouvoir magnétisme PERMANENT
    const machineCount = 3;
    for (let i = 0; i < machineCount; i++) {
      let machineX, machineY, attempts = 0;
      // Influence de 2-3 tuiles (TILE_SIZE * 2.5 = 200px en moyenne)
      const magnetRadius = GAME_CONFIG.TILE_SIZE * Phaser.Math.FloatBetween(2, 3);
      
      do {
        machineX = Phaser.Math.Between(250, width - 250);
        machineY = Phaser.Math.Between(250, height - 250);
        attempts++;
      } while (this.isNearBase(machineX, machineY, 250) && attempts < 50);
      
      if (attempts >= 50) continue;
      
      // Machine body
      const machine = this.scene.add.graphics();
      machine.fillStyle(0x708090, 1);
      machine.fillRect(machineX - 30, machineY - 40, 60, 80);
      
      // Magnet coils
      machine.fillStyle(0xff4500, 1);
      machine.fillCircle(machineX, machineY - 40, 15);
      machine.fillStyle(0x4169e1, 1);
      machine.fillCircle(machineX, machineY + 40, 15);
      
      // N and S labels
      machine.fillStyle(0xffffff, 1);
      machine.setDepth(5);
      this.effects.push(machine);
      
      // OBSTACLE PHYSIQUE
      const machineObstacle = this.scene.add.rectangle(machineX, machineY, 60, 80, 0x000000, 0);
      this.addObstacle(machineObstacle);
      
      // Magnetic field visual
      const field = this.scene.add.circle(machineX, machineY, magnetRadius, 0x4682b4, 0.1);
      field.setDepth(2);
      this.effects.push(field);
      
      this.scene.tweens.add({
        targets: field,
        alpha: 0.05,
        duration: 1500,
        yoyo: true,
        repeat: -1
      });

      // Magnetic attraction hazard - MAGNETISME PERMANENT
      const hazard = {
        type: 'magneticmachine',
        x: machineX,
        y: machineY,
        radius: magnetRadius,
        update: (time, delta, players) => {
          // La machine magnétique attire TOUS les esprits dans sa zone d'influence
          // Parcourir tous les joueurs pour trouver leurs esprits
          players.forEach(player => {
            if (!player.active || !player.spirits) return;
            
            // Attirer tous les esprits du joueur vers la machine
            player.spirits.forEach(spirit => {
              if (!spirit || !spirit.active) return;
              
              const spiritDist = Phaser.Math.Distance.Between(
                machineX, machineY, spirit.x, spirit.y
              );
              
              // Si l'esprit est dans la zone d'influence de la machine
              if (spiritDist < hazard.radius) {
                // Calculer l'attraction vers la machine
                const attractAngle = Phaser.Math.Angle.Between(
                  spirit.x, spirit.y, machineX, machineY
                );
                const pullStrength = 1.5 * (1 - spiritDist / hazard.radius);
                
                // Attirer l'esprit vers la machine
                spirit.x += Math.cos(attractAngle) * pullStrength;
                spirit.y += Math.sin(attractAngle) * pullStrength;
                
                // Si l'esprit est très proche de la machine, le coller définitivement SANS le détruire
                if (spiritDist < 50 && spirit.followingPlayer) {
                  // Détacher l'esprit du joueur
                  const index = spirit.followingPlayer.spirits.indexOf(spirit);
                  if (index > -1) {
                    spirit.followingPlayer.spirits.splice(index, 1);
                  }
                  spirit.followingPlayer = null;
                  
                  // Marquer l'esprit comme collé à la machine (pour éviter de le retraiter)
                  spirit.stuckToMachine = true;
                  
                  // Positionner l'esprit autour de la machine (disposition circulaire)
                  if (!hazard.attachedSpirits) {
                    hazard.attachedSpirits = [];
                  }
                  
                  const spiritIndex = hazard.attachedSpirits.length;
                  const angle = (spiritIndex / 6) * Math.PI * 2; // 6 esprits max par cercle
                  const orbitRadius = 30 + Math.floor(spiritIndex / 6) * 20; // Cercles concentriques
                  
                  const targetX = machineX + Math.cos(angle) * orbitRadius;
                  const targetY = machineY + Math.sin(angle) * orbitRadius;
                  
                  hazard.attachedSpirits.push(spirit);
                  
                  // Animation vers la position autour de la machine
                  this.scene.tweens.add({
                    targets: spirit,
                    x: targetX,
                    y: targetY,
                    scale: 0.8,
                    duration: 300,
                    ease: 'Power2'
                  });
                }
              }
            });
          });
        }
      };
      
      this.hazards.push(hazard);
    }
  }

  // GOLD TERRAIN - Treasure vault
  createGoldTerrain(width, height) {
    // Golden floor
    const floor = this.scene.add.graphics();
    floor.fillStyle(0xdaa520, 1);
    floor.fillRect(0, 0, width, height);
    floor.setDepth(0);
    this.effects.push(floor);

    // Shimmering effect
    for (let i = 0; i < 60; i++) {
      const shimmerX = Phaser.Math.Between(0, width);
      const shimmerY = Phaser.Math.Between(0, height);
      
      const shimmer = this.scene.add.circle(shimmerX, shimmerY, 3, 0xffd700, 0.7);
      shimmer.setDepth(1);
      
      this.scene.tweens.add({
        targets: shimmer,
        alpha: 0.3,
        scale: 1.5,
        duration: Phaser.Math.Between(800, 1500),
        yoyo: true,
        repeat: -1
      });
      
      this.effects.push(shimmer);
    }

    // Treasure types for extended areas (1-4 tiles)
    const treasureTypes = [
      // Type 1: Large treasure chests with overflowing coins
      () => {
        const chest = this.scene.add.graphics();
        // Wooden chest
        chest.fillStyle(0x8b4513, 1);
        chest.fillRoundedRect(-25, -15, 50, 35, 3);
        // Golden lid (curved)
        chest.fillStyle(0xdaa520, 1);
        chest.fillEllipse(0, -20, 25, 15);
        chest.fillRect(-25, -20, 50, 5);
        // Gold trim
        chest.lineStyle(2, 0xffd700);
        chest.strokeRoundedRect(-25, -15, 50, 35, 3);
        // Overflowing coins
        chest.fillStyle(0xffd700, 1);
        for (let c = 0; c < 12; c++) {
          const coinX = Phaser.Math.Between(-30, 30);
          const coinY = Phaser.Math.Between(-25, 25);
          chest.fillCircle(coinX, coinY, 4);
          chest.fillStyle(0xffed4e, 1);
          chest.fillCircle(coinX, coinY, 2.5);
          chest.fillStyle(0xffd700, 1);
        }
        return chest;
      },
      // Type 2: Large coin piles (stacked)
      () => {
        const pile = this.scene.add.graphics();
        pile.fillStyle(0xffd700, 1);
        // Bottom layer - many coins
        for (let c = 0; c < 15; c++) {
          const cx = Phaser.Math.Between(-25, 25);
          const cy = Phaser.Math.Between(-5, 5);
          pile.fillCircle(cx, cy, 5);
          pile.fillStyle(0xffed4e, 1);
          pile.fillCircle(cx, cy, 3);
          pile.fillStyle(0xffd700, 1);
        }
        // Middle layer
        for (let c = 0; c < 10; c++) {
          const cx = Phaser.Math.Between(-18, 18);
          const cy = Phaser.Math.Between(-12, -8);
          pile.fillCircle(cx, cy, 5);
          pile.fillStyle(0xffed4e, 1);
          pile.fillCircle(cx, cy, 3);
          pile.fillStyle(0xffd700, 1);
        }
        // Top layer
        for (let c = 0; c < 5; c++) {
          const cx = Phaser.Math.Between(-10, 10);
          const cy = Phaser.Math.Between(-18, -15);
          pile.fillCircle(cx, cy, 5);
          pile.fillStyle(0xffed4e, 1);
          pile.fillCircle(cx, cy, 3);
          pile.fillStyle(0xffd700, 1);
        }
        return pile;
      },
      // Type 3: Golden crowns with jewels
      () => {
        const crown = this.scene.add.graphics();
        crown.fillStyle(0xffd700, 1);
        crown.fillRect(-15, 0, 30, 15);
        crown.fillStyle(0xff0000, 1);
        for (let p = 0; p < 5; p++) {
          crown.fillCircle(-12 + p * 6, -5, 4);
        }
        return crown;
      },
      // Type 4: Large gemstones
      () => {
        const gem = this.scene.add.graphics();
        const colors = [0xff0000, 0x0000ff, 0x00ff00, 0x9370db];
        gem.fillStyle(Phaser.Utils.Array.GetRandom(colors), 1);
        gem.beginPath();
        gem.moveTo(0, -15);
        gem.lineTo(10, -5);
        gem.lineTo(8, 10);
        gem.lineTo(-8, 10);
        gem.lineTo(-10, -5);
        gem.closePath();
        gem.fillPath();
        return gem;
      },
      // Type 5: Golden goblets
      () => {
        const goblet = this.scene.add.graphics();
        goblet.fillStyle(0xffd700, 1);
        goblet.fillRect(-8, -5, 16, 3);
        goblet.fillRect(-5, -5, 10, 15);
        goblet.fillRect(-10, 10, 20, 3);
        return goblet;
      },
      // Type 6: Jewelry boxes with coins
      () => {
        const box = this.scene.add.graphics();
        box.fillStyle(0x555555, 1);
        box.fillRect(-12, -8, 24, 16);
        box.fillStyle(0xffd700, 1);
        box.fillRect(-10, -6, 20, 12);
        // Coins spilling out
        for (let c = 0; c < 5; c++) {
          const cx = Phaser.Math.Between(-15, 15);
          const cy = 10 + c * 2;
          box.fillCircle(cx, cy, 3);
        }
        return box;
      },
      // Type 7: Gold bars stack
      () => {
        const bars = this.scene.add.graphics();
        bars.fillStyle(0xdaa520, 1);
        // Bottom bars
        bars.fillRect(-20, 5, 18, 8);
        bars.fillRect(2, 5, 18, 8);
        // Top bars
        bars.fillRect(-9, -3, 18, 8);
        // Shine effect
        bars.fillStyle(0xffd700, 0.5);
        bars.fillRect(-18, 6, 4, 6);
        bars.fillRect(4, 6, 4, 6);
        bars.fillRect(-7, -2, 4, 6);
        return bars;
      },
      // Type 8: Scattered coins pattern
      () => {
        const scatter = this.scene.add.graphics();
        scatter.fillStyle(0xffd700, 1);
        for (let c = 0; c < 20; c++) {
          const cx = Phaser.Math.Between(-20, 20);
          const cy = Phaser.Math.Between(-20, 20);
          scatter.fillCircle(cx, cy, 4);
          scatter.fillStyle(0xffed4e, 1);
          scatter.fillCircle(cx, cy, 2.5);
          scatter.fillStyle(0xffd700, 1);
        }
        return scatter;
      },
      // Type 9: Golden Desk (Bureau)
      () => {
        const desk = this.scene.add.graphics();
        desk.fillStyle(0xdaa520, 1);
        // Desktop
        desk.fillRect(-30, -15, 60, 30);
        // Legs
        desk.fillRect(-28, 15, 6, 15);
        desk.fillRect(22, 15, 6, 15);
        // Drawer handles
        desk.fillStyle(0x8b4513, 1);
        desk.fillCircle(-10, 0, 3);
        desk.fillCircle(10, 0, 3);
        // Gold shine
        desk.fillStyle(0xffd700, 0.5);
        desk.fillRect(-25, -12, 50, 5);
        return desk;
      },
      // Type 10: Golden Chair (Chaise)
      () => {
        const chair = this.scene.add.graphics();
        chair.fillStyle(0xdaa520, 1);
        // Seat
        chair.fillRect(-15, 0, 30, 20);
        // Backrest
        chair.fillRect(-15, -25, 30, 25);
        // Legs
        chair.fillRect(-12, 20, 5, 12);
        chair.fillRect(7, 20, 5, 12);
        // Gold shine
        chair.fillStyle(0xffd700, 0.5);
        chair.fillRect(-12, -20, 24, 8);
        return chair;
      },
      // Type 11: Golden Table
      () => {
        const table = this.scene.add.graphics();
        table.fillStyle(0xdaa520, 1);
        // Tabletop
        table.fillRect(-35, -5, 70, 10);
        // Legs
        table.fillRect(-32, 5, 8, 20);
        table.fillRect(24, 5, 8, 20);
        // Gold trim
        table.fillStyle(0xffd700, 1);
        table.fillRect(-35, -5, 70, 3);
        return table;
      },
      // Type 12: Golden Bench (Banc)
      () => {
        const bench = this.scene.add.graphics();
        bench.fillStyle(0xdaa520, 1);
        // Seat
        bench.fillRect(-40, -8, 80, 16);
        // Legs
        bench.fillRect(-35, 8, 10, 18);
        bench.fillRect(25, 8, 10, 18);
        // Decorative details
        bench.fillStyle(0xffd700, 1);
        for (let i = 0; i < 5; i++) {
          bench.fillCircle(-30 + i * 15, 0, 3);
        }
        return bench;
      },
      // Type 13: Golden Bed (Lit)
      () => {
        const bed = this.scene.add.graphics();
        bed.fillStyle(0xdaa520, 1);
        // Mattress
        bed.fillRect(-40, -10, 80, 35);
        // Headboard
        bed.fillRect(-40, -30, 10, 30);
        // Footboard
        bed.fillRect(30, -20, 10, 30);
        // Pillow
        bed.fillStyle(0xffd700, 1);
        bed.fillRect(-35, -8, 25, 15);
        // Gold trim
        bed.fillStyle(0xffed4e, 0.7);
        bed.fillRect(-40, -10, 80, 5);
        return bed;
      }
    ];

    // Create 15-20 concentrated treasure piles (1-4 tiles each)
    const numPiles = Phaser.Math.Between(15, 20);
    const tileSize = GAME_CONFIG.TILE_SIZE || 80;
    const minDistanceFromBase = tileSize * 2; // 2 tiles from bases
    
    for (let i = 0; i < numPiles; i++) {
      let pileX, pileY, attempts = 0;
      let validPosition = false;
      
      // Try to find valid position away from bases
      while (!validPosition && attempts < 50) {
        pileX = Phaser.Math.Between(100, width - 100);
        pileY = Phaser.Math.Between(100, height - 100);
        
        // Check distance from all bases
        if (!this.isNearBase(pileX, pileY, minDistanceFromBase)) {
          validPosition = true;
        }
        attempts++;
      }
      
      // Skip if no valid position found
      if (!validPosition) continue;
      
      // Random size: 1-4 tiles (40-160px radius for concentrated pile)
      const numTiles = Phaser.Math.Between(1, 4);
      const pileRadius = numTiles * (tileSize / 2); // Half tile size for more concentrated piles
      
      // Create obstacle circle for this pile
      const obstacle = this.scene.add.circle(pileX, pileY, pileRadius, 0x000000, 0);
      this.addObstacle(obstacle);
      
      // Number of treasure items based on pile size (more concentrated)
      const itemsPerTile = Phaser.Math.Between(5, 8);
      const numItems = numTiles * itemsPerTile;
      
      // Place treasure items concentrated in this pile
      for (let j = 0; j < numItems; j++) {
        // Random position within pile radius (concentrated)
        const angle = Phaser.Math.Between(0, 360) * Math.PI / 180;
        const distance = Phaser.Math.Between(0, pileRadius * 0.8); // 80% of radius for tighter grouping
        const treasureX = pileX + Math.cos(angle) * distance;
        const treasureY = pileY + Math.sin(angle) * distance;
        
        // Skip if outside bounds
        if (treasureX < 50 || treasureX > width - 50 || treasureY < 50 || treasureY > height - 50) {
          continue;
        }
        
        const treasureType = Phaser.Utils.Array.GetRandom(treasureTypes);
        const treasure = treasureType();
        treasure.setPosition(treasureX, treasureY);
        treasure.setDepth(5);
        
        this.effects.push(treasure);
      }
    }
  }

  // === HELPER FUNCTIONS FOR TERRAIN HAZARDS ===

  // Create Wind Power Zone (permanent wind power effect on terrain)
  createWindPowerZone(x, y, customRadius = null, particleColor = 0xffffff, sandTornado = false) {
    const radius = customRadius || (GAME_CONFIG.TILE_SIZE * 1.3); // Tornade plus petite par défaut
    
    // Couleur de base selon particleColor (détection couleur sable)
    const isSandColor = particleColor === 0xf5deb3 || particleColor === 0xf4a460;
    const baseColor = isSandColor ? 0xe3c797 : 0xb0e0e6; // Beige pour sable, bleu pour vent
    const innerColor1 = isSandColor ? 0xd4b896 : 0x87ceeb;
    const innerColor2 = isSandColor ? 0xc9a876 : 0xffffff;
    
    // Visual - spinning tornado core with gradient
    const tornado = this.scene.add.circle(x, y, radius, baseColor, sandTornado ? 0.4 : 0.5);
    tornado.setDepth(100);
    
    // Add inner circles for depth
    const innerCircle1 = this.scene.add.circle(x, y, radius * 0.7, innerColor1, sandTornado ? 0.3 : 0.4);
    innerCircle1.setDepth(100);
    const innerCircle2 = this.scene.add.circle(x, y, radius * 0.4, innerColor2, sandTornado ? 0.25 : 0.3);
    innerCircle2.setDepth(100);
    
    this.effects.push(tornado);
    this.effects.push(innerCircle1);
    this.effects.push(innerCircle2);
    
    // Create rotating particles
    const particles = [];
    let particleAngleOffset = 0;
    
    const createParticleRing = (ringRadius, numParticles, rotationSpeed) => {
      const ringParticles = [];
      for (let i = 0; i < numParticles; i++) {
        const particle = this.scene.add.circle(
          x,
          y,
          sandTornado ? 5 : 6, // Particules plus petites pour sable
          particleColor, // Utiliser la couleur personnalisée
          sandTornado ? 0.7 : 0.8
        );
        particle.setDepth(102);
        particle.initialAngle = (i / numParticles) * Math.PI * 2;
        particle.ringRadius = ringRadius;
        particle.rotationSpeed = rotationSpeed;
        ringParticles.push(particle);
        particles.push(particle);
        this.effects.push(particle);
      }
      return ringParticles;
    };
    
    // Create 3 rings with different speeds (moins de particules pour sable)
    const particleCount = sandTornado ? 0.7 : 1; // 70% de particules pour sable
    const ring1 = createParticleRing(radius * 0.3, Math.floor(6 * particleCount), 0.05);
    const ring2 = createParticleRing(radius * 0.6, Math.floor(8 * particleCount), 0.08);
    const ring3 = createParticleRing(radius * 0.9, Math.floor(10 * particleCount), 0.12);
    
    // Hazard avec effet Wind permanent
    const hazard = {
      type: 'windPower',
      x: x,
      y: y,
      radius: radius,
      sandTornado: sandTornado, // Marqueur pour tornade de sable
      graphics: tornado,
      particles: particles,
      particleAngleOffset: 0,
      allRings: [...ring1, ...ring2, ...ring3],
      update: (time, delta, players) => {
        // Animate particles
        hazard.particleAngleOffset += 0.05;
        
        hazard.allRings.forEach(particle => {
          const angle = particle.initialAngle + (hazard.particleAngleOffset * particle.rotationSpeed);
          particle.x = x + Math.cos(angle) * particle.ringRadius;
          particle.y = y + Math.sin(angle) * particle.ringRadius;
        });
        
        // Tornado effect (exactement comme windPower)
        players.forEach(player => {
          // Skip if not active
          if (!player.active) return;
          
          // Wind players are immune
          if (player.element && player.element.key === 'wind') return;
          
          const dist = Phaser.Math.Distance.Between(x, y, player.x, player.y);
          
          if (dist < radius) {
            if (!player.inTerrainTornado || player.terrainTornadoHazard !== hazard) {
              player.inTerrainTornado = true;
              player.terrainTornadoStartTime = time;
              player.terrainTornadoHazard = hazard; // Track which tornado
              console.log('Player entered tornado at time:', time);
              
              // Scatter ALL spirits IMMEDIATELY from this.scene.spirits
              if (this.scene.spirits) {
                this.scene.spirits.forEach(spirit => {
                  if (spirit.followingPlayer === player) {
                    // Remove from player
                    spirit.followingPlayer = null;
                    
                    // Scatter away (distance réduite pour sable)
                    const scatterAngle = Math.random() * Math.PI * 2;
                    const scatterDist = sandTornado ? 
                      Phaser.Math.Between(120, 200) : // Moins fort pour sable
                      Phaser.Math.Between(200, 300);
                    
                    this.scene.tweens.add({
                      targets: spirit,
                      x: spirit.x + Math.cos(scatterAngle) * scatterDist,
                      y: spirit.y + Math.sin(scatterAngle) * scatterDist,
                      duration: 1000,
                      ease: 'Power2'
                    });
                  }
                });
              }
            }
            
            // Mark player as unable to collect spirits while in tornado
            player.cannotCollectSpirits = true;
            
            const inTornadoDuration = time - player.terrainTornadoStartTime;
            
            if (inTornadoDuration > 1000) {
              // Throw player out after 1 second (tornades permanentes de terrain)
              console.log('Ejecting player! Duration:', inTornadoDuration);
              const angle = Phaser.Math.Angle.Between(x, y, player.x, player.y);
              
              // Teleport player 2 tiles away from tornado edge (1 tile pour sable)
              const ejectDistance = radius + (GAME_CONFIG.TILE_SIZE * (sandTornado ? 1 : 2));
              player.x = x + Math.cos(angle) * ejectDistance;
              player.y = y + Math.sin(angle) * ejectDistance;
              
              // Reset velocity
              if (player.body) {
                player.body.setVelocity(0, 0);
              }
              
              player.inTerrainTornado = false;
              player.cannotCollectSpirits = false;
              player.terrainTornadoHazard = null;
            } else {
              // Spin player at 70% of radius (80% pour sable - moins serré)
              const angle = (time / 100) % (Math.PI * 2);
              const spinRadius = radius * (sandTornado ? 0.8 : 0.7);
              player.x = x + Math.cos(angle) * spinRadius;
              player.y = y + Math.sin(angle) * spinRadius;
              
              // Log every second
              if (Math.floor(inTornadoDuration / 1000) !== Math.floor((inTornadoDuration - delta) / 1000)) {
                console.log('Spinning... Duration:', Math.floor(inTornadoDuration / 1000), 'seconds');
              }
            }
          } else {
            if (player.inTerrainTornado && player.terrainTornadoHazard === hazard) {
              player.inTerrainTornado = false;
              player.cannotCollectSpirits = false;
              player.terrainTornadoHazard = null;
            }
          }
        });
      }
    };
    
    this.hazards.push(hazard);
  }

  // Create tornado hazard (petite tornade qui fait tourner les joueurs)
  createTornadoHazard(x, y, width, height) {
    const radius = GAME_CONFIG.TILE_SIZE * 1.5; // Tornade plus petite (1.5 au lieu de 2.5)
    
    // Visual - spinning tornado core with gradient
    const tornado = this.scene.add.circle(x, y, radius, 0xb0e0e6, 0.5);
    tornado.setDepth(100);
    
    // Add inner circles for depth
    const innerCircle1 = this.scene.add.circle(x, y, radius * 0.7, 0x87ceeb, 0.4);
    innerCircle1.setDepth(100);
    const innerCircle2 = this.scene.add.circle(x, y, radius * 0.4, 0xffffff, 0.3);
    innerCircle2.setDepth(100);
    
    this.effects.push(tornado);
    this.effects.push(innerCircle1);
    this.effects.push(innerCircle2);
    
    // Create rotating particles
    const particles = [];
    let particleAngleOffset = 0;
    
    const createParticleRing = (ringRadius, numParticles, rotationSpeed) => {
      const ringParticles = [];
      for (let i = 0; i < numParticles; i++) {
        const particle = this.scene.add.circle(
          x,
          y,
          6,
          0xffffff,
          0.8
        );
        particle.setDepth(102);
        particle.initialAngle = (i / numParticles) * Math.PI * 2;
        particle.ringRadius = ringRadius;
        particle.rotationSpeed = rotationSpeed;
        ringParticles.push(particle);
        particles.push(particle);
        this.effects.push(particle);
      }
      return ringParticles;
    };
    
    // Create 3 rings with different speeds
    const ring1 = createParticleRing(radius * 0.3, 8, 0.05);
    const ring2 = createParticleRing(radius * 0.6, 12, 0.08);
    const ring3 = createParticleRing(radius * 0.9, 16, 0.12);
    
    // Hazard avec effet de tornade
    const hazard = {
      type: 'tornado',
      x: x,
      y: y,
      radius: radius,
      graphics: tornado,
      particles: particles,
      particleAngleOffset: 0,
      allRings: [...ring1, ...ring2, ...ring3],
      update: (time, delta, players) => {
        // Animate particles
        hazard.particleAngleOffset += 0.05;
        
        hazard.allRings.forEach(particle => {
          const angle = particle.initialAngle + (hazard.particleAngleOffset * particle.rotationSpeed);
          particle.x = x + Math.cos(angle) * particle.ringRadius;
          particle.y = y + Math.sin(angle) * particle.ringRadius;
        });
        
        // Faire tourner les joueurs en cercle pendant 5 secondes
        // Tous les joueurs SAUF Wind sont affectés
        players.forEach(player => {
          if (!player.active) return;
          
          // Wind players are immune to tornado effects
          if (player.element === 'wind') return;
          
          const dist = Phaser.Math.Distance.Between(x, y, player.x, player.y);
          
          if (dist < radius) {
            // Si le joueur vient d'entrer dans la tornade, initialiser la rotation
            if (!player.tornadoSpinning || player.tornadoSpinning !== hazard) {
              player.tornadoSpinning = hazard;
              player.tornadoStartTime = time;
              player.tornadoStartAngle = Phaser.Math.Angle.Between(x, y, player.x, player.y);
              player.tornadoRadius = dist;
            }
            
            const elapsed = time - player.tornadoStartTime;
            
            // Faire tourner pendant 2 secondes (2000ms)
            if (elapsed < 2000) {
              // Rotation circulaire autour du centre de la tornade
              const rotationSpeed = 0.05; // Vitesse de rotation
              const currentAngle = player.tornadoStartAngle + (elapsed * rotationSpeed * 0.001);
              
              // Positionner le joueur en rotation
              player.x = x + Math.cos(currentAngle) * player.tornadoRadius;
              player.y = y + Math.sin(currentAngle) * player.tornadoRadius;
              
              // Scatter ALL spirits IMMEDIATELY (comme le pouvoir Wind)
              const playerSpirits = this.scene.spirits.filter(s => s.followingPlayer === player);
              if (playerSpirits.length > 0) {
                playerSpirits.forEach(spirit => {
                  if (spirit && spirit.followingPlayer === player) {
                    spirit.followingPlayer = null;
                    
                    // Scatter away dans une direction aléatoire
                    const scatterAngle = Math.random() * Math.PI * 2;
                    const scatterDist = Phaser.Math.Between(200, 350);
                    
                    this.scene.tweens.add({
                      targets: spirit,
                      x: spirit.x + Math.cos(scatterAngle) * scatterDist,
                      y: spirit.y + Math.sin(scatterAngle) * scatterDist,
                      duration: 1000,
                      ease: 'Power2'
                    });
                  }
                });
              }
            } else {
              // Après 2 secondes, libérer le joueur
              player.tornadoSpinning = null;
            }
          } else {
            // Si le joueur sort de la tornade, réinitialiser
            if (player.tornadoSpinning === hazard) {
              player.tornadoSpinning = null;
            }
          }
        });
      }
    };
    
    this.hazards.push(hazard);
  }

  // Create tornado hazard (Wind power effect)
  createTornado(x, y) {
    // Tornado visual - PLUS VISIBLE avec plusieurs couches
    const tornado = this.scene.add.graphics();
    
    // Couche extérieure (bleu-gris pour contraste sous-marin)
    tornado.lineStyle(5, 0x6495ed, 0.5);
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 4;
      const radius = (i / 30) * 50;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius - (i * 2);
      
      if (i > 0) {
        const prevAngle = ((i - 1) / 30) * Math.PI * 4;
        const prevRadius = ((i - 1) / 30) * 50;
        const prevX = x + Math.cos(prevAngle) * prevRadius;
        const prevY = y + Math.sin(prevAngle) * prevRadius - ((i - 1) * 2);
        tornado.lineBetween(prevX, prevY, px, py);
      }
    }
    
    // Couche intérieure (blanc pour effet tourbillon)
    tornado.lineStyle(3, 0xffffff, 0.7);
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 4;
      const radius = (i / 30) * 35;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius - (i * 2);
      
      if (i > 0) {
        const prevAngle = ((i - 1) / 30) * Math.PI * 4;
        const prevRadius = ((i - 1) / 30) * 35;
        const prevX = x + Math.cos(prevAngle) * prevRadius;
        const prevY = y + Math.sin(prevAngle) * prevRadius - ((i - 1) * 2);
        tornado.lineBetween(prevX, prevY, px, py);
      }
    }
    
    tornado.setDepth(15);
    this.effects.push(tornado);

    // Rotation animation
    this.scene.tweens.add({
      targets: tornado,
      angle: 360,
      duration: 2000,
      repeat: -1
    });

    // Hazard behavior
    const hazard = {
      type: 'tornado',
      x: x,
      y: y,
      radius: 50,
      graphics: tornado,
      update: (time, delta, players) => {
        players.forEach(player => {
          if (!player.active) return;
          
          const dist = Phaser.Math.Distance.Between(x, y, player.x, player.y);
          if (dist < hazard.radius) {
            // Pull player toward center and scatter spirits
            const angle = Phaser.Math.Angle.Between(player.x, player.y, x, y);
            player.x += Math.cos(angle) * 2;
            player.y += Math.sin(angle) * 2;
            
            // Disperser toutes les boules attachées immédiatement
            const playerSpirits = this.scene.spirits.filter(s => s.followingPlayer === player);
            if (playerSpirits.length > 0) {
              playerSpirits.forEach(spirit => {
                if (spirit) {
                  spirit.followingPlayer = null;
                  const scatterAngle = Math.random() * Math.PI * 2;
                  const scatterDist = Phaser.Math.Between(100, 200);
                  
                  this.scene.tweens.add({
                    targets: spirit,
                    x: x + Math.cos(scatterAngle) * scatterDist,
                    y: y + Math.sin(scatterAngle) * scatterDist,
                    duration: 1000,
                    ease: 'Cubic.easeOut'
                  });
                }
              });
            }
          }
        });
      }
    };
    
    this.hazards.push(hazard);
  }

  // Create rain zones that slow non-Water players
  createRainZones(width, height) {
    const zoneCount = Phaser.Math.Between(3, 5);
    
    for (let i = 0; i < zoneCount; i++) {
      const zoneX = Phaser.Math.Between(200, width - 200);
      const zoneY = Phaser.Math.Between(200, height - 200);
      const zoneRadius = Phaser.Math.Between(100, 150);
      
      // Visual rain effect
      const rainZone = this.scene.add.graphics();
      rainZone.fillStyle(0x87ceeb, 0.2);
      rainZone.fillCircle(zoneX, zoneY, zoneRadius);
      rainZone.setDepth(2);
      this.effects.push(rainZone);

      // Rain particles
      for (let j = 0; j < 30; j++) {
        const dropX = zoneX + Phaser.Math.Between(-zoneRadius, zoneRadius);
        const dropY = zoneY + Phaser.Math.Between(-zoneRadius, zoneRadius);
        
        if (Phaser.Math.Distance.Between(dropX, dropY, zoneX, zoneY) < zoneRadius) {
          const drop = this.scene.add.line(dropX, dropY, 0, 0, 0, 8, 0x4682b4, 0.5);
          drop.setDepth(16);
          
          this.scene.tweens.add({
            targets: drop,
            y: dropY + 400,
            alpha: 0,
            duration: 1000,
            repeat: -1,
            delay: Math.random() * 1000
          });
          
          this.effects.push(drop);
        }
      }

      // Slowdown hazard
      const hazard = {
        type: 'rain',
        x: zoneX,
        y: zoneY,
        radius: zoneRadius,
        update: (time, delta, players) => {
          players.forEach(player => {
            if (!player.active) return;
            
            const dist = Phaser.Math.Distance.Between(zoneX, zoneY, player.x, player.y);
            if (dist < zoneRadius && player.element.key !== 'water') {
              // Slow down non-water players by 30%
              player.speedMultiplier = 0.7;
            } else if (dist >= zoneRadius && player.speedMultiplier === 0.7) {
              player.speedMultiplier = 1.0;
            }
          });
        }
      };
      
      this.hazards.push(hazard);
    }
  }

  // Create periodic snowfall for Ice terrain
  createSnowfall(width, height) {
    // Créer des flocons en continu (pas périodique)
    const snowflakeCount = 120;
    
    for (let i = 0; i < snowflakeCount; i++) {
      const createSnowflake = () => {
        const x = Phaser.Math.Between(0, width);
        const y = Phaser.Math.Between(-100, 0);
        const snowflake = this.scene.add.circle(x, y, 4, 0xffffff, 0.9);
        snowflake.setDepth(20);
        
        // Contour bleu clair pour visibilité
        const flakeGraphics = this.scene.add.graphics();
        flakeGraphics.lineStyle(1, 0x87ceeb, 0.8);
        flakeGraphics.strokeCircle(x, y, 4);
        flakeGraphics.setDepth(20);
        
        const duration = Phaser.Math.Between(3000, 5000);
        const drift = Phaser.Math.Between(-50, 50);
        
        this.scene.tweens.add({
          targets: [snowflake, flakeGraphics],
          y: height + 100,
          x: x + drift,
          duration: duration,
          onComplete: () => {
            snowflake.destroy();
            flakeGraphics.destroy();
            // Recréer un flocon immédiatement
            this.scene.time.delayedCall(0, createSnowflake);
          }
        });
      };
      
      // Démarrer chaque flocon avec un délai aléatoire
      this.scene.time.delayedCall(Phaser.Math.Between(0, 3000), createSnowflake);
    }
    
    // Effet de ralentissement permanent pour les non-Ice
    const hazard = {
      type: 'snowfall',
      duration: Infinity,
      elapsed: 0,
      update: (time, delta, players) => {
        players.forEach(player => {
          if (!player.active) return;
          if (player.element.key !== 'ice') {
            player.speedMultiplier = 0.6;
          }
        });
      }
    };
    this.hazards.push(hazard);
  }

  // Create lightning hazard for Thunder terrain
  createLightningHazard(width, height) {
    const hazard = {
      type: 'lightning',
      timer: Phaser.Math.Between(1000, 2000),
      elapsed: 0,
      update: (time, delta, players) => {
        hazard.elapsed += delta;
        if (hazard.elapsed >= hazard.timer) {
          hazard.elapsed = 0;
          hazard.timer = Phaser.Math.Between(1000, 2000);
          this.triggerLightningStrike(width, height, players);
        }
      }
    };
    
    this.hazards.push(hazard);
  }

  triggerLightningStrike(width, height, players) {
    // Random target location
    const targetX = Phaser.Math.Between(100, width - 100);
    const targetY = Phaser.Math.Between(100, height - 100);
    
    // Lightning bolt visual
    const lightning = this.scene.add.graphics();
    lightning.lineStyle(4, 0xffff00, 1);
    lightning.setDepth(20);
    
    // Jagged path from top to target
    let currentX = targetX;
    let currentY = 0;
    
    while (currentY < targetY) {
      const nextX = currentX + Phaser.Math.Between(-30, 30);
      const nextY = currentY + Phaser.Math.Between(40, 80);
      lightning.lineBetween(currentX, currentY, nextX, nextY);
      currentX = nextX;
      currentY = nextY;
    }
    
    // Final segment to exact target
    lightning.lineBetween(currentX, currentY, targetX, targetY);
    
    // Impact circle
    const impact = this.scene.add.circle(targetX, targetY, 40, 0xffff00, 0.5);
    impact.setDepth(19);
    
    // Check for player hits
    players.forEach(player => {
      if (!player.active) return;
      
      const dist = Phaser.Math.Distance.Between(targetX, targetY, player.x, player.y);
      if (dist < 40) {
        // Thunder and Water players immune
        if (player.element.key !== 'thunder' && player.element.key !== 'water') {
          const playerSpirits = this.scene.spirits.filter(s => s.followingPlayer === player);
          // Lose 1-2 spirits
          const lostSpirits = Phaser.Math.Between(1, Math.min(2, playerSpirits.length));
          for (let i = 0; i < lostSpirits; i++) {
            const spirit = playerSpirits[playerSpirits.length - 1 - i];
            if (spirit) {
              spirit.followingPlayer = null;
              this.scene.tweens.add({
                targets: spirit,
                alpha: 0,
                duration: 300,
                onComplete: () => spirit.destroy()
              });
            }
          }
        }
      }
    });
    
    // Remove lightning after brief flash
    this.scene.time.delayedCall(100, () => {
      lightning.destroy();
      impact.destroy();
    });
  }

  // Create factory base for industrial terrains
  createFactoryBase(width, height) {
    // Metal floor
    const floor = this.scene.add.graphics();
    floor.fillStyle(0x696969, 1);
    floor.fillRect(0, 0, width, height);
    
    // Grid pattern
    floor.lineStyle(1, 0x4a4a4a, 0.5);
    for (let x = 0; x < width; x += 80) {
      floor.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 80) {
      floor.lineBetween(0, y, width, y);
    }
    
    floor.setDepth(0);
    this.effects.push(floor);

    // Add 5 types of machines/obstacles
    this.createFactoryMachines(width, height);
  }

  // Helper function to check if position overlaps with existing objects
  checkOverlap(x, y, width, height, existingObjects, minDistance = 100) {
    for (const obj of existingObjects) {
      const dx = Math.abs(x - obj.x);
      const dy = Math.abs(y - obj.y);
      // Distance euclidienne réelle + marge de sécurité
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = Math.max(width, height) / 2 + Math.max(obj.width || 0, obj.height || 0) / 2 + minDistance;
      
      if (dist < minDist) {
        return true;
      }
    }
    return false;
  }

  createFactoryMachines(width, height) {
    const existingObjects = [];
    
    // Type 1: Control panels (5-7)
    for (let i = 0; i < 6; i++) {
      let panelX, panelY, attempts = 0;
      do {
        panelX = Phaser.Math.Between(150, width - 150);
        panelY = Phaser.Math.Between(150, height - 150);
        attempts++;
      } while ((this.checkOverlap(panelX, panelY, 60, 80, existingObjects, 120) || this.isNearBase(panelX, panelY, 200)) && attempts < 50);
      
      if (attempts >= 50) continue;
      
      existingObjects.push({ x: panelX, y: panelY, width: 60, height: 80 });
      
      const panel = this.scene.add.graphics();
      panel.fillStyle(0x2f2f2f, 1);
      panel.fillRect(panelX - 30, panelY - 40, 60, 80);
      
      // Buttons
      for (let j = 0; j < 6; j++) {
        const btnX = panelX - 20 + (j % 3) * 15;
        const btnY = panelY - 20 + Math.floor(j / 3) * 15;
        panel.fillStyle(Phaser.Utils.Array.GetRandom([0xff0000, 0x00ff00, 0x0000ff]), 1);
        panel.fillCircle(btnX, btnY, 4);
      }
      
      panel.setDepth(5);
      this.effects.push(panel);
      
      // OBSTACLE PHYSIQUE - Console
      const panelObstacle = this.scene.add.rectangle(panelX, panelY, 60, 80, 0x000000, 0);
      this.addObstacle(panelObstacle);
    }

    // Type 2: Metal stairs (3-4) - NON-OBSTACLES
    for (let i = 0; i < 3; i++) {
      let stairX, stairY, attempts = 0;
      do {
        stairX = Phaser.Math.Between(200, width - 200);
        stairY = Phaser.Math.Between(200, height - 200);
        attempts++;
      } while ((this.checkOverlap(stairX, stairY, 60, 60, existingObjects, 120) || this.isNearBase(stairX, stairY, 200)) && attempts < 50);
      
      if (attempts >= 50) continue;
      
      existingObjects.push({ x: stairX, y: stairY, width: 60, height: 60 });
      
      const stairs = this.scene.add.graphics();
      stairs.fillStyle(0x808080, 1);
      stairs.lineStyle(2, 0x4a4a4a);
      
      for (let s = 0; s < 5; s++) {
        stairs.fillRect(stairX + s * 10, stairY + s * 8, 40 - s * 5, 8);
        stairs.strokeRect(stairX + s * 10, stairY + s * 8, 40 - s * 5, 8);
      }
      
      stairs.setDepth(5);
      this.effects.push(stairs);
    }

    // Type 3: Metal bridges with holes (3-4)
    for (let i = 0; i < 3; i++) {
      let bridgeX, bridgeY, bridgeLength, attempts = 0;
      do {
        bridgeX = Phaser.Math.Between(250, width - 250);
        bridgeY = Phaser.Math.Between(250, height - 250);
        bridgeLength = Phaser.Math.Between(100, 150);
        attempts++;
      } while ((this.checkOverlap(bridgeX + bridgeLength/2, bridgeY, bridgeLength, 30, existingObjects, 150) || this.isNearBase(bridgeX + bridgeLength/2, bridgeY, 200)) && attempts < 50);
      
      if (attempts >= 50) continue;
      
      existingObjects.push({ x: bridgeX + bridgeLength/2, y: bridgeY, width: bridgeLength, height: 30 });
      
      const bridge = this.scene.add.graphics();
      bridge.fillStyle(0x696969, 1);
      bridge.fillRect(bridgeX, bridgeY - 15, bridgeLength, 30);
      
      // Holes
      bridge.fillStyle(0x1a1a1a, 1);
      const holeCount = Math.floor(bridgeLength / 40);
      for (let h = 0; h < holeCount; h++) {
        bridge.fillCircle(bridgeX + 20 + h * 40, bridgeY, 8);
      }
      
      bridge.setDepth(5);
      this.effects.push(bridge);
      
      // OBSTACLE PHYSIQUE - Bridge métallique
      const bridgeObstacle = this.scene.add.rectangle(bridgeX + bridgeLength/2, bridgeY, bridgeLength, 30, 0x000000, 0);
      this.addObstacle(bridgeObstacle);
    }

    // Type 4: Large storage tanks (2-3)
    for (let i = 0; i < 2; i++) {
      let tankX, tankY, attempts = 0;
      do {
        tankX = Phaser.Math.Between(200, width - 200);
        tankY = Phaser.Math.Between(200, height - 200);
        attempts++;
      } while ((this.checkOverlap(tankX, tankY, 80, 60, existingObjects, 120) || this.isNearBase(tankX, tankY, 200)) && attempts < 50);
      
      if (attempts >= 50) continue;
      
      existingObjects.push({ x: tankX, y: tankY, width: 80, height: 60 });
      
      const tank = this.scene.add.graphics();
      tank.fillStyle(0x4a4a4a, 1);
      tank.fillRect(tankX - 40, tankY - 30, 80, 60);
      tank.lineStyle(3, 0x696969);
      tank.strokeRect(tankX - 40, tankY - 30, 80, 60);
      
      // Rivets
      for (let r = 0; r < 8; r++) {
        const rx = tankX - 35 + (r % 4) * 20;
        const ry = tankY - 25 + Math.floor(r / 4) * 50;
        tank.fillStyle(0x808080, 1);
        tank.fillCircle(rx, ry, 3);
      }
      
      tank.setDepth(5);
      this.effects.push(tank);
      
      // OBSTACLE PHYSIQUE - Tank
      const tankObstacle = this.scene.add.rectangle(tankX, tankY, 80, 60, 0x000000, 0);
      this.addObstacle(tankObstacle);
    }

    // Type 5: Office obstacles (desks, 2-3)
    for (let i = 0; i < 2; i++) {
      let deskX, deskY, attempts = 0;
      do {
        deskX = Phaser.Math.Between(200, width - 200);
        deskY = Phaser.Math.Between(200, height - 200);
        attempts++;
      } while ((this.checkOverlap(deskX, deskY, 100, 50, existingObjects, 120) || this.isNearBase(deskX, deskY, 200)) && attempts < 50);
      
      if (attempts >= 50) continue;
      
      existingObjects.push({ x: deskX, y: deskY, width: 100, height: 50 });
      
      const desk = this.scene.add.graphics();
      desk.fillStyle(0x8b4513, 1);
      desk.fillRect(deskX - 50, deskY - 25, 100, 50);
      
      // Legs
      desk.fillStyle(0x654321, 1);
      desk.fillRect(deskX - 45, deskY + 25, 8, 15);
      desk.fillRect(deskX + 37, deskY + 25, 8, 15);
      
      // Computer on desk
      desk.fillStyle(0x2f2f2f, 1);
      desk.fillRect(deskX - 15, deskY - 20, 30, 25);
      desk.fillStyle(0x1a1a1a, 1);
      desk.fillRect(deskX - 12, deskY - 18, 24, 18);
      desk.fillStyle(0x00ff00, 0.3);
      desk.fillRect(deskX - 10, deskY - 16, 20, 14);
      
      desk.setDepth(5);
      this.effects.push(desk);
      
      // OBSTACLE PHYSIQUE - Bureau avec ordinateur
      const deskObstacle = this.scene.add.rectangle(deskX, deskY, 100, 50, 0x000000, 0);
      this.addObstacle(deskObstacle);
    }
  }

  // Create quicksand zones for Sand terrain
  createQuicksandZones(width, height) {
    const zoneCount = Phaser.Math.Between(3, 5);
    
    for (let i = 0; i < zoneCount; i++) {
      const zoneX = Phaser.Math.Between(200, width - 200);
      const zoneY = Phaser.Math.Between(200, height - 200);
      const zoneRadius = Phaser.Math.Between(60, 100);
      
      // Quicksand visual
      const quicksand = this.scene.add.graphics();
      quicksand.fillStyle(0xd2691e, 1);
      quicksand.fillCircle(zoneX, zoneY, zoneRadius);
      quicksand.setDepth(1);
      this.effects.push(quicksand);
      
      // Darker center
      quicksand.fillStyle(0x8b4513, 0.5);
      quicksand.fillCircle(zoneX, zoneY, zoneRadius * 0.6);

      // Slowdown hazard
      const hazard = {
        type: 'quicksand',
        x: zoneX,
        y: zoneY,
        radius: zoneRadius,
        update: (time, delta, players) => {
          players.forEach(player => {
            if (!player.active) return;
            
            const dist = Phaser.Math.Distance.Between(zoneX, zoneY, player.x, player.y);
            if (dist < zoneRadius) {
              // Slow down all players by 50%
              player.speedMultiplier = 0.5;
            } else if (dist >= zoneRadius && player.speedMultiplier === 0.5) {
              player.speedMultiplier = 1.0;
            }
          });
        }
      };
      
      this.hazards.push(hazard);
    }
  }

  // Create black hole hazard for Shadow terrain
  createBlackHole(x, y) {
    // Black hole visual
    const blackHole = this.scene.add.graphics();
    blackHole.fillGradientStyle(0x2a2a2a, 0x2a2a2a, 0x4a4a4a, 0x4a4a4a, 1, 1, 0.5, 0.5);
    blackHole.fillCircle(x, y, 40);
    blackHole.setDepth(2);
    this.effects.push(blackHole);
    
    // Event horizon
    const horizon = this.scene.add.circle(x, y, 50, 0x666666, 0.3);
    horizon.setDepth(2);
    this.effects.push(horizon);
    
    // Pulsing animation
    this.scene.tweens.add({
      targets: horizon,
      scale: 1.2,
      alpha: 0.1,
      duration: 2000,
      yoyo: true,
      repeat: -1
    });

    // Hazard behavior (weaker than Shadow power)
    const hazard = {
      type: 'blackhole',
      x: x,
      y: y,
      pullRadius: 120,
      damageRadius: 45,
      update: (time, delta, players) => {
        players.forEach(player => {
          if (!player.active) return;
          
          const dist = Phaser.Math.Distance.Between(x, y, player.x, player.y);
          
          if (dist < hazard.pullRadius) {
            // Pull player toward center
            const pullStrength = 1.5 * (1 - dist / hazard.pullRadius);
            const angle = Phaser.Math.Angle.Between(player.x, player.y, x, y);
            player.x += Math.cos(angle) * pullStrength;
            player.y += Math.sin(angle) * pullStrength;
          }
          
          const playerSpirits = this.scene.spirits.filter(s => s.followingPlayer === player);
          if (dist < hazard.damageRadius && playerSpirits.length > 0) {
            // Chance to absorb spirits
            if (Math.random() < 0.01) {
              const spirit = playerSpirits[playerSpirits.length - 1];
              if (spirit) {
                spirit.followingPlayer = null;
                this.scene.tweens.add({
                  targets: spirit,
                  x: x,
                  y: y,
                  scale: 0,
                  duration: 500,
                  onComplete: () => spirit.destroy()
                });
              }
            }
          }
        });
      }
    };
    
    this.hazards.push(hazard);
  }

  // Create light beam hazards for Light terrain
  // Beams verticaux avec taille limitée + cercles rayonnants pour téléportation
  createLightBeams(width, height) {
    const lightElements = []; // Stocker tous les éléments pour la téléportation
    
    // Créer 4-6 éléments lumineux (mélange de beams et cercles)
    const elementCount = Phaser.Math.Between(4, 6);
    
    for (let i = 0; i < elementCount; i++) {
      const elemX = Phaser.Math.Between(200, width - 200);
      const elemY = Phaser.Math.Between(200, height - 200);
      
      // 50% chance beam, 50% chance cercle rayonnant
      const isBeam = Math.random() < 0.5;
      
      if (isBeam) {
        // BEAM vertical avec taille limitée
        const beamWidth = 50;
        const beamHeight = Phaser.Math.Between(250, 400); // Taille limitée
        
        // Fond du beam (gradient simulé avec plusieurs rectangles)
        for (let layer = 0; layer < 3; layer++) {
          const alpha = 0.7 - (layer * 0.2);
          const w = beamWidth - (layer * 8);
          const beam = this.scene.add.graphics();
          beam.fillStyle(0xffffff, alpha);
          beam.fillRect(elemX - w/2, elemY - beamHeight/2, w, beamHeight);
          beam.setDepth(3 + layer);
          this.effects.push(beam);
          
          // Pulsation
          this.scene.tweens.add({
            targets: beam,
            alpha: { from: alpha, to: alpha * 0.5 },
            duration: 1500,
            yoyo: true,
            repeat: -1
          });
        }
        
        // Particules montantes
        for (let p = 0; p < 8; p++) {
          const particle = this.scene.add.circle(
            elemX + Phaser.Math.Between(-beamWidth/3, beamWidth/3),
            elemY + beamHeight/2,
            Phaser.Math.Between(2, 4), 
            0xffffff, 
            0.8
          );
          particle.setDepth(5);
          this.effects.push(particle);
          
          this.scene.tweens.add({
            targets: particle,
            y: elemY - beamHeight/2,
            alpha: 0,
            duration: 2000,
            delay: p * 250,
            repeat: -1
          });
        }
        
        lightElements.push({ 
          x: elemX, 
          y: elemY, 
          type: 'beam', 
          width: beamWidth, 
          height: beamHeight 
        });
        
      } else {
        // CERCLE RAYONNANT au sol
        const radius = Phaser.Math.Between(70, 100);
        
        // Cercle principal
        const mainCircle = this.scene.add.circle(elemX, elemY, radius, 0xfffacd, 0.65);
        mainCircle.setDepth(2);
        this.effects.push(mainCircle);
        
        // Cercle intérieur lumineux
        const innerCircle = this.scene.add.circle(elemX, elemY, radius * 0.6, 0xffffff, 0.85);
        innerCircle.setDepth(2);
        this.effects.push(innerCircle);
        
        // Rayonnement - cercles concentriques qui s'expandent
        for (let r = 0; r < 3; r++) {
          const createRipple = () => {
            const ripple = this.scene.add.circle(elemX, elemY, radius * 0.3, 0xffffff, 0.6);
            ripple.setDepth(1);
            
            this.scene.tweens.add({
              targets: ripple,
              radius: radius * 1.5,
              alpha: 0,
              duration: 2000,
              ease: 'Sine.easeOut',
              onComplete: () => ripple.destroy()
            });
          };
          
          // Créer des ripples en boucle
          this.scene.time.addEvent({
            delay: 2000,
            callback: createRipple,
            loop: true,
            startAt: r * 666 // Décalage pour effet continu
          });
        }
        
        // Pulsation du cercle principal
        this.scene.tweens.add({
          targets: [mainCircle, innerCircle],
          alpha: { from: 0.65, to: 0.35 },
          scale: { from: 1, to: 1.08 },
          duration: 1800,
          yoyo: true,
          repeat: -1
        });
        
        lightElements.push({ 
          x: elemX, 
          y: elemY, 
          type: 'zone', 
          radius: radius 
        });
      }
    }
    
    // Hazard pour téléportation aléatoire entre faisceaux et zones
    const hazard = {
      type: 'lightteleport',
      elements: lightElements,
      update: (time, delta, players) => {
        players.forEach(player => {
          if (!player.active || player.teleporting) return;
          
          // Vérifier si le joueur est dans un faisceau ou une zone
          lightElements.forEach((element, index) => {
            let inElement = false;
            
            if (element.type === 'beam') {
              // Vérifier si dans le faisceau (rectangle vertical)
              inElement = Math.abs(player.x - element.x) < element.width/2 &&
                         Math.abs(player.y - element.y) < element.height/2;
            } else if (element.type === 'zone') {
              // Vérifier si dans la zone (cercle)
              const dist = Phaser.Math.Distance.Between(player.x, player.y, element.x, element.y);
              inElement = dist < element.radius;
            }
            
            if (inElement && !player.inLightElement) {
              // Le joueur vient d'entrer dans un élément lumineux
              player.inLightElement = element;
              player.lightEnterTime = time;
            }
          });
          
          // Si le joueur est dans un élément depuis 1 seconde, téléporter
          if (player.inLightElement && time - player.lightEnterTime > 1000) {
            player.teleporting = true;
            
            // Choisir un autre élément aléatoirement
            const otherElements = lightElements.filter(e => e !== player.inLightElement);
            if (otherElements.length > 0) {
              const targetElement = Phaser.Utils.Array.GetRandom(otherElements);
              
              // Flash blanc
              const flash = this.scene.add.circle(player.x, player.y, 50, 0xffffff, 0.9);
              flash.setDepth(100);
              this.scene.tweens.add({
                targets: flash,
                scale: 2,
                alpha: 0,
                duration: 300,
                onComplete: () => flash.destroy()
              });
              
              // Téléporter le joueur
              this.scene.tweens.add({
                targets: player,
                alpha: 0,
                scale: 0.5,
                duration: 200,
                onComplete: () => {
                  player.x = targetElement.x;
                  player.y = targetElement.y;
                  
                  // Flash au point d'arrivée
                  const arrivalFlash = this.scene.add.circle(targetElement.x, targetElement.y, 50, 0xffffff, 0.9);
                  arrivalFlash.setDepth(100);
                  this.scene.tweens.add({
                    targets: arrivalFlash,
                    scale: 2,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => arrivalFlash.destroy()
                  });
                  
                  // Réapparition
                  this.scene.tweens.add({
                    targets: player,
                    alpha: 1,
                    scale: 1,
                    duration: 200,
                    onComplete: () => {
                      player.teleporting = false;
                      player.inLightElement = null;
                    }
                  });
                }
              });
            } else {
              player.teleporting = false;
              player.inLightElement = null;
            }
          }
          
          // Vérifier si le joueur est sorti de l'élément
          if (player.inLightElement && !player.teleporting) {
            let stillInElement = false;
            
            if (player.inLightElement.type === 'beam') {
              stillInElement = Math.abs(player.x - player.inLightElement.x) < player.inLightElement.width/2 &&
                              Math.abs(player.y - player.inLightElement.y) < player.inLightElement.height/2;
            } else if (player.inLightElement.type === 'zone') {
              const dist = Phaser.Math.Distance.Between(player.x, player.y, player.inLightElement.x, player.inLightElement.y);
              stillInElement = dist < player.inLightElement.radius;
            }
            
            if (!stillInElement) {
              player.inLightElement = null;
            }
          }
        });
      }
    };
    
    this.hazards.push(hazard);
  }

  // Update terrain hazards each frame
  update(time, delta, players) {
    // Debug log every 60 frames
    if (!this.updateCounter) this.updateCounter = 0;
    this.updateCounter++;
    if (this.updateCounter % 60 === 0) {
      console.log(`TerrainSystem update - currentTerrain: ${this.currentTerrain}, players: ${players ? players.length : 0}`);
    }
    
    this.hazards.forEach(hazard => {
      if (hazard.update) {
        hazard.update(time, delta, players);
      }
      
      // Gestion des trous noirs VOID (type shadowPower) sur le terrain Shadow
      if (hazard.type === 'shadowPower' && players && hazard.duration === Infinity) {
        players.forEach(player => {
          if (!player.active || !player.body) return;
          
          // Shadow est immunisé aux trous noirs void
          if (hazard.immuneType === 'shadow' && player.element && player.element.key === 'shadow') {
            return;
          }
          
          const dist = Phaser.Math.Distance.Between(player.x, player.y, hazard.x, hazard.y);
          
          // Zone de magnétisme - ATTIRE TOUS LES ENNEMIS dans la zone
          if (dist < hazard.magnetRadius) {
            const angle = Phaser.Math.Angle.Between(player.x, player.y, hazard.x, hazard.y);
            // Force d'attraction plus forte quand on est proche du centre
            const distanceRatio = 1 - (dist / hazard.magnetRadius);
            const pullForce = 200 + (distanceRatio * 300); // 200-500 selon la distance
            player.body.setAcceleration(
              Math.cos(angle) * pullForce,
              Math.sin(angle) * pullForce
            );
          } else if (player.body) {
            player.body.setAcceleration(0, 0);
          }
          
          // Zone de disparition (centre du trou noir)
          if (dist < hazard.radius) {
            if (!player.voidDisappeared) {
              player.voidDisappeared = true;
              player.voidDisappearTime = time;
              player.setAlpha(0.1);
            }
            
            // Éjection après 2 secondes (comme tornade)
            if (time - player.voidDisappearTime > 2000) {
              player.voidDisappeared = false;
              player.setAlpha(1);
              
              // Éjecter le joueur dans une direction aléatoire
              const ejectAngle = Math.random() * Math.PI * 2;
              const ejectDistance = GAME_CONFIG.TILE_SIZE * 4; // 4 tiles d'éjection
              const targetX = player.x + Math.cos(ejectAngle) * ejectDistance;
              const targetY = player.y + Math.sin(ejectAngle) * ejectDistance;
              
              this.scene.tweens.add({
                targets: player,
                x: targetX,
                y: targetY,
                duration: 300,
                ease: 'Power2'
              });
              
              // Réinitialiser l'accélération
              if (player.body) {
                player.body.setAcceleration(0, 0);
              }
            }
          } else {
            if (player.voidDisappeared) {
              player.voidDisappeared = false;
              player.setAlpha(1);
            }
          }
        });
      }
      
      // Gestion des sables mouvants (quicksand)
      if (hazard.type === 'quicksand' && players) {
        players.forEach(player => {
          if (!player.active || !player.body) return;
          
          // Sand players are immune to quicksand
          if (player.element && player.element.key === 'sand') return;
          
          const dist = Phaser.Math.Distance.Between(player.x, player.y, hazard.x, hazard.y);
          
          if (dist < hazard.radius) {
            // Marquer le joueur comme dans le sable mouvant
            if (!player.inQuicksand) {
              player.inQuicksand = true;
            }
            
            // Ralentir le joueur (vitesse divisée par 3)
            player.setMaxVelocity(GAME_CONFIG.PLAYER_SPEED / 3);
          } else {
            // Sortie du sable mouvant
            if (player.inQuicksand) {
              player.inQuicksand = false;
              player.setMaxVelocity(GAME_CONFIG.PLAYER_SPEED);
            }
          }
        });
      }
      
      // Gestion des lacs gelés ralentissants (iceLake)
      if (hazard.type === 'iceLake' && players) {
        players.forEach(player => {
          if (!player.active || !player.body) return;
          
          // Ice players are immune
          if (player.element && player.element.key === 'ice') return;
          
          const dist = Phaser.Math.Distance.Between(player.x, player.y, hazard.x, hazard.y);
          
          if (dist < hazard.radius) {
            if (!player.onIceLake) {
              player.onIceLake = true;
            }
            // Ralentir (vitesse divisée par 2)
            player.setMaxVelocity(GAME_CONFIG.PLAYER_SPEED / 2);
          } else {
            if (player.onIceLake) {
              player.onIceLake = false;
              player.setMaxVelocity(GAME_CONFIG.PLAYER_SPEED);
            }
          }
        });
      }
      
      // Gestion des lacs qui gèlent (freezeLake)
      if (hazard.type === 'freezeLake' && players) {
        players.forEach(player => {
          if (!player.active || !player.body) return;
          
          // Ice players are immune
          if (player.element && player.element.key === 'ice') return;
          
          const dist = Phaser.Math.Distance.Between(player.x, player.y, hazard.x, hazard.y);
          
          if (dist < hazard.radius) {
            if (!player.frozen) {
              player.frozen = true;
              player.frozenTime = time;
              player.frozenVelocity = { x: player.body.velocity.x, y: player.body.velocity.y };
              // Geler le joueur complètement
              player.body.setVelocity(0, 0);
              player.body.setImmovable(true);
              player.body.moves = false;
              player.setTint(0x87ceeb); // Teinte bleue
            }
            
            // Rester gelé en permanence tant qu'on est dans le lac
            if (player.frozen) {
              player.body.setVelocity(0, 0);
            }
            
            // Libérer après 2 secondes et éjecter de 1 tuile vers l'extérieur
            if (time - player.frozenTime > 2000 && !player.ejecting) {
              player.ejecting = true;
              player.clearTint();
              
              // Réactiver le mouvement
              player.body.setImmovable(false);
              player.body.moves = true;
              
              // Éjecter le joueur de 1 tuile vers l'extérieur du lac
              const ejectAngle = Phaser.Math.Angle.Between(hazard.x, hazard.y, player.x, player.y);
              const ejectDistance = hazard.radius + GAME_CONFIG.TILE_SIZE; // Extérieur + 1 tuile
              const targetX = hazard.x + Math.cos(ejectAngle) * ejectDistance;
              const targetY = hazard.y + Math.sin(ejectAngle) * ejectDistance;
              
              this.scene.tweens.add({
                targets: player,
                x: targetX,
                y: targetY,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                  player.frozen = false;
                  player.ejecting = false;
                }
              });
            }
          } else {
            // Ne dégeler que si le joueur n'est pas en train d'être éjecté
            if (player.frozen && !player.ejecting) {
              player.frozen = false;
              player.clearTint();
              player.body.setImmovable(false);
              player.body.moves = true;
            }
          }
        });
      }
    });
    
    // Update player reflections for glass terrain
    if (this.updateCounter % 60 === 0 && this.currentTerrain === 'glass') {
      console.log('About to check glass reflections...');
    }
    
    if (this.currentTerrain === 'glass' && players) {
      console.log(`Updating glass reflections for ${players.length} players`);
      this.updateGlassReflections(players);
    }
  }

  // Volcanic eruption hazard for Fire terrain
  createVolcanicEruptions(width, height) {
    const volcanoX = Phaser.Math.Between(width * 0.3, width * 0.7);
    const volcanoY = Phaser.Math.Between(height * 0.3, height * 0.7);
    
    // Volcano mountain
    const volcano = this.scene.add.graphics();
    volcano.fillStyle(0x654321, 1);
    volcano.beginPath();
    volcano.moveTo(volcanoX, volcanoY - 80);
    volcano.lineTo(volcanoX + 100, volcanoY + 40);
    volcano.lineTo(volcanoX - 100, volcanoY + 40);
    volcano.closePath();
    volcano.fillPath();
    volcano.setDepth(4);
    this.effects.push(volcano);
    
    // Crater
    const crater = this.scene.add.graphics();
    crater.fillStyle(0xff4500, 1);
    crater.fillEllipse(volcanoX, volcanoY - 70, 30, 15);
    crater.setDepth(4);
    this.effects.push(crater);

    // Eruption timer - every 8-15 seconds
    const hazard = {
      type: 'eruption',
      x: volcanoX,
      y: volcanoY,
      timer: Phaser.Math.Between(8000, 15000),
      elapsed: 0,
      update: (time, delta, players) => {
        hazard.elapsed += delta;
        if (hazard.elapsed >= hazard.timer) {
          hazard.elapsed = 0;
          hazard.timer = Phaser.Math.Between(8000, 15000);
          this.triggerVolcanicEruption(hazard.x, hazard.y, players);
        }
      }
    };
    this.hazards.push(hazard);
  }

  triggerVolcanicEruption(x, y, players) {
    // Spawn 5-8 lava projectiles
    const projectileCount = Phaser.Math.Between(5, 8);
    
    for (let i = 0; i < projectileCount; i++) {
      const angle = (i / projectileCount) * Math.PI * 2;
      const speed = Phaser.Math.Between(100, 200);
      const distance = Phaser.Math.Between(150, 300);
      
      const lavaRock = this.scene.add.circle(x, y - 70, 8, 0xff4500);
      lavaRock.setDepth(20);
      
      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;
      
      this.scene.tweens.add({
        targets: lavaRock,
        x: targetX,
        y: targetY,
        duration: 1500,
        ease: 'Quad.easeOut',
        onUpdate: (tween) => {
          // Check collision with players
          players.forEach(player => {
            if (!player.active) return;
            
            const dist = Phaser.Math.Distance.Between(
              lavaRock.x, lavaRock.y,
              player.x, player.y
            );
            
            const playerSpirits = this.scene.spirits.filter(s => s.followingPlayer === player);
            if (dist < 20 && playerSpirits.length > 0) {
              // Remove 1-3 spirits on hit
              const lostSpirits = Phaser.Math.Between(1, Math.min(3, playerSpirits.length));
              for (let j = 0; j < lostSpirits; j++) {
                const spirit = playerSpirits[playerSpirits.length - 1 - j];
                if (spirit) {
                  spirit.followingPlayer = null;
                  this.scene.tweens.add({
                    targets: spirit,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => spirit.destroy()
                  });
                }
              }
            }
          });
        },
        onComplete: () => {
          // Impact effect
          const impact = this.scene.add.circle(targetX, targetY, 15, 0xff8c00, 0.6);
          impact.setDepth(2);
          this.scene.tweens.add({
            targets: impact,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => impact.destroy()
          });
          lavaRock.destroy();
        }
      });
    }
  }
  
  updateGlassReflections(players) {
    // Clean up old reflections
    if (this.playerReflections) {
      this.playerReflections.forEach(ref => {
        if (ref && ref.destroy) ref.destroy();
      });
    }
    this.playerReflections = [];
    
    // Clean up old mirror reflections
    if (this.mirrorReflections) {
      this.mirrorReflections.forEach(ref => {
        if (ref && ref.destroy) ref.destroy();
      });
    }
    this.mirrorReflections = [];
    
    if (!players || players.length === 0) return;
    
    players.forEach(player => {
      if (!player.active || !player.texture) return;
      
      // Floor reflection - sprite inversé verticalement avec transparence
      const floorReflection = this.scene.add.sprite(
        player.x, 
        player.y + 45, // Offset below player
        player.texture.key
      );
      floorReflection.setDepth(8); // En dessous des spirits (9)
      floorReflection.setAlpha(0.4);
      floorReflection.setFlipY(true); // Inversion verticale
      floorReflection.setTint(0xc0d0e0); // Teinte bleutée du sol
      floorReflection.setScale(player.scaleX, player.scaleY);
      this.playerReflections.push(floorReflection);
      
      // Mirror reflections - sprite inversé avec effet miroir
      if (this.mirrors) {
        this.mirrors.forEach(mirror => {
          const dist = Phaser.Math.Distance.Between(player.x, player.y, mirror.x, mirror.y);
          const reflectionRange = mirror.size * 4;
          
          if (dist < reflectionRange) {
            const angle = Phaser.Math.Angle.Between(mirror.x, mirror.y, player.x, player.y);
            const reflectedX = mirror.x - Math.cos(angle) * dist * 0.3;
            const reflectedY = mirror.y - Math.sin(angle) * dist * 0.3;
            
            const mirrorReflection = this.scene.add.sprite(
              reflectedX,
              reflectedY,
              player.texture.key
            );
            mirrorReflection.setDepth(7);
            mirrorReflection.setAlpha(0.6);
            mirrorReflection.setFlipX(true); // Inversion horizontale pour effet miroir
            mirrorReflection.setTint(0xd0e0f0); // Teinte du miroir
            mirrorReflection.setScale(player.scaleX * 0.9, player.scaleY * 0.9);
            this.mirrorReflections.push(mirrorReflection);
          }
        });
      }
    });
  }
}
