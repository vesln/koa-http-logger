/**
 * Dependencies.
 */

var Counter = require('passthrough-counter');
var humanize = require('humanize-number');
var bytes = require('bytes');

/**
 * Development logger.
 */

function dev(report) {
  return function *dev(next) {
    // request
    var start = new Date;

    report('<-- %s %s', this.method, this.url);

    try {
      yield next;
    } catch (err) {
      // log uncaught downstream errors
      log(report, this, start, null, err);
      throw err;
    }

    // calculate the length of a streaming response
    // by intercepting the stream with a counter.
    // only necessary if a content-length header is currently not set.
    var length = this.responseLength;
    var body = this.body;
    var counter;
    if (null == length && body && body.readable) {
      this.body = body
        .pipe(counter = Counter())
        .on('error', this.onerror);
    }

    // log when the response is finished or closed,
    // whichever happens first.
    var ctx = this;
    var res = this.res;

    res.once('finish', done);
    res.once('close', done);

    function done(){
      res.removeListener('finish', done);
      res.removeListener('close', done);
      log(report, ctx, start, counter ? counter.length : length);
    }
  }
}

/**
 * Log helper.
 */

function log(report, ctx, start, len, err) {
  err = err || {};

  // get the status code of the response
  var status = err.status || ctx.status;
  var handled = status != 200 || ctx.body != null;
  if (!handled) status = 404;

  // get the human readable response length
  var length;
  if (~[204, 205, 304].indexOf(status)) {
    length = '';
  } else if (null == len) {
    length = '-';
  } else {
    length = bytes(len);
  }

  report('--> %s %s %s %s %s', ctx.method, ctx.url, status, time(start), length);
}

/**
 * Show the response time in a human readable format.
 * In milliseconds if less than 10 seconds,
 * in seconds otherwise.
 */

function time(start) {
  var delta = new Date - start;
  delta = delta < 10000
    ? delta + 'ms'
    : Math.round(delta / 1000) + 's';
  return humanize(delta);
}

/**
 * Primary exports.
 */

module.exports = dev;
