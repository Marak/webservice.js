var path = require('path');

require.paths.unshift(__dirname, path.join(__dirname, 'vendor'));

var resourcer = exports;

resourcer.Resource       = require('resourcer/resource').Resource;
resourcer.defineResource = require('resourcer/core').defineResource;
resourcer.defineProperty = require('resourcer/core').defineProperty;
resourcer.define         = require('resourcer/core').define;
resourcer.use            = require('resourcer/core').use;
resourcer.connect        = require('resourcer/core').connect;
resourcer.typeOf         = require('resourcer/core').typeOf;
resourcer.connection     = require('resourcer/core').connection;
resourcer.mixin          = require('resourcer/core').mixin;
resourcer.clone          = require('resourcer/core').clone;
resourcer.resources      = require('resourcer/core').resources;
resourcer.register       = require('resourcer/core').register;
resourcer.unregister     = require('resourcer/core').unregister;
resourcer.engine         = require('resourcer/engines').memory;
resourcer.engines        = require('resourcer/engines');

resourcer.resources.Resource = resourcer.define('resource');
