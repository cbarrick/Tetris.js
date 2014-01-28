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

	var Model = require('model');


	var EventEmitter = module.exports = function () {
		this._events = {};
	}


	EventEmitter.prototype = {

		on: function (event, callback) {
			var events = this._events;
			if (!events[event]) events[event] = [];
			events[event].push(callback);
		},

		off: function (event, callback) {
			var events = this._events;
			if (event) {
				if (callback) {
					var index = events[event].indexOf(callback);
					events[event].splice(index, 1);
				} else {
					events[event] = [];
				}
			} else {
				this._events = {};
			}
		},

		once: function (event, callback) {
			var oneTime = function () {
				callback.apply(this, arguments);
				this.off(event, oneTime);
			}.bind(this);
			this.on(event, oneTime);
		},

		trigger: function (event) {
			var args = Array.prototype.slice.call(arguments, 1);
			var e = this._events[event];
			if (e) {
				e.forEach(function (callback) {
					callback.apply(this, args);
				}.bind(this))
			}
		}

	}

})
