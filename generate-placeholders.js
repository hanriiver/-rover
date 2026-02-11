const fs = require('fs');
const path = require('path');

// ============================================================
// GIF89a Generator — creates a valid 64x64 single-frame GIF
// ============================================================

function hexToRGB(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/**
 * Build a valid GIF89a file (64x64, single frame, single color).
 */
function createGif(width, height, color) {
  const { r, g, b } = hexToRGB(color);
  const minCodeSize = 2;
  const lzwData = lzwEncode(width * height, minCodeSize);

  // Split LZW data into sub-blocks (max 255 bytes each)
  const subBlocks = [];
  for (let i = 0; i < lzwData.length; i += 255) {
    const chunk = lzwData.slice(i, i + 255);
    subBlocks.push(Buffer.from([chunk.length]), chunk);
  }
  subBlocks.push(Buffer.from([0x00])); // block terminator

  const parts = [];

  // Header
  parts.push(Buffer.from('GIF89a'));

  // Logical Screen Descriptor
  const lsd = Buffer.alloc(7);
  lsd.writeUInt16LE(width, 0);
  lsd.writeUInt16LE(height, 2);
  lsd.writeUInt8(0x80 | 0x00, 4); // GCT flag, size=0 (2 entries)
  lsd.writeUInt8(0, 5); // bg color index
  lsd.writeUInt8(0, 6); // pixel aspect ratio
  parts.push(lsd);

  // Global Color Table (2 entries)
  parts.push(Buffer.from([r, g, b, 0, 0, 0]));

  // Image Descriptor
  const imgDesc = Buffer.alloc(10);
  imgDesc.writeUInt8(0x2C, 0);
  imgDesc.writeUInt16LE(0, 1);
  imgDesc.writeUInt16LE(0, 3);
  imgDesc.writeUInt16LE(width, 5);
  imgDesc.writeUInt16LE(height, 7);
  imgDesc.writeUInt8(0x00, 9);
  parts.push(imgDesc);

  // Image Data
  parts.push(Buffer.from([minCodeSize]));
  for (const block of subBlocks) {
    parts.push(block);
  }

  // Trailer
  parts.push(Buffer.from([0x3B]));

  return Buffer.concat(parts);
}

function lzwEncode(pixelCount, minCodeSize) {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;

  let buf = [];
  let curByte = 0;
  let curBit = 0;

  function writeBits(value, numBits) {
    for (let i = 0; i < numBits; i++) {
      if (value & (1 << i)) {
        curByte |= (1 << curBit);
      }
      curBit++;
      if (curBit === 8) {
        buf.push(curByte);
        curByte = 0;
        curBit = 0;
      }
    }
  }

  function flush() {
    if (curBit > 0) {
      buf.push(curByte);
    }
  }

  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  const maxTableSize = 4096;

  let dict = new Map();
  function resetDict() {
    dict.clear();
    for (let i = 0; i < clearCode; i++) {
      dict.set(String(i), i);
    }
    nextCode = eoiCode + 1;
    codeSize = minCodeSize + 1;
  }

  writeBits(clearCode, codeSize);
  resetDict();

  let w = String(0);

  for (let i = 1; i < pixelCount; i++) {
    const k = 0;
    const wk = w + ',' + k;

    if (dict.has(wk)) {
      w = wk;
    } else {
      writeBits(dict.get(w), codeSize);

      if (nextCode < maxTableSize) {
        dict.set(wk, nextCode);
        nextCode++;
        if (nextCode > (1 << codeSize) && codeSize < 12) {
          codeSize++;
        }
      } else {
        writeBits(clearCode, codeSize);
        resetDict();
      }

      w = String(k);
    }
  }

  writeBits(dict.get(w), codeSize);
  writeBits(eoiCode, codeSize);
  flush();

  return Buffer.from(buf);
}

// ============================================================
// Minimal PNG Generator
// ============================================================

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[n] = c;
    }
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function adler32(buf) {
  let a = 1, b = 0;
  for (let i = 0; i < buf.length; i++) {
    a = (a + buf[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b << 16) | a) >>> 0;
}

function createPngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBytes, data]);
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([length, typeBytes, data, crcVal]);
}

