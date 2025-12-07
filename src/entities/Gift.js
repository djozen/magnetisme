import Phaser from 'phaser';

export default class Gift extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    // Create gift visual as orb/ball with symbol
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    
    // Get colors based on type
    const glowColor = Gift.getGlowColor(type);
    const baseColor = Gift.getBaseColor(type);
    
    // Draw orb with gradient effect
    // Outer glow
    graphics.fillStyle(glowColor, 0.3);
    graphics.fillCircle(16, 16, 14);
    
    // Main orb
    graphics.fillStyle(baseColor, 1);
    graphics.fillCircle(16, 16, 12);
    
    // Highlight (top-left)
    graphics.fillStyle(0xffffff, 0.6);
    graphics.fillCircle(13, 13, 4);
    
    // Outline
    graphics.lineStyle(2, glowColor, 0.9);
    graphics.strokeCircle(16, 16, 12);
    
    // Draw symbol on top based on type
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.fillStyle(0xffffff, 1);
    
    if (type === 'element') {
      // Star symbol
      for (let i = 0; i < 5; i++) {
        const angle = (i * 72 - 90) * Math.PI / 180;
        const x1 = 16 + Math.cos(angle) * 6;
        const y1 = 16 + Math.sin(angle) * 6;
        const angle2 = ((i + 2) * 72 - 90) * Math.PI / 180;
        const x2 = 16 + Math.cos(angle2) * 6;
        const y2 = 16 + Math.sin(angle2) * 6;
        if (i === 0) graphics.beginPath().moveTo(x1, y1);
        graphics.lineTo(x2, y2);
      }
      graphics.closePath();
      graphics.strokePath();
    } else if (type === 'time') {
      // Clock symbol
      graphics.strokeCircle(16, 16, 5);
      graphics.beginPath();
      graphics.moveTo(16, 16);
      graphics.lineTo(16, 12);
      graphics.moveTo(16, 16);
      graphics.lineTo(19, 16);
      graphics.strokePath();
    } else if (type === 'magnetism') {
      // Magnet/arrows symbol
      graphics.beginPath();
      // Arrow pointing inward from top
      graphics.moveTo(16, 10);
      graphics.lineTo(16, 16);
      graphics.lineTo(13, 13);
      graphics.moveTo(16, 16);
      graphics.lineTo(19, 13);
      // Arrow pointing inward from right
      graphics.moveTo(22, 16);
      graphics.lineTo(16, 16);
      graphics.lineTo(19, 13);
      graphics.moveTo(16, 16);
      graphics.lineTo(19, 19);
      graphics.strokePath();
    }
    
    // Generate texture
    const key = `gift_${type}_${x}_${y}_${Date.now()}`;
    graphics.generateTexture(key, 32, 32);
    graphics.destroy();

    super(scene, x, y, key);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    this.setDepth(8); // Gifts above terrain but below spirits

    this.type = type; // 'element', 'time', 'magnetism'
    this.setCollideWorldBounds(true);
    
    // Floating animation
    scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Glow pulse
    scene.tweens.add({
      targets: this,
      alpha: { from: 1, to: 0.6 },
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    // Label
    const labelText = this.getLabel(type);
    this.label = scene.add.text(x, y + 25, labelText, {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#00000080',
      padding: { x: 3, y: 1 }
    }).setOrigin(0.5).setDepth(8);
  }

  static getGlowColor(type) {
    switch(type) {
      case 'element': return 0xff00ff;
      case 'time': return 0x00ffff;
      case 'magnetism': return 0xffff00;
      default: return 0xffffff;
    }
  }

  static getBaseColor(type) {
    switch(type) {
      case 'element': return 0x9900cc; // Purple
      case 'time': return 0x0099cc; // Cyan
      case 'magnetism': return 0xcccc00; // Yellow
      default: return 0x888888;
    }
  }

  getGlowColor(type) {
    return Gift.getGlowColor(type);
  }

  getLabel(type) {
    switch(type) {
      case 'element': return 'POWER';
      case 'time': return '+TIME';
      case 'magnetism': return 'MAGNET';
      default: return 'GIFT';
    }
  }

  update() {
    if (this.label) {
      this.label.setPosition(this.x, this.y + 25);
    }
  }

  destroy() {
    if (this.label) {
      this.label.destroy();
    }
    super.destroy();
  }
}
