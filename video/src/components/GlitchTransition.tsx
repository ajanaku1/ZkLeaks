import { useCurrentFrame, interpolate } from 'remotion'
import { COLORS } from '../constants'

/** Full-screen glitch that covers scene transitions.
 *  Place at the END of a scene, spanning the last ~20 frames. */
export const GlitchTransition: React.FC<{
  startFrame: number
  duration?: number
  color?: string
}> = ({ startFrame, duration = 18, color }) => {
  const frame = useCurrentFrame()
  const elapsed = frame - startFrame

  if (elapsed < 0 || elapsed > duration) return null

  const progress = elapsed / duration
  const opacity = elapsed < duration / 2
    ? interpolate(elapsed, [0, duration / 2], [0, 1])
    : interpolate(elapsed, [duration / 2, duration], [1, 0])

  // Horizontal slice effect
  const sliceCount = 8
  const slices = Array.from({ length: sliceCount }, (_, i) => {
    const sliceH = 1080 / sliceCount
    const offset = Math.sin((i + frame) * 2.7) * 40 * opacity
    return (
      <div key={i} style={{
        position: 'absolute',
        left: offset,
        top: i * sliceH,
        width: '100%',
        height: sliceH,
        background: color ?? COLORS.accent,
        opacity: opacity * 0.15,
      }} />
    )
  })

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 200, overflow: 'hidden' }}>
      {slices}
      {/* Flash */}
      <div style={{
        position: 'absolute', inset: 0,
        background: color ?? COLORS.accent,
        opacity: elapsed < 3 ? elapsed * 0.08 : Math.max(0, opacity * 0.12),
      }} />
    </div>
  )
}
