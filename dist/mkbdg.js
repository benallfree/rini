// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"latlon-geohash.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* Geohash encoding/decoding and associated functions   (c) Chris Veness 2014-2019 / MIT Licence  */

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
const base32 = '0123456789bcdefghjkmnpqrstuvwxyz'; // (geohash-specific) Base32 map

/**
 * Geohash: Gustavo Niemeyer’s geocoding system.
 */

class Geohash {
  /**
   * Encodes latitude/longitude to geohash, either to specified precision or to automatically
   * evaluated precision.
   *
   * @param   {number} lat - Latitude in degrees.
   * @param   {number} lon - Longitude in degrees.
   * @param   {number} [precision] - Number of characters in resulting geohash.
   * @returns {string} Geohash of supplied latitude/longitude.
   * @throws  Invalid geohash.
   *
   * @example
   *     const geohash = Geohash.encode(52.205, 0.119, 7); // => 'u120fxw'
   */
  static encode(lat, lon, precision) {
    // infer precision?
    if (typeof precision == 'undefined') {
      // refine geohash until it matches precision of supplied lat/lon
      for (let p = 1; p <= 12; p++) {
        const hash = Geohash.encode(lat, lon, p);
        const posn = Geohash.decode(hash);
        if (posn.lat == lat && posn.lon == lon) return hash;
      }

      precision = 12; // set to maximum
    }

    lat = Number(lat);
    lon = Number(lon);
    precision = Number(precision);
    if (isNaN(lat) || isNaN(lon) || isNaN(precision)) throw new Error('Invalid geohash');
    let idx = 0; // index into base32 map

    let bit = 0; // each char holds 5 bits

    let evenBit = true;
    let geohash = '';
    let latMin = -90,
        latMax = 90;
    let lonMin = -180,
        lonMax = 180;

    while (geohash.length < precision) {
      if (evenBit) {
        // bisect E-W longitude
        const lonMid = (lonMin + lonMax) / 2;

        if (lon >= lonMid) {
          idx = idx * 2 + 1;
          lonMin = lonMid;
        } else {
          idx = idx * 2;
          lonMax = lonMid;
        }
      } else {
        // bisect N-S latitude
        const latMid = (latMin + latMax) / 2;

        if (lat >= latMid) {
          idx = idx * 2 + 1;
          latMin = latMid;
        } else {
          idx = idx * 2;
          latMax = latMid;
        }
      }

      evenBit = !evenBit;

      if (++bit == 5) {
        // 5 bits gives us a character: append it and start over
        geohash += base32.charAt(idx);
        bit = 0;
        idx = 0;
      }
    }

    return geohash;
  }
  /**
   * Decode geohash to latitude/longitude (location is approximate centre of geohash cell,
   *     to reasonable precision).
   *
   * @param   {string} geohash - Geohash string to be converted to latitude/longitude.
   * @returns {{lat:number, lon:number}} (Center of) geohashed location.
   * @throws  Invalid geohash.
   *
   * @example
   *     const latlon = Geohash.decode('u120fxw'); // => { lat: 52.205, lon: 0.1188 }
   */


  static decode(geohash) {
    const bounds = Geohash.bounds(geohash); // <-- the hard work
    // now just determine the centre of the cell...

    const latMin = bounds.sw.lat,
          lonMin = bounds.sw.lon;
    const latMax = bounds.ne.lat,
          lonMax = bounds.ne.lon; // cell centre

    let lat = (latMin + latMax) / 2;
    let lon = (lonMin + lonMax) / 2; // round to close to centre without excessive precision: ⌊2-log10(Δ°)⌋ decimal places

    lat = lat.toFixed(Math.floor(2 - Math.log(latMax - latMin) / Math.LN10));
    lon = lon.toFixed(Math.floor(2 - Math.log(lonMax - lonMin) / Math.LN10));
    return {
      lat: Number(lat),
      lon: Number(lon)
    };
  }
  /**
   * Returns SW/NE latitude/longitude bounds of specified geohash.
   *
   * @param   {string} geohash - Cell that bounds are required of.
   * @returns {{sw: {lat: number, lon: number}, ne: {lat: number, lon: number}}}
   * @throws  Invalid geohash.
   */


