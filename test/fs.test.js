/**!
 * nae-fs - test/fs.test.js
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

var path = require('path');
var pedding = require('pedding');
var should = require('should');
var fs = require('../').create({
  limitRoot: path.join(__dirname, 'fixtures'),
  pwd: path.join(__dirname, 'fixtures'),
});

describe('fs.test.js', function () {
  beforeEach(function () {
    fs.writeFileSync('./foo/index.js', 'test foo/index.js');
  });

  afterEach(function () {
    fs.writeFileSync('./foo/index.js', 'test foo/index.js');
  });

  describe('exists(), existsSync()', function () {
    it('should check file or dir exists success', function (done) {
      done = pedding(4, done);
      fs.exists('./foo', function (exists) {
        exists.should.equal(true);
        done();
      });

      fs.exists('./foo/index.js', function (exists) {
        exists.should.equal(true);
        done();
      });

      fs.exists('foo', function (exists) {
        exists.should.equal(true);
        done();
      });

      fs.exists('../foo', function (exists) {
        exists.should.equal(false);
        done();
      });
    });

    it('should check file or dir existsSync success', function () {
      fs.existsSync('./foo').should.equal(true);
      fs.existsSync('./foo/index.js').should.equal(true);
      fs.existsSync('foo').should.equal(true);
      fs.existsSync('../foo').should.equal(false);
    });
  });

  describe('truncate(), truncateSync()', function () {
    beforeEach(function () {
      fs.writeFileSync('foo/truncate.txt', '123456');
    });
    afterEach(function () {
      fs.writeFileSync('foo/truncate.txt', '123456');
    });

    it('should truncate with 3', function (done) {

    });
  });

  describe('link, linkSync, symlink, symlinkSync', function () {
    beforeEach(function (done) {
      fs.unlink('foo/links/index.js.link', function () {
        fs.unlink('foo/links/index.js.sync.link', function () {
          done();
        });
      });
    });

    it('should link success', function (done) {
      fs.link('./foo/index.js', 'foo/links/index.js.link', function (err) {
        should.not.exists(err);
        fs.existsSync('foo/links/index.js.link').should.equal(true);
        done();
      });
    });

    it('should link permission error', function (done) {
      done = pedding(2, done);
      fs.link('/home/foo/index.js', 'foo/links/index.js.link', function (err) {
        should.exists(err);
        err.message.should.equal("EACCES, permission denied '/home/foo/index.js'")
        fs.existsSync('foo/links/index.js.link').should.equal(false);
        done();
      });

      fs.link('./foo/index.js', '/foo/links/index.js.link', function (err) {
        should.exists(err);
        err.message.should.equal("EACCES, permission denied '/foo/links/index.js.link'")
        fs.existsSync('foo/links/index.js.link').should.equal(false);
        done();
      });
    });

    it('should linkSync success', function () {
      fs.linkSync('./foo/index.js', 'foo/links/index.js.sync.link');
      fs.existsSync('foo/links/index.js.sync.link').should.equal(true);
    });

    it('should linkSync permission error', function () {
      (function () {
        fs.linkSync('/home/foo/index.js', 'foo/links/index.js.link');
      }).should.throw("EACCES, permission denied '/home/foo/index.js'");

      (function () {
        fs.linkSync('./foo/index.js', '/foo/links/index.js.link');
      }).should.throw("EACCES, permission denied '/foo/links/index.js.link'");
    });
  });

  describe('rename(), renameSync()', function (done) {
    function clean() {
      try {
        fs.unlinkSync('./foo/bar/rename_index.js');
      } catch (e) {
      }
      try {
        fs.unlinkSync('./foo/bar/renamesync_index.js');
      } catch (e) {
      }

      fs.existsSync('./foo/bar/rename_index.js').should.equal(false);
      fs.existsSync('./foo/bar/renamesync_index.js').should.equal(false);
    }

    beforeEach(clean);
    afterEach(clean)

    it('should rename async file', function (done) {
      fs.rename('./foo/index.js', './foo/bar/rename_index.js', function (err) {
        should.not.exists(err);
        fs.existsSync('./foo/bar/rename_index.js').should.equal(true);
        done();
      });
    });

    it('should rename permission error', function (done) {
      fs.rename('../../../../../etc/hosts', 'foo/bar/rename_hosts.js', function (err) {
        should.exists(err);
        err.message.should.equal("EACCES, permission denied '../../../../../etc/hosts'");
        fs.existsSync('foo/bar/rename_hosts.js').should.equal(false);
        done();
      });
    });

    it('should renameSync file', function () {
      fs.renameSync('./foo/index.js', 'foo/bar/renamesync_index.js');
      fs.existsSync('./foo/bar/renamesync_index.js').should.equal(true);
    });

    it('should renameSync permission error', function () {
      (function () {
        fs.renameSync('../../../../../etc/hosts', 'foo/bar/rename_hosts.js');
      }).should.throw("EACCES, permission denied '../../../../../etc/hosts'");
    });
  });

});







