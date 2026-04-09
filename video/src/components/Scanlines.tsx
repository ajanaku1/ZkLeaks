import { useCurrentFrame } from 'remotion'

export const Scanlines: React.FC<{ opacity?: number }> = ({ opacity = 0.03 }) => {
  const frame = useCurrentFrame()
  const offset = (frame * 0.5) % 4

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 100,
      backgroundImage: `repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(255,255,255,${opacity}) 2px,
        rgba(255,255,255,${opacity}) 4px
      )`,
      backgroundPosition: `0 ${offset}px`,
    }} />
  )
}

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.04 }) => {
  const frame = useCurrentFrame()
  // Pseudo-random grain using frame-based offset
  const x = ((frame * 73) % 100)
  const y = ((frame * 137) % 100)

  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 99,
      opacity,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundPosition: `${x}px ${y}px`,
    }} />
  )
}

export const Vignette: React.FC = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 98,
    background: 'radial-gradient(ellipse at 50% 50%, transparent 50%, rgba(0,0,0,0.6) 100%)',
  }} />
)
