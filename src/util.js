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


	// A collection of convenience functions for working with objects.

	var util = module.exports = {};


	// util.clone(obj)
	// ---------------
	// Returns a shallow clone of an object.

	util.clone = function (obj) {
		var clone = Object.create(Object.getPrototypeOf(obj));
		return util.extend(clone, obj);
	};


	// util.extend(base, extension)
	// ----------------------------
	// Extends a base object with members of an extension object.
	// Returns the base object.

	util.extend = function (base, extension) {
		var props = Object.getOwnPropertyNames(extension);
		var desc;
		props.forEach(function (prop) {
			desc = Object.getOwnPropertyDescriptor(extension, prop);
			Object.defineProperty(base, prop, desc);
		});
		return base;
	};

});
