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
        
        // Recalculate level based on score (in case formula changed)
        this.updateLevel();
        console.log(`Progress loaded: Score=${this.globalScore}, Level=${this.level}`);
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
  // Level 1: 0-99 (100 points)
  // Level 2: 100-249 (150 points)
  // Level 3: 250-449 (200 points)
  // Level 4: 450-699 (250 points)
  // Level 5: 700-999 (300 points)
  // etc. (increment increases by 50 each level)
  updateLevel() {
    let currentLevel = 1;
    let totalRequired = 0;

    // Continue checking until score doesn't meet next threshold
    while (true) {
      // Calculate points needed for next level
      const pointsForNextLevel = 100 + (currentLevel - 1) * 50;
      
      if (this.globalScore >= totalRequired + pointsForNextLevel) {
        currentLevel++;
        totalRequired += pointsForNextLevel;
      } else {
        break;
      }
    }

    const oldLevel = this.level;
    this.level = currentLevel;
    
    if (oldLevel !== currentLevel) {
      console.log(`Level updated: ${oldLevel} -> ${currentLevel} (Score: ${this.globalScore}, Next level at: ${totalRequired + (100 + (currentLevel - 1) * 50)})`);
    }
  }

  // Get score needed for next level
  getScoreForNextLevel() {
    let totalRequired = 0;

    // Calculate total score accumulated up to current level
    for (let i = 1; i < this.level; i++) {
      totalRequired += 100 + (i - 1) * 50;
    }

    // Add points needed for next level
    const pointsForNextLevel = 100 + (this.level - 1) * 50;
    return totalRequired + pointsForNextLevel;
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
