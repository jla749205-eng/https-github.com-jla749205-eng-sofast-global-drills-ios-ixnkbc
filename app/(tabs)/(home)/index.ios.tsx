
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { DRILLS } from '@/data/drills';
import { IconSymbol } from '@/components/IconSymbol';
import { SubscriptionService } from '@/services/subscriptionService';

export default function HomeScreen() {
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    initializeSubscription();
  }, []);

  const initializeSubscription = async () => {
    try {
      const subscriptionService = SubscriptionService.getInstance();
      await subscriptionService.initialize();
      const status = await subscriptionService.checkSubscriptionStatus();
      setIsPremium(status.isPremium);
    } catch (error) {
      console.error('Error initializing subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async () => {
    console.log('Upgrade button pressed');
    Alert.alert(
      'Upgrade to Premium',
      'Unlock all 10 drills, advanced AI analysis, and veteran badge for $4.99/month',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: async () => {
            try {
              console.log('Subscribe button pressed');
              const subscriptionService = SubscriptionService.getInstance();
              const success = await subscriptionService.purchaseSubscription();
              if (success) {
                setIsPremium(true);
                Alert.alert('Success', 'Welcome to SOFAST Premium!');
              }
            } catch (error) {
              console.error('Error purchasing subscription:', error);
              Alert.alert('Error', 'Failed to process subscription');
            }
          }
        }
      ]
    );
  };

  const handleWebsitePress = async () => {
    try {
      console.log('Website link pressed');
      const url = 'https://tmsofast.com';
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open website');
      }
    } catch (error) {
      console.error('Error opening website:', error);
      Alert.alert('Error', 'Failed to open website');
    }
  };

  const freeDrills = DRILLS.filter(d => !d.isPremium);
  const premiumDrills = DRILLS.filter(d => d.isPremium);

  const handleDrillPress = (drillId: string, isPremiumDrill: boolean) => {
    console.log('Drill pressed:', drillId, 'isPremium:', isPremiumDrill);
    if (isPremiumDrill && !isPremium) {
      handleUpgrade();
      return;
    }
    router.push(`/drill/${drillId}`);
  };

  const renderDrill = (drill: typeof DRILLS[0]) => {
    const isLocked = drill.isPremium && !isPremium;

    return (
      <TouchableOpacity
        key={drill.id}
        style={[styles.drillCard, isLocked && styles.lockedCard]}
        onPress={() => handleDrillPress(drill.id, drill.isPremium)}
        activeOpacity={0.7}
      >
        <View style={styles.drillHeader}>
          <View style={styles.drillTitleContainer}>
            <Text style={styles.drillName}>{drill.name}</Text>
            {drill.isPremium && (
              <View style={styles.premiumBadge}>
                <IconSymbol
                  ios_icon_name="star.fill"
                  android_material_icon_name="star"
                  size={12}
                  color={colors.accent}
                />
                <Text style={styles.premiumText}>PRO</Text>
              </View>
            )}
          </View>
          {isLocked && (
            <IconSymbol
              ios_icon_name="lock.fill"
              android_material_icon_name="lock"
              size={24}
              color={colors.textSecondary}
            />
          )}
        </View>

        <Text style={styles.drillDescription}>{drill.description}</Text>

        <View style={styles.drillStats}>
          <View style={styles.statItem}>
            <IconSymbol
              ios_icon_name="target"
              android_material_icon_name="gps_fixed"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.statText}>{drill.rounds} rounds</Text>
          </View>

          {drill.distance && (
            <View style={styles.statItem}>
              <IconSymbol
                ios_icon_name="ruler"
                android_material_icon_name="straighten"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.statText}>{drill.distance}</Text>
            </View>
          )}

          {drill.parTime && (
            <View style={styles.statItem}>
              <IconSymbol
                ios_icon_name="timer"
                android_material_icon_name="timer"
                size={16}
                color={colors.primary}
              />
              <Text style={styles.statText}>{drill.parTime}s par</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/7cadd481-5bea-470d-802a-1f44d5a96178.jpeg')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logo}>Team SOFAST</Text>
          <TouchableOpacity onPress={handleWebsitePress} activeOpacity={0.7}>
            <Text style={styles.websiteLink}>tmsofast.com</Text>
          </TouchableOpacity>
          <Text style={styles.subtitle}>Marksmanship Competition Platform</Text>
          {isPremium && (
            <View style={styles.premiumBadgeLarge}>
              <IconSymbol
                ios_icon_name="star.fill"
                android_material_icon_name="star"
                size={16}
                color={colors.accent}
              />
              <Text style={styles.premiumBadgeText}>PREMIUM MEMBER</Text>
            </View>
          )}
        </View>

        {/* Features Banner */}
        <View style={styles.featuresBanner}>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="waveform"
              android_material_icon_name="graphic_eq"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.featureText}>AI Shot Detection</Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="timer"
              android_material_icon_name="timer"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.featureText}>Auto Split Timing</Text>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol
              ios_icon_name="trophy.fill"
              android_material_icon_name="emoji_events"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.featureText}>Global Leaderboards</Text>
          </View>
        </View>

        {/* Rankings Button */}
        <TouchableOpacity
          style={styles.rankingsButton}
          onPress={() => {
            console.log('View Global Rankings pressed');
            router.push('/rankings/');
          }}
          activeOpacity={0.8}
        >
          <View style={styles.rankingsButtonContent}>
            <IconSymbol
              ios_icon_name="chart.bar.fill"
              android_material_icon_name="leaderboard"
              size={32}
              color={colors.primary}
            />
            <View style={styles.rankingsButtonText}>
              <Text style={styles.rankingsButtonTitle}>View Global Rankings</Text>
              <Text style={styles.rankingsButtonSubtitle}>
                Compare your classification with shooters worldwide
              </Text>
            </View>
            <IconSymbol
              ios_icon_name="chevron.right"
              android_material_icon_name="chevron_right"
              size={24}
              color={colors.textSecondary}
            />
          </View>
        </TouchableOpacity>

        {/* Free Drills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FREE DRILLS</Text>
          {freeDrills.map(renderDrill)}
        </View>

        {/* Premium Drills Section */}
        <View style={styles.section}>
          <View style={styles.premiumHeader}>
            <Text style={styles.sectionTitle}>PREMIUM DRILLS</Text>
            {!isPremium && (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgrade}
              >
                <Text style={styles.upgradeButtonText}>Upgrade $4.99/mo</Text>
              </TouchableOpacity>
            )}
          </View>
          {premiumDrills.map(renderDrill)}
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'android' ? 48 : 60,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 16,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 2,
    textAlign: 'center',
    textShadowColor: colors.highlight,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  websiteLink: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 8,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 2,
    marginTop: 8,
    textAlign: 'center',
  },
  premiumBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 1,
  },
  featuresBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  featureItem: {
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  rankingsButton: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  rankingsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankingsButtonText: {
    flex: 1,
  },
  rankingsButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  rankingsButtonSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    lineHeight: 16,
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
  premiumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  upgradeButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.background,
  },
  drillCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  lockedCard: {
    opacity: 0.6,
  },
  drillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  drillTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  drillName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
  },
  drillDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  drillStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
