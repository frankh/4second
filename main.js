'use strict';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var alea$1 = {exports: {}};

(function (module) {
// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -

// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.



(function(global, module, define) {

function Alea(seed) {
  var me = this, mash = Mash();

  me.next = function() {
    var t = 2091639 * me.s0 + me.c * 2.3283064365386963e-10; // 2^-32
    me.s0 = me.s1;
    me.s1 = me.s2;
    return me.s2 = t - (me.c = t | 0);
  };

  // Apply the seeding algorithm from Baagoe.
  me.c = 1;
  me.s0 = mash(' ');
  me.s1 = mash(' ');
  me.s2 = mash(' ');
  me.s0 -= mash(seed);
  if (me.s0 < 0) { me.s0 += 1; }
  me.s1 -= mash(seed);
  if (me.s1 < 0) { me.s1 += 1; }
  me.s2 -= mash(seed);
  if (me.s2 < 0) { me.s2 += 1; }
  mash = null;
}

function copy(f, t) {
  t.c = f.c;
  t.s0 = f.s0;
  t.s1 = f.s1;
  t.s2 = f.s2;
  return t;
}

function impl(seed, opts) {
  var xg = new Alea(seed),
      state = opts && opts.state,
      prng = xg.next;
  prng.int32 = function() { return (xg.next() * 0x100000000) | 0; };
  prng.double = function() {
    return prng() + (prng() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
  };
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); };
  }
  return prng;
}

function Mash() {
  var n = 0xefc8249d;

  var mash = function(data) {
    data = String(data);
    for (var i = 0; i < data.length; i++) {
      n += data.charCodeAt(i);
      var h = 0.02519603282416938 * n;
      n = h >>> 0;
      h -= n;
      h *= n;
      n = h >>> 0;
      h -= n;
      n += h * 0x100000000; // 2^32
    }
    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
  };

  return mash;
}


if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.alea = impl;
}

})(
  commonjsGlobal,
  module,    // present in node.js
  (typeof undefined) == 'function'    // present with an AMD loader
);
}(alea$1));

var xor128$1 = {exports: {}};

(function (module) {
// A Javascript implementaion of the "xor128" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  me.x = 0;
  me.y = 0;
  me.z = 0;
  me.w = 0;

  // Set up generator function.
  me.next = function() {
    var t = me.x ^ (me.x << 11);
    me.x = me.y;
    me.y = me.z;
    me.z = me.w;
    return me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8);
  };

  if (seed === (seed | 0)) {
    // Integer seed.
    me.x = seed;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 64; k++) {
    me.x ^= strseed.charCodeAt(k) | 0;
    me.next();
  }
}

function copy(f, t) {
  t.x = f.x;
  t.y = f.y;
  t.z = f.z;
  t.w = f.w;
  return t;
}

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); };
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xor128 = impl;
}

})(
  commonjsGlobal,
  module,    // present in node.js
  (typeof undefined) == 'function'    // present with an AMD loader
);
}(xor128$1));

var xorwow$1 = {exports: {}};

(function (module) {
// A Javascript implementaion of the "xorwow" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  // Set up generator function.
  me.next = function() {
    var t = (me.x ^ (me.x >>> 2));
    me.x = me.y; me.y = me.z; me.z = me.w; me.w = me.v;
    return (me.d = (me.d + 362437 | 0)) +
       (me.v = (me.v ^ (me.v << 4)) ^ (t ^ (t << 1))) | 0;
  };

  me.x = 0;
  me.y = 0;
  me.z = 0;
  me.w = 0;
  me.v = 0;

  if (seed === (seed | 0)) {
    // Integer seed.
    me.x = seed;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 64; k++) {
    me.x ^= strseed.charCodeAt(k) | 0;
    if (k == strseed.length) {
      me.d = me.x << 10 ^ me.x >>> 4;
    }
    me.next();
  }
}

function copy(f, t) {
  t.x = f.x;
  t.y = f.y;
  t.z = f.z;
  t.w = f.w;
  t.v = f.v;
  t.d = f.d;
  return t;
}

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); };
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xorwow = impl;
}

})(
  commonjsGlobal,
  module,    // present in node.js
  (typeof undefined) == 'function'    // present with an AMD loader
);
}(xorwow$1));

var xorshift7$1 = {exports: {}};

(function (module) {
// A Javascript implementaion of the "xorshift7" algorithm by
// François Panneton and Pierre L'ecuyer:
// "On the Xorgshift Random Number Generators"
// http://saluc.engr.uconn.edu/refs/crypto/rng/panneton05onthexorshift.pdf

(function(global, module, define) {

function XorGen(seed) {
  var me = this;

  // Set up generator function.
  me.next = function() {
    // Update xor generator.
    var X = me.x, i = me.i, t, v;
    t = X[i]; t ^= (t >>> 7); v = t ^ (t << 24);
    t = X[(i + 1) & 7]; v ^= t ^ (t >>> 10);
    t = X[(i + 3) & 7]; v ^= t ^ (t >>> 3);
    t = X[(i + 4) & 7]; v ^= t ^ (t << 7);
    t = X[(i + 7) & 7]; t = t ^ (t << 13); v ^= t ^ (t << 9);
    X[i] = v;
    me.i = (i + 1) & 7;
    return v;
  };

  function init(me, seed) {
    var j, X = [];

    if (seed === (seed | 0)) {
      // Seed state array using a 32-bit integer.
      X[0] = seed;
    } else {
      // Seed state using a string.
      seed = '' + seed;
      for (j = 0; j < seed.length; ++j) {
        X[j & 7] = (X[j & 7] << 15) ^
            (seed.charCodeAt(j) + X[(j + 1) & 7] << 13);
      }
    }
    // Enforce an array length of 8, not all zeroes.
    while (X.length < 8) X.push(0);
    for (j = 0; j < 8 && X[j] === 0; ++j);
    if (j == 8) X[7] = -1;

    me.x = X;
    me.i = 0;

    // Discard an initial 256 values.
    for (j = 256; j > 0; --j) {
      me.next();
    }
  }

  init(me, seed);
}

function copy(f, t) {
  t.x = f.x.slice();
  t.i = f.i;
  return t;
}

function impl(seed, opts) {
  if (seed == null) seed = +(new Date);
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (state.x) copy(state, xg);
    prng.state = function() { return copy(xg, {}); };
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xorshift7 = impl;
}

})(
  commonjsGlobal,
  module,    // present in node.js
  (typeof undefined) == 'function'    // present with an AMD loader
);
}(xorshift7$1));

