import { GAME_CONFIG } from '../config.js';

export default class AIController {
  constructor(scene, player, playerSpeed) {
    this.scene = scene;
    this.player = player;
    this.target = null;
    this.updateInterval = 100; // Much faster decision updates (was 200)
    this.lastUpdate = 0;
    this.state = 'COLLECT';
    
    // Agressivité proportionnelle au niveau (1-20)
    const playerLevel = scene.debugMode ? GAME_CONFIG.DEBUG_LEVEL : (scene.playerProgress?.level || 1);
    const levelRatio = (playerLevel - 1) / 19; // 0.0 (niveau 1) à 1.0 (niveau 20)
    this.aggressiveness = 0.6 + (levelRatio * 0.5) + (Math.random() * 0.1); // 0.6-0.7 (lvl 1) à 1.1-1.2 (lvl 20)
    
    // Rôle stratégique de l'IA - Équilibré par équipe
    // Assure qu'il y a un mix de rôles dans chaque équipe
    const teamId = player.teamId;
    const teamPlayers = scene.players.filter(p => p.teamId === teamId && p.isAI);
    const teamIndex = teamPlayers.length; // Index dans l'équipe
    
    // Distribution équilibrée: 1er = COLLECTOR, 2e = ATTACKER, 3e+ = BALANCED
    if (teamIndex === 0) {
      this.role = 'COLLECTOR'; // Premier de l'équipe = Récolteur
      this.collectPriority = 0.9;
      this.attackPriority = 0.2;
    } else if (teamIndex === 1) {
      this.role = 'ATTACKER'; // Deuxième = Attaquant
      this.collectPriority = 0.3;
      this.attackPriority = 0.9;
    } else {
      // Les autres sont équilibrés
      const roleRandom = Math.random();
      if (roleRandom < 0.5) {
        this.role = 'COLLECTOR';
        this.collectPriority = 0.9;
        this.attackPriority = 0.2;
      } else {
        this.role = 'BALANCED';
        this.collectPriority = 0.6;
        this.attackPriority = 0.6;
      }
    }
    
    // Stratégie dynamique
    this.strategyTimer = 0;
    this.strategyInterval = Phaser.Math.Between(8000, 15000); // Change de stratégie toutes les 8-15 secondes
    this.currentStrategy = 'COLLECT'; // COLLECT, ATTACK, SUPPORT
    
    this.returnTimer = 0;
    this.returnInterval = Phaser.Math.Between(15000, 25000); // Return every 15-25 seconds (much longer)
    this.lastPowerUse = Date.now(); // Initialize to current time to prevent immediate use
    this.powerCooldown = 20000; // 20 seconds cooldown (réduit de 30 pour plus d'agressivité)
    this.initialDelay = 30000; // 30 seconds initial delay (réduit de 45 pour attaquer plus tôt)
    this.playerSpeed = playerSpeed || GAME_CONFIG.PLAYER_SPEED;
    
    // Anti-blocage
    this.stuckTimer = 0;
    this.lastPosition = { x: player.x, y: player.y };
    this.stuckThreshold = 1500; // 1.5 secondes bloqué (réduit de 2s)
    this.forceUnstuckThreshold = 3000; // 3 secondes = téléportation forcée
  }

  update(time, delta) {
    if (!this.player.active) return;

    // Mise à jour de la stratégie selon le rôle
    this.strategyTimer += delta;
    if (this.strategyTimer > this.strategyInterval) {
      this.updateStrategy();
      this.strategyTimer = 0;
    }

    // Détection de blocage
    const distanceMoved = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.lastPosition.x, this.lastPosition.y
    );
    
    if (distanceMoved < 15) { // Augmenté de 10 à 15 pour détecter plus facilement
      this.stuckTimer += delta;
      
      if (this.stuckTimer > this.forceUnstuckThreshold) {
        // Téléportation forcée vers une position valide
        const newPos = this.getRandomPosition();
        this.player.setPosition(newPos.x, newPos.y);
        this.player.setVelocity(0, 0);
        this.target = null;
        this.state = 'COLLECT';
        this.stuckTimer = 0;
        console.log(`AI ${this.player.element.name} téléporté (bloqué)`);
      } else if (this.stuckTimer > this.stuckThreshold) {
        // Changement de cible et direction aléatoire
        this.target = null;
        this.state = 'WANDER';
        this.wanderTarget = this.getRandomPosition();
        // Pousse l'IA dans une direction aléatoire
        const randomAngle = Math.random() * Math.PI * 2;
        this.player.setVelocity(
          Math.cos(randomAngle) * this.playerSpeed,
          Math.sin(randomAngle) * this.playerSpeed
        );
      }
    } else {
      this.stuckTimer = 0;
      this.lastPosition = { x: this.player.x, y: this.player.y };
    }
    
