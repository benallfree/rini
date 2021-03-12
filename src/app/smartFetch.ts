const createSmartFetch = () => {
  const cache: { [_: string]: Response } = {}

  return async (uri: string) => {
    if (cache[uri]) return cache[uri]
    const response = await fetch(uri)
    cache[uri] = response
    return response
  }
}

export const smartFetch = createSmartFetch()
export const smartTextFetch = (() => {
  const cache: { [_: string]: Promise<string> } = {}

  return async (uri: string): Promise<string> => {
    if (!(uri in cache)) {
      cache[uri] = smartFetch(uri)
        .then((response) => response.text())
        .catch((e) => {
          delete cache[uri]
          throw e
        })
    }
    return cache[uri]
  }
})()