var xor4096$1 = {exports: {}};

(function (module) {
// A Javascript implementaion of Richard Brent's Xorgens xor4096 algorithm.
//
// This fast non-cryptographic random number generator is designed for
// use in Monte-Carlo algorithms. It combines a long-period xorshift
// generator with a Weyl generator, and it passes all common batteries
// of stasticial tests for randomness while consuming only a few nanoseconds
// for each prng generated.  For background on the generator, see Brent's
// paper: "Some long-period random number generators using shifts and xors."
// http://arxiv.org/pdf/1004.3115v1.pdf
//
// Usage:
//
// var xor4096 = require('xor4096');
// random = xor4096(1);                        // Seed with int32 or string.
// assert.equal(random(), 0.1520436450538547); // (0, 1) range, 53 bits.
// assert.equal(random.int32(), 1806534897);   // signed int32, 32 bits.
//
// For nonzero numeric keys, this impelementation provides a sequence
// identical to that by Brent's xorgens 3 implementaion in C.  This
// implementation also provides for initalizing the generator with
// string seeds, or for saving and restoring the state of the generator.
//
// On Chrome, this prng benchmarks about 2.1 times slower than
// Javascript's built-in Math.random().

(function(global, module, define) {

function XorGen(seed) {
  var me = this;

  // Set up generator function.
  me.next = function() {
    var w = me.w,
        X = me.X, i = me.i, t, v;
    // Update Weyl generator.
    me.w = w = (w + 0x61c88647) | 0;
    // Update xor generator.
    v = X[(i + 34) & 127];
    t = X[i = ((i + 1) & 127)];
    v ^= v << 13;
    t ^= t << 17;
    v ^= v >>> 15;
    t ^= t >>> 12;
    // Update Xor generator array state.
    v = X[i] = v ^ t;
    me.i = i;
    // Result is the combination.
    return (v + (w ^ (w >>> 16))) | 0;
  };

  function init(me, seed) {
    var t, v, i, j, w, X = [], limit = 128;
    if (seed === (seed | 0)) {
      // Numeric seeds initialize v, which is used to generates X.
      v = seed;
      seed = null;
    } else {
      // String seeds are mixed into v and X one character at a time.
      seed = seed + '\0';
      v = 0;
      limit = Math.max(limit, seed.length);
    }
    // Initialize circular array and weyl value.
    for (i = 0, j = -32; j < limit; ++j) {
      // Put the unicode characters into the array, and shuffle them.
      if (seed) v ^= seed.charCodeAt((j + 32) % seed.length);
      // After 32 shuffles, take v as the starting w value.
      if (j === 0) w = v;
      v ^= v << 10;
      v ^= v >>> 15;
      v ^= v << 4;
      v ^= v >>> 13;
      if (j >= 0) {
        w = (w + 0x61c88647) | 0;     // Weyl.
        t = (X[j & 127] ^= (v + w));  // Combine xor and weyl to init array.
        i = (0 == t) ? i + 1 : 0;     // Count zeroes.
      }
    }
    // We have detected all zeroes; make the key nonzero.
    if (i >= 128) {
      X[(seed && seed.length || 0) & 127] = -1;
    }
    // Run the generator 512 times to further mix the state before using it.
    // Factoring this as a function slows the main generator, so it is just
    // unrolled here.  The weyl generator is not advanced while warming up.
    i = 127;
    for (j = 4 * 128; j > 0; --j) {
      v = X[(i + 34) & 127];
      t = X[i = ((i + 1) & 127)];
      v ^= v << 13;
      t ^= t << 17;
      v ^= v >>> 15;
      t ^= t >>> 12;
      X[i] = v ^ t;
    }
    // Storing state as object members is faster than using closure variables.
    me.w = w;
    me.X = X;
    me.i = i;
  }

  init(me, seed);
}

function copy(f, t) {
  t.i = f.i;
  t.w = f.w;
  t.X = f.X.slice();
  return t;
}
function impl(seed, opts) {
  if (seed == null) seed = +(new Date);
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (state.X) copy(state, xg);
    prng.state = function() { return copy(xg, {}); };
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xor4096 = impl;
}

})(
  commonjsGlobal,                                     // window object or global
  module,    // present in node.js
  (typeof undefined) == 'function'    // present with an AMD loader
);
}(xor4096$1));

var tychei$1 = {exports: {}};

