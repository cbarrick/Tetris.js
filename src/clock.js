define(function (require, exports, module) {
	'use strict';

	var EventEmitter = require('event_emitter');


	/**
	 * Clock
	 * =====
	 * A simple, evented interval loop.
	 *
	 * A Clock "ticks" repeatedly until it is stopped, paused, or reaches a
	 * maximum number of ticks.
	 *
	 * Attributes
	 * ----------
	 * - state (String): One of "running", "paused", or "stopped"
	 * - delay (Number): Miliseconds between ticks
	 * - ticks (Number): Count of ticks in this clock's lifetime
	 * - maxTicks (Number): The maximum number of ticks before the clock stops
	 *
	 * Events
	 * ------
	 * All Backbone.Model events and:
	 * - start: When the clock starts just before the first tick
	 * - stop: When the clock stops just after the last tick
	 * - restart: When the clock has been restarted
	 * - pause: When the clock is paused
	 * - resume: When the clock is resumed
	 * - uptick: When a tick starts
	 * - downtick: when a tick ends
	 */

	var Clock = module.exports = EventEmitter.extend({

		attributes: {
			state: 'stopped',
			delay: 0,
			ticks: 0,
			maxTicks: Infinity,
			_intervalId: null
		},


		/**
		 * var clock = new Clock([attributes])
		 * --
		 * When creating a clock instance, you can pass in the initial
		 * attributes, which will be set on the new clock.
		 */

		initialize: function() {
			EventEmitter.prototype.initialize.call(this);
			this.on('change:delay', this._onChangeDelay);
		},


		/** clock.start()
		 * --
		 * Starts the clock.
		 */

		start: function () {
			this.set({'state': 'running'});
			this.trigger('start', this.toJson());
			this._start();
		},


		/**
		 * clock.restart()
		 * --
		 * Stops the clock if it is not already, resets the ticks count to 0,
		 * and starts the clock.
		 */

		restart: function () {
			var state = this.get('state');
			if (state !== 'stopped') this.stop();
			this.set({'ticks': 0});
			this.trigger('restart', this.toJson());
			this.start();
		},


		/**
		 * clock.stop()
		 * --
		 * Stops the clock.
		 */

		stop: function () {
			this._stop();
			this.set({'state': 'stopped'});
			this.trigger('stop', this.toJson());
		},


		/**
		 * clock.pause()
		 * --
		 * Pauses the clock if it is running.
		 */

		pause: function () {
			var state = this.get('state');
			if (state == 'running') {
				this._stop();
				this.set({'state': 'paused'});
				this.trigger('pause', this.toJson());
			}
		},


		/**
		 * clock.resume()
		 * --
		 * Resumes the clock if it is paused.
		 */

		resume: function () {
			var state = this.get('state');
			if (state == 'paused') {
				this._start();
				this.set({'state': 'running'});
				this.trigger('resume', this.toJson());
			}
		},


		// Starts the clock
		//
		_start: function () {
			var delay = this.get('delay');
			var intervalId = setInterval(this._tick.bind(this), delay);
			this.set({'_intervalId': intervalId});
		},


		// Stops the clock
		//
		_stop: function () {
			var intervalId = this.get('_intervalId');
			clearInterval(intervalId);
			this.set({'_intervalId': null});
		},


		// Each tick of the clock
		//
		_tick: function () {
			var tickCount = this.get('ticks');
			var maxTicks = this.get('maxTicks');

			if (tickCount < maxTicks) {
				this.trigger('uptick', this.toJson());
				this.trigger('downtick', this.toJson());
				this.set({'ticks': ++tickCount});
			} else {
				this.stop();
			}
		},


		// Registered for the change:delay event.
		// Changes the clock to the new delay even if it's already running.
		//
		_onChangeDelay: function (model, delay) {
			assert(model == this);
			var state = this.get('state');
			if (state == 'running') {
				_stop();
				_start();
			}
		}

	})


})
