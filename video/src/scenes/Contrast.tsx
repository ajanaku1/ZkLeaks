import { useCurrentFrame, useVideoConfig, spring, interpolate, AbsoluteFill } from 'remotion'
import { COLORS } from '../constants'
import { MONO, SANS } from '../fonts'
import { Scanlines, Grain, Vignette } from '../components/Scanlines'
import { GlitchTransition } from '../components/GlitchTransition'

/**
 * Scene 2: THE DILEMMA — Stay Silent or Get Destroyed
 * Shows what happens to whistleblowers in the current system,
 * then pivots: "What if there was another way?"
 */
export const Contrast: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // ── Phase 1: News headlines cascade (0–180) ──
  const headlines = [
    { text: 'WHISTLEBLOWER FIRED AFTER INTERNAL COMPLAINT', source: 'Financial Times, 2024', delay: 10, y: 160 },
    { text: 'EMPLOYEE IDENTITY LEAKED FROM ANONYMOUS TIP LINE', source: 'Reuters, 2023', delay: 35, y: 290 },
    { text: 'CORPORATE RETALIATION: 83% OF WHISTLEBLOWERS FACE CONSEQUENCES', source: 'Ethics & Compliance Initiative', delay: 60, y: 420 },
    { text: 'METADATA IN LEAKED DOCUMENTS TRACED BACK TO SOURCE', source: 'Ars Technica, 2024', delay: 85, y: 550 },
  ]

  const phase1Exit = interpolate(frame, [160, 190], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // ── Phase 2: "The system is broken" (180–260) ──
  const brokenEnter = interpolate(frame, [190, 215], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const brokenExit = interpolate(frame, [245, 270], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // Strike-through animation on "anonymous"
  const strikeWidth = interpolate(frame, [220, 240], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // ── Phase 3: "What if..." pivot (260–360) ──
  const pivotEnter = interpolate(frame, [270, 295], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const pivotLine1Chars = Math.min(38, Math.max(0, Math.floor((frame - 280) / 2)))
  const pivotLine2Chars = Math.min(32, Math.max(0, Math.floor((frame - 320) / 2)))
  const cursorBlink = Math.floor(frame / 15) % 2 === 0

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Vignette />

      {/* Phase 1: Headlines */}
      <div style={{ position: 'absolute', inset: 0, opacity: phase1Exit, padding: '0 160px' }}>
        {headlines.map((h, i) => {
          const prog = spring({ frame: frame - h.delay, fps, config: { damping: 18, stiffness: 130 } })
          const op = interpolate(prog, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' })
          const x = interpolate(prog, [0, 1], [-40, 0])

          return (
            <div key={i} style={{
              position: 'absolute', left: 160, right: 160, top: h.y,
              opacity: op, transform: `translateX(${x}px)`,
              borderLeft: `3px solid ${COLORS.danger}`,
              paddingLeft: 24, paddingTop: 8, paddingBottom: 8,
            }}>
              <div style={{
                fontFamily: SANS, fontSize: 22, fontWeight: 600, color: COLORS.white,
                lineHeight: 1.3,
              }}>
                {h.text}
              </div>
              <div style={{
                fontFamily: MONO, fontSize: 12, color: COLORS.muted, marginTop: 6,
              }}>
                {h.source}
              </div>
            </div>
          )
        })}

        {/* Stat counter */}
        <div style={{
          position: 'absolute', right: 160, bottom: 160,
          opacity: interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          textAlign: 'right',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 72, fontWeight: 700, color: COLORS.danger }}>
            83%
          </div>
          <div style={{ fontFamily: MONO, fontSize: 14, color: COLORS.muted, letterSpacing: 2 }}>
            FACE RETALIATION
          </div>
        </div>
      </div>

      {/* Phase 2: "The system is broken" */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: brokenEnter * brokenExit,
      }}>
        <div style={{
          fontFamily: SANS, fontSize: 48, fontWeight: 700, color: COLORS.white,
          textAlign: 'center', lineHeight: 1.4,
        }}>
          There is no such thing as
        </div>
        <div style={{ position: 'relative', marginTop: 8 }}>
          <span style={{
            fontFamily: SANS, fontSize: 48, fontWeight: 700, color: COLORS.danger,
          }}>
            "anonymous" reporting
          </span>
          {/* Strike-through */}
          <div style={{
            position: 'absolute', top: '55%', left: 0,
            width: `${strikeWidth}%`, height: 3, background: COLORS.danger,
          }} />
        </div>
        <div style={{
          fontFamily: MONO, fontSize: 16, color: COLORS.muted, marginTop: 24,
          opacity: interpolate(frame, [230, 245], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          Metadata. IP logs. Document fingerprints. They always find you.
        </div>
      </div>

      {/* Phase 3: The pivot */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: pivotEnter,
      }}>
        <div style={{
          fontFamily: MONO, fontSize: 40, color: COLORS.white, textAlign: 'center',
          lineHeight: 1.6,
        }}>
          <div>
            {'What if you could prove you\'re inside'.slice(0, pivotLine1Chars)}
            {pivotLine1Chars < 38 && frame > 280 && (
              <span style={{ color: COLORS.accent, opacity: cursorBlink ? 1 : 0 }}>_</span>
            )}
          </div>
          {pivotLine1Chars >= 38 && (
            <div style={{ color: COLORS.accent }}>
              {'without revealing who you are?'.slice(0, pivotLine2Chars)}
              {pivotLine2Chars < 30 && (
                <span style={{ opacity: cursorBlink ? 1 : 0 }}>_</span>
              )}
            </div>
          )}
        </div>
      </div>

      <Scanlines />
      <Grain opacity={0.03} />
      <GlitchTransition startFrame={durationInFrames - 18} color={COLORS.accent} />
    </AbsoluteFill>
  )
}