(function (module) {
// A Javascript implementaion of the "Tyche-i" prng algorithm by
// Samuel Neves and Filipe Araujo.
// See https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  // Set up generator function.
  me.next = function() {
    var b = me.b, c = me.c, d = me.d, a = me.a;
    b = (b << 25) ^ (b >>> 7) ^ c;
    c = (c - d) | 0;
    d = (d << 24) ^ (d >>> 8) ^ a;
    a = (a - b) | 0;
    me.b = b = (b << 20) ^ (b >>> 12) ^ c;
    me.c = c = (c - d) | 0;
    me.d = (d << 16) ^ (c >>> 16) ^ a;
    return me.a = (a - b) | 0;
  };

  /* The following is non-inverted tyche, which has better internal
   * bit diffusion, but which is about 25% slower than tyche-i in JS.
  me.next = function() {
    var a = me.a, b = me.b, c = me.c, d = me.d;
    a = (me.a + me.b | 0) >>> 0;
    d = me.d ^ a; d = d << 16 ^ d >>> 16;
    c = me.c + d | 0;
    b = me.b ^ c; b = b << 12 ^ d >>> 20;
    me.a = a = a + b | 0;
    d = d ^ a; me.d = d = d << 8 ^ d >>> 24;
    me.c = c = c + d | 0;
    b = b ^ c;
    return me.b = (b << 7 ^ b >>> 25);
  }
  */

  me.a = 0;
  me.b = 0;
  me.c = 2654435769 | 0;
  me.d = 1367130551;

  if (seed === Math.floor(seed)) {
    // Integer seed.
    me.a = (seed / 0x100000000) | 0;
    me.b = seed | 0;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 20; k++) {
    me.b ^= strseed.charCodeAt(k) | 0;
    me.next();
  }
}

function copy(f, t) {
  t.a = f.a;
  t.b = f.b;
  t.c = f.c;
  t.d = f.d;
  return t;
}
function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); };
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.tychei = impl;
}

})(
  commonjsGlobal,
  module,    // present in node.js
  (typeof undefined) == 'function'    // present with an AMD loader
);
}(tychei$1));

var seedrandom$1 = {exports: {}};

