
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, Image, Alert } from 'react-native';
import { colors } from '../../styles/commonStyles';
import { useRouter } from 'expo-router';
import { IconSymbol } from '../../components/IconSymbol';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

type ShootingDivision = 'SSP' | 'ESP' | 'CCP' | 'CDP' | 'REV' | 'BUG' | 'PCC';

export default function Profile() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [pistolClass, setPistolClass] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedDivisions, setSelectedDivisions] = useState<ShootingDivision[]>([]);
  
  // Mock stats - in a real app, these would come from actual drill results
  const [stats] = useState({
    drillsCompleted: 0,
    bestTime: 0,
    accuracy: 0,
    totalRounds: 0,
    ranking: 0,
  });

  const divisions: { id: ShootingDivision; name: string; description: string }[] = [
    { id: 'SSP', name: 'SSP', description: 'Stock Service Pistol' },
    { id: 'ESP', name: 'ESP', description: 'Enhanced Service Pistol' },
    { id: 'CCP', name: 'CCP', description: 'Carry Concealed Pistol' },
    { id: 'CDP', name: 'CDP', description: 'Custom Defensive Pistol' },
    { id: 'REV', name: 'REV', description: 'Revolver' },
    { id: 'BUG', name: 'BUG', description: 'Back-Up Gun' },
    { id: 'PCC', name: 'PCC', description: 'Pistol Caliber Carbine' },
  ];

  const pickImage = async () => {
    try {
      console.log('Pick profile image pressed');
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Profile image selected:', result.assets[0].uri);
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const toggleDivision = (divisionId: ShootingDivision) => {
    console.log('Division toggled:', divisionId);
    setSelectedDivisions(prev => {
      if (prev.includes(divisionId)) {
        return prev.filter(d => d !== divisionId);
      } else {
        return [...prev, divisionId];
      }
    });
  };

  const isProfileComplete = username && profileImage && selectedDivisions.length > 0;

  const menuItems = [
    {
      title: 'Submission Guide',
      description: 'View privacy policy and support information',
      icon: 'arrow.up.circle.fill',
      androidIcon: 'upload',
      route: '/submission-guide',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SOFAST Global</Text>
        <Text style={styles.headerSubtitle}>Professional Marksmanship Training</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Baseball Card Profile Summary */}
        <View style={styles.baseballCardContainer}>
          <LinearGradient
            colors={['#2D3748', '#1A202C']}
            style={styles.baseballCard}
          >
            {/* Card Header with Vintage Style */}
            <View style={styles.cardHeader}>
              <Text style={styles.cardTeamName}>SOFAST GLOBAL</Text>
              <Text style={styles.cardYear}>2025</Text>
            </View>

            {/* Profile Picture Section */}
            <TouchableOpacity 
              style={styles.imageContainer} 
              onPress={pickImage}
              activeOpacity={0.8}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <IconSymbol 
                    ios_icon_name="camera.fill" 
                    android_material_icon_name="add_a_photo" 
                    size={40} 
                    color={colors.primary} 
                  />
                  <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
                </View>
              )}
              <View style={styles.imageOverlay}>
                <IconSymbol 
                  ios_icon_name="pencil.circle.fill" 
                  android_material_icon_name="edit" 
                  size={24} 
                  color="#FFF" 
                />
              </View>
            </TouchableOpacity>

            {/* Player Name Section */}
            <View style={styles.nameSection}>
              {username ? (
                <Text style={styles.playerName}>{username.toUpperCase()}</Text>
              ) : (
                <Text style={styles.playerNamePlaceholder}>YOUR NAME HERE</Text>
              )}
              {pistolClass && (
                <Text style={styles.pistolClass}>{pistolClass}</Text>
              )}
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.drillsCompleted}</Text>
                <Text style={styles.statLabel}>DRILLS</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.bestTime > 0 ? stats.bestTime.toFixed(2) : '--'}</Text>
                <Text style={styles.statLabel}>BEST TIME</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.accuracy > 0 ? `${stats.accuracy}%` : '--'}</Text>
                <Text style={styles.statLabel}>ACCURACY</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{stats.totalRounds}</Text>
                <Text style={styles.statLabel}>ROUNDS</Text>
              </View>
            </View>

            {/* Ranking Section */}
            <View style={styles.rankingSection}>
              <Text style={styles.rankingLabel}>
                {username ? `${username}'s Ranking` : 'Your Ranking'}
              </Text>
              <Text style={styles.rankingValue}>
                {stats.ranking > 0 ? `#${stats.ranking}` : 'Unranked'}
              </Text>
              {stats.ranking === 0 && (
                <Text style={styles.rankingHint}>Complete a drill to get ranked!</Text>
              )}
            </View>

            {/* Divisions Section */}
            <View style={styles.divisionsSection}>
              <Text style={styles.divisionsTitle}>SHOOTING DIVISIONS</Text>
              <View style={styles.divisionBadges}>
                {selectedDivisions.length > 0 ? (
                  selectedDivisions.map((divId, index) => (
                    <View key={index} style={styles.divisionBadge}>
                      <Text style={styles.divisionBadgeText}>{divId}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDivisionsText}>No divisions selected</Text>
                )}
              </View>
            </View>

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <View style={styles.cardFooterLine} />
              <Text style={styles.cardFooterText}>OFFICIAL COMPETITOR CARD</Text>
              <View style={styles.cardFooterLine} />
            </View>
          </LinearGradient>

          {/* Completion Prompt */}
          {!isProfileComplete && (
            <View style={styles.promptCard}>
              <IconSymbol 
                ios_icon_name="info.circle.fill" 
                android_material_icon_name="info" 
                size={24} 
                color={colors.accent} 
              />
              <View style={styles.promptContent}>
                <Text style={styles.promptTitle}>Complete Your Profile Card</Text>
                <Text style={styles.promptText}>
                  {!username && '• Add your username\n'}
                  {!profileImage && '• Upload a profile photo\n'}
                  {selectedDivisions.length === 0 && '• Select your shooting division(s)'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Profile Input Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <Text style={styles.sectionSubtitle}>
            Fill out your profile to create your personalized baseball card
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              Username <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor={colors.secondaryText}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <Text style={styles.inputHint}>This will appear on your baseball card</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Pistol Class/Type (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Glock 19, 1911, Sig P320"
              placeholderTextColor={colors.secondaryText}
              value={pistolClass}
              onChangeText={setPistolClass}
              autoCapitalize="words"
            />
            <Text style={styles.inputHint}>Your preferred firearm</Text>
          </View>
        </View>

        {/* Shooting Divisions Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Shooting Divisions <Text style={styles.required}>*</Text>
          </Text>
          <Text style={styles.sectionSubtitle}>
            Select the division(s) you compete in (you can select multiple)
          </Text>
          
          <View style={styles.divisionsGrid}>
            {divisions.map((division, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.divisionCard,
                  selectedDivisions.includes(division.id) && styles.divisionCardSelected
                ]}
                onPress={() => toggleDivision(division.id)}
                activeOpacity={0.7}
              >
                <View style={styles.divisionCardHeader}>
                  <Text style={[
                    styles.divisionCardName,
                    selectedDivisions.includes(division.id) && styles.divisionCardNameSelected
                  ]}>
                    {division.name}
                  </Text>
                  {selectedDivisions.includes(division.id) && (
                    <IconSymbol 
                      ios_icon_name="checkmark.circle.fill" 
                      android_material_icon_name="check_circle" 
                      size={20} 
                      color={colors.primary} 
                    />
                  )}
                </View>
                <Text style={[
                  styles.divisionCardDescription,
                  selectedDivisions.includes(division.id) && styles.divisionCardDescriptionSelected
                ]}>
                  {division.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Access Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuItemIcon}>
                <IconSymbol 
                  ios_icon_name={item.icon} 
                  android_material_icon_name={item.androidIcon} 
                  size={28} 
                  color={colors.primary} 
                />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>
                  {item.title}
                </Text>
                <Text style={styles.menuItemDescription}>
                  {item.description}
                </Text>
              </View>
              <IconSymbol 
                ios_icon_name="chevron.right" 
                android_material_icon_name="chevron_right" 
                size={20} 
                color={colors.text} 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version:</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Team:</Text>
            <Text style={styles.infoValue}>Team SOFAST LLC</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>✅ Ready to Submit</Text>
          </View>
        </View>
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
    paddingTop: Platform.OS === 'android' ? 60 : 70,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 15,
    lineHeight: 20,
  },
  required: {
    color: colors.accent,
  },
  
  // Baseball Card Styles
  baseballCardContainer: {
    marginBottom: 30,
  },
  baseballCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 3,
    borderColor: colors.primary,
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.4)',
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  cardTeamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 1,
  },
  cardYear: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  profileImage: {
    width: 140,
    height: 180,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  imagePlaceholder: {
    width: 140,
    height: 180,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 8,
    textAlign: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 6,
  },
  nameSection: {
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  playerNamePlaceholder: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondaryText,
    letterSpacing: 1.5,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pistolClass: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: colors.secondaryText,
    letterSpacing: 0.5,
  },
  rankingSection: {
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
    borderRadius: 8,
    marginBottom: 15,
  },
  rankingLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rankingValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  rankingHint: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 4,
    fontStyle: 'italic',
  },
  divisionsSection: {
    marginBottom: 15,
  },
  divisionsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.secondaryText,
    marginBottom: 8,
    letterSpacing: 1,
  },
  divisionBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  divisionBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  divisionBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  noDivisionsText: {
    fontSize: 12,
    color: colors.secondaryText,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  cardFooterLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  cardFooterText: {
    fontSize: 10,
    color: colors.secondaryText,
    marginHorizontal: 10,
    letterSpacing: 1,
  },
  
  // Prompt Card
  promptCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    alignItems: 'flex-start',
  },
  promptContent: {
    flex: 1,
    marginLeft: 12,
  },
  promptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 6,
  },
  promptText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  
  // Input Styles
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: colors.text,
  },
  inputHint: {
    fontSize: 12,
    color: colors.secondaryText,
    marginTop: 6,
    fontStyle: 'italic',
  },
  
  // Divisions Grid
  divisionsGrid: {
    gap: 12,
  },
  divisionCard: {
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 15,
  },
  divisionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(163, 230, 53, 0.1)',
  },
  divisionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  divisionCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  divisionCardNameSelected: {
    color: colors.primary,
  },
  divisionCardDescription: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  divisionCardDescriptionSelected: {
    color: colors.text,
  },
  
  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItemIcon: {
    marginRight: 15,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 13,
    color: colors.secondaryText,
  },
  
  // Info Rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.secondaryText,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
