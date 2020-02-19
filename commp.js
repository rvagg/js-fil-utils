const fs = require('fs').promises
fs.createReadStream = require('fs').createReadStream
const { zeroPadReader } = require('./zero-padded')
const { fr32PadReader } = require('./fr32')
const { merkleRoot } = require('./merkle')

/**
 * @description Given an input stream, calculate the Filecoin CommP ("Piece
 * Commitment") using stream processing.
 * @param {*} instream
 */
async function commp (inp) {
  const size = (await fs.stat(inp)).size
  const fr32Stream = fr32PadReader(zeroPadReader(fs.createReadStream(inp), size))
  return merkleRoot(fr32Stream)
}

module.exports = commp
