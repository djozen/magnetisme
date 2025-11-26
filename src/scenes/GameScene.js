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

    // Create human player (always first)
    const humanTeam = teams[0];
    const humanPlayer = new Player(
      this,
      width / 4,
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
      
      // Position based on team
      const teamIndex = teamInfo.teamId;
      const angle = (teamIndex / GAME_CONFIG.MAX_TEAMS) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.35;
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius;

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

    // Initialize team scores
    this.teamScores = [];
    for (let i = 0; i < GAME_CONFIG.MAX_TEAMS; i++) {
      this.teamScores.push({
        teamId: i,
        score: 0,
        color: TEAM_COLORS[i]
      });
    }
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
    
    // Camera follows human player smoothly
    this.cameras.main.startFollow(humanPlayer, true, 0.08, 0.08);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, GAME_CONFIG.WORLD_WIDTH, GAME_CONFIG.WORLD_HEIGHT);
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

    // Team scores display
    this.teamScoreTexts = [];
    this.teamScores.forEach((teamData, index) => {
      const x = 20;
      const y = 70 + index * 40;
      
      const scoreText = this.add.text(x, y, '', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 3
      }).setScrollFactor(0).setDepth(2000);
      
      this.teamScoreTexts.push(scoreText);
    });

    this.updateScoreDisplay();
  }

  startTimer() {
    this.time.addEvent({
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
            
            // Transfer spirit
            spirit.setFollowPlayer(player, playerIndex);
            this.updateScoreDisplay();
          }
          // If spirit is free, collect it
          else if (!spirit.followingPlayer) {
            spirit.setFollowPlayer(player, playerIndex);
            this.teamScores[player.teamId].score++;
            this.updateScoreDisplay();
          }
        }
      });
    });
  }

  updateScoreDisplay() {
    // Sort team scores
    const sortedScores = [...this.teamScores].sort((a, b) => b.score - a.score);

    sortedScores.forEach((teamData, index) => {
      const text = `Team ${teamData.teamId + 1}: ${teamData.score} spirits`;
      
      this.teamScoreTexts[index].setText(text);
      this.teamScoreTexts[index].setColor('#' + teamData.color.toString(16).padStart(6, '0'));
    });
  }

  endGame() {
    // Find winning team
    const sortedScores = [...this.teamScores].sort((a, b) => b.score - a.score);
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

    this.add.text(camera.width / 2, camera.height / 2, `Team ${winningTeam.teamId + 1} Wins!`, {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#' + winningTeam.color.toString(16).padStart(6, '0'),
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
