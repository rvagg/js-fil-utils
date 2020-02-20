const fs = require('fs').promises
fs.createReadStream = require('fs').createReadStream
const { zeroPadReader, zeroPaddedSizeFromRaw, pieceSizeFromRaw } = require('./zero-padded')
const { fr32PadReader } = require('./fr32')
const { merkleRoot } = require('./merkle')

/**
 * @description Given an input stream, calculate the Filecoin CommP ("Piece
 * Commitment") using stream processing.
 * @param {Stream|AsyncIterator<Buffer>} stream
 * @returns {Object} an object of the form `{ size, paddedSize, pieceSize, commp }`
 * @async
 */
async function commp (inp) {
  const size = (await fs.stat(inp)).size
  const paddedSize = zeroPaddedSizeFromRaw(size)
  const pieceSize = pieceSizeFromRaw(size)
  const result = { size, paddedSize, pieceSize }
  const fr32Stream = fr32PadReader(zeroPadReader(fs.createReadStream(inp), size))
  result.commp = await merkleRoot(fr32Stream)
  return result
}

module.exports = commp
module.exports.fr32PadReader = fr32PadReader
module.exports.zeroPadReader = zeroPadReader
module.exports.zeroPaddedSizeFromRaw = zeroPaddedSizeFromRaw
module.exports.pieceSizeFromRaw = pieceSizeFromRaw
module.exports.merkleRoot = merkleRoot
