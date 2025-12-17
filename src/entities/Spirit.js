import Phaser from 'phaser';
import { GAME_CONFIG } from '../config.js';

export default class Spirit extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, ballSpeed, spiritType = 'default') {
    // Create a graphics object for the spirit sprite
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Draw spirit based on type
    if (spiritType === 'bubble') {
      Spirit.drawBubbleSpirit(graphics);
    } else if (spiritType === 'crab') {
      Spirit.drawCrabSpirit(graphics);
    } else if (spiritType === 'black') {
      Spirit.drawBlackSpirit(graphics);
    } else if (spiritType === 'fire') {
      Spirit.drawFireSpirit(graphics);
    } else if (spiritType === 'toxic') {
      Spirit.drawToxicSpirit(graphics);
    } else if (spiritType === 'glass') {
      Spirit.drawGlassSpirit(graphics);
    } else if (spiritType === 'thunder') {
      Spirit.drawThunderSpirit(graphics);
    } else if (spiritType === 'leaf') {
      Spirit.drawLeafSpirit(graphics);
    } else if (spiritType === 'wood') {
      Spirit.drawWoodSpirit(graphics);
    } else if (spiritType === 'plasma') {
      Spirit.drawPlasmaSpirit(graphics);
    } else if (spiritType === 'ice') {
      Spirit.drawIceSpirit(graphics);
    } else if (spiritType === 'iron') {
      Spirit.drawIronSpirit(graphics);
    } else if (spiritType === 'gold') {
      Spirit.drawGoldSpirit(graphics);
    } else if (spiritType === 'wind') {
      Spirit.drawWindSpirit(graphics);
    } else if (spiritType === 'sand') {
      Spirit.drawSandSpirit(graphics);
    } else if (spiritType === 'light') {
      Spirit.drawLightSpirit(graphics);
    } else if (spiritType === 'waterLight') {
      Spirit.drawWaterLightSpirit(graphics);
    } else {
      Spirit.drawDefaultSpirit(graphics);
    }
    
    // Generate texture - taille uniforme 32x32 pour tous
    const size = 32;
    const key = `spirit_${spiritType}_${x}_${y}_${Date.now()}`;
    graphics.generateTexture(key, size, size);
    graphics.destroy();

    super(scene, x, y, key);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Configurer le body physique pour correspondre au sprite 32x32
    this.setOrigin(0.5, 0.5); // Centrer l'origine
    this.body.setSize(32, 32); // Taille du body = taille du sprite
    this.body.setOffset(0, 0); // Pas de décalage
    
    this.setDepth(9); // Spirits below players but above terrain
    
    // Mode debug : afficher la hitbox
    if (GAME_CONFIG.DEBUG_SHOW_HITBOXES) {
      this.body.debugShowBody = true;
      this.body.debugBodyColor = 0x00ff00;
    }

    this.followingPlayer = null;
    this.followIndex = 0;
    this.originalX = x;
    this.originalY = y;
    this.ballSpeed = ballSpeed || GAME_CONFIG.SPIRIT_FOLLOW_SPEED;
    this.originalType = spiritType; // Stocker le type original pour pouvoir y retourner

    // Add floating animation only if not following
    this.floatOffset = Math.random() * Math.PI * 2;
    this.floatSpeed = 2;
    this.floatAmount = 5;
    
    // Stocker le type pour les animations
    this.spiritType = spiritType;

    // Glow effect disabled for debugging
    // TODO: Re-enable when particle system is fixed
    /*
    this.glowEmitter = scene.add.particles(this.x, this.y, 'white', {
      speed: 10,
      scale: { start: 0.2, end: 0 },
      alpha: { start: 0.4, end: 0 },
      lifespan: 500,
      frequency: 100,
      tint: 0xffff00,
      follow: this
    });
    */
    this.glowEmitter = null;
    
    // Animations spéciales avec particules pour spirits thématiques (sauf crab)
    this.particleEmitter = null;
    if (spiritType === 'fire') {
      this.createFireParticles(scene);
    } else if (spiritType === 'thunder') {
      this.createThunderParticles(scene);
    } else if (spiritType === 'plasma') {
      this.createPlasmaParticles(scene);
    } else if (spiritType === 'toxic') {
      this.createToxicParticles(scene);
    } else if (spiritType === 'glass') {
      this.createGlassParticles(scene);
    } else if (spiritType === 'ice') {
      this.createIceParticles(scene);
    } else if (spiritType === 'gold') {
      this.createGoldParticles(scene);
    } else if (spiritType === 'black') {
      this.createBlackParticles(scene);
    } else if (spiritType === 'wind') {
      this.createWindParticles(scene);
    } else if (spiritType === 'sand') {
      this.createSandParticles(scene);
    } else if (spiritType === 'light') {
      this.createLightParticles(scene);
    } else if (spiritType === 'waterLight') {
      this.createWaterLightParticles(scene);
    }