/*
Copyright 2019 David Bau.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

(function (module) {
(function (global, pool, math) {
//
// The following constants are related to IEEE 754 limits.
//

var width = 256,        // each RC4 output is 0 <= x < 256
    chunks = 6,         // at least six RC4 outputs for each double
    digits = 52,        // there are 52 significant digits in a double
    rngname = 'random', // rngname: name for Math.random and Math.seedrandom
    startdenom = math.pow(width, chunks),
    significance = math.pow(2, digits),
    overflow = significance * 2,
    mask = width - 1,
    nodecrypto;         // node.js crypto module, initialized at the bottom.

//
// seedrandom()
// This is the seedrandom function described above.
//
function seedrandom(seed, options, callback) {
  var key = [];
  options = (options == true) ? { entropy: true } : (options || {});

  // Flatten the seed string or build one from local entropy if needed.
  var shortseed = mixkey(flatten(
    options.entropy ? [seed, tostring(pool)] :
    (seed == null) ? autoseed() : seed, 3), key);

  // Use the seed to initialize an ARC4 generator.
  var arc4 = new ARC4(key);

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.
  var prng = function() {
    var n = arc4.g(chunks),             // Start with a numerator n < 2 ^ 48
        d = startdenom,                 //   and denominator d = 2 ^ 48.
        x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  prng.int32 = function() { return arc4.g(4) | 0; };
  prng.quick = function() { return arc4.g(4) / 0x100000000; };
  prng.double = prng;

  // Mix the randomness into accumulated entropy.
  mixkey(tostring(arc4.S), pool);

  // Calling convention: what to return as a function of prng, seed, is_math.
  return (options.pass || callback ||
      function(prng, seed, is_math_call, state) {
        if (state) {
          // Load the arc4 state from the given state if it has an S array.
          if (state.S) { copy(state, arc4); }
          // Only provide the .state method if requested via options.state.
          prng.state = function() { return copy(arc4, {}); };
        }

        // If called as a method of Math (Math.seedrandom()), mutate
        // Math.random because that is how seedrandom.js has worked since v1.0.
        if (is_math_call) { math[rngname] = prng; return seed; }

        // Otherwise, it is a newer calling convention, so return the
        // prng directly.
        else return prng;
      })(
  prng,
  shortseed,
  'global' in options ? options.global : (this == math),
  options.state);
}

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
function ARC4(key) {
  var t, keylen = key.length,
      me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) {
    s[i] = i++;
  }
  for (i = 0; i < width; i++) {
    s[i] = s[j = mask & (j + key[i % keylen] + (t = s[i]))];
    s[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  (me.g = function(count) {
    // Using instance members instead of closure state nearly doubles speed.
    var t, r = 0,
        i = me.i, j = me.j, s = me.S;
    while (count--) {
      t = s[i = mask & (i + 1)];
      r = r * width + s[mask & ((s[i] = s[j = mask & (j + t)]) + (s[j] = t))];
    }
    me.i = i; me.j = j;
    return r;
    // For robust unpredictability, the function call below automatically
    // discards an initial batch of values.  This is called RC4-drop[256].
    // See http://google.com/search?q=rsa+fluhrer+response&btnI
  })(width);
}

//
// copy()
// Copies internal state of ARC4 to or from a plain object.
//
function copy(f, t) {
  t.i = f.i;
  t.j = f.j;
  t.S = f.S.slice();
  return t;
}
//
// flatten()
// Converts an object tree to nested arrays of strings.
//
function flatten(obj, depth) {
  var result = [], typ = (typeof obj), prop;
  if (depth && typ == 'object') {
    for (prop in obj) {
      try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
    }
  }
  return (result.length ? result : typ == 'string' ? obj : obj + '\0');
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
function mixkey(seed, key) {
  var stringseed = seed + '', smear, j = 0;
  while (j < stringseed.length) {
    key[mask & j] =
      mask & ((smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++));
  }
  return tostring(key);
}

//
// autoseed()
// Returns an object for autoseeding, using window.crypto and Node crypto
// module if available.
//
function autoseed() {
  try {
    var out;
    if (nodecrypto && (out = nodecrypto.randomBytes)) {
      // The use of 'out' to remember randomBytes makes tight minified code.
      out = out(width);
    } else {
      out = new Uint8Array(width);
      (global.crypto || global.msCrypto).getRandomValues(out);
    }
    return tostring(out);
  } catch (e) {
    var browser = global.navigator,
        plugins = browser && browser.plugins;
    return [+new Date, global, plugins, global.screen, tostring(pool)];
  }
}

//
// tostring()
// Converts an array of charcodes to a string
//
function tostring(a) {
  return String.fromCharCode.apply(0, a);
}

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to interfere with deterministic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

//
// Nodejs and AMD support: export the implementation as a module using
// either convention.
//
if (module.exports) {
  module.exports = seedrandom;
  // When in node.js, try using crypto package for autoseeding.
  try {
    nodecrypto = require('crypto');
  } catch (ex) {}
} else {
  // When included as a plain script, set up Math.seedrandom global.
  math['seed' + rngname] = seedrandom;
}


// End anonymous scope, and pass initial values.
})(
  // global: `self` in browsers (including strict mode and web workers),
  // otherwise `this` in Node and other environments
  (typeof self !== 'undefined') ? self : commonjsGlobal,
  [],     // pool: entropy pool starts empty
  Math    // math: package containing random, pow, and seedrandom
);
}(seedrandom$1));

// A library of seedable RNGs implemented in Javascript.
//
// Usage:
//
// var seedrandom = require('seedrandom');
// var random = seedrandom(1); // or any seed.
// var x = random();       // 0 <= x < 1.  Every bit is random.
// var x = random.quick(); // 0 <= x < 1.  32 bits of randomness.

// alea, a 53-bit multiply-with-carry generator by Johannes Baagøe.
// Period: ~2^116
// Reported to pass all BigCrush tests.
var alea = alea$1.exports;

// xor128, a pure xor-shift generator by George Marsaglia.
// Period: 2^128-1.
// Reported to fail: MatrixRank and LinearComp.
var xor128 = xor128$1.exports;

// xorwow, George Marsaglia's 160-bit xor-shift combined plus weyl.
// Period: 2^192-2^32
// Reported to fail: CollisionOver, SimpPoker, and LinearComp.
var xorwow = xorwow$1.exports;

// xorshift7, by François Panneton and Pierre L'ecuyer, takes
// a different approach: it adds robustness by allowing more shifts
// than Marsaglia's original three.  It is a 7-shift generator
// with 256 bits, that passes BigCrush with no systmatic failures.
// Period 2^256-1.
// No systematic BigCrush failures reported.
var xorshift7 = xorshift7$1.exports;

// xor4096, by Richard Brent, is a 4096-bit xor-shift with a
// very long period that also adds a Weyl generator. It also passes
// BigCrush with no systematic failures.  Its long period may
// be useful if you have many generators and need to avoid
// collisions.
// Period: 2^4128-2^32.
// No systematic BigCrush failures reported.
var xor4096 = xor4096$1.exports;

// Tyche-i, by Samuel Neves and Filipe Araujo, is a bit-shifting random
// number generator derived from ChaCha, a modern stream cipher.
// https://eden.dei.uc.pt/~sneves/pubs/2011-snfa2.pdf
// Period: ~2^127
// No systematic BigCrush failures reported.
var tychei = tychei$1.exports;

// The original ARC4-based prng included in this library.
// Period: ~2^1600
var sr = seedrandom$1.exports;

sr.alea = alea;
sr.xor128 = xor128;
sr.xorwow = xorwow;
sr.xorshift7 = xorshift7;
sr.xor4096 = xor4096;
sr.tychei = tychei;

var seedrandom = sr;

var dndodPopup_min = {exports: {}};

(function (module, exports) {
!function(t,e){module.exports=e();}(commonjsGlobal,function(){return function(t){function e(o){if(n[o])return n[o].exports;var i=n[o]={i:o,l:!1,exports:{}};return t[o].call(i.exports,i,i.exports,e),i.l=!0,i.exports}var n={};return e.m=t,e.c=n,e.i=function(t){return t},e.d=function(t,n,o){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:o});},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=1)}([function(t,e){t.exports=function(t){return t.webpackPolyfill||(t.deprecate=function(){},t.paths=[],t.children||(t.children=[]),Object.defineProperty(t,"loaded",{enumerable:!0,get:function(){return t.l}}),Object.defineProperty(t,"id",{enumerable:!0,get:function(){return t.i}}),t.webpackPolyfill=1),t};},function(t,e,n){(function(t){var n,o,i,s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};!function(r,a){"object"===s(e)&&"object"===s(t)?t.exports=a():(o=[],n=a,void 0!==(i="function"==typeof n?n.apply(e,o):n)&&(t.exports=i));}(0,function(){return function(t){function e(o){if(n[o])return n[o].exports;var i=n[o]={i:o,l:!1,exports:{}};return t[o].call(i.exports,i,i.exports,e),i.l=!0,i.exports}var n={};return e.m=t,e.c=n,e.i=function(t){return t},e.d=function(t,n,o){e.o(t,n)||Object.defineProperty(t,n,{configurable:!1,enumerable:!0,get:o});},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=0)}([function(t,e,n){function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(e,"__esModule",{value:!0});var i=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(t[o]=n[o]);}return t},s=function(){function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o);}}return function(e,n,o){return n&&t(e.prototype,n),o&&t(e,o),e}}(),r=Object.freeze({prefixClass:"dndod",title:"",msg:"",textAlign:"center",animation:"from-top",animationDuration:250,disableCloseBtn:!1,disableOutline:!1,enableHTML:!1,events:{create:null,mount:null,close:null,unmount:null},buttons:[]}),a=function(){function t(e){o(this,t),this.options={},this.$wrapper=null,this.$popup=null,this.$customBtnWrapper=null,this.$previousActiveElement=document.activeElement||null,this.openTimeout=void 0,this.closeTimeout=void 0,this.resizeHandler=null;var n=i({},r);this.options=i(n,e),"function"==typeof this.options.events.create&&this.options.events.create();}return s(t,[{key:"render",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";this.$wrapper=this.createWrapper(),this.$popup=this.createPopup(t,e),this.$wrapper.appendChild(this.$popup),this.options.buttons.length>0&&(this.$wrapper.classList.add([this.options.prefixClass,"has-btn"].join("-")),this.$customBtnWrapper=this.createCustomBtnWrapper(),this.options.buttons.forEach(this.createCustomBtn.bind(this))),!0!==this.options.disableCloseBtn&&this.$popup.appendChild(this.createCloseBtn()),this.$popup.appendChild(this.createFocusTrap());}},{key:"createWrapper",value:function(){var t=this,e=document.createElement("div");return e.classList.add([this.options.prefixClass,"wrapper"].join("-")),e.classList.add([this.options.prefixClass,"animate",this.options.animation].join("-")),e.classList.toggle([this.options.prefixClass,"no-outline"].join("-"),!0===this.options.disableOutline),250!==this.options.animationDuration&&(e.style.transitionDuration=parseInt(this.options.animationDuration,10)/1e3+"s"),e.setAttribute("tabindex","0"),e.dndodKeydownHandler=function(e){e.stopPropagation(),27===e.keyCode&&t.close();},e.dndodClickHandler=function(e){e.stopPropagation(),t.close();},e.addEventListener("keydown",e.dndodKeydownHandler),e.addEventListener("click",e.dndodClickHandler),e}},{key:"createPopup",value:function(t,e){var n=!0===this.options.enableHTML?"innerHTML":"innerText",o=document.createElement("div");o.classList.add([this.options.prefixClass,"popup"].join("-")),o.classList.toggle([this.options.prefixClass,"text",this.options.textAlign].join("-"),"center"!==this.options.textAlign),250!==this.options.animationDuration&&(o.style.transitionDuration=parseInt(this.options.animationDuration,10)/1e3+"s"),o.setAttribute("tabindex","0"),o.dndodClickHandler=function(t){t.stopPropagation();},o.addEventListener("click",o.dndodClickHandler);var i=document.createElement("h1");i.classList.add([this.options.prefixClass,"heading"].join("-")),i[n]=""+e,o.appendChild(i);var s=document.createElement("p");return s.classList.add([this.options.prefixClass,"body"].join("-")),t instanceof HTMLElement?s.appendChild(t):s[n]=""+t,o.appendChild(s),o}},{key:"createCloseBtn",value:function(){var t=this,e=document.createElement("button");return e.innerHTML="&times;",e.setAttribute("title","Close this popup"),e.classList.add([this.options.prefixClass,"btn-close"].join("-")),e.dndodClickHandler=function(e){e.stopPropagation(),t.close();},e.addEventListener("click",e.dndodClickHandler),e}},{key:"createCustomBtnWrapper",value:function(){var t=document.createElement("div");return t.classList.add([this.options.prefixClass,"custom-btn-wrapper"].join("-")),t}},{key:"createCustomBtn",value:function(t,e,n){var o=this,i=document.createElement("button");i.innerHTML=t.text,i.classList.add([this.options.prefixClass,"btn-custom"].join("-")),t.type=t.type||"default",i.classList.add([this.options.prefixClass,"btn",t.type].join("-")),"function"==typeof t.handler&&(i.dndodClickHandler=function(e){e.stopPropagation(),t.handler(e,o);},i.addEventListener("click",i.dndodClickHandler)),this.$customBtnWrapper.appendChild(i),n[e].$button=i,e===n.length-1&&this.$popup.appendChild(this.$customBtnWrapper);}},{key:"createFocusTrap",value:function(){var t=this,e=document.createElement("span");return e.setAttribute("tabindex","0"),e.addEventListener("focus",function(e){e.stopPropagation(),t.$popup.focus();}),e}},{key:"watchScreenResize",value:function(){var t=this.$wrapper.classList,e=[this.options.prefixClass,"oversize"].join("-");this.$popup.offsetHeight>window.innerHeight-60?t.add(e):t.remove(e);}},{key:"removeAllEventHandler",value:function(){window.removeEventListener("resize",this.resizeHandler),this.$popup.removeEventListener("click",this.$popup.dndodClickHandler),this.$wrapper.removeEventListener("keydown",this.$wrapper.dndodKeydownHandler),this.$wrapper.removeEventListener("click",this.$wrapper.dndodClickHandler),this.options.buttons.forEach(function(t){t.$button.removeEventListener("click",t.$button.dndodClickHandler);});}},{key:"open",value:function(){var t=this;null!==this.$previousActiveElement&&this.$previousActiveElement.blur(),this.render(this.options.msg,this.options.title),"none"===this.options.animation&&this.$wrapper.classList.add([this.options.prefixClass,"status-show"].join("-")),document.body.appendChild(this.$wrapper),setTimeout(function(){"function"==typeof t.options.events.mount&&t.options.events.mount(),"none"!==t.options.animation&&t.$wrapper.classList.add([t.options.prefixClass,"status-show"].join("-"));}),"none"===this.options.animation?this.$popup.focus():this.openTimeout=setTimeout(function(){t.$popup.focus();},this.options.animationDuration),this.watchScreenResize(),this.resizeHandler=this.watchScreenResize.bind(this),window.addEventListener("resize",this.resizeHandler);}},{key:"close",value:function(){var t=this;"function"==typeof this.options.events.close&&this.options.events.close(),this.openTimeout&&clearTimeout(this.openTimeout),this.removeAllEventHandler(),"none"===this.options.animation?this.remove():(this.$wrapper.classList.remove([this.options.prefixClass,"status-show"].join("-")),this.closeTimeout=setTimeout(function(){t.remove();},this.options.animationDuration));}},{key:"remove",value:function(){var t=this;null!==this.$previousActiveElement&&this.$previousActiveElement.focus(),this.$wrapper.parentNode.removeChild(this.$wrapper),setTimeout(function(){"function"==typeof t.options.events.unmount&&t.options.events.unmount();});}}]),t}(),p=e.popup=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};new a(t).open();},u=e.notice=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};e.msg=t,new a(e).open();},l=e.alert=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};e.msg=t,e.buttons=[{text:"OK",type:"primary",handler:function(t,e){e.close();}}],new a(e).open();},c=e.confirm=function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(){},n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};n.msg=t,n.buttons=[{text:"Cancel",handler:function(t,e){e.close();}},{text:"Continue",type:"primary",handler:function(t,n){n.close(),e();}}],new a(n).open();};e.default={popup:p,notice:u,alert:l,confirm:c};}])});}).call(e,n(0)(t));}])});
}(dndodPopup_min));

var dndod = /*@__PURE__*/getDefaultExportFromCjs(dndodPopup_min.exports);

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ".dndod-wrapper{overflow:auto;position:fixed;top:0;left:0;right:0;bottom:0;z-index:1;background-color:transparent;transition-property:background-color;transition-duration:.25s;transform:translateZ(0)}.dndod-wrapper .dndod-popup{position:absolute;top:50%;left:50%;z-index:2;min-width:260px;max-width:100%;min-height:70px;padding:40px 50px;text-align:center;background-color:#fff;box-shadow:-1px 1px 5px rgba(0,0,0,.3);transform:translate(-50%,-50%);transition-property:top;transition-duration:.25s}.dndod-wrapper .dndod-popup .dndod-btn-close{display:block;overflow:hidden;position:absolute;top:3px;right:3px;width:30px;height:30px;margin:0;padding:0;border:0 none;font-family:sans-serif;font-size:2em;font-weight:lighter;line-height:1em;color:#c5c5c5;background-color:#fff;text-align:center;cursor:pointer}.dndod-wrapper .dndod-popup .dndod-btn-close:focus,.dndod-wrapper .dndod-popup .dndod-btn-close:hover{color:#929292}.dndod-wrapper .dndod-popup .dndod-btn-close:active{color:#797979}.dndod-wrapper .dndod-popup .dndod-heading{font-size:1.4em;margin:0 0 20px}.dndod-wrapper .dndod-popup .dndod-body{font-size:1.2em;line-height:1.4em;margin:20px 0}.dndod-wrapper .dndod-popup.dndod-text-left{text-align:left}.dndod-wrapper.dndod-status-show{background-color:rgba(0,0,0,.3)}.dndod-wrapper.dndod-animate-from-top .dndod-popup{top:-50%}.dndod-wrapper.dndod-animate-from-bottom .dndod-popup{top:150%}.dndod-wrapper.dndod-animate-from-bottom.dndod-status-show .dndod-popup,.dndod-wrapper.dndod-animate-from-top.dndod-status-show .dndod-popup{top:50%}.dndod-wrapper.dndod-oversize .dndod-popup{transform:translate(-50%)}.dndod-wrapper.dndod-oversize.dndod-status-show .dndod-popup{margin:30px 0;top:0!important;transition:none}.dndod-wrapper.dndod-has-btn .dndod-popup{padding-bottom:90px}.dndod-wrapper.dndod-no-outline .dndod-popup,.dndod-wrapper.dndod-no-outline .dndod-popup button{outline:0 none}.dndod-custom-btn-wrapper{display:flex;position:absolute;left:0;right:0;bottom:0;height:60px;flex-direction:row;justify-content:center;align-items:center}.dndod-custom-btn-wrapper .dndod-btn-custom{flex:auto;width:auto;height:100%;border:0 none;margin:0;padding:0;font-size:1.1em;cursor:pointer}.dndod-custom-btn-wrapper .dndod-btn-custom:focus,.dndod-custom-btn-wrapper .dndod-btn-custom:hover{background-color:#ddd}.dndod-custom-btn-wrapper .dndod-btn-custom:active{background-color:#d1d1d1}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-default{background-color:#d8d8d8;color:#000}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-default:focus,.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-default:hover{background-color:#cbcbcb}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-default:active{background-color:#bfbfbf}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-kakaobank{background-color:#ffde00;color:#000}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-kakaobank:focus,.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-kakaobank:hover{background-color:#e6c800}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-kakaobank:active{background-color:#ccb200}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-primary{background-color:#00d1b2;color:#fff}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-primary:focus,.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-primary:hover{background-color:#00b89c}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-primary:active{background-color:#009e87}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-danger{background-color:#ff3860;color:#fff}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-danger:focus,.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-danger:hover{background-color:#ff1f4c}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-danger:active{background-color:#ff0537}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-warning{background-color:#ffdd57;color:rgba(0,0,0,.7)}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-warning:focus,.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-warning:hover{background-color:#ffd83e}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-warning:active{background-color:#ffd324}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-success{background-color:#23d160;color:#fff}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-success:focus,.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-success:hover{background-color:#1fbb56}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-success:active{background-color:#1ca54c}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-info{background-color:#209cee;color:#fff}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-info:focus,.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-info:hover{background-color:#1190e3}.dndod-custom-btn-wrapper .dndod-btn-custom.dndod-btn-info:active{background-color:#1081cb}";
styleInject(css_248z);

