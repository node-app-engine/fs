nae-fs
=======

[![Build Status](https://secure.travis-ci.org/node-app-engine/fs.png)](http://travis-ci.org/node-app-engine/fs) [![Coverage Status](https://coveralls.io/repos/node-app-engine/fs/badge.png)](https://coveralls.io/r/node-app-engine/fs) [![Dependency Status](https://gemnasium.com/node-app-engine/fs.png)](https://gemnasium.com/node-app-engine/fs)

[![NPM](https://nodei.co/npm/nae-fs.png?downloads=true&stars=true)](https://nodei.co/npm/nae-fs/)

![logo](https://raw.github.com/node-app-engine/fs/master/logo.png)

nae file system.

## From

* `fs.js` base on [node/v0.11.9/lib/fs.js](https://raw.github.com/joyent/node/v0.11.9/lib/fs.js)

## Install

```bash
$ npm install nae-fs --registry=http://registry.cnpmjs.org
```

## Usage

```js
var fs = require('nae-fs').create({
  pwd: '/home/nae/app1',
  limitRoot: '/home/nae/app1'
});

fs.writeFileSync('foo.txt', 'bar');
fs.readFileSync('./foo.txt', 'utf8'); // should be 'bar'
```

## License

(The MIT License)

Copyright (c) nae team and other contributors.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
