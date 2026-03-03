import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { GlassCard } from '../components/GlassCard';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import api from '../services/api';

const { width } = Dimensions.get('window');

interface WizardStep {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

const WIZARD_STEPS: WizardStep[] = [
  { id: 'basics', title: 'Project Basics', subtitle: 'Name and description', icon: 'edit' },
  { id: 'location', title: 'Location', subtitle: 'Where is the job site?', icon: 'location-on' },
  { id: 'timeline', title: 'Timeline', subtitle: 'Start and end dates', icon: 'calendar-today' },
  { id: 'budget', title: 'Budget', subtitle: 'AI-assisted estimation', icon: 'attach-money' },
  { id: 'team', title: 'Team', subtitle: 'Assign team members', icon: 'people' },
  { id: 'review', title: 'Review', subtitle: 'Confirm and create', icon: 'check-circle' },
];

const PROJECT_TYPES = [
  { id: 'residential', label: 'Residential', icon: 'home', avgCostPerSqFt: 150 },
  { id: 'commercial', label: 'Commercial', icon: 'business', avgCostPerSqFt: 200 },
  { id: 'industrial', label: 'Industrial', icon: 'factory', avgCostPerSqFt: 120 },
  { id: 'renovation', label: 'Renovation', icon: 'construction', avgCostPerSqFt: 100 },
  { id: 'infrastructure', label: 'Infrastructure', icon: 'architecture', avgCostPerSqFt: 250 },
];

export default function ProjectWizardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiEstimating, setAiEstimating] = useState(false);
  
  // Form data
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    type: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: 0,
    longitude: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    squareFootage: '',
    budget: '',
    estimatedBudget: 0,
    teamMembers: [] as string[],
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / WIZARD_STEPS.length,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Validate current step
      if (!validateStep(currentStep)) return;
      
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start();
      
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const validateStep = (step: number): boolean => {
    switch (WIZARD_STEPS[step].id) {
      case 'basics':
        if (!projectData.name.trim()) {
          Alert.alert('Required', 'Please enter a project name');
          return false;
        }
        if (!projectData.type) {
          Alert.alert('Required', 'Please select a project type');
          return false;
        }
        return true;
      case 'location':
        if (!projectData.city.trim() || !projectData.state.trim()) {
          Alert.alert('Required', 'Please enter at least city and state');
          return false;
        }
        return true;
      case 'timeline':
        if (projectData.endDate <= projectData.startDate) {
          Alert.alert('Invalid Dates', 'End date must be after start date');
          return false;
        }
        return true;
      case 'budget':
        if (!projectData.budget && !projectData.estimatedBudget) {
          Alert.alert('Required', 'Please enter a budget or use AI estimation');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const getAIBudgetEstimate = async () => {
    if (!projectData.type || !projectData.squareFootage) {
      Alert.alert('Missing Info', 'Please select project type and enter square footage for AI estimation');
      return;
    }

    setAiEstimating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Call AI service for budget estimation
      const response = await api.getAIBudgetEstimate({
        projectType: projectData.type,
        squareFootage: parseInt(projectData.squareFootage),
        location: {
          city: projectData.city,
          state: projectData.state,
        },
        timeline: {
          startDate: projectData.startDate.toISOString(),
          endDate: projectData.endDate.toISOString(),
        },
      });

      if (response.estimatedBudget) {
        setProjectData(prev => ({
          ...prev,
          estimatedBudget: response.estimatedBudget,
          budget: response.estimatedBudget.toString(),
        }));
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'AI Estimate Ready',
          `Based on your ${projectData.type} project of ${projectData.squareFootage} sq ft in ${projectData.city}, ${projectData.state}, we estimate:\n\n$${response.estimatedBudget.toLocaleString()}\n\n${response.breakdown || 'This includes labor, materials, and contingency.'}`,
          [{ text: 'Use This Estimate', style: 'default' }]
        );
      }
    } catch (error) {
      // Fallback to simple calculation if AI fails
      const projectType = PROJECT_TYPES.find(t => t.id === projectData.type);
      const sqFt = parseInt(projectData.squareFootage) || 0;
      const baseEstimate = sqFt * (projectType?.avgCostPerSqFt || 150);
      const withContingency = Math.round(baseEstimate * 1.15); // 15% contingency
      
      setProjectData(prev => ({
        ...prev,
        estimatedBudget: withContingency,
        budget: withContingency.toString(),
      }));
      
      Alert.alert(
        'Estimate Calculated',
        `Based on industry averages for ${projectData.type} projects:\n\n$${withContingency.toLocaleString()}\n\n(${sqFt.toLocaleString()} sq ft × $${projectType?.avgCostPerSqFt}/sq ft + 15% contingency)`
      );
    } finally {
      setAiEstimating(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for this feature');
        return;
      }

      setLoading(true);
      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setProjectData(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address.street || '',
        city: address.city || '',
        state: address.region || '',
        zipCode: address.postalCode || '',
      }));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Could not get current location');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const newProject = await api.createProject({
        name: projectData.name,
        description: projectData.description,
        project_type: projectData.type,
        location: {
          address: projectData.address,
          city: projectData.city,
          state: projectData.state,
          zip_code: projectData.zipCode,
          coordinates: {
            latitude: projectData.latitude,
            longitude: projectData.longitude,
          },
        },
        start_date: projectData.startDate.toISOString(),
        end_date: projectData.endDate.toISOString(),
        budget: parseFloat(projectData.budget) || projectData.estimatedBudget,
        square_footage: parseInt(projectData.squareFootage) || 0,
        status: 'planning',
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Project Created!',
        `${projectData.name} has been created successfully.`,
        [
          {
            text: 'Go to Project',
            onPress: () => router.replace('/(tabs)/projects'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    const step = WIZARD_STEPS[currentStep];

    switch (step.id) {
      case 'basics':
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Project Name *</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="e.g., Downtown Office Building"
              placeholderTextColor={colors.textSecondary}
              value={projectData.name}
              onChangeText={(text) => setProjectData(prev => ({ ...prev, name: text }))}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
              placeholder="Brief description of the project..."
              placeholderTextColor={colors.textSecondary}
              value={projectData.description}
              onChangeText={(text) => setProjectData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.inputLabel, { color: colors.text }]}>Project Type *</Text>
            <View style={styles.typeGrid}>
              {PROJECT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeCard,
                    { borderColor: projectData.type === type.id ? Colors.primary : colors.border },
                    projectData.type === type.id && styles.typeCardSelected,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setProjectData(prev => ({ ...prev, type: type.id }));
                  }}
                >
                  <MaterialIcons
                    name={type.icon as any}
                    size={28}
                    color={projectData.type === type.id ? Colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      { color: projectData.type === type.id ? Colors.primary : colors.text },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'location':
        return (
          <View style={styles.stepContent}>
            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={loading}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.locationButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <MaterialIcons name="my-location" size={24} color="#FFF" />
                    <Text style={styles.locationButtonText}>Use Current Location</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or enter manually</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Street Address</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="123 Main Street"
              placeholderTextColor={colors.textSecondary}
              value={projectData.address}
              onChangeText={(text) => setProjectData(prev => ({ ...prev, address: text }))}
            />

            <View style={styles.row}>
              <View style={styles.flex2}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>City *</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Houston"
                  placeholderTextColor={colors.textSecondary}
                  value={projectData.city}
                  onChangeText={(text) => setProjectData(prev => ({ ...prev, city: text }))}
                />
              </View>
              <View style={styles.flex1}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>State *</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="TX"
                  placeholderTextColor={colors.textSecondary}
                  value={projectData.state}
                  onChangeText={(text) => setProjectData(prev => ({ ...prev, state: text }))}
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>ZIP Code</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="77001"
              placeholderTextColor={colors.textSecondary}
              value={projectData.zipCode}
              onChangeText={(text) => setProjectData(prev => ({ ...prev, zipCode: text }))}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>
        );

      case 'timeline':
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Start Date</Text>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: colors.border }]}
              onPress={() => setShowStartDatePicker(true)}
            >
              <MaterialIcons name="calendar-today" size={20} color={Colors.primary} />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {projectData.startDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.inputLabel, { color: colors.text }]}>End Date</Text>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: colors.border }]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <MaterialIcons name="event" size={20} color={Colors.primary} />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {projectData.endDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </TouchableOpacity>

            {/* Duration info */}
            <GlassCard style={styles.durationCard}>
              <View style={styles.durationInfo}>
                <MaterialIcons name="timelapse" size={32} color={Colors.primary} />
                <View style={styles.durationText}>
                  <Text style={[styles.durationValue, { color: colors.text }]}>
                    {Math.ceil((projectData.endDate.getTime() - projectData.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </Text>
                  <Text style={[styles.durationLabel, { color: colors.textSecondary }]}>
                    Project Duration
                  </Text>
                </View>
              </View>
            </GlassCard>

            {showStartDatePicker && (
              <DateTimePicker
                value={projectData.startDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowStartDatePicker(false);
                  if (date) setProjectData(prev => ({ ...prev, startDate: date }));
                }}
              />
            )}

            {showEndDatePicker && (
              <DateTimePicker
                value={projectData.endDate}
                mode="date"
                display="default"
                minimumDate={projectData.startDate}
                onChange={(event, date) => {
                  setShowEndDatePicker(false);
                  if (date) setProjectData(prev => ({ ...prev, endDate: date }));
                }}
              />
            )}
          </View>
        );

      case 'budget':
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Square Footage</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="e.g., 5000"
              placeholderTextColor={colors.textSecondary}
              value={projectData.squareFootage}
              onChangeText={(text) => setProjectData(prev => ({ ...prev, squareFootage: text.replace(/[^0-9]/g, '') }))}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={styles.aiButton}
              onPress={getAIBudgetEstimate}
              disabled={aiEstimating}
            >
              <LinearGradient
                colors={[Colors.secondary, Colors.secondaryLight]}
                style={styles.aiButtonGradient}
              >
                {aiEstimating ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <MaterialIcons name="psychology" size={24} color="#FFF" />
                    <Text style={styles.aiButtonText}>Get AI Budget Estimate</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {projectData.estimatedBudget > 0 && (
              <GlassCard style={styles.estimateCard}>
                <View style={styles.estimateHeader}>
                  <MaterialIcons name="auto-awesome" size={24} color={Colors.primary} />
                  <Text style={[styles.estimateLabel, { color: colors.textSecondary }]}>AI Estimated Budget</Text>
                </View>
                <Text style={[styles.estimateValue, { color: Colors.success }]}>
                  ${projectData.estimatedBudget.toLocaleString()}
                </Text>
              </GlassCard>
            )}

            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or set manually</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </View>

            <Text style={[styles.inputLabel, { color: colors.text }]}>Budget Amount</Text>
            <View style={styles.budgetInputContainer}>
              <Text style={[styles.currencySymbol, { color: Colors.primary }]}>$</Text>
              <TextInput
                style={[styles.budgetInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="500,000"
                placeholderTextColor={colors.textSecondary}
                value={projectData.budget}
                onChangeText={(text) => setProjectData(prev => ({ ...prev, budget: text.replace(/[^0-9]/g, '') }))}
                keyboardType="numeric"
              />
            </View>
          </View>
        );

      case 'team':
        return (
          <View style={styles.stepContent}>
            <GlassCard style={styles.teamCard}>
              <MaterialIcons name="people" size={48} color={Colors.primary} />
              <Text style={[styles.teamTitle, { color: colors.text }]}>Team Assignment</Text>
              <Text style={[styles.teamSubtitle, { color: colors.textSecondary }]}>
                You can add team members after creating the project from the project details page.
              </Text>
            </GlassCard>

            <View style={styles.ownerCard}>
              <View style={styles.ownerInfo}>
                <View style={styles.ownerAvatar}>
                  <MaterialIcons name="person" size={24} color="#FFF" />
                </View>
                <View>
                  <Text style={[styles.ownerName, { color: colors.text }]}>{user?.full_name || 'You'}</Text>
                  <Text style={[styles.ownerRole, { color: Colors.primary }]}>Project Owner</Text>
                </View>
              </View>
              <MaterialIcons name="check-circle" size={24} color={Colors.success} />
            </View>
          </View>
        );

      case 'review':
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.reviewTitle, { color: colors.text }]}>Review Your Project</Text>

            <GlassCard style={styles.reviewCard}>
              <View style={styles.reviewItem}>
                <MaterialIcons name="edit" size={20} color={Colors.primary} />
                <View style={styles.reviewItemContent}>
                  <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Project Name</Text>
                  <Text style={[styles.reviewValue, { color: colors.text }]}>{projectData.name}</Text>
                </View>
              </View>

              <View style={styles.reviewItem}>
                <MaterialIcons name="category" size={20} color={Colors.primary} />
                <View style={styles.reviewItemContent}>
                  <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Type</Text>
                  <Text style={[styles.reviewValue, { color: colors.text }]}>
                    {PROJECT_TYPES.find(t => t.id === projectData.type)?.label || 'Not set'}
                  </Text>
                </View>
              </View>

              <View style={styles.reviewItem}>
                <MaterialIcons name="location-on" size={20} color={Colors.primary} />
                <View style={styles.reviewItemContent}>
                  <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Location</Text>
                  <Text style={[styles.reviewValue, { color: colors.text }]}>
                    {projectData.city}, {projectData.state}
                  </Text>
                </View>
              </View>

              <View style={styles.reviewItem}>
                <MaterialIcons name="calendar-today" size={20} color={Colors.primary} />
                <View style={styles.reviewItemContent}>
                  <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Timeline</Text>
                  <Text style={[styles.reviewValue, { color: colors.text }]}>
                    {projectData.startDate.toLocaleDateString()} - {projectData.endDate.toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <View style={styles.reviewItem}>
                <MaterialIcons name="attach-money" size={20} color={Colors.primary} />
                <View style={styles.reviewItemContent}>
                  <Text style={[styles.reviewLabel, { color: colors.textSecondary }]}>Budget</Text>
                  <Text style={[styles.reviewValue, { color: Colors.success }]}>
                    ${(parseFloat(projectData.budget) || projectData.estimatedBudget).toLocaleString()}
                  </Text>
                </View>
              </View>
            </GlassCard>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create Project</Text>
        <View style={styles.backButton} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Step {currentStep + 1} of {WIZARD_STEPS.length}
        </Text>
      </View>

      {/* Step Indicators */}
      <View style={styles.stepsContainer}>
        {WIZARD_STEPS.map((step, index) => (
          <View key={step.id} style={styles.stepIndicator}>
            <View
              style={[
                styles.stepDot,
                index < currentStep && styles.stepDotCompleted,
                index === currentStep && styles.stepDotActive,
              ]}
            >
              {index < currentStep ? (
                <MaterialIcons name="check" size={14} color="#FFF" />
              ) : (
                <Text style={styles.stepNumber}>{index + 1}</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Step Title */}
      <View style={styles.stepTitleContainer}>
        <MaterialIcons
          name={WIZARD_STEPS[currentStep].icon as any}
          size={32}
          color={Colors.primary}
        />
        <Text style={[styles.stepTitle, { color: colors.text }]}>
          {WIZARD_STEPS[currentStep].title}
        </Text>
        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]}>
          {WIZARD_STEPS[currentStep].subtitle}
        </Text>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.contentContainer}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
            {renderStepContent()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        {currentStep === WIZARD_STEPS.length - 1 ? (
          <TouchableOpacity
            style={styles.createButton}
            onPress={handleCreateProject}
            disabled={loading}
          >
            <LinearGradient
              colors={[Colors.success, '#059669']}
              style={styles.createButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <MaterialIcons name="rocket-launch" size={24} color="#FFF" />
                  <Text style={styles.createButtonText}>Create Project</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <MaterialIcons name="arrow-forward" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: '700',
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: Typography.sm,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  stepIndicator: {
    marginHorizontal: Spacing.sm,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(100,100,100,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepDotCompleted: {
    backgroundColor: Colors.success,
  },
  stepNumber: {
    color: '#FFF',
    fontSize: Typography.sm,
    fontWeight: '600',
  },
  stepTitleContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  stepTitle: {
    fontSize: Typography['2xl'],
    fontWeight: '800',
    marginTop: Spacing.md,
  },
  stepSubtitle: {
    fontSize: Typography.base,
    marginTop: Spacing.xs,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  stepContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: Typography.sm,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    fontSize: Typography.base,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    fontSize: Typography.base,
    backgroundColor: 'rgba(255,255,255,0.05)',
    height: 100,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  typeCard: {
    width: (width - 48 - 16) / 3,
    aspectRatio: 1,
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  typeCardSelected: {
    backgroundColor: 'rgba(255,107,53,0.1)',
  },
  typeLabel: {
    fontSize: Typography.xs,
    fontWeight: '600',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  locationButton: {
    marginTop: Spacing.md,
  },
  locationButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.base,
    gap: Spacing.sm,
  },
  locationButtonText: {
    color: '#FFF',
    fontSize: Typography.base,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: Typography.sm,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: Spacing.md,
  },
  dateText: {
    fontSize: Typography.base,
    flex: 1,
  },
  durationCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  durationText: {
    flex: 1,
  },
  durationValue: {
    fontSize: Typography['2xl'],
    fontWeight: '800',
  },
  durationLabel: {
    fontSize: Typography.sm,
  },
  aiButton: {
    marginTop: Spacing.lg,
  },
  aiButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.base,
    gap: Spacing.sm,
  },
  aiButtonText: {
    color: '#FFF',
    fontSize: Typography.base,
    fontWeight: '600',
  },
  estimateCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  estimateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  estimateLabel: {
    fontSize: Typography.sm,
  },
  estimateValue: {
    fontSize: Typography['3xl'],
    fontWeight: '800',
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.base,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(100,100,100,0.3)',
  },
  currencySymbol: {
    fontSize: Typography['2xl'],
    fontWeight: '700',
    paddingLeft: Spacing.md,
  },
  budgetInput: {
    flex: 1,
    padding: Spacing.md,
    fontSize: Typography.xl,
    fontWeight: '600',
  },
  teamCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  teamTitle: {
    fontSize: Typography.xl,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  teamSubtitle: {
    fontSize: Typography.base,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ownerName: {
    fontSize: Typography.base,
    fontWeight: '600',
  },
  ownerRole: {
    fontSize: Typography.sm,
  },
  reviewTitle: {
    fontSize: Typography.xl,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  reviewCard: {
    padding: Spacing.lg,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100,100,100,0.2)',
  },
  reviewItemContent: {
    flex: 1,
  },
  reviewLabel: {
    fontSize: Typography.xs,
    marginBottom: 2,
  },
  reviewValue: {
    fontSize: Typography.base,
    fontWeight: '600',
  },
  navigationButtons: {
    padding: Spacing.lg,
  },
  nextButton: {
    overflow: 'hidden',
    borderRadius: BorderRadius.lg,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: Typography.lg,
    fontWeight: '700',
  },
  createButton: {
    overflow: 'hidden',
    borderRadius: BorderRadius.lg,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: Typography.lg,
    fontWeight: '700',
  },
});
