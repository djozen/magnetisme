import Phaser from 'phaser';
import { ELEMENTS, GAME_CONFIG, TEAM_COLORS } from '../config.js';
import Player from '../entities/Player.js';
import Spirit from '../entities/Spirit.js';
import Gift from '../entities/Gift.js';
import AIController from '../ai/AIController.js';
import { initializeShapes } from '../entities/PlayerShapes.js';
import { PowerSystem } from '../systems/PowerSystem.js';
import { playerProgress } from '../systems/PlayerProgress.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.players = [];
    this.spirits = [];
    this.gifts = [];
    this.aiControllers = [];
    this.gameTime = GAME_CONFIG.GAME_TIME;
    this.teamScores = [];
    this.powerSystem = null;
    this.gameOver = false;
    this.debugMode = false;
  }

  init(data) {
    this.playerElement = data.playerElement;
    this.humanPlayerCount = data.playerCount || 1;
    this.teamAssignments = data.teamAssignments || null;
    this.friendlyFire = data.friendlyFire !== undefined ? data.friendlyFire : false;
    this.giftPowerSharing = data.giftPowerSharing !== undefined ? data.giftPowerSharing : false;
    this.debugMode = data.debugMode !== undefined ? data.debugMode : false;
  }

  create() {
    // Initialize power system
    this.powerSystem = new PowerSystem(this);
    const width = GAME_CONFIG.WORLD_WIDTH;
    const height = GAME_CONFIG.WORLD_HEIGHT;

    // Set world bounds to larger size
    this.physics.world.setBounds(0, 0, width, height);

    // Create natural environment
    this.createNaturalEnvironment(width, height);

    // Initialize players
    this.createPlayers();

    // Create team bases
    this.createTeamBases();

    // Add collision between players and obstacles
    this.players.forEach(player => {
      this.physics.add.collider(player, this.obstacles);
    });

    // Create spirits
    this.createSpirits();
    
    // Create gifts (rare spawns)
    this.createGifts();
    this.giftSpawnTimer = 0;

    // Setup camera to follow human player
    this.setupCamera();

    // Setup UI
    this.createUI();

    // Setup input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // Space bar for power activation
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    
    // Number keys for gift powers (1, 2, 3)
    this.key1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
    this.key2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
    this.key3 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE);

    // Start game timer
    this.startTimer();

    // Animate terrain
    this.animateTerrain();
  }

  createNaturalEnvironment(width, height) {
    // Sky gradient background
    const sky = this.add.graphics();
    sky.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98D8C8, 0x98D8C8, 1);
    sky.fillRect(0, 0, width, height);

    // Full grass ground
    const grass = this.add.graphics();
    grass.fillStyle(0x6b9d47, 1);
    grass.fillRect(0, 0, width, height);

    // Add grass texture (random blades)
    for (let i = 0; i < 300; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const blade = this.add.graphics();
      blade.lineStyle(1, 0x5d8a3a, 0.3);
      blade.lineBetween(x, y, x + Phaser.Math.Between(-2, 2), y - Phaser.Math.Between(3, 8));
    }

    // Create obstacles group for physics
    this.obstacles = this.physics.add.staticGroup();

    // Create maze-like grid layout
    this.createMazeLayout(width, height);

    // Add flowers in walkable areas
    this.createFlowers(width, height);
  }

  createMazeLayout(width, height) {
    const tileSize = GAME_CONFIG.TILE_SIZE;
    const cols = Math.floor(width / tileSize);
    const rows = Math.floor(height / tileSize);

    // Calculate base positions to exclude obstacles around them
    const basePositions = [];
    const activeTeamCount = this.humanPlayerCount === 1 ? 2 : 4;
    for (let i = 0; i < activeTeamCount; i++) {
      const angle = (i / activeTeamCount) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.4;
      const bx = width / 2 + Math.cos(angle) * radius;
      const by = height / 2 + Math.sin(angle) * radius;
      basePositions.push({ x: bx, y: by });
    }

    // Create grid-based maze pattern with MORE obstacles
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * tileSize + tileSize / 2;
        const y = row * tileSize + tileSize / 2;

        // Check if position is near any base (2 tile radius = 160px)
        const nearBase = basePositions.some(base => {
          const dist = Phaser.Math.Distance.Between(x, y, base.x, base.y);
          return dist < tileSize * 2;
        });

        if (nearBase) continue; // Skip obstacles near bases

        // Create pattern: obstacles on sparser grid (every 3rd instead of every 2nd)
        const isObstacle = (row % 3 === 1 && col % 3 === 1);
        
        if (isObstacle) {
          // Randomly choose obstacle type
          const obstacleType = Phaser.Math.Between(1, 3);
          
          if (obstacleType === 1) {
            // Tree cluster
            this.createMazeTree(x, y);
          } else if (obstacleType === 2) {
            // Water pond
            this.createWaterPond(x, y, tileSize * 0.7);
          } else {
            // Rock formation
            this.createRockFormation(x, y);
          }
        }
        
        // Add random obstacles in walkable areas (reduced for better AI navigation)
        else if (Math.random() < 0.10 && row > 0 && col > 0) {
          if (Math.random() < 0.4) {
            // Small bush
            this.createBush(x, y, 30);
          } else {
            // Single tree
            this.createMazeTree(x, y, 0.8);
          }
        }
      }
    }

    // Add bridges connecting over water in strategic locations
    this.createMazeBridges(width, height, tileSize);
  }

  createMazeTree(x, y, scale = 1) {
    // Tree trunk (collision body)
    const trunkSize = 20 * scale;
    const trunk = this.add.rectangle(x, y, trunkSize, trunkSize, 0x654321);
    this.physics.add.existing(trunk, true);
    this.obstacles.add(trunk);

    // Visual trunk
    const trunkVisual = this.add.graphics();
    trunkVisual.fillStyle(0x654321, 1);
    trunkVisual.fillRect(x - 8 * scale, y - 10 * scale, 16 * scale, 40 * scale);

    // Tree foliage (visual only)
    const foliageLayers = [
      { radius: 35 * scale, color: 0x2d5016, y: -15 * scale },
      { radius: 30 * scale, color: 0x3d6b1f, y: -25 * scale },
      { radius: 25 * scale, color: 0x4a7c2f, y: -30 * scale }
    ];

    foliageLayers.forEach(layer => {
      this.add.circle(x, y + layer.y, layer.radius, layer.color, 0.9);
    });
  }

  createWaterPond(x, y, size) {
    // Water body (collision)
    const water = this.add.ellipse(x, y, size, size * 0.8, 0x4a90e2, 1);
    this.physics.add.existing(water, true);
    this.obstacles.add(water);

    // Water details
    this.add.ellipse(x, y, size, size * 0.8, 0x4a90e2, 0.8);
    this.add.ellipse(x - 5, y - 5, size * 0.6, size * 0.5, 0x6bb6ff, 0.4);
    
    // Ripples
    const ripple = this.add.graphics();
    ripple.lineStyle(2, 0x6bb6ff, 0.3);
    ripple.strokeEllipse(x, y, size * 0.7, size * 0.6);
  }

  createRockFormation(x, y) {
    // Main rock (collision)
    const rockSize = 50;
    const rock = this.add.ellipse(x, y, rockSize, rockSize * 0.8, 0x808080, 1);
    this.physics.add.existing(rock, true);
    this.obstacles.add(rock);

    // Additional visual rocks
    this.add.ellipse(x + 2, y + 2, rockSize, rockSize * 0.8, 0x404040, 0.3);
    this.add.ellipse(x - 10, y - 10, 20, 16, 0x999999, 1);
    this.add.ellipse(x + 15, y + 5, 18, 14, 0x999999, 1);
    this.add.ellipse(x - 5, y - 5, rockSize * 0.3, rockSize * 0.2, 0xaaaaaa, 0.6);
  }

  createBush(x, y, size) {
    const bush = this.add.ellipse(x, y, size, size * 0.6, 0x4a7c2f, 1);
    this.physics.add.existing(bush, true);
    this.obstacles.add(bush);

    // Visual details
    this.add.ellipse(x - 8, y - 3, size * 0.7, size * 0.5, 0x5d8a3a, 0.9);
    this.add.ellipse(x + 8, y - 3, size * 0.7, size * 0.5, 0x5d8a3a, 0.9);
  }

  createMazeBridges(width, height, tileSize) {
    // Create a few horizontal and vertical bridges
    const bridges = [
      { x: width * 0.3, y: height * 0.3, isHorizontal: true },
      { x: width * 0.7, y: height * 0.5, isHorizontal: false },
      { x: width * 0.5, y: height * 0.7, isHorizontal: true }
    ];

    bridges.forEach(bridge => {
      const bridgeWidth = bridge.isHorizontal ? 100 : 30;
      const bridgeHeight = bridge.isHorizontal ? 30 : 100;

      // Bridge deck (walkable)
      const deck = this.add.graphics();
      deck.fillStyle(0x8b4513, 1);
      deck.fillRect(bridge.x - bridgeWidth/2, bridge.y - bridgeHeight/2, bridgeWidth, bridgeHeight);

      // Wood planks
      deck.lineStyle(2, 0x654321, 1);
      if (bridge.isHorizontal) {
        for (let i = 0; i < bridgeWidth; i += 10) {
          deck.lineBetween(
            bridge.x - bridgeWidth/2 + i, bridge.y - bridgeHeight/2,
            bridge.x - bridgeWidth/2 + i, bridge.y + bridgeHeight/2
          );
        }
      } else {
        for (let i = 0; i < bridgeHeight; i += 10) {
          deck.lineBetween(
            bridge.x - bridgeWidth/2, bridge.y - bridgeHeight/2 + i,
            bridge.x + bridgeWidth/2, bridge.y - bridgeHeight/2 + i
          );
        }
      }

      // Bridge posts
      const posts = this.add.graphics();
      posts.fillStyle(0x654321, 1);
      if (bridge.isHorizontal) {
        posts.fillRect(bridge.x - bridgeWidth/2, bridge.y - bridgeHeight/2 - 5, 6, bridgeHeight + 10);
        posts.fillRect(bridge.x + bridgeWidth/2 - 6, bridge.y - bridgeHeight/2 - 5, 6, bridgeHeight + 10);
      } else {
        posts.fillRect(bridge.x - bridgeWidth/2 - 5, bridge.y - bridgeHeight/2, bridgeWidth + 10, 6);
        posts.fillRect(bridge.x - bridgeWidth/2 - 5, bridge.y + bridgeHeight/2 - 6, bridgeWidth + 10, 6);
      }
    });
  }

  createFlowers(width, height) {
    const flowerColors = [0xff69b4, 0xffd700, 0xff4500, 0x9370db, 0xff1493];
    
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 50);
      const color = Phaser.Utils.Array.GetRandom(flowerColors);
      
      // Flower petals
      for (let j = 0; j < 5; j++) {
        const angle = (j / 5) * Math.PI * 2;
        const petalX = x + Math.cos(angle) * 3;
        const petalY = y + Math.sin(angle) * 3;
        this.add.circle(petalX, petalY, 2, color, 0.8);
      }
      
      // Flower center
      this.add.circle(x, y, 1.5, 0xffff00, 1);
    }
  }

  createPlayers() {
    const elements = Object.values(ELEMENTS);
    const width = GAME_CONFIG.WORLD_WIDTH;
    const height = GAME_CONFIG.WORLD_HEIGHT;

    // Initialize unique shapes for players
    const totalPlayers = this.humanPlayerCount === 1 ? 4 : GAME_CONFIG.MAX_PLAYERS;
    initializeShapes(totalPlayers);

    // Assign teams (for single player: team 0 has 2 players, team 1 has 2 players)
    const teams = this.assignTeams();

    // Create human player (always first) - temporary position
    const humanTeam = teams[0];
    const humanPlayer = new Player(
      this,
      width / 2,
      height / 2,
      this.playerElement,
      0,
      false,
      humanTeam.teamId,
      humanTeam.color
    );
    this.players.push(humanPlayer);

    // Create AI teammates and opponents    
    for (let i = 1; i < totalPlayers; i++) {
      const teamInfo = teams[i];
      
      // Position based on team - start near team base
      let x, y;
      if (i === 0) {
        // Human player - will be positioned near their base
        const teamBase = { teamId: teamInfo.teamId };
        const baseAngle = (teamInfo.teamId / GAME_CONFIG.MAX_TEAMS) * Math.PI * 2;
        const baseRadius = Math.min(width, height) * 0.4;
        x = width / 2 + Math.cos(baseAngle) * (baseRadius - 100);
        y = height / 2 + Math.sin(baseAngle) * (baseRadius - 100);
      } else {
        // AI players - position near their team base
        const angle = (teamInfo.teamId / GAME_CONFIG.MAX_TEAMS) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.4;
        const offset = (i % 2) * 50 - 25;
        x = width / 2 + Math.cos(angle) * (radius - 100) + offset;
        y = height / 2 + Math.sin(angle) * (radius - 100) + offset;
      }

      // Select element (only unlocked elements, or all elements in debug mode)
      const usedElements = this.players.map(p => p.element);
      const playerLevel = playerProgress.level; // Use current player's level for AI element selection
      
      const availableElements = elements.filter(e => 
        (!usedElements.includes(e) || usedElements.length >= elements.length) &&
        (GAME_CONFIG.DEBUG_MODE || e.requiredLevel <= playerLevel)  // AI can use all elements in debug mode
      );
      
      // Fallback to first element if no available elements (safety)
      const element = availableElements.length > 0 
        ? Phaser.Utils.Array.GetRandom(availableElements)
        : elements[0];

      const aiPlayer = new Player(this, x, y, element, i, true, teamInfo.teamId, teamInfo.color);
      this.players.push(aiPlayer);

      // Create AI controller
      const aiController = new AIController(this, aiPlayer);
      this.aiControllers.push(aiController);
    }

    // Initialize team scores based on player elements
    this.teamScores = [];
    const teamElements = new Map();
    this.players.forEach(p => {
      if (!teamElements.has(p.teamId)) {
        teamElements.set(p.teamId, p.element);
        this.teamScores.push({
          teamId: p.teamId,
          score: 0,
          element: p.element,
          extraPowers: [] // Pouvoirs ajoutés par les gifts
        });
      }
    });
  }

  assignTeams() {
    const teams = [];
    
    if (this.humanPlayerCount === 1) {
      // Single player: 2 teams of 2
      teams.push({ teamId: 0, color: TEAM_COLORS[0] }); // Human
      teams.push({ teamId: 0, color: TEAM_COLORS[0] }); // AI teammate
      teams.push({ teamId: 1, color: TEAM_COLORS[1] }); // Opponent 1
      teams.push({ teamId: 1, color: TEAM_COLORS[1] }); // Opponent 2
    } else {
      // Multiplayer: distribute across 4 teams
      for (let i = 0; i < GAME_CONFIG.MAX_PLAYERS; i++) {
        const teamId = i % GAME_CONFIG.MAX_TEAMS;
        teams.push({ teamId, color: TEAM_COLORS[teamId] });
      }
    }
    
    return teams;
  }

  setupCamera() {
    const humanPlayer = this.players[0];
    
    // Position players near their bases (below the base)
    this.players.forEach(player => {
      const teamBase = this.teamBases.find(base => base.teamId === player.teamId);
      if (teamBase) {
        const offset = player.playerId * 40 - 20;
        player.x = teamBase.x + offset;
        player.y = teamBase.y + teamBase.size + 80; // Position below base
      }
    });
    
    // Camera follows human player smoothly
    this.cameras.main.startFollow(humanPlayer, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
  }

  createTemporaryAlly(player, duration) {
    // Create temporary AI ally at player position
    const tempPlayer = new Player(
      this,
      player.x + 50,
      player.y + 50,
      player.element,
      this.players.length, // Use next available player ID
      true, // isAI
      player.teamId,
      player.teamColor
    );
    
    this.players.push(tempPlayer);
    this.physics.add.collider(tempPlayer, this.obstacles);
    
    // Create AI controller for temporary ally
    const tempAI = new AIController(this, tempPlayer);
    this.aiControllers.push(tempAI);
    
    // Add visual indicator (glow effect)
    tempPlayer.setTint(0xfffacd);
    
    // Remove after duration
    this.time.delayedCall(duration, () => {
      const playerIndex = this.players.indexOf(tempPlayer);
      if (playerIndex > -1) {
        this.players.splice(playerIndex, 1);
      }
      
      const aiIndex = this.aiControllers.indexOf(tempAI);
      if (aiIndex > -1) {
        this.aiControllers.splice(aiIndex, 1);
      }
      
      // Transfer spirits to original player before destroying
      this.spirits.forEach(spirit => {
        if (spirit.followingPlayer === tempPlayer) {
          spirit.setFollowPlayer(player);
        }
      });
      
      tempPlayer.destroy();
    });
    
    return tempPlayer;
  }

  createTeamBases() {
    this.teamBases = [];
    const width = GAME_CONFIG.WORLD_WIDTH;
    const height = GAME_CONFIG.WORLD_HEIGHT;

    // Get unique teams with their element
    const teamElements = new Map();
    this.players.forEach(p => {
      if (!teamElements.has(p.teamId)) {
        teamElements.set(p.teamId, p.element);
      }
    });

    const activeTeams = Array.from(teamElements.entries());

    activeTeams.forEach(([teamId, element], index) => {
      // Position bases in corners/sides based on team
      const angle = (index / activeTeams.length) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.4;
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius;

      const baseSize = GAME_CONFIG.BASE_ZONE_SIZE;

      // Create themed base according to element
      const baseGraphics = this.createElementalBase(x, y, baseSize, element);

      // Store base info
      this.teamBases.push({
        teamId,
        element,
        x,
        y,
        size: baseSize,
        graphics: baseGraphics,
        depositedSpirits: 0
      });
    });
  }

  createElementalBase(x, y, size, element) {
    // Safety check
    if (!element || !element.key) {
      console.error('Invalid element:', element);
      const graphics = this.add.graphics();
      graphics.fillStyle(0x888888, 0.6);
      graphics.fillCircle(x, y, size);
      graphics.setDepth(5);
      return graphics;
    }

    const graphics = this.add.graphics();
    graphics.setDepth(5); // Bases visible but under players (player depth is 10)
    
    // Helper to create base text with proper depth
    const createBaseText = (x, y, text, options = {}) => {
      const defaultOptions = {
        fontSize: '20px',
        color: options.color || '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      };
      return this.add.text(x, y, text, { ...defaultOptions, ...options })
        .setOrigin(0.5)
        .setDepth(6);
    };
    
    switch(element.key) {
      case 'earth':
        // Montagne
        graphics.fillStyle(0x8b4513, 1);
        graphics.beginPath();
        graphics.moveTo(x, y - size);
        graphics.lineTo(x - size, y + size * 0.5);
        graphics.lineTo(x + size, y + size * 0.5);
        graphics.closePath();
        graphics.fillPath();
        graphics.fillStyle(0xa0522d, 0.8);
        graphics.beginPath();
        graphics.moveTo(x - size * 0.5, y);
        graphics.lineTo(x - size, y + size * 0.5);
        graphics.lineTo(x, y + size * 0.5);
        graphics.closePath();
        graphics.fillPath();
        graphics.fillStyle(0xffffff, 0.9);
        graphics.beginPath();
        graphics.moveTo(x - 10, y - size);
        graphics.lineTo(x, y - size + 20);
        graphics.lineTo(x + 10, y - size);
        graphics.closePath();
        graphics.fillPath();
        createBaseText(x, y + size * 0.7, 'MOUNTAIN');
        break;

      case 'fire':
        // Zone d'incendie
        graphics.fillStyle(0xff4500, 0.6);
        graphics.fillCircle(x, y, size);
        graphics.fillStyle(0xff6600, 0.4);
        graphics.fillCircle(x, y, size * 0.7);
        // Flammes animées avec cercles
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const flame = this.add.ellipse(
            x + Math.cos(angle) * size * 0.6,
            y + Math.sin(angle) * size * 0.6,
            15, 30, 0xff0000, 0.8
          );
          this.tweens.add({
            targets: flame,
            scaleY: { from: 1, to: 1.5 },
            alpha: { from: 0.8, to: 0.4 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            delay: i * 100
          });
        }
        createBaseText(x, y + size * 0.8, 'FIRE ZONE', { color: '#ffff00' });
        break;

      case 'thunder':
        // Base circulaire visible (depth élevé pour être visible)
        graphics.fillStyle(0xffd700, 0.4);
        graphics.fillCircle(x, y, size);
        graphics.lineStyle(4, 0xffff00, 0.9);
        graphics.strokeCircle(x, y, size);
        
        // Arbre avec foudre continue
        graphics.fillStyle(0x654321, 1);
        graphics.fillRect(x - 15, y - 30, 30, 80);
        graphics.fillStyle(0x2d5016, 1);
        graphics.fillCircle(x, y - 40, 50);
        
        // Texte avec depth élevé
        const thunderText = createBaseText(x, y + size * 0.9, 'THUNDER TREE', { color: '#ffff00' });
        thunderText.setDepth(20); // Au-dessus de tout
        
        this.time.addEvent({
          delay: 2000,
          callback: () => {
            const bolt = this.add.graphics();
            bolt.setDepth(15); // Au-dessus de l'arbre
            bolt.lineStyle(4, 0xffff00, 1);
            bolt.lineBetween(x, y - 100, x + 10, y - 40);
            bolt.lineBetween(x + 10, y - 40, x - 10, y);
            this.tweens.add({
              targets: bolt,
              alpha: 0,
              duration: 200,
              onComplete: () => bolt.destroy()
            });
          },
          loop: true
        });
        break;

      case 'water':
        // Lac
        graphics.fillStyle(0x0077be, 0.8);
        graphics.fillEllipse(x, y, size * 2, size * 1.5);
        graphics.fillStyle(0x4a90e2, 0.6);
        graphics.fillEllipse(x, y, size * 1.5, size);
        // Vagues
        this.tweens.add({
          targets: graphics,
          scaleX: { from: 1, to: 1.05 },
          scaleY: { from: 1, to: 1.03 },
          duration: 3000,
          yoyo: true,
          repeat: -1
        });
        createBaseText(x, y + size * 0.9, 'LAKE');
        break;

      case 'sand':
        // Banc de sable
        graphics.fillStyle(0xf4a460, 1);
        graphics.fillEllipse(x, y, size * 2, size);
        graphics.fillStyle(0xdeb887, 0.8);
        graphics.fillEllipse(x, y, size * 1.5, size * 0.7);
        // Dunes
        graphics.fillStyle(0xd2b48c, 0.6);
        for (let i = 0; i < 5; i++) {
          const dx = (i - 2) * 30;
          graphics.fillCircle(x + dx, y, 20);
        }
        createBaseText(x, y + size * 0.8, 'SAND BANK', { color: '#8b4513' });
        break;

      case 'ice':
        // Cité de glace
        graphics.fillStyle(0x87ceeb, 0.8);
        graphics.fillRect(x - size, y - size * 0.5, size * 2, size);
        graphics.fillStyle(0xadd8e6, 0.9);
        // Tours de glace
        for (let i = 0; i < 3; i++) {
          const dx = (i - 1) * size * 0.6;
          graphics.fillRect(x + dx - 20, y - size, 40, size);
          // Toit triangulaire
          graphics.beginPath();
          graphics.moveTo(x + dx, y - size - 30);
          graphics.lineTo(x + dx - 25, y - size);
          graphics.lineTo(x + dx + 25, y - size);
          graphics.closePath();
          graphics.fillPath();
        }
        createBaseText(x, y + size * 0.7, 'ICE CITY');
        break;

      case 'leaf':
        // Lotus géant
        graphics.fillStyle(0x228b22, 0.8);
        graphics.fillCircle(x, y, size);
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const petal = this.add.ellipse(
            x + Math.cos(angle) * size * 0.7,
            y + Math.sin(angle) * size * 0.7,
            40, 70, 0x32cd32, 0.9
          );
          petal.rotation = angle;
        }
        graphics.fillStyle(0xffd700, 1);
        graphics.fillCircle(x, y, size * 0.3);
        createBaseText(x, y + size * 0.9, 'LOTUS');
        break;

      case 'wind':
        // Base circulaire visible (dans graphics principal)
        graphics.fillStyle(0xb0e0e6, 0.4);
        graphics.fillCircle(x, y, size);
        graphics.lineStyle(4, 0x87ceeb, 0.8);
        graphics.strokeCircle(x, y, size);
        
        // Tornade au centre (graphics séparé pour animation)
        const tornadoGraphics = this.add.graphics();
        tornadoGraphics.lineStyle(3, 0xb0e0e6, 0.8);
        for (let i = 0; i < 20; i++) {
          const r = (i / 20) * size * 0.7;
          const a = i * 0.5;
          tornadoGraphics.strokeCircle(x + Math.cos(a) * r * 0.3, y - size * 0.5 + i * size * 0.05, r * 0.5);
        }
        tornadoGraphics.x = 0;
        tornadoGraphics.y = 0;
        this.tweens.add({
          targets: tornadoGraphics,
          rotation: Math.PI * 2,
          duration: 2000,
          repeat: -1
        });
        createBaseText(x, y + size * 0.9, 'TORNADO');
        break;

      case 'wood':
        // Arbre géant
        graphics.fillStyle(0x8b4513, 1);
        graphics.fillRect(x - 30, y - size, 60, size * 1.5);
        graphics.fillStyle(0x2d5016, 1);
        graphics.fillCircle(x, y - size, size * 1.2);
        graphics.fillStyle(0x3d6b1f, 0.9);
        graphics.fillCircle(x, y - size * 1.2, size * 0.9);
        createBaseText(x, y + size * 0.8, 'GIANT TREE');
        break;

      case 'plasma':
        // Usine futuriste
        graphics.fillStyle(0x4b0082, 0.8);
        graphics.fillRect(x - size, y - size * 0.7, size * 2, size * 1.2);
        graphics.fillStyle(0xff1493, 1);
        for (let i = 0; i < 4; i++) {
          const light = this.add.circle(x - size * 0.7 + i * size * 0.5, y - size * 0.5, 10, 0xff1493);
          this.tweens.add({
            targets: light,
            alpha: { from: 1, to: 0.3 },
            duration: 500,
            yoyo: true,
            repeat: -1,
            delay: i * 125
          });
        }
        createBaseText(x, y + size * 0.8, 'PLASMA PLANT', { fontSize: '18px', color: '#ff1493' });
        break;

      case 'toxic':
        // Usine chimique
        graphics.fillStyle(0x006400, 0.8);
        graphics.fillRect(x - size, y - size * 0.6, size * 2, size * 1.1);
        graphics.fillStyle(0x00ff00, 0.6);
        // Fumée toxique avec cercles animés
        for (let i = 0; i < 5; i++) {
          const smokeCircle = this.add.circle(x + (i - 2) * 20, y - size * 0.7, 8, 0x00ff00, 0.5);
          this.tweens.add({
            targets: smokeCircle,
            y: y - size * 1.2,
            alpha: 0,
            scale: 1.5,
            duration: 2000,
            delay: i * 400,
            repeat: -1
          });
        }
        createBaseText(x, y + size * 0.7, 'TOXIC PLANT', { fontSize: '18px', color: '#00ff00' });
        break;

      case 'glass':
        // Palais de miroirs
        graphics.fillStyle(0xe0ffff, 0.3);
        graphics.fillRect(x - size, y - size * 0.8, size * 2, size * 1.3);
        graphics.lineStyle(4, 0xffffff, 0.8);
        graphics.strokeRect(x - size, y - size * 0.8, size * 2, size * 1.3);
        // Reflets
        for (let i = 0; i < 3; i++) {
          const reflect = this.add.rectangle(x - size * 0.6 + i * size * 0.6, y, 30, 80, 0xffffff, 0.4);
          this.tweens.add({
            targets: reflect,
            alpha: { from: 0.2, to: 0.6 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            delay: i * 333
          });
        }
        createBaseText(x, y + size * 0.8, 'MIRROR PALACE', { fontSize: '18px' });
        break;

      case 'light':
        // Zone de lumière
        graphics.fillStyle(0xfffacd, 0.6);
        graphics.fillCircle(x, y, size * 1.3);
        graphics.fillStyle(0xffffe0, 0.8);
        graphics.fillCircle(x, y, size * 0.9);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(x, y, size * 0.5);
        // Rayons
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const ray = this.add.rectangle(
            x + Math.cos(angle) * size,
            y + Math.sin(angle) * size,
            size * 0.8, 8, 0xffff00, 0.6
          );
          ray.rotation = angle;
          this.tweens.add({
            targets: ray,
            alpha: { from: 0.4, to: 0.8 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            delay: i * 66
          });
        }
        createBaseText(x, y + size * 1.1, 'LIGHT ZONE');
        break;

      case 'shadow':
        // Trou noir
        graphics.fillStyle(0x000000, 0.9);
        graphics.fillCircle(x, y, size);
        graphics.fillStyle(0x1a1a1a, 0.8);
        graphics.fillCircle(x, y, size * 0.7);
        graphics.fillStyle(0x4b0082, 0.6);
        // Spirale
        for (let i = 0; i < 5; i++) {
          const spiral = this.add.graphics();
          spiral.lineStyle(2, 0x4b0082, 0.6 - i * 0.1);
          spiral.arc(x, y, size * (0.9 - i * 0.15), 0, Math.PI * 2);
          spiral.strokePath();
          this.tweens.add({
            targets: spiral,
            rotation: Math.PI * 2,
            duration: 3000 + i * 500,
            repeat: -1
          });
        }
        createBaseText(x, y + size * 0.9, 'BLACK HOLE', { color: '#9400d3' });
        break;

      case 'iron':
        // Tour en fer
        graphics.fillStyle(0x808080, 1);
        graphics.fillRect(x - size * 0.4, y - size * 0.6, size * 0.8, size * 1.3);
        graphics.fillStyle(0x696969, 1);
        graphics.fillRect(x - size * 0.5, y - size * 0.8, size, size * 0.3);
        graphics.fillRect(x - size * 0.5, y + size * 0.6, size, size * 0.2);
        // Créneaux
        for (let i = 0; i < 5; i++) {
          graphics.fillStyle(0x505050, 1);
          graphics.fillRect(x - size * 0.5 + i * (size / 2.5), y - size * 0.9, size / 5, size / 10);
        }
        createBaseText(x, y + size * 0.9, 'IRON TOWER', { color: '#c0c0c0' });
        break;

      case 'gold':
        // Château en or
        graphics.fillStyle(0xffd700, 1);
        // Tour centrale
        graphics.fillRect(x - size * 0.3, y - size * 0.7, size * 0.6, size * 1.4);
        // Tours latérales
        graphics.fillRect(x - size * 0.7, y - size * 0.5, size * 0.3, size);
        graphics.fillRect(x + size * 0.4, y - size * 0.5, size * 0.3, size);
        // Toits
        graphics.fillStyle(0xffed4e, 1);
        graphics.beginPath();
        graphics.moveTo(x, y - size * 0.9);
        graphics.lineTo(x - size * 0.4, y - size * 0.7);
        graphics.lineTo(x + size * 0.4, y - size * 0.7);
        graphics.closePath();
        graphics.fillPath();
        // Ornements
        graphics.fillStyle(0xff8c00, 1);
        graphics.fillCircle(x - size * 0.55, y - size * 0.6, size * 0.1);
        graphics.fillCircle(x + size * 0.55, y - size * 0.6, size * 0.1);
        createBaseText(x, y + size * 0.9, 'GOLD CASTLE', { color: '#ffed4e' });
        break;

      default:
        // Fallback - cercle simple
        graphics.fillStyle(element.color, 0.6);
        graphics.fillCircle(x, y, size);
        createBaseText(x, y, element.name.toUpperCase());
    }

    return graphics;
  }

  createSpirits() {
    const width = GAME_CONFIG.WORLD_WIDTH;
    const height = GAME_CONFIG.WORLD_HEIGHT;

    for (let i = 0; i < GAME_CONFIG.SPIRIT_COUNT; i++) {
      let x, y, attempts = 0;
      let validPosition = false;

      // Try to find a position that's not overlapping with obstacles
      while (!validPosition && attempts < 50) {
        x = Phaser.Math.Between(100, width - 100);
        y = Phaser.Math.Between(100, height - 100);
        
        // Check if position overlaps with any obstacle
        const overlapping = this.obstacles.getChildren().some(obstacle => {
          const distance = Phaser.Math.Distance.Between(x, y, obstacle.x, obstacle.y);
          return distance < 50; // Keep spirits away from obstacles
        });

        if (!overlapping) {
          validPosition = true;
        }
        attempts++;
      }

      // If we couldn't find a valid position after 50 attempts, use the last position anyway
      const spirit = new Spirit(this, x, y);
      this.spirits.push(spirit);
    }
  }

  createGifts() {
    const width = GAME_CONFIG.WORLD_WIDTH;
    const height = GAME_CONFIG.WORLD_HEIGHT;
    
    // Spawn 3-5 gifts initially
    const giftCount = Phaser.Math.Between(3, 5);
    
    for (let i = 0; i < giftCount; i++) {
      this.spawnRandomGift();
    }
  }

  spawnRandomGift() {
    const width = GAME_CONFIG.WORLD_WIDTH;
    const height = GAME_CONFIG.WORLD_HEIGHT;
    
    let x, y, attempts = 0;
    let validPosition = false;

    while (!validPosition && attempts < 50) {
      x = Phaser.Math.Between(100, width - 100);
      y = Phaser.Math.Between(100, height - 100);
      
      const overlapping = this.obstacles.getChildren().some(obstacle => {
        const distance = Phaser.Math.Distance.Between(x, y, obstacle.x, obstacle.y);
        return distance < 80;
      });

      if (!overlapping) {
        validPosition = true;
      }
      attempts++;
    }
    
    // Random gift type
    const types = ['element', 'element', 'time', 'magnetism']; // element plus commun
    const type = Phaser.Utils.Array.GetRandom(types);
    
    const gift = new Gift(this, x, y, type);
    this.gifts.push(gift);
  }

  createUI() {
    const camera = this.cameras.main;

    // Timer (fixed to camera)
    this.timerText = this.add.text(camera.width / 2, 30, `Time: ${this.gameTime}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);
    
    // Global Score (fixed to camera, below timer)
    this.globalScoreText = this.add.text(camera.width / 2, 60, `Level ${playerProgress.level} - Score: ${playerProgress.globalScore}`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000);

    // Team scores display (same style as timer, at top-left)
    this.teamScoreTexts = [];
    this.teamScores.forEach((teamData, index) => {
      const x = 120;
      const y = 30 + index * 40;
      
      const scoreText = this.add.text(x, y, '', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(2000);
      
      // Power bar for this team
      const barX = x;
      const barY = y + 20;
      
      const powerBarBg = this.add.rectangle(barX, barY, 104, 8, 0x000000, 0.8);
      powerBarBg.setOrigin(0, 0.5);
      powerBarBg.setScrollFactor(0);
      powerBarBg.setDepth(2001);
      
      const powerBarFill = this.add.rectangle(barX + 2, barY, 0, 4, teamData.element.color, 1);
      powerBarFill.setOrigin(0, 0.5);
      powerBarFill.setScrollFactor(0);
      powerBarFill.setDepth(2002);
      
      // Extra powers icons container (under power bar)
      const extraPowersContainer = this.add.container(barX, barY + 15);
      extraPowersContainer.setScrollFactor(0);
      extraPowersContainer.setDepth(2000);
      
      // Gift power cooldown text
      const giftCooldownText = this.add.text(barX + 110, barY, '', {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#ffaa00',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(2000);
      
      this.teamScoreTexts.push({ 
        text: scoreText, 
        teamId: teamData.teamId,
        powerBarBg,
        powerBarFill,
        extraPowersContainer,
        giftCooldownText
      });
    });

    this.updateScoreDisplay();
  }

  startTimer() {
    // Clear any existing timer
    if (this.gameTimer) {
      this.gameTimer.destroy();
    }
    
    this.gameTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.gameTime--;
        this.timerText.setText(`Time: ${this.gameTime}`);
        
        if (this.gameTime <= 0) {
          this.endGame();
        }
      },
      loop: true
    });
  }

  animateTerrain() {
    // Animate water ponds (ondulation)
    this.obstacles.getChildren().forEach(obstacle => {
      if (obstacle instanceof Phaser.GameObjects.Ellipse && obstacle.fillColor === 0x4a90e2) {
        this.tweens.add({
          targets: obstacle,
          scaleX: { from: 1, to: 1.05 },
          scaleY: { from: 1, to: 1.03 },
          alpha: { from: 0.8, to: 0.9 },
          duration: 3000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });

    // Animate tree foliage (gentle sway)
    this.children.list.forEach(child => {
      if (child instanceof Phaser.GameObjects.Arc && 
          (child.fillColor === 0x2d5016 || child.fillColor === 0x3d6b1f || child.fillColor === 0x4a7c2f)) {
        this.tweens.add({
          targets: child,
          x: child.x + Phaser.Math.Between(-3, 3),
          duration: Phaser.Math.Between(2000, 4000),
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
          delay: Math.random() * 1000
        });
      }
    });

    // Random lightning strikes
    this.time.addEvent({
      delay: Phaser.Math.Between(20000, 40000),
      callback: () => {
        if (Math.random() < 0.3) {
          this.createLightningStrike();
        }
      },
      loop: true
    });
  }

  createLightningStrike() {
    const width = GAME_CONFIG.WORLD_WIDTH;
    const height = GAME_CONFIG.WORLD_HEIGHT;
    const x = Phaser.Math.Between(100, width - 100);
    const y = Phaser.Math.Between(100, height - 100);

    // Flash
    const flash = this.add.rectangle(x, y, 200, 200, 0xffffff, 0.8).setDepth(1000);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy()
    });

    // Lightning bolt
    const bolt = this.add.graphics();
    bolt.lineStyle(3, 0xffff00, 1);
    bolt.lineBetween(x, y - 100, x + Phaser.Math.Between(-20, 20), y);
    bolt.lineBetween(x, y, x + Phaser.Math.Between(-20, 20), y + 50);
    bolt.setDepth(999);

    this.time.delayedCall(300, () => bolt.destroy());

    // Check if it hits a tree to set it on fire
    this.obstacles.getChildren().forEach(obstacle => {
      const distance = Phaser.Math.Distance.Between(x, y, obstacle.x, obstacle.y);
      if (distance < 50 && obstacle instanceof Phaser.GameObjects.Rectangle && obstacle.fillColor === 0x654321) {
        // Tree caught fire!
        const fire = this.add.particles(obstacle.x, obstacle.y - 20, 'white', {
          speed: { min: 20, max: 50 },
          scale: { start: 0.6, end: 0 },
          alpha: { start: 1, end: 0 },
          tint: [0xff4500, 0xff6600, 0xffff00],
          lifespan: 2000,
          frequency: 50
        });

        this.time.delayedCall(5000, () => fire.destroy());
      }
    });
  }

  update(time, delta) {
    // Check ENTER key to return to menu when game is over
    if (this.gameOver && Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.scene.start('MenuScene');
      return;
    }
    
    // If game is over, stop all updates
    if (this.gameOver) {
      return;
    }
    
    // Check ESC key to return to menu
    if (Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.scene.start('MenuScene');
      return;
    }
    
    // Spawn new gifts randomly (every 30-60 seconds)
    this.giftSpawnTimer += delta;
    if (this.giftSpawnTimer > Phaser.Math.Between(30000, 60000)) {
      this.spawnRandomGift();
      this.giftSpawnTimer = 0;
    }
    
    // Update individual player power charges (only for humans)
    this.players.forEach(player => {
      if (player.active && !player.isAI && player.powerCharge < player.maxPowerCharge) {
        player.powerCharge += player.powerChargeRate * (delta / 16.67);
        player.powerCharge = Math.min(player.powerCharge, player.maxPowerCharge);
      }
    });
    
    // Update power bars only for human players
    this.players.forEach((player, index) => {
      if (player.active && !player.isAI) {
        const teamScoreData = this.teamScoreTexts.find(t => t.teamId === player.teamId);
        if (teamScoreData) {
          const fillWidth = (player.powerCharge / player.maxPowerCharge) * 100;
          teamScoreData.powerBarFill.width = fillWidth;
          
          // Flash when full
          if (player.powerCharge >= player.maxPowerCharge) {
            teamScoreData.powerBarFill.alpha = 0.5 + 0.5 * Math.sin(time / 200);
          } else {
            teamScoreData.powerBarFill.alpha = 1;
          }
          
          // Update gift power cooldown display
          if (player.availablePowers && player.availablePowers.length > 1) {
            const timeSinceLastGiftPower = time - player.lastGiftPowerUse;
            const remainingCooldown = player.giftPowerCooldown - timeSinceLastGiftPower;
            
            if (remainingCooldown > 0) {
              const seconds = Math.ceil(remainingCooldown / 1000);
              teamScoreData.giftCooldownText.setText(`Gift: ${seconds}s`);
              teamScoreData.giftCooldownText.setVisible(true);
            } else {
              teamScoreData.giftCooldownText.setText('Gift: Ready');
              teamScoreData.giftCooldownText.setVisible(true);
            }
          } else {
            teamScoreData.giftCooldownText.setVisible(false);
          }
        }
      }
    });
    
    // Update human player
    const humanPlayer = this.players[0];
    if (humanPlayer && humanPlayer.active) {
      this.updatePlayerMovement(humanPlayer);
    }

    // Update AI controllers
    this.aiControllers.forEach(ai => {
      ai.update(time, delta);
    });

    // Update spirit following behavior
    this.updateSpiritFollowing();

    // Check gift collection
    this.checkGiftCollection();

    // Check magnetism effect
    this.checkMagnetismEffect(time, delta);

    // Check spirit collection
    this.checkSpiritCollection();

    // Check base deposits
    this.checkBaseDeposits();

    // Check teammate bonus
    this.checkTeammateBonus();
    
    // Check special zones (sand, tornado, thunder, shadow)
    this.checkSpecialZones(time, delta);

    // Update players
    this.players.forEach(player => {
      if (player.update) {
        player.update(time, delta);
      }
    });

    // Update spirits
    this.spirits.forEach(spirit => {
      if (spirit.update) {
        spirit.update(time);
      }
    });
    
    // Update gifts
    this.gifts.forEach(gift => {
      if (gift.update) {
        gift.update();
      }
    });
  }
  
  checkSpecialZones(time, delta) {
    // Sand zones (slow down players)
    if (this.sandZones) {
      this.players.forEach(player => {
        this.sandZones.forEach(zone => {
          // Skip if caster or ally (if friendly fire off)
          if (zone.player && player === zone.player) return;
          if (zone.player && !this.friendlyFire && player.teamId === zone.player.teamId) return;
          
          const dist = Phaser.Math.Distance.Between(player.x, player.y, zone.x, zone.y);
          if (dist < zone.radius) {
            player.setMaxVelocity(GAME_CONFIG.PLAYER_SPEED * 0.3);
          } else if (!player.inSandZone) {
            player.setMaxVelocity(GAME_CONFIG.PLAYER_SPEED);
          }
          player.inSandZone = dist < zone.radius;
        });
      });
    }
    
    // Tornado zones (spin and throw after 2 seconds)
    if (this.tornadoZones) {
      this.tornadoZones.forEach(zone => {
        zone.elapsed += delta;
        this.players.forEach(player => {
          // Skip if this is the tornado creator
          if (zone.player && player === zone.player) return;
          
          const dist = Phaser.Math.Distance.Between(player.x, player.y, zone.x, zone.y);
          if (dist < zone.radius) {
            if (!player.inTornado) {
              player.inTornado = true;
              player.tornadoStartTime = time;
            }
            
            const inTornadoDuration = time - player.tornadoStartTime;
            if (inTornadoDuration > 2000) {
              // Throw player out
              const angle = Phaser.Math.Angle.Between(zone.x, zone.y, player.x, player.y);
              this.physics.velocityFromRotation(angle, 500, player.body.velocity);
              player.inTornado = false;
            } else {
              // Spin player
              const angle = (time / 100) % (Math.PI * 2);
              player.x = zone.x + Math.cos(angle) * (zone.radius * 0.7);
              player.y = zone.y + Math.sin(angle) * (zone.radius * 0.7);
            }
          } else {
            player.inTornado = false;
          }
        });
      });
    }
    
    // Ice zones (freeze players who enter)
    if (this.iceZones) {
      this.players.forEach(player => {
        let inAnyIceZone = false;
        this.iceZones.forEach(zone => {
          // Skip if caster or ally (if friendly fire on)
          if (zone.player && player === zone.player) return;
          if (this.friendlyFire && zone.player && player.teamId === zone.player.teamId) return;
          
          const dist = Phaser.Math.Distance.Between(player.x, player.y, zone.x, zone.y);
          if (dist < zone.radius) {
            inAnyIceZone = true;
            if (!player.frozen) {
              player.frozen = true;
              player.setVelocity(0, 0);
              player.setTint(0x87ceeb);
            }
          }
        });
        
        // Unfreeze if no longer in any ice zone
        if (!inAnyIceZone && player.frozen) {
          player.frozen = false;
          player.clearTint();
        }
      });
    }
    
    // Thunder zones (teleport and steal spirits)
    if (this.thunderZones && this.spirits) {
      this.thunderZones.forEach(zone => {
        zone.elapsed += delta;
        if (!zone.base) return; // Sécurité
        
        this.players.forEach(player => {
          // Skip if caster or ally (if friendly fire off)
          if (player === zone.player) return;
          if (!this.friendlyFire && player.teamId === zone.player.teamId) return;
          
          if (player.teamId !== zone.player.teamId || this.friendlyFire) {
            const dist = Phaser.Math.Distance.Between(player.x, player.y, zone.x, zone.y);
            if (dist < zone.radius) {
              // Teleport to caster's base
              player.x = zone.base.x;
              player.y = zone.base.y + 80;
              
              // Steal spirits
              const spiritCount = this.spirits.filter(s => s.followingPlayer === player).length;
              this.spirits.forEach(spirit => {
                if (spirit.followingPlayer === player) {
                  spirit.setFollowPlayer(null);
                  spirit.setActive(false).setVisible(false);
                }
              });
              
              const teamScore = this.teamScores.find(ts => ts.teamId === zone.player.teamId);
              if (teamScore) {
                teamScore.score += spiritCount;
              }
              this.updateScoreDisplay();
            }
          }
        });
      });
    }
    
    // Shadow zones (disappear for 5 seconds + magnetize caster + magnetize ALL spirits)
    if (this.shadowZones) {
      this.shadowZones.forEach(zone => {
        zone.elapsed += delta;
        
        // Magnetize ALL spirits towards SHADOW PLAYER like Iron power when he's in the zone
        if (this.spirits && zone.magnetize && zone.caster) {
          const casterInZone = Phaser.Math.Distance.Between(zone.caster.x, zone.caster.y, zone.x, zone.y) < zone.radius;
          
          // Only magnetize if Shadow is inside the black zone
          if (casterInZone) {
            // Use same magnetism as Iron - direct attachment
            this.spirits.forEach(spirit => {
              if (!spirit.active) return;
              
              const distanceToShadow = Phaser.Math.Distance.Between(
                zone.caster.x, zone.caster.y,
                spirit.x, spirit.y
              );
              
              const magnetArea = zone.magnetRadius || (zone.radius * 1.5); // 5 tiles
              
              // Attach spirits in range directly to Shadow (like Iron)
              if (distanceToShadow < magnetArea && spirit.followingPlayer !== zone.caster) {
                spirit.setFollowPlayer(zone.caster);
              }
            });
          } else {
            // Shadow left the zone - stop magnetism (spirits stay attached but no new ones)
            // Spirits already attached will continue following
          }
        }
        
        this.players.forEach(player => {
          const dist = Phaser.Math.Distance.Between(player.x, player.y, zone.x, zone.y);
          
          // Make Shadow caster VERY visible in the black zone with bright outline
          if (zone.caster && player === zone.caster) {
            if (dist < zone.radius) {
              // Create visible white outline around Shadow
              if (!player.shadowOutline) {
                player.shadowOutline = this.add.circle(player.x, player.y, 35, 0xffffff, 0);
                player.shadowOutline.setStrokeStyle(4, 0xffffff, 1);
                player.shadowOutline.setDepth(player.depth + 1);
              }
              player.shadowOutline.setPosition(player.x, player.y);
              player.shadowOutline.setVisible(true);
            } else {
              // Hide outline when outside
              if (player.shadowOutline) {
                player.shadowOutline.setVisible(false);
              }
            }
          }
          
          // Magnetize ONLY the caster (Shadow player) when close to zone
          const magnetArea = zone.magnetRadius || (zone.radius * 1.5);
          if (zone.caster && player === zone.caster && dist < magnetArea && zone.magnetize && !player.disappeared && player.body) {
            const angle = Phaser.Math.Angle.Between(player.x, player.y, zone.x, zone.y);
            const pullForce = 300; // Stronger pull speed for Shadow player
            
            // Apply acceleration towards the zone center
            player.body.setAcceleration(
              Math.cos(angle) * pullForce,
              Math.sin(angle) * pullForce
            );
          } else if (player === zone.caster && player.body) {
            // Reset acceleration when out of range
            player.body.setAcceleration(0, 0);
          }
          
          // Skip disappear effect if caster (Shadow not affected)
          if (zone.player && player === zone.player) return;
          
          // Skip disappear effect for allies if friendly fire is on
          if (this.friendlyFire && zone.player && player.teamId === zone.player.teamId) return;
          
          // Disappear effect for enemies
          if (dist < zone.radius && !player.disappeared) {
            player.disappeared = true;
            player.setAlpha(0);
            player.setActive(false);
            this.time.delayedCall(5000, () => {
              player.disappeared = false;
              player.setAlpha(1);
              player.setActive(true);
            });
          }
        });
      });
    }
  }

  updateSpiritFollowing() {
    this.spirits.forEach((spirit, index) => {
      if (spirit.followingPlayer && spirit.active) {
        spirit.followPlayer(this.spirits);
      }
    });
  }

  updatePlayerMovement(player) {
    // Debug mode: unlimited powers
    const canUsePrimaryPower = this.debugMode || player.canUsePower();
    
    // Check for power activation (Space key - primary element)
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && canUsePrimaryPower) {
      this.powerSystem.activatePower(player, player.element.key);
    }
    
    // Check for extra power activation (number keys 1, 2, 3) with cooldown
    if (player.availablePowers && player.availablePowers.length > 1) {
      const timeSinceLastGiftPower = this.time.now - player.lastGiftPowerUse;
      const canUseGiftPower = this.debugMode || timeSinceLastGiftPower >= player.giftPowerCooldown;
      
      if (Phaser.Input.Keyboard.JustDown(this.key1) && player.availablePowers.length > 1 && canUseGiftPower) {
        this.powerSystem.activatePower(player, player.availablePowers[1]);
        player.lastGiftPowerUse = this.time.now;
      }
      if (Phaser.Input.Keyboard.JustDown(this.key2) && player.availablePowers.length > 2 && canUseGiftPower) {
        this.powerSystem.activatePower(player, player.availablePowers[2]);
        player.lastGiftPowerUse = this.time.now;
      }
      if (Phaser.Input.Keyboard.JustDown(this.key3) && player.availablePowers.length > 3 && canUseGiftPower) {
        this.powerSystem.activatePower(player, player.availablePowers[3]);
        player.lastGiftPowerUse = this.time.now;
      }
    }

    // Check if player is frozen
    if (player.frozen) {
      player.setVelocity(0, 0);
      return;
    }

    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      velocityX = -GAME_CONFIG.PLAYER_SPEED;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      velocityX = GAME_CONFIG.PLAYER_SPEED;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      velocityY = -GAME_CONFIG.PLAYER_SPEED;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      velocityY = GAME_CONFIG.PLAYER_SPEED;
    }

    player.setVelocity(velocityX, velocityY);
  }

  checkGiftCollection() {
    this.players.forEach(player => {
      if (!player.active) return;

      this.gifts.forEach((gift, index) => {
        const distance = Phaser.Math.Distance.Between(
          player.x, player.y,
          gift.x, gift.y
        );

        if (distance < 50) {
          // Collect gift!
          this.collectGift(player, gift, index);
        }
      });
    });
  }

  collectGift(player, gift, index) {
    const teamScore = this.teamScores.find(ts => ts.teamId === player.teamId);
    if (!teamScore) return;

    // Visual effect
    const flash = this.add.circle(gift.x, gift.y, 50, gift.getGlowColor(gift.type), 0.8);
    this.tweens.add({
      targets: flash,
      scale: 3,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy()
    });

    // Apply gift effect
    switch(gift.type) {
      case 'element':
        // Add random power to team with limit (only unlocked elements)
        const elements = Object.values(ELEMENTS);
        
        // Filter to only unlocked elements for human players
        const humanPlayer = this.players.find(p => !p.isAI && p.teamId === player.teamId);
        const playerLevel = humanPlayer && !humanPlayer.isAI ? playerProgress.level : 1;
        
        const availableElements = elements.filter(e => 
          !teamScore.extraPowers.includes(e.key) && 
          e.key !== teamScore.element.key &&
          e.requiredLevel <= playerLevel  // Only unlocked elements
        );
        
        if (availableElements.length > 0) {
          const randomElement = Phaser.Utils.Array.GetRandom(availableElements);
          
          // Check if at max capacity
          if (teamScore.extraPowers.length >= GAME_CONFIG.MAX_GIFT_POWERS) {
            // Remove oldest gift power (first in array)
            const removedPower = teamScore.extraPowers.shift();
            // Remove from all team players
            this.players.forEach(p => {
              if (p.teamId === player.teamId) {
                p.removePower(removedPower);
              }
            });
          }
          
          teamScore.extraPowers.push(randomElement.key);
          
          // Add power to all team players
          this.players.forEach(p => {
            if (p.teamId === player.teamId) {
              p.addPower(randomElement.key);
            }
          });
          
          // Notification
          this.showNotification(gift.x, gift.y, `+${randomElement.name} Power!`, randomElement.color);
        }
        break;

      case 'time':
        // Add 20 seconds
        this.gameTime += 20;
        this.timerText.setText(`Time: ${this.gameTime}`);
        this.showNotification(gift.x, gift.y, '+20 Seconds!', 0x00ffff);
        break;

      case 'magnetism':
        // Activate magnetism for 10 seconds
        player.magnetismActive = true;
        player.magnetismEndTime = this.time.now + 10000;
        player.setTint(0xffff00);
        this.showNotification(gift.x, gift.y, 'Magnetism!', 0xffff00);
        
        this.time.delayedCall(10000, () => {
          if (player.magnetismActive) {
            player.magnetismActive = false;
            player.clearTint();
          }
        });
        break;
    }

    // Remove gift
    this.gifts.splice(index, 1);
    gift.destroy();
    
    this.updateScoreDisplay();
  }

  showNotification(x, y, text, color) {
    const notification = this.add.text(x, y, text, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#' + color.toString(16).padStart(6, '0'),
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(3000);

    this.tweens.add({
      targets: notification,
      y: y - 50,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => notification.destroy()
    });
  }

  checkMagnetismEffect(time, delta) {
    this.players.forEach(player => {
      if (!player.active || !player.magnetismActive) return;
      
      const magnetRadius = GAME_CONFIG.TILE_SIZE * 3;
      
      // Attract ALL spirits in range (free spirits AND spirits following other players)
      this.spirits.forEach(spirit => {
        if (!spirit.active) return;
        
        const distance = Phaser.Math.Distance.Between(
          player.x, player.y,
          spirit.x, spirit.y
        );
        
        if (distance < magnetRadius) {
          // Steal spirit from other player or attract free spirit
          if (spirit.followingPlayer !== player) {
            spirit.setFollowPlayer(player);
          }
        }
      });
    });
  }

  checkSpiritCollection() {
    this.players.forEach((player, playerIndex) => {
      if (!player.active) return;
      if (player.poisoned) return; // Can't collect if poisoned

      this.spirits.forEach(spirit => {
        if (!spirit.active) return;

        const distance = Phaser.Math.Distance.Between(
          player.x, player.y,
          spirit.x, spirit.y
        );

        if (distance < GAME_CONFIG.SPIRIT_COLLECT_DISTANCE) {
          // Can't steal if invincible
          if (spirit.followingPlayer && spirit.followingPlayer.invincible && spirit.followingPlayer !== player) {
            return;
          }
          
          // If spirit is already following someone else, steal it
          if (spirit.followingPlayer && spirit.followingPlayer !== player) {
            const oldPlayer = spirit.followingPlayer;
            const oldTeam = oldPlayer.teamId;
            
            // Remove from old team score
            this.teamScores.find(ts => ts.teamId === oldTeam).score--;
            
            // Add to new team score  
            this.teamScores.find(ts => ts.teamId === player.teamId).score++;
            
            // Transfer spirit with correct index
            const playerSpiritCount = this.spirits.filter(s => s.followingPlayer === player).length;
            spirit.setFollowPlayer(player, playerSpiritCount);
            player.collectSpirit(spirit);
            
            this.updateScoreDisplay();
          }
          // If spirit is free, collect it
          else if (!spirit.followingPlayer) {
            const playerSpiritCount = this.spirits.filter(s => s.followingPlayer === player).length;
            spirit.setFollowPlayer(player, playerSpiritCount);
            player.collectSpirit(spirit);
            
            this.teamScores.find(ts => ts.teamId === player.teamId).score++;
            this.updateScoreDisplay();
          }
        }
      });
    });
  }

  checkBaseDeposits() {
    this.players.forEach(player => {
      if (!player.active) return;

      // Find player's team base
      const teamBase = this.teamBases.find(base => base.teamId === player.teamId);
      if (!teamBase) return;

      // Check if player is near their base
      const distance = Phaser.Math.Distance.Between(
        player.x, player.y,
        teamBase.x, teamBase.y
      );

      if (distance < GAME_CONFIG.BASE_DEPOSIT_DISTANCE) {
        // Get all spirits following this player
        const playerSpirits = this.spirits.filter(s => s.followingPlayer === player && s.active);
        
        if (playerSpirits.length > 0) {
          // Deposit all spirits
          playerSpirits.forEach(spirit => {
            // Animation de dépôt
            this.tweens.add({
              targets: spirit,
              x: teamBase.x,
              y: teamBase.y,
              scale: 0,
              alpha: 0,
              duration: 500,
              ease: 'Power2',
              onComplete: () => {
                spirit.followingPlayer = null;
                spirit.setActive(false).setVisible(false);
                
                // Respawn after delay
                this.time.delayedCall(GAME_CONFIG.SPIRIT_RESPAWN_TIME, () => {
                  this.respawnSpirit(spirit);
                });
              }
            });

            // Visual effect - flash
            const flash = this.add.circle(teamBase.x, teamBase.y, 30, player.element.color, 0.6);
            this.tweens.add({
              targets: flash,
              scale: 2,
              alpha: 0,
              duration: 500,
              onComplete: () => flash.destroy()
            });
          });

          // Update deposited count
          teamBase.depositedSpirits += playerSpirits.length;
          
          // Find team score and update
          const teamScore = this.teamScores.find(ts => ts.teamId === player.teamId);
          if (teamScore) {
            teamScore.score += playerSpirits.length;
          }
          
          // Visual feedback - simple flash without scale
          this.tweens.add({
            targets: teamBase.graphics,
            alpha: { from: 1, to: 0.5 },
            duration: 150,
            yoyo: true,
            ease: 'Power2'
          });

          this.updateScoreDisplay();
        }
      }
    });
  }

  respawnSpirit(spirit) {
    const width = GAME_CONFIG.WORLD_WIDTH;
    const height = GAME_CONFIG.WORLD_HEIGHT;

    let x, y, validPosition = false, attempts = 0;
    
    while (!validPosition && attempts < 50) {
      x = Phaser.Math.Between(100, width - 100);
      y = Phaser.Math.Between(100, height - 100);

      const overlapping = this.obstacles.getChildren().some(obstacle => {
        const distance = Phaser.Math.Distance.Between(x, y, obstacle.x, obstacle.y);
        return distance < 50;
      });

      if (!overlapping) {
        validPosition = true;
      }
      attempts++;
    }

    spirit.setPosition(x, y);
    spirit.setActive(true).setVisible(true);
    spirit.setAlpha(1).setScale(1);
    spirit.followingPlayer = null;

    // Apparition effect
    this.tweens.add({
      targets: spirit,
      scale: { from: 0, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 500,
      ease: 'Back.easeOut'
    });
  }

  checkTeammateBonus() {
    // Track which pairs have already gotten bonus this frame
    if (!this.bonusCooldowns) {
      this.bonusCooldowns = new Map();
    }

    this.players.forEach((player1, i) => {
      if (!player1.active) return;

      this.players.slice(i + 1).forEach(player2 => {
        if (!player2.active) return;
        if (player1.teamId !== player2.teamId) return; // Must be same team

        const distance = Phaser.Math.Distance.Between(
          player1.x, player1.y,
          player2.x, player2.y
        );

        const pairKey = `${Math.min(player1.playerId, player2.playerId)}-${Math.max(player1.playerId, player2.playerId)}`;

        if (distance < 60) {
          // Check cooldown
          const lastBonus = this.bonusCooldowns.get(pairKey) || 0;
          if (this.time.now - lastBonus > 10000) { // 10 seconds cooldown
            // Give bonus!
            this.teamScores[player1.teamId].score += 3;
            this.bonusCooldowns.set(pairKey, this.time.now);
            this.updateScoreDisplay();

            // Visual effect
            const midX = (player1.x + player2.x) / 2;
            const midY = (player1.y + player2.y) / 2;

            // Bonus text
            const bonusText = this.add.text(midX, midY, '+3 BONUS!', {
              fontSize: '24px',
              fontFamily: 'Arial',
              color: '#ffff00',
              fontStyle: 'bold',
              stroke: '#ff0000',
              strokeThickness: 4
            }).setOrigin(0.5).setDepth(3000);

            this.tweens.add({
              targets: bonusText,
              y: midY - 50,
              alpha: 0,
              duration: 1500,
              ease: 'Power2',
              onComplete: () => bonusText.destroy()
            });

            // Particle burst
            const particles = this.add.particles(midX, midY, 'white', {
              speed: { min: 100, max: 200 },
              scale: { start: 0.6, end: 0 },
              alpha: { start: 1, end: 0 },
              tint: [0xffff00, 0xffd700, 0xffa500],
              lifespan: 800,
              quantity: 20,
              emitting: false
            });
            particles.explode();

            // Ring effect
            const ring = this.add.circle(midX, midY, 10, 0xffff00, 0.6).setDepth(2999);
            this.tweens.add({
              targets: ring,
              scale: 3,
              alpha: 0,
              duration: 600,
              ease: 'Power2',
              onComplete: () => ring.destroy()
            });
          }
        }
      });
    });
  }

  updateScoreDisplay() {
    // Sort by score
    const sortedScores = [...this.teamScores].sort((a, b) => b.score - a.score);

    // Show all teams with their element names and colors
    sortedScores.forEach((teamData, index) => {
      if (index < this.teamScoreTexts.length) {
        const text = `${teamData.element.name}: ${teamData.score}`;
        this.teamScoreTexts[index].text.setText(text);
        this.teamScoreTexts[index].text.setColor('#' + teamData.element.color.toString(16).padStart(6, '0'));
        this.teamScoreTexts[index].text.setVisible(true);
        
        // Update power bar position to follow the score text
        const scoreData = this.teamScoreTexts.find(t => t.teamId === teamData.teamId);
        if (scoreData) {
          const x = 120;
          const y = 30 + index * 40;
          const barY = y + 20;
          
          scoreData.powerBarBg.setPosition(x, barY);
          scoreData.powerBarFill.setPosition(x + 2, barY);
          
          // Update extra powers display with icons
          scoreData.extraPowersContainer.removeAll(true);
          scoreData.extraPowersContainer.setPosition(x, barY + 15);
          
          if (teamData.extraPowers && teamData.extraPowers.length > 0) {
            teamData.extraPowers.forEach((key, iconIndex) => {
              const element = Object.values(ELEMENTS).find(e => e.key === key);
              if (element) {
                // Create icon circle
                const icon = this.add.circle(iconIndex * 18, 0, 7, element.color, 1);
                icon.setStrokeStyle(1, 0xffffff);
                
                // Add first letter of element name
                const letter = this.add.text(iconIndex * 18, 0, element.name.charAt(0), {
                  fontSize: '10px',
                  fontFamily: 'Arial',
                  color: '#ffffff',
                  fontStyle: 'bold'
                }).setOrigin(0.5);
                
                scoreData.extraPowersContainer.add(icon);
                scoreData.extraPowersContainer.add(letter);
              }
            });
            scoreData.extraPowersContainer.setVisible(true);
          } else {
            scoreData.extraPowersContainer.setVisible(false);
          }
        }
      }
    });
    
    // Hide unused score texts
    for (let i = sortedScores.length; i < this.teamScoreTexts.length; i++) {
      this.teamScoreTexts[i].text.setVisible(false);
      if (this.teamScoreTexts[i].extraPowersContainer) {
        this.teamScoreTexts[i].extraPowersContainer.setVisible(false);
      }
      if (this.teamScoreTexts[i].giftCooldownText) {
        this.teamScoreTexts[i].giftCooldownText.setVisible(false);
      }
    }
  }

  endGame() {
    // Mark game as over
    this.gameOver = true;
    
    // Stop the timer
    if (this.gameTimer) {
      this.gameTimer.destroy();
      this.gameTimer = null;
    }
    
    // Stop all players
    this.players.forEach(player => {
      if (player.active) {
        player.setVelocity(0, 0);
      }
    });

    // Find winning team
    const activeTeams = [...new Set(this.players.map(p => p.teamId))];
    const activeScores = this.teamScores.filter(team => activeTeams.includes(team.teamId));
    const sortedScores = [...activeScores].sort((a, b) => b.score - a.score);
    const winningTeam = sortedScores[0];
    
    // Check if human player won (team 0)
    const humanPlayer = this.players.find(p => !p.isAI);
    let pointsEarned = 0;
    if (humanPlayer && humanPlayer.teamId === winningTeam.teamId) {
      // Human player won! Add victory points
      pointsEarned = playerProgress.addVictory(winningTeam.score);
    }

    // Show game over screen
    const camera = this.cameras.main;

    const overlay = this.add.rectangle(
      camera.width / 2, 
      camera.height / 2, 
      camera.width, 
      camera.height, 
      0x000000, 
      0.8
    ).setScrollFactor(0).setDepth(3000);
    
    this.add.text(camera.width / 2, camera.height / 2 - 100, 'GAME OVER!', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);

    this.add.text(camera.width / 2, camera.height / 2, `${winningTeam.element.name} Team Wins!`, {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#' + winningTeam.element.color.toString(16).padStart(6, '0'),
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);

    this.add.text(camera.width / 2, camera.height / 2 + 60, `Spirits Collected: ${winningTeam.score}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
    
    // Show victory bonus if human won
    if (pointsEarned > 0) {
      this.add.text(camera.width / 2, camera.height / 2 + 100, `+${pointsEarned} XP! Level ${playerProgress.level} - Total: ${playerProgress.globalScore}`, {
        fontSize: '22px',
        fontFamily: 'Arial',
        color: '#00ff00',
        fontStyle: 'bold'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
    }
    
    this.add.text(camera.width / 2, camera.height / 2 + 140, 'Press ENTER to return to menu', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(3000);
  }
}
