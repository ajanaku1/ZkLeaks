import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono'
import { loadFont as loadSans } from '@remotion/google-fonts/SpaceGrotesk'

export const { fontFamily: MONO } = loadMono('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['latin'],
})

export const { fontFamily: SANS } = loadSans('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['latin'],
})
