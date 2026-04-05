
import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../styles/commonStyles';
import { IconSymbol } from '../components/IconSymbol';

export default function HelpGuide() {
  const router = useRouter();

  const handleWebsitePress = async () => {
    try {
      console.log('Help guide: website link pressed');
      await Linking.openURL('https://tmsofast.com');
    } catch (error) {
      console.error('Help guide: error opening website:', error);
    }
  };

  const handleSupportPress = async () => {
    try {
      console.log('Help guide: support link pressed');
      await Linking.openURL('https://tmsofast.com/support');
    } catch (error) {
      console.error('Help guide: error opening support URL:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol ios_icon_name="chevron.left" android_material_icon_name="arrow_back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help Guide</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Understanding Natively Interface</Text>
          <Text style={styles.text}>
            Natively has TWO sides:
          </Text>
          <Text style={styles.bulletPoint}>• LEFT SIDE: Code editor (where code is written)</Text>
          <Text style={styles.bulletPoint}>• RIGHT SIDE: Phone preview (shows your app)</Text>
          <Text style={styles.text}>
            {'\n'}When you click the phone icon (📱), the code appears on the left side.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Your App Status</Text>
          <Text style={styles.text}>
            Your SOFAST Global app is COMPLETE and working! All the shooting drills, camera detection, and features are implemented.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📤 App Store Requirements</Text>
          <Text style={styles.text}>
            Before submitting to the App Store, you need:
          </Text>
          <Text style={styles.bulletPoint}>
            ✅ Support URL: https://tmsofast.com/support
          </Text>
          <Text style={styles.bulletPoint}>
            ✅ Privacy Policy: https://tmsofast.com/privacy
          </Text>
          <Text style={styles.bulletPoint}>
            ⚠️ iPad Screenshot: 2048 x 2732 pixels (13-inch iPad Pro)
          </Text>
          <Text style={styles.bulletPoint}>
            ⚠️ iPhone Screenshot: 1320 x 2868 pixels (iPhone 16 Pro Max)
          </Text>
          <Text style={styles.text}>
            {'\n'}See the IPAD_SCREENSHOT_GUIDE.md and APP_STORE_REQUIREMENTS.md files in your project for detailed instructions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 How to Capture iPad Screenshot</Text>
          <Text style={styles.stepNumber}>Quick Method (Xcode Simulator):</Text>
          <Text style={styles.bulletPoint}>1. Open Xcode</Text>
          <Text style={styles.bulletPoint}>2. Window → Devices and Simulators</Text>
          <Text style={styles.bulletPoint}>3. Select &quot;iPad Pro (13-inch)&quot;</Text>
          <Text style={styles.bulletPoint}>4. Run your app (press Play)</Text>
          <Text style={styles.bulletPoint}>5. Press Cmd + S to save screenshot</Text>
          <Text style={styles.bulletPoint}>6. Screenshot saves to Desktop</Text>
          <Text style={styles.bulletPoint}>7. Verify it&apos;s 2048 x 2732 pixels</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📤 Next Steps: Getting to App Store</Text>
          <Text style={styles.stepNumber}>STEP 1: Create Required Web Pages</Text>
          <Text style={styles.text}>
            Apple requires two web pages before you can submit:
          </Text>
          <Text style={styles.bulletPoint}>• Privacy Policy page</Text>
          <Text style={styles.bulletPoint}>• Support page</Text>
          <Text style={styles.text}>
            {'\n'}Use Google Sites (sites.google.com):
          </Text>
          <Text style={styles.bulletPoint}>1. Go to sites.google.com</Text>
          <Text style={styles.bulletPoint}>2. Click &quot;+&quot; to create new site</Text>
          <Text style={styles.bulletPoint}>3. Create &quot;Privacy Policy&quot; page</Text>
          <Text style={styles.bulletPoint}>4. Create &quot;Support&quot; page</Text>
          <Text style={styles.bulletPoint}>5. Click &quot;Publish&quot; button (top right)</Text>
          <Text style={styles.bulletPoint}>6. Copy the URLs it gives you</Text>

          <Text style={styles.stepNumber}>{'\n'}STEP 2: Capture Screenshots</Text>
          <Text style={styles.text}>
            Use Xcode simulator to capture iPad (2048 x 2732) and iPhone (1320 x 2868) screenshots. See detailed guide in IPAD_SCREENSHOT_GUIDE.md.
          </Text>

          <Text style={styles.stepNumber}>{'\n'}STEP 3: Join Apple Developer Program</Text>
          <Text style={styles.text}>
            Go to developer.apple.com and pay $99/year to join. This is required to put apps on the App Store.
          </Text>

          <Text style={styles.stepNumber}>{'\n'}STEP 4: Build Your App</Text>
          <Text style={styles.text}>
            In Natively, there&apos;s a &quot;Build&quot; button to create the app file that gets submitted to Apple.
          </Text>

          <Text style={styles.stepNumber}>{'\n'}STEP 5: Submit to Apple</Text>
          <Text style={styles.text}>
            Apple reviews your app (usually 1-2 weeks) and then it appears in the App Store if approved.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 About Payments</Text>
          <Text style={styles.text}>
            Your app has a $4.99/month subscription built in. Once approved by Apple, users can pay and you&apos;ll receive the money (Apple takes 30% commission).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌐 Support & Website</Text>
          <TouchableOpacity onPress={handleWebsitePress} style={styles.websiteButton}>
            <IconSymbol 
              ios_icon_name="globe" 
              android_material_icon_name="language" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.websiteText}>tmsofast.com</Text>
            <IconSymbol 
              ios_icon_name="arrow.up.right" 
              android_material_icon_name="open_in_new" 
              size={20} 
              color={colors.primary} 
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSupportPress} style={styles.supportButton}>
            <IconSymbol 
              ios_icon_name="questionmark.circle.fill" 
              android_material_icon_name="help" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.supportText}>tmsofast.com/support</Text>
            <IconSymbol 
              ios_icon_name="arrow.up.right" 
              android_material_icon_name="open_in_new" 
              size={20} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ Need More Help?</Text>
          <Text style={styles.text}>
            - Check the &quot;Submission Guide&quot; button in your Profile
          </Text>
          <Text style={styles.text}>
            - Visit tmsofast.com/support for more information
          </Text>
          <Text style={styles.text}>
            - Email: info@tmsofast.com
          </Text>
          <Text style={styles.text}>
            - Review the APP_STORE_REQUIREMENTS.md file for a complete checklist
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ What&apos;s Already Done</Text>
          <Text style={styles.bulletPoint}>✓ All 10 shooting drills working</Text>
          <Text style={styles.bulletPoint}>✓ Camera shot detection</Text>
          <Text style={styles.bulletPoint}>✓ Audio analysis for gunshots</Text>
          <Text style={styles.bulletPoint}>✓ Timing and scoring</Text>
          <Text style={styles.bulletPoint}>✓ Global leaderboards</Text>
          <Text style={styles.bulletPoint}>✓ Subscription payments ($4.99/mo)</Text>
          <Text style={styles.bulletPoint}>✓ Dark mode</Text>
          <Text style={styles.bulletPoint}>✓ Professional camo-green design</Text>
          <Text style={styles.bulletPoint}>✓ Support URL configured</Text>
          <Text style={styles.bulletPoint}>✓ Privacy Policy URL configured</Text>
        </View>

        <View style={styles.finalNote}>
          <Text style={styles.finalNoteText}>
            🎉 Your app is ready! Just create the web pages, capture screenshots, and submit to Apple. You&apos;ve got this!
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 30,
    backgroundColor: colors.cardBackground,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 15,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginLeft: 10,
    marginBottom: 5,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  websiteText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 12,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  supportText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 12,
  },
  finalNote: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 12,
    marginTop: 10,
  },
  finalNoteText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    lineHeight: 26,
  },
});
