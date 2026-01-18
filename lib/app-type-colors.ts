/**
 * Application Type Color Configuration
 *
 * Each application type has its own unique color scheme:
 * - Binary Choice: Violet/Purple - 神秘、命运、魔法抉择
 * - Wheel Spinner: Amber/Gold - 幸运轮盘、赌场感
 * - Counter: Emerald/Green - 成长、进度、成功
 */

import type { ApplicationType } from './supabase/applications';

export interface AppTypeColorConfig {
  // Primary gradient colors
  gradient: string;
  gradientHover: string;

  // Shadow and glow effects
  shadow: string;
  shadowHover: string;
  glow: string;
  glowIntense: string;

  // Background variants
  bgLight: string;
  bgDark: string;
  bgMuted: string;

  // Text colors
  text: string;
  textMuted: string;

  // Border colors
  border: string;
  borderHover: string;

  // Button styles
  button: string;
  buttonHover: string;

  // Animation class
  neonAnimation: string;

  // Raw color values for custom use
  primary: string;
  primaryRgb: string;
}

export const APP_TYPE_COLORS: Record<ApplicationType, AppTypeColorConfig> = {
  coin: {
    // Binary Choice - Violet/Purple theme
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
    gradientHover: 'from-violet-500 via-purple-500 to-fuchsia-500',

    shadow: 'shadow-violet-500/30',
    shadowHover: 'shadow-violet-500/50',
    glow: 'bg-violet-500/20',
    glowIntense: 'bg-violet-500/40',

    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-950/30',
    bgMuted: 'bg-violet-500/10',

    text: 'text-violet-600 dark:text-violet-400',
    textMuted: 'text-violet-500/70',

    border: 'border-violet-500/30',
    borderHover: 'border-violet-500/50',

    button: 'bg-violet-600 hover:bg-violet-500',
    buttonHover: 'hover:bg-violet-500',

    neonAnimation: 'animate-neon-violet',

    primary: 'violet-600',
    primaryRgb: '139, 92, 246',
  },

  wheel: {
    // Wheel Spinner - Amber/Gold theme
    gradient: 'from-amber-500 via-orange-500 to-yellow-500',
    gradientHover: 'from-amber-400 via-orange-400 to-yellow-400',

    shadow: 'shadow-amber-500/30',
    shadowHover: 'shadow-amber-500/50',
    glow: 'bg-amber-500/20',
    glowIntense: 'bg-amber-500/40',

    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/30',
    bgMuted: 'bg-amber-500/10',

    text: 'text-amber-600 dark:text-amber-400',
    textMuted: 'text-amber-500/70',

    border: 'border-amber-500/30',
    borderHover: 'border-amber-500/50',

    button: 'bg-amber-600 hover:bg-amber-500',
    buttonHover: 'hover:bg-amber-500',

    neonAnimation: 'animate-neon-amber',

    primary: 'amber-600',
    primaryRgb: '245, 158, 11',
  },

  counter: {
    // Counter - Emerald/Green theme
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    gradientHover: 'from-emerald-400 via-green-400 to-teal-400',

    shadow: 'shadow-emerald-500/30',
    shadowHover: 'shadow-emerald-500/50',
    glow: 'bg-emerald-500/20',
    glowIntense: 'bg-emerald-500/40',

    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-950/30',
    bgMuted: 'bg-emerald-500/10',

    text: 'text-emerald-600 dark:text-emerald-400',
    textMuted: 'text-emerald-500/70',

    border: 'border-emerald-500/30',
    borderHover: 'border-emerald-500/50',

    button: 'bg-emerald-600 hover:bg-emerald-500',
    buttonHover: 'hover:bg-emerald-500',

    neonAnimation: 'animate-neon-emerald',

    primary: 'emerald-600',
    primaryRgb: '16, 185, 129',
  },

  math_flash: {
    // Math Flash - Sky/Blue theme (education, focus, clarity)
    gradient: 'from-sky-500 via-blue-500 to-indigo-500',
    gradientHover: 'from-sky-400 via-blue-400 to-indigo-400',

    shadow: 'shadow-sky-500/30',
    shadowHover: 'shadow-sky-500/50',
    glow: 'bg-sky-500/20',
    glowIntense: 'bg-sky-500/40',

    bgLight: 'bg-sky-50',
    bgDark: 'dark:bg-sky-950/30',
    bgMuted: 'bg-sky-500/10',

    text: 'text-sky-600 dark:text-sky-400',
    textMuted: 'text-sky-500/70',

    border: 'border-sky-500/30',
    borderHover: 'border-sky-500/50',

    button: 'bg-sky-600 hover:bg-sky-500',
    buttonHover: 'hover:bg-sky-500',

    neonAnimation: 'animate-neon-sky',

    primary: 'sky-600',
    primaryRgb: '14, 165, 233',
  },

  agree_question: {
    // Agree Question - Indigo/Purple theme (contemplation, wisdom, communication)
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    gradientHover: 'from-indigo-400 via-purple-400 to-pink-400',

    shadow: 'shadow-indigo-500/30',
    shadowHover: 'shadow-indigo-500/50',
    glow: 'bg-indigo-500/20',
    glowIntense: 'bg-indigo-500/40',

    bgLight: 'bg-indigo-50',
    bgDark: 'dark:bg-indigo-950/30',
    bgMuted: 'bg-indigo-500/10',

    text: 'text-indigo-600 dark:text-indigo-400',
    textMuted: 'text-indigo-500/70',

    border: 'border-indigo-500/30',
    borderHover: 'border-indigo-500/50',

    button: 'bg-indigo-600 hover:bg-indigo-500',
    buttonHover: 'hover:bg-indigo-500',

    neonAnimation: 'animate-neon-indigo',

    primary: 'indigo-600',
    primaryRgb: '79, 70, 229',
  },

  family_tree: {
    // Family Tree - Amber/Orange theme (warmth, family, connection)
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
    gradientHover: 'from-amber-400 via-orange-400 to-rose-400',

    shadow: 'shadow-amber-500/30',
    shadowHover: 'shadow-amber-500/50',
    glow: 'bg-amber-500/20',
    glowIntense: 'bg-amber-500/40',

    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-950/30',
    bgMuted: 'bg-amber-500/10',

    text: 'text-amber-600 dark:text-amber-400',
    textMuted: 'text-amber-500/70',

    border: 'border-amber-500/30',
    borderHover: 'border-amber-500/50',

    button: 'bg-amber-600 hover:bg-amber-500',
    buttonHover: 'hover:bg-amber-500',

    neonAnimation: 'animate-neon-amber',

    primary: 'amber-600',
    primaryRgb: '245, 158, 11',
  },
};

