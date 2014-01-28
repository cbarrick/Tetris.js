/*
 * Tetris.js - A Tetris clone for HTML5
 * Copyright (C) 2014  Chris Barrick <cbarrick1@gmail.com>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


define(function (require, exports, module) {
	'use strict';

	var EventEmitter = require('event_emitter');
	var util = require('util');


	var Model = module.exports = function (attributes, options) {
		EventEmitter.call(this);
		this.attributes = util.clone(this.attributes);
		this.set(attributes);
		this.initialize(options);
	}


	Model.prototype = util.extend(Object.create(EventEmitter.prototype), {

		attributes: {},

		constructor: Model,

		initialize: function (options) {},

		set: function (key, value) {
			var oldValue;

			if (arguments.length > 1) {
				oldValue = this.attributes[key];
				this.attributes[key] = value;
				if (value != oldValue) {
					this.trigger('change', key, value, oldValue);
					this.trigger('change:' + key, value, oldValue);
				}

			} else {
				// key is assumed to be an object mapping keys to new values
				for (var k in key) if (key.hasOwnProperty(k)) {
					this.set(k, key[k]);
				}
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
	})


	Model.extend = function (extension) {
		var newCtor = function () {Model.apply(this, arguments)};
		newCtor.prototype = Object.create(this.prototype);
		util.extend(newCtor.prototype, extension);
		newCtor.extend = this.extend;
		return newCtor;
	}

})
