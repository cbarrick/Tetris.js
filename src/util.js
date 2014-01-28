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


	var util = module.exports = {};


	util.clone = function (obj) {
		var clone = Object.create(Object.getPrototypeOf(obj));
		return util.extend(clone, obj);
	}


	util.extend = function (base, extension) {
		var props = Object.getOwnPropertyNames(extension);
		var desc;
		props.forEach(function (prop) {
			desc = Object.getOwnPropertyDescriptor(extension, prop);
			Object.defineProperty(base, prop, desc);
		})
		return base;
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