/**
 * Get color config for an application type
 * Falls back to violet (binary choice) if type is unknown
 */
export function getAppTypeColors(type: ApplicationType | string): AppTypeColorConfig {
  return APP_TYPE_COLORS[type as ApplicationType] || APP_TYPE_COLORS.coin;
}

/**
 * Application type metadata (icon, label, availability)
 */
export interface AppTypeMetadata {
  value: ApplicationType;
  icon: string;
  label: string;
  description: string;
  available: boolean;
  colors: AppTypeColorConfig;
}

export const APP_TYPES: AppTypeMetadata[] = [
  {
    value: 'coin',
    icon: '🎲',
    label: 'Binary Choice',
    description: 'Make decisions between two options with dramatic reveal',
    available: true,
    colors: APP_TYPE_COLORS.coin,
  },
  {
    value: 'wheel',
    icon: '🎡',
    label: 'Wheel Spinner',
    description: 'Spin the wheel to randomly select from multiple options',
    available: false,
    colors: APP_TYPE_COLORS.wheel,
  },
  {
    value: 'counter',
    icon: '🔢',
    label: 'Counter',
    description: 'Track counts and progress with satisfying increments',
    available: false,
    colors: APP_TYPE_COLORS.counter,
  },
  {
    value: 'math_flash',
    icon: '🧮',
    label: 'Math Flash',
    description: 'Practice math with timed arithmetic problems for kids',
    available: true,
    colors: APP_TYPE_COLORS.math_flash,
  },
  {
    value: 'agree_question',
    icon: '💭',
    label: 'Agree Question',
    description: 'Ask friends questions and let them choose to agree or disagree',
    available: true,
    colors: APP_TYPE_COLORS.agree_question,
  },
  {
    value: 'family_tree',
    icon: '🌳',
    label: 'Family Tree',
    description: 'Manage family relationships and look up Chinese kinship terms',
    available: true,
    colors: APP_TYPE_COLORS.family_tree,
  },
];

/**
 * Get metadata for an application type
 */
export function getAppTypeMetadata(type: ApplicationType | string): AppTypeMetadata | undefined {
  return APP_TYPES.find(t => t.value === type);
}
