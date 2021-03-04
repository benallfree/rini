declare class Geohash {
  encode(
    lat: number,
    lng: number,
    accuracy: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15
  ): string
}

const geo = new Geohash()
export = geo
