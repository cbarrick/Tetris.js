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


	// This class manages all interactions with the DOM.
	//
	// This file is tightly coupled to the `index.xhtml` file. This control
	// expects the DOM to be layed out as in that file.
	//
	// Attributes
	// ----------
	// - `root` (DOM Element): The DOM tree of the game.
	// - `game` (Tetris): The game being controlled. Defaults to null.

	module.exports = Model.extend({

		das: 200, // Delayed Auto Shift: the amount of time before auto repeat
		arr: 45,  // Auto Repeat Rate: the amount of time between auto repeats
		          // http://harddrop.com/wiki/DAS

		// Both attributes must be set by the constructor.
		attributes: {
			game: null  // The underlying game.
		},


		initialize: function () {
			this.onKeydown = this.onKeydown.bind(this);
			this.onKeyup = this.onKeyup.bind(this);
			this.startGame = this.startGame.bind(this);
		},


		// tc.delegateEvents()
		// -------------------
		// Sets up all necessary event handlers.

		delegateEvents: function () {
			var game = this.get('game');
			var root = game.get('root');
			var playBtn = root.querySelector('.play-btn');
			var soundBtn = root.querySelector('.sound-btn');
			var music = root.querySelector('#music');
			var i;

			game.on('lock', function (coords) {
				for (i = coords.length - 1; i >= 0; i -= 1) {
					if (coords[i][1] < 2) {
						game.stop();
						return;
					}
				}
				game.spawn();
			});

			game.on('score', function (score) {
				var scores = root.querySelectorAll('.score-value');
				for (i = scores.length - 1; i >= 0; i -= 1) {
					scores[i].innerHTML = '';
					if (score < 1000) scores[i].innerHTML += '0';
					if (score < 100) scores[i].innerHTML += '0';
					if (score < 10) scores[i].innerHTML += '0';
					scores[i].innerHTML += score;
				}
			}.bind(this));

			game.on('stop', function () {
				this.quitGame();
			}.bind(this));

			game.on('start', function () {
				var root = game.get('root');
				var scores = root.querySelectorAll('.score-value');
				for (i = scores.length - 1; i >= 0; i -=1) {
					scores[i].innerHTML = '0000';
				}
			}.bind(this));

			window.addEventListener('keydown', this.onKeydown, false);
			window.addEventListener('keyup', this.onKeyup, false);

			playBtn.addEventListener('click', this.startGame, false);

			soundBtn.addEventListener('click', function () {
				if (music.paused) {
					soundBtn.innerHTML = 'Mute';
					music.play();
				} else {
					soundBtn.innerHTML = 'Unmute';
					music.pause();
				}
			}, false);
		},


		// tc.undelegateEvents()
		// ---------------------
		// Removes all event handlers set with `delegateEvents`.

		undelegateEvents: function () {
			var game = this.get('game');
			var root = game.get('root');
			var menu = root.querySelector('#menu');
			var playBtns = menu.querySelectorAll('.play-btn');
			var i;

			window.removeEventListener('keydown', this.onKeydown, false);
			window.removeEventListener('keyup', this.onKeyup, false);

			for (i = playBtns.length - 1; i >= 0; i -= 1) {
				playBtns[i].removeEventListener('click', this.startGame, false);
			}
		},


		// Event handlers
		// --------------

		// Handles the keydown event

		onKeydown: function (event) {
			// debounced and throttled
			var game = this.get('game');
			var gameState = game.get('state');
			var repeat = true;
			var valid = true;
			var action;

			if ('Up' === event.key) {
				action = function () {
					if (gameState === 'running') {
						game.resetDropTime();
						game.rotate();
					}
				};
				repeat = false;

			} else if ('Down' === event.key) {
				action = function () {
					if (gameState === 'running') {
						game.resetDropTime();
						game.down();
					}
				};

			} else if ('Left' === event.key) {
				action = function () {
					if (gameState === 'running') {
						game.resetDropTime();
						game.left();
					}
				};

			} else if ('Right' === event.key) {
				action = function () {
					if (gameState === 'running') {
						game.resetDropTime();
						game.right();
					}
				};

			} else if ('Spacebar' === event.key
			            || 32 === event.keyCode) {
				action = function () {
					if (gameState === 'running') {
						game.drop(true);
					}
				};
				repeat = false;

			} else if ('Shift' === event.key) {
				action = function () {
					if (gameState === 'running') {
						game.hold();
					}
				};
				repeat = false;

			} else if ('Esc' === event.key) {
				action = function () {
					if (gameState === 'paused') {
						this.startGame();
					} else if (gameState === 'running') {
						this.pauseGame();
					}
				};
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
					}.bind(this), this.das);
				}

				setTimeout(function() {
					this._throttled = false;
				}.bind(this), this.arr);
			}
		},


		// Handles the keyup event

		onKeyup: function () {
			this._debounced = false;
			clearInterval(this._keyInterval);
			this._keyInterval = false;
		},


		// Start the underlying game

		startGame: function () {
			var game = this.get('game');
			var root = game.get('root');
			var menu = root.querySelector('.menu');

			menu.className = menu.className.replace(/\s*\bopen\b\s*/g, '');

			root.tabIndex = -1; // This should be set in the HTML, must be non-null to set focus
			root.focus();
			game.start();
		},


		// Pause the underlying game

		pauseGame: function () {
			var game = this.get('game');
			var root = game.get('root');
			var menu = root.querySelector('.menu');

			menu.className += ' open';

			game.pause();
		},


		// End the underlying game

		quitGame: function () {
			var game = this.get('game');
			this.pauseGame();
			game.restart();
		}

	});

});
