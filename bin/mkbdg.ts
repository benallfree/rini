import Avatar from 'avatar-builder'
import Bottleneck from 'bottleneck'
import fs from 'fs'
import { dirname, resolve } from 'path'
import Sharp from 'sharp'

const limiter = new Bottleneck({ maxConcurrent: 50 })

const bots: { idToken: string; uid: string }[] = require('../.secrets/bots.json')

const avatar = Avatar.builder(
  Avatar.Image.margin(Avatar.Image.circleMask(Avatar.Image.identicon())),
  512,
  512,
  { cache: Avatar.Cache.lru() }
)

const binacularsBuf = Sharp(fs.readFileSync(resolve(dirname(__filename), '../bin/314101.png')))
  .resize(512, 512, {
    fit: 'inside',
  })
  .toBuffer()

const carBuf = Sharp(
  fs.readFileSync(resolve(dirname(__filename), '../src/app/assets/images/tesla.png'))
)
  .resize(512, 512, {
    fit: 'inside',
  })
  .toBuffer()

Promise.all([
  // ...places.map(({ title, lat, lng }) =>
  //   limiter.schedule(async () => {
  //     const geohash = Geohash.encode(lat, lng, 9)
  //     const fout = `./avatars/poi-${geohash}.png`
  //     console.log(`Writing ${fout}`)

  //     const baseBuf = await avatar.create(geohash)
  //     const base = await Sharp(baseBuf)
  //       // .composite([{ input: await binacularsBuf }])
  //       .toFile(fout)
  //   })
  // ),
  ...bots.map(({ idToken, uid }) => {
    limiter.schedule(async () => {
      const fout = (sz: number) => {
        const fname = `./.data/avatars/${uid}.png`

        console.log(`Writing ${fname}`)
        return fname
      }

      const file = (sz: number) => {
        return Sharp(baseBuf).resize(sz, sz).toFile(fout(sz))
      }
      const baseBuf = await avatar.create(uid)
      await Promise.all([file(512)])
    })
  }),
])

// avatar.create('crfxvrfxvrfx').then((buffer) => fs.writeFileSync('avatar-crfxvrfxvrfx.png', buffer))
// avatar.create('gabriel').then((buffer) => fs.writeFileSync('avatar-gabriel.png', buffer))
// avatar.create('allaigre').then((buffer) => fs.writeFileSync('avatar-allaigre.png', buffer))
