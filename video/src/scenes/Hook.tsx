import { useCurrentFrame, useVideoConfig, spring, interpolate, AbsoluteFill } from 'remotion'
import { COLORS } from '../constants'
import { MONO, SANS } from '../fonts'
import { Scanlines, Grain, Vignette } from '../components/Scanlines'
import { GlitchTransition } from '../components/GlitchTransition'

/**
 * Scene 1: COLD OPEN — The Discovery
 * Employee #4721 finds a $47M discrepancy in MegaCorp's books.
 * Builds dread through redacted documents and pulsing numbers.
 */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // ── Phase 1: Redacted document fragments (0–180) ──
  const docFragments = [
    { text: 'INTERNAL MEMO — CONFIDENTIAL', delay: 8, color: COLORS.danger, size: 14, x: 320, y: 180 },
    { text: 'Q3 Revenue: $412,000,000', delay: 25, color: COLORS.offWhite, size: 18, x: 680, y: 300 },
    { text: 'Adjusted Liabilities: [REDACTED]', delay: 42, color: COLORS.muted, size: 16, x: 560, y: 400 },
    { text: 'Transfer to Offshore Entity: $47,200,000', delay: 60, color: COLORS.danger, size: 20, x: 480, y: 520 },
    { text: 'Authorized by: [REDACTED]', delay: 78, color: COLORS.muted, size: 14, x: 720, y: 620 },
    { text: 'DO NOT DISTRIBUTE', delay: 92, color: COLORS.danger, size: 12, x: 860, y: 720 },
  ]

  // The big number that pulses
  const numDelay = 100
  const numProg = spring({ frame: frame - numDelay, fps, config: { damping: 12, stiffness: 100 } })
  const numOp = interpolate(numProg, [0, 0.3], [0, 1], { extrapolateRight: 'clamp' })
  const numScale = interpolate(numProg, [0, 1], [0.95, 1])
  const numPulse = 1 + Math.sin(frame * 0.08) * 0.015 // subtle breathing
  const p1Exit = interpolate(frame, [165, 195], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // ── Phase 2: "You saw it." (180–330) ──
  const p2Enter = interpolate(frame, [195, 225], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const p2Exit = interpolate(frame, [310, 340], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const youLine1Delay = 210
  const youLine2Delay = 250
  const youLine1Chars = Math.min(32, Math.max(0, Math.floor((frame - youLine1Delay) / 2)))
  const youLine2Chars = Math.min(40, Math.max(0, Math.floor((frame - youLine2Delay) / 2)))
  const cursorBlink = Math.floor(frame / 15) % 2 === 0

  // ── Phase 3: The stakes (330–480) ──
  const p3Enter = interpolate(frame, [340, 365], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const consequences = [
    { text: 'Report it?', delay: 350, color: COLORS.white, size: 36 },
    { text: 'Fired.', delay: 385, color: COLORS.danger },
    { text: 'Blacklisted.', delay: 400, color: COLORS.danger },
    { text: 'Sued.', delay: 415, color: COLORS.danger },
    { text: 'Endangered.', delay: 430, color: COLORS.danger },
  ]

  // Heartbeat pulse for phase 3
  const heartbeat = frame > 350
    ? 1 + Math.abs(Math.sin(frame * 0.15)) * 0.008
    : 1

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Vignette />

      {/* Phase 1: Document fragments floating in */}
      <div style={{ position: 'absolute', inset: 0, opacity: p1Exit }}>
        {docFragments.map((frag, i) => {
          const prog = spring({ frame: frame - frag.delay, fps, config: { damping: 22, stiffness: 120 } })
          const op = interpolate(prog, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' })
          const y = interpolate(prog, [0, 1], [15, 0])
          return (
            <div key={i} style={{
              position: 'absolute', left: frag.x, top: frag.y,
              opacity: op, transform: `translateY(${y}px)`,
              fontFamily: MONO, fontSize: frag.size, color: frag.color,
              letterSpacing: frag.color === COLORS.danger ? 3 : 1,
              textShadow: frag.color === COLORS.danger ? `0 0 20px ${COLORS.dangerDim}` : 'none',
            }}>
              {frag.text}
            </div>
          )
        })}

        {/* THE NUMBER — center screen, massive */}
        <div style={{
          position: 'absolute', left: '50%', top: '45%',
          transform: `translate(-50%, -50%) scale(${numScale * numPulse})`,
          opacity: numOp,
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: MONO, fontSize: 80, fontWeight: 700, color: COLORS.danger,
            textShadow: `0 0 40px ${COLORS.dangerDim}, 0 0 80px ${COLORS.dangerDim}`,
            letterSpacing: 4,
          }}>
            $47,200,000
          </div>
          <div style={{
            fontFamily: MONO, fontSize: 14, color: COLORS.muted, marginTop: 12,
            letterSpacing: 4,
          }}>
            UNACCOUNTED TRANSFER
          </div>
        </div>
      </div>

      {/* Phase 2: "You saw it." — typed out */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: p2Enter * p2Exit,
      }}>
        <div style={{
          fontFamily: MONO, fontSize: 42, color: COLORS.white, lineHeight: 1.6,
          textAlign: 'center',
        }}>
          <div>
            {'You saw something you weren\'t'.slice(0, youLine1Chars)}
            {youLine1Chars < 32 && <span style={{ color: COLORS.accent, opacity: cursorBlink ? 1 : 0 }}>_</span>}
          </div>
          {youLine1Chars >= 32 && (
            <div style={{ color: COLORS.accent }}>
              {'supposed to see.'.slice(0, youLine2Chars)}
              {youLine2Chars < 17 && <span style={{ opacity: cursorBlink ? 1 : 0 }}>_</span>}
            </div>
          )}
        </div>
      </div>

      {/* Phase 3: Consequences cascade */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: p3Enter,
        transform: `scale(${heartbeat})`,
      }}>
        {consequences.map((c, i) => {
          const prog = spring({ frame: frame - c.delay, fps, config: { damping: 14, stiffness: 180 } })
          const op = interpolate(prog, [0, 0.25], [0, 1], { extrapolateRight: 'clamp' })
          const x = i === 0 ? 0 : interpolate(prog, [0, 1], [i % 2 === 0 ? -30 : 30, 0])
          const isTitle = i === 0
          return (
            <div key={i} style={{
              opacity: op,
              transform: `translateX(${x}px)`,
              fontFamily: isTitle ? SANS : MONO,
              fontSize: c.size ?? 28,
              fontWeight: isTitle ? 700 : 600,
              color: c.color,
              marginBottom: isTitle ? 30 : 8,
              letterSpacing: isTitle ? 0 : 4,
              textShadow: !isTitle ? `0 0 15px ${COLORS.dangerDim}` : 'none',
            }}>
              {c.text}
            </div>
          )
        })}
      </div>

      <Scanlines />
      <Grain opacity={0.035} />
      <GlitchTransition startFrame={durationInFrames - 18} />
    </AbsoluteFill>
  )
}
