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
  'watchFile', 'unwatchFile',
  'watch',
  'exists', 'existsSync',
  'createReadStream', 'createWriteStream',
];

var twoPathMethods = [
  'rename', 'renameSync',
  'link', 'linkSync',
  'symlink', 'symlinkSync',
];

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

  methods.forEach(function (name) {
    safefs[name] = function (path) {
      var data = checkLimit(path);
      var callback = name.indexOf('Sync') > 0 ? null : arguments[arguments.length - 1];
      if (data.error) {
        if (name.indexOf('exists') === 0) {
          if (callback) {
            return callback(false);
          }
          return false;
        }

        if (callback) {
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
      if (err) {
        if (callback) {
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


