const fs = require('fs')
const { promisify } = require('util')
const { Readable, pipeline } = require('stream')

const fr32oh = 254 / 256

// this pads 2 bits per 254 bits of an input stream, yielding padded Buffers.
async function * fr32PadReader (instream) {
  let bytes = 0 // number of bytes we've processed so far, used for tracking the 254 padding
  let align = 0 // as we bump by 2 bits per 254 we keep track of whether we're at 0, 2, 4, or 6
  let nc = [] // store bytes in this, turn into a Buffer once we've processed a chunk
  let leftover = 0 // as we overflow, we need to track the padding leftover for the next cycle

  for await (const chunk of instream) {
    for (let idx = 0; idx < chunk.length; idx++) {
      const byt = chunk[idx]
      let lo, hi

      if (++bytes % 32 === 0) {
        // we're at a padding byte, shift alignment
        align += 2
        if (align === 8) {
          // we've added a full byte's worth of padding, push the extra byte and start again
          align = 0
          nc.push(leftover)
          bytes++
          leftover = 0
        }
      }
      // in alignment cases 2, 4, 6 we split the byte into two parts
      switch (align) {
        case 0:
          // easy case, we're byte-aligned
          nc.push(byt)
          continue
        case 2:
          hi = byt >> 6
          lo = byt & 63
          break
        case 4:
          hi = byt >> 4
          lo = byt & 15
          break
        case 6:
          hi = byt >> 2
          lo = byt & 3
          break
      }

      // reassemble
      if (bytes % 32 === 0) {
        // we're at a padding byte, insert the low and the leftover with padding in between
        nc.push((lo << (align - 2)) | leftover)
      } else {
        // the low bits and leftover bits together
        nc.push((lo << align) | leftover)
      }

      leftover = hi // save the hi bits for the next cycle
    }

    // emit the padded version and reset
    yield Buffer.from(nc)
    nc = []
  }

  // we've ended on an unaligned byte, shift and emit
  if (align !== 0) {
    nc.push(leftover << align)
    yield Buffer.from(nc) // single byte
  }
}

function zeroPaddedSize (size) {
  const logv = size.toString(2).length
  const sectSize = 1 << logv
  const bound = Math.ceil(fr32oh * sectSize)
  // the size is either the closest pow2 number, or the next pow2 number if we don't have space for padding
  return size <= bound ? bound : Math.ceil(fr32oh * (1 << (logv + 1)))
}

async function * zeroPadReader (instream, size) {
  const padSize = zeroPaddedSize(size)
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

async function run (inp, outp) {
  const size = (await promisify(fs.stat)(inp)).size
  return promisify(pipeline)(
    Readable.from(fr32PadReader(zeroPadReader(fs.createReadStream(inp), size))),
    fs.createWriteStream(outp)
  )
}

run(process.argv[2], process.argv[3]).catch((err) => {
  console.error(err)
  process.exit(1)
})