    // Note: Le floatTween a été retiré car il causait un décalage entre le sprite et le body physique
    // Les spirits libres restent simplement à leur position
  }
  
  createFireParticles(scene) {
    // Particules de flammes montantes
    const particles = scene.add.graphics();
    particles.setDepth(8);
    this.particleEmitter = particles;
    
    this.particleTimer = scene.time.addEvent({
      delay: 200, // Réduit la fréquence
      callback: () => {
        if (!this.active || !this.particleEmitter) return;
        
        const px = this.x + Phaser.Math.Between(-8, 8);
        const py = this.y + Phaser.Math.Between(-8, 8);
        
        const particle = scene.add.circle(px, py, Phaser.Math.Between(2, 4), 
          [0xff0000, 0xff6600, 0xff9900][Phaser.Math.Between(0, 2)], 0.8);
        particle.setDepth(8);
        
        scene.tweens.add({
          targets: particle,
          y: py - 20,
          alpha: 0,
          scale: 0.3,
          duration: 600,
          onComplete: () => particle.destroy()
        });
      },
      loop: true
    });
  }
  
  createThunderParticles(scene) {
    // Arcs électriques animés
    const particles = scene.add.graphics();
    particles.setDepth(8);
    this.particleEmitter = particles;
    
    this.particleTimer = scene.time.addEvent({
      delay: 250, // Réduit la fréquence
      callback: () => {
        if (!this.active || !this.particleEmitter) return;
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 12;
        const px = this.x + Math.cos(angle) * dist;
        const py = this.y + Math.sin(angle) * dist;
        
        const spark = scene.add.graphics();
        spark.lineStyle(2, 0xffff00, 0.9);
        spark.lineBetween(this.x, this.y, px, py);
        spark.setDepth(8);
        
        scene.tweens.add({
          targets: spark,
          alpha: 0,
          duration: 200,
          onComplete: () => spark.destroy()
        });
      },
      loop: true
    });
  }
  
  createPlasmaParticles(scene) {
    // Particules plasma tourbillonnantes
    const particles = scene.add.graphics();
    particles.setDepth(8);
    this.particleEmitter = particles;
    
    let angle = 0;
    this.particleTimer = scene.time.addEvent({
      delay: 150, // Réduit la fréquence
      callback: () => {
        if (!this.active || !this.particleEmitter) return;
        
        angle += 0.3;
        const dist = 12;
        const px = this.x + Math.cos(angle) * dist;
        const py = this.y + Math.sin(angle) * dist;
        
        const particle = scene.add.circle(px, py, 3, 
          [0xff00ff, 0x9900ff, 0xff66ff][Phaser.Math.Between(0, 2)], 0.8);
        particle.setDepth(8);
        
        scene.tweens.add({
          targets: particle,
          scale: 0,
          alpha: 0,
          duration: 400,
          onComplete: () => particle.destroy()
        });
      },
      loop: true
    });
  }
  
  createBubbleParticles(scene) {
    // Petites bulles qui montent
    this.particleTimer = scene.time.addEvent({
      delay: 400, // Réduit la fréquence
      callback: () => {
        if (!this.active) return;
        
        const px = this.x + Phaser.Math.Between(-6, 6);
        const py = this.y + Phaser.Math.Between(-6, 6);
        
        const bubble = scene.add.circle(px, py, Phaser.Math.Between(2, 4), 0xffffff, 0.5);
        bubble.setDepth(8);
        scene.add.graphics().lineStyle(1, 0xffffff, 0.7).strokeCircle(px, py, bubble.radius).setDepth(8);
        
        scene.tweens.add({
          targets: bubble,
          y: py - 25,
          alpha: 0,
          duration: 1000,
          onComplete: () => bubble.destroy()
        });
      },
      loop: true
    });
  }
  
  createCrabParticles(scene) {
    // Petites bulles qui s'échappent comme sous l'eau
    this.particleTimer = scene.time.addEvent({
      delay: 450,
      callback: () => {
        if (!this.active) return;
        
        const px = this.x + Phaser.Math.Between(-8, 8);
        const py = this.y + Phaser.Math.Between(-8, 8);
        
        const bubble = scene.add.circle(px, py, Phaser.Math.Between(1, 3), 0x88ccff, 0.4);
        bubble.setDepth(8);
        
        scene.tweens.add({
          targets: bubble,
          y: py - 15,
          x: px + Phaser.Math.Between(-5, 5),
          alpha: 0,
          duration: 800,
          onComplete: () => bubble.destroy()
        });
      },
      loop: true
    });
  }
  
  createToxicParticles(scene) {
    // Gouttes toxiques qui tombent
    this.particleTimer = scene.time.addEvent({
      delay: 300,
      callback: () => {
        if (!this.active) return;
        
        const px = this.x + Phaser.Math.Between(-8, 8);
        const py = this.y - 8;
        
        const drop = scene.add.circle(px, py, 2, 0x00ff00, 0.7);
        drop.setDepth(8);
        
        scene.tweens.add({
          targets: drop,
          y: py + 15,
          alpha: 0,
          duration: 500,
          onComplete: () => drop.destroy()
        });
      },
      loop: true
    });
  }
  
  createGlassParticles(scene) {
    // Scintillements cristallins
    this.particleTimer = scene.time.addEvent({
      delay: 350,
      callback: () => {
        if (!this.active) return;
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 10;
        const px = this.x + Math.cos(angle) * dist;
        const py = this.y + Math.sin(angle) * dist;
        
        const sparkle = scene.add.circle(px, py, 2, 0xffffff, 0.9);
        sparkle.setDepth(8);
        
        scene.tweens.add({
          targets: sparkle,
          scale: 0,
          alpha: 0,
          duration: 300,
          onComplete: () => sparkle.destroy()
        });
      },
      loop: true
    });
  }
  
  createLeafParticles(scene) {
    // Petites feuilles qui tombent en tournoyant
    this.particleTimer = scene.time.addEvent({
      delay: 500,
      callback: () => {
        if (!this.active) return;
        
        const px = this.x + Phaser.Math.Between(-8, 8);
        const py = this.y - 10;
        
        const leaf = scene.add.graphics();
        leaf.fillStyle(0x00cc44, 0.7);
        leaf.fillRect(px - 2, py - 3, 4, 6);
        leaf.setDepth(8);
        
        scene.tweens.add({
          targets: leaf,
          y: py + 20,
          angle: 360,
          alpha: 0,
          duration: 800,
          onComplete: () => leaf.destroy()
        });
      },
      loop: true
    });
  }
  
  createWoodParticles(scene) {
    // Feuilles qui apparaissent et disparaissent
    this.particleTimer = scene.time.addEvent({
      delay: 450,
      callback: () => {
        if (!this.active) return;
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 8;
        const px = this.x + Math.cos(angle) * dist;
        const py = this.y + Math.sin(angle) * dist;
        
        const particle = scene.add.circle(px, py, 2, 0x32cd32, 0.8);
        particle.setDepth(8);
        
        scene.tweens.add({
          targets: particle,
          scale: 1.5,
          alpha: 0,
          duration: 500,
          onComplete: () => particle.destroy()
        });
      },
      loop: true
    });
  }
  
  createIceParticles(scene) {
    // Cristaux de glace qui scintillent
    this.particleTimer = scene.time.addEvent({
      delay: 300,
      callback: () => {
        if (!this.active) return;
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 12;
        const px = this.x + Math.cos(angle) * dist;
        const py = this.y + Math.sin(angle) * dist;
        
        const crystal = scene.add.graphics();
        crystal.fillStyle(0x99ccff, 0.8);
        crystal.fillCircle(px, py, 2);
        crystal.setDepth(8);
        
        scene.tweens.add({
          targets: crystal,
          alpha: 0,
          scale: 0,
          duration: 400,
          onComplete: () => crystal.destroy()
        });
      },
      loop: true
    });
  }
  
  createIronParticles(scene) {
    // Étincelles métalliques
    this.particleTimer = scene.time.addEvent({
      delay: 400,
      callback: () => {
        if (!this.active) return;
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 10;
        const px = this.x + Math.cos(angle) * dist;
        const py = this.y + Math.sin(angle) * dist;
        
        const spark = scene.add.circle(px, py, 1.5, 0xc0c0c0, 0.9);
        spark.setDepth(8);
        
        scene.tweens.add({
          targets: spark,
          alpha: 0,
          duration: 250,
          onComplete: () => spark.destroy()
        });
      },
      loop: true
    });
  }
  
  createGoldParticles(scene) {
    // Paillettes dorées qui brillent
    this.particleTimer = scene.time.addEvent({
      delay: 280,
      callback: () => {
        if (!this.active) return;
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 11;
        const px = this.x + Math.cos(angle) * dist;
        const py = this.y + Math.sin(angle) * dist;
        
        const sparkle = scene.add.circle(px, py, 2, 0xffd700, 0.95);
        sparkle.setDepth(8);
        
        scene.tweens.add({
          targets: sparkle,
          scale: 1.5,
          alpha: 0,
          duration: 350,
          onComplete: () => sparkle.destroy()
        });
      },
      loop: true
    });
  }
  
  createBlackParticles(scene) {
    // Particules d'ombre violettes tourbillonnantes
    let angle = 0;
    this.particleTimer = scene.time.addEvent({
      delay: 180,
      callback: () => {
        if (!this.active) return;
        
        angle += 0.4;
        const dist = 10;
        const px = this.x + Math.cos(angle) * dist;
        const py = this.y + Math.sin(angle) * dist;
        
        const particle = scene.add.circle(px, py, 2, 
          [0x4b0082, 0x8a2be2, 0x9370db][Phaser.Math.Between(0, 2)], 0.7);
        particle.setDepth(8);
        
        scene.tweens.add({
          targets: particle,
          scale: 0,
          alpha: 0,
          duration: 500,
          onComplete: () => particle.destroy()
        });
      },
      loop: true
    });
  }
  
  createWindParticles(scene) {
    // Tourbillons de vent circulaires
    let angle = 0;
    this.particleTimer = scene.time.addEvent({
      delay: 150,
      callback: () => {
        if (!this.active) return;
        
        angle += 0.5;
        const dist = 14;
        const px = this.x + Math.cos(angle) * dist;
        const py = this.y + Math.sin(angle) * dist;
        
        const wind = scene.add.graphics();
        wind.lineStyle(1.5, 0xffffff, 0.7);
        wind.arc(px, py, 3, 0, Math.PI);
        wind.setDepth(8);
        
        scene.tweens.add({
          targets: wind,
          alpha: 0,
          duration: 400,
          onComplete: () => wind.destroy()
        });
      },
      loop: true
    });
  }
  
  createSandParticles(scene) {
    // Grains de sable qui tourbillonnent
    this.particleTimer = scene.time.addEvent({
      delay: 220,
      callback: () => {
        if (!this.active) return;
        
        const angle = Math.random() * Math.PI * 2;
        const dist = Phaser.Math.Between(8, 12);
        const px = this.x + Math.cos(angle) * dist;
        const py = this.y + Math.sin(angle) * dist;
        
        const grain = scene.add.circle(px, py, 1.5, 
          [0xc2b280, 0xdaa520, 0x8b7355][Phaser.Math.Between(0, 2)], 0.8);
        grain.setDepth(8);
        
        scene.tweens.add({
          targets: grain,
          x: px + Phaser.Math.Between(-15, 15),
          y: py + Phaser.Math.Between(-15, 15),
          alpha: 0,
          duration: 600,
          onComplete: () => grain.destroy()
        });
      },
      loop: true
    });
  }
  
  createLightParticles(scene) {
    // Rayons lumineux qui pulsent
    this.particleTimer = scene.time.addEvent({
      delay: 250,
      callback: () => {
        if (!this.active) return;
        
        const angle = Math.random() * Math.PI * 2;
        const dist = 5;
        const px = this.x + Math.cos(angle) * dist;
        const py = this.y + Math.sin(angle) * dist;
        
        const ray = scene.add.graphics();
        ray.lineStyle(2, 0xffff00, 0.9);
        ray.lineBetween(this.x, this.y, 
          this.x + Math.cos(angle) * 15, 
          this.y + Math.sin(angle) * 15);
        ray.setDepth(8);
        
        scene.tweens.add({
          targets: ray,
          alpha: 0,
          duration: 300,
          onComplete: () => ray.destroy()
        });
      },
      loop: true
    });
  }
  
  createWaterLightParticles(scene) {
    // Gouttes d'eau lumineuses qui montent
    this.particleTimer = scene.time.addEvent({
      delay: 300,
      callback: () => {
        if (!this.active) return;
        
        const px = this.x + Phaser.Math.Between(-8, 8);
        const py = this.y + Phaser.Math.Between(-6, 6);
        
        const drop = scene.add.circle(px, py, 2, 0x87ceeb, 0.8);
        drop.setDepth(8);
        
        // Petit cercle blanc pour effet brillant
        const shine = scene.add.circle(px, py, 1, 0xffffff, 0.9);
        shine.setDepth(8);
        
        scene.tweens.add({
          targets: [drop, shine],
          y: py - 18,
          alpha: 0,
          duration: 700,
          onComplete: () => {
            drop.destroy();
            shine.destroy();
          }
        });
      },
      loop: true
    });
  }

  setFollowPlayer(player, index) {
    this.followingPlayer = player;
    this.followIndex = index;
    
    // Change glow color to player's team color
    if (this.glowEmitter) {
      this.glowEmitter.setTint(player ? player.teamColor : 0xffff00);
    }
    
    if (player && player.element && player.element.key) {
      // Transformer le spirit selon l'élément du joueur
      let elementKey = player.element.key;
      
      // Logique spéciale pour l'élément water basée sur le niveau
      if (elementKey === 'water') {
        const playerLevel = player.spirits ? player.spirits.length : 0;
        if (playerLevel >= 8) {
          elementKey = 'bubble'; // Niveau 8+ -> bubble
        } else {
          elementKey = 'waterLight'; // Niveau 1-7 -> waterLight
        }
      }
      
      this.transformToElement(elementKey);
    } else if (!player) {
      // Détaché - retourner à l'état original
      this.resetToOriginalType();
    }
  }
  
  resetToOriginalType() {
    // Retourner au type original du spirit
    if (this.spiritType !== this.originalType) {
      this.transformToElement(this.originalType);
    }
  }
  
  transformToElement(elementKey) {
    // Si elementKey est déjà un type de spirit (default, bubble, crab), l'utiliser directement
    let newType;
    if (['default', 'bubble', 'crab', 'black'].includes(elementKey)) {
      newType = elementKey;
    } else {
      // Sinon, mapper l'élément au type de spirit
      const elementToSpiritType = {
        'fire': 'fire',
        'water': 'bubble',
        'ice': 'ice',
        'glass': 'glass',
        'earth': 'rock',
        'sand': 'sand',
        'wind': 'wind',
        'thunder': 'thunder',
        'shadow': 'black',
        'light': 'light',
        'plasma': 'plasma',
        'toxic': 'toxic',
        'wood': 'wood',
        'leaf': 'leaf',
        'iron': 'iron',
        'gold': 'gold',
        'waterLight': 'waterLight'
      };
      
      newType = elementToSpiritType[elementKey] || 'default';
    }
    
    // Ne pas transformer les crabes (exception Aquatic Realm)
    if (this.originalType === 'crab') {
      return; // Les crabes gardent leur forme originale
    }
    
    // Exception: les bubble originaux restent bubble
    if (this.originalType === 'bubble' && newType === 'bubble') {
      return; // Déjà une bulle, pas de transformation
    }
    
    // Ne transformer que si c'est un changement
    if (newType !== this.spiritType) {
      const oldType = this.spiritType;
      this.spiritType = newType;
      
      // Vérifier que la scène existe encore
      if (!this.scene || !this.scene.make) {
        return; // Scène détruite, ne pas transformer
      }
      
      // Recréer la texture
      const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false });
      
      // Dessiner selon le nouveau type
      if (newType === 'bubble') {
        Spirit.drawBubbleSpirit(graphics);
      } else if (newType === 'crab') {
        Spirit.drawCrabSpirit(graphics);
      } else if (newType === 'black') {
        Spirit.drawBlackSpirit(graphics);
      } else if (newType === 'fire') {
        Spirit.drawFireSpirit(graphics);
      } else if (newType === 'toxic') {
        Spirit.drawToxicSpirit(graphics);
      } else if (newType === 'glass') {
        Spirit.drawGlassSpirit(graphics);
      } else if (newType === 'thunder') {
        Spirit.drawThunderSpirit(graphics);
      } else if (newType === 'leaf') {
        Spirit.drawLeafSpirit(graphics);
      } else if (newType === 'wood') {
        Spirit.drawWoodSpirit(graphics);
      } else if (newType === 'plasma') {
        Spirit.drawPlasmaSpirit(graphics);
      } else if (newType === 'ice') {
        Spirit.drawIceSpirit(graphics);
      } else if (newType === 'iron') {
        Spirit.drawIronSpirit(graphics);
      } else if (newType === 'gold') {
        Spirit.drawGoldSpirit(graphics);
      } else if (newType === 'wind') {
        Spirit.drawWindSpirit(graphics);
      } else if (newType === 'sand') {
        Spirit.drawSandSpirit(graphics);
      } else if (newType === 'rock') {
        Spirit.drawRockSpirit(graphics);
      } else if (newType === 'light') {
        Spirit.drawLightSpirit(graphics);
      } else if (newType === 'waterLight') {
        Spirit.drawWaterLightSpirit(graphics);
      } else {
        Spirit.drawDefaultSpirit(graphics);
      }
      
      const size = 32;
      const key = `spirit_${newType}_shared`;
      
      // Créer la texture seulement si elle n'existe pas déjà (cache)
      if (!this.scene.textures.exists(key)) {
        graphics.generateTexture(key, size, size);
      }
      graphics.destroy();
      
      // Changer la texture
      this.setTexture(key);
      
      // S'assurer que l'origine et le body restent corrects après changement de texture
      this.setOrigin(0.5, 0.5);
      if (this.body) {
        this.body.setSize(32, 32);
        this.body.setOffset(0, 0);
      }
      
      // Détruire les anciennes particules si elles existent
      if (this.particleTimer) {
        this.particleTimer.remove();
        this.particleTimer = null;
      }
      
      if (this.particleEmitter) {
        if (this.particleEmitter.destroy) {
          this.particleEmitter.destroy();
        }
        this.particleEmitter = null;
      }
      
      // Créer les nouvelles particules selon le nouveau type
      if (newType === 'fire') {
        this.createFireParticles(this.scene);
      } else if (newType === 'thunder') {
        this.createThunderParticles(this.scene);
      } else if (newType === 'plasma') {
        this.createPlasmaParticles(this.scene);
      } else if (newType === 'toxic') {
        this.createToxicParticles(this.scene);
      } else if (newType === 'glass') {
        this.createGlassParticles(this.scene);
      } else if (newType === 'ice') {
        this.createIceParticles(this.scene);
      } else if (newType === 'gold') {
        this.createGoldParticles(this.scene);
      } else if (newType === 'black') {
        this.createBlackParticles(this.scene);
      } else if (newType === 'wind') {
        this.createWindParticles(this.scene);
      } else if (newType === 'sand') {
        this.createSandParticles(this.scene);
      } else if (newType === 'light') {
        this.createLightParticles(this.scene);
      } else if (newType === 'waterLight') {
        this.createWaterLightParticles(this.scene);
      }
    }
  }

  followPlayer(allSpirits) {
    if (!this.followingPlayer || !this.followingPlayer.active) {
      this.followingPlayer = null;
      return;
    }

    // Count how many spirits are ahead in the queue for this player
    let positionInQueue = 0;
    for (let spirit of allSpirits) {
      if (spirit.followingPlayer === this.followingPlayer && spirit !== this) {
        if (spirit.followIndex < this.followIndex) {
          positionInQueue++;
        }
      }
    }

    // Follow target: either the player or the spirit ahead
    let targetX, targetY;
    
    if (positionInQueue === 0) {
      // Follow player directly
      targetX = this.followingPlayer.x;
      targetY = this.followingPlayer.y;
    } else {
      // Follow the spirit ahead
      const spiritAhead = allSpirits.find(s => 
        s.followingPlayer === this.followingPlayer && 
        s.followIndex === this.followIndex - 1
      );
      
      if (spiritAhead) {
        targetX = spiritAhead.x;
        targetY = spiritAhead.y;
      } else {
        targetX = this.followingPlayer.x;
        targetY = this.followingPlayer.y;
      }
    }

    // Calculate distance and angle to target
    const distance = Phaser.Math.Distance.Between(this.x, this.y, targetX, targetY);
    
    // Only move if too far from target
    if (distance > GAME_CONFIG.SPIRIT_SPACING) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
      const speed = this.ballSpeed;
      
      this.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
    } else {
      this.setVelocity(0, 0);
    }
  }

  update(time) {
    if (!this.followingPlayer) {
      // Floating animation only when free
      const floatY = Math.sin(time * 0.001 * this.floatSpeed + this.floatOffset) * this.floatAmount;
      this.originalY = this.originalY || this.y;
      this.y = this.originalY + floatY;
    }
  }

  destroy() {
    if (this.glowEmitter) {
      this.glowEmitter.destroy();
    }
    super.destroy();
  }

  // Static methods for drawing different spirit types
  static drawDefaultSpirit(graphics) {
    // Draw cute spirit with BIGGER eyes
    // Body (white fluffy circle)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(16, 16, 14);
    
    // Add fluffy effect with smaller circles
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = 16 + Math.cos(angle) * 10;
      const py = 16 + Math.sin(angle) * 10;
      graphics.fillCircle(px, py, 4);
    }
    
    // VERY big eyes (kawaii style)
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(11, 14, 5);  // Left eye (bigger)
    graphics.fillCircle(21, 14, 5); // Right eye (bigger)
    
    // Eye highlights (make it sparkle more)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(10, 12, 2);   // Left highlight (bigger)
    graphics.fillCircle(20, 12, 2);  // Right highlight (bigger)
    graphics.fillCircle(12, 15, 1);   // Left secondary highlight
    graphics.fillCircle(22, 15, 1);  // Right secondary highlight
    
    // Cute tiny mouth (happy)
    graphics.lineStyle(2, 0xff69b4, 1);
    graphics.arc(16, 18, 4, 0, Math.PI, false);
    graphics.strokePath();
    
    // Add blush
    graphics.fillStyle(0xffb6c1, 0.5);
    graphics.fillCircle(8, 18, 3);  // Left blush
    graphics.fillCircle(24, 18, 3); // Right blush
    
    // Soft glow outline
    graphics.lineStyle(2, 0xffff00, 0.6);
    graphics.strokeCircle(16, 16, 15);
  }

  static drawCrabSpirit(graphics) {
    // Crab body (orange/red)
    const cx = 16, cy = 16;
    graphics.fillStyle(0xff6347, 1);
    graphics.fillEllipse(cx, cy + 2, 18, 14);
    
    // Shell segments
    graphics.lineStyle(1.2, 0xd2691e, 1);
    graphics.strokeEllipse(cx, cy + 2, 18, 14);
    graphics.strokeEllipse(cx, cy + 2, 14, 10);
    graphics.strokeEllipse(cx, cy + 2, 10, 6);
    
    // Claws (left)
    graphics.fillStyle(0xff4500, 1);
    graphics.beginPath();
    graphics.moveTo(cx - 10, cy);
    graphics.lineTo(cx - 14, cy - 2);
    graphics.lineTo(cx - 11, cy + 2);
    graphics.closePath();
    graphics.fillPath();
    
    graphics.beginPath();
    graphics.moveTo(cx - 14, cy - 2);
    graphics.lineTo(cx - 16, cy - 5);
    graphics.lineTo(cx - 14, cy - 1);
    graphics.closePath();
    graphics.fillPath();
    
    // Claws (right)
    graphics.beginPath();
    graphics.moveTo(cx + 10, cy);
    graphics.lineTo(cx + 14, cy - 2);
    graphics.lineTo(cx + 11, cy + 2);
    graphics.closePath();
    graphics.fillPath();
    
    graphics.beginPath();
    graphics.moveTo(cx + 14, cy - 2);
    graphics.lineTo(cx + 16, cy - 5);
    graphics.lineTo(cx + 14, cy - 1);
    graphics.closePath();
    graphics.fillPath();
    
    // Eyes on stalks
    graphics.fillStyle(0xff6347, 1);
    graphics.fillRect(cx - 5, cy - 8, 2, 6);
    graphics.fillRect(cx + 3, cy - 8, 2, 6);
    
    // Eye balls
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(cx - 4, cy - 8, 3);
    graphics.fillCircle(cx + 4, cy - 8, 3);
    
    // Pupils
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(cx - 4, cy - 8, 2);
    graphics.fillCircle(cx + 4, cy - 8, 2);
    
    // Eye highlights
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(cx - 5, cy - 9, 1);
    graphics.fillCircle(cx + 3, cy - 9, 1);
    
    // Legs (4 on each side)
    graphics.lineStyle(2, 0xff4500, 1);
    for (let i = 0; i < 4; i++) {
      const ly = cy + 3 + i * 2;
      // Left legs
      graphics.lineBetween(cx - 7, ly, cx - 11, ly + 3);
      // Right legs
      graphics.lineBetween(cx + 7, ly, cx + 11, ly + 3);
    }
    
    // Cute bubbles
    graphics.fillStyle(0x87ceeb, 0.5);
    graphics.fillCircle(cx - 7, cy - 7, 2);
    graphics.fillCircle(cx + 7, cy - 5, 3);
  }

  static drawBlackSpirit(graphics) {
    // Black/dark purple body
    graphics.fillStyle(0x1a1a1a, 1);
    graphics.fillCircle(16, 16, 14);
    
    // Add dark fluffy effect
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = 16 + Math.cos(angle) * 10;
      const py = 16 + Math.sin(angle) * 10;
      graphics.fillCircle(px, py, 4);
    }
    
    // Glowing purple eyes
    graphics.fillStyle(0x8a2be2, 1);
    graphics.fillCircle(11, 14, 6);
    graphics.fillCircle(21, 14, 6);
    
    // Inner glow
    graphics.fillStyle(0x9370db, 1);
    graphics.fillCircle(11, 14, 4);
    graphics.fillCircle(21, 14, 4);
    
    // Bright center
    graphics.fillStyle(0xda70d6, 1);
    graphics.fillCircle(11, 14, 2);
    graphics.fillCircle(21, 14, 2);
    
    // White highlights
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(10, 12, 1);
    graphics.fillCircle(20, 12, 1);
    
    // Dark wispy trails
    graphics.fillStyle(0x4b0082, 0.6);
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 16 + Math.random() * 4;
      const x = 16 + Math.cos(angle) * dist;
      const y = 16 + Math.sin(angle) * dist;
      graphics.fillCircle(x, y, 2);
    }
    
    // Purple aura outline
    graphics.lineStyle(2, 0x8a2be2, 0.8);
    graphics.strokeCircle(16, 16, 15);
    
    // Additional dark purple glow
    graphics.lineStyle(1, 0x9370db, 0.4);
    graphics.strokeCircle(16, 16, 17);
  }

  static drawBubbleSpirit(graphics) {
    // Transparent bubble with highlights
    const cx = 16, cy = 16;
    graphics.fillStyle(0xffffff, 0.5);
    graphics.fillCircle(cx, cy, 13);
    
    // Bubble outline
    graphics.lineStyle(2, 0xffffff, 0.7);
    graphics.strokeCircle(cx, cy, 13);
    
    // Main highlight
    graphics.fillStyle(0xffffff, 0.95);
    graphics.fillCircle(cx - 5, cy - 5, 5);
    
    // Secondary highlight
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillCircle(cx + 4, cy + 3, 3);
    
    // Tiny sparkle
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(cx - 5, cy - 5, 2);
    graphics.fillCircle(cx + 3, cy + 2, 1);
    
    // Subtle blue tint
    graphics.fillStyle(0xadd8e6, 0.25);
    graphics.fillCircle(cx, cy, 11);
  }

  static drawFireSpirit(graphics) {
    // Boule de feu - flammes oranges/rouges
    const cx = 16, cy = 16;
    
    // Cœur de la flamme (jaune-blanc)
    graphics.fillStyle(0xffff99, 1);
    graphics.fillCircle(cx, cy, 8);
    
    // Flammes oranges
    graphics.fillStyle(0xff6600, 0.9);
    graphics.fillCircle(cx, cy, 12);
    
    // Flammes rouges externes
    graphics.fillStyle(0xff0000, 0.7);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const px = cx + Math.cos(angle) * 10;
      const py = cy + Math.sin(angle) * 10;
      graphics.fillCircle(px, py, 5);
    }
    
    // Flammes dansantes (petites)
    graphics.fillStyle(0xff9900, 0.8);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + 0.4;
      const px = cx + Math.cos(angle) * 13;
      const py = cy + Math.sin(angle) * 13;
      graphics.fillCircle(px, py, 3);
    }
    
    // Centre brillant
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillCircle(cx, cy, 4);
    
    // Yeux ardents
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(cx - 4, cy - 2, 3);
    graphics.fillCircle(cx + 4, cy - 2, 3);
    
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(cx - 4, cy - 2, 2);
    graphics.fillCircle(cx + 4, cy - 2, 2);
    
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(cx - 3, cy - 3, 1);
    graphics.fillCircle(cx + 5, cy - 3, 1);
    
    // Bouche en flamme
    graphics.lineStyle(2, 0xff6600, 1);
    graphics.arc(cx, cy + 2, 5, 0.3, Math.PI - 0.3);
    graphics.strokePath();
  }

  static drawToxicSpirit(graphics) {
    // Gluant toxique - vert visqueux
    const cx = 16, cy = 16;
    
    // Corps gluant principal
    graphics.fillStyle(0x00ff00, 0.8);
    graphics.fillEllipse(cx, cy + 2, 14, 12);
    
    // Bulles de gaz toxique
    graphics.fillStyle(0x66ff33, 0.7);
    graphics.fillCircle(cx - 4, cy - 4, 6);
    graphics.fillCircle(cx + 5, cy - 3, 5);
    graphics.fillCircle(cx - 1, cy - 6, 4);
    
    // Effet gluant (gouttes)
    graphics.fillStyle(0x00cc00, 0.9);
    graphics.fillCircle(cx - 8, cy + 6, 3);
    graphics.fillCircle(cx + 7, cy + 5, 4);
    graphics.fillCircle(cx, cy + 8, 3);
    
    // Brillance toxique
    graphics.fillStyle(0xccff66, 0.6);
    graphics.fillCircle(cx - 3, cy - 2, 3);
    graphics.fillCircle(cx + 2, cy, 2);
    
    // Contour sombre
    graphics.lineStyle(1, 0x009900, 0.8);
    graphics.strokeEllipse(cx, cy + 2, 14, 12);
    
    // Yeux toxiques
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(cx - 4, cy, 3);
    graphics.fillCircle(cx + 4, cy, 3);
    
    graphics.fillStyle(0x00ff00, 0.8);
    graphics.fillCircle(cx - 4, cy, 2);
    graphics.fillCircle(cx + 4, cy, 2);
    
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(cx - 3, cy - 1, 1);
    graphics.fillCircle(cx + 5, cy - 1, 1);
    
    // Bouche gluante
    graphics.lineStyle(2, 0x009900, 1);
    graphics.arc(cx, cy + 4, 4, 0.2, Math.PI - 0.2);
    graphics.strokePath();
  }

  static drawGlassSpirit(graphics) {
    // Disque de verre - transparent et brillant
    const cx = 16, cy = 16;
    
    // Disque principal
    graphics.fillStyle(0xcce6ff, 0.6);
    graphics.fillCircle(cx, cy, 13);
    
    // Effet de verre (cercles concentriques)
    graphics.lineStyle(1.5, 0xffffff, 0.8);
    graphics.strokeCircle(cx, cy, 13);
    graphics.strokeCircle(cx, cy, 10);
    graphics.strokeCircle(cx, cy, 7);
    
    // Reflets lumineux
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillCircle(cx - 5, cy - 5, 4);
    graphics.fillCircle(cx + 6, cy + 4, 3);
    
    // Reflets secondaires
    graphics.fillStyle(0xe6f2ff, 0.7);
    graphics.fillCircle(cx + 3, cy - 6, 2);
    graphics.fillCircle(cx - 7, cy + 5, 2);
    
    // Centre cristallin
    graphics.fillStyle(0xb3d9ff, 0.5);
    graphics.fillCircle(cx, cy, 5);
    
    // Yeux cristallins
    graphics.fillStyle(0x4682b4, 0.9);
    graphics.fillCircle(cx - 4, cy - 1, 3);
    graphics.fillCircle(cx + 4, cy - 1, 3);
    
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(cx - 3, cy - 2, 1);
    graphics.fillCircle(cx + 5, cy - 2, 1);
    
    // Bouche souriante
    graphics.lineStyle(1.5, 0x4682b4, 0.8);
    graphics.arc(cx, cy + 3, 4, 0.2, Math.PI - 0.2);
    graphics.strokePath();
  }

  static drawThunderSpirit(graphics) {
    // Boule de foudre - électrique jaune
    const cx = 16, cy = 16;
    
    // Sphère électrique
    graphics.fillStyle(0xffff00, 0.8);
    graphics.fillCircle(cx, cy, 12);
    
    // Éclairs internes (lignes zigzag)
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.beginPath();
    graphics.moveTo(cx - 6, cy - 8);
    graphics.lineTo(cx - 2, cy - 2);
    graphics.lineTo(cx - 4, cy + 2);
    graphics.lineTo(cx, cy + 8);
    graphics.strokePath();
    
    graphics.beginPath();
    graphics.moveTo(cx + 6, cy - 6);
    graphics.lineTo(cx + 2, cy);
    graphics.lineTo(cx + 4, cy + 4);
    graphics.lineTo(cx + 1, cy + 9);
    graphics.strokePath();
    
    // Arcs électriques
    graphics.lineStyle(1, 0xccff00, 0.9);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const px = cx + Math.cos(angle) * 10;
      const py = cy + Math.sin(angle) * 10;
      graphics.lineBetween(cx, cy, px, py);
    }
    
    // Cœur brillant
    graphics.fillStyle(0xffffff, 0.95);
    graphics.fillCircle(cx, cy, 5);
    
    // Aura électrique
    graphics.lineStyle(1.5, 0xffff66, 0.6);
    graphics.strokeCircle(cx, cy, 14);
    
    // Yeux électriques brillants
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(cx - 4, cy - 2, 3);
    graphics.fillCircle(cx + 4, cy - 2, 3);
    
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(cx - 4, cy - 2, 2);
    graphics.fillCircle(cx + 4, cy - 2, 2);
    
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(cx - 3, cy - 3, 1);
    graphics.fillCircle(cx + 5, cy - 3, 1);
    
    // Bouche énergique
    graphics.lineStyle(2, 0xffff00, 1);
    graphics.arc(cx, cy + 3, 5, 0.2, Math.PI - 0.2);
    graphics.strokePath();
  }

  static drawLeafSpirit(graphics) {
    // Petite feuille verte - Taille augmentée
    const cx = 16, cy = 16;
    
    // Forme de feuille (ovale pointu) - Plus grande
    graphics.fillStyle(0x00cc44, 1);
    graphics.fillEllipse(cx, cy, 12, 14);
    
    // Nervure centrale
    graphics.lineStyle(2, 0x006622, 1);
    graphics.lineBetween(cx, cy - 14, cx, cy + 14);
    
    // Nervures secondaires - Plus espacées
    graphics.lineStyle(1.5, 0x008833, 0.8);
    for (let i = 0; i < 5; i++) {
      const y = cy - 10 + i * 5;
      graphics.lineBetween(cx, y, cx - 7, y + 3);
      graphics.lineBetween(cx, y, cx + 7, y + 3);
    }
    
    // Reflet lumineux
    graphics.fillStyle(0x66ff66, 0.6);
    graphics.fillCircle(cx - 3, cy - 5, 4);
    
    // Contour
    graphics.lineStyle(1.5, 0x005522, 1);
    graphics.strokeEllipse(cx, cy, 12, 14);
    
    // Yeux de feuille - Plus grands
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(cx - 4, cy - 3, 2.5);
    graphics.fillCircle(cx + 4, cy - 3, 2.5);
    
    graphics.fillStyle(0x66ff66, 1);
    graphics.fillCircle(cx - 3, cy - 4, 1.5);
    graphics.fillCircle(cx + 5, cy - 4, 1.5);
    
    // Petite bouche - Plus grande
    graphics.lineStyle(2, 0x005522, 1);
    graphics.arc(cx, cy + 3, 4, 0.2, Math.PI - 0.2);
    graphics.strokePath();
  }

  static drawWoodSpirit(graphics) {
    // Petit buisson - vert foncé touffu
    const cx = 16, cy = 16;
    
    // Tronc brun
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(cx - 2, cy + 6, 4, 8);
    
    // Feuillage (plusieurs cercles verts)
    graphics.fillStyle(0x228b22, 1);
    graphics.fillCircle(cx, cy - 4, 8);
    graphics.fillCircle(cx - 6, cy, 7);
    graphics.fillCircle(cx + 6, cy, 7);
    graphics.fillCircle(cx - 3, cy + 4, 6);
    graphics.fillCircle(cx + 3, cy + 4, 6);
    
    // Feuillage plus clair (profondeur)
    graphics.fillStyle(0x32cd32, 0.9);
    graphics.fillCircle(cx - 2, cy - 2, 5);
    graphics.fillCircle(cx + 3, cy + 1, 5);
    graphics.fillCircle(cx, cy + 3, 4);
    
    // Touches de lumière
    graphics.fillStyle(0x90ee90, 0.7);
    graphics.fillCircle(cx - 3, cy - 3, 3);
    graphics.fillCircle(cx + 4, cy, 2);
    graphics.fillCircle(cx, cy + 2, 2);
    
    // Yeux dans le feuillage
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(cx - 3, cy, 2);
    graphics.fillCircle(cx + 3, cy, 2);
    
    graphics.fillStyle(0x90ee90, 1);
    graphics.fillCircle(cx - 2, cy - 1, 1);
    graphics.fillCircle(cx + 4, cy - 1, 1);
    
    // Bouche souriante
    graphics.lineStyle(1.5, 0x006622, 1);
    graphics.arc(cx, cy + 3, 3, 0.2, Math.PI - 0.2);
    graphics.strokePath();
  }

  static drawPlasmaSpirit(graphics) {
    // Boule de plasma - rose/violet énergétique
    const cx = 16, cy = 16;
    
    // Noyau brillant
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillCircle(cx, cy, 6);
    
    // Plasma rose
    graphics.fillStyle(0xff00ff, 0.8);
    graphics.fillCircle(cx, cy, 10);
    
    // Plasma violet
    graphics.fillStyle(0x9900ff, 0.7);
    graphics.fillCircle(cx, cy, 13);
    
    // Arcs de plasma
    graphics.lineStyle(2, 0xff66ff, 0.9);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = cx + Math.cos(angle) * 11;
      const py = cy + Math.sin(angle) * 11;
      graphics.lineBetween(cx, cy, px, py);
    }
    
    // Particules énergétiques
    graphics.fillStyle(0xff99ff, 0.8);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + 0.5;
      const px = cx + Math.cos(angle) * 12;
      const py = cy + Math.sin(angle) * 12;
      graphics.fillCircle(px, py, 3);
    }
    
    // Aura
    graphics.lineStyle(1.5, 0xcc66ff, 0.6);
    graphics.strokeCircle(cx, cy, 14);
    
    // Yeux plasma brillants
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(cx - 4, cy - 2, 3);
    graphics.fillCircle(cx + 4, cy - 2, 3);
    
    graphics.fillStyle(0xff00ff, 1);
    graphics.fillCircle(cx - 4, cy - 2, 2);
    graphics.fillCircle(cx + 4, cy - 2, 2);
    
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(cx - 3, cy - 3, 1);
    graphics.fillCircle(cx + 5, cy - 3, 1);
    
    // Bouche énergétique
    graphics.lineStyle(2, 0xff66ff, 1);
    graphics.arc(cx, cy + 3, 5, 0.2, Math.PI - 0.2);
    graphics.strokePath();
  }

  static drawIceSpirit(graphics) {
    // Cristal de glace - bleu clair cristallin
    const cx = 16, cy = 16;
    
    // Cristal principal (forme hexagonale)
    graphics.fillStyle(0x99ccff, 0.9);
    graphics.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(angle) * 11;
      const py = cy + Math.sin(angle) * 11;
      if (i === 0) graphics.moveTo(px, py);
      else graphics.lineTo(px, py);
    }
    graphics.closePath();
    graphics.fillPath();
    
    // Reflets cristallins
    graphics.fillStyle(0xe6f3ff, 1);
    graphics.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(angle) * 7;
      const py = cy + Math.sin(angle) * 7;
      if (i === 0) graphics.moveTo(px, py);
      else graphics.lineTo(px, py);
    }
    graphics.closePath();
    graphics.fillPath();
    
    // Points de cristal (étoile intérieure)
    graphics.lineStyle(2, 0xffffff, 1);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(angle) * 9;
      const py = cy + Math.sin(angle) * 9;
      graphics.lineBetween(cx, cy, px, py);
    }
    
    // Contour du cristal
    graphics.lineStyle(1.5, 0x3399ff, 0.8);
    graphics.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(angle) * 11;
      const py = cy + Math.sin(angle) * 11;
      if (i === 0) graphics.moveTo(px, py);
      else graphics.lineTo(px, py);
    }
    graphics.closePath();
    graphics.strokePath();
    
    // Brillance
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillCircle(cx - 3, cy - 3, 3);
    
    // Yeux glacés
    graphics.fillStyle(0x000066, 1);
    graphics.fillCircle(cx - 4, cy, 2);
    graphics.fillCircle(cx + 4, cy, 2);
    
    graphics.fillStyle(0xccffff, 1);
    graphics.fillCircle(cx - 3, cy - 1, 1);
    graphics.fillCircle(cx + 5, cy - 1, 1);
    
    // Bouche cristalline
    graphics.lineStyle(1.5, 0x3399ff, 1);
    graphics.arc(cx, cy + 4, 4, 0.2, Math.PI - 0.2);
    graphics.strokePath();
  }

  static drawIronSpirit(graphics) {
    // Boule de fer - gris métallique
    const cx = 16, cy = 16;
    
    // Sphère métallique
    graphics.fillStyle(0x708090, 1);
    graphics.fillCircle(cx, cy, 12);
    
    // Reflet métallique (gradient simulé)
    graphics.fillStyle(0xa9a9a9, 0.9);
    graphics.fillCircle(cx - 3, cy - 3, 8);
    
    graphics.fillStyle(0xc0c0c0, 0.8);
    graphics.fillCircle(cx - 4, cy - 4, 5);
    
    // Brillance métallique
    graphics.fillStyle(0xffffff, 0.7);
    graphics.fillCircle(cx - 5, cy - 5, 3);
    
    // Ombre métallique
    graphics.fillStyle(0x2f4f4f, 0.6);
    graphics.fillCircle(cx + 4, cy + 4, 6);
    
    // Contour sombre
    graphics.lineStyle(2, 0x404040, 0.9);
    graphics.strokeCircle(cx, cy, 12);
    
    // Reflets secondaires
    graphics.fillStyle(0xdcdcdc, 0.5);
    graphics.fillCircle(cx + 3, cy - 4, 2);
    graphics.fillCircle(cx - 2, cy + 5, 2);
    
    // Yeux métalliques
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(cx - 4, cy - 1, 3);
    graphics.fillCircle(cx + 4, cy - 1, 3);
    
    graphics.fillStyle(0xffffff, 0.8);
    graphics.fillCircle(cx - 3, cy - 2, 1);
    graphics.fillCircle(cx + 5, cy - 2, 1);
    
    // Bouche métallique
    graphics.lineStyle(2, 0x404040, 1);
    graphics.arc(cx, cy + 3, 4, 0.2, Math.PI - 0.2);
    graphics.strokePath();
  }

  static drawGoldSpirit(graphics) {
    // Pièce d'or - jaune doré brillant
    const cx = 16, cy = 16;
    
    // Pièce principale
    graphics.fillStyle(0xffd700, 1);
    graphics.fillCircle(cx, cy, 13);
    
    // Bordure de la pièce
    graphics.lineStyle(1.5, 0xdaa520, 1);
    graphics.strokeCircle(cx, cy, 13);
    graphics.strokeCircle(cx, cy, 11);
    
    // Motif central (couronne ou étoile)
    graphics.fillStyle(0xffdf00, 1);
    graphics.fillCircle(cx, cy, 8);
    
    // Étoile dorée
    graphics.fillStyle(0xdaa520, 1);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = cx + Math.cos(angle) * 5;
      const py = cy + Math.sin(angle) * 5;
      graphics.fillCircle(px, py, 1.5);
    }
    
    // Reflets dorés
    graphics.fillStyle(0xffed4e, 0.9);
    graphics.fillCircle(cx - 5, cy - 5, 4);
    graphics.fillCircle(cx + 5, cy + 4, 3);
    
    // Brillance intense
    graphics.fillStyle(0xfffff0, 0.8);
    graphics.fillCircle(cx - 5, cy - 5, 2);
    graphics.fillCircle(cx + 5, cy + 3, 1.5);
    
    // Ombre dorée
    graphics.fillStyle(0xb8860b, 0.6);
    graphics.fillCircle(cx + 4, cy + 5, 5);
    
    // Yeux dorés brillants
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(cx - 4, cy - 1, 2);
    graphics.fillCircle(cx + 4, cy - 1, 2);
    
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(cx - 3, cy - 2, 1);
    graphics.fillCircle(cx + 5, cy - 2, 1);
    
    // Bouche souriante
    graphics.lineStyle(1.5, 0xb8860b, 1);
    graphics.arc(cx, cy + 3, 5, 0.2, Math.PI - 0.2);
    graphics.strokePath();
  }

  static drawWindSpirit(graphics) {
    // Boule de vent - blanc/gris avec tourbillons
    const cx = 16, cy = 16;
    
    // Base tourbillonnante
    graphics.fillStyle(0xe0e0e0, 0.8);
    graphics.fillCircle(cx, cy, 12);
    
    // Tourbillons internes (spirale)
    graphics.lineStyle(2, 0xffffff, 0.9);
    for (let i = 0; i < 3; i++) {
      const offset = i * (Math.PI * 2 / 3);
      graphics.beginPath();
      for (let t = 0; t < Math.PI * 1.5; t += 0.2) {
        const r = t * 3;
        const angle = t + offset;
        const px = cx + Math.cos(angle) * r;
        const py = cy + Math.sin(angle) * r;
        if (t === 0) graphics.moveTo(px, py);
        else graphics.lineTo(px, py);
      }
      graphics.strokePath();
    }
    
    // Centre brillant
    graphics.fillStyle(0xffffff, 0.9);
    graphics.fillCircle(cx, cy, 5);
    
    // Yeux aériens
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(cx - 4, cy - 1, 2);
    graphics.fillCircle(cx + 4, cy - 1, 2);
    
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(cx - 3, cy - 2, 1);
    graphics.fillCircle(cx + 5, cy - 2, 1);
    
    // Bouche souriante
    graphics.lineStyle(1.5, 0x808080, 1);
    graphics.arc(cx, cy + 3, 4, 0.2, Math.PI - 0.2);
    graphics.strokePath();
  }

  static drawSandSpirit(graphics) {
    // Boule de sable - beige/brun avec grains
    const cx = 16, cy = 16;
    
    // Corps sableux
    graphics.fillStyle(0xc2b280, 1);
    graphics.fillCircle(cx, cy, 12);
    
    // Grains de sable (texture)
    graphics.fillStyle(0xdaa520, 0.8);
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 10;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      graphics.fillCircle(px, py, 1);
    }
    
    // Grains plus foncés
    graphics.fillStyle(0x8b7355, 0.6);
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 9;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      graphics.fillCircle(px, py, 0.8);
    }
    
    // Reflet doré
    graphics.fillStyle(0xf4a460, 0.7);
    graphics.fillCircle(cx - 4, cy - 4, 4);
    
    // Yeux de sable
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(cx - 4, cy, 2);
    graphics.fillCircle(cx + 4, cy, 2);
    
    graphics.fillStyle(0xdaa520, 1);
    graphics.fillCircle(cx - 3, cy - 1, 1);
    graphics.fillCircle(cx + 5, cy - 1, 1);
    
    // Bouche
    graphics.lineStyle(1.5, 0x8b7355, 1);
    graphics.arc(cx, cy + 3, 4, 0.2, Math.PI - 0.2);
    graphics.strokePath();
    
    return graphics;
  }
  
  static drawRockSpirit(graphics) {
    // Spirit roche - gris pierre avec texture rocheuse
    const cx = 16, cy = 16;
    
    // Corps rocheux principal
    graphics.fillStyle(0x808080, 1);
    graphics.fillCircle(cx, cy, 12);
    
    // Texture de pierre (taches plus foncées)
    graphics.fillStyle(0x505050, 0.8);
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 10;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      graphics.fillCircle(px, py, Phaser.Math.Between(1, 2));
    }
    
    // Taches claires (reflets minéraux)
    graphics.fillStyle(0xa9a9a9, 0.7);
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 9;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      graphics.fillCircle(px, py, 1);
    }
    
    // Reflet sur le dessus
    graphics.fillStyle(0xc0c0c0, 0.6);
    graphics.fillCircle(cx - 3, cy - 4, 3);
    
    // Yeux de pierre
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(cx - 4, cy, 2);
    graphics.fillCircle(cx + 4, cy, 2);
    
    graphics.fillStyle(0xa9a9a9, 1);
    graphics.fillCircle(cx - 3, cy - 1, 1);
    graphics.fillCircle(cx + 5, cy - 1, 1);
    
    // Bouche
    graphics.lineStyle(1.5, 0x505050, 1);
    graphics.arc(cx, cy + 3, 4, 0.2, Math.PI - 0.2);
    graphics.strokePath();
    
    return graphics;
  }

  static drawLightSpirit(graphics) {
    // Boule rayonnante - jaune/blanc lumineux
    const cx = 16, cy = 16;
    
    // Noyau brillant
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(cx, cy, 7);
    
    // Couche lumineuse jaune
    graphics.fillStyle(0xffff99, 0.9);
    graphics.fillCircle(cx, cy, 11);
    
    // Rayons lumineux
    graphics.lineStyle(2, 0xffff00, 0.8);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = cx + Math.cos(angle) * 13;
      const py = cy + Math.sin(angle) * 13;
      graphics.lineBetween(cx, cy, px, py);
    }
    
    // Rayons secondaires (plus courts)
    graphics.lineStyle(1.5, 0xfffacd, 0.6);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const px = cx + Math.cos(angle) * 9;
      const py = cy + Math.sin(angle) * 9;
      graphics.lineBetween(cx, cy, px, py);
    }
    
    // Yeux brillants
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(cx - 3, cy - 1, 2);
    graphics.fillCircle(cx + 3, cy - 1, 2);
    
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(cx - 2, cy - 2, 1);
    graphics.fillCircle(cx + 4, cy - 2, 1);
    
    // Bouche rayonnante
    graphics.lineStyle(2, 0xffff00, 1);
    graphics.arc(cx, cy + 2, 4, 0.2, Math.PI - 0.2);
    graphics.strokePath();
  }

  static drawWaterLightSpirit(graphics) {
    // Boule d'eau lumineuse - bleu clair aquatique
    const cx = 16, cy = 16;
    
    // Base aqueuse
    graphics.fillStyle(0x87ceeb, 0.8);
    graphics.fillCircle(cx, cy, 12);
    
    // Couche plus claire
    graphics.fillStyle(0xadd8e6, 0.7);
    graphics.fillCircle(cx, cy, 10);
    
    // Vagues internes
    graphics.lineStyle(1.5, 0xffffff, 0.7);
    for (let i = 0; i < 3; i++) {
      const y = cy - 6 + i * 4;
      graphics.beginPath();
      graphics.moveTo(cx - 8, y);
      for (let x = -8; x <= 8; x += 2) {
        const wave = Math.sin(x * 0.5 + i) * 2;
        graphics.lineTo(cx + x, y + wave);
      }
      graphics.strokePath();
    }
    
    // Bulles d'eau
    graphics.fillStyle(0xffffff, 0.6);
    graphics.fillCircle(cx - 4, cy - 3, 2);
    graphics.fillCircle(cx + 3, cy - 5, 1.5);
    graphics.fillCircle(cx + 1, cy + 4, 2);
    
    // Yeux aquatiques
    graphics.fillStyle(0x000066, 1);
    graphics.fillCircle(cx - 4, cy, 2);
    graphics.fillCircle(cx + 4, cy, 2);
    
    graphics.fillStyle(0xadd8e6, 1);
    graphics.fillCircle(cx - 3, cy - 1, 1);
    graphics.fillCircle(cx + 5, cy - 1, 1);
    
    // Bouche fluide
    graphics.lineStyle(1.5, 0x4682b4, 1);
    graphics.arc(cx, cy + 3, 4, 0.2, Math.PI - 0.2);
    graphics.strokePath();
  }
}
