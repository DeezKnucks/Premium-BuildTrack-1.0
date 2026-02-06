import React from 'react';
import Svg, { Path, Rect, Circle, Line, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

// Toolbox Icon
export const ToolboxIcon: React.FC<IconProps> = ({ size = 24, color = '#FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M10 4h4v2h-4V4zm-2 4h8v-2h2v14H6V6h2v2z"
      fill={color}
    />
    <Rect x="4" y="10" width="16" height="2" fill={color} />
    <Path
      d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
    />
  </Svg>
);

// Hammer Icon
export const HammerIcon: React.FC<IconProps> = ({ size = 24, color = '#FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 16l3.5 3.5L22 5l-3.5-3.5L4 16z"
      fill={color}
    />
    <Path
      d="M2 20l2 2 4-4-2-2-4 4z"
      fill={color}
    />
    <Rect
      x="14"
      y="3"
      width="3"
      height="8"
      rx="1.5"
      transform="rotate(45 14 3)"
      fill={color}
    />
  </Svg>
);

// Blueprint Icon  
export const BlueprintIcon: React.FC<IconProps> = ({ size = 24, color = '#FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
    <Line x1="6" y1="8" x2="18" y2="8" stroke={color} strokeWidth="1.5" />
    <Line x1="6" y1="12" x2="14" y2="12" stroke={color} strokeWidth="1.5" />
    <Line x1="6" y1="16" x2="12" y2="16" stroke={color} strokeWidth="1.5" />
    <Circle cx="16" cy="16" r="2" fill={color} />
  </Svg>
);

// Hard Hat Icon
export const HardHatIcon: React.FC<IconProps> = ({ size = 24, color = '#FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4C8 4 4 6.5 4 10v4h16v-4c0-3.5-4-6-8-6z"
      fill={color}
    />
    <Rect x="2" y="14" width="20" height="3" rx="1" fill={color} />
    <Path
      d="M11 4h2v6h-2V4z"
      fill={color}
      opacity="0.7"
    />
  </Svg>
);

// Wrench Icon
export const WrenchIcon: React.FC<IconProps> = ({ size = 24, color = '#FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"
      fill={color}
    />
  </Svg>
);

// Level Tool Icon
export const LevelIcon: React.FC<IconProps> = ({ size = 24, color = '#FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="9" width="20" height="6" rx="1" stroke={color} strokeWidth="1.5" fill="none" />
    <Circle cx="12" cy="12" r="2" fill={color} />
    <Line x1="7" y1="11" x2="7" y2="13" stroke={color} strokeWidth="1.5" />
    <Line x1="17" y1="11" x2="17" y2="13" stroke={color} strokeWidth="1.5" />
  </Svg>
);

// Measuring Tape Icon
export const MeasuringTapeIcon: React.FC<IconProps> = ({ size = 24, color = '#FFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" fill="none" />
    <Path
      d="M13 13l8 8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Line x1="6" y1="8" x2="10" y2="8" stroke={color} strokeWidth="1.5" />
    <Line x1="8" y1="6" x2="8" y2="10" stroke={color} strokeWidth="1.5" />
  </Svg>
);