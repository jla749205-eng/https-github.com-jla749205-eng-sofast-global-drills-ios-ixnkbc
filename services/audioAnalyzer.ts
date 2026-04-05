
// Audio analysis service for shot detection via microphone
// Uses expo-audio (SDK 54+)
//
// ARCHITECTURE NOTE:
// expo-audio's useAudioRecorder hook must be called inside a React component.
// This service class operates in two modes:
//   1. With recorder: caller passes a recorder created via useAudioRecorder()
//   2. Without recorder: audio detection is disabled; shot detection falls back to gyroscope only.
//
// The camera screen currently uses mode 2 (gyro-only) which is safe and correct.

import { AudioModule } from 'expo-audio';

export class AudioAnalyzer {
  private isAnalyzing = false;
  private analysisInterval: NodeJS.Timeout | null = null;

  constructor() {
    console.log('AudioAnalyzer initialized');
  }

  /**
   * Start analyzing audio levels. Calls onLevelChange with a 0-1 normalized level.
   * NOTE: The caller may pass a recorder created via useAudioRecorder() hook.
   * If no recorder is provided, audio detection is disabled and gyro-only mode is used.
   */
  async startAnalyzing(
    onLevelChange: (level: number) => void,
    recorder?: {
      prepareToRecordAsync: (options: Record<string, unknown>) => Promise<void>;
      record: () => void;
      stop: () => Promise<void>;
      metering?: number;
      [key: string]: unknown;
    }
  ) {
    try {
      console.log('Starting audio analysis...');

      // Request permissions via AudioModule imperative API
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        console.warn('AudioAnalyzer: Audio permission not granted — gyro-only mode');
        return;
      }

      if (recorder) {
        this.isAnalyzing = true;
        try {
          await recorder.prepareToRecordAsync({ isMeteringEnabled: true });
          recorder.record();

          // Poll metering every 50ms
          this.analysisInterval = setInterval(() => {
            if (this.isAnalyzing && recorder) {
              try {
                const metering = recorder.metering as number | undefined;
                if (metering !== undefined) {
                  // Normalize from dB range (-160 to 0) to 0-1
                  const normalizedLevel = Math.max(0, Math.min(1, (metering + 160) / 160));
                  onLevelChange(normalizedLevel);
                }
              } catch (error) {
                console.error('AudioAnalyzer: Error reading metering:', error);
              }
            }
          }, 50);

          console.log('Audio analysis started successfully');
        } catch (error) {
          console.error('AudioAnalyzer: Error preparing/starting recording:', error);
          this.isAnalyzing = false;
        }
      } else {
        // No recorder provided — analysis runs in permission-only mode
        // Shot detection will rely on gyroscope only
        console.warn('AudioAnalyzer: no recorder provided, audio detection disabled — gyro-only mode');
        this.isAnalyzing = false;
      }
    } catch (error) {
      console.error('AudioAnalyzer: Error starting audio analysis:', error);
      this.isAnalyzing = false;
    }
  }

  async stopAnalyzing() {
    try {
      console.log('Stopping audio analysis...');
      this.isAnalyzing = false;

      if (this.analysisInterval) {
        clearInterval(this.analysisInterval);
        this.analysisInterval = null;
      }

      console.log('Audio analysis stopped');
    } catch (error) {
      console.error('AudioAnalyzer: Error in stopAnalyzing:', error);
    }
  }

  isActive(): boolean {
    return this.isAnalyzing;
  }
}