  static bounds(geohash) {
    if (geohash.length == 0) throw new Error('Invalid geohash');
    geohash = geohash.toLowerCase();
    let evenBit = true;
    let latMin = -90,
        latMax = 90;
    let lonMin = -180,
        lonMax = 180;

    for (let i = 0; i < geohash.length; i++) {
      const chr = geohash.charAt(i);
      const idx = base32.indexOf(chr);
      if (idx == -1) throw new Error('Invalid geohash');

      for (let n = 4; n >= 0; n--) {
        const bitN = idx >> n & 1;

        if (evenBit) {
          // longitude
          const lonMid = (lonMin + lonMax) / 2;

          if (bitN == 1) {
            lonMin = lonMid;
          } else {
            lonMax = lonMid;
          }
        } else {
          // latitude
          const latMid = (latMin + latMax) / 2;

          if (bitN == 1) {
            latMin = latMid;
          } else {
            latMax = latMid;
          }
        }

        evenBit = !evenBit;
      }
    }

    const bounds = {
      sw: {
        lat: latMin,
        lon: lonMin
      },
      ne: {
        lat: latMax,
        lon: lonMax
      }
    };
    return bounds;
  }
  /**
   * Determines adjacent cell in given direction.
   *
   * @param   geohash - Cell to which adjacent cell is required.
   * @param   direction - Direction from geohash (N/S/E/W).
   * @returns {string} Geocode of adjacent cell.
   * @throws  Invalid geohash.
   */


  static adjacent(geohash, direction) {
    // based on github.com/davetroy/geohash-js
    geohash = geohash.toLowerCase();
    direction = direction.toLowerCase();
    if (geohash.length == 0) throw new Error('Invalid geohash');
    if ('nsew'.indexOf(direction) == -1) throw new Error('Invalid direction');
    const neighbour = {
      n: ['p0r21436x8zb9dcf5h7kjnmqesgutwvy', 'bc01fg45238967deuvhjyznpkmstqrwx'],
      s: ['14365h7k9dcfesgujnmqp0r2twvyx8zb', '238967debc01fg45kmstqrwxuvhjyznp'],
      e: ['bc01fg45238967deuvhjyznpkmstqrwx', 'p0r21436x8zb9dcf5h7kjnmqesgutwvy'],
      w: ['238967debc01fg45kmstqrwxuvhjyznp', '14365h7k9dcfesgujnmqp0r2twvyx8zb']
    };
    const border = {
      n: ['prxz', 'bcfguvyz'],
      s: ['028b', '0145hjnp'],
      e: ['bcfguvyz', 'prxz'],
      w: ['0145hjnp', '028b']
    };
    const lastCh = geohash.slice(-1); // last character of hash

    let parent = geohash.slice(0, -1); // hash without last character

    const type = geohash.length % 2; // check for edge-cases which don't share common prefix

    if (border[direction][type].indexOf(lastCh) != -1 && parent != '') {
      parent = Geohash.adjacent(parent, direction);
    } // append letter for direction to parent


    return parent + base32.charAt(neighbour[direction][type].indexOf(lastCh));
  }
  /**
   * Returns all 8 adjacent cells to specified geohash.
   *
   * @param   {string} geohash - Geohash neighbours are required of.
   * @returns {{n,ne,e,se,s,sw,w,nw: string}}
   * @throws  Invalid geohash.
   */


  static neighbours(geohash) {
    return {
      'n': Geohash.adjacent(geohash, 'n'),
      'ne': Geohash.adjacent(Geohash.adjacent(geohash, 'n'), 'e'),
      'e': Geohash.adjacent(geohash, 'e'),
      'se': Geohash.adjacent(Geohash.adjacent(geohash, 's'), 'e'),
      's': Geohash.adjacent(geohash, 's'),
      'sw': Geohash.adjacent(Geohash.adjacent(geohash, 's'), 'w'),
      'w': Geohash.adjacent(geohash, 'w'),
      'nw': Geohash.adjacent(Geohash.adjacent(geohash, 'n'), 'w')
    };
  }

}
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


