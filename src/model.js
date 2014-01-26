define(function (require, exports, module) {
	'use strict';

	var util = require('util');


	var Model = module.exports = function () {
		this.constructor.apply(this, arguments);
	}


	Model.prototype = {

		attributes: {},

		constructor: function (attributes, options) {
			this.attributes = util.clone(this.attributes);
			this.set(attributes);
			this.initialize(options);
		},

		initialize: function (options) {},

		set: function (key, value) {
			var attrs;
			if (arguments.length > 1) {
				attrs = {};
				attrs[key] = value;
			} else {
				attrs = key;
			}
			if (attrs instanceof Object) {
				util.extend(this.attributes, attrs);
			}
		},

		get: function (key) {
			var ret = this.attributes[key];
			var proto = Object.getPrototypeOf(this);
			if ((ret === undefined) && (typeof proto.get === 'function')) {
				return proto.get(key);
			}
			return ret;
		},

		toJson: function () {
			return util.clone(this.attributes);
		},

		clone: function () {
			var clone = util.clone(this);
			clone.attributes = util.clone(this.attributes);
			return clone;
		}
	}


	Model.extend = function (extension) {
		var newCtor = function () {Model.apply(this, arguments)};
		newCtor.prototype = Object.create(this.prototype);
		util.extend(newCtor.prototype, extension);
		newCtor.extend = this.extend;
		return newCtor;
	}

})