    // Mise à jour du texte avec rôle et stratégie (uniquement en debug)
    if (this.scene.debugMode && this.player.nameText) {
      const roleIcon = this.role === 'COLLECTOR' ? '📦' : this.role === 'ATTACKER' ? '⚔️' : '⚖️';
      const stratIcon = this.currentStrategy === 'COLLECT' ? '🔵' : '🔴';
      this.player.nameText.setText(`${roleIcon}${stratIcon} ${this.player.element.name} (T${this.player.teamId + 1})`);
    }

    // Check if AI can use power (with cooldown and initial delay)
    const timeSinceLastPower = time - this.lastPowerUse;
    const gameStartDelay = time < this.initialDelay; // Don't use powers in first 45 seconds
    
    if (!gameStartDelay && this.player.canUsePower() && this.scene.powerSystem && timeSinceLastPower >= this.powerCooldown) {
      // Use power strategically
      const shouldUsePower = this.decidePowerUsage();
      if (shouldUsePower) {
        // Decide which power to use (base element or gift power)
        const powerToUse = this.selectPowerToUse();
        this.scene.powerSystem.activatePower(this.player, powerToUse);
        this.lastPowerUse = time; // Record time of power use
      }
    }

    // Check if should return to base
    this.returnTimer += delta;
    const spiritsCarrying = this.scene.spirits.filter(s => s.followingPlayer === this.player).length;
    
    // Return with 5+ spirits or after timer with 2+ (réduit pour plus d'agressivité)
    if ((spiritsCarrying >= 5) || (spiritsCarrying > 1 && this.returnTimer > this.returnInterval)) {
      this.state = 'RETURN';
      this.returnTimer = 0;
    }

    // Update AI decision periodically
    if (time - this.lastUpdate > this.updateInterval) {
      this.lastUpdate = time;
      if (this.state !== 'RETURN') {
        this.makeDecision();
      }
    }