// The date of the first daily game
// Tue Feb 15 2022
const EPOCH = 1644883200000;
const COMMON_WORDS_URL = "wordlists/common_words.txt";
const ALL_WORDS_URL = "wordlists/all_words.txt";
const THREE_LETTER_WORDS = new Set([
  "brr",
  "bys",
  "cry",
  "cwm",
  "dry",
  "fly",
  "fry",
  "gym",
  "gyp",
  "hmm",
  "hyp",
  "myc",
  "nth",
  "pht",
  "ply",
  "pry",
  "pst",
  "pyx",
  "shh",
  "shy",
  "sky",
  "sly",
  "spy",
  "sty",
  "syn",
  "thy",
  "try",
  "tsk",
  "why",
  "wry",
  "wyn",
  "zzz",
]);

class Game {
  static consonants = "bcdfghjklmnpqrstvwxyz"
  currentRound = 0
  numRounds
  rounds = []
  guesses = []
  name
  allWords
  commonWords

  async loadLists() {
    await fetch(COMMON_WORDS_URL)
      .then((response) => response.text())
      .then((words) => (this.commonWords = words.split("\n")));
    await fetch(ALL_WORDS_URL)
      .then((response) => response.text())
      .then((words) => (this.allWords = new Set(words.split("\n"))));
  }

