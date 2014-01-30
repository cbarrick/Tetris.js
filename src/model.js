//     Tetris.js - A Tetris clone for HTML5
//     Copyright (C) 2014  Chris Barrick <cbarrick1@gmail.com>
//     
//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
//     
//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
//     
//     You should have received a copy of the GNU General Public License
//     along with this program.  If not, see <http://www.gnu.org/licenses/>.


define(function (require, exports, module) {
	'use strict';

	var EventEmitter = require('event_emitter');
	var util = require('util');


	// A base class for object-oriented programming similar to Backbone.js.
	// Extends `EventEmitter`.
	//
	// To account for inheritance, Model instances do not store their member
	// attributes directly as properties of the object. To access and mutate
	// instance attributes use the `get` and `set` methods.
	//
	// Subclassing `Model` involves calling `Model.extend` with a prototype
	// extension. Members of the extension override members of the same name
	// in the super prototype.
	// 
	// There are several notable prototype members that subclasses can use:
	//
	// - **constructor / initialize**: The default constructor returned by
	//   `Model.extend` mixes-in EventEmitter, sets up the instance
	//   attributes, and calls the `initialize` method. It takes two
	//   arguments, an object providing initial instance attributes and
	//   an "options" argument which is not parsed but passed on to
	//   `initialize`. Normally you want to override `initialize` for your
	//   construction logic and leave `constructor` alone. However, both
	//   may be specified.
	// - **attributes**: A mapping of instance attributes to their default values.
	//   Instances have their own `attributes` member separate from the
	//   prototype. The instance member stores the current attribute values
	//   for the instance while the prototype member stores the defaults. In
	//   general, you should not access this attribute directly.
	//
	// Events
	// ------
	// - `change` (key, new value, old value): When any attribute is changed.
	// - `change:[attribute]` (key, new value, old value): When a specific
	//   attribute is changed.

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


		// m.set(values), m.set(key, value)
		// --------------------------------
		// Sets instance members. You can either pass in an object mapping
		// keys to values or a single (key, value) pair.
		//
		// ### Params
		// - `values` (Object): A mapping of keys to values of members to set.
		// - `key` (String): The name of the member to set.
		// - `value` (anything): The new value of the member.

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


		// m.get(key)
		// ----------
		// Returns the instance attribute. Objects are passed by reference.
		//
		// ### Params
		// - `key` (String): The name of the attribute.

		get: function (key) {
			var ret = this.attributes[key];
			var proto = Object.getPrototypeOf(this);
			if ((ret === undefined) && (typeof proto.get === 'function')) {
				return proto.get(key);
			}
			return ret;
		},


		// m.toJson()
		// ----------
		// Returns a shallow clone of the instance attributes.

		toJson: function () {
			return util.clone(this.attributes);
		},


		// m.clone()
		// ---------
		// Returns a shallow clone of `this`.

		clone: function () {
			var clone = util.clone(this);
			clone.attributes = util.clone(this.attributes);
			return clone;
		}
	})


	// Model.extend(extension)
	// -----------------------
	// Returns a constructor for a class extending `Model`. Each subclass
	// will also have an `extend` method that behaves in the same manner.
	//
	// ### Params
	// - `extension` (Object): The prototype of the class is determined by the
	//   extension object. Each member is added to the prototype, overriding
	//   any members of the same name in the parent class.

	Model.extend = function (extension) {
		var newCtor = function () {Model.apply(this, arguments)};
		newCtor.prototype = Object.create(this.prototype);
		util.extend(newCtor.prototype, extension);
		newCtor.extend = this.extend;
		return newCtor;
	}

})
