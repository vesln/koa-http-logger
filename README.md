# koa-http-logger

A fork of [koa-logger](https://github.com/koajs/logger) (MIT) not coupled
with reporting mechanism.

## Usage

```js
var koa = require('koa');
var logger = require('koa-http-logger');
var report = require('debug')('app:http');

var app = koa();
koa.use(logger(report));
```

## Installation

```js
$ npm install koa-http-logger
```

## License

  MIT
