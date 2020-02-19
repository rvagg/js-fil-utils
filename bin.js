#!/usr/bin/env node

const commp = require('./commp')

if (!process.argv[2]) {
  console.error('Usage: commp <path to file>')
  process.exit(1)
}

commp(process.argv[2])
  .then((result) => {
    console.log(`CommP for ${process.argv[2]}: ${result.toString('hex')}`)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

/*
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
