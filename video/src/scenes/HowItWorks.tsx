import { useCurrentFrame, useVideoConfig, spring, interpolate, AbsoluteFill } from 'remotion'
import { COLORS } from '../constants'
import { MONO, SANS } from '../fonts'
import { Scanlines, Grain, Vignette } from '../components/Scanlines'
import { GlitchTransition } from '../components/GlitchTransition'

/**
 * Scene 5: THE PROTOCOL — How Zero-Knowledge Proves Everything
 * Each step connects to the last with animated flow lines.
 * Steps build left-to-right with connection arrows drawing between them.
 */
export const HowItWorks: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const titleProg = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 160 } })
  const titleOp = interpolate(titleProg, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' })

  const steps = [
    {
      num: '01',
      title: 'Organization Registers',
      detail: 'Admin deploys org on Aleo.\nMerkle tree of member\ncommitments is created.',
      icon: '{ORG}',
      color: COLORS.accent,
    },
    {
      num: '02',
      title: 'Members Get Tokens',
      detail: 'Each insider receives a private\nMembershipToken. It lives in\ntheir wallet — never on-chain.',
      icon: '{KEY}',
      color: COLORS.accent,
    },
    {
      num: '03',
      title: 'ZK Proof Generated',
      detail: 'Wallet proves: "I have a valid\ntoken for this org" without\nrevealing WHICH member.',
      icon: '{ZK}',
      color: COLORS.success,
    },
    {
      num: '04',
      title: 'Report Verified',
      detail: 'Contract checks the proof.\nNullifier stored to prevent\nduplicates. Report goes live.',
      icon: '{TX}',
      color: COLORS.success,
    },
  ]

  // Bottom insight text
  const insightOp = interpolate(frame, [340, 370], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const insightChars = Math.min(52, Math.max(0, Math.floor((frame - 350) / 1.5)))
  const insightText = 'The chain knows what was said. Never who said it.'

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Vignette />

      {/* Title */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 80,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        opacity: titleOp,
      }}>
        <div style={{ fontFamily: MONO, fontSize: 12, color: COLORS.muted, letterSpacing: 4, marginBottom: 6 }}>
          // PROTOCOL
        </div>
        <div style={{ fontFamily: SANS, fontSize: 40, fontWeight: 700, color: COLORS.white }}>
          Four steps. Zero identity leaks.
        </div>
      </div>

      {/* Steps */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 240,
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 0,
        padding: '0 80px',
      }}>
        {steps.map((step, i) => {
          const enter = 50 + i * 65
          const prog = spring({ frame: frame - enter, fps, config: { damping: 16, stiffness: 120 } })
          const op = interpolate(prog, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' })
          const y = interpolate(prog, [0, 1], [30, 0])

          // Connection line to next step
          const lineEnter = enter + 45
          const lineWidth = interpolate(frame, [lineEnter, lineEnter + 25], [0, 100], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
          })

          // Number highlight pulse
          const numGlow = frame > enter + 20
            ? 0.3 + Math.sin((frame - enter) * 0.06) * 0.15
            : 0

          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                opacity: op, transform: `translateY(${y}px)`,
                width: 300, position: 'relative',
              }}>
                {/* Step number — large, glowing */}
                <div style={{
                  fontFamily: MONO, fontSize: 64, fontWeight: 700,
                  color: step.color,
                  opacity: 0.15 + numGlow,
                  position: 'absolute', top: -20, right: 10,
                  textShadow: `0 0 30px ${step.color}`,
                }}>
                  {step.num}
                </div>

                {/* Card */}
                <div style={{
                  border: `1px solid ${COLORS.border}`, background: COLORS.bgCard,
                  padding: 24, position: 'relative', zIndex: 1,
                }}>
                  {/* Icon badge */}
                  <div style={{
                    fontFamily: MONO, fontSize: 14, color: step.color,
                    marginBottom: 12, letterSpacing: 2,
                  }}>
                    {step.icon}
                  </div>

                  <div style={{
                    fontFamily: SANS, fontSize: 18, fontWeight: 600, color: COLORS.white,
                    marginBottom: 10,
                  }}>
                    {step.title}
                  </div>

                  <div style={{
                    fontFamily: MONO, fontSize: 12, color: COLORS.textSecondary,
                    lineHeight: 1.8, whiteSpace: 'pre-line',
                  }}>
                    {step.detail}
                  </div>
                </div>
              </div>

              {/* Connection arrow */}
              {i < steps.length - 1 && (
                <div style={{
                  width: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', height: 200,
                }}>
                  {/* Line */}
                  <div style={{
                    position: 'absolute', left: 8, right: 8, top: '50%',
                    height: 2,
                    background: `linear-gradient(90deg, ${step.color}, transparent)`,
                    transform: 'translateY(-50%)',
                    width: `${lineWidth}%`,
                  }} />
                  {/* Arrow head */}
                  <div style={{
                    position: 'absolute', right: 4, top: '50%',
                    transform: 'translateY(-50%)',
                    fontFamily: MONO, fontSize: 20, color: step.color,
                    opacity: interpolate(frame, [lineEnter + 15, lineEnter + 25], [0, 1], {
                      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                    }),
                  }}>
                    {'\u203A'}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom insight — typed out */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 100,
        display: 'flex', justifyContent: 'center',
        opacity: insightOp,
      }}>
        <div style={{
          fontFamily: MONO, fontSize: 22, color: COLORS.accent,
          padding: '16px 32px',
          borderTop: `1px solid ${COLORS.border}`,
          borderBottom: `1px solid ${COLORS.border}`,
          letterSpacing: 1,
        }}>
          {insightText.slice(0, insightChars)}
          {insightChars < insightText.length && (
            <span style={{ opacity: Math.floor(frame / 12) % 2 === 0 ? 1 : 0 }}>_</span>
          )}
        </div>
      </div>

      <Scanlines opacity={0.02} />
      <Grain opacity={0.025} />
      <GlitchTransition startFrame={durationInFrames - 18} />
    </AbsoluteFill>
  )
}
