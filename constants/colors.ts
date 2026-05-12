// V2 "Training Journal" tokens.

export const Colors = {
  // ─── V2 core ────────────────────────────────────────────
  paper:     '#F6F2E9',
  paperDeep: '#EAE3D2',
  ink:       '#161513',
  red:       '#D8392B',
  faint:     'rgba(22,21,19,0.12)',
  muted:     'rgba(22,21,19,0.5)',

  // ─── Legacy aliases (so existing screens don't break
  //    before they're individually ported) ─────────────────
  primary:   '#D8392B',          // stamp red
  secondary: '#161513',          // ink
  accent:    '#EAE3D2',          // paperDeep
  warning:   '#D8392B',          // red doubles as warn
  error:     '#D8392B',
  cream:     '#F6F2E9',
  card:      '#F6F2E9',

  text: {
    primary:   '#161513',
    secondary: 'rgba(22,21,19,0.7)',
    muted:     'rgba(22,21,19,0.5)',
  },

  status: {
    success: '#161513',          // calm: success isn't a color, it's just stamped
    info:    'rgba(22,21,19,0.5)',
  },

  adherence: {
    low:    '#D8392B',
    medium: '#161513',
    high:   '#161513',
  },

  // ─── Typography stack ──────────────────────────────────
  // After expo-font loads these names, pass as fontFamily prop.
  font: {
    serif:   'Newsreader_500Medium',
    serifIt: 'Newsreader_500Medium_Italic',
    stencil: 'BebasNeue_400Regular',
    mono:    'IBMPlexMono_500Medium',
    monoBold:'IBMPlexMono_700Bold',
  },
} as const;
