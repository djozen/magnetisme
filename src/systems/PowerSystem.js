import { GAME_CONFIG } from '../config.js';
import { playerProgress } from './PlayerProgress.js';

export class PowerSystem {
  constructor(scene) {
    this.scene = scene;
  }
  
  // Helper: Check if a player should be affected by a power
  shouldAffectPlayer(caster, target) {
    // Never affect the caster
    if (target === caster) return false;
    
    // Check friendly fire setting
    if (this.scene.friendlyFire && target.teamId === caster.teamId) {
      return false; // Don't affect allies if friendly fire is ON
    }
    
    return true;
  }

  activatePower(player, elementKey) {
    const handlers = {
      fire: () => this.firePower(player),
      water: () => this.waterPower(player),
      ice: () => this.icePower(player),
      glass: () => this.glassPower(player),
      earth: () => this.earthPower(player),
      sand: () => this.sandPower(player),
      wind: () => this.windPower(player),
      thunder: () => this.thunderPower(player),
      shadow: () => this.shadowPower(player),
      light: () => this.lightPower(player),
      plasma: () => this.plasmaPower(player),
      toxic: () => this.toxicPower(player),
      wood: () => this.woodPower(player),
      leaf: () => this.leafPower(player),
      iron: () => this.ironPower(player),
      gold: () => this.goldPower(player)
    };

    const handler = handlers[elementKey];
    if (handler) {
      handler();
      player.usePower();
    }
  }

  // Fire: Burns in 3 tile radius, pushes players away, spirits scatter
  firePower(player) {
    // Get player level (AI players are level 1)
    const playerLevel = player.isAI ? 1 : playerProgress.level;
    
    // Base radius + 0.2 tiles per level
    const baseRadius = GAME_CONFIG.TILE_SIZE * 2;
    const bonusRadius = GAME_CONFIG.TILE_SIZE * 0.2 * playerLevel;
    const radius = baseRadius + bonusRadius;
    
    // Visual effect - expanding fire ring with increased intensity based on level
    const fire = this.scene.add.circle(player.x, player.y, 10, 0xff4500, 0.8);
    this.scene.tweens.add({
      targets: fire,
      radius: radius,
      alpha: 0,
      duration: 600,
      onComplete: () => fire.destroy()
    });
    
    // Add extra fire particles for higher levels
    if (playerLevel > 5) {
      for (let i = 0; i < Math.min(playerLevel, 10); i++) {
        const angle = (Math.PI * 2 / Math.min(playerLevel, 10)) * i;
        const fireParticle = this.scene.add.circle(
          player.x + Math.cos(angle) * radius * 0.5,
          player.y + Math.sin(angle) * radius * 0.5,
          15 + playerLevel,
          0xff4500,
          0.7
        );
        this.scene.tweens.add({
          targets: fireParticle,
          radius: radius * 1.2,
          alpha: 0,
          duration: 400,
          onComplete: () => fireParticle.destroy()
        });
      }
    }

    // Push nearby players and destroy ALL spirits in radius
    this.scene.players.forEach(other => {
      if (this.shouldAffectPlayer(player, other)) {
        const dist = Phaser.Math.Distance.Between(player.x, player.y, other.x, other.y);
        if (dist < radius) {
          const angle = Phaser.Math.Angle.Between(player.x, player.y, other.x, other.y);
          const knockbackDistance = GAME_CONFIG.TILE_SIZE * 3; // 3 tiles knockback
          
          // Calculate knockback position
          const targetX = other.x + Math.cos(angle) * knockbackDistance;
          const targetY = other.y + Math.sin(angle) * knockbackDistance;
          
          // Apply knockback with tween for smooth motion
          this.scene.tweens.add({
            targets: other,
            x: targetX,
            y: targetY,
            duration: 300,
            ease: 'Power2'
          });
          
          // Eject all spirits 7 tiles away with fire color
          this.ejectSpirits(other, 7, angle, 0xff4500);
        }
      }
    });
    
    // Destroy only enemy spirits within fire radius (protect own spirits)
    this.destroySpiritsInRadius(player.x, player.y, radius, player);
  }

