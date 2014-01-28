define(function (require, exports, module) {
	'use strict';

	var Model = require('model');


	var TetrisControl = module.exports = Model.extend({

		das: 200, // Delayed Auto Shift: the amount of time before auto repeat
		arr: 45,  // Auto Repeat Rate: the amount of time between auto repeats
		          // http://harddrop.com/wiki/DAS

		attributes: {
			document: document, // The DOM tree being controled
			game: null
		},


		/**
		 * var tc = new TetrisControl(attributes)
		 * --------------------------------------
		 * You should set the `game` attribute on construction
		 */

		initialize: function () {
			var game = this.get('game');

			this.onKeydown = this.onKeydown.bind(this);
			this.onKeyup = this.onKeyup.bind(this);
			this.openInstructions = this.openInstructions.bind(this);
			this.startGame = this.startGame.bind(this);

			game.on('lock', function (coords) {
				for (var i = coords.length - 1; i >= 0; i--) {
					if (coords[i][1] < 2) {
						game.stop();
						return;
					}
				}
				game.spawn();
			})

			game.on('score', function (score, multiplier) {
				var document = this.get('document');
				var scores = document.getElementsByClassName('score-value');
				for (var i = scores.length - 1; i >= 0; i-- ) {
					scores[i].innerHTML = score;
				}
			}.bind(this))

			game.on('stop', function () {
				this.quitGame();
			}.bind(this))

			game.on('start', function () {
				var document = this.get('document');
				var scores = document.getElementsByClassName('score-value');
				for (var i = scores.length - 1; i >= 0; i-- ) {
					scores[i].innerHTML = 0;
				}
			}.bind(this));
		},


		/**
		 *
		 */

		delegateEvents: function () {
			var document = this.get('document');
			var menu = document.getElementById('menu');
			var nextBtns = menu.getElementsByClassName('next-btn');
			var playBtns = menu.getElementsByClassName('play-btn');
			var game = this.get('game');
			var view = game.get('view');
			var canvas = view.get('el');

			window.addEventListener('keydown', this.onKeydown, false);
			window.addEventListener('keyup', this.onKeyup, false);

			for (var i = nextBtns.length - 1; i >= 0; i--) {
				nextBtns[i].addEventListener('click', this.openInstructions, false);
			}

			for (var i = playBtns.length - 1; i >= 0; i--) {
				playBtns[i].addEventListener('click', this.startGame, false);
			}
		},


		/**
		 *
		 */

		undelegateEvents: function () {
			var document = this.get('document');
			var menu = document.getElementById('menu');
			var nextBtns = menu.getElementsByClassName('next-btn');
			var playBtns = menu.getElementsByClassName('play-btn');
			var game = this.get('game');
			var view = game.get('view');
			var canvas = view.get('el');

			window.removeEventListener('keydown', this.onKeydown, false);
			window.removeEventListener('keyup', this.onKeyup, false);

			for (var i = nextBtns.length - 1; i >= 0; i--) {
				nextBtns[i].removeEventListener('click', this.openInstructions, false);
			}

			for (var i = playBtns.length - 1; i >= 0; i--) {
				playBtns[i].removeEventListener('click', this.startGame, false);
			}
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
					if (gameState === 'running') {
						game.resetDropTime();
						game.rotate();
					}
				}
				repeat = false;

			} else if ('Down' === event.keyIdentifier) {
				action = function () {
					if (gameState === 'running') {
						game.resetDropTime();
						game.down();
					}
				}

			} else if ('Left' === event.keyIdentifier) {
				action = function () {
					if (gameState === 'running') {
						game.resetDropTime();
						game.left();
					}
				}

			} else if ('Right' === event.keyIdentifier) {
				action = function () {
					if (gameState === 'running') {
						game.resetDropTime();
						game.right();
					}
				}

			} else if ('U+0020' === event.keyIdentifier) {
				action = function () {
					if (gameState === 'running') {
						game.drop(true);
					}
				}
				repeat = false;

			} else if ('Shift' === event.keyIdentifier) {
				action = function () {
					if (gameState === 'running') {
						game.hold();
					}
				}
				repeat = false;

			} else if ('U+001B' === event.keyIdentifier) {
				action = function () {
					if (gameState === 'paused') {
						this.startGame()
					} else {
						this.pauseGame();
					}
				}
				action = action.bind(this);

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
		},


		/**
		 * TetrisControl.prototype.openInstructions()
		 * ------------------------------------------
		 * Transitions from the intro panel to the instructions panel.
		 * Assumes that the menu and into are open.
		 */

		openInstructions: function () {
			var document = this.get('document');
			var intro = document.getElementById('intro');
			var instructions = document.getElementById('instructions');

			// remove the 'open' class from the intro
			intro.className = intro.className.replace(/\s*\bopen\b\s*/g, '');

			// add the 'open' class to the instructions
			instructions.className += ' open';
		},


		/**
		 *
		 */

		startGame: function () {
			var game = this.get('game');
			var document = this.get('document');
			var scorePanel = document.getElementById('score');
			var opened = document.getElementsByClassName('open');
			var escAction = document.getElementById('esc-action');

			for (var j = opened.length - 1; j >= 0; j--) {
				opened[j].className = opened[j].className.replace(/\s*\bopen\b\s*/g, '');
			}

			scorePanel.className += ' open';
			escAction.innerHTML = "pause";

			game.start();
		},


		/**
		 *
		 */

		pauseGame: function () {
			var game = this.get('game');
			var document = this.get('document');
			var menu = document.getElementById('menu');
			var scorePanel = document.getElementById('score');
			var escAction = document.getElementById('esc-action');

			menu.className += ' open';
			escAction.innerHTML = "resume";

			game.pause();
		},


		/**
		 *
		 */

		quitGame: function () {
			var game = this.get('game');
			var document = this.get('document');
			var menu = document.getElementById('menu');
			var scorePanel = document.getElementById('score');
			var gameOver = document.getElementById('game-over');

			scorePanel.className = scorePanel.className.replace(/\s*\bopen\b\s*/g, '');
			gameOver.className += ' open';
			menu.className += ' open';

			// Restart the game to be ready for the next one
			game.restart();
		}

	})

})