  async newLetters() {
    for (;;) {
      var newLetters = this.generateLetters();
      for (const [chosenLetters] of this.rounds) {
        if (newLetters == chosenLetters) {
          newLetters = this.generateLetters();
        }
      }
      console.log("trying: " + newLetters);
      var matchedWords = [];

      if (THREE_LETTER_WORDS.has(newLetters)) {
        console.log(newLetters + " is a word");
        continue
      }
      for (const word of this.commonWords) {
        if (this.matches(newLetters, word)) {
          matchedWords.push(word);
        }
      }
      if (matchedWords.length > 0) {
        break
      }
    }
    return [newLetters, matchedWords]
  }

  async generateRounds(n) {
    this.numRounds = n;
    this.currentRound = -1;
    for (var i = 0; i < n; i++) {
      const [chosenLetters, matchedWords] = await this.newLetters();
      this.rounds.push([chosenLetters, matchedWords]);
    }
[this.chosenLetters, this.matchedWords] = this.rounds[0];
  }

  async newGame(name, numRounds) {
    this.guesses = [];
    this.rounds = [];
    this.name = name;
    await this.generateRounds(numRounds);
  }

  nextRound() {
    this.currentRound++;
    if (this.currentRound == this.numRounds) {
      this.chosenLetters = null;
      this.matchedWords = null;
      this.finished = true;
      return
    }
[this.chosenLetters, this.matchedWords] = this.rounds[this.currentRound];
  }