var _default = Geohash;
exports.default = _default;
},{}],"places.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = [{
  title: "El Capitan, CA, USA",
  lat: 37.733952,
  lng: -119.637756
}, {
  title: "Raymond James Stadium, FL, USA",
  lat: 27.975958,
  lng: -82.503693
}, {
  title: "St. James\u2019s Park, London, UK",
  lat: 51.502464,
  lng: -0.137
}, {
  title: "Royal Botanic Gardens, Kew",
  lat: 51.478298,
  lng: -0.297954
}, {
  title: "Obelisco de Buenos Aires, Argentina",
  lat: -34.60385,
  lng: -58.381775
}, {
  title: "Hoboken, NJ, USA",
  lat: 40.745255,
  lng: -74.034775
}, {
  title: "Katz's Delicatessen, New York, USA",
  lat: 40.722195,
  lng: -73.98748
}, {
  title: "Brooklyn Bridge Park, New York, USA",
  lat: 40.699215,
  lng: -73.999039
}, {
  title: "The Intrepid Sea, Air & Space Museum, NY, USA",
  lat: 40.764389,
  lng: -73.999786
}, {
  title: "Top of The Rock, New York, USA",
  lat: 40.75906,
  lng: -73.979431
}, {
  title: "The High Line, NY, USA",
  lat: 40.747993,
  lng: -74.00489
}, {
  title: "DLF Mall of India, Uttar Pradesh, India",
  lat: 28.56719,
  lng: 77.320892
}, {
  title: "Mantri Square Mall, Bangalore, India",
  lat: 12.991753,
  lng: 77.569641
}, {
  title: "The National Mall, Washington, USA",
  lat: 38.887161,
  lng: -77.037331
}, {
  title: "Six Flags M\u00E9xico, Mexico",
  lat: 19.295525,
  lng: -99.210808
}, {
  title: "Forum Buenavista Centro Comercial, Mexico",
  lat: 19.449223,
  lng: -99.152466
}, {
  title: "Eco Park, Kolkata, India",
  lat: 22.60309,
  lng: 88.466576
}, {
  title: "Lalbagh Botanical Garden, Bengaluru, India",
  lat: 12.950771,
  lng: 77.584236
}, {
  title: "Phoenix Marketcity, Bengaluru, India",
  lat: 12.995854,
  lng: 77.69635
}, {
  title: "Piazza San Marco, Venice, Italy",
  lat: 45.434185,
  lng: 12.337817
}, {
  title: "Sandringham, the birthplace of Diana, Princess of Wales",
  lat: 52.827015,
  lng: 0.515626
}, {
  title: "Universal Orlando Resort, FL, USA",
  lat: 28.474386,
  lng: -81.468193
}, {
  title: "Costanera Center, Chile",
  lat: -33.41798,
  lng: -70.607224
}, {
  title: "Christmas Place, TN, USA",
  lat: 35.809563,
  lng: -83.578728
}, {
  title: "Bronner's CHRISTmas Wonderland, MI, USA",
  lat: 43.313988,
  lng: -83.737228
}, {
  title: "Beto Carrero World, Penha, Brazil",
  lat: -26.80164,
  lng: -48.61768
}, {
  title: "Rockefeller Center, NY, USA",
  lat: 40.758678,
  lng: -73.978798
}, {
  title: "Sri Harmandir Sahib, Amritsar, India",
  lat: 31.620132,
  lng: 74.876091
}, {
  title: "Orion Mall, Bangalore, India",
  lat: 13.011053,
  lng: 77.554939
}, {
  title: "Disney Springs, FL, USA",
  lat: 28.37097,
  lng: -81.519249
}, {
  title: "Champ de Mars, Paris, France",
  lat: 48.855633,
  lng: 2.298337
}, {
  title: "Lulu International Shopping Mall, Kerala, India",
  lat: 10.026617,
  lng: 76.308411
}, {
  title: "Municipal Market of S\u00E3o Paulo, Brazil",
  lat: -23.54181,
  lng: -46.629387
}, {
  title: "Alexanderplatz, Berlin, Germany",
  lat: 52.521992,
  lng: 13.413244
}, {
  title: "Magic Kingdom Park, FL, USA",
  lat: 28.417665,
  lng: -81.581238
}, {
  title: "The Maidan, Kolkata, India",
  lat: 22.554443,
  lng: 88.340569
}, {
  title: "Mysore Palace, Karnataka, India",
  lat: 12.305199,
  lng: 76.654549
}, {
  title: "The India Gate, New Delhi, India",
  lat: 28.612894,
  lng: 77.229446
}, {
  title: "Al-Masjid an-Nabawi, Medina, Saudi Arabia",
  lat: 24.467035,
  lng: 39.610947
}, {
  title: "Gateway Of India Mumbai, Maharashtra, India",
  lat: 18.922064,
  lng: 72.834641
}, {
  title: "Henham Park, which has been home to Latitude Festival",
  lat: 52.334541,
  lng: 1.594031
}, {
  title: "Marlay Park, which has been home to Longitude Festival",
  lat: 53.273392,
  lng: -6.269268
}, {
  title: "The Hollywood Bowl, Los Angeles, USA",
  lat: 34.112236,
  lng: -118.339432
}, {
  title: "Hollywood & Highland, Los Angeles, USA",
  lat: 34.10231,
  lng: -118.340027
}, {
  title: "Intercity Istanbul Park, Turkey",
  lat: 40.95787,
  lng: 29.410341
}, {
  title: "Dodger Stadium, Los Angeles, USA",
  lat: 34.073814,
  lng: -118.240784
}, {
  title: "Macy\u2019s, New York City, USA",
  lat: 40.750797,
  lng: -73.989578
}, {
  title: "9/11 Memorial & Museum, New York, USA",
  lat: 40.711449,
  lng: -74.013855
}, {
  title: "Madame Tussauds New York, USA",
  lat: 40.756409,
  lng: -73.988823
}, {
  title: "Webomaze Pty Ltd, Melbourne, Australia",
  lat: -37.821228,
  lng: 144.962814
}, {
  title: "Wembley Stadium, London, UK",
  lat: 51.555973,
  lng: -0.279672
}, {
  title: "Steventon, the village where Jane Austen was born",
  lat: 51.228409,
  lng: -1.221213
}, {
  title: "Queens Center, NY, USA",
  lat: 40.73447,
  lng: -73.86972
}, {
  title: "The Museum of Modern Art, NY, USA",
  lat: 40.761509,
  lng: -73.978271
}, {
  title: "John F. Kennedy International Airport, NY, USA",
  lat: 40.641766,
  lng: -73.780968
}, {
  title: "The Battery, New York, USA",
  lat: 40.703564,
  lng: -74.016678
}, {
  title: "Bryant Park, New York, USA",
  lat: 40.753742,
  lng: -73.983559
}, {
  title: "Solomon R. Guggenheim Museum, NY, USA",
  lat: 40.782951,
  lng: -73.958992
}, {
  title: "Shusha, Azerbaijan",
  lat: 39.757969,
  lng: 46.741627
}, {
  title: "G\u00F6bekli Tepe, \u015Eanl\u0131urfa, Turkey",
  lat: 37.223194,
  lng: 38.922325
}, {
  title: "Strand Bookstore, New York, USA",
  lat: 40.733288,
  lng: -73.990974
}, {
  title: "Shakespeare & Company, Paris, France",
  lat: 48.852524,
  lng: 2.34713
}, {
  title: "Du Pain et des Id\u00E9es, Paris, France",
  lat: 48.871265,
  lng: 2.362855
}, {
  title: "Conditori La Glace, Copenhagen, Denmark",
  lat: 55.678551,
  lng: 12.573539
}, {
  title: "Dominique Ansel Bakery, New York, USA",
  lat: 40.725185,
  lng: -74.002998
}, {
  title: "Pripyat, Ukraine",
  lat: 51.406681,
  lng: 30.046425
}, {
  title: "Al Naseem Perfume Industry, UAE",
  lat: 25.437786,
  lng: 55.549088
}, {
  title: "Southern Handling Systems, AL, USA",
  lat: 32.360279,
  lng: -86.264862
}, {
  title: "Wave Break Island, Australia",
  lat: -27.934725,
  lng: 153.415543
}, {
  title: "Nazar\u00E9, Portugal",
  lat: 39.601875,
  lng: -9.071212
}, {
  title: "Fairchild Communication Systems, Inc.",
  lat: 39.814957,
  lng: -86.044823
}, {
  title: "Inexture Solutions LLP, India",
  lat: 23.070438,
  lng: 72.517693
}, {
  title: "Carlo's Bakery, Hoboken, NJ, USA",
  lat: 40.737198,
  lng: -74.030815
}, {
  title: "Zeit f\u00FCr Brot, Berlin, Germany",
  lat: 52.527981,
  lng: 13.408488
}, {
  title: "Lifestyle Group, Indianapolis, USA",
  lat: 39.731449,
  lng: -86.056862
}, {
  title: "Anne Frank House, Amsterdam, Netherlands",
  lat: 52.375191,
  lng: 4.883928
}, {
  title: "Joe's Pizza, NY, USA",
  lat: 40.730522,
  lng: -74.002205
}, {
  title: "Kona Skate Park, Florida, USA",
  lat: 30.323277,
  lng: -81.564995
}, {
  title: "Black Pearl Skate and Surf Park, Cayman Islands",
  lat: 19.282921,
  lng: -81.345596
}, {
  title: "Breiner Company Incorporated, Avon, USA",
  lat: 39.758938,
  lng: -86.388336
}, {
  title: "Howells Carpet Cleaning, Milwaukie, USA",
  lat: 45.454582,
  lng: -122.585197
}, {
  title: "Burgers N' Fries Forever, Ottawa, Canada",
  lat: 45.414356,
  lng: -75.695282
}, {
  title: "The Azadi Tower, Tehran, Iran",
  lat: 35.699444,
  lng: 51.337776
}, {
  title: "Christmas Island Detention Centre, Christmas Island",
  lat: -10.471097,
  lng: 105.575569
}, {
  title: "Canadian Forces Base Trenton, Quinte West, ON, Canada",
  lat: 44.118889,
  lng: -77.528053
}, {
  title: "Bavaria, Germany",
  lat: 48.7775,
  lng: 11.431111
}, {
  title: "Clarence House, London, England, the UK",
  lat: 51.504002,
  lng: -0.1385
}, {
  title: "La Gomera, the Canary Islands, Spain",
  lat: 28.116667,
  lng: -17.216667
}, {
  title: "Qom City, Qom Province, Iran",
  lat: 34.639999,
  lng: 50.876389
}, {
  title: "Daegu, Yeongnam, South Korea",
  lat: 35.866669,
  lng: 128.600006
}, {
  title: "Guglielmo Marconi Airport, Italy",
  lat: 44.535442,
  lng: 11.288667
}, {
  title: "Lombardy, Italy",
  lat: 45.585556,
  lng: 9.930278
}, {
  title: "Malpensa International Airport, Italy",
  lat: 8.723056,
  lng: 8.723056
}, {
  title: "The Robert Koch Institute, Berlin, Germany",
  lat: 52.540207,
  lng: 13.343626
}, {
  title: "The Chinese Center for Disease Control and Prevention, Beijing, China",
  lat: 39.880924,
  lng: 116.394936
}, {
  title: "Wuhan Central Hospital, Wuhan, Hubei, China",
  lat: 30.581322,
  lng: 114.295181
}, {
  title: "Huoshenshan Hospital, Wuhan, Hubei, China",
  lat: 30.5291,
  lng: 114.082199
}, {
  title: "The Lazzaro Spallanzani National Institute for Infectious Diseases, Italy",
  lat: 41.866199,
  lng: 12.4576
}, {
  title: "The Netherlands National Institute for Public Health and the Environment",
  lat: 52.118523,
  lng: 5.189059
}, {
  title: "The Centers for Disease Control and Prevention, Atlanta, GA, the US",
  lat: 33.799442,
  lng: -84.328331
}];
},{}],"mkbdg.ts":[function(require,module,exports) {
"use strict";

var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function (resolve) {
      resolve(value);
    });
  }

  return new (P || (P = Promise))(function (resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }

    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }

    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }

    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};

