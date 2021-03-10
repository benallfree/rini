import Bottleneck from 'bottleneck'

export const limiter = new Bottleneck({
  maxConcurrent: 100,
  highWater: 1000,
  strategy: Bottleneck.strategy.LEAK,
})

const hb = () => {
  console.log(`Queue depth`, limiter.queued())
  setTimeout(hb, 1000)
}
