import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
  barWidth?: number;
  gradientColors?: string[];
}

export const SimpleBarChart: React.FC<BarChartProps> = ({
  data,
  maxValue,
  height = 150,
  showLabels = true,
  showValues = true,
  barWidth = 30,
  gradientColors = ['#FF6B35', '#FF8F5A'],
}) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  
  return (
    <View style={[styles.container, { height: height + 40 }]}>
      <View style={[styles.chartArea, { height }]}>
        {data.map((item, index) => {
          const barHeight = (item.value / max) * height;
          return (
            <View key={index} style={styles.barContainer}>
              <View style={[styles.barWrapper, { height }]}>
                {showValues && (
                  <Text style={styles.valueLabel}>{item.value}</Text>
                )}
                <View style={[styles.barBase, { height: barHeight }]}>
                  <LinearGradient
                    colors={item.color ? [item.color, item.color] : gradientColors}
                    style={[styles.bar, { width: barWidth }]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                  />
                </View>
              </View>
              {showLabels && (
                <Text style={styles.label} numberOfLines={1}>
                  {item.label}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

interface DonutChartProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  sublabel?: string;
}

export const SimpleDonutChart: React.FC<DonutChartProps> = ({
  percentage,
  size = 120,
  strokeWidth = 12,
  color = '#FF6B35',
  backgroundColor = 'rgba(255,255,255,0.1)',
  label,
  sublabel,
}) => {
  // Create segments for the donut using positioned views
  const innerSize = size - strokeWidth * 2;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  
  return (
    <View style={[styles.donutContainer, { width: size, height: size }]}>
      {/* Background circle */}
      <View
        style={[
          styles.donutRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          },
        ]}
      />
      
      {/* Progress indicator (simplified visual representation) */}
      <View style={[styles.donutProgress, { width: size, height: size }]}>
        {/* Top segment */}
        {clampedPercentage > 0 && (
          <View
            style={[
              styles.progressSegment,
              {
                width: strokeWidth,
                height: clampedPercentage > 25 ? size / 2 : (clampedPercentage / 25) * (size / 2),
                backgroundColor: color,
                top: 0,
                left: (size - strokeWidth) / 2,
                borderTopLeftRadius: strokeWidth / 2,
                borderTopRightRadius: strokeWidth / 2,
              },
            ]}
          />
        )}
        {/* Right segment */}
        {clampedPercentage > 25 && (
          <View
            style={[
              styles.progressSegment,
              {
                width: clampedPercentage > 50 ? size / 2 : ((clampedPercentage - 25) / 25) * (size / 2),
                height: strokeWidth,
                backgroundColor: color,
                top: (size - strokeWidth) / 2,
                right: 0,
                borderTopRightRadius: strokeWidth / 2,
                borderBottomRightRadius: strokeWidth / 2,
              },
            ]}
          />
        )}
        {/* Bottom segment */}
        {clampedPercentage > 50 && (
          <View
            style={[
              styles.progressSegment,
              {
                width: strokeWidth,
                height: clampedPercentage > 75 ? size / 2 : ((clampedPercentage - 50) / 25) * (size / 2),
                backgroundColor: color,
                bottom: 0,
                left: (size - strokeWidth) / 2,
                borderBottomLeftRadius: strokeWidth / 2,
                borderBottomRightRadius: strokeWidth / 2,
              },
            ]}
          />
        )}
        {/* Left segment */}
        {clampedPercentage > 75 && (
          <View
            style={[
              styles.progressSegment,
              {
                width: ((clampedPercentage - 75) / 25) * (size / 2),
                height: strokeWidth,
                backgroundColor: color,
                top: (size - strokeWidth) / 2,
                left: 0,
                borderTopLeftRadius: strokeWidth / 2,
                borderBottomLeftRadius: strokeWidth / 2,
              },
            ]}
          />
        )}
      </View>
      
      {/* Center content */}
      <View style={[styles.donutCenter, { width: innerSize, height: innerSize }]}>
        <Text style={styles.donutPercentage}>{clampedPercentage.toFixed(0)}%</Text>
        {label && <Text style={styles.donutLabel}>{label}</Text>}
        {sublabel && <Text style={styles.donutSublabel}>{sublabel}</Text>}
      </View>
    </View>
  );
};

interface ProgressBarProps {
  progress: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  label?: string;
}

export const SimpleProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color = '#FF6B35',
  backgroundColor = 'rgba(255,255,255,0.1)',
  showPercentage = false,
  label,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <View style={styles.progressContainer}>
      {(label || showPercentage) && (
        <View style={styles.progressHeader}>
          {label && <Text style={styles.progressLabel}>{label}</Text>}
          {showPercentage && (
            <Text style={styles.progressPercentage}>{clampedProgress.toFixed(0)}%</Text>
          )}
        </View>
      )}
      <View style={[styles.progressTrack, { height, backgroundColor }]}>
        <LinearGradient
          colors={[color, color]}
          style={[styles.progressFill, { width: `${clampedProgress}%`, height }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
    </View>
  );
};

interface StatCardProps {
  value: string | number;
  label: string;
  trend?: { value: number; isPositive: boolean };
  icon?: React.ReactNode;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  trend,
  icon,
  color = '#FF6B35',
}) => {
  return (
    <View style={styles.statCard}>
      {icon && (
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
      )}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {trend && (
        <View style={styles.trendContainer}>
          <Text
            style={[
              styles.trendValue,
              { color: trend.isPositive ? '#10B981' : '#EF4444' },
            ]}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barBase: {
    justifyContent: 'flex-end',
  },
  bar: {
    borderRadius: 4,
    minHeight: 4,
    height: '100%',
  },
  valueLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
    fontWeight: '600',
  },
  label: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 50,
  },
  donutContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutRing: {
    position: 'absolute',
  },
  donutProgress: {
    position: 'absolute',
  },
  progressSegment: {
    position: 'absolute',
  },
  donutCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutPercentage: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  donutLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  donutSublabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  progressContainer: {
    width: '100%',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '700',
  },
  progressTrack: {
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 4,
  },
  statCard: {
    alignItems: 'center',
    padding: 16,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  trendContainer: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  trendValue: {
    fontSize: 12,
    fontWeight: '600',
  },
});
