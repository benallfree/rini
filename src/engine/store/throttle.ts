/**
 * Creates a throttled function that only invokes `func` at most once per every `wait` milliseconds. The throttled function comes with a `cancel` method to cancel delayed `func` invocations and a `flush` method to immediately invoke them. Provide `options` to indicate whether `func` should be invoked on the leading and/or trailing edge of the `wait` timeout. The `func` is invoked with the last arguments provided to the throttled function.
 *
 *  **Note**: If `leading` and `trailing` options are `true`, `func` is invoked on the trailing edge of the timeout only if the throttled function is invoked more than once during the `wait` timeout.
 *
 * If `wait` is 0 and `leading` is `false`, `func` invocation is deferred until to the next tick, similar to `setTimeout` with a timeout of 0.
 *
 *  * Differences from lodash:
 * - does not return the results of the last invocation
 * - does not make any guarantees about the value of `this` in `func`
 *
 * Contribution to minified bundle size, when it is the only function imported:
 * - Lodash: 2,290 bytes
 * - Micro-dash: 394 bytes
 */
export function throttle(func: Function, wait = 0, { leading = true, trailing = true } = {}) {
  let tail = 0
  let nextArgs: any
  let timeoutId: any
  // helpers to save some bytes
  const now = () => +new Date()
  const setNewTail = () => {
    tail = now() + wait
  }
  const cancel = () => {
    clearTimeout(timeoutId)
    timeoutId = undefined
    nextArgs = undefined
    tail = 0
  }
  const flush = () => {
    if (nextArgs) {
      const args = nextArgs
      cancel()
      setNewTail()
      func(...args)
    }
  }
  const throttled = (...args: any[]) => {
    nextArgs = args
    const delay = Math.max(0, tail - now())
    if (!delay && (leading || timeoutId)) {
      flush()
    } else if (trailing) {
      if (!delay) {
        setNewTail()
      }
      clearTimeout(timeoutId)
      timeoutId = setTimeout(flush, delay || wait)
    }
  }
  return Object.assign(throttled, { cancel, flush })
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhyb3R0bGUuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvbWljcm8tZGFzaC9zcmMvIiwic291cmNlcyI6WyJsaWIvZnVuY3Rpb24vdGhyb3R0bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7O0dBY0c7QUFDSCxNQUFNLFVBQVUsUUFBUSxDQUN0QixJQUFPLEVBQ1AsSUFBSSxHQUFHLENBQUMsRUFDUixFQUFFLE9BQU8sR0FBRyxJQUFJLEVBQUUsUUFBUSxHQUFHLElBQUksRUFBRSxHQUFHLEVBQUU7SUFFeEMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ2IsSUFBSSxRQUFtQyxDQUFDO0lBQ3hDLElBQUksU0FBYyxDQUFDO0lBRW5CLDZCQUE2QjtJQUM3QixNQUFNLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDcEMsTUFBTSxVQUFVLEdBQUcsR0FBRyxFQUFFO1FBQ3RCLElBQUksR0FBRyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFDdEIsQ0FBQyxDQUFDO0lBRUYsTUFBTSxNQUFNLEdBQUcsR0FBRyxFQUFFO1FBQ2xCLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN4QixTQUFTLEdBQUcsU0FBUyxDQUFDO1FBQ3RCLFFBQVEsR0FBRyxTQUFTLENBQUM7UUFDckIsSUFBSSxHQUFHLENBQUMsQ0FBQztJQUNYLENBQUMsQ0FBQztJQUVGLE1BQU0sS0FBSyxHQUFHLEdBQUcsRUFBRTtRQUNqQixJQUFJLFFBQVEsRUFBRTtZQUNaLE1BQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQztZQUN0QixNQUFNLEVBQUUsQ0FBQztZQUVULFVBQVUsRUFBRSxDQUFDO1lBQ2IsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7U0FDZjtJQUNILENBQUMsQ0FBQztJQUVGLE1BQU0sU0FBUyxHQUFHLENBQUMsR0FBRyxJQUFtQixFQUFFLEVBQUU7UUFDM0MsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNoQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxFQUFFO1lBQ3BDLEtBQUssRUFBRSxDQUFDO1NBQ1Q7YUFBTSxJQUFJLFFBQVEsRUFBRTtZQUNuQixJQUFJLENBQUMsS0FBSyxFQUFFO2dCQUNWLFVBQVUsRUFBRSxDQUFDO2FBQ2Q7WUFDRCxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDeEIsU0FBUyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxJQUFJLElBQUksQ0FBQyxDQUFDO1NBQzlDO0lBQ0gsQ0FBQyxDQUFDO0lBRUYsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ3JELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENyZWF0ZXMgYSB0aHJvdHRsZWQgZnVuY3Rpb24gdGhhdCBvbmx5IGludm9rZXMgYGZ1bmNgIGF0IG1vc3Qgb25jZSBwZXIgZXZlcnkgYHdhaXRgIG1pbGxpc2Vjb25kcy4gVGhlIHRocm90dGxlZCBmdW5jdGlvbiBjb21lcyB3aXRoIGEgYGNhbmNlbGAgbWV0aG9kIHRvIGNhbmNlbCBkZWxheWVkIGBmdW5jYCBpbnZvY2F0aW9ucyBhbmQgYSBgZmx1c2hgIG1ldGhvZCB0byBpbW1lZGlhdGVseSBpbnZva2UgdGhlbS4gUHJvdmlkZSBgb3B0aW9uc2AgdG8gaW5kaWNhdGUgd2hldGhlciBgZnVuY2Agc2hvdWxkIGJlIGludm9rZWQgb24gdGhlIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIGB3YWl0YCB0aW1lb3V0LiBUaGUgYGZ1bmNgIGlzIGludm9rZWQgd2l0aCB0aGUgbGFzdCBhcmd1bWVudHMgcHJvdmlkZWQgdG8gdGhlIHRocm90dGxlZCBmdW5jdGlvbi5cbiAqXG4gKiAgKipOb3RlKio6IElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAsIGBmdW5jYCBpcyBpbnZva2VkIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0IG9ubHkgaWYgdGhlIHRocm90dGxlZCBmdW5jdGlvbiBpcyBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogSWYgYHdhaXRgIGlzIDAgYW5kIGBsZWFkaW5nYCBpcyBgZmFsc2VgLCBgZnVuY2AgaW52b2NhdGlvbiBpcyBkZWZlcnJlZCB1bnRpbCB0byB0aGUgbmV4dCB0aWNrLCBzaW1pbGFyIHRvIGBzZXRUaW1lb3V0YCB3aXRoIGEgdGltZW91dCBvZiAwLlxuICpcbiAqIERpZmZlcmVuY2VzIGZyb20gbG9kYXNoOlxuICogLSBkb2VzIG5vdCByZXR1cm4gdGhlIHJlc3VsdHMgb2YgdGhlIGxhc3QgaW52b2NhdGlvblxuICogLSBkb2VzIG5vdCBtYWtlIGFueSBndWFyYW50ZWVzIGFib3V0IHRoZSB2YWx1ZSBvZiBgdGhpc2AgaW4gYGZ1bmNgXG4gKlxuICogQ29udHJpYnV0aW9uIHRvIG1pbmlmaWVkIGJ1bmRsZSBzaXplLCB3aGVuIGl0IGlzIHRoZSBvbmx5IGZ1bmN0aW9uIGltcG9ydGVkOlxuICogLSBMb2Rhc2g6IDIsMjkwIGJ5dGVzXG4gKiAtIE1pY3JvLWRhc2g6IDM5NCBieXRlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdGhyb3R0bGU8VCBleHRlbmRzICguLi5hcmdzOiBhbnlbXSkgPT4gYW55PihcbiAgZnVuYzogVCxcbiAgd2FpdCA9IDAsXG4gIHsgbGVhZGluZyA9IHRydWUsIHRyYWlsaW5nID0gdHJ1ZSB9ID0ge30sXG4pOiAoKC4uLmFyZ3M6IFBhcmFtZXRlcnM8VD4pID0+IHZvaWQpICYgeyBjYW5jZWwoKTogdm9pZDsgZmx1c2goKTogdm9pZCB9IHtcbiAgbGV0IHRhaWwgPSAwO1xuICBsZXQgbmV4dEFyZ3M6IFBhcmFtZXRlcnM8VD4gfCB1bmRlZmluZWQ7XG4gIGxldCB0aW1lb3V0SWQ6IGFueTtcblxuICAvLyBoZWxwZXJzIHRvIHNhdmUgc29tZSBieXRlc1xuICBjb25zdCBub3cgPSAoKSA9PiBwZXJmb3JtYW5jZS5ub3coKTtcbiAgY29uc3Qgc2V0TmV3VGFpbCA9ICgpID0+IHtcbiAgICB0YWlsID0gbm93KCkgKyB3YWl0O1xuICB9O1xuXG4gIGNvbnN0IGNhbmNlbCA9ICgpID0+IHtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICB0aW1lb3V0SWQgPSB1bmRlZmluZWQ7XG4gICAgbmV4dEFyZ3MgPSB1bmRlZmluZWQ7XG4gICAgdGFpbCA9IDA7XG4gIH07XG5cbiAgY29uc3QgZmx1c2ggPSAoKSA9PiB7XG4gICAgaWYgKG5leHRBcmdzKSB7XG4gICAgICBjb25zdCBhcmdzID0gbmV4dEFyZ3M7XG4gICAgICBjYW5jZWwoKTtcblxuICAgICAgc2V0TmV3VGFpbCgpO1xuICAgICAgZnVuYyguLi5hcmdzKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgdGhyb3R0bGVkID0gKC4uLmFyZ3M6IFBhcmFtZXRlcnM8VD4pID0+IHtcbiAgICBuZXh0QXJncyA9IGFyZ3M7XG4gICAgY29uc3QgZGVsYXkgPSBNYXRoLm1heCgwLCB0YWlsIC0gbm93KCkpO1xuICAgIGlmICghZGVsYXkgJiYgKGxlYWRpbmcgfHwgdGltZW91dElkKSkge1xuICAgICAgZmx1c2goKTtcbiAgICB9IGVsc2UgaWYgKHRyYWlsaW5nKSB7XG4gICAgICBpZiAoIWRlbGF5KSB7XG4gICAgICAgIHNldE5ld1RhaWwoKTtcbiAgICAgIH1cbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgICAgdGltZW91dElkID0gc2V0VGltZW91dChmbHVzaCwgZGVsYXkgfHwgd2FpdCk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiBPYmplY3QuYXNzaWduKHRocm90dGxlZCwgeyBjYW5jZWwsIGZsdXNoIH0pO1xufVxuIl19
