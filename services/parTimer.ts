
// Par timer service — uses expo-haptics for reliable audio-free signaling
// Haptics work on all iPhones without requiring audio files or permissions

import * as Haptics from 'expo-haptics';

export class ParTimer {
  private parTimeout: NodeJS.Timeout | null = null;
  private beepInterval: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  async initialize() {
    try {
      if (this.isInitialized) {
        return;
      }
      console.log('ParTimer: Initializing');
      this.isInitialized = true;
      console.log('ParTimer: Initialized successfully');
    } catch (error) {
      console.error('ParTimer: Error initializing:', error);
    }
  }

  async playSmokeDetectorAlarm() {
    try {
      console.log('ParTimer: Playing smoke detector alarm (haptics)');

      // Three rapid heavy impacts like a smoke detector chirp
      for (let i = 0; i < 3; i++) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await new Promise(resolve => setTimeout(resolve, 150));
        } catch (hapticError) {
          console.error(`ParTimer: Haptic ${i + 1} failed:`, hapticError);
        }
      }

      console.log('ParTimer: Smoke detector alarm played');
    } catch (error) {
      console.error('ParTimer: Error playing alarm:', error);
    }
  }

  async playStartAlarm() {
    console.log('ParTimer: Playing start alarm');
    await this.playSmokeDetectorAlarm();
  }

  async playParAlarm() {
    console.log('ParTimer: Playing par time alarm');
    await this.playSmokeDetectorAlarm();
  }

  startParTimer(parTimeSeconds: number, onParReached: () => void) {
    if (this.parTimeout) {
      clearTimeout(this.parTimeout);
    }

    console.log(`ParTimer: Starting par timer for ${parTimeSeconds} seconds`);

    this.parTimeout = setTimeout(async () => {
      console.log('ParTimer: Par time reached!');
      try {
        await this.playParAlarm();
      } catch (error) {
        console.error('ParTimer: Error playing par alarm:', error);
      }
      onParReached();
    }, parTimeSeconds * 1000);
  }

  stopParTimer() {
    if (this.parTimeout) {
      console.log('ParTimer: Stopping par timer');
      clearTimeout(this.parTimeout);
      this.parTimeout = null;
    }
    if (this.beepInterval) {
      clearInterval(this.beepInterval);
      this.beepInterval = null;
    }
  }

  cleanup() {
    console.log('ParTimer: Cleaning up');
    this.stopParTimer();
    this.isInitialized = false;
  }
}
