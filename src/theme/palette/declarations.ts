const TONE_STOPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100] as const

/** Candidate tones for `Palette.onColor` — the darkest and the lightest the scale offers. */
const ON_COLOR_TONES = [10, 100] as const
const NEUTRAL_CHROMA = 0.03

/** @internal Tom do meio da escala tonal. */
const MID_TONE = 50

export {
  TONE_STOPS,
  ON_COLOR_TONES,
  NEUTRAL_CHROMA,
  MID_TONE,
}
