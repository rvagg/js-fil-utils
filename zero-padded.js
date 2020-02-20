const fr32oh = 254 / 256 // fr32 needs 2 bits per 256, so we make room for that

/**
 * @name commp.pieceSizeFromRaw(size)
 * @description Determine the piece size for a given block of data. Does not
 * account for Fr32 padding. A simple rounding up to the next pow2 size.
 * @param {number} size the size of the original resource
 * @param {boolean} next bump to the _next_ pow2 piece size
 * @returns {number}
 */
function pieceSizeFromRaw (size, next) {
  return 1 << (size.toString(2).length + (next ? 1 : 0))
}

/**
 * @name commp.zeroPaddedSizeFromRaw(size)
 * @description Determine the additional bytes of zeroed padding to append to the
 * end of a resource of `size` length in order to fit within a pow2 piece while
 * leaving enough room for Fr32 padding (2 bits per 254).
 * @param {number} size the size of the original resource
 * @returns {number}
 */
function zeroPaddedSizeFromRaw (size) {
  const pieceSize = pieceSizeFromRaw(size)
  const bound = Math.ceil(fr32oh * pieceSize)
  // the size is either the closest pow2 number, or the next pow2 number if we don't have space for padding
  return size <= bound ? bound : Math.ceil(fr32oh * pieceSizeFromRaw(size, true))
}

/**
 * @name commp.zeroPadReader(stream)
 * @description Given a stream or async iterator (of `Buffer`s), return a new
 * async iterator that additional zero-padding at the end of an amount
 * appropriate to fit in a pow2 Fr32 padded piece. See also {@zeroPaddedSize}.
 * @param {Stream|AsyncIterator<Buffer>} stream a stream or async iterator
 * of the original source.
 * @param {number} size the expected size, in bytes, of the original source.
 * @returns {AsyncIterator<Buffer>}
 */
async function * zeroPadReader (instream, size) {
  const padSize = zeroPaddedSizeFromRaw(size)
  let count = 0
  for await (const chunk of instream) {
    count += chunk.length
    yield chunk
  }
  // this isn't modified so we can just keep on giving the same chunk
  const zeros = Buffer.alloc(65536)
  while (true) {
    if (count >= padSize) {
      return
    }
    const sz = Math.min(padSize - count, 65536)
    yield sz < zeros.length ? zeros.slice(0, sz) : zeros
    count += sz
  }
}

module.exports.pieceSizeFromRaw = pieceSizeFromRaw
module.exports.zeroPaddedSizeFromRaw = zeroPaddedSizeFromRaw
module.exports.zeroPadReader = zeroPadReader
