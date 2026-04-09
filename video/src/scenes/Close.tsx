import { useCurrentFrame, useVideoConfig, spring, interpolate, AbsoluteFill } from 'remotion'
import { COLORS } from '../constants'
import { MONO, SANS } from '../fonts'
import { Scanlines, Grain, Vignette } from '../components/Scanlines'

/**
 * Scene 7: THE OUTCOME + CTA
 * Phase 1: "The fraud was exposed. The insider was never identified."
 *          Network stats with animated counters. "0 identities leaked" glows green.
 * Phase 2: Final CTA with corner brackets, dramatic logo, tech badges.
 */
export const Close: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // ── Phase 1: The Outcome (0–420) ──
  const phase1Op = interpolate(frame, [0, 15, 390, 430], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  // Outcome text — typed out
  const outcomeLine1 = 'The fraud was exposed.'
  const outcomeLine2 = 'The insider was never identified.'
  const o1Chars = Math.min(outcomeLine1.length, Math.max(0, Math.floor((frame - 15) / 2.5)))
  const o2Chars = Math.min(outcomeLine2.length, Math.max(0, Math.floor((frame - 75) / 2)))
  const cursorBlink = Math.floor(frame / 15) % 2 === 0

  // Stats
  const statsData = [
    { label: 'REPORTS FILED', value: 47, color: COLORS.accent },
    { label: 'ORGANIZATIONS', value: 12, color: COLORS.accent },
    { label: 'CORROBORATIONS', value: 156, color: COLORS.accent },
    { label: 'IDENTITIES LEAKED', value: 0, color: COLORS.success },
  ]

  // Pending indicator pulse
  const pendingPulse = Math.sin(frame * 0.1) * 0.5 + 0.5

  // ── Phase 2: CTA (430–700) ──
  const phase2Op = interpolate(frame, [430, 460], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  const ctaLogoProg = spring({ frame: frame - 445, fps, config: { damping: 12, stiffness: 80 } })
  const ctaLogoOp = interpolate(ctaLogoProg, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' })
  const ctaLogoScale = interpolate(ctaLogoProg, [0, 1], [0.95, 1])
  const ctaGlow = frame > 445
    ? 0.4 + Math.sin((frame - 445) * 0.04) * 0.2
    : 0

  const tagProg = spring({ frame: frame - 480, fps, config: { damping: 18, stiffness: 140 } })
  const tagOp = interpolate(tagProg, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' })

  const subProg = spring({ frame: frame - 510, fps, config: { damping: 18, stiffness: 140 } })
  const subOp = interpolate(subProg, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' })

  const badgeProg = spring({ frame: frame - 540, fps, config: { damping: 16, stiffness: 140 } })
  const badgeOp = interpolate(badgeProg, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' })

  // Corner brackets
  const cornerOp = interpolate(frame, [450, 470], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const corner = (extra: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute' as const, width: 50, height: 50, opacity: cornerOp, ...extra,
  })

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 40%, #1a1208 0%, ${COLORS.bg} 60%)`,
    }}>
      <Vignette />

      {/* Phase 1: The Outcome */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: phase1Op, padding: 80,
      }}>
        {/* Typed outcome text */}
        <div style={{
          fontFamily: MONO, fontSize: 36, textAlign: 'center', lineHeight: 1.6, marginBottom: 50,
        }}>
          <div style={{ color: COLORS.white }}>
            {outcomeLine1.slice(0, o1Chars)}
            {o1Chars < outcomeLine1.length && frame > 15 && (
              <span style={{ color: COLORS.accent, opacity: cursorBlink ? 1 : 0 }}>_</span>
            )}
          </div>
          {o1Chars >= outcomeLine1.length && (
            <div style={{ color: COLORS.success, marginTop: 4 }}>
              {outcomeLine2.slice(0, o2Chars)}
              {o2Chars < outcomeLine2.length && (
                <span style={{ opacity: cursorBlink ? 1 : 0 }}>_</span>
              )}
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div style={{ display: 'flex', gap: 30 }}>
          {statsData.map((stat, i) => {
            const enter = 150 + i * 25
            const prog = spring({ frame: frame - enter, fps, config: { damping: 16, stiffness: 140 } })
            const op = interpolate(prog, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' })
            const y = interpolate(prog, [0, 1], [15, 0])

            const countFrame = Math.max(0, frame - enter - 8)
            const countProg = Math.min(1, countFrame / 35)
            const displayVal = Math.round(stat.value * countProg)
            const isZero = stat.value === 0

            return (
              <div key={i} style={{
                opacity: op, transform: `translateY(${y}px)`,
                width: 210, padding: '28px 20px', textAlign: 'center',
                border: `1px solid ${isZero ? COLORS.success : COLORS.border}`,
                background: isZero ? 'rgba(0,204,102,0.05)' : COLORS.bgCard,
                boxShadow: isZero ? `0 0 25px rgba(0,204,102,0.15)` : 'none',
              }}>
                <div style={{
                  fontFamily: MONO, fontSize: 44, fontWeight: 700, color: stat.color,
                  textShadow: isZero ? `0 0 20px ${COLORS.success}` : 'none',
                }}>
                  {displayVal}
                </div>
                <div style={{
                  fontFamily: MONO, fontSize: 10, color: COLORS.muted, marginTop: 8,
                  letterSpacing: 2,
                }}>
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>

        {/* Live indicator */}
        <div style={{
          marginTop: 35, display: 'flex', alignItems: 'center', gap: 10,
          opacity: interpolate(frame, [280, 300], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: 4, background: COLORS.success,
            opacity: pendingPulse,
            boxShadow: `0 0 8px ${COLORS.success}`,
          }} />
          <span style={{ fontFamily: MONO, fontSize: 13, color: COLORS.success }}>
            3 new reports pending verification...
          </span>
        </div>
      </div>

      {/* Phase 2: CTA */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: phase2Op, padding: 80,
      }}>
        {/* Corner brackets */}
        <div style={corner({ top: 60, left: 60, borderTop: `3px solid ${COLORS.accent}`, borderLeft: `3px solid ${COLORS.accent}` })} />
        <div style={corner({ top: 60, right: 60, borderTop: `3px solid ${COLORS.accent}`, borderRight: `3px solid ${COLORS.accent}` })} />
        <div style={corner({ bottom: 60, left: 60, borderBottom: `3px solid ${COLORS.accent}`, borderLeft: `3px solid ${COLORS.accent}` })} />
        <div style={corner({ bottom: 60, right: 60, borderBottom: `3px solid ${COLORS.accent}`, borderRight: `3px solid ${COLORS.accent}` })} />

        {/* Logo */}
        <div style={{
          opacity: ctaLogoOp, transform: `scale(${ctaLogoScale})`,
          fontFamily: MONO, fontSize: 80, fontWeight: 700, color: COLORS.accent,
          letterSpacing: 8,
          textShadow: `0 0 ${60 * ctaGlow}px ${COLORS.accentGlow}, 0 0 ${120 * ctaGlow}px ${COLORS.accentDim}`,
          marginBottom: 20,
        }}>
          zk<span style={{ color: COLORS.muted }}>//</span>LEAKS
        </div>

        {/* Tagline */}
        <div style={{
          opacity: tagOp,
          fontFamily: SANS, fontSize: 30, fontWeight: 600, color: COLORS.white, marginBottom: 10,
        }}>
          Expose the truth. Protect the source.
        </div>

        {/* Subtitle */}
        <div style={{
          opacity: subOp,
          fontFamily: SANS, fontSize: 18, color: COLORS.muted, marginBottom: 40,
        }}>
          Zero-knowledge whistleblowing on Aleo
        </div>

        {/* Separator */}
        <div style={{
          width: 300, height: 1, marginBottom: 30,
          background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
          opacity: badgeOp,
        }} />

        {/* Tech badges */}
        <div style={{ opacity: badgeOp, display: 'flex', gap: 14 }}>
          {['Aleo Blockchain', 'Leo Language', 'Zero-Knowledge Proofs', 'React + TypeScript'].map((tech, i) => (
            <div key={i} style={{
              fontFamily: MONO, fontSize: 11, color: COLORS.accent,
              padding: '7px 14px', border: `1px solid ${COLORS.accent}`,
              letterSpacing: 1,
            }}>
              {tech}
            </div>
          ))}
        </div>

        {/* Built on Aleo */}
        <div style={{
          opacity: badgeOp, marginTop: 30,
          fontFamily: MONO, fontSize: 13, color: COLORS.muted, letterSpacing: 3,
        }}>
          BUILT ON ALEO
        </div>
      </div>

      <Scanlines opacity={0.02} />
      <Grain opacity={0.03} />
    </AbsoluteFill>
  )
}
