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


	// A simple event emitter.

	var EventEmitter = module.exports = function () {
		this._events = {};
	};


	EventEmitter.prototype = {


		// e.on(event, callback)
		// ---------------------
		// Registers a callback to be called whenever the event is triggered
		//
		// ### Params
		// - `event` (String): The name of the event for which to listen.
		// - `callback` (Function): The function to be called when the event
		//   is triggered. The context of the function is the EventEmitter
		//   instance.

		on: function (event, callback) {
			var events = this._events;
			if (!events[event]) events[event] = [];
			events[event].push(callback);
		},


		// e.off([event, [callback]])
		// --------------------------
		// Remove event listeners. If no event is given, all event listeners
		// are removed. If no callback is given, all listeners for the event
		// are removed. Else the callback given is removed as a listener for
		// the given event.
		//
		// ### Params
		// - `event` (String): The event to for which to remove listeners.
		// - `callback` (Function): The listener to be removed.

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


		// e.once(event, callback)
		// -----------------------
		// Registers a callback to be invoked once on the next instance of an
		// event.
		//
		// ### Params
		// - `event` (String): The name of the event to listen for
		// - `callback` (Function): The function to be called when the event
		//   is triggered. The context of the function is the EventEmitter
		//   instance.

		once: function (event, callback) {
			var oneTime = function () {
				callback.apply(this, arguments);
				this.off(event, oneTime);
			}.bind(this);
			this.on(event, oneTime);
		},


		// e.trigger(event)
		// ----------------
		// Triggers all listeners for an event.
		//
		// ### Params
		// - `event` (String): The event to emitt.

		trigger: function (event) {
			var args = Array.prototype.slice.call(arguments, 1);
			var e = this._events[event];
			if (e) {
				e.forEach(function (callback) {
					callback.apply(this, args);
				}.bind(this));
			}
		}

	};

});