    // Execute current behavior
    this.executeBehavior();
  }

  makeDecision() {
    const spirits = this.scene.spirits.filter(s => s.active && !s.followingPlayer);
    const enemyPlayers = this.scene.players.filter(p => 
      p.active && 
      p.teamId !== this.player.teamId &&
      this.scene.spirits.some(s => s.followingPlayer === p)
    );
    
    const mySpirits = this.scene.spirits.filter(s => s.followingPlayer === this.player).length;
    
    // Décision basée sur le rôle et la stratégie actuelle
    if (this.role === 'COLLECTOR') {
      this.makeCollectorDecision(spirits, enemyPlayers, mySpirits);
    } else if (this.role === 'ATTACKER') {
      this.makeAttackerDecision(spirits, enemyPlayers, mySpirits);
    } else {
      this.makeBalancedDecision(spirits, enemyPlayers, mySpirits);
    }
  }
  
  makeCollectorDecision(spirits, enemyPlayers, mySpirits) {
    // COLLECTOR: Focus total sur la récolte, évite les combats
    if (spirits.length > 0) {
      const nearestSpirit = this.findNearest(spirits);
      this.target = nearestSpirit;
      this.state = 'COLLECT';
      return;
    }
    
    // Attaque rarement - seulement si stratégie ATTACK ET beaucoup d'esprits portés (5+)
    if (this.currentStrategy === 'ATTACK' && mySpirits >= 5 && enemyPlayers.length > 0 && Math.random() < 0.2) {
      const targetPlayer = this.findNearest(enemyPlayers);
      const enemySpirits = this.scene.spirits.filter(s => s.followingPlayer === targetPlayer);
      if (enemySpirits.length > 0) {
        this.target = enemySpirits[0];
        this.state = 'STEAL';
        return;
      }
    }
    
    this.state = 'WANDER';
    this.wanderTarget = this.getRandomPosition();
  }
  
  makeAttackerDecision(spirits, enemyPlayers, mySpirits) {
    // ATTACKER: Harcelle les ennemis, vole constamment
    
    // Si beaucoup d'esprits portés (4+), passe en mode récolte temporaire
    if (mySpirits >= 4 && this.currentStrategy !== 'COLLECT') {
      if (spirits.length > 0 && Math.random() < 0.3) {
        this.target = this.findNearest(spirits);
        this.state = 'COLLECT';
        return;
      }
    }
    
    // Priorité aux ennemis chargés d'esprits (95% au lieu de 85%)
    if (enemyPlayers.length > 0 && Math.random() < 0.95) {
      // Trouve l'ennemi avec le plus d'esprits
      const targetPlayer = enemyPlayers.reduce((best, current) => {
        const bestSpirits = this.scene.spirits.filter(s => s.followingPlayer === best).length;
        const currentSpirits = this.scene.spirits.filter(s => s.followingPlayer === current).length;
        return currentSpirits > bestSpirits ? current : best;
      });
      
      const enemySpirits = this.scene.spirits.filter(s => s.followingPlayer === targetPlayer);
      if (enemySpirits.length > 0) {
        this.target = enemySpirits[0];
        this.state = 'STEAL';
        return;
      }
    }
    
    // Sinon récolte rapide
    if (spirits.length > 0) {
      const nearestSpirit = this.findNearest(spirits);
      const distanceToSpirit = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        nearestSpirit.x, nearestSpirit.y
      );
      
      if (distanceToSpirit < 350) {
        this.target = nearestSpirit;
        this.state = 'COLLECT';
        return;
      }
    }
    
    // Cherche des ennemis à harceler
    const allEnemySpirits = this.scene.spirits.filter(s => 
      s.active && 
      s.followingPlayer && 
      s.followingPlayer.teamId !== this.player.teamId
    );
    
    if (allEnemySpirits.length > 0) {
      this.target = this.findNearest(allEnemySpirits);
      this.state = 'STEAL';
      return;
    }
    
    this.state = 'WANDER';
    this.wanderTarget = this.getRandomPosition();
  }
  
  makeBalancedDecision(spirits, enemyPlayers, mySpirits) {
    // BALANCED: Équilibre réel entre récolte et attaque
    
    // Si peu d'esprits (0-2), focus récolte
    if (mySpirits <= 2 && spirits.length > 0) {
      const nearestSpirit = this.findNearest(spirits);
      this.target = nearestSpirit;
      this.state = 'COLLECT';
      return;
    }
    
    // Si 3-4 esprits, attaque modérée (40%)
    if (mySpirits >= 3 && mySpirits <= 4 && enemyPlayers.length > 0 && Math.random() < 0.4) {
      const targetPlayer = this.findNearest(enemyPlayers);
      const enemySpirits = this.scene.spirits.filter(s => s.followingPlayer === targetPlayer);
      if (enemySpirits.length > 0) {
        this.target = enemySpirits[0];
        this.state = 'STEAL';
        return;
      }
    }
    
    // Si beaucoup d'esprits (5+), attaque fréquente (60%)
    if (mySpirits >= 5 && enemyPlayers.length > 0 && Math.random() < 0.6) {
      // Cible l'ennemi avec le plus d'esprits
      const targetPlayer = enemyPlayers.reduce((best, current) => {
        const bestSpirits = this.scene.spirits.filter(s => s.followingPlayer === best).length;
        const currentSpirits = this.scene.spirits.filter(s => s.followingPlayer === current).length;
        return currentSpirits > bestSpirits ? current : best;
      });
      
      const enemySpirits = this.scene.spirits.filter(s => s.followingPlayer === targetPlayer);
      if (enemySpirits.length > 0) {
        this.target = enemySpirits[0];
        this.state = 'STEAL';
        return;
      }
    }
    
    // Stratégie selon le mode actuel
    if (this.currentStrategy === 'COLLECT' && spirits.length > 0) {
      const nearestSpirit = this.findNearest(spirits);
      const distanceToSpirit = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        nearestSpirit.x, nearestSpirit.y
      );
      
      if (distanceToSpirit < 450) {
        this.target = nearestSpirit;
        this.state = 'COLLECT';
        return;
      }
    }
    
    if (this.currentStrategy === 'ATTACK' && enemyPlayers.length > 0 && Math.random() < 0.95) {
      const targetPlayer = this.findNearest(enemyPlayers);
      const enemySpirits = this.scene.spirits.filter(s => s.followingPlayer === targetPlayer);
      if (enemySpirits.length > 0) {
        this.target = enemySpirits[0];
        this.state = 'STEAL';
        return;
      }
    }
    
    // Par défaut: récolte
    if (spirits.length > 0) {
      this.target = this.findNearest(spirits);
      this.state = 'COLLECT';
      return;
    }
    
    // Tente de voler si aucun esprit libre
    const allEnemySpirits = this.scene.spirits.filter(s => 
      s.active && 
      s.followingPlayer && 
      s.followingPlayer.teamId !== this.player.teamId
    );
    
    if (allEnemySpirits.length > 0) {
      this.target = this.findNearest(allEnemySpirits);
      this.state = 'STEAL';
      return;
    }

    this.state = 'WANDER';
    this.wanderTarget = this.getRandomPosition();
  }
  
  updateStrategy() {
    // Met à jour la stratégie selon le rôle
    const mySpirits = this.scene.spirits.filter(s => s.followingPlayer === this.player).length;
    const freeSpirits = this.scene.spirits.filter(s => s.active && !s.followingPlayer).length;
    
    if (this.role === 'COLLECTOR') {
      // Reste principalement en COLLECT, passe en ATTACK rarement
      if (Math.random() < 0.1 && mySpirits >= 6) {
        this.currentStrategy = 'ATTACK';
      } else {
        this.currentStrategy = 'COLLECT';
      }
    } else if (this.role === 'ATTACKER') {
      // Alterne entre ATTACK et occasionnellement COLLECT
      if (freeSpirits > 25 && mySpirits < 2) {
        this.currentStrategy = 'COLLECT';
      } else {
        this.currentStrategy = 'ATTACK';
      }
    } else {
      // BALANCED: équilibre réel 50/50
      if (mySpirits < 3 || freeSpirits > 40) {
        this.currentStrategy = 'COLLECT';
      } else if (mySpirits >= 5) {
        // Avec beaucoup d'esprits, attaque plus souvent (60%)
        this.currentStrategy = Math.random() < 0.6 ? 'ATTACK' : 'COLLECT';
      } else {
        // Alterne équitablement
        this.currentStrategy = Math.random() < 0.5 ? 'ATTACK' : 'COLLECT';
      }
    }
  }

  executeBehavior() {
    switch (this.state) {
      case 'RETURN':
        this.returnToBase();
        break;
      case 'COLLECT':
      case 'STEAL':
        if (this.target && this.target.active) {
          this.moveTowards(this.target);
        } else {
          this.makeDecision();
        }
        break;
      case 'WANDER':
        this.wander();
        break;
    }
  }

  returnToBase() {
    const teamBase = this.scene.teamBases.find(b => b.teamId === this.player.teamId);
    if (!teamBase) {
      this.state = 'COLLECT';
      return;
    }

    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      teamBase.x, teamBase.y
    );

    if (distance < GAME_CONFIG.BASE_DEPOSIT_DISTANCE) {
      // Arrived at base, spirits will be deposited automatically
      this.state = 'COLLECT';
      this.returnTimer = 0;
    } else {
      this.moveTowards(teamBase);
    }
  }

  getRandomPosition() {
    const width = GAME_CONFIG.WORLD_WIDTH;
    const height = GAME_CONFIG.WORLD_HEIGHT;
    
    // Essaie de trouver une position valide (sans obstacles)
    let attempts = 0;
    let x, y, valid = false;
    
    while (!valid && attempts < 20) {
      x = Phaser.Math.Between(200, width - 200);
      y = Phaser.Math.Between(200, height - 200);
      
      // Vérifie si la position est loin des obstacles
      if (this.scene.obstacles && this.scene.obstacles.getChildren) {
        const nearObstacle = this.scene.obstacles.getChildren().some(obstacle => {
          const dist = Phaser.Math.Distance.Between(x, y, obstacle.x, obstacle.y);
          return dist < 100;
        });
        
        if (!nearObstacle) {
          valid = true;
        }
      } else {
        valid = true;
      }
      attempts++;
    }
    
    return { x: x || width / 2, y: y || height / 2 };
  }

  moveTowards(target) {
    const angle = Phaser.Math.Angle.Between(
      this.player.x, this.player.y,
      target.x, target.y
    );

    let velocityX = Math.cos(angle) * this.playerSpeed;
    let velocityY = Math.sin(angle) * this.playerSpeed;

    // Check for nearby terrain hazards (tornados) to avoid
    if (this.scene.terrainSystem && this.scene.terrainSystem.hazards) {
      const nearbyTornados = this.scene.terrainSystem.hazards.filter(hazard => {
        if (hazard.type !== 'windPower') return false;
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, hazard.x, hazard.y);
        return dist < (hazard.radius + 150); // Detection range: rayon + 150px
      });
      
      if (nearbyTornados.length > 0) {
        // Avoid the closest tornado
        const tornado = nearbyTornados[0];
        const avoidAngle = Phaser.Math.Angle.Between(tornado.x, tornado.y, this.player.x, this.player.y);
        // Strong correction to avoid tornados
        velocityX += Math.cos(avoidAngle) * this.playerSpeed * 1.2;
        velocityY += Math.sin(avoidAngle) * this.playerSpeed * 1.2;
      }
    }

    // Check for nearby obstacles to avoid getting stuck
    if (this.scene.obstacles && this.scene.obstacles.getChildren) {
      const nearbyObstacles = this.scene.obstacles.getChildren().filter(obstacle => {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, obstacle.x, obstacle.y);
        return dist < 100; // Detection range
      });
      
      if (nearbyObstacles.length > 0) {
        const obstacle = nearbyObstacles[0];
        const avoidAngle = Phaser.Math.Angle.Between(obstacle.x, obstacle.y, this.player.x, this.player.y);
        // Forte correction pour éviter les obstacles
        velocityX += Math.cos(avoidAngle) * this.playerSpeed * 0.8;
        velocityY += Math.sin(avoidAngle) * this.playerSpeed * 0.8;
      }
    }

    // Check for nearby allies to avoid collision/blocking
    const nearbyAllies = this.scene.players.filter(p => {
      if (p === this.player || p.teamId !== this.player.teamId || !p.active) return false;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y);
      return dist < 60; // Very close
    });
    
    // If blocked by ally, add perpendicular offset
    if (nearbyAllies.length > 0) {
      const ally = nearbyAllies[0];
      const avoidAngle = Phaser.Math.Angle.Between(ally.x, ally.y, this.player.x, this.player.y);
      velocityX += Math.cos(avoidAngle) * this.playerSpeed * 0.5;
      velocityY += Math.sin(avoidAngle) * this.playerSpeed * 0.5;
    }

    // Add some randomness to make AI less perfect
    const randomness = 0.08; // Reduced from 0.15 for better accuracy
    const randomX = (Math.random() - 0.5) * this.playerSpeed * randomness;
    const randomY = (Math.random() - 0.5) * this.playerSpeed * randomness;

    this.player.setVelocity(
      velocityX + randomX,
      velocityY + randomY
    );
  }

  wander() {
    if (!this.wanderTarget) {
      this.wanderTarget = this.getRandomPosition();
    }

    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.wanderTarget.x, this.wanderTarget.y
    );

    if (distance < 50) {
      // Reached wander target, pick new one
      this.wanderTarget = this.getRandomPosition();
    }

    this.moveTowards(this.wanderTarget);
  }

  findNearest(objects) {
    let nearest = null;
    let minDistance = Infinity;

    objects.forEach(obj => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        obj.x, obj.y
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = obj;
      }
    });

    return nearest;
  }

  decidePowerUsage() {
    // Simplified: AI uses power randomly when available
    // 15% chance per frame when power is full
    return Math.random() < 0.15;
  }

  selectPowerToUse() {
    // Check if AI has gift powers available
    if (!this.player.availablePowers || this.player.availablePowers.length <= 1) {
      // No gift powers, use base element
      return this.player.element.key;
    }

    // Check gift power sharing setting
    const giftPowerSharing = this.scene.giftPowerSharing;
    
    if (!giftPowerSharing) {
      // Gift power sharing disabled - AI cannot use gift powers
      return this.player.element.key;
    }

    // Gift power sharing enabled - AI can use gift powers very rarely (5% chance)
    if (Math.random() < 0.05) {
      // Select random gift power (skip index 0 which is base element)
      const giftPowerIndex = Phaser.Math.Between(1, this.player.availablePowers.length - 1);
      return this.player.availablePowers[giftPowerIndex];
    }

    // Default to base element
    return this.player.element.key;
  }
}