  // Water: Water blast pushes players and ejects spirits
  waterPower(player) {
    // Get player level (AI players are level 1)
    const playerLevel = player.isAI ? 1 : playerProgress.level;
    
    // Base radius + 0.2 tiles per level for knockback
    const baseRadius = GAME_CONFIG.TILE_SIZE * 3;
    const bonusRadius = GAME_CONFIG.TILE_SIZE * 0.2 * playerLevel;
    const radius = baseRadius + bonusRadius;
    
    const water = this.scene.add.circle(player.x, player.y, 10, 0x0077be, 0.6);
    this.scene.tweens.add({
      targets: water,
      radius: radius,
      alpha: 0,
      duration: 500,
      onComplete: () => water.destroy()
    });
    
    // Add extra water ripples for higher levels
    if (playerLevel > 5) {
      for (let i = 0; i < Math.min(playerLevel, 10); i++) {
        const delay = i * 50;
        this.scene.time.delayedCall(delay, () => {
          const ripple = this.scene.add.circle(player.x, player.y, radius * 0.3, 0x0077be, 0.4);
          this.scene.tweens.add({
            targets: ripple,
            radius: radius * 1.3,
            alpha: 0,
            duration: 600,
            onComplete: () => ripple.destroy()
          });
        });
      }
    }

    this.scene.players.forEach(other => {
      if (this.shouldAffectPlayer(player, other)) {
        const dist = Phaser.Math.Distance.Between(player.x, player.y, other.x, other.y);
        if (dist < radius) {
          const angle = Phaser.Math.Angle.Between(player.x, player.y, other.x, other.y);
          const knockbackDistance = GAME_CONFIG.TILE_SIZE * 3;
          
          const targetX = other.x + Math.cos(angle) * knockbackDistance;
          const targetY = other.y + Math.sin(angle) * knockbackDistance;
          
          this.scene.tweens.add({
            targets: other,
            x: targetX,
            y: targetY,
            duration: 300,
            ease: 'Power2'
          });
          
          if (other !== player) {
            this.ejectSpirits(other, 7, angle, 0x0077be);
          }
        }
      }
    });
  }

  // Ice: Creates freeze zone in 1.5 tile radius for 5 seconds
  icePower(player) {
    const radius = GAME_CONFIG.TILE_SIZE * 1.5;
    
    // Visual - ice zone for 10 seconds
    const ice = this.scene.add.circle(player.x, player.y, radius, 0x87ceeb, 0.5);
    ice.setDepth(100);
    
    // Pulsing animation
    this.scene.tweens.add({
      targets: ice,
      alpha: { from: 0.5, to: 0.3 },
      duration: 1000,
      yoyo: true,
      repeat: 9 // 10 seconds total
    });

    this.scatterSpirits(player);

    // Create ice zone for 10 seconds
    const iceZone = {
      x: player.x,
      y: player.y,
      radius: radius,
      graphic: ice,
      player: player,
      duration: 10000,
      elapsed: 0
    };
    
    if (!this.scene.iceZones) this.scene.iceZones = [];
    this.scene.iceZones.push(iceZone);
    
    // Remove ice zone after 10 seconds
    this.scene.time.delayedCall(10000, () => {
      ice.destroy();
      const index = this.scene.iceZones.indexOf(iceZone);
      if (index > -1) this.scene.iceZones.splice(index, 1);
    });
  }

  // Glass: Creates a clone AI of the player for 20 seconds
  glassPower(player) {
    // Visual - mirror flash
    const mirror = this.scene.add.circle(player.x, player.y, 100, 0xe0ffff, 0.7);
    this.scene.tweens.add({
      targets: mirror,
      alpha: 0,
      radius: 200,
      duration: 400,
      onComplete: () => mirror.destroy()
    });

    // Create temporary clone AI at player position for 20 seconds
    const clone = this.scene.createTemporaryAlly(player, 20000);
    
    this.scene.showNotification(player.x, player.y, 'Clone Created!', 0xe0ffff);
  }

  // Earth: Creates 5-tile square wall with opening
  earthPower(player) {
    const tileSize = GAME_CONFIG.TILE_SIZE;
    const wallSize = tileSize * 5;
    const halfWall = wallSize / 2;

    this.scatterSpirits(player);

    // Create wall segments (3 sides with opening on right)
    const segments = [
      { x: player.x - halfWall, y: player.y - halfWall, w: wallSize, h: 20 }, // Top
      { x: player.x - halfWall, y: player.y - halfWall, w: 20, h: wallSize }, // Left
      { x: player.x - halfWall, y: player.y + halfWall - 20, w: wallSize, h: 20 }, // Bottom
    ];

    segments.forEach(seg => {
      const wall = this.scene.add.rectangle(seg.x, seg.y, seg.w, seg.h, 0x8b4513, 1);
      wall.setOrigin(0);
      this.scene.physics.add.existing(wall, true);
      this.scene.obstacles.add(wall);
      
      // Remove after 10 seconds
      this.scene.time.delayedCall(10000, () => {
        this.scene.obstacles.remove(wall);
        wall.destroy();
      });
    });
  }

