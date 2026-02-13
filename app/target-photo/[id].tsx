
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, Image, ActivityIndicator, Modal, ScrollView, GestureResponderEvent } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/styles/commonStyles';
import { getDrillById } from '@/data/drills';
import { IconSymbol } from '@/components/IconSymbol';
import { TargetAnalyzer, PhotoQualityIssue } from '@/services/targetAnalyzer';

interface ManualShotPlacement {
  x: number;
  y: number;
  shotNumber: number;
}

export default function TargetPhotoScreen() {
  const router = useRouter();
  const { id, time, shots, splits, flinches } = useLocalSearchParams<{
    id: string;
    time: string;
    shots: string;
    splits: string;
    flinches?: string;
  }>();
  
  const drill = getDrillById(id);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [targetType, setTargetType] = useState<'USPSA' | 'IDPA'>('USPSA');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [validationType, setValidationType] = useState<'quality' | 'unrecognizable' | 'not-approved' | null>(null);
  const [qualityIssues, setQualityIssues] = useState<PhotoQualityIssue[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [showManualPlacement, setShowManualPlacement] = useState(false);
  const [manualPlacements, setManualPlacements] = useState<ManualShotPlacement[]>([]);
  const [imageLayout, setImageLayout] = useState<{ width: number; height: number } | null>(null);
  const cameraRef = useRef<any>(null);

  const expectedShots = parseInt(shots || '0', 10);

  const handleTakePhoto = async () => {
    try {
      if (!cameraRef.current) {
        console.error('Camera ref not available');
        return;
      }

      console.log('Taking photo...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      console.log('Photo captured:', photo.uri);
      setCapturedImage(photo.uri);
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Image selected from gallery:', result.assets[0].uri);
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setShowValidationModal(false);
    setValidationMessage('');
    setValidationType(null);
    setQualityIssues([]);
    setRecommendations([]);
    setShowManualPlacement(false);
    setManualPlacements([]);
    setImageLayout(null);
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'blur':
        return { ios: 'eye.slash.fill', android: 'blur_on' };
      case 'lighting':
        return { ios: 'lightbulb.fill', android: 'lightbulb' };
      case 'visibility':
        return { ios: 'viewfinder', android: 'visibility_off' };
      case 'angle':
        return { ios: 'rotate.3d', android: 'rotate_90_degrees_ccw' };
      case 'distance':
        return { ios: 'arrow.up.left.and.arrow.down.right', android: 'zoom_out_map' };
      case 'resolution':
        return { ios: 'photo.fill', android: 'high_quality' };
      default:
        return { ios: 'exclamationmark.triangle.fill', android: 'warning' };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#3B82F6';
      default:
        return colors.textSecondary;
    }
  };

  const handleAnalyze = async () => {
    if (!capturedImage) {
      Alert.alert('Error', 'Please capture a target photo first');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      const targetAnalyzer = TargetAnalyzer.getInstance();
      const expectedHits = parseInt(shots || '0', 10);
      
      const analysis = await targetAnalyzer.analyzeTarget(
        capturedImage,
        targetType,
        expectedHits
      );

      console.log('Analysis complete:', analysis);
      
      if (analysis.photoQuality && !analysis.photoQuality.isGoodQuality) {
        setValidationType('quality');
        setQualityIssues(analysis.photoQuality.issues);
        setRecommendations(analysis.photoQuality.recommendations);
        
        const primaryIssue = analysis.photoQuality.issues.find(i => i.severity === 'high') 
          || analysis.photoQuality.issues[0];
        
        setValidationMessage(
          primaryIssue?.message || 'The photo quality is not sufficient for accurate analysis.'
        );
        setShowValidationModal(true);
        setIsAnalyzing(false);
        return;
      }
      
      if (!analysis.isRecognizable) {
        setValidationType('unrecognizable');
        setValidationMessage(
          analysis.targetValidationMessage || 
          'The target photo is unrecognizable. Please retake the photo with better lighting and ensure the target is clearly visible and in focus.'
        );
        setShowValidationModal(true);
        setIsAnalyzing(false);
        return;
      }
      
      if (!analysis.isApprovedTarget) {
        setValidationType('not-approved');
        setValidationMessage(
          analysis.targetValidationMessage || 
          `This does not appear to be an approved ${targetType} target. For accurate scoring, we recommend using an official ${targetType} target. You can purchase approved targets from major shooting sports retailers or online.`
        );
        setShowValidationModal(true);
        setIsAnalyzing(false);
        return;
      }
      
      router.push({
        pathname: '/results/[id]',
        params: {
          id: drill?.id || '',
          time,
          shots,
          splits,
          flinches,
          targetAnalysis: JSON.stringify(analysis),
        }
      });
    } catch (error) {
      console.error('Error analyzing target:', error);
      Alert.alert(
        'Analysis Failed',
        'Could not automatically detect shot placements. Would you like to manually mark them?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Mark Manually', 
            onPress: () => {
              setShowValidationModal(false);
              setShowManualPlacement(true);
            }
          }
        ]
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualShotPlacement = (event: GestureResponderEvent) => {
    if (!imageLayout) return;

    const { locationX, locationY } = event.nativeEvent;
    const shotNumber = manualPlacements.length + 1;

    if (shotNumber <= expectedShots) {
      const newPlacement: ManualShotPlacement = {
        x: locationX,
        y: locationY,
        shotNumber,
      };
      
      setManualPlacements(prev => [...prev, newPlacement]);
      console.log(`Manual shot ${shotNumber} placed at (${locationX.toFixed(0)}, ${locationY.toFixed(0)})`);
    }
  };

  const handleConfirmManualPlacements = () => {
    if (manualPlacements.length < expectedShots) {
      Alert.alert(
        'Incomplete',
        `Please mark all ${expectedShots} shot placements. Currently marked: ${manualPlacements.length}`,
        [{ text: 'OK' }]
      );
      return;
    }

    console.log('Manual placements confirmed:', manualPlacements);
    
    router.push({
      pathname: '/results/[id]',
      params: {
        id: drill?.id || '',
        time,
        shots,
        splits,
        flinches,
        manualPlacements: JSON.stringify(manualPlacements),
      }
    });
  };

  const handleCancelManualPlacement = () => {
    setShowManualPlacement(false);
    setManualPlacements([]);
    setImageLayout(null);
  };

  const handleContinueWithoutValidTarget = () => {
    setShowValidationModal(false);
    
    Alert.alert(
      'Continue Without Valid Target?',
      'Your score will be based on timing only, without accuracy verification. This may affect your ranking.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'default',
          onPress: () => {
            router.push({
              pathname: '/results/[id]',
              params: {
                id: drill?.id || '',
                time,
                shots,
                splits,
                flinches,
              }
            });
          }
        }
      ]
    );
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Target Analysis?',
      'Without a target photo, we cannot verify accuracy. Your score will be based on timing only.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: () => {
            router.push({
              pathname: '/results/[id]',
              params: {
                id: drill?.id || '',
                time,
                shots,
                splits,
                flinches,
              }
            });
          }
        }
      ]
    );
  };

  if (!cameraPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading camera...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <IconSymbol
            ios_icon_name="camera.fill"
            android_material_icon_name="camera"
            size={64}
            color={colors.primary}
          />
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            To verify your target accuracy, we need access to your camera to photograph your target.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestCameraPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip Accuracy Check</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const placementsRemaining = expectedShots - manualPlacements.length;

  return (
    <View style={styles.container}>
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
        <Text style={styles.headerTitle}>Target Verification</Text>
        <TouchableOpacity
          style={styles.skipHeaderButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipHeaderText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {!showManualPlacement && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Photograph Your Target</Text>
          <Text style={styles.instructionsText}>
            Take a clear photo of your target for AI-powered accuracy verification. Ensure the entire target is visible and well-lit.
          </Text>
          
          <View style={styles.targetTypeContainer}>
            <Text style={styles.targetTypeLabel}>Target Type:</Text>
            <View style={styles.targetTypeButtons}>
              <TouchableOpacity
                style={[
                  styles.targetTypeButton,
                  targetType === 'USPSA' && styles.targetTypeButtonActive
                ]}
                onPress={() => setTargetType('USPSA')}
              >
                <Text style={[
                  styles.targetTypeButtonText,
                  targetType === 'USPSA' && styles.targetTypeButtonTextActive
                ]}>
                  USPSA
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.targetTypeButton,
                  targetType === 'IDPA' && styles.targetTypeButtonActive
                ]}
                onPress={() => setTargetType('IDPA')}
              >
                <Text style={[
                  styles.targetTypeButtonText,
                  targetType === 'IDPA' && styles.targetTypeButtonTextActive
                ]}>
                  IDPA
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showManualPlacement && (
        <View style={styles.manualPlacementHeader}>
          <IconSymbol
            ios_icon_name="hand.tap.fill"
            android_material_icon_name="touch_app"
            size={24}
            color={colors.primary}
          />
          <View style={styles.manualPlacementHeaderText}>
            <Text style={styles.manualPlacementTitle}>Tap to Mark Shot Placements</Text>
            <Text style={styles.manualPlacementSubtitle}>
              {placementsRemaining} shot{placementsRemaining !== 1 ? 's' : ''} remaining
            </Text>
          </View>
        </View>
      )}

      <View style={styles.cameraContainer}>
        {capturedImage ? (
          <TouchableOpacity
            activeOpacity={showManualPlacement ? 0.9 : 1}
            onPress={showManualPlacement ? handleManualShotPlacement : undefined}
            disabled={!showManualPlacement}
          >
            <Image
              source={{ uri: capturedImage }}
              style={styles.preview}
              resizeMode="contain"
              onLayout={(event) => {
                const { width, height } = event.nativeEvent.layout;
                setImageLayout({ width, height });
              }}
            />
            {showManualPlacement && manualPlacements.map((placement, index) => (
              <View
                key={index}
                style={[
                  styles.shotMarker,
                  {
                    left: placement.x - 15,
                    top: placement.y - 15,
                  }
                ]}
              >
                <Text style={styles.shotMarkerText}>{placement.shotNumber}</Text>
              </View>
            ))}
          </TouchableOpacity>
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
          >
            <View style={styles.targetGuide}>
              <View style={[styles.targetGuideCorner, styles.topLeft]} />
              <View style={[styles.targetGuideCorner, styles.topRight]} />
              <View style={[styles.targetGuideCorner, styles.bottomLeft]} />
              <View style={[styles.targetGuideCorner, styles.bottomRight]} />
            </View>
          </CameraView>
        )}
      </View>

      <View style={styles.controls}>
        {showManualPlacement ? (
          <>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelManualPlacement}
              activeOpacity={0.8}
            >
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={20}
                color={colors.text}
              />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                manualPlacements.length < expectedShots && styles.confirmButtonDisabled
              ]}
              onPress={handleConfirmManualPlacements}
              disabled={manualPlacements.length < expectedShots}
              activeOpacity={0.8}
            >
              <IconSymbol
                ios_icon_name="checkmark.circle.fill"
                android_material_icon_name="check_circle"
                size={20}
                color={colors.background}
              />
              <Text style={styles.confirmButtonText}>Confirm ({manualPlacements.length}/{expectedShots})</Text>
            </TouchableOpacity>
          </>
        ) : capturedImage ? (
          <>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleRetake}
              activeOpacity={0.8}
            >
              <IconSymbol
                ios_icon_name="arrow.clockwise"
                android_material_icon_name="refresh"
                size={24}
                color={colors.text}
              />
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
              onPress={handleAnalyze}
              disabled={isAnalyzing}
              activeOpacity={0.8}
            >
              {isAnalyzing ? (
                <>
                  <ActivityIndicator color={colors.background} />
                  <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                </>
              ) : (
                <>
                  <IconSymbol
                    ios_icon_name="checkmark.circle.fill"
                    android_material_icon_name="check_circle"
                    size={24}
                    color={colors.background}
                  />
                  <Text style={styles.analyzeButtonText}>Analyze Target</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={handlePickFromGallery}
              activeOpacity={0.8}
            >
              <IconSymbol
                ios_icon_name="photo.fill"
                android_material_icon_name="photo_library"
                size={32}
                color={colors.text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <View style={{ width: 60 }} />
          </>
        )}
      </View>

      <Modal
        visible={showValidationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowValidationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <IconSymbol
                ios_icon_name={
                  validationType === 'quality' ? 'exclamationmark.triangle.fill' :
                  validationType === 'unrecognizable' ? 'exclamationmark.triangle.fill' : 
                  'info.circle.fill'
                }
                android_material_icon_name={
                  validationType === 'quality' ? 'warning' :
                  validationType === 'unrecognizable' ? 'warning' : 
                  'info'
                }
                size={48}
                color={
                  validationType === 'quality' ? '#EF4444' :
                  validationType === 'unrecognizable' ? '#F59E0B' : 
                  '#3B82F6'
                }
              />
              <Text style={styles.modalTitle}>
                {validationType === 'quality' ? 'Photo Quality Issue' :
                 validationType === 'unrecognizable' ? 'Photo Unrecognizable' : 
                 'Non-Approved Target'}
              </Text>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalMessage}>{validationMessage}</Text>
              
              {validationType === 'quality' && qualityIssues.length > 0 && (
                <View style={styles.issuesContainer}>
                  <Text style={styles.issuesTitle}>Detected Issues:</Text>
                  {qualityIssues.map((issue, index) => {
                    const icon = getIssueIcon(issue.type);
                    return (
                      <View key={index} style={styles.issueItem}>
                        <View style={styles.issueHeader}>
                          <IconSymbol
                            ios_icon_name={icon.ios}
                            android_material_icon_name={icon.android}
                            size={20}
                            color={getSeverityColor(issue.severity)}
                          />
                          <Text style={[styles.issueType, { color: getSeverityColor(issue.severity) }]}>
                            {issue.type.charAt(0).toUpperCase() + issue.type.slice(1)}
                          </Text>
                          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(issue.severity) }]}>
                            <Text style={styles.severityText}>{issue.severity}</Text>
                          </View>
                        </View>
                        <Text style={styles.issueMessage}>{issue.message}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
              
              {recommendations.length > 0 && (
                <View style={styles.recommendationBox}>
                  <View style={styles.recommendationHeader}>
                    <IconSymbol
                      ios_icon_name="lightbulb.fill"
                      android_material_icon_name="tips_and_updates"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.recommendationTitle}>How to Improve:</Text>
                  </View>
                  {recommendations.map((rec, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <Text style={styles.recommendationBullet}>•</Text>
                      <Text style={styles.recommendationText}>{rec}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {validationType === 'not-approved' && (
                <View style={styles.recommendationBox}>
                  <Text style={styles.recommendationTitle}>Recommended Targets:</Text>
                  <View style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>USPSA Classic Target (Official)</Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>USPSA Metric Target</Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>IDPA Target (Official)</Text>
                  </View>
                  <View style={styles.recommendationItem}>
                    <Text style={styles.recommendationBullet}>•</Text>
                    <Text style={styles.recommendationText}>Available at shooting sports retailers</Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleRetake}
                activeOpacity={0.8}
              >
                <IconSymbol
                  ios_icon_name="camera.fill"
                  android_material_icon_name="camera"
                  size={20}
                  color={colors.background}
                />
                <Text style={styles.modalButtonPrimaryText}>Retake Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={handleContinueWithoutValidTarget}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonSecondaryText}>Continue Anyway</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  skipHeaderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  instructionsContainer: {
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  targetTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  targetTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  targetTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  targetTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  targetTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  targetTypeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  targetTypeButtonTextActive: {
    color: colors.background,
  },
  manualPlacementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
    gap: 12,
  },
  manualPlacementHeaderText: {
    flex: 1,
  },
  manualPlacementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  manualPlacementSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  targetGuide: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    right: '10%',
    bottom: '10%',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  targetGuideCorner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.primary,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  preview: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.background,
  },
  shotMarker: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shotMarkerText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.background,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.secondary,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.card,
    borderWidth: 4,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
  },
  galleryButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  retakeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.secondary,
    gap: 8,
    marginRight: 8,
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  analyzeButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    gap: 8,
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.background,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.secondary,
    gap: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    gap: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.background,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
  skipButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  issuesContainer: {
    marginBottom: 16,
  },
  issuesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  issueItem: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  issueType: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  issueMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  recommendationBox: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    paddingLeft: 4,
  },
  recommendationBullet: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 8,
    lineHeight: 22,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  modalActions: {
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.secondary,
  },
  modalButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
  modalButtonSecondary: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});
