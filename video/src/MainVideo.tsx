import { AbsoluteFill, Series } from 'remotion'
import { COLORS } from './constants'
import { Hook } from './scenes/Hook'
import { Contrast } from './scenes/Contrast'
import { ProductIntro } from './scenes/ProductIntro'
import { FeatureShowcase } from './scenes/FeatureShowcase'
import { HowItWorks } from './scenes/HowItWorks'
import { ArchFlash } from './scenes/ArchFlash'
import { Close } from './scenes/Close'

//    0 –  480  ( 0:00 – 0:16)  Hook — $47M found. Consequences cascade.
//  480 –  840  ( 0:16 – 0:28)  Contrast — Headlines. "Anonymous" is a lie. The pivot.
//  840 – 1200  ( 0:28 – 0:40)  ProductIntro — zk//LEAKS brand reveal + 3 pillars
// 1200 – 1830  ( 0:40 – 1:01)  FeatureShowcase — Terminal proof + feed with verified report
// 1830 – 2250  ( 1:01 – 1:15)  HowItWorks — 4-step protocol with flow lines
// 2250 – 2550  ( 1:15 – 1:25)  ArchFlash — Client vs On-chain architecture
// 2550 – 3250  ( 1:25 – 1:48)  Close — "Never identified." Stats. CTA.
// Total: 3250 frames = 1:48 at 30fps

export const TOTAL_DURATION = 3250

export const MainVideo: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.bg }}>
    <Series>
      <Series.Sequence durationInFrames={480}>
        <Hook />
      </Series.Sequence>
      <Series.Sequence durationInFrames={360}>
        <Contrast />
      </Series.Sequence>
      <Series.Sequence durationInFrames={360}>
        <ProductIntro />
      </Series.Sequence>
      <Series.Sequence durationInFrames={630}>
        <FeatureShowcase />
      </Series.Sequence>
      <Series.Sequence durationInFrames={420}>
        <HowItWorks />
      </Series.Sequence>
      <Series.Sequence durationInFrames={300}>
        <ArchFlash />
      </Series.Sequence>
      <Series.Sequence durationInFrames={700}>
        <Close />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
)