  // Sand: Creates quicksand that slows movement (2 tile radius, persistent)
  sandPower(player) {
    const radius = GAME_CONFIG.TILE_SIZE * 2;
    
    this.scatterSpirits(player);

    // Visual - sand zone (visible circle)
    const sand = this.scene.add.circle(player.x, player.y, radius, 0xf4a460, 0.6);
    sand.setDepth(100);
    
    // Add pulsing animation to make it more visible
    this.scene.tweens.add({
      targets: sand,
      alpha: { from: 0.6, to: 0.3 },
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    // Store zone
    const zone = { x: player.x, y: player.y, radius: radius, graphic: sand, player: player };
    if (!this.scene.sandZones) this.scene.sandZones = [];
    this.scene.sandZones.push(zone);
  }

  // Wind: Creates tornado with spiral effect like wind base (1.5 tile radius + level, 10 sec)
  windPower(player) {
    // Get player level (AI players are level 1)
    const playerLevel = player.isAI ? 1 : playerProgress.level;
    
    // Base radius + 0.2 tiles per level
    const baseRadius = GAME_CONFIG.TILE_SIZE * 1.5;
    const bonusRadius = GAME_CONFIG.TILE_SIZE * 0.2 * playerLevel;
    const radius = baseRadius + bonusRadius;
    
    // Don't scatter own spirits, only affect enemies in tornado zone
    // this.scatterSpirits(player);

    // Visual - spinning tornado core with gradient
    const tornado = this.scene.add.circle(player.x, player.y, radius, 0xb0e0e6, 0.5);
    tornado.setDepth(100);
    
    // Add inner circles for depth
    const innerCircle1 = this.scene.add.circle(player.x, player.y, radius * 0.7, 0x87ceeb, 0.4);
    innerCircle1.setDepth(100);
    const innerCircle2 = this.scene.add.circle(player.x, player.y, radius * 0.4, 0xffffff, 0.3);
    innerCircle2.setDepth(100);
    
    // Store zone center position (fixed, doesn't follow player)
    const zoneX = player.x;
    const zoneY = player.y;
    
    // Create continuous spiral particle effect
    const tornadoZone = {
      x: zoneX,
      y: zoneY,
      radius: radius,
      graphic: tornado,
      player: player,
      duration: 10000,
      elapsed: 0,
      particles: [],
      particleAngleOffset: 0
    };
    
    if (!this.scene.tornadoZones) this.scene.tornadoZones = [];
    this.scene.tornadoZones.push(tornadoZone);
    
    // Create multiple rings of rotating particles
    const createParticleRing = (ringRadius, numParticles, rotationSpeed) => {
      const ringParticles = [];
      for (let i = 0; i < numParticles; i++) {
        const particle = this.scene.add.circle(
          zoneX,
          zoneY,
          6,
          0xffffff,
          0.8
        );
        particle.setDepth(102);
        particle.initialAngle = (i / numParticles) * Math.PI * 2;
        particle.ringRadius = ringRadius;
        particle.rotationSpeed = rotationSpeed;
        ringParticles.push(particle);
        tornadoZone.particles.push(particle);
      }
      return ringParticles;
    };
    
    // Create 3 rings with different speeds
    const ring1 = createParticleRing(radius * 0.3, 8, 0.05);
    const ring2 = createParticleRing(radius * 0.6, 12, 0.08);
    const ring3 = createParticleRing(radius * 0.9, 16, 0.12);
    
    // Animate particles continuously (fixed position)
    const updateParticles = () => {
      tornadoZone.particleAngleOffset += 0.05;
      
      [...ring1, ...ring2, ...ring3].forEach(particle => {
        const angle = particle.initialAngle + (tornadoZone.particleAngleOffset * particle.rotationSpeed);
        particle.x = zoneX + Math.cos(angle) * particle.ringRadius;
        particle.y = zoneY + Math.sin(angle) * particle.ringRadius;
      });
    };
    
    // Update particles every frame
    const particleUpdateEvent = this.scene.time.addEvent({
      delay: 16, // ~60fps
      repeat: 625, // 10 seconds
      callback: updateParticles
    });
    
    // Rotate all circles
    this.scene.tweens.add({
      targets: [tornado, innerCircle1, innerCircle2],
      rotation: Math.PI * 20,
      duration: 10000,
      onComplete: () => {
        tornado.destroy();
        innerCircle1.destroy();
        innerCircle2.destroy();
        particleUpdateEvent.remove();
        // Clean up remaining particles
        if (tornadoZone.particles) {
          tornadoZone.particles.forEach(p => p.destroy());
        }
        const index = this.scene.tornadoZones.indexOf(tornadoZone);
        if (index > -1) this.scene.tornadoZones.splice(index, 1);
      }
    });
  }

  // Thunder: Lightning teleports touched players to caster's base, steals spirits (10 sec)
  thunderPower(player) {
    if (!this.scene || !this.scene.teamBases) return;
    
    this.scatterSpirits(player);

    const playerBase = this.scene.teamBases.find(b => b.teamId === player.teamId);
    if (!playerBase) return;

    // Visual - circle outline
    const circle = this.scene.add.circle(player.x, player.y, 100, 0x000000, 0);
    circle.setStrokeStyle(3, 0xffd700, 1);
    
    // Create lightning bolts inside
    const lightnings = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const startX = player.x + Math.cos(angle) * 80;
      const startY = player.y + Math.sin(angle) * 80;
      const endX = player.x;
      const endY = player.y;
      
      const lightning = this.scene.add.graphics();
      lightning.lineStyle(2, 0xffff00, 1);
      lightning.beginPath();
      lightning.moveTo(startX, startY);
      lightning.lineTo(endX, endY);
      lightning.strokePath();
      lightnings.push(lightning);
    }
    
    // Animate lightning flashes
    this.scene.time.addEvent({
      delay: 200,
      callback: () => {
        lightnings.forEach(l => l.setVisible(!l.visible));
      },
      loop: true
    });
    
    const thunderZone = {
      x: player.x,
      y: player.y,
      radius: 100,
      graphic: circle,
      lightnings: lightnings,
      player: player,
      base: playerBase,
      duration: 10000,
      elapsed: 0
    };
    
    if (!this.scene.thunderZones) this.scene.thunderZones = [];
    this.scene.thunderZones.push(thunderZone);
    
    this.scene.time.delayedCall(10000, () => {
      if (thunderZone.graphic) thunderZone.graphic.destroy();
      if (thunderZone.lightnings) {
        thunderZone.lightnings.forEach(l => l.destroy());
      }
      const index = this.scene.thunderZones.indexOf(thunderZone);
      if (index > -1) this.scene.thunderZones.splice(index, 1);
    });
  }

  // Shadow: Black hole pulls players in, makes them disappear (2 tile radius, 6 tile magnetism)
  shadowPower(player) {
    if (!this.scene) return;
    
    const radius = GAME_CONFIG.TILE_SIZE * 1.5; // 2 tile radius (reduced by 1)
    const magnetRadius = GAME_CONFIG.TILE_SIZE * 5; // 6 tile magnetism radius
    
    // Don't scatter own spirits - Shadow is not affected by his own power
    // this.scatterSpirits(player);

    const blackHole = this.scene.add.circle(player.x, player.y, radius, 0x000000, 0.9);
    
    const shadowZone = {
      x: player.x,
      y: player.y,
      radius: radius,
      magnetRadius: magnetRadius, // Separate magnetism radius (10 tiles)
      graphic: blackHole,
      player: player,  // Pour exempter le créateur
      caster: player,  // Le joueur qui a lancé le pouvoir (pour magnétisme)
      duration: 10000,
      elapsed: 0,
      magnetize: true // Indique que cette zone magnétise le lanceur
    };
    
    if (!this.scene.shadowZones) this.scene.shadowZones = [];
    this.scene.shadowZones.push(shadowZone);
    
    this.scene.tweens.add({
      targets: blackHole,
      rotation: Math.PI * 10,
      duration: 10000,
      onComplete: () => {
        blackHole.destroy();
        const index = this.scene.shadowZones.indexOf(shadowZone);
        if (index > -1) this.scene.shadowZones.splice(index, 1);
      }
    });
  }

  // Light: Teleports to base with +10 bonus, deposits spirits, creates repel zone
  lightPower(player) {
    const castX = player.x;
    const castY = player.y;
    const radius = GAME_CONFIG.TILE_SIZE * 6; // 6 tile radius influence zone
    
    // Find player's base
    const playerBase = this.scene.teamBases.find(b => b.teamId === player.teamId);
    if (!playerBase) return;
    
    // Count spirits following player
    let spiritCount = 0;
    this.scene.spirits.forEach(spirit => {
      if (spirit.followingPlayer === player) {
        spiritCount++;
        spirit.setFollowPlayer(null);
        spirit.setActive(false).setVisible(false);
      }
    });
    
    // Flash effect before teleport
    const flash = this.scene.add.circle(player.x, player.y, 40, 0xfffacd, 0.8);
    this.scene.tweens.add({
      targets: flash,
      scale: 2,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy()
    });
    
    // Teleport to base with 500ms delay
    this.scene.time.delayedCall(500, () => {
      // Slow down camera for smooth transition
      if (!player.isAI) {
        this.scene.cameras.main.startFollow(player, true, 0.01, 0.01); // Very slow lerp
      }
      
      player.x = playerBase.x;
      player.y = playerBase.y + 80;
      
      // Add +10 bonus + double points for spirits
      const teamScore = this.scene.teamScores.find(ts => ts.teamId === player.teamId);
      if (teamScore) {
        teamScore.score += (spiritCount * 2) + 10; // Double points for teleported spirits
        this.scene.showNotification(playerBase.x, playerBase.y - 100, `+${(spiritCount * 2) + 10}!`, 0xfffacd);
      }
      
      // Restore normal camera speed after 2 seconds
      this.scene.time.delayedCall(2000, () => {
        if (!player.isAI) {
          this.scene.cameras.main.startFollow(player, true, 0.07, 0.07); // Normal speed
        }
      });
    });
    
    // Create light zone at cast position that repels players and collects spirits
    const lightZone = this.scene.add.circle(castX, castY, radius, 0xfffacd, 0.6);
    lightZone.setDepth(100);
    
    // Pulsing animation
    this.scene.tweens.add({
      targets: lightZone,
      alpha: { from: 0.6, to: 0.3 },
      scale: { from: 1, to: 1.2 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });
    
    // Collect spirits in the light zone - teleport to base and score points
    const lightCollectionTimer = this.scene.time.addEvent({
      delay: 100,
      repeat: 29, // 3 seconds (30 x 100ms)
      callback: () => {
        this.scene.spirits.forEach(spirit => {
          if (!spirit.active) return;
          
          const distToZone = Phaser.Math.Distance.Between(
            castX, castY,
            spirit.x, spirit.y
          );
          
          // Teleport spirits in the light zone to player's base
          if (distToZone < radius) {
            // Detach from current owner if attached
            if (spirit.followingPlayer) {
              spirit.setFollowPlayer(null);
            }
            
            // Teleport spirit to base with effect
            this.scene.tweens.add({
              targets: spirit,
              x: playerBase.x,
              y: playerBase.y,
              scale: 0,
              alpha: 0,
              duration: 500,
              ease: 'Power2',
              onComplete: () => {
                spirit.setActive(false).setVisible(false);
                
                // Add 2 points to player's team (double bonus)
                const teamScore = this.scene.teamScores.find(ts => ts.teamId === player.teamId);
                if (teamScore) {
                  teamScore.score += 2; // Double points for zone collection
                  this.scene.updateScoreDisplay();
                }
                
                // Respawn spirit after delay
                this.scene.time.delayedCall(GAME_CONFIG.SPIRIT_RESPAWN_TIME, () => {
                  this.scene.respawnSpirit(spirit);
                });
              }
            });
            
            // Visual effect at base
            const flash = this.scene.add.circle(playerBase.x, playerBase.y, 30, 0xffffff, 0.8);
            this.scene.tweens.add({
              targets: flash,
              scale: 2,
              alpha: 0,
              duration: 500,
              onComplete: () => flash.destroy()
            });
          }
        });
      }
    });
    
    // Repel players and heal allies
    this.scene.players.forEach(other => {
      const dist = Phaser.Math.Distance.Between(castX, castY, other.x, other.y);
      if (dist < radius) {
        // Heal allies (unfreeze, unpoison, etc)
        if (other.teamId === player.teamId) {
          other.frozen = false;
          other.poisoned = false;
          other.clearTint();
          if (other.poisonTimer) {
            other.poisonTimer.remove();
            other.poisonTimer = null;
          }
        } else {
          // Repel enemies 3 tiles
          const angle = Phaser.Math.Angle.Between(castX, castY, other.x, other.y);
          const knockbackDistance = GAME_CONFIG.TILE_SIZE * 3;
          
          this.scene.tweens.add({
            targets: other,
            x: other.x + Math.cos(angle) * knockbackDistance,
            y: other.y + Math.sin(angle) * knockbackDistance,
            duration: 300,
            ease: 'Power2'
          });
        }
      }
    });
    
    // Remove light zone after 3 seconds
    this.scene.time.delayedCall(3000, () => {
      lightZone.destroy();
      if (lightCollectionTimer) lightCollectionTimer.remove();
    });
  }

  // Plasma: Invincible, duration increases with level (12s + 0.2s per level)
  plasmaPower(player) {
    // Get player level (AI players are level 1)
    const playerLevel = player.isAI ? 1 : playerProgress.level;
    
    // Base duration 12s + 0.2s per level
    const baseDuration = 12000;
    const bonusDuration = 200 * playerLevel;
    const duration = baseDuration + bonusDuration;
    
    const magnetRadius = GAME_CONFIG.TILE_SIZE * 1; // 1 tile magnetism influence
    const auraRadius = GAME_CONFIG.TILE_SIZE * 1; // 1 tile aura
    
    // Don't scatter spirits - keep them attached (bug fix)
    // this.scatterSpirits(player);

    player.invincible = true;
    player.setTint(0xff1493);
    
    // Speed boost during plasma
    const originalSpeed = player.body.maxSpeed;
    player.body.setMaxSpeed(originalSpeed * 1.5); // 50% speed boost
    
    // Create plasma aura circle around player - more visible
    const auraCircle = this.scene.add.circle(player.x, player.y, auraRadius, 0xff1493, 0.5);
    auraCircle.setDepth(99); // High depth to be visible
    auraCircle.setStrokeStyle(3, 0xff69b4, 0.8); // Pink outline
    
    // Pulsing aura animation
    this.scene.tweens.add({
      targets: auraCircle,
      alpha: { from: 0.5, to: 0.2 },
      scale: { from: 1, to: 1.3 },
      duration: 400,
      yoyo: true,
      repeat: -1
    });
    
    // Create particle emitter for plasma aura - more visible
    const particles = this.scene.add.particles(player.x, player.y, 'particle', {
      speed: { min: 30, max: 60 },
      scale: { start: 0.5, end: 0.1 },
      alpha: { start: 1, end: 0 },
      lifespan: 1000,
      frequency: 40, // Slightly reduced frequency
      quantity: 2, // Reduced quantity
      tint: [0xff1493, 0xff69b4, 0xffc0cb], // Multiple pink shades
      angle: { min: 0, max: 360 },
      radial: true,
      gravityY: 0
    });
    particles.setDepth(100); // Above aura circle
    
    // Create laser-like electric bolts shooting outward
    const createLaserBolt = () => {
      const angle = Phaser.Math.Between(0, 360) * Math.PI / 180;
      const distance = auraRadius * 0.8;
      const targetX = player.x + Math.cos(angle) * distance;
      const targetY = player.y + Math.sin(angle) * distance;
      
      const bolt = this.scene.add.line(
        player.x, player.y,
        0, 0,
        Math.cos(angle) * distance, Math.sin(angle) * distance,
        0xff1493, 1 // Plasma pink color
      );
      bolt.setLineWidth(2);
      bolt.setDepth(101);
      
      // Fade out quickly
      this.scene.tweens.add({
        targets: bolt,
        alpha: 0,
        duration: 200,
        onComplete: () => bolt.destroy()
      });
    };
    
    // Create laser bolts periodically
    const laserTimer = this.scene.time.addEvent({
      delay: 150, // Every 150ms
      repeat: (duration / 150) - 1,
      callback: () => {
        if (player.invincible) {
          createLaserBolt();
          createLaserBolt(); // Create 2 bolts at a time
        }
      }
    });
    
    // Update aura and particle position every frame
    const updateAura = () => {
      if (auraCircle && auraCircle.active) {
        auraCircle.setPosition(player.x, player.y);
      }
      if (particles && particles.active) {
        particles.setPosition(player.x, player.y);
      }
    };
    
    const auraUpdateEvent = this.scene.time.addEvent({
      delay: 16, // ~60fps
      repeat: (duration / 16) - 1,
      callback: updateAura
    });
    
    // Magnetism effect - attract spirits continuously during plasma
    const magnetismTimer = this.scene.time.addEvent({
      delay: 100,
      repeat: (duration / 100) - 1,
      callback: () => {
        if (!player.invincible) return; // Stop if plasma ended early
        
        this.scene.spirits.forEach(spirit => {
          if (!spirit.active) return;
          
          const distance = Phaser.Math.Distance.Between(
            player.x, player.y,
            spirit.x, spirit.y
          );
          
          if (distance < magnetRadius && spirit.followingPlayer !== player) {
            spirit.setFollowPlayer(player);
          }
        });
      }
    });
    
    this.scene.time.delayedCall(duration, () => {
      player.invincible = false;
      player.clearTint();
      player.body.setMaxSpeed(originalSpeed); // Restore original speed
      if (magnetismTimer) magnetismTimer.remove();
      if (auraUpdateEvent) auraUpdateEvent.remove();
      if (laserTimer) laserTimer.remove();
      if (auraCircle) auraCircle.destroy();
      if (particles) particles.destroy();
    });
  }

  // Toxic: Poisons in 3 tile radius, victims lose spirits and can't collect for 5 sec
  toxicPower(player) {
    const radius = GAME_CONFIG.TILE_SIZE * 3;
    
    // Visual - toxic cloud
    const toxic = this.scene.add.circle(player.x, player.y, radius, 0x00ff00, 0.5);
    this.scene.tweens.add({
      targets: toxic,
      alpha: 0,
      duration: 1000,
      onComplete: () => toxic.destroy()
    });

    this.scatterSpirits(player);

    this.scene.players.forEach(other => {
      if (this.shouldAffectPlayer(player, other)) {
        const dist = Phaser.Math.Distance.Between(player.x, player.y, other.x, other.y);
        if (dist < radius) {
          // Poison effect - only apply if not already poisoned
          if (!other.poisoned) {
            other.poisoned = true;
            other.setTint(0x00ff00);
            
            // Clear any existing poison timer
            if (other.poisonTimer) {
              other.poisonTimer.remove();
            }
            
            // Set new poison timer (12 seconds)
            other.poisonTimer = this.scene.time.delayedCall(12000, () => {
              other.poisoned = false;
              other.clearTint();
              other.poisonTimer = null;
            });
          }
          
          // Drop spirits
          this.scene.spirits.forEach(spirit => {
            if (spirit.followingPlayer === other) {
              spirit.setFollowPlayer(null);
            }
          });
        }
      }
    });
  }

  // Wood: Grows trees randomly in 5 tile radius
  woodPower(player) {
    const radius = GAME_CONFIG.TILE_SIZE * 5;
    const treeCount = Phaser.Math.Between(5, 8);

    this.scatterSpirits(player);

    for (let i = 0; i < treeCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius;
      const tx = player.x + Math.cos(angle) * dist;
      const ty = player.y + Math.sin(angle) * dist;
      
      this.scene.createMazeTree(tx, ty, 1);
    }
  }

  // Leaf: Creates 2 extra spirits
  async leafPower(player) {
    if (!this.scene || !this.scene.spirits) return;
    
    this.scatterSpirits(player);

    // Drop current spirits
    this.scene.spirits.forEach(spirit => {
      if (spirit.followingPlayer === player) {
        spirit.setFollowPlayer(null);
      }
    });

    // Create 2 temporary spirits
    const spiritCount = 2;
    
    // Import Spirit class dynamically
    const { default: Spirit } = await import('../entities/Spirit.js');
    
    for (let i = 0; i < spiritCount; i++) {
      const angle = (i / spiritCount) * Math.PI * 2;
      const dist = Phaser.Math.Between(50, 150);
      const x = player.x + Math.cos(angle) * dist;
      const y = player.y + Math.sin(angle) * dist;
      
      // Créer un esprit temporaire
      const tempSpirit = new Spirit(this.scene, x, y);
      this.scene.spirits.push(tempSpirit);
      tempSpirit.temporary = true;
      
      // Auto-destruction après 30 secondes
      this.scene.time.delayedCall(30000, () => {
        if (tempSpirit && tempSpirit.active) {
          const index = this.scene.spirits.indexOf(tempSpirit);
          if (index > -1) this.scene.spirits.splice(index, 1);
          tempSpirit.destroy();
        }
      });
    }
  }

  scatterSpirits(player) {
    // Check if scene and spirits exist
    if (!this.scene || !this.scene.spirits) {
      return;
    }
    
    // Drop and scatter all spirits
    this.scene.spirits.forEach(spirit => {
      if (spirit.followingPlayer === player) {
        spirit.setFollowPlayer(null);
        
        
        // Scatter randomly
        const angle = Math.random() * Math.PI * 2;
        const dist = Phaser.Math.Between(50, 150);
        this.scene.tweens.add({
          targets: spirit,
          x: spirit.x + Math.cos(angle) * dist,
          y: spirit.y + Math.sin(angle) * dist,
          duration: 300
        });
      }
    });
  }
  
  // Eject spirits a specific number of tiles in a direction
  ejectSpirits(player, tiles, baseAngle, tintColor = 0xff4500) {
    // Check if scene and spirits exist
    if (!this.scene || !this.scene.spirits) {
      return;
    }
    
    const ejectDistance = GAME_CONFIG.TILE_SIZE * tiles;
    const detachedSpirits = [];
    
    // Detach all spirits from player
    this.scene.spirits.forEach(spirit => {
      if (spirit.followingPlayer === player) {
        spirit.setFollowPlayer(null);
        detachedSpirits.push(spirit);
      }
    });
    
    // Eject spirits in the knockback direction with spread
    detachedSpirits.forEach((spirit, index) => {
      // Add some spread to the angle (-30 to +30 degrees)
      const spreadAngle = (Math.random() - 0.5) * Math.PI / 3;
      const ejectAngle = baseAngle + spreadAngle;
      
      const targetX = spirit.x + Math.cos(ejectAngle) * ejectDistance;
      const targetY = spirit.y + Math.sin(ejectAngle) * ejectDistance;
      
      // Visual feedback with specified color
      spirit.setTint(tintColor);
      this.scene.time.delayedCall(300, () => {
        spirit.clearTint();
      });
      
      // Eject with tween
      this.scene.tweens.add({
        targets: spirit,
        x: targetX,
        y: targetY,
        duration: 400,
        ease: 'Power2'
      });
    });
    
    // Show notification with appropriate color
    if (detachedSpirits.length > 0) {
      this.scene.showNotification(
        player.x,
        player.y - 50,
        `-${detachedSpirits.length} spirits!`,
        tintColor
      );
    }
  }

  // Destroy enemy spirits in radius (for fire power)
  destroySpiritsInRadius(x, y, radius, casterPlayer) {
    // Check if scene and spirits exist
    if (!this.scene || !this.scene.spirits) {
      return;
    }

    const destroyedSpirits = [];
    const radiusSquared = radius * radius;

    // Find all spirits in radius (except those following the caster)
    this.scene.spirits.forEach(spirit => {
      const dx = spirit.x - x;
      const dy = spirit.y - y;
      const distSquared = dx * dx + dy * dy;

      // Only destroy if in radius AND not following the caster (protect own spirits)
      if (distSquared <= radiusSquared && spirit.followingPlayer !== casterPlayer) {
        destroyedSpirits.push(spirit);
      }
    });

    // Destroy each spirit with visual effect
    destroyedSpirits.forEach(spirit => {
      // Detach from player if following
      if (spirit.followingPlayer) {
        spirit.setFollowPlayer(null);
      }

      // Fire explosion effect
      const particles = this.scene.add.particles(spirit.x, spirit.y, 'particle', {
        speed: { min: 50, max: 150 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.8, end: 0 },
        alpha: { start: 0.4, end: 0 },
        tint: 0xff4500,
        lifespan: 400,
        quantity: 16
      });

      // Auto-destroy particles
      this.scene.time.delayedCall(500, () => {
        particles.destroy();
      });

      // Remove spirit from array and destroy
      const index = this.scene.spirits.indexOf(spirit);
      if (index > -1) {
        this.scene.spirits.splice(index, 1);
      }
      spirit.destroy();
    });

    // Show notification
    if (destroyedSpirits.length > 0) {
      this.scene.showNotification(
        x,
        y - 50,
        `${destroyedSpirits.length} spirits destroyed!`,
        0xff4500
      );
    }
  }
  
  // Detach ALL spirits completely (for fire and water powers)
  detachAllSpirits(player, level = 1) {
    // Check if scene and spirits exist
    if (!this.scene || !this.scene.spirits) {
      return;
    }
    
    const detachedSpirits = [];
    
    // Completely detach all spirits from player
    this.scene.spirits.forEach(spirit => {
      if (spirit.followingPlayer === player) {
        spirit.setFollowPlayer(null);
        detachedSpirits.push(spirit);
      }
    });
    
    // Scatter with force proportional to level
    const scatterDistance = 100 + (level * 20); // More distance at higher levels
    const scatterSpeed = 200 + (level * 20); // Faster scatter at higher levels
    
    detachedSpirits.forEach((spirit, index) => {
      // Create explosion-like scatter pattern
      const angle = (Math.PI * 2 / Math.max(detachedSpirits.length, 1)) * index + Math.random() * 0.5;
      const dist = Phaser.Math.Between(scatterDistance * 0.7, scatterDistance * 1.3);
      
      // Visual feedback - flash on spirit
      if (level > 3) {
        spirit.setTint(0xffff00);
        this.scene.time.delayedCall(200, () => {
          spirit.clearTint();
        });
      }
      
      // Tween to scatter position
      this.scene.tweens.add({
        targets: spirit,
        x: spirit.x + Math.cos(angle) * dist,
        y: spirit.y + Math.sin(angle) * dist,
        duration: scatterSpeed,
        ease: 'Power2'
      });
    });
    
    // Show notification for high level powers
    if (level > 10 && detachedSpirits.length > 0) {
      this.scene.showNotification(
        player.x,
        player.y - 50,
        `${detachedSpirits.length} spirits!`,
        0xff4500
      );
    }
  }

  // Iron: Magnetism zone 5 tiles for 2 seconds
  ironPower(player) {
    const radius = GAME_CONFIG.TILE_SIZE * 5;
    
    // Visual - gray magnetic zone
    const ironZone = this.scene.add.circle(player.x, player.y, radius, 0x808080, 0.4);
    ironZone.setDepth(100);
    
    // Pulsing effect
    this.scene.tweens.add({
      targets: ironZone,
      alpha: { from: 0.4, to: 0.2 },
      duration: 500,
      yoyo: true,
      repeat: 3 // 2 seconds total
    });
    
    // Apply magnetism for 2 seconds
    const magnetismTimer = this.scene.time.addEvent({
      delay: 100,
      repeat: 19, // 2 seconds (20 x 100ms)
      callback: () => {
        this.scene.spirits.forEach(spirit => {
          if (!spirit.active) return;
          
          const distance = Phaser.Math.Distance.Between(
            player.x, player.y,
            spirit.x, spirit.y
          );
          
          if (distance < radius && spirit.followingPlayer !== player) {
            spirit.setFollowPlayer(player);
          }
        });
      }
    });
    
    // Remove zone after 2 seconds
    this.scene.time.delayedCall(2000, () => {
      ironZone.destroy();
    });
    
    this.scene.showNotification(player.x, player.y, 'Iron Magnetism!', 0x808080);
  }

  // Gold: Attracts enemies to base, they switch teams for 15 seconds
  goldPower(player) {
    const radius = GAME_CONFIG.TILE_SIZE * 4;
    const playerBase = this.scene.teamBases.find(b => b.teamId === player.teamId);
    if (!playerBase) return;
    
    // Visual - golden attraction zone
    const goldZone = this.scene.add.circle(player.x, player.y, radius, 0xdaa520, 0.5);
    goldZone.setDepth(100);
    
    this.scene.tweens.add({
      targets: goldZone,
      radius: radius * 1.5,
      alpha: 0,
      duration: 1000,
      onComplete: () => goldZone.destroy()
    });
    
    // Affect enemies in range
    this.scene.players.forEach(enemy => {
      if (this.shouldAffectPlayer(player, enemy)) {
        const distance = Phaser.Math.Distance.Between(
          player.x, player.y,
          enemy.x, enemy.y
        );
        
        if (distance < radius) {
          // Store original team
          enemy.originalTeamId = enemy.teamId;
          enemy.originalTeamColor = enemy.teamColor;
          
          // Switch to player's team
          enemy.teamId = player.teamId;
          enemy.teamColor = player.teamColor;
          enemy.setTint(0xdaa520); // Golden tint (goldenrod)
          
          // Restore after 15 seconds
          if (enemy.goldTimer) {
            enemy.goldTimer.remove();
          }
          
          enemy.goldTimer = this.scene.time.delayedCall(15000, () => {
            enemy.teamId = enemy.originalTeamId;
            enemy.teamColor = enemy.originalTeamColor;
            enemy.clearTint();
            enemy.goldTimer = null;
          });
        }
      }
    });
    
    this.scene.showNotification(player.x, player.y, 'Gold Attraction!', 0xdaa520);
  }
}

