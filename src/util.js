define(function (require, exports, module) {
	'use strict';


	var util = module.exports = function (obj) {
			// TODO: Wrapper coolness
	}


	util.clone = function (obj) {
		var clone = Object.create(Object.getPrototypeOf(obj));
		return util.extend(clone, obj);
	}


	util.extend = function (obj, extension) {
		var props = Object.getOwnPropertyNames(extension);
		var desc;
		props.forEach(function (prop) {
			desc = Object.getOwnPropertyDescriptor(extension, prop);
			Object.defineProperty(obj, prop, desc);
		})
		return obj;
	}


	util.pick = function (from, props) {
		var attrs = {};
		for (var prop in props) {
			if (prop in from) {
				attrs[prop] = util.clone(from);
			}
		}
		return attrs;
	}

})
