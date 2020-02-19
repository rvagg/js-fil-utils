const crypto = require('crypto')

// simple sha256 utility function that takes two `Buffer`s and gets the hash of
// them when combined
function sha256 (b1, b2) {
  const hasher = crypto.createHash('sha256')
  hasher.update(b1)
  hasher.update(b2)
  const h = hasher.digest()
  h[31] = h[31] & 0b00111111 // fr32 compatible, zero out last two bytes
  return h
}

async function * merkle (hashstream) {
  let last = null
  let count = 0
  for await (const h of hashstream) {
    count++
    if (last) {
      const hl = sha256(last, h)
      yield hl
      last = null
    } else {
      last = h
    }
  }
  if (count === 1) { // root!
    yield last
  } else if (last != null) {
    throw new Error('uneven number of hashes!')
  }
}

async function * hash (instream) {
  let leftover = null
  for await (const chunk of instream) {
    for (let i = 0; i < chunk.length; i += 32) {
      if ((((leftover || 0) + chunk.length) - i) < 32) {
        leftover = chunk.slice(i)
        break
      }

      if (!leftover) {
        yield chunk.slice(i, i + 32)
      } else {
        i = -leftover.length
        yield Buffer.concat([leftover, chunk.slice(0, i + 32)])
        leftover = null
      }
    }
  }
  if (leftover) {
    throw new Error(`Unexpected leftover chunk of ${leftover.length} bytes`)
  }
}

async function * iterIter (h1, h2, iter) {
  yield h1
  yield h2
  while (true) {
    const h = await iter.next()
    if (h.done) {
      break
    }
    yield h.value
  }
}

async function merkleRoot (instream) {
  const fr32HashStream = hash(instream)
  let lastIter = fr32HashStream
  while (true) {
    // directly access the async iterator because we want to check how many
    // results it gives, if it gives one then we have our root, more than one
    // means we need to create another level on top of this one
    const merkleIter = merkle(lastIter)[Symbol.asyncIterator]()
    const h1 = await merkleIter.next()
    if (h1.done) {
      // we should always get at least one result
      throw new Error('Shouldn\'t be done already')
    }
    const h2 = await merkleIter.next()
    // only one result means we have our final root, otherwise we're at an
    // intermediate level and need to make at least one more level
    if (!h2.done) {
      lastIter = iterIter(h1.value, h2.value, merkleIter)
    } else {
      return h1.value
    }
  }
}

module.exports.merkleRoot = merkleRoot
