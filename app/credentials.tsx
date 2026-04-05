
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Stack } from 'expo-router';
import { colors } from '../styles/commonStyles';
import { IconSymbol } from '../components/IconSymbol';

export default function CredentialsScreen() {
  const [showPasswords, setShowPasswords] = useState(false);

  const credentials = {
    appStoreConnect: {
      apiKey: '53AK4RGW6G',
      appDeveloperTeamId: '8V52T9GNF9',
      developerId: 'dc4dfc57-c00f-4bbc-bf09-3b7fcc319e2'
    },
    expoGo: {
      team: 'Teamsofast',
      password: 'rocduf-vopxyH-sagsu3'
    },
    github: {
      username: 'jla749205-eng',
      token: 'fSx0RMhChzHU30-uTcGmZCWm4mlWwHmAlIiOXx8v'
    },
    robotToken: 'Z_Rish7p16d6GhI1uJ3_fA7L0r52b3xV6UCg48_a'
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      console.log('Copying to clipboard:', label);
      await Clipboard.setStringAsync(text);
      Alert.alert('Copied!', `${label} copied to clipboard`);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const copyAllCredentials = async () => {
    try {
      console.log('Copying all credentials to clipboard');
      const allCreds = `APP STORE CONNECT:
API Key: ${credentials.appStoreConnect.apiKey}
App Developer Team ID: ${credentials.appStoreConnect.appDeveloperTeamId}
Developer ID: ${credentials.appStoreConnect.developerId}

EXPO GO:
Team: ${credentials.expoGo.team}
Password: ${credentials.expoGo.password}

GITHUB:
Username: ${credentials.github.username}
Token: ${credentials.github.token}

ROBOT TOKEN:
${credentials.robotToken}`;

      await Clipboard.setStringAsync(allCreds);
      Alert.alert('Copied!', 'All credentials copied to clipboard');
    } catch (error) {
      console.error('Error copying all credentials:', error);
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'My Credentials',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <IconSymbol 
            ios_icon_name="key.fill" 
            android_material_icon_name="vpn_key"
            size={60}
            color={colors.primary}
          />
          <Text style={styles.title}>Your Credentials</Text>
          <Text style={styles.subtitle}>
            All your Apple Developer and Expo credentials in one place
          </Text>
        </View>

        {/* Important Notice */}
        <View style={styles.noticeCard}>
          <IconSymbol 
            ios_icon_name="exclamationmark.triangle.fill" 
            android_material_icon_name="warning"
            size={32}
            color="#FF9500"
          />
          <Text style={styles.noticeText}>
            Keep this information secure! Only share it when absolutely necessary.
          </Text>
        </View>

        {/* Copy All Button */}
        <TouchableOpacity 
          style={styles.copyAllButton}
          onPress={copyAllCredentials}
        >
          <IconSymbol 
            ios_icon_name="doc.on.doc.fill" 
            android_material_icon_name="content_copy"
            size={24}
            color="#fff"
          />
          <Text style={styles.copyAllButtonText}>Copy All Credentials</Text>
        </TouchableOpacity>

        {/* App Store Connect */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol 
              ios_icon_name="app.badge.fill" 
              android_material_icon_name="apps"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.sectionTitle}>App Store Connect</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.credentialCard}
            onPress={() => copyToClipboard(credentials.appStoreConnect.apiKey, 'API Key')}
          >
            <View style={styles.credentialContent}>
              <Text style={styles.credentialLabel}>API Key</Text>
              <Text style={styles.credentialValue}>{credentials.appStoreConnect.apiKey}</Text>
            </View>
            <IconSymbol 
              ios_icon_name="doc.on.doc" 
              android_material_icon_name="content_copy"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.credentialCard}
            onPress={() => copyToClipboard(credentials.appStoreConnect.appDeveloperTeamId, 'Team ID')}
          >
            <View style={styles.credentialContent}>
              <Text style={styles.credentialLabel}>App Developer Team ID</Text>
              <Text style={styles.credentialValue}>{credentials.appStoreConnect.appDeveloperTeamId}</Text>
            </View>
            <IconSymbol 
              ios_icon_name="doc.on.doc" 
              android_material_icon_name="content_copy"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.credentialCard}
            onPress={() => copyToClipboard(credentials.appStoreConnect.developerId, 'Developer ID')}
          >
            <View style={styles.credentialContent}>
              <Text style={styles.credentialLabel}>Developer ID</Text>
              <Text style={styles.credentialValue}>{credentials.appStoreConnect.developerId}</Text>
            </View>
            <IconSymbol 
              ios_icon_name="doc.on.doc" 
              android_material_icon_name="content_copy"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Expo Go */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol 
              ios_icon_name="app.fill" 
              android_material_icon_name="apps"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.sectionTitle}>Expo Go</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.credentialCard}
            onPress={() => copyToClipboard(credentials.expoGo.team, 'Team')}
          >
            <View style={styles.credentialContent}>
              <Text style={styles.credentialLabel}>Team</Text>
              <Text style={styles.credentialValue}>{credentials.expoGo.team}</Text>
            </View>
            <IconSymbol 
              ios_icon_name="doc.on.doc" 
              android_material_icon_name="content_copy"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.credentialCard}
            onPress={() => copyToClipboard(credentials.expoGo.password, 'Password')}
          >
            <View style={styles.credentialContent}>
              <Text style={styles.credentialLabel}>Password</Text>
              <View style={styles.passwordRow}>
                <Text style={styles.credentialValue}>
                  {showPasswords ? credentials.expoGo.password : '••••••••••••••'}
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowPasswords(!showPasswords)}
                  style={styles.eyeButton}
                >
                  <IconSymbol 
                    ios_icon_name={showPasswords ? "eye.slash.fill" : "eye.fill"}
                    android_material_icon_name={showPasswords ? "visibility_off" : "visibility"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <IconSymbol 
              ios_icon_name="doc.on.doc" 
              android_material_icon_name="content_copy"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* GitHub */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol 
              ios_icon_name="chevron.left.forwardslash.chevron.right" 
              android_material_icon_name="code"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.sectionTitle}>GitHub</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.credentialCard}
            onPress={() => copyToClipboard(credentials.github.username, 'Username')}
          >
            <View style={styles.credentialContent}>
              <Text style={styles.credentialLabel}>Username</Text>
              <Text style={styles.credentialValue}>{credentials.github.username}</Text>
            </View>
            <IconSymbol 
              ios_icon_name="doc.on.doc" 
              android_material_icon_name="content_copy"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.credentialCard}
            onPress={() => copyToClipboard(credentials.github.token, 'Token')}
          >
            <View style={styles.credentialContent}>
              <Text style={styles.credentialLabel}>Token</Text>
              <View style={styles.passwordRow}>
                <Text style={[styles.credentialValue, styles.tokenValue]}>
                  {showPasswords ? credentials.github.token : '••••••••••••••••••••••••••••••••'}
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowPasswords(!showPasswords)}
                  style={styles.eyeButton}
                >
                  <IconSymbol 
                    ios_icon_name={showPasswords ? "eye.slash.fill" : "eye.fill"}
                    android_material_icon_name={showPasswords ? "visibility_off" : "visibility"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <IconSymbol 
              ios_icon_name="doc.on.doc" 
              android_material_icon_name="content_copy"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Robot Token */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol 
              ios_icon_name="gearshape.fill" 
              android_material_icon_name="settings"
              size={24}
              color={colors.primary}
            />
            <Text style={styles.sectionTitle}>Robot Token</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.credentialCard}
            onPress={() => copyToClipboard(credentials.robotToken, 'Robot Token')}
          >
            <View style={styles.credentialContent}>
              <Text style={styles.credentialLabel}>Token</Text>
              <View style={styles.passwordRow}>
                <Text style={[styles.credentialValue, styles.tokenValue]}>
                  {showPasswords ? credentials.robotToken : '••••••••••••••••••••••••••••••••'}
                </Text>
                <TouchableOpacity 
                  onPress={() => setShowPasswords(!showPasswords)}
                  style={styles.eyeButton}
                >
                  <IconSymbol 
                    ios_icon_name={showPasswords ? "eye.slash.fill" : "eye.fill"}
                    android_material_icon_name={showPasswords ? "visibility_off" : "visibility"}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <IconSymbol 
              ios_icon_name="doc.on.doc" 
              android_material_icon_name="content_copy"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Show/Hide Toggle */}
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={() => setShowPasswords(!showPasswords)}
        >
          <IconSymbol 
            ios_icon_name={showPasswords ? "eye.slash.fill" : "eye.fill"}
            android_material_icon_name={showPasswords ? "visibility_off" : "visibility"}
            size={24}
            color={colors.primary}
          />
          <Text style={styles.toggleButtonText}>
            {showPasswords ? 'Hide' : 'Show'} Passwords & Tokens
          </Text>
        </TouchableOpacity>

        {/* Usage Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to Use These Credentials</Text>
          <Text style={styles.instructionsText}>
            These credentials are needed when:
          </Text>
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>- Building your app with EAS CLI</Text>
            <Text style={styles.instructionItem}>- Submitting to App Store Connect</Text>
            <Text style={styles.instructionItem}>- Configuring CI/CD pipelines</Text>
            <Text style={styles.instructionItem}>- Working with Expo services</Text>
          </View>
          <Text style={styles.instructionsNote}>
            💡 Tap any credential to copy it to your clipboard
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 24,
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: '#FF950020',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF9500',
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    fontWeight: '600',
  },
  copyAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    gap: 12,
    marginBottom: 32,
  },
  copyAllButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  credentialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  credentialContent: {
    flex: 1,
    marginRight: 12,
  },
  credentialLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  credentialValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  eyeButton: {
    padding: 4,
  },
  tokenValue: {
    flex: 1,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  instructionsCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  instructionsList: {
    marginBottom: 16,
  },
  instructionItem: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 28,
    paddingLeft: 8,
  },
  instructionsNote: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
