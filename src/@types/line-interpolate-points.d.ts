declare module 'line-interpolate-points' {
  type Point = [number, number]

  function interpolateLineRange(points: Point[], nPoints: number): Point[]

  export = interpolateLineRange
}
