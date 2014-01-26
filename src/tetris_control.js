define(function (require, exports, module) {
	'use strict';

	var Model = require('model');


	var TetrisControl = module.exports = Model.extend({

		das: 200, // Delayed Auto Shift: the amount of time before auto repeat
		arr: 45,  // Auto Repeat Rate: the amount of time between auto repeats
		          // http://harddrop.com/wiki/DAS

		attributes: {
			game: null
		},


		/**
		 * var tc = new TetrisControl(attributes)
		 * --------------------------------------
		 * You should set the `game` attribute on construction
		 */

		initialize: function () {
			var game = this.get('game');

			game.on('lock', function (coords) {
				for (var i = coords.length - 1; i >= 0; i--) {
					if (coords[i][1] < 2) {
						console.log('GAME OVER');
						game.stop();
						return;
					}
				}
				game.spawn();
			})

			game.start();
		},


		/**
		 *
		 */

		delegateEvents: function () {
			var game = this.get('game');
			var view = game.get('view');
			var canvas = view.get('el');

			window.addEventListener('keydown', this.onKeydown.bind(this), false);
			window.addEventListener('keyup', this.onKeyup.bind(this), false);
		},


		/**
		 *
		 */

		onKeydown: function (event) {
			// debounced and throttled
			var game = this.get('game');
			var gameState = game.get('state');
			var repeat = true;
			var valid = true;
			var action;

			if ('Up' === event.keyIdentifier) {
				action = function () {
					if (gameState !== 'paused') {
						game.resetDropTime();
						game.rotate();
					}
				}
				repeat = false;

			} else if ('Down' === event.keyIdentifier) {
				action = function () {
					if (gameState !== 'paused') {
						game.resetDropTime();
						game.down();
					}
				}

			} else if ('Left' === event.keyIdentifier) {
				action = function () {
					if (gameState !== 'paused') {
						game.resetDropTime();
						game.left();
					}
				}

			} else if ('Right' === event.keyIdentifier) {
				action = function () {
					if (gameState !== 'paused') {
						game.resetDropTime();
						game.right();
					}
				}

			} else if ('U+0020' === event.keyIdentifier) {
				action = function () {
					if (gameState !== 'paused') {
						game.drop(true);
					}
				}
				repeat = false;

			} else if ('Shift' === event.keyIdentifier) {
				action = function () {
					if (gameState !== 'paused') {
						game.hold();
					}
				}
				repeat = false;

			} else if ('U+001B' === event.keyIdentifier) {
				action = function () {
					if (gameState === 'paused') {
						game.resume();
					} else {
						game.pause();
					}
				}

			} else {
				valid = false;
			}

			if (valid && !this._debounced && !this._throttled) {
				this._debounced = true;
				this._throttled = true;

				action();

				if (repeat) {
					setTimeout(function () {
						if (this._debounced) {
							clearInterval(this._keyInterval);
							this._keyInterval = setInterval(action, this.arr);
						}
					}.bind(this), this.das)
				}

				setTimeout(function() {
					this._throttled = false;
				}.bind(this), this.arr)
			}
		},


		/**
		 *
		 */

		onKeyup: function (event) {
			this._debounced = false;
			clearInterval(this._keyInterval);
			this._keyInterval = false;
		}

	})

})
