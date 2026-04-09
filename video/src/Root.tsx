import { Composition, registerRoot } from 'remotion'
import { MainVideo, TOTAL_DURATION } from './MainVideo'
import { FPS, W, H } from './constants'
import { Hook } from './scenes/Hook'
import { Contrast } from './scenes/Contrast'
import { ProductIntro } from './scenes/ProductIntro'
import { FeatureShowcase } from './scenes/FeatureShowcase'
import { HowItWorks } from './scenes/HowItWorks'
import { ArchFlash } from './scenes/ArchFlash'
import { Close } from './scenes/Close'

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="MainVideo"
      component={MainVideo}
      durationInFrames={TOTAL_DURATION}
      fps={FPS}
      width={W}
      height={H}
    />
    {/* Individual scenes for preview */}
    <Composition id="Hook" component={Hook} durationInFrames={480} fps={FPS} width={W} height={H} />
    <Composition id="Contrast" component={Contrast} durationInFrames={360} fps={FPS} width={W} height={H} />
    <Composition id="ProductIntro" component={ProductIntro} durationInFrames={360} fps={FPS} width={W} height={H} />
    <Composition id="FeatureShowcase" component={FeatureShowcase} durationInFrames={630} fps={FPS} width={W} height={H} />
    <Composition id="HowItWorks" component={HowItWorks} durationInFrames={420} fps={FPS} width={W} height={H} />
    <Composition id="ArchFlash" component={ArchFlash} durationInFrames={300} fps={FPS} width={W} height={H} />
    <Composition id="Close" component={Close} durationInFrames={700} fps={FPS} width={W} height={H} />
  </>
)

registerRoot(RemotionRoot)
