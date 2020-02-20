#!/usr/bin/env node

const commp = require('./commp')

if (!process.argv[2]) {
  console.error('Usage: commp <path to file>')
  process.exit(1)
}

function toMb (size) {
  return `${(Math.round((size / 1024 / 1024) * 100) / 100).toLocaleString()} Mb`
}

commp(process.argv[2])
  .then((result) => {
    console.log(
`${process.argv[2]}:
\tSize: ${toMb(result.size)}
\tPadded Size: ${toMb(result.paddedSize)}
\tPiece Size: ${toMb(result.pieceSize)}
\tCommP: ${result.commp.toString('hex')}`
    )
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

/* write out a zero padded version and an fr32 version
const { Readable } = require('stream')
const fs = require('fs')
const { zeroPadReader } = require('./zero-padded')
const { fr32PadReader } = require('./fr32')

const size = fs.statSync(process.argv[2]).size
Readable.from(zeroPadReader(fs.createReadStream(process.argv[2]), size))
  .pipe(fs.createWriteStream(`${process.argv[3]}.pad`))
Readable.from(fr32PadReader(zeroPadReader(fs.createReadStream(process.argv[2]), size)))
  .pipe(fs.createWriteStream(`${process.argv[3]}.fr32`))
*/
