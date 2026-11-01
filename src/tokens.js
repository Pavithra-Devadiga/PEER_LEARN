/**
 * PeerLearn Design Tokens
 * 
 * Supports both themes ('light' | 'dark') and both modes ('student' | 'tutor').
 * Mode determines the primary brand accent (Student = Violet, Tutor = Emerald Green).
 * Theme determines surface, background, border, text, and shadow elevations.
 */

export const tokens = {
  modes: {
    student: {
      accent: {
        primary: '#6366f1', // Indigo / Violet
        primaryHover: '#4f46e5',
        primaryMuted: 'rgba(99, 102, 241, 0.12)',
        primaryText: '#4f46e5',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        bannerBgLight: 'linear-gradient(135deg, #eff2fe 0%, #f5eefc 100%)',
        bannerBgDark: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(139, 92, 246, 0.14) 100%)',
        bannerBorderLight: '#dbeafe',
        bannerBorderDark: 'rgba(99, 102, 241, 0.3)',
        bannerTextLight: '#3730a3',
        bannerTextDark: '#c7d2fe',
      }
    },
    tutor: {
      accent: {
        primary: '#10b981', // Emerald / Green
        primaryHover: '#059669',
        primaryMuted: 'rgba(16, 185, 129, 0.12)',
        primaryText: '#047857',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        bannerBgLight: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
        bannerBgDark: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.14) 100%)',
        bannerBorderLight: '#a7f3d0',
        bannerBorderDark: 'rgba(16, 185, 129, 0.3)',
        bannerTextLight: '#065f46',
        bannerTextDark: '#a7f3d0',
      }
    }
  },
  themes: {
    light: {
      bg: {
        app: '#f6f7fb',
        card: '#ffffff',
        cardHover: '#fafbfc',
        surfaceMuted: '#f1f3f9',
        surfaceSubtle: '#f8f9fd',
        pill: '#ffffff',
        pillHover: '#f1f3f9',
      },
      text: {
        primary: '#111827',
        secondary: '#4b5563',
        muted: '#9ca3af',
        subtle: '#6b7280',
        onAccent: '#ffffff',
      },
      border: {
        subtle: '#e5e7eb',
        card: 'rgba(255, 255, 255, 0.9)',
        cardOuter: 'rgba(226, 232, 240, 0.8)',
        pill: 'rgba(229, 231, 235, 0.9)',
      },
      shadow: {
        card: '0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 4px 12px -2px rgba(0, 0, 0, 0.02)',
        cardHover: '0 18px 36px -6px rgba(0, 0, 0, 0.07), 0 8px 16px -4px rgba(0, 0, 0, 0.04)',
        pill: '0 4px 14px 0 rgba(0, 0, 0, 0.04)',
        popover: '0 20px 40px -10px rgba(0, 0, 0, 0.12)',
      },
      tint: {
        violet: { bg: '#f4f2ff', text: '#5b21b6', border: '#ddd6fe' },
        blue: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
        green: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
        yellow: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
        peach: { bg: '#fff1f2', text: '#9f1239', border: '#fecdd3' },
      }
    },
    dark: {
      bg: {
        app: '#0f1115',
        card: '#17191f',
        cardHover: '#1d2028',
        surfaceMuted: '#21242d',
        surfaceSubtle: '#14161b',
        pill: '#1c1f26',
        pillHover: '#262a34',
      },
      text: {
        primary: '#f9fafb',
        secondary: '#d1d5db',
        muted: '#9ca3af',
        subtle: '#6b7280',
        onAccent: '#ffffff',
      },
      border: {
        subtle: 'rgba(255, 255, 255, 0.08)',
        card: 'rgba(255, 255, 255, 0.06)',
        cardOuter: 'rgba(255, 255, 255, 0.04)',
        pill: 'rgba(255, 255, 255, 0.1)',
      },
      shadow: {
        card: '0 10px 30px -5px rgba(0, 0, 0, 0.4), 0 4px 12px -2px rgba(0, 0, 0, 0.3)',
        cardHover: '0 18px 36px -6px rgba(0, 0, 0, 0.5), 0 8px 16px -4px rgba(0, 0, 0, 0.35)',
        pill: '0 4px 14px 0 rgba(0, 0, 0, 0.3)',
        popover: '0 20px 40px -10px rgba(0, 0, 0, 0.6)',
      },
      tint: {
        violet: { bg: 'rgba(139, 92, 246, 0.15)', text: '#c4b5fd', border: 'rgba(139, 92, 246, 0.3)' },
        blue: { bg: 'rgba(59, 130, 246, 0.15)', text: '#93c5fd', border: 'rgba(59, 130, 246, 0.3)' },
        green: { bg: 'rgba(16, 185, 129, 0.15)', text: '#6ee7b7', border: 'rgba(16, 185, 129, 0.3)' },
        yellow: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fcd34d', border: 'rgba(245, 158, 11, 0.3)' },
        peach: { bg: 'rgba(244, 63, 94, 0.15)', text: '#fda4af', border: 'rgba(244, 63, 94, 0.3)' },
      }
    }
  }
}