function createPng(width, height, color) {
  const { r, g, b } = hexToRGB(color);
  const parts = [];

  // PNG signature
  parts.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(2, 9);  // RGB
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  parts.push(createPngChunk('IHDR', ihdr));

  // Build raw image data (filter byte 0 + RGB per pixel per row)
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    const offset = y * rowSize;
    rawData[offset] = 0;
    for (let x = 0; x < width; x++) {
      const px = offset + 1 + x * 3;
      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
    }
  }

  // Wrap in zlib (uncompressed stored deflate blocks)
  const zlibParts = [];
  const cmf = 0x78;
  const flgBase = 0x01;
  const remainder = (cmf * 256 + flgBase) % 31;
  const flg = remainder === 0 ? flgBase : flgBase + (31 - remainder);
  zlibParts.push(Buffer.from([cmf, flg]));

  const maxBlock = 65535;
  const totalLen = rawData.length;
  for (let i = 0; i < totalLen; i += maxBlock) {
    const remaining = totalLen - i;
    const blockLen = Math.min(remaining, maxBlock);
    const isLast = (i + blockLen >= totalLen) ? 1 : 0;
    const header = Buffer.alloc(5);
    header.writeUInt8(isLast, 0);
    header.writeUInt16LE(blockLen, 1);
    header.writeUInt16LE(blockLen ^ 0xFFFF, 3);
    zlibParts.push(header);
    zlibParts.push(rawData.slice(i, i + blockLen));
  }

  const adler = adler32(rawData);
  const adlerBuf = Buffer.alloc(4);
  adlerBuf.writeUInt32BE(adler, 0);
  zlibParts.push(adlerBuf);

  parts.push(createPngChunk('IDAT', Buffer.concat(zlibParts)));
  parts.push(createPngChunk('IEND', Buffer.alloc(0)));

  return Buffer.concat(parts);
}

// ============================================================
// Main
// ============================================================

const spritesDir = path.join(__dirname, 'src', 'sprites');
const iconsDir = path.join(__dirname, 'src', 'icons');

fs.mkdirSync(spritesDir, { recursive: true });
fs.mkdirSync(iconsDir, { recursive: true });

const sprites = [
  { name: 'idle.gif',      color: '#D2691E' },
  { name: 'walk.gif',      color: '#4CAF50' },
  { name: 'sleep.gif',     color: '#2196F3' },
  { name: 'bark.gif',      color: '#F44336' },
  { name: 'sit.gif',       color: '#9C27B0' },
  { name: 'pee.gif',       color: '#FFEB3B' },
  { name: 'poop.gif',      color: '#795548' },
  { name: 'cry.gif',       color: '#00BCD4' },
  { name: 'flip.gif',      color: '#E91E63' },
  { name: 'chase.gif',     color: '#8BC34A' },
  { name: 'crash.gif',     color: '#FF5722' },
  { name: 'hide-eyes.gif', color: '#9E9E9E' },
];

console.log('Generating sprite GIFs (64x64)...');
for (const sprite of sprites) {
  const gifBuffer = createGif(64, 64, sprite.color);
  const filePath = path.join(spritesDir, sprite.name);
  fs.writeFileSync(filePath, gifBuffer);
  console.log('  Created ' + sprite.name + ' (' + sprite.color + ') - ' + gifBuffer.length + ' bytes');
}

console.log('\nGenerating icon PNGs...');
const iconColor = '#D2691E';

const icon48 = createPng(48, 48, iconColor);
fs.writeFileSync(path.join(iconsDir, 'icon48.png'), icon48);
console.log('  Created icon48.png (48x48) - ' + icon48.length + ' bytes');

const icon128 = createPng(128, 128, iconColor);
fs.writeFileSync(path.join(iconsDir, 'icon128.png'), icon128);
console.log('  Created icon128.png (128x128) - ' + icon128.length + ' bytes');

console.log('\nDone! All placeholder files generated.');
