
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { getDrillById } from '@/data/drills';
import { IconSymbol } from '@/components/IconSymbol';
import { LeaderboardService, Division } from '@/services/leaderboardService';
import { LeaderboardEntry } from '@/types/drills';

export default function LeaderboardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const drill = getDrillById(id);
  
  const [selectedDivision, setSelectedDivision] = useState<Division>('SSP');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const loadLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const leaderboardService = LeaderboardService.getInstance();
      const entries = await leaderboardService.getLeaderboard(id, selectedDivision, 100);
      setLeaderboard(entries);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id, selectedDivision]);

  const checkPendingUploads = useCallback(() => {
    const leaderboardService = LeaderboardService.getInstance();
    setPendingCount(leaderboardService.getPendingUploadCount());
  }, []);

  useEffect(() => {
    loadLeaderboard();
    checkPendingUploads();
  }, [loadLeaderboard, checkPendingUploads]);

  const handleSync = async () => {
    try {
      const leaderboardService = LeaderboardService.getInstance();
      const synced = await leaderboardService.syncPendingUploads();
      console.log(`Synced ${synced} scores`);
      checkPendingUploads();
      loadLeaderboard();
    } catch (error) {
      console.error('Error syncing:', error);
    }
  };

  const divisions: Division[] = ['SSP', 'ESP', 'CCP'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow_back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        {pendingCount > 0 && (
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSync}
          >
            <IconSymbol
              ios_icon_name="arrow.clockwise"
              android_material_icon_name="sync"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.syncBadge}>{pendingCount}</Text>
          </TouchableOpacity>
        )}
        {pendingCount === 0 && <View style={{ width: 40 }} />}
      </View>

      {/* Drill Name */}
      <View style={styles.drillSection}>
        <Text style={styles.drillName}>{drill?.name}</Text>
        <Text style={styles.drillSubtext}>Global Rankings</Text>
      </View>

      {/* Division Selector */}
      <View style={styles.divisionSelector}>
        {divisions.map((division) => (
          <TouchableOpacity
            key={division}
            style={[
              styles.divisionButton,
              selectedDivision === division && styles.divisionButtonActive
            ]}
            onPress={() => setSelectedDivision(division)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.divisionButtonText,
              selectedDivision === division && styles.divisionButtonTextActive
            ]}>
              {division}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Leaderboard List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading leaderboard...</Text>
          </View>
        ) : leaderboard.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol
              ios_icon_name="trophy"
              android_material_icon_name="emoji_events"
              size={64}
              color={colors.secondary}
            />
            <Text style={styles.emptyText}>No scores yet</Text>
            <Text style={styles.emptySubtext}>Be the first to set a record!</Text>
          </View>
        ) : (
          <React.Fragment>
            {leaderboard.map((entry, index) => (
              <View key={index} style={styles.leaderboardItem}>
                <View style={styles.rankContainer}>
                  {index < 3 ? (
                    <IconSymbol
                      ios_icon_name="trophy.fill"
                      android_material_icon_name="emoji_events"
                      size={24}
                      color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}
                    />
                  ) : (
                    <Text style={styles.rankText}>{index + 1}</Text>
                  )}
                </View>

                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{entry.userName}</Text>
                    {entry.isVeteran && (
                      <View style={styles.vetBadge}>
                        <IconSymbol
                          ios_icon_name="star.fill"
                          android_material_icon_name="star"
                          size={12}
                          color={colors.accent}
                        />
                        <Text style={styles.vetText}>VET</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.userTime}>{entry.totalTime.toFixed(2)}s</Text>
                </View>

                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>{entry.score}</Text>
                </View>
              </View>
            ))}
          </React.Fragment>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <IconSymbol
            ios_icon_name="info.circle.fill"
            android_material_icon_name="info"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.infoText}>
            Scores are synced automatically when online. Offline scores will be uploaded when connection is restored.
          </Text>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  syncBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  drillSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  drillName: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  drillSubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
  },
  divisionSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  divisionButton: {
    flex: 1,
    backgroundColor: colors.card,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  divisionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  divisionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  divisionButtonTextActive: {
    color: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  vetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  vetText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
  },
  userTime: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  scoreContainer: {
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