var __generator = this && this.__generator || function (thisArg, body) {
  var _ = {
    label: 0,
    sent: function () {
      if (t[0] & 1) throw t[1];
      return t[1];
    },
    trys: [],
    ops: []
  },
      f,
      y,
      t,
      g;
  return g = {
    next: verb(0),
    "throw": verb(1),
    "return": verb(2)
  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
    return this;
  }), g;

  function verb(n) {
    return function (v) {
      return step([n, v]);
    };
  }

  function step(op) {
    if (f) throw new TypeError("Generator is already executing.");

    while (_) try {
      if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
      if (y = 0, t) op = [op[0] & 2, t.value];

      switch (op[0]) {
        case 0:
        case 1:
          t = op;
          break;

        case 4:
          _.label++;
          return {
            value: op[1],
            done: false
          };

        case 5:
          _.label++;
          y = op[1];
          op = [0];
          continue;

        case 7:
          op = _.ops.pop();

          _.trys.pop();

          continue;

        default:
          if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
            _ = 0;
            continue;
          }

          if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
            _.label = op[1];
            break;
          }

          if (op[0] === 6 && _.label < t[1]) {
            _.label = t[1];
            t = op;
            break;
          }

          if (t && _.label < t[2]) {
            _.label = t[2];

            _.ops.push(op);

            break;
          }

          if (t[2]) _.ops.pop();

          _.trys.pop();

          continue;
      }

      op = body.call(thisArg, _);
    } catch (e) {
      op = [6, e];
      y = 0;
    } finally {
      f = t = 0;
    }

    if (op[0] & 5) throw op[1];
    return {
      value: op[0] ? op[1] : void 0,
      done: true
    };
  }
};

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var avatar_builder_1 = __importDefault(require("avatar-builder"));

