
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { LeaderboardService, Division } from '@/services/leaderboardService';
import { TargetAnalyzer } from '@/services/targetAnalyzer';
import { DRILLS } from '@/data/drills';

interface RankingEntry {
  rank: number;
  userName: string;
  classification: string;
  hitFactor: number;
  totalScore: number;
  drillsCompleted: number;
  division: Division;
  isCurrentUser?: boolean;
}

interface DrillRankingEntry {
  rank: number;
  userName: string;
  time: number;
  score: number;
  hitFactor: number;
  accuracy: number;
  division: Division;
  isCurrentUser?: boolean;
}

const DIVISION_INFO: Record<Division, { name: string; description: string }> = {
  SSP: { name: 'Stock Service Pistol', description: 'Factory stock pistols' },
  ESP: { name: 'Enhanced Service Pistol', description: 'Modified service pistols' },
  CCP: { name: 'Carry Concealed Pistol', description: 'Compact carry pistols' },
  CDP: { name: 'Custom Defensive Pistol', description: '.45 ACP custom pistols' },
  REV: { name: 'Revolver', description: 'Revolvers only' },
  BUG: { name: 'Back-Up Gun', description: 'Pocket-sized pistols' },
  PCC: { name: 'Pistol Caliber Carbine', description: 'Pistol caliber carbines' },
};

type ViewMode = 'global' | 'by-drill';

