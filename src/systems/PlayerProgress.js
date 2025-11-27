// Player progression and level system
export class PlayerProgress {
  constructor() {
    this.globalScore = 0;
    this.level = 1;
    this.victories = 0;
    this.load();
  }

  // Load progress from localStorage
  load() {
    try {
      const saved = localStorage.getItem('magnetisme_progress');
      if (saved) {
        const data = JSON.parse(saved);
        this.globalScore = data.globalScore || 0;
        this.level = data.level || 1;
        this.victories = data.victories || 0;
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }

  // Save progress to localStorage
  save() {
    try {
      const data = {
        globalScore: this.globalScore,
        level: this.level,
        victories: this.victories
      };
      localStorage.setItem('magnetisme_progress', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }

  // Add victory points based on game score
  addVictory(gameScore) {
    const points = Math.floor(gameScore / 100);
    this.globalScore += points;
    this.victories++;
    this.updateLevel();
    this.save();
    return points;
  }

  // Calculate level based on global score
  // Level 1: 0-249
  // Level 2: 250-749 (+500)
  // Level 3: 750-1749 (+1000)
  // Level 4: 1750-2999 (+1250)
  // Level 5: 3000-4499 (+1500)
  // etc. (increment increases by 250 each level)
  updateLevel() {
    let currentLevel = 1;
    let requiredScore = 0;
    let increment = 250;

    while (this.globalScore >= requiredScore) {
      const nextThreshold = requiredScore + increment;
      if (this.globalScore >= nextThreshold) {
        currentLevel++;
        requiredScore = nextThreshold;
        
        // Increase increment every level
        if (currentLevel === 2) increment = 500;
        else if (currentLevel === 3) increment = 1000;
        else if (currentLevel >= 4) increment = 1000 + (currentLevel - 3) * 250;
      } else {
        break;
      }
    }

    this.level = currentLevel;
  }

  // Get score needed for next level
  getScoreForNextLevel() {
    let requiredScore = 0;
    let increment = 250;

    for (let i = 1; i < this.level; i++) {
      if (i === 1) increment = 250;
      else if (i === 2) increment = 500;
      else if (i === 3) increment = 1000;
      else increment = 1000 + (i - 3) * 250;
      
      requiredScore += increment;
    }

    // Calculate next level threshold
    if (this.level === 1) increment = 250;
    else if (this.level === 2) increment = 500;
    else if (this.level === 3) increment = 1000;
    else increment = 1000 + (this.level - 3) * 250;

    return requiredScore + increment;
  }

  // Check if player can use an element based on level
  canUseElement(elementKey, requiredLevel) {
    return this.level >= requiredLevel;
  }

  // Reset progress (for testing)
  reset() {
    this.globalScore = 0;
    this.level = 1;
    this.victories = 0;
    this.save();
  }
}

// Global instance
export const playerProgress = new PlayerProgress();
