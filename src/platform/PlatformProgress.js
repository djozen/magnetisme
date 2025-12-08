// Platform game player progress system
export class PlatformProgress {
  constructor() {
    this.globalScore = 0;
    this.level = 1;
    this.completedChapters = [];
    this.completedLevels = {}; // { chapterKey: [level1, level2, ...] }
    this.highScores = {}; // { 'chapterKey_levelNum': score }
    this.unlockedElements = ['earth', 'fire', 'water'];
    this.load();
  }

  // Load progress from localStorage
  load() {
    try {
      const saved = localStorage.getItem('magnetisme_platform_progress');
      if (saved) {
        const data = JSON.parse(saved);
        this.globalScore = data.globalScore || 0;
        this.level = data.level || 1;
        this.completedChapters = data.completedChapters || [];
        this.completedLevels = data.completedLevels || {};
        this.highScores = data.highScores || {};
        this.unlockedElements = data.unlockedElements || ['earth', 'fire', 'water'];
        
        console.log(`Platform progress loaded: Level=${this.level}, Chapters=${this.completedChapters.length}`);
      }
    } catch (error) {
      console.error('Error loading platform progress:', error);
    }
  }

  // Save progress to localStorage
  save() {
    try {
      const data = {
        globalScore: this.globalScore,
        level: this.level,
        completedChapters: this.completedChapters,
        completedLevels: this.completedLevels,
        highScores: this.highScores,
        unlockedElements: this.unlockedElements
      };
      localStorage.setItem('magnetisme_platform_progress', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving platform progress:', error);
    }
  }

  // Complete a level
  completeLevel(chapterKey, levelNumber, score) {
    // Initialize chapter levels if needed
    if (!this.completedLevels[chapterKey]) {
      this.completedLevels[chapterKey] = [];
    }
    
    // Mark level as completed
    if (!this.completedLevels[chapterKey].includes(levelNumber)) {
      this.completedLevels[chapterKey].push(levelNumber);
    }
    
    // Update high score
    const levelKey = `${chapterKey}_${levelNumber}`;
    if (!this.highScores[levelKey] || score > this.highScores[levelKey]) {
      this.highScores[levelKey] = score;
    }
    
    // Add to global score
    this.globalScore += score;
    
    // Update level
    this.updateLevel();
    
    // Check if chapter is complete
    this.checkChapterCompletion(chapterKey);
    
    this.save();
  }

  // Check if all levels in chapter are complete
  checkChapterCompletion(chapterKey) {
    const levelsCompleted = this.completedLevels[chapterKey] || [];
    
    // Most chapters have 5 levels
    const requiredLevels = 5;
    
    if (levelsCompleted.length >= requiredLevels) {
      if (!this.completedChapters.includes(chapterKey)) {
        this.completedChapters.push(chapterKey);
        console.log(`Chapter ${chapterKey} completed!`);
      }
    }
  }

  // Update player level based on completed chapters
  updateLevel() {
    // Level = number of completed chapters + 1
    const oldLevel = this.level;
    this.level = this.completedChapters.length + 1;
    
    if (this.level > oldLevel) {
      console.log(`Level up! ${oldLevel} -> ${this.level}`);
    }
  }

  // Check if chapter is unlocked
  isChapterUnlocked(chapterKey, requiredLevel) {
    // In debug mode, all unlocked
    if (window.PLATFORM_CONFIG?.DEBUG_UNLOCK_ALL) {
      return true;
    }
    
    return this.level >= requiredLevel;
  }

  // Check if level is unlocked
  isLevelUnlocked(chapterKey, levelNumber) {
    // Level 1 always unlocked if chapter is unlocked
    if (levelNumber === 1) {
      return true;
    }
    
    // Check if previous level is completed
    const levelsCompleted = this.completedLevels[chapterKey] || [];
    return levelsCompleted.includes(levelNumber - 1);
  }

  // Get level score
  getLevelScore(chapterKey, levelNumber) {
    const levelKey = `${chapterKey}_${levelNumber}`;
    return this.highScores[levelKey] || 0;
  }

  // Check if level is completed
  isLevelCompleted(chapterKey, levelNumber) {
    const levelsCompleted = this.completedLevels[chapterKey] || [];
    return levelsCompleted.includes(levelNumber);
  }

  // Reset progress (for testing)
  reset() {
    this.globalScore = 0;
    this.level = 1;
    this.completedChapters = [];
    this.completedLevels = {};
    this.highScores = {};
    this.unlockedElements = ['earth', 'fire', 'water'];
    this.save();
  }

  // Unlock element
  unlockElement(elementKey) {
    if (!this.unlockedElements.includes(elementKey)) {
      this.unlockedElements.push(elementKey);
      this.save();
    }
  }

  // Check if element is unlocked
  isElementUnlocked(elementKey) {
    return this.unlockedElements.includes(elementKey);
  }
}

// Global instance
export const platformProgress = new PlatformProgress();
