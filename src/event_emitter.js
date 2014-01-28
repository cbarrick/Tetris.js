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