var bottleneck_1 = __importDefault(require("bottleneck"));

var fs_1 = __importDefault(require("fs"));

var path_1 = require("path");

var sharp_1 = __importDefault(require("sharp"));

var latlon_geohash_1 = __importDefault(require("./latlon-geohash"));

var places_1 = __importDefault(require("./places"));

var limiter = new bottleneck_1.default({
  maxConcurrent: 50
});
var avatar = avatar_builder_1.default.builder(avatar_builder_1.default.Image.margin(avatar_builder_1.default.Image.circleMask(avatar_builder_1.default.Image.identicon())), 512, 512, {
  cache: avatar_builder_1.default.Cache.lru()
});
Promise.all(places_1.default.map(function (_a) {
  var title = _a.title,
      lat = _a.lat,
      lng = _a.lng;
  return limiter.schedule(function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var geohash, fout, binacularsBuf, _a, baseBuf, base;

      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            geohash = latlon_geohash_1.default.encode(lat, lng, 9);
            fout = "./badges/" + geohash + ".png";
            console.log("Writing " + fout);
            _a = sharp_1.default;
            return [4
            /*yield*/
            , fs_1.default.readFileSync(path_1.resolve(path_1.dirname(__filename), '../bin/314101.png'))];

          case 1:
            return [4
            /*yield*/
            , _a.apply(void 0, [_b.sent()]).resize(512, 512, {
              fit: 'inside'
            }).toBuffer()];

          case 2:
            binacularsBuf = _b.sent();
            return [4
            /*yield*/
            , avatar.create(geohash)];

          case 3:
            baseBuf = _b.sent();
            return [4
            /*yield*/
            , sharp_1.default(baseBuf).composite([{
              input: binacularsBuf
            }]).toFile(fout)];

          case 4:
            base = _b.sent();
            return [2
            /*return*/
            ];
        }
      });
    });
  });
})); // avatar.create('crfxvrfxvrfx').then((buffer) => fs.writeFileSync('avatar-crfxvrfxvrfx.png', buffer))
// avatar.create('gabriel').then((buffer) => fs.writeFileSync('avatar-gabriel.png', buffer))
// avatar.create('allaigre').then((buffer) => fs.writeFileSync('avatar-allaigre.png', buffer))
},{"./latlon-geohash":"latlon-geohash.js","./places":"places.ts"}]},{},["mkbdg.ts"], null)
//# sourceMappingURL=/mkbdg.js.map