
export interface ShotDetectionResult {
  timestamp: number;
  confidence: number;
  method: 'audio' | 'gyro' | 'combined';
}

export class ShotDetector {
  private audioThreshold = 0.55; // Lowered threshold for better sensitivity
  private gyroThreshold = 2.0; // Lowered threshold for better recoil detection
  private minTimeBetweenShots = 80; // Reduced to allow faster shot detection
  private lastShotTime = 0;
  private audioLevels: number[] = [];
  private isMonitoring = false;
  private adaptiveThreshold = 0.55; // Dynamic threshold that adapts to environment

  constructor() {
    console.log('ShotDetector initialized with improved sensitivity');
  }

  // Process audio data for muzzle blast detection with adaptive threshold
  processAudioLevel(level: number): ShotDetectionResult | null {
    if (!this.isMonitoring) return null;

    this.audioLevels.push(level);
    
    // Keep only last 20 samples for better baseline calculation
    if (this.audioLevels.length > 20) {
      this.audioLevels.shift();
    }

    // Calculate baseline average and standard deviation
    const baseline = this.audioLevels.reduce((a, b) => a + b, 0) / this.audioLevels.length;
    const variance = this.audioLevels.reduce((sum, val) => sum + Math.pow(val - baseline, 2), 0) / this.audioLevels.length;
    const stdDev = Math.sqrt(variance);
    
    // Adaptive threshold: baseline + 2 standard deviations
    this.adaptiveThreshold = Math.max(this.audioThreshold, baseline + (stdDev * 2));
    
    // Detect spike above adaptive threshold
    if (level > this.adaptiveThreshold && level > baseline * 1.8) {
      const now = Date.now();
      
      // Debounce - ignore if too soon after last shot
      if (now - this.lastShotTime < this.minTimeBetweenShots) {
        return null;
      }

      this.lastShotTime = now;
      console.log(`Audio shot detected: level=${level.toFixed(2)}, baseline=${baseline.toFixed(2)}, threshold=${this.adaptiveThreshold.toFixed(2)}`);
      
      return {
        timestamp: now,
        confidence: Math.min(level / this.adaptiveThreshold, 1),
        method: 'audio'
      };
    }

    return null;
  }

  // Process gyroscope data for recoil detection with improved sensitivity
  processGyroData(x: number, y: number, z: number): ShotDetectionResult | null {
    if (!this.isMonitoring) return null;

    // Calculate magnitude of rotation with emphasis on vertical recoil (y-axis)
    // Most pistol recoil is upward, so weight y-axis more heavily
    const magnitude = Math.sqrt(x * x + (y * 1.5) * (y * 1.5) + z * z);

    if (magnitude > this.gyroThreshold) {
      const now = Date.now();
      
      // Debounce
      if (now - this.lastShotTime < this.minTimeBetweenShots) {
        return null;
      }

      this.lastShotTime = now;
      console.log(`Gyro shot detected: magnitude=${magnitude.toFixed(2)} (x=${x.toFixed(2)}, y=${y.toFixed(2)}, z=${z.toFixed(2)})`);
      
      return {
        timestamp: now,
        confidence: Math.min(magnitude / (this.gyroThreshold * 2), 1),
        method: 'gyro'
      };
    }

    return null;
  }

  // Combine multiple detection methods for higher accuracy
  combineDetections(audioResult: ShotDetectionResult | null, gyroResult: ShotDetectionResult | null): ShotDetectionResult | null {
    if (audioResult && gyroResult) {
      // Both detected - high confidence
      return {
        timestamp: audioResult.timestamp,
        confidence: (audioResult.confidence + gyroResult.confidence) / 2,
        method: 'combined'
      };
    }

    // Return whichever detected
    return audioResult || gyroResult;
  }

  startMonitoring() {
    this.isMonitoring = true;
    this.lastShotTime = 0;
    this.audioLevels = [];
    console.log('Shot detection monitoring started');
  }

  stopMonitoring() {
    this.isMonitoring = false;
    console.log('Shot detection monitoring stopped');
  }

  reset() {
    this.lastShotTime = 0;
    this.audioLevels = [];
  }
}

// Flinch detection based on gyroscope patterns
export class FlinchDetector {
  private gyroHistory: { x: number; y: number; z: number; timestamp: number }[] = [];
  private maxHistorySize = 30; // Keep last 30 samples (~500ms at 60fps)

  addGyroSample(x: number, y: number, z: number) {
    this.gyroHistory.push({ x, y, z, timestamp: Date.now() });
    
    if (this.gyroHistory.length > this.maxHistorySize) {
      this.gyroHistory.shift();
    }
  }

  // Detect anticipatory movement before shot
  detectFlinch(shotTimestamp: number): boolean {
    // Look at gyro data 200ms before shot
    const preShotWindow = this.gyroHistory.filter(
      sample => sample.timestamp > shotTimestamp - 200 && sample.timestamp < shotTimestamp
    );

    if (preShotWindow.length < 5) return false;

    // Calculate average movement in pre-shot window
    const avgMovement = preShotWindow.reduce((sum, sample) => {
      const magnitude = Math.sqrt(sample.x ** 2 + sample.y ** 2 + sample.z ** 2);
      return sum + magnitude;
    }, 0) / preShotWindow.length;

    // Flinch detected if significant movement before shot
    const flinchThreshold = 1.5;
    const hasFlinch = avgMovement > flinchThreshold;
    
    if (hasFlinch) {
      console.log(`Flinch detected: avg movement=${avgMovement.toFixed(2)}`);
    }

    return hasFlinch;
  }

  reset() {
    this.gyroHistory = [];
  }
}
