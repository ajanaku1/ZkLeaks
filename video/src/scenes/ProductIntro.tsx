import { useCurrentFrame, useVideoConfig, spring, interpolate, AbsoluteFill } from 'remotion'
import { COLORS } from '../constants'
import { MONO, SANS } from '../fonts'
import { Scanlines, Grain, Vignette } from '../components/Scanlines'
import { GlitchTransition } from '../components/GlitchTransition'

/**
 * Scene 3: THE ANSWER — Brand Reveal
 * zk//LEAKS materializes from darkness. Tagline types itself.
 * Three pillars of the protocol appear as terminal entries.
 */
export const ProductIntro: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // ── Logo entrance: starts dim, brightens with glow ──
  const logoDelay = 15
  const logoProg = spring({ frame: frame - logoDelay, fps, config: { damping: 14, stiffness: 80 } })
  const logoOp = interpolate(logoProg, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' })
  const logoScale = interpolate(logoProg, [0, 1], [0.96, 1])
  const glowIntensity = interpolate(frame, [logoDelay, logoDelay + 60, logoDelay + 90], [0, 1, 0.6], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  // ── Tagline types out ──
  const tagline = 'Expose the truth. Protect the source.'
  const tagDelay = 55
  const tagChars = Math.min(tagline.length, Math.max(0, Math.floor((frame - tagDelay) / 2)))
  const cursorBlink = Math.floor(frame / 15) % 2 === 0

  // ── Separator line draws ──
  const lineWidth = interpolate(frame, [100, 140], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // ── Protocol pillars ──
  const pillars = [
    {
      cmd: '$ zkleaks --verify-membership',
      label: 'ZERO-KNOWLEDGE PROOF',
      desc: 'Prove you belong to the organization.\nThe chain sees proof, never identity.',
    },
    {
      cmd: '$ zkleaks --check-nullifier',
      label: 'ANTI-SPAM NULLIFIERS',
      desc: 'Each insider reports once per topic.\nCryptographic prevention, not policy.',
    },
    {
      cmd: '$ zkleaks --corroborate',
      label: 'ANONYMOUS CORROBORATION',
      desc: 'Others vouch for your report.\nCredibility grows. Anonymity stays.',
    },
  ]

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 30%, #1a1208 0%, ${COLORS.bg} 60%)`,
    }}>
      <Vignette />

      {/* Logo */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 160,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: logoOp, transform: `scale(${logoScale})`,
      }}>
        <div style={{
          fontFamily: MONO, fontSize: 72, fontWeight: 700, color: COLORS.accent,
          letterSpacing: 6,
          textShadow: `0 0 ${40 * glowIntensity}px ${COLORS.accentGlow}, 0 0 ${80 * glowIntensity}px ${COLORS.accentDim}`,
        }}>
          zk<span style={{ color: COLORS.muted }}>//</span>LEAKS
        </div>

        {/* Tagline */}
        <div style={{
          fontFamily: SANS, fontSize: 24, color: COLORS.textSecondary, marginTop: 16,
          minHeight: 32,
        }}>
          {tagline.slice(0, tagChars)}
          {tagChars < tagline.length && (
            <span style={{ color: COLORS.accent, opacity: cursorBlink ? 1 : 0 }}>_</span>
          )}
        </div>

        {/* Subtitle */}
        <div style={{
          fontFamily: MONO, fontSize: 13, color: COLORS.muted, marginTop: 8,
          letterSpacing: 3,
          opacity: interpolate(frame, [95, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          ANONYMOUS WHISTLEBLOWING ON ALEO
        </div>
      </div>

      {/* Separator */}
      <div style={{
        position: 'absolute', left: '50%', top: 360,
        transform: 'translateX(-50%)',
        width: `${lineWidth * 5}px`, maxWidth: 500, height: 1,
        background: `linear-gradient(90deg, transparent, ${COLORS.accent}, transparent)`,
      }} />

      {/* Protocol pillars */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 100,
        display: 'flex', justifyContent: 'center', gap: 30,
        padding: '0 100px',
      }}>
        {pillars.map((p, i) => {
          const enter = 130 + i * 45
          const prog = spring({ frame: frame - enter, fps, config: { damping: 18, stiffness: 130 } })
          const op = interpolate(prog, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' })
          const y = interpolate(prog, [0, 1], [25, 0])

          // Terminal command types out
          const cmdChars = Math.min(p.cmd.length, Math.max(0, Math.floor((frame - enter - 10) / 1.5)))

          return (
            <div key={i} style={{
              flex: 1, opacity: op, transform: `translateY(${y}px)`,
              border: `1px solid ${COLORS.border}`, background: COLORS.bgCard,
              padding: 0, maxWidth: 420, overflow: 'hidden',
            }}>
              {/* Terminal header bar */}
              <div style={{
                padding: '10px 16px', borderBottom: `1px solid ${COLORS.border}`,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: COLORS.danger, opacity: 0.7 }} />
                <div style={{ width: 8, height: 8, borderRadius: 4, background: COLORS.warning, opacity: 0.7 }} />
                <div style={{ width: 8, height: 8, borderRadius: 4, background: COLORS.success, opacity: 0.7 }} />
              </div>

              {/* Command */}
              <div style={{
                padding: '14px 16px 8px', fontFamily: MONO, fontSize: 13, color: COLORS.accent,
              }}>
                {p.cmd.slice(0, cmdChars)}
              </div>

              {/* Label + description */}
              <div style={{ padding: '0 16px 20px' }}>
                <div style={{
                  fontFamily: MONO, fontSize: 11, color: COLORS.accent, letterSpacing: 3,
                  marginBottom: 10,
                  opacity: interpolate(frame, [enter + 30, enter + 45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                }}>
                  {p.label}
                </div>
                <div style={{
                  fontFamily: SANS, fontSize: 15, color: COLORS.offWhite, lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                  opacity: interpolate(frame, [enter + 40, enter + 55], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                }}>
                  {p.desc}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Scanlines opacity={0.025} />
      <Grain opacity={0.03} />
      <GlitchTransition startFrame={durationInFrames - 18} />
    </AbsoluteFill>
  )
}
