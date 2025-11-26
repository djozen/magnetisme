import Phaser from 'phaser';
import { ELEMENTS, GAME_CONFIG, TEAM_COLORS } from '../config.js';
import Player from '../entities/Player.js';
import Spirit from '../entities/Spirit.js';
import AIController from '../ai/AIController.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    this.players = [];
    this.spirits = [];
    this.aiControllers = [];
    this.gameTime = GAME_CONFIG.GAME_TIME;
    this.teamScores = [];
  }

  init(data) {
    this.playerElement = data.playerElement;
    this.humanPlayerCount = data.playerCount || 1;
    this.teamAssignments = data.teamAssignments || null;
  }

  create() {
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

    // Create grid-based maze pattern with MORE obstacles
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * tileSize + tileSize / 2;
        const y = row * tileSize + tileSize / 2;

        // Create pattern: obstacles on alternating grid positions
        const isObstacle = (row % 2 === 1 && col % 2 === 1);
        
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
        
        // Add MORE random obstacles in walkable areas
        else if (Math.random() < 0.25 && row > 0 && col > 0) {
          if (Math.random() < 0.6) {
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
    const totalPlayers = this.humanPlayerCount === 1 ? 4 : GAME_CONFIG.MAX_PLAYERS;
    
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

      // Select element
      const usedElements = this.players.map(p => p.element);
      const availableElements = elements.filter(e => 
        !usedElements.includes(e) || usedElements.length >= elements.length
      );
      const element = Phaser.Utils.Array.GetRandom(availableElements);

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
          element: p.element
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
      return graphics;
    }

    const graphics = this.add.graphics();
    
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
        this.add.text(x, y + size * 0.7, 'MOUNTAIN', {
          fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
          stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);
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
        this.add.text(x, y + size * 0.8, 'FIRE ZONE', {
          fontSize: '20px', color: '#ffff00', fontStyle: 'bold',
          stroke: '#ff0000', strokeThickness: 4
        }).setOrigin(0.5);
        break;

      case 'thunder':
        // Arbre avec foudre continue
        graphics.fillStyle(0x654321, 1);
        graphics.fillRect(x - 15, y - 30, 30, 80);
        graphics.fillStyle(0x2d5016, 1);
        graphics.fillCircle(x, y - 40, 50);
        this.time.addEvent({
          delay: 2000,
          callback: () => {
            const bolt = this.add.graphics();
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
        this.add.text(x, y + size * 0.8, 'THUNDER TREE', {
          fontSize: '20px', color: '#ffff00', fontStyle: 'bold',
          stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);
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
        this.add.text(x, y + size * 0.9, 'LAKE', {
          fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
          stroke: '#0000ff', strokeThickness: 4
        }).setOrigin(0.5);
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
        this.add.text(x, y + size * 0.8, 'SAND BANK', {
          fontSize: '20px', color: '#8b4513', fontStyle: 'bold',
          stroke: '#ffffff', strokeThickness: 4
        }).setOrigin(0.5);
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
        this.add.text(x, y + size * 0.7, 'ICE CITY', {
          fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
          stroke: '#00bfff', strokeThickness: 4
        }).setOrigin(0.5);
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
        this.add.text(x, y + size * 0.9, 'LOTUS', {
          fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
          stroke: '#006400', strokeThickness: 4
        }).setOrigin(0.5);
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
        this.add.text(x, y + size * 0.9, 'TORNADO', {
          fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
          stroke: '#4682b4', strokeThickness: 4
        }).setOrigin(0.5);
        break;

      case 'wood':
        // Arbre géant
        graphics.fillStyle(0x8b4513, 1);
        graphics.fillRect(x - 30, y - size, 60, size * 1.5);
        graphics.fillStyle(0x2d5016, 1);
        graphics.fillCircle(x, y - size, size * 1.2);
        graphics.fillStyle(0x3d6b1f, 0.9);
        graphics.fillCircle(x, y - size * 1.2, size * 0.9);
        this.add.text(x, y + size * 0.8, 'GIANT TREE', {
          fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
          stroke: '#654321', strokeThickness: 4
        }).setOrigin(0.5);
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
        this.add.text(x, y + size * 0.8, 'PLASMA PLANT', {
          fontSize: '18px', color: '#ff1493', fontStyle: 'bold',
          stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);
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
        this.add.text(x, y + size * 0.7, 'TOXIC PLANT', {
          fontSize: '18px', color: '#00ff00', fontStyle: 'bold',
          stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);
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
        this.add.text(x, y + size * 0.8, 'MIRROR PALACE', {
          fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
          stroke: '#87ceeb', strokeThickness: 4
        }).setOrigin(0.5);
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
        this.add.text(x, y + size * 1.1, 'LIGHT ZONE', {
          fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
          stroke: '#ffd700', strokeThickness: 4
        }).setOrigin(0.5);
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
        this.add.text(x, y + size * 0.9, 'BLACK HOLE', {
          fontSize: '20px', color: '#9400d3', fontStyle: 'bold',
          stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);
        break;

      default:
        // Fallback - cercle simple
        graphics.fillStyle(element.color, 0.6);
        graphics.fillCircle(x, y, size);
        this.add.text(x, y, element.name.toUpperCase(), {
          fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
          stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);
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

    // Team scores display (fixed top-left)
    this.teamScoreTexts = [];
    this.teamScores.forEach((teamData, index) => {
      const x = 20;
      const y = 70 + index * 35;
      
      // Background box
      const bg = this.add.rectangle(x, y, 200, 30, 0x000000, 0.5)
        .setOrigin(0, 0.5)
        .setScrollFactor(0)
        .setDepth(1999);
      
      const scoreText = this.add.text(x + 10, y, '', {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(2000);
      
      this.teamScoreTexts.push({ text: scoreText, bg: bg });
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

    // Check spirit collection
    this.checkSpiritCollection();

    // Check base deposits
    this.checkBaseDeposits();

    // Check teammate bonus
    this.checkTeammateBonus();

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
  }

  updateSpiritFollowing() {
    this.spirits.forEach((spirit, index) => {
      if (spirit.followingPlayer && spirit.active) {
        spirit.followPlayer(this.spirits);
      }
    });
  }

  updatePlayerMovement(player) {
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

  checkSpiritCollection() {
    this.players.forEach((player, playerIndex) => {
      if (!player.active) return;

      this.spirits.forEach(spirit => {
        if (!spirit.active) return;

        const distance = Phaser.Math.Distance.Between(
          player.x, player.y,
          spirit.x, spirit.y
        );

        if (distance < GAME_CONFIG.SPIRIT_COLLECT_DISTANCE) {
          // If spirit is already following someone else, steal it
          if (spirit.followingPlayer && spirit.followingPlayer !== player) {
            const oldPlayer = spirit.followingPlayer;
            const oldTeam = oldPlayer.teamId;
            
            // Remove from old team score
            this.teamScores[oldTeam].score--;
            
            // Add to new team score
            this.teamScores[player.teamId].score++;
            
            // Transfer spirit with correct index
            const playerSpiritCount = this.spirits.filter(s => s.followingPlayer === player).length;
            spirit.setFollowPlayer(player, playerSpiritCount);
            this.updateScoreDisplay();
          }
          // If spirit is free, collect it
          else if (!spirit.followingPlayer) {
            const playerSpiritCount = this.spirits.filter(s => s.followingPlayer === player).length;
            spirit.setFollowPlayer(player, playerSpiritCount);
            this.teamScores[player.teamId].score++;
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

    // Hide all text first
    this.teamScoreTexts.forEach(item => {
      item.text.setVisible(false);
      item.bg.setVisible(false);
    });

    // Show all teams with their element names
    sortedScores.forEach((teamData, index) => {
      if (index < this.teamScoreTexts.length) {
        const text = `${teamData.element.name}: ${teamData.score}`;
        this.teamScoreTexts[index].text.setText(text);
        this.teamScoreTexts[index].text.setColor('#' + teamData.element.color.toString(16).padStart(6, '0'));
        this.teamScoreTexts[index].text.setVisible(true);
        this.teamScoreTexts[index].bg.setVisible(true);
      }
    });
  }

  endGame() {
    // Stop the timer
    if (this.gameTimer) {
      this.gameTimer.destroy();
      this.gameTimer = null;
    }

    // Find winning team
    const activeTeams = [...new Set(this.players.map(p => p.teamId))];
    const activeScores = this.teamScores.filter(team => activeTeams.includes(team.teamId));
    const sortedScores = [...activeScores].sort((a, b) => b.score - a.score);
    const winningTeam = sortedScores[0];

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

    // Return to menu button
    const button = this.add.text(camera.width / 2, camera.height / 2 + 150, 'Return to Menu', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setScrollFactor(0).setDepth(3000);

    button.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });
  }
}
