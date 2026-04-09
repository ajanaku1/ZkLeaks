import { useCurrentFrame, useVideoConfig, spring, interpolate, AbsoluteFill } from 'remotion'
import { COLORS } from '../constants'
import { MONO, SANS } from '../fonts'
import { Scanlines, Grain, Vignette } from '../components/Scanlines'
import { GlitchTransition } from '../components/GlitchTransition'

/**
 * Scene 6: THE ARCHITECTURE — Under the Hood
 * Shows what runs client-side vs on-chain, with animated
 * data flow between them.
 */
export const ArchFlash: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps, durationInFrames } = useVideoConfig()

  const titleProg = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 160 } })
  const titleOp = interpolate(titleProg, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' })

  const leftItems = [
    { name: 'Leo Wallet', desc: 'ZK proof generation, private key custody', delay: 30 },
    { name: 'React + TypeScript', desc: 'Terminal-aesthetic UI, report submission', delay: 50 },
    { name: 'IndexedDB', desc: 'Encrypted report body storage (IPFS-ready)', delay: 70 },
  ]

  const rightItems = [
    { name: 'zkleaks_v2.aleo', desc: 'Leo smart contract, 6 transitions', delay: 110 },
    { name: 'BHP256 Hashing', desc: 'Commitments, nullifiers, content hashes', delay: 130 },
    { name: 'Aleo Testnet', desc: 'Decentralized verification layer', delay: 150 },
  ]

  // Arrow animation
  const arrowDelay = 90
  const arrowProg = spring({ frame: frame - arrowDelay, fps, config: { damping: 14, stiffness: 120 } })
  const arrowOp = interpolate(arrowProg, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' })
  // Pulsing glow on the arrow
  const arrowGlow = frame > arrowDelay + 30
    ? 0.4 + Math.sin(frame * 0.08) * 0.3
    : 0

  // Data flow particles (dots moving from left to right)
  const showParticles = frame > arrowDelay + 20
  const particlePositions = [0, 1, 2].map(i => {
    const period = 40 // frames per cycle
    const offset = i * 13
    const progress = ((frame - arrowDelay + offset) % period) / period
    return progress
  })

  // Bottom summary
  const summaryOp = interpolate(frame, [200, 230], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })

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
          // ARCHITECTURE
        </div>
        <div style={{ fontFamily: SANS, fontSize: 40, fontWeight: 700, color: COLORS.white }}>
          Built on Aleo
        </div>
      </div>

      {/* Architecture diagram */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 230,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0,
        padding: '0 120px',
      }}>
        {/* CLIENT SIDE */}
        <div style={{ width: 380 }}>
          <div style={{
            fontFamily: MONO, fontSize: 11, color: COLORS.accent, letterSpacing: 4,
            textAlign: 'center', marginBottom: 16,
            opacity: interpolate(frame, [20, 35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}>
            CLIENT SIDE
          </div>
          {leftItems.map((item, i) => {
            const prog = spring({ frame: frame - item.delay, fps, config: { damping: 18, stiffness: 130 } })
            const op = interpolate(prog, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' })
            const x = interpolate(prog, [0, 1], [-25, 0])
            return (
              <div key={i} style={{
                opacity: op, transform: `translateX(${x}px)`,
                border: `1px solid ${COLORS.border}`, background: COLORS.bgCard,
                padding: '16px 20px', marginBottom: 12,
              }}>
                <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, color: COLORS.white }}>{item.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{item.desc}</div>
              </div>
            )
          })}
        </div>

        {/* CENTER ARROW */}
        <div style={{
          width: 200, opacity: arrowOp,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          position: 'relative',
        }}>
          <div style={{
            fontFamily: MONO, fontSize: 13, fontWeight: 700, color: COLORS.accent,
            letterSpacing: 2,
            textShadow: `0 0 ${20 * arrowGlow}px ${COLORS.accentGlow}`,
          }}>
            ZK PROOF
          </div>

          {/* Arrow line with particles */}
          <div style={{ position: 'relative', width: '100%', height: 20 }}>
            <div style={{
              position: 'absolute', left: 20, right: 20, top: 9,
              height: 2, background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.success})`,
            }} />
            {/* Moving particles */}
            {showParticles && particlePositions.map((pos, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: `${20 + pos * 140}px`,
                top: 6,
                width: 8, height: 8, borderRadius: 4,
                background: COLORS.accent,
                boxShadow: `0 0 10px ${COLORS.accentGlow}`,
                opacity: 0.8,
              }} />
            ))}
            {/* Arrow head */}
            <div style={{
              position: 'absolute', right: 14, top: 3,
              width: 0, height: 0,
              borderTop: '7px solid transparent',
              borderBottom: '7px solid transparent',
              borderLeft: `10px solid ${COLORS.success}`,
            }} />
          </div>

          <div style={{
            fontFamily: MONO, fontSize: 11, color: COLORS.muted, letterSpacing: 1,
          }}>
            verified on-chain
          </div>
        </div>

        {/* ON-CHAIN SIDE */}
        <div style={{ width: 380 }}>
          <div style={{
            fontFamily: MONO, fontSize: 11, color: COLORS.success, letterSpacing: 4,
            textAlign: 'center', marginBottom: 16,
            opacity: interpolate(frame, [100, 115], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          }}>
            ON-CHAIN
          </div>
          {rightItems.map((item, i) => {
            const prog = spring({ frame: frame - item.delay, fps, config: { damping: 18, stiffness: 130 } })
            const op = interpolate(prog, [0, 0.35], [0, 1], { extrapolateRight: 'clamp' })
            const x = interpolate(prog, [0, 1], [25, 0])
            return (
              <div key={i} style={{
                opacity: op, transform: `translateX(${x}px)`,
                border: `1px solid ${COLORS.border}`, background: COLORS.bgCard,
                padding: '16px 20px', marginBottom: 12,
              }}>
                <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, color: COLORS.white }}>{item.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: COLORS.muted, marginTop: 4 }}>{item.desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom summary */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 80,
        display: 'flex', justifyContent: 'center', gap: 50,
        opacity: summaryOp,
      }}>
        {[
          { label: 'LANGUAGE', value: 'Leo', color: COLORS.accent },
          { label: 'HASH', value: 'BHP256', color: COLORS.accent },
          { label: 'PRIVACY', value: 'Full ZK', color: COLORS.success },
          { label: 'NETWORK', value: 'Aleo Testnet', color: COLORS.accent },
        ].map((item, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: MONO, fontSize: 10, color: COLORS.muted, letterSpacing: 3, marginBottom: 4 }}>
              {item.label}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 600, color: item.color }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <Scanlines opacity={0.02} />
      <Grain opacity={0.025} />
      <GlitchTransition startFrame={durationInFrames - 18} />
    </AbsoluteFill>
  )
}