  isWord(word) {
    return this.allWords.has(word)
  }

  generateLetters() {
    var result = "";
    for (var i = 0; i < 3; i++) {
      result += Game.consonants.charAt(
        Math.floor(Math.random() * Game.consonants.length)
      );
    }
    return result
  }

  matches(consonants, word) {
    const regex = new RegExp(
      `^${consonants[0]}.*${consonants[1]}.*${consonants[2]}`
    );
    return word.match(regex) !== null
  }

  guess(guess) {
    const correct =
      this.isWord(guess) && this.matches(this.chosenLetters, guess);
    this.guesses[this.currentRound] = {
      guess: guess,
      correct: correct,
    };
    return correct
  }

  getScore() {
    var numCorrect = 0;
    var longestWord = 0;
    for (const guess of this.guesses) {
      if (guess.correct) {
        numCorrect++;
        if (guess.guess.length > longestWord) {
          longestWord = guess.guess.length;
        }
      }
    }
    return {
      numCorrect: numCorrect,
      longestWord: longestWord,
    }
  }
}
(async () => {
  var game = new Game();
  await game.loadLists();
  var timebar = document.querySelector(".timebar");
  var gameElem = document.querySelector(".game");
  var currentGuessElem = null;

  var lastInputText = "";
  var submitGuess = (guessElem, force) => {
    document.querySelector(".guess.template input.guessInput").value = "";
    lastInputText = "";
    const guess = guessElem
      .querySelector("input.guessInput")
      .value.toLowerCase();
    if (guess === "" && !force) {
      return
    }

    // Replace guess input with div so we can style individual letters
    guessElem.querySelector("input.guessInput").remove();
    const newElem = document.createElement("div");
    newElem.classList.add("submittedGuess");
    var matchedLetters = 0;
    for (const letter of guess) {
      const letterElem = document.createElement("span");
      letterElem.classList.add("guessLetter");
      letterElem.textContent = letter;
      if (letter === game.chosenLetters[matchedLetters]) {
        letterElem.classList.add("givenLetter");
        matchedLetters++;
      }
      newElem.append(letterElem);
    }
    guessElem.prepend(newElem);
    const correct = game.guess(guess);
    guessElem.classList.remove("active");
    guessElem.classList.add("submitted");
    if (correct) {
      guessElem.classList.add("correct");
    } else {
      guessElem.classList.add("incorrect");
    }
  };

  var nextWord = async () => {
    if (
      currentGuessElem !== null &&
      currentGuessElem.classList.contains("active")
    ) {
      submitGuess(currentGuessElem, true);
    }
    game.nextRound();
    if (game.finished) {
      for (const guessElem of gameElem.querySelectorAll(".guess")) {
        if (guessElem.classList.contains("incorrect")) {
          guessElem.querySelector(".help").classList.remove("hidden");
        }
      }
      recordScores();
      showScores();
      return
    }

    var newGuess = gameElem.querySelector(".guess.template").cloneNode(true);
    newGuess.classList.remove("template");
    newGuess.classList.remove("invisible");
    newGuess.querySelector("input.guessInput").disabled = true;
    newGuess.querySelector("input.guessInput").value = "";
    const helpText = `
      Letters: ${game.chosenLetters.toUpperCase()}
      Example answer: ${game.matchedWords[0]}
    `;
    newGuess.querySelector(".help").addEventListener("click", () => {
      dndod.alert(helpText, { animation: "none", textAlign: "left" });
    });
    newGuess.classList.add("active");
    gameElem.querySelector(".guesses").prepend(newGuess);
    currentGuessElem = newGuess;

    var letterEls = gameElem.querySelectorAll(".givenLetters .letter");
    letterEls[0].textContent = game.chosenLetters[0];
    letterEls[1].textContent = game.chosenLetters[1];
    letterEls[2].textContent = game.chosenLetters[2];
    console.log(game.chosenLetters);
    console.log(game.matchedWords);
    timebar.classList.add("animated");
    letterEls[0].classList.add("animated");
    letterEls[1].classList.add("animated");
    letterEls[2].classList.add("animated");
  };

  timebar.addEventListener("animationend", () => {
    timebar.classList.remove("animated");
    for (const letterEl of gameElem.querySelectorAll(".givenLetters .letter")) {
      letterEl.classList.remove("animated");
    }
    setTimeout(() => nextWord(), 0);
  });

  var androidKeydown = (e) => {
    // 13 == Enter
    if (e.which === 13) {
      e.preventDefault();
      return
    }

    setTimeout(() => {
      var inputText = document.querySelector(
        ".guess.template input.guessInput"
      ).value;
      var inputElem = currentGuessElem.querySelector("input.guessInput");
      if (inputText.length > lastInputText.length) {
        var char = inputText.substring(lastInputText.length);
        lastInputText = inputText;
        if (
          inputElem.value === "" &&
          char[0].toLowerCase() != game.chosenLetters[0]
        ) {
          return
        }
        inputElem.value = inputElem.value + char;
      } else if (inputText.length < lastInputText.length) {
        var diff = lastInputText.length - inputText.length;
        lastInputText = inputText;
        inputElem.value = inputElem.value.substring(
          0,
          inputElem.value.length - diff
        );
      }
    }, 10);
  };

  document.onkeydown = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) {
      console.log("skipping due to meta key");
      return
    }

    if (
      currentGuessElem === null ||
      currentGuessElem.classList.contains("submitted")
    ) {
      e.preventDefault();
      return
    }

    if (e.key === "Unidentified") {
      return androidKeydown(e)
    }

    var inputElem = currentGuessElem.querySelector("input.guessInput");
    if (/^[a-zA-Z]$/.test(e.key)) {
      if (
        inputElem.value === "" &&
        e.key.toLowerCase() != game.chosenLetters[0]
      ) {
        return
      }
      inputElem.value = inputElem.value + e.key;
    } else if (e.key === "Backspace") {
      inputElem.value = inputElem.value.substring(0, inputElem.value.length - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  var recordScores = () => {
    if (!localStorage.scores) {
      localStorage.scores = {};
    }
  };

  var showScores = () => {
    const score = game.getScore();
    const msg = `
      4 Second Word Game (${game.name})
      Correct answers: ${score.numCorrect}/${game.rounds.length}
      Longest answer: ${score.longestWord}
    `;
    dndod.popup({
      msg: msg,
      textAlign: "left",
      buttons: [
        {
          text: "Close",
          type: "default",
          handler: (e, p) => {
            p.close();
          },
        },
        {
          text: "Share",
          type: "primary",
          handler: () => {
            navigator.clipboard.writeText(msg);
            dndod.alert("Copied to clipboard", { animation: "none" });
          },
        },
      ],
    });
  };

  var start = async () => {
    gameElem.querySelector(".givenLetters").classList.remove("hidden");
    for (const startButton of gameElem.querySelectorAll(".start,.howToPlay")) {
      startButton.classList.add("hidden");
    }
    timebar.classList.add("animated");
    document.querySelector("input.guessInput").focus();
    var letterEls = document.querySelectorAll(".givenLetters .letter");

    setTimeout(() => {
      letterEls[2].textContent = "3";
      letterEls[2].classList.add("animated");
      setTimeout(() => {
        letterEls[2].getAnimations()[0].currentTime += 1000;
      }, 500);

      setTimeout(() => {
        letterEls[1].textContent = "2";
        letterEls[1].classList.add("animated");
        setTimeout(() => {
          letterEls[1].getAnimations()[0].currentTime += 2000;
        }, 500);
        setTimeout(() => {
          letterEls[0].textContent = "1";
          letterEls[0].classList.add("animated");
          setTimeout(() => {
            letterEls[0].getAnimations()[0].currentTime += 3000;
          }, 500);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  document.querySelector(".howToPlay").addEventListener("click", async () => {
    const msg = document.querySelector(".howToPlayText").cloneNode(true);
    msg.classList.remove("hidden");
    dndod.popup({
      title: "How to play 4 Second Word Game",
      msg: msg,
      textAlign: "left",
      enableHTML: true,
      buttons: [
        {
          text: "Close",
          type: "default",
          handler: (e, p) => {
            p.close();
          },
        },
      ],
    });
  });

  if (!localStorage.seenHelp) {
    localStorage.seenHelp = true;
    setTimeout(() => {
      document.querySelector(".howToPlay").click();
    }, 0);
  }

  document
    .querySelector(".startPractice")
    .addEventListener("click", async () => {
      seedrandom(undefined, { global: true });
      await game.newGame("Practice", 10);
      start();
    });

  document.querySelector(".startDaily").addEventListener("click", async () => {
    seedrandom(new Date().toDateString(), { global: true });
    const dailyNum = Math.ceil((new Date().getTime() - EPOCH) / 86400000);
    await game.newGame("Daily #" + dailyNum, 10);
    start();
  });
})();