export default function RankingsScreen() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('global');
  const [selectedDivision, setSelectedDivision] = useState<Division>('SSP');
  const [selectedDrill, setSelectedDrill] = useState<string>(DRILLS[0].id);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [drillRankings, setDrillRankings] = useState<DrillRankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRanking, setUserRanking] = useState<RankingEntry | null>(null);

  const loadGlobalRankings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const leaderboardService = LeaderboardService.getInstance();
      const globalRankings = await leaderboardService.getGlobalRankings(selectedDivision);
      
      setRankings(globalRankings);
      
      // Find current user's ranking
      const currentUser = globalRankings.find(r => r.isCurrentUser);
      setUserRanking(currentUser || null);
      
    } catch (error) {
      console.error('Error loading global rankings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDivision]);

  const loadDrillRankings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // TODO: Backend Integration - GET /api/rankings/drill/:drillId?division=:division
      // Returns: [{ rank, userName, time, score, hitFactor, accuracy, division, isCurrentUser }]
      
      // Mock drill-specific rankings for demonstration
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockDrillRankings: DrillRankingEntry[] = Array.from({ length: 20 }, (_, i) => ({
        rank: i + 1,
        userName: `Shooter${i + 1}`,
        time: 2.5 + Math.random() * 3,
        score: Math.floor(80 + Math.random() * 20),
        hitFactor: 5.0 + Math.random() * 3,
        accuracy: 85 + Math.random() * 15,
        division: selectedDivision,
        isCurrentUser: i === 7, // Mock current user at rank 8
      }));
      
      setDrillRankings(mockDrillRankings);
      
    } catch (error) {
      console.error('Error loading drill rankings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDivision]);

  useEffect(() => {
    if (viewMode === 'global') {
      loadGlobalRankings();
    } else {
      loadDrillRankings();
    }
  }, [viewMode, loadGlobalRankings, loadDrillRankings]);

  const getClassificationColor = (classification: string): string => {
    const analyzer = TargetAnalyzer.getInstance();
    return analyzer.getClassificationColor(classification);
  };

  const renderGlobalRankingItem = (entry: RankingEntry) => {
    const classificationColor = getClassificationColor(entry.classification);
    
    return (
      <View
        key={entry.rank}
        style={[
          styles.rankingCard,
          entry.isCurrentUser && styles.currentUserCard
        ]}
      >
        {/* Rank Badge */}
        <View style={[
          styles.rankBadge,
          entry.rank <= 3 && styles.topRankBadge
        ]}>
          {entry.rank <= 3 ? (
            <IconSymbol
              ios_icon_name={entry.rank === 1 ? 'crown.fill' : 'medal.fill'}
              android_material_icon_name={entry.rank === 1 ? 'emoji_events' : 'military_tech'}
              size={20}
              color={entry.rank === 1 ? '#FFD700' : entry.rank === 2 ? '#C0C0C0' : '#CD7F32'}
            />
          ) : (
            <Text style={styles.rankNumber}>{entry.rank}</Text>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={[
              styles.userName,
              entry.isCurrentUser && styles.currentUserName
            ]}>
              {entry.userName}
            </Text>
            {entry.isCurrentUser && (
              <View style={styles.youBadge}>
                <Text style={styles.youBadgeText}>YOU</Text>
              </View>
            )}
          </View>
          
          <View style={styles.classificationRow}>
            <View style={[
              styles.classificationBadge,
              { backgroundColor: classificationColor }
            ]}>
              <Text style={styles.classificationText}>{entry.classification}</Text>
            </View>
            <Text style={styles.divisionText}>{entry.division}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsColumn}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{entry.hitFactor.toFixed(2)}</Text>
            <Text style={styles.statLabel}>HF</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{entry.totalScore}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderDrillRankingItem = (entry: DrillRankingEntry) => {
    return (
      <View
        key={entry.rank}
        style={[
          styles.rankingCard,
          entry.isCurrentUser && styles.currentUserCard
        ]}
      >
        {/* Rank Badge */}
        <View style={[
          styles.rankBadge,
          entry.rank <= 3 && styles.topRankBadge
        ]}>
          {entry.rank <= 3 ? (
            <IconSymbol
              ios_icon_name={entry.rank === 1 ? 'crown.fill' : 'medal.fill'}
              android_material_icon_name={entry.rank === 1 ? 'emoji_events' : 'military_tech'}
              size={20}
              color={entry.rank === 1 ? '#FFD700' : entry.rank === 2 ? '#C0C0C0' : '#CD7F32'}
            />
          ) : (
            <Text style={styles.rankNumber}>{entry.rank}</Text>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={[
              styles.userName,
              entry.isCurrentUser && styles.currentUserName
            ]}>
              {entry.userName}
            </Text>
            {entry.isCurrentUser && (
              <View style={styles.youBadge}>
                <Text style={styles.youBadgeText}>YOU</Text>
              </View>
            )}
          </View>
          
          <View style={styles.classificationRow}>
            <Text style={styles.drillStatText}>{entry.time.toFixed(2)}s • {entry.accuracy.toFixed(0)}% acc</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsColumn}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{entry.hitFactor.toFixed(2)}</Text>
            <Text style={styles.statLabel}>HF</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{entry.score}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
        </View>
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>Rankings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'global' && styles.viewModeButtonActive
          ]}
          onPress={() => setViewMode('global')}
        >
          <IconSymbol
            ios_icon_name="globe"
            android_material_icon_name="public"
            size={18}
            color={viewMode === 'global' ? colors.background : colors.text}
          />
          <Text style={[
            styles.viewModeButtonText,
            viewMode === 'global' && styles.viewModeButtonTextActive
          ]}>
            Global
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'by-drill' && styles.viewModeButtonActive
          ]}
          onPress={() => setViewMode('by-drill')}
        >
          <IconSymbol
            ios_icon_name="list.bullet"
            android_material_icon_name="format_list_bulleted"
            size={18}
            color={viewMode === 'by-drill' ? colors.background : colors.text}
          />
          <Text style={[
            styles.viewModeButtonText,
            viewMode === 'by-drill' && styles.viewModeButtonTextActive
          ]}>
            By Drill
          </Text>
        </TouchableOpacity>
      </View>

      {/* Drill Selector (only for by-drill mode) */}
      {viewMode === 'by-drill' && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.drillSelector}
        >
          {DRILLS.map((drill) => (
            <TouchableOpacity
              key={drill.id}
              style={[
                styles.drillButton,
                selectedDrill === drill.id && styles.drillButtonActive
              ]}
              onPress={() => setSelectedDrill(drill.id)}
            >
              <Text style={[
                styles.drillButtonText,
                selectedDrill === drill.id && styles.drillButtonTextActive
              ]}>
                {drill.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Division Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.divisionSelector}
      >
        {(['SSP', 'ESP', 'CCP', 'CDP', 'REV', 'BUG', 'PCC'] as Division[]).map((division) => (
          <TouchableOpacity
            key={division}
            style={[
              styles.divisionButton,
              selectedDivision === division && styles.divisionButtonActive
            ]}
            onPress={() => setSelectedDivision(division)}
          >
            <Text style={[
              styles.divisionButtonText,
              selectedDivision === division && styles.divisionButtonTextActive
            ]}>
              {division}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Current User Ranking - Compact (only for global mode) */}
      {viewMode === 'global' && userRanking && (
        <View style={styles.currentUserContainer}>
          <Text style={styles.currentUserTitle}>YOUR RANK: #{userRanking.rank}</Text>
          <View style={styles.currentUserStats}>
            <View style={styles.currentUserStatBox}>
              <Text style={[
                styles.currentUserStatValue,
                { color: getClassificationColor(userRanking.classification) }
              ]}>
                {userRanking.classification}
              </Text>
            </View>
            <View style={styles.currentUserStatBox}>
              <Text style={styles.currentUserStatValue}>{userRanking.hitFactor.toFixed(2)} HF</Text>
            </View>
          </View>
        </View>
      )}

      {/* Rankings List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading rankings...</Text>
          </View>
        ) : viewMode === 'global' ? (
          <>
            <Text style={styles.sectionTitle}>TOP SHOOTERS - {DIVISION_INFO[selectedDivision].name}</Text>
            {rankings.map(renderGlobalRankingItem)}
            
            {/* Info Section - Compact */}
            <View style={styles.infoSection}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={20}
                color={colors.primary}
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>How Rankings Work</Text>
                <Text style={styles.infoText}>
                  Rankings are based on Hit Factor (Points ÷ Time). Complete drills with verified target photos to improve your classification and climb the leaderboard!
                </Text>
              </View>
            </View>

            {/* Bottom padding */}
            <View style={{ height: 100 }} />
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {DRILLS.find(d => d.id === selectedDrill)?.name.toUpperCase()} - {DIVISION_INFO[selectedDivision].name}
            </Text>
            {drillRankings.map(renderDrillRankingItem)}
            
            {/* Info Section - Compact */}
            <View style={styles.infoSection}>
              <IconSymbol
                ios_icon_name="info.circle.fill"
                android_material_icon_name="info"
                size={20}
                color={colors.primary}
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>Drill-Specific Rankings</Text>
                <Text style={styles.infoText}>
                  These rankings show the top performers for this specific drill. Complete the drill with a verified target photo to see your ranking!
                </Text>
              </View>
            </View>

            {/* Bottom padding */}
            <View style={{ height: 100 }} />
          </>
        )}
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
    paddingBottom: 12,
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
  viewModeContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.secondary,
    gap: 6,
  },
  viewModeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  viewModeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  viewModeButtonTextActive: {
    color: colors.background,
  },
  drillSelector: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  drillButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.secondary,
    alignItems: 'center',
  },
  drillButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  drillButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  drillButtonTextActive: {
    color: colors.background,
  },
  divisionSelector: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  divisionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.secondary,
    alignItems: 'center',
    minWidth: 60,
  },
  divisionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  divisionButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  divisionButtonTextActive: {
    color: colors.background,
  },
  currentUserContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  currentUserTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  currentUserStats: {
    flexDirection: 'row',
    gap: 12,
  },
  currentUserStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  currentUserStatValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  rankingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
    gap: 10,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  topRankBadge: {
    borderColor: colors.primary,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  currentUserName: {
    color: colors.primary,
  },
  youBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  youBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.background,
  },
  classificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  classificationBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  classificationText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.background,
  },
  divisionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  drillStatText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  statsColumn: {
    alignItems: 'flex-end',
    gap: 2,
  },
  statItem: {
    alignItems: 'flex-end',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 10,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
