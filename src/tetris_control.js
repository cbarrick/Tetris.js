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


	// Handles the user input and controls a Tetris game. Extends `Model`.
	//
	// This file is tightly coupled to the `index.xhtml` file. This control
	// expects the DOM to be layed out as in that file.
	//
	// Attributes
	// ----------
	// - `document` (DOM document): The DOM tree of the page.
	// - `game` (Tetris): The game being controlled. Defaults to null.

	module.exports = Model.extend({

		das: 200, // Delayed Auto Shift: the amount of time before auto repeat
		arr: 45,  // Auto Repeat Rate: the amount of time between auto repeats
		          // http://harddrop.com/wiki/DAS

		attributes: {
			document: document, // The DOM tree being controled.
			game: null          // The underlying game. Must be set by the constructor.
		},


		initialize: function () {
			this.onKeydown = this.onKeydown.bind(this);
			this.onKeyup = this.onKeyup.bind(this);
			this.openInstructions = this.openInstructions.bind(this);
			this.startGame = this.startGame.bind(this);
		},


		// tc.delegateEvents()
		// -------------------
		// Sets up all necessary event handlers.

		delegateEvents: function () {
			var game = this.get('game');
			var document = this.get('document');
			var menu = document.getElementById('menu');
			var nextBtns = menu.getElementsByClassName('next-btn');
			var playBtns = menu.getElementsByClassName('play-btn');
			var i;

			if (game) {
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
					var document = this.get('document');
					var scores = document.getElementsByClassName('score-value');
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
					var document = this.get('document');
					var scores = document.getElementsByClassName('score-value');
					for (i = scores.length - 1; i >= 0; i -=1) {
						scores[i].innerHTML = '0000';
					}
				}.bind(this));
			}

			window.addEventListener('keydown', this.onKeydown, false);
			window.addEventListener('keyup', this.onKeyup, false);

			for (i = nextBtns.length - 1; i >= 0; i -= 1) {
				nextBtns[i].addEventListener('click', this.openInstructions, false);
			}

			for (i = playBtns.length - 1; i >= 0; i -= 1) {
				playBtns[i].addEventListener('click', this.startGame, false);
			}
		},


		// tc.undelegateEvents()
		// ---------------------
		// Removes all event handlers set with `delegateEvents`.

		undelegateEvents: function () {
			var document = this.get('document');
			var menu = document.getElementById('menu');
			var nextBtns = menu.getElementsByClassName('next-btn');
			var playBtns = menu.getElementsByClassName('play-btn');
			var i;

			window.removeEventListener('keydown', this.onKeydown, false);
			window.removeEventListener('keyup', this.onKeyup, false);

			for (i = nextBtns.length - 1; i >= 0; i -= 1) {
				nextBtns[i].removeEventListener('click', this.openInstructions, false);
			}

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

			if ('Up' === event.keyIdentifier) {
				action = function () {
					if (gameState === 'running') {
						game.resetDropTime();
						game.rotate();
					}
				};
				repeat = false;

			} else if ('Down' === event.keyIdentifier) {
				action = function () {
					if (gameState === 'running') {
						game.resetDropTime();
						game.down();
					}
				};

			} else if ('Left' === event.keyIdentifier) {
				action = function () {
					if (gameState === 'running') {
						game.resetDropTime();
						game.left();
					}
				};

			} else if ('Right' === event.keyIdentifier) {
				action = function () {
					if (gameState === 'running') {
						game.resetDropTime();
						game.right();
					}
				};

			} else if ('U+0020' === event.keyIdentifier) {
				action = function () {
					if (gameState === 'running') {
						game.drop(true);
					}
				};
				repeat = false;

			} else if ('Shift' === event.keyIdentifier) {
				action = function () {
					if (gameState === 'running') {
						game.hold();
					}
				};
				repeat = false;

			} else if ('U+001B' === event.keyIdentifier) {
				action = function () {
					if (gameState === 'paused') {
						this.startGame();
					} else {
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


		// Transitions from the intro panel to the instructions panel.
		// Assumes that the menu and intro are open.

		openInstructions: function () {
			var document = this.get('document');
			var intro = document.getElementById('intro');
			var instructions = document.getElementById('instructions');

			// remove the 'open' class from the intro
			intro.className = intro.className.replace(/\s*\bopen\b\s*/g, '');

			// add the 'open' class to the instructions
			instructions.className += ' open';
		},


		// Start the underlying game

		startGame: function () {
			var game = this.get('game');
			var document = this.get('document');
			var scorePanel = document.getElementById('score');
			var opened = document.getElementsByClassName('open');
			var escAction = document.getElementById('esc-action');

			for (var i = opened.length - 1; i >= 0; i -= 1) {
				opened[i].className = opened[i].className.replace(/\s*\bopen\b\s*/g, '');
			}

			scorePanel.className += ' open';
			escAction.innerHTML = "pause";

			game.start();
		},


		// Pause the underlying game

		pauseGame: function () {
			var game = this.get('game');
			var document = this.get('document');
			var menu = document.getElementById('menu');
			var escAction = document.getElementById('esc-action');

			menu.className += ' open';
			escAction.innerHTML = "resume";

			game.pause();
		},


		// End the underlying game

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

	});

});
