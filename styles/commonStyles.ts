
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  background: '#1E293B',      // Dark grayish-blue, reminiscent of tactical gear
  text: '#F0F9FF',            // Off-white, for high readability against the dark background
  secondaryText: '#CBD5E1',   // Light gray-blue, for less important information
  textSecondary: '#CBD5E1',   // Alias for secondaryText
  primary: '#A3E635',         // Lime green, representing precision and accuracy
  secondary: '#64748B',       // Medium gray-blue, for neutral elements
  accent: '#FACC15',          // Yellow, for highlights and important actions
  card: '#334155',            // Darker grayish-blue, for card backgrounds
  cardBackground: '#334155',  // Alias for card
  surface: '#334155',         // Alias for card/surface backgrounds
  highlight: '#84CC16',       // Bright green, for selected elements
  border: '#475569',          // Border color
  backgroundAlt: '#2D3748',   // Alternative background color
  grey: '#64748B',            // Grey color for borders
};

export const buttonStyles = StyleSheet.create({
  instructionsButton: {
    backgroundColor: colors.primary,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    backgroundColor: colors.backgroundAlt,
    alignSelf: 'center',
    width: '100%',
  },
});

export const commonStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 800,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: colors.text,
    marginBottom: 10
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 24,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.backgroundAlt,
    borderColor: colors.grey,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    width: '100%',
    boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  icon: {
    width: 60,
    height: 60,
    tintColor: "white",
  },
});
