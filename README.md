# js-fil-utils (npm: `@rvagg/fil-utils`)

Miscellaneous JavaScript Filecoin utilities implementing pieces of the Filecoin proofs based on the Rust implementations at https://github.com/filecoin-project/rust-fil-proofs/

* CommP calculation, using the following components which may be used separately:
  * Padded and piece size calculation
  * Zero padding stream conversion
  * Fr32 padding stream conversion
  * 32-byte chunked sha256 binary Merkle tree calculation

## API

### Contents

 * [`async commp(stream)`](#commp)
 * [`commp.fr32PadReader(stream)`](#commp__fr32PadReader__stream__)
 * [`async commp.merkleRoot(stream)`](#commp__merkleRoot__stream__)
 * [`commp.pieceSizeFromRaw(size)`](#commp__pieceSizeFromRaw__size__)
 * [`commp.zeroPaddedSizeFromRaw(size)`](#commp__zeroPaddedSizeFromRaw__size__)
 * [`commp.zeroPadReader(stream)`](#commp__zeroPadReader__stream__)

<a name="commp"></a>
### `async commp(stream)`

Given an input stream, calculate the Filecoin CommP ("Piece
Commitment") using stream processing.

**Parameters:**

* **`stream`** _(`Stream|AsyncIterator.<Buffer>`)_

**Return value**  _(`Object`)_: an object of the form `{ size, paddedSize, pieceSize, commp }`

<a name="commp__fr32PadReader__stream__"></a>
### `commp.fr32PadReader(stream)`

Given a stream or async iterator (of `Buffer`s), return a new
async iterator that adds Fr32 padding. For every 254 bits, an additional 2
zero bits are added.

**Parameters:**

* **`stream`** _(`Stream|AsyncIterator.<Buffer>`)_: a stream or async iterator
  of the original source, zero-padded to an appropriate length to fit in a pow2
  sized piece after Fr32 padding.

**Return value**  _(`AsyncIterator.<Buffer>`)_

<a name="commp__merkleRoot__stream__"></a>
### `async commp.merkleRoot(stream)`

Given a stream or async iterator (of `Buffer`s), return a merkle
root as a `Buffer` using a 32-byte chunked sha256 binary tree.

**Parameters:**

* **`stream`** _(`Stream|AsyncIterator.<Buffer>`)_: a stream or async iterator of
  raw bytes. The byte length is expected to be divisible by 64 (pairs of
  32-bytes).

**Return value**  _(`Buffer`)_

<a name="commp__pieceSizeFromRaw__size__"></a>
### `commp.pieceSizeFromRaw(size)`

Determine the piece size for a given block of data. Does not
account for Fr32 padding. A simple rounding up to the next pow2 size.

**Parameters:**

* **`size`** _(`number`)_: the size of the original resource
* **`next`** _(`boolean`)_: bump to the _next_ pow2 piece size

**Return value**  _(`number`)_

<a name="commp__zeroPaddedSizeFromRaw__size__"></a>
### `commp.zeroPaddedSizeFromRaw(size)`

Determine the additional bytes of zeroed padding to append to the
end of a resource of `size` length in order to fit within a pow2 piece while
leaving enough room for Fr32 padding (2 bits per 254).

**Parameters:**

* **`size`** _(`number`)_: the size of the original resource

**Return value**  _(`number`)_

<a name="commp__zeroPadReader__stream__"></a>
### `commp.zeroPadReader(stream)`

Given a stream or async iterator (of `Buffer`s), return a new
async iterator that additional zero-padding at the end of an amount
appropriate to fit in a pow2 Fr32 padded piece. See also {@zeroPaddedSize}.

**Parameters:**

* **`stream`** _(`Stream|AsyncIterator.<Buffer>`)_: a stream or async iterator
  of the original source.
* **`size`** _(`number`)_: the expected size, in bytes, of the original source.

**Return value**  _(`AsyncIterator.<Buffer>`)_

## License and Copyright

Copyright 2020 Rod Vagg

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
