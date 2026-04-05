
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { getDrillById } from '@/data/drills';
import { IconSymbol } from '@/components/IconSymbol';
import { LeaderboardService, Division } from '@/services/leaderboardService';
import { DrillResult } from '@/types/drills';
import { TargetAnalyzer, TargetAnalysisResult } from '@/services/targetAnalyzer';

export default function ResultsScreen() {
  const router = useRouter();
  const { id, time, shots, splits, flinches, targetAnalysis } = useLocalSearchParams<{
    id: string;
    time: string;
    shots: string;
    splits: string;
    flinches?: string;
    targetAnalysis?: string;
  }>();
  
  const drill = getDrillById(id);
  const totalTime = parseFloat(time || '0');
  const shotCount = parseInt(shots || '0', 10);
  const splitTimes = splits ? JSON.parse(splits) : [];
  const flinchCount = parseInt(flinches || '0', 10);
  const analysis: TargetAnalysisResult | null = targetAnalysis ? JSON.parse(targetAnalysis) : null;
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [classification, setClassification] = useState<string>('Novice');
  const [hitFactor, setHitFactor] = useState<number>(0);
  
  const isPar = drill?.parTime ? totalTime <= drill.parTime : false;
  const averageSplit = splitTimes.length > 0 
    ? splitTimes.reduce((a: number, b: number) => a + b, 0) / splitTimes.length 
    : 0;
  
  const fastestSplit = splitTimes.length > 0 ? Math.min(...splitTimes) : 0;
  const slowestSplit = splitTimes.length > 0 ? Math.max(...splitTimes) : 0;

  // Calculate score with target analysis
  const calculateScore = () => {
    let score = 100;
    
    // If we have target analysis, use accuracy data
    if (analysis) {
      score = analysis.accuracy;
    } else {
      // Fallback to simple scoring
      // Time penalty
      if (drill?.parTime) {
        const timeDiff = totalTime - drill.parTime;
        if (timeDiff > 0) {
          score -= timeDiff * 2; // -2 points per second over par
        }
      }
      
      // Miss penalty
      const expectedShots = drill?.rounds || shotCount;
      if (shotCount < expectedShots) {
        score -= (expectedShots - shotCount) * 5; // -5 points per missed shot
      }
      
      // Flinch penalty
      score -= flinchCount * 3; // -3 points per flinch
    }
    
    return Math.max(0, Math.round(score));
  };

  const score = calculateScore();

  // Calculate hit factor and classification
  useEffect(() => {
    const targetAnalyzer = TargetAnalyzer.getInstance();
    
    // Calculate hit factor: Points / Time
    // Use target analysis points if available, otherwise use score
    const points = analysis ? analysis.totalPoints : score;
    const hf = totalTime > 0 ? points / totalTime : 0;
    setHitFactor(hf);
    
    // Determine classification based on hit factor
    const classif = targetAnalyzer.calculateUSPSAClassification(hf);
    setClassification(classif);
    
    console.log(`Hit Factor: ${hf.toFixed(2)}, Classification: ${classif}`);
  }, [analysis, score, totalTime]);

  const handleUploadScore = async () => {
    try {
      console.log('Upload score to leaderboard pressed');
      setIsUploading(true);
      
      const result: DrillResult = {
        drillId: drill?.id || '',
        drillName: drill?.name || '',
        timestamp: Date.now(),
        totalTime,
        splits: splitTimes,
        hits: shotCount,
        misses: (drill?.rounds || 0) - shotCount,
        score,
        division: 'SSP', // Default division — TODO: Let user select division
        flinchDetected: flinchCount > 0,
        classification,
        hitFactor,
        targetAnalysis: analysis ? {
          totalPoints: analysis.totalPoints,
          accuracy: analysis.accuracy,
          alphaHits: analysis.alphaHits,
          charlieHits: analysis.charlieHits,
          deltaHits: analysis.deltaHits,
          targetType: analysis.targetType,
        } : undefined,
      };

      const leaderboardService = LeaderboardService.getInstance();
      const success = await leaderboardService.submitScore(result);
      
      setUploadSuccess(success);
      setIsUploading(false);
      
      if (success) {
        Alert.alert('Success', 'Your score has been uploaded to the global leaderboard!');
      } else {
        Alert.alert('Queued', 'Your score will be uploaded when you have an internet connection.');
      }
    } catch (error) {
      console.error('Error uploading score:', error);
      setIsUploading(false);
      Alert.alert('Error', 'Failed to upload score. It will be queued for later.');
    }
  };

  const handleDone = () => {
    router.push('/(tabs)/(home)/');
  };

  const handleRetry = () => {
    router.back();
  };

  const handleViewLeaderboard = () => {
    router.push({
      pathname: '/leaderboard/[id]',
      params: { id: drill?.id || '' }
    });
  };

  const handleViewRankings = () => {
    router.push('/rankings/');
  };

  const getClassificationColor = () => {
    const targetAnalyzer = TargetAnalyzer.getInstance();
    return targetAnalyzer.getClassificationColor(classification);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Drill Complete</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Drill Name */}
        <Text style={styles.drillName}>{drill?.name}</Text>

        {/* Score Badge */}
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreMax}>/ 100</Text>
        </View>

        {/* Classification Badge */}
        <View style={[styles.classificationBadge, { borderColor: getClassificationColor() }]}>
          <View style={[styles.classificationDot, { backgroundColor: getClassificationColor() }]} />
          <View style={styles.classificationInfo}>
            <Text style={styles.classificationLabel}>YOUR CLASSIFICATION</Text>
            <Text style={[styles.classificationValue, { color: getClassificationColor() }]}>
              {classification}
            </Text>
            <Text style={styles.hitFactorText}>Hit Factor: {hitFactor.toFixed(2)}</Text>
          </View>
        </View>

        {/* Main Stats */}
        <View style={styles.mainStatsContainer}>
          <View style={styles.mainStatCard}>
            <Text style={styles.mainStatLabel}>TOTAL TIME</Text>
            <Text style={[
              styles.mainStatValue,
              isPar && styles.parTime
            ]}>
              {totalTime.toFixed(2)}s
            </Text>
            {drill?.parTime && (
              <Text style={[
                styles.parIndicator,
                isPar && styles.parIndicatorSuccess
              ]}>
                {isPar ? '✓ UNDER PAR' : `+${(totalTime - drill.parTime).toFixed(2)}s`}
              </Text>
            )}
          </View>

          <View style={styles.mainStatCard}>
            <Text style={styles.mainStatLabel}>SHOTS FIRED</Text>
            <Text style={styles.mainStatValue}>{shotCount}</Text>
            <Text style={styles.subStatText}>
              of {drill?.rounds} rounds
            </Text>
          </View>
        </View>

        {/* Split Times */}
        {splitTimes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SPLIT TIMES</Text>
            <View style={styles.splitsContainer}>
              {splitTimes.map((split: number, index: number) => (
                <View key={index} style={styles.splitItem}>
                  <Text style={styles.splitNumber}>#{index + 1}</Text>
                  <View style={styles.splitBar}>
                    <View 
                      style={[
                        styles.splitBarFill,
                        { width: `${(split / slowestSplit) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.splitTime}>{split.toFixed(3)}s</Text>
                </View>
              ))}
            </View>
            <View style={styles.splitStatsRow}>
              <View style={styles.splitStatCard}>
                <Text style={styles.splitStatLabel}>Average</Text>
                <Text style={styles.splitStatValue}>{averageSplit.toFixed(3)}s</Text>
              </View>
              <View style={styles.splitStatCard}>
                <Text style={styles.splitStatLabel}>Fastest</Text>
                <Text style={styles.splitStatValue}>{fastestSplit.toFixed(3)}s</Text>
              </View>
              <View style={styles.splitStatCard}>
                <Text style={styles.splitStatLabel}>Slowest</Text>
                <Text style={styles.splitStatValue}>{slowestSplit.toFixed(3)}s</Text>
              </View>
            </View>
          </View>
        )}

        {/* AI Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI ANALYSIS</Text>
          <View style={styles.analysisCard}>
            <View style={styles.analysisHeader}>
              <IconSymbol
                ios_icon_name="brain"
                android_material_icon_name="psychology"
                size={32}
                color={colors.primary}
              />
              <Text style={styles.analysisTitle}>Shot Detection & Accuracy</Text>
            </View>
            <View style={styles.analysisStats}>
              <View style={styles.analysisStatItem}>
                <IconSymbol
                  ios_icon_name="waveform"
                  android_material_icon_name="graphic_eq"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={styles.analysisStatText}>Audio + Gyro Detection</Text>
              </View>
              {flinchCount > 0 && (
                <View style={styles.analysisStatItem}>
                  <IconSymbol
                    ios_icon_name="exclamationmark.triangle.fill"
                    android_material_icon_name="warning"
                    size={20}
                    color={colors.accent}
                  />
                  <Text style={styles.analysisStatText}>{flinchCount} Flinch{flinchCount > 1 ? 'es' : ''} Detected</Text>
                </View>
              )}
              <View style={styles.analysisStatItem}>
                <IconSymbol
                  ios_icon_name="checkmark.circle.fill"
                  android_material_icon_name="check_circle"
                  size={20}
                  color={colors.primary}
                />
                <Text style={styles.analysisStatText}>{shotCount} Shots Confirmed</Text>
              </View>
              {analysis && (
                <>
                  <View style={styles.analysisStatItem}>
                    <IconSymbol
                      ios_icon_name="target"
                      android_material_icon_name="gps_fixed"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.analysisStatText}>
                      Target Verified: {analysis.targetType}
                    </Text>
                  </View>
                  <View style={styles.analysisStatItem}>
                    <IconSymbol
                      ios_icon_name="scope"
                      android_material_icon_name="center_focus_strong"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.analysisStatText}>
                      A-Zone: {analysis.alphaHits} | C-Zone: {analysis.charlieHits} | D-Zone: {analysis.deltaHits}
                    </Text>
                  </View>
                  <View style={styles.analysisStatItem}>
                    <IconSymbol
                      ios_icon_name="star.fill"
                      android_material_icon_name="star"
                      size={20}
                      color={colors.accent}
                    />
                    <Text style={styles.analysisStatText}>
                      Accuracy: {analysis.accuracy.toFixed(1)}%
                    </Text>
                  </View>
                </>
              )}
            </View>
            {!analysis && (
              <Text style={styles.analysisNote}>
                Target photo not provided. Score based on timing only. Upload target photos for accurate classification and to compete in global rankings!
              </Text>
            )}
          </View>
        </View>

        {/* Upload to Leaderboard */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GLOBAL LEADERBOARD</Text>
          <TouchableOpacity
            style={[styles.uploadButton, uploadSuccess && styles.uploadButtonSuccess]}
            onPress={handleUploadScore}
            disabled={isUploading || uploadSuccess}
            activeOpacity={0.8}
          >
            <IconSymbol
              ios_icon_name={uploadSuccess ? "checkmark.circle.fill" : "arrow.up.circle.fill"}
              android_material_icon_name={uploadSuccess ? "check_circle" : "cloud_upload"}
              size={24}
              color={uploadSuccess ? colors.primary : colors.text}
            />
            <Text style={[styles.uploadButtonText, uploadSuccess && styles.uploadButtonTextSuccess]}>
              {isUploading ? 'Uploading...' : uploadSuccess ? 'Score Uploaded!' : 'Upload to Leaderboard'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.viewLeaderboardButton}
            onPress={handleViewLeaderboard}
            activeOpacity={0.8}
          >
            <IconSymbol
              ios_icon_name="trophy.fill"
              android_material_icon_name="emoji_events"
              size={20}
              color={colors.accent}
            />
            <Text style={styles.viewLeaderboardText}>View Drill Leaderboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewRankingsButton}
            onPress={handleViewRankings}
            activeOpacity={0.8}
          >
            <IconSymbol
              ios_icon_name="chart.bar.fill"
              android_material_icon_name="leaderboard"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.viewRankingsText}>View Global Rankings</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRetry}
          activeOpacity={0.8}
        >
          <IconSymbol
            ios_icon_name="arrow.clockwise"
            android_material_icon_name="refresh"
            size={24}
            color={colors.text}
          />
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  drillName: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  scoreBadge: {
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 24,
    minWidth: 160,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: '900',
    color: colors.primary,
    marginVertical: 4,
  },
  scoreMax: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  classificationBadge: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    marginBottom: 24,
    gap: 12,
    minWidth: 280,
  },
  classificationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  classificationInfo: {
    flex: 1,
  },
  classificationLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 2,
  },
  classificationValue: {
    fontSize: 24,
    fontWeight: '900',
    marginVertical: 2,
  },
  hitFactorText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  mainStatsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  mainStatCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  mainStatLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  mainStatValue: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
  },
  parTime: {
    color: colors.primary,
  },
  parIndicator: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 8,
  },
  parIndicatorSuccess: {
    color: colors.primary,
  },
  subStatText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 2,
    marginBottom: 12,
  },
  splitsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  splitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  splitNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 32,
  },
  splitBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.secondary,
    borderRadius: 4,
    overflow: 'hidden',
  },
  splitBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  splitTime: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    width: 80,
    textAlign: 'right',
  },
  splitStatsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  splitStatCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  splitStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 4,
  },
  splitStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  analysisCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  analysisStats: {
    gap: 12,
    marginBottom: 16,
  },
  analysisStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analysisStatText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  analysisNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  uploadButton: {
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  uploadButtonSuccess: {
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  uploadButtonTextSuccess: {
    color: colors.primary,
  },
  viewLeaderboardButton: {
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  viewLeaderboardText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  viewRankingsButton: {
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: colors.primary,
    marginTop: 8,
  },
  viewRankingsText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : 32,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.secondary,
  },
  retryButton: {
    flex: 1,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  doneButton: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.background,
  },
});
