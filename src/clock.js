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

	var Model = require('model');


	// A simple, evented interval loop. Extends `Model`.
	//
	// A Clock "ticks" repeatedly until it is stopped, paused, or reaches a
	// maximum number of ticks.
	//
	// Attributes
	// ----------
	// - `state` (String): One of "running", "paused", or "stopped".
	// - `delay` (Number): Miliseconds between ticks.
	// - `ticks` (Number): Count of ticks in this clock's lifetime.
	// - `maxTicks` (Number): The maximum number of ticks before the clock
	//   stops.
	//
	// Events
	// ------
	// - `start` (state): Just before the clock starts after being stopped
	// - `stop` (state): When the clock is stopped
	// - `restart` (state): When the clock has been restarted
	// - `pause` (state): When the clock is paused
	// - `resume` (state): When the clock is resumed from pause
	// - `uptick` (state): When a tick starts
	// - `downtick` (state): when a tick ends

	module.exports = Model.extend({

		attributes: {
			state: 'stopped',
			delay: 0,
			ticks: 0,
			maxTicks: Infinity,
			_intervalId: null
		},


		// new Clock([attributes])
		// -----------------------
		// When creating a clock instance, you can pass in the initial
		// attributes, which will be set on the new clock.

		initialize: function() {
			Model.prototype.initialize.call(this);
			this.on('change:delay', this._onChangeDelay.bind(this));
		},


		// c.start()
		// ---------
		// Starts the clock.

		start: function () {
			var state = this.get('state');
			if (state === 'stopped') {
				this.set('state', 'running');
				this.trigger('start', this.toJson());
			} else if (state === 'paused') {
				this.set('state', 'running');
				this.trigger('resume', this.toJson());
			}
			this._start();
		},


		// c.restart()
		// -----------
		// Stops the clock if it is not already, resets the ticks count to 0,
		// and starts the clock.

		restart: function () {
			var state = this.get('state');
			if (state !== 'stopped') this.stop();
			this.set({'ticks': 0});
			this.trigger('restart', this.toJson());
		},


		// c.stop()
		// --------
		// Stops the clock.

		stop: function () {
			this._stop();
			this.trigger('stop', this.toJson());
		},


		// c.pause()
		// ---------
		// Pauses the clock if it is running.

		pause: function () {
			var state = this.get('state');
			if (state == 'running') {
				this._stop();
				this.set({'state': 'paused'});
				this.trigger('pause', this.toJson());
			}
		},

		// Helper Methods
		// --------------

		// Starts the clock

		_start: function () {
			var delay = this.get('delay');
			var intervalId = setInterval(this._tick.bind(this), delay);
			this.set({
				'_intervalId': intervalId,
				'state': 'running'
			});
		},


		// Stops the clock

		_stop: function () {
			var intervalId = this.get('_intervalId');
			clearInterval(intervalId);
			this.set({
				'_intervalId': null,
				'state': 'stopped'
			});
		},


		// Each tick of the clock

		_tick: function () {
			var tickCount = this.get('ticks');
			var maxTicks = this.get('maxTicks');

			if (tickCount < maxTicks) {
				tickCount += 1;
				this.trigger('uptick', this.toJson());
				this.trigger('downtick', this.toJson());
				this.set({'ticks': tickCount});
			} else {
				this.stop();
			}
		},


		// Registered for the `change:delay` event.
		// Restarts the clock so that the new delay takes effect.

		_onChangeDelay: function (newdelay) {
			var state = this.get('state');
			if (state == 'running') {
				this._stop();
				this._start();
			}
		}

	});


});
