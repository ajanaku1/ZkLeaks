import { useCurrentFrame, useVideoConfig, spring, interpolate, AbsoluteFill } from 'remotion'
import { COLORS } from '../constants'
import { MONO, SANS } from '../fonts'
import { Scanlines, Grain, Vignette } from '../components/Scanlines'
import { GlitchTransition } from '../components/GlitchTransition'

/**
 * Scene 4: THE PROOF — Watch it Happen
 * We follow Employee #4721 submitting their report in real-time.
 * Full terminal simulation of ZK proof generation, then the report
 * appearing in the public feed with a "ZK VERIFIED" badge.
 */
export const FeatureShowcase: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  // ── Phase 1: Terminal proof generation (0–360) ──
  const termLines = [
    { delay: 20, prefix: '>', text: 'Connecting to Leo Wallet...', color: COLORS.muted },
    { delay: 45, prefix: '[OK]', text: 'Wallet connected: aleo1qg...7xkm', color: COLORS.success, prefixColor: COLORS.success },
    { delay: 70, prefix: '>', text: 'Loading MembershipToken for org: MegaCorp Holdings', color: COLORS.offWhite },
    { delay: 100, prefix: '[OK]', text: 'Token found. Commitment verified.', color: COLORS.success, prefixColor: COLORS.success },
    { delay: 120, prefix: '', text: '', color: COLORS.bg }, // spacer
    { delay: 125, prefix: '>', text: 'Preparing report submission...', color: COLORS.offWhite },
    { delay: 140, prefix: '   ', text: 'Title: "Hidden Liability Fund — $47M Discrepancy"', color: COLORS.accent },
    { delay: 155, prefix: '   ', text: 'Category: Financial Fraud', color: COLORS.offWhite },
    { delay: 165, prefix: '   ', text: 'Severity: CRITICAL', color: COLORS.danger },
    { delay: 180, prefix: '', text: '', color: COLORS.bg }, // spacer
    { delay: 185, prefix: '>', text: 'Generating zero-knowledge proof...', color: COLORS.accent },
    { delay: 200, prefix: '   ', text: 'Computing nullifier = BHP256::hash(secret, nonce)', color: COLORS.muted },
    { delay: 220, prefix: '   ', text: 'Building membership witness...', color: COLORS.muted },
    { delay: 245, prefix: '   ', text: 'Constructing zk-SNARK circuit...', color: COLORS.muted },
    { delay: 275, prefix: '[ZK]', text: 'Proof generated. 0 bits of identity revealed.', color: COLORS.accent, prefixColor: COLORS.accent },
    { delay: 300, prefix: '', text: '', color: COLORS.bg }, // spacer
    { delay: 305, prefix: '>', text: 'Broadcasting to Aleo testnet...', color: COLORS.offWhite },
    { delay: 330, prefix: '[TX]', text: 'at108shm...9swfwjzv — CONFIRMED', color: COLORS.success, prefixColor: COLORS.success },
  ]

  // Progress bar during proof generation (frames 185–275)
  const proofProgress = interpolate(frame, [185, 275], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const showProgress = frame >= 185 && frame <= 285

  const phase1Op = interpolate(frame, [0, 10, 340, 370], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  })

  // ── Phase 2: Report appears in feed (370–630) ──
  const phase2Op = interpolate(frame, [370, 400], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

  // The submitted report card animates in dramatically
  const reportProg = spring({ frame: frame - 400, fps, config: { damping: 14, stiffness: 100 } })
  const reportOp = interpolate(reportProg, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' })
  const reportScale = interpolate(reportProg, [0, 1], [0.95, 1])

  // "ZK VERIFIED" badge stamps on
  const badgeDelay = 440
  const badgeProg = spring({ frame: frame - badgeDelay, fps, config: { damping: 10, stiffness: 200 } })
  const badgeScale = interpolate(badgeProg, [0, 1], [1.8, 1])
  const badgeOp = interpolate(badgeProg, [0, 0.2], [0, 1], { extrapolateRight: 'clamp' })

  // Corroboration counter ticks up
  const corrStart = 480
  const corrValue = Math.min(12, Math.max(0, Math.floor((frame - corrStart) / 8)))

  // Additional reports slide in from below
  const otherReports = [
    { id: 'RPT-0x4c1e', title: 'Falsified Safety Inspections', org: 'NexGen Manufacturing', severity: 'HIGH', corr: 7 },
    { id: 'RPT-0x9b2d', title: 'Board Insider Trading Ring', org: 'Apex Financial Group', severity: 'CRITICAL', corr: 12 },
  ]

  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Vignette />

      {/* Phase 1: Terminal */}
      <div style={{
        position: 'absolute', inset: 0, opacity: phase1Op,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 60,
      }}>
        {/* Scene label */}
        <div style={{
          fontFamily: MONO, fontSize: 12, color: COLORS.muted, letterSpacing: 4,
          marginBottom: 6,
          opacity: interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          EMPLOYEE #4721 SUBMITS A REPORT
        </div>
        <div style={{
          fontFamily: SANS, fontSize: 32, fontWeight: 700, color: COLORS.white, marginBottom: 30,
          opacity: interpolate(frame, [8, 18], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        }}>
          Watch the proof happen
        </div>

        {/* Terminal window */}
        <div style={{
          width: 1000, background: '#050505', border: `1px solid ${COLORS.border}`,
          overflow: 'hidden',
        }}>
          {/* Title bar */}
          <div style={{
            padding: '10px 16px', borderBottom: `1px solid ${COLORS.border}`,
            display: 'flex', alignItems: 'center', gap: 6, background: COLORS.bgCard,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: 5, background: COLORS.danger, opacity: 0.8 }} />
            <div style={{ width: 10, height: 10, borderRadius: 5, background: COLORS.warning, opacity: 0.8 }} />
            <div style={{ width: 10, height: 10, borderRadius: 5, background: COLORS.success, opacity: 0.8 }} />
            <span style={{ fontFamily: MONO, fontSize: 12, color: COLORS.muted, marginLeft: 12 }}>
              zkleaks-cli v2 — submit_report
            </span>
          </div>

          {/* Terminal body */}
          <div style={{ padding: '16px 20px', fontFamily: MONO, fontSize: 15, lineHeight: 1.9 }}>
            {termLines.map((line, i) => {
              const elapsed = frame - line.delay
              if (elapsed < 0) return null
              const chars = Math.min(line.text.length, Math.floor(elapsed / 1.2))
              if (!line.text) return <div key={i} style={{ height: 8 }} />
              return (
                <div key={i} style={{ display: 'flex', gap: 10, color: line.color }}>
                  <span style={{ color: line.prefixColor ?? COLORS.muted, flexShrink: 0, minWidth: 36 }}>
                    {line.prefix}
                  </span>
                  <span>{line.text.slice(0, chars)}</span>
                </div>
              )
            })}

            {/* Progress bar */}
            {showProgress && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: COLORS.muted, fontSize: 12 }}>PROVING</span>
                <div style={{ flex: 1, height: 4, background: COLORS.border, overflow: 'hidden' }}>
                  <div style={{
                    width: `${proofProgress}%`, height: '100%',
                    background: `linear-gradient(90deg, ${COLORS.accentDim}, ${COLORS.accent})`,
                    transition: 'none',
                  }} />
                </div>
                <span style={{ color: COLORS.accent, fontSize: 12, fontFamily: MONO }}>
                  {Math.round(proofProgress)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Phase 2: Feed */}
      <div style={{
        position: 'absolute', inset: 0, opacity: phase2Op,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 60,
      }}>
        <div style={{
          fontFamily: MONO, fontSize: 12, color: COLORS.success, letterSpacing: 4, marginBottom: 6,
        }}>
          REPORT PUBLISHED
        </div>
        <div style={{
          fontFamily: SANS, fontSize: 32, fontWeight: 700, color: COLORS.white, marginBottom: 30,
        }}>
          Now live on the public feed
        </div>

        {/* Main report card — the one just submitted */}
        <div style={{
          width: 900, opacity: reportOp, transform: `scale(${reportScale})`,
          background: COLORS.bgCard, border: `1px solid ${COLORS.accent}`,
          padding: '28px 32px', marginBottom: 16,
          boxShadow: `0 0 30px ${COLORS.accentDim}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            {/* Severity bar */}
            <div style={{ width: 4, height: 80, background: COLORS.danger, borderRadius: 2, flexShrink: 0 }} />

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 12, color: COLORS.muted }}>RPT-0x7a3f</span>
                <span style={{
                  fontFamily: MONO, fontSize: 11, color: COLORS.danger,
                  padding: '2px 8px', border: `1px solid ${COLORS.danger}`,
                }}>CRITICAL</span>

                {/* ZK VERIFIED badge — stamps on */}
                <span style={{
                  fontFamily: MONO, fontSize: 11, fontWeight: 700, color: COLORS.success,
                  padding: '3px 10px', border: `2px solid ${COLORS.success}`,
                  opacity: badgeOp, transform: `scale(${badgeScale})`,
                  display: 'inline-block',
                  textShadow: `0 0 10px ${COLORS.success}`,
                  boxShadow: badgeOp > 0.5 ? `0 0 15px rgba(0,204,102,0.3)` : 'none',
                }}>
                  ZK VERIFIED
                </span>
              </div>

              <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 600, color: COLORS.white }}>
                Hidden Liability Fund — $47M Discrepancy
              </div>
              <div style={{ fontFamily: MONO, fontSize: 13, color: COLORS.muted, marginTop: 6 }}>
                MegaCorp Holdings / Financial Fraud / 2 minutes ago
              </div>
              <div style={{ fontFamily: SANS, fontSize: 15, color: COLORS.textSecondary, marginTop: 10, lineHeight: 1.5 }}>
                Internal audit reveals $47.2M transferred to undisclosed offshore entity.
                Transaction authorized outside standard approval chain...
              </div>
            </div>

            {/* Corroboration counter */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontFamily: MONO, fontSize: 36, fontWeight: 700, color: COLORS.success }}>
                {corrValue}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: COLORS.muted, letterSpacing: 1 }}>
                CORROBORATIONS
              </div>
            </div>
          </div>

          {/* Proof metadata strip */}
          <div style={{
            marginTop: 16, paddingTop: 12, borderTop: `1px solid ${COLORS.border}`,
            display: 'flex', gap: 24,
            opacity: interpolate(frame, [460, 475], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}>
            {[
              { label: 'PROOF ID', value: 'prf_8f2a...c41d' },
              { label: 'PROGRAM', value: 'zkleaks_v2.aleo' },
              { label: 'NULLIFIER', value: '0x7a3f...92b1' },
              { label: 'IDENTITY', value: 'UNKNOWN' },
            ].map((m, i) => (
              <div key={i}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: COLORS.muted, letterSpacing: 2 }}>{m.label}</div>
                <div style={{
                  fontFamily: MONO, fontSize: 13, marginTop: 2,
                  color: m.value === 'UNKNOWN' ? COLORS.success : COLORS.offWhite,
                  fontWeight: m.value === 'UNKNOWN' ? 700 : 400,
                }}>
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other reports slide in */}
        {otherReports.map((r, i) => {
          const enter = 520 + i * 35
          const prog = spring({ frame: frame - enter, fps, config: { damping: 18, stiffness: 140 } })
          const op = interpolate(prog, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' })
          const y = interpolate(prog, [0, 1], [20, 0])
          const sevColor = r.severity === 'CRITICAL' ? COLORS.danger : COLORS.warning

          return (
            <div key={i} style={{
              width: 900, opacity: op * 0.6, transform: `translateY(${y}px)`,
              background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
              padding: '18px 32px', marginBottom: 8,
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{ width: 3, height: 40, background: sevColor, borderRadius: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: COLORS.muted }}>{r.id}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: sevColor, padding: '1px 6px', border: `1px solid ${sevColor}` }}>{r.severity}</span>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: COLORS.success, padding: '1px 6px', border: `1px solid ${COLORS.success}` }}>ZK VERIFIED</span>
                </div>
                <div style={{ fontFamily: SANS, fontSize: 16, color: COLORS.offWhite }}>{r.title}</div>
              </div>
              <div style={{ fontFamily: MONO, fontSize: 13, color: COLORS.muted }}>{r.corr} corroborations</div>
            </div>
          )
        })}
      </div>

      <Scanlines opacity={0.02} />
      <Grain opacity={0.025} />
      <GlitchTransition startFrame={durationInFrames - 18} />
    </AbsoluteFill>
  )
}
