/**!
 * nae-fs - lib/fs.js
 *
 * Copyright(c) nae team and other contributors.
 * MIT Licensed
 *
 * Authors:
 *   fengmk2 <fengmk2@gmail.com> (http://fengmk2.github.com)
 */

"use strict";

/**
 * Module dependencies.
 */

// hacking the `realpath`, avoid additional fs.stat calls for known real paths.

var debug = require('debug')('nae:fs');
var fs = require('fs');
var pathModule = require('path');
var Stream = require('stream').Stream;
var Readable = Stream.Readable;
var Writable = Stream.Writable;

var copys = [
  'fchown', 'fchownSync',
  'fchmod', 'fchmodSync',
  'fstat', 'fstatSync',
  'close', 'closeSync',
  'futimes', 'futimesSync',
  'fsync', 'fsyncSync',
  'write', 'writeSync',
  'read', 'readSync',
  'ftruncate', 'ftruncateSync',
];

var methods = [
  'truncate', 'truncateSync',
  'chown', 'chownSync',
  'lchown', 'lchownSync',
  'chmod', 'chmodSync',
  'lchmod', 'lchmodSync',
  'stat', 'statSync',
  'lstat', 'lstatSync',
  'readlink', 'readlinkSync',
  'realpath', 'realpathSync',
  'unlink', 'unlinkSync',
  'rmdir', 'rmdirSync',
  'mkdir', 'mkdirSync',
  'readdir', 'readdirSync',
  'open', 'openSync',
  'utimes', 'utimesSync',
  'readFile', 'readFileSync',
  'writeFile', 'writeFileSync',
  'appendFile', 'appendFileSync',
  'exists',
  'existsSync',
];

var twoPathMethods = [
  'rename', 'renameSync',
  'link', 'linkSync',
  'symlink', 'symlinkSync',
];

/**
 * Create a safe file sytem module.
 *
 * @param {Object} options
 *  - {Function|String} pwd current process working dir
 *  - {String} [limitRoot] limit root dir, default is `pwd`.
 * @return {Object} safe file module
 */
exports.create = function (options) {
  var pwd = options.pwd;
  if (typeof pwd === 'string') {
    var _pwd = pwd;
    pwd = function () {
      return _pwd;
    };
  }
  var _limitRootDir = options.limitRoot || pwd();
  _limitRootDir = _limitRootDir.replace(/\/+$/, '') + '/';

  function checkLimit(path) {
    var realpath = pathModule.resolve(pwd(), path);
    var data = {
      path: realpath,
      error: null
    };
    if (realpath.indexOf(_limitRootDir) !== 0) {
      // TODO: windows support?
      var err = new Error("EACCES, permission denied '" + path + "'");
      err.errno = 3;
      err.code = 'EACCES';
      err.path = path;
      err.pwd = pwd;
      err.limitRoot = _limitRootDir;
      data.error = err;
    }

    debug('checkLimit %j', data);
    return data;
  }

  var safefs = {};
  for (var i = 0; i < copys.length; i++) {
    var name = copys[i];
    safefs[name] = fs[name];
  }

  function createStream(name, StreamType) {
    return function (path) {
      var data = checkLimit(path);
      if (data.error) {
        var stream = new StreamType();
        process.nextTick(stream.emit.bind(stream, 'error', data.error));
        return stream;
      }

      var args = Array.prototype.slice.call(arguments);
      args[0] = data.path;
      return fs[name].apply(fs, args);
    };
  }

  safefs.createReadStream = createStream('createReadStream', Readable);
  safefs.createWriteStream = createStream('createWriteStream', Writable);

  function createWatch(name) {
    return function (path) {
      var data = checkLimit(path);
      if (data.error) {
        throw data.error;
      }

      var args = Array.prototype.slice.call(arguments);
      args[0] = data.path;
      return fs[name].apply(fs, args);
    };
  }

  safefs.watchFile = createWatch('watchFile');
  safefs.unwatchFile = createWatch('unwatchFile');
  safefs.watch = createWatch('watch');

  methods.forEach(function (name) {
    safefs[name] = function (path) {
      var data = checkLimit(path);
      var callback = name.indexOf('Sync') > 0 ? null : arguments[arguments.length - 1];
      var isFunction = typeof callback === 'function';
      if (data.error) {
        if (name.indexOf('exists') === 0) {
          if (isFunction && callback) {
            return callback(false);
          }
          return false;
        }

        if (isFunction && callback) {
          return callback(data.error);
        }
        throw data.error;
      }

      var args = Array.prototype.slice.call(arguments);
      args[0] = data.path;
      return fs[name].apply(fs, args);
    };
  });

  twoPathMethods.forEach(function (name) {
    safefs[name] = function (path1, path2) {
      var data1 = checkLimit(path1);
      var data2 = checkLimit(path2);
      var err = data1.error || data2.error;
      var callback = name.indexOf('Sync') > 0 ? null : arguments[arguments.length - 1];
      var isFunction = typeof callback === 'function';
      if (err) {
        if (isFunction && callback) {
          return callback(err);
        }
        throw err;
      }

      var args = Array.prototype.slice.call(arguments);
      args[0] = data1.path;
      args[1] = data2.path;
      return fs[name].apply(fs, args);
    };
  });

  return safefs;
};


