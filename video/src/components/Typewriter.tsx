import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion'
import { COLORS } from '../constants'
import { MONO } from '../fonts'

export const Typewriter: React.FC<{
  text: string
  startFrame?: number
  speed?: number // frames per character
  style?: React.CSSProperties
  cursor?: boolean
  cursorColor?: string
}> = ({ text, startFrame = 0, speed = 2, style, cursor = true, cursorColor }) => {
  const frame = useCurrentFrame()
  const elapsed = Math.max(0, frame - startFrame)
  const charsToShow = Math.min(text.length, Math.floor(elapsed / speed))
  const isDone = charsToShow >= text.length
  const cursorVisible = Math.floor(frame / 15) % 2 === 0

  if (elapsed < 0) return null

  return (
    <span style={{ fontFamily: MONO, ...style }}>
      {text.slice(0, charsToShow)}
      {cursor && (!isDone || cursorVisible) && (
        <span style={{
          color: cursorColor ?? COLORS.accent,
          opacity: isDone ? (cursorVisible ? 1 : 0) : 1,
        }}>
          _
        </span>
      )}
    </span>
  )
}

export const TerminalTypewriter: React.FC<{
  lines: Array<{
    prefix?: string
    text: string
    color?: string
    prefixColor?: string
    delay: number // frame when this line starts typing
  }>
  style?: React.CSSProperties
}> = ({ lines, style }) => {
  const frame = useCurrentFrame()

  return (
    <div style={{ fontFamily: MONO, fontSize: 16, lineHeight: 2, ...style }}>
      {lines.map((line, i) => {
        const elapsed = frame - line.delay
        if (elapsed < 0) return null
        const charsToShow = Math.min(line.text.length, Math.floor(elapsed / 1.5))
        return (
          <div key={i} style={{ display: 'flex', gap: 8, color: line.color ?? COLORS.offWhite }}>
            {line.prefix && (
              <span style={{ color: line.prefixColor ?? COLORS.muted, flexShrink: 0 }}>
                {line.prefix}
              </span>
            )}
            <span>{line.text.slice(0, charsToShow)}</span>
          </div>
        )
      })}
    </div>
  )
}
