import Avatar from 'avatar-builder'
import Bottleneck from 'bottleneck'
import fs from 'fs'
import { dirname, resolve } from 'path'
import Sharp from 'sharp'
import Geohash from './latlon-geohash'
import places from './places'

const limiter = new Bottleneck({ maxConcurrent: 50 })

const avatar = Avatar.builder(
  Avatar.Image.margin(Avatar.Image.circleMask(Avatar.Image.identicon())),
  512,
  512,
  { cache: Avatar.Cache.lru() }
)

Promise.all(
  places.map(({ title, lat, lng }) =>
    limiter.schedule(async () => {
      const geohash = Geohash.encode(lat, lng, 9)
      const fout = `./badges/${geohash}.png`
      console.log(`Writing ${fout}`)

      const binacularsBuf = await Sharp(
        await fs.readFileSync(resolve(dirname(__filename), '../bin/314101.png'))
      )
        .resize(512, 512, {
          fit: 'inside',
        })
        .toBuffer()
      const baseBuf = await avatar.create(geohash)
      const base = await Sharp(baseBuf)
        .composite([{ input: binacularsBuf }])
        .toFile(fout)
    })
  )
)

// avatar.create('crfxvrfxvrfx').then((buffer) => fs.writeFileSync('avatar-crfxvrfxvrfx.png', buffer))
// avatar.create('gabriel').then((buffer) => fs.writeFileSync('avatar-gabriel.png', buffer))
// avatar.create('allaigre').then((buffer) => fs.writeFileSync('avatar-allaigre.png', buffer))
