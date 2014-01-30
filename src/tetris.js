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

	var Clock = require('clock');
	var ScoreKeeper = require('score_keeper');
	var TetriminoFactory = require('tetrimino_factory');
	var TetrisControl = require('tetris_control');
	var TetrisView = require('tetris_view');


	 // The board on which tetris is played. Extends `Clock`.
	 //
	 // A matrix manages its own queue of Tetriminos and hold slots.
	 // It exposes the API for moving pieces around.
	 // 
	 // A Tetris instance acts just like a clock, where the clock states
	 // correspond to gameplay.
	 // 
	 //
	 // Events
	 // ------
	 // - `clear` (rows): Triggered when a line or lines are cleared. Gets
	 //   passed an array of line numbers cleared.
	 // - `lock` (coords): Triggered when the in play tetrimino becomes locked
	 //   in place. Gets passed an array of [x, y] coordinate pairs for the
	 //   resulting location of each block of the Tetrimino
	 // - `rotate` (state): Triggered when the in play tetrimino rotates.
	 // - `update` (x, y, width, height): Triggered when the internal matirx
	 //   has updated passing a the coordinates of the bounding box of the
	 //   updated area.
	 // - `score` (current score, multiplier): Triggered when the user scores
	 // - `spawn` (state): Triggered when a new Tetrimino is spawned.
	 // - `restart` (state): Triggered when the game is restarted
	 // 
	 //
	 // Attributes
	 // ----------
	 // - `controler` (TetrisControl): The controller of the game.
	 // - `current` (Tetrimino): The current Tetrimino being played.
	 // - `dropLock` (Boolean): If the current Tetrimino is being locked from
	 //   autodroping.
	 // - `hold` (Tetrimino): The terimino being held. Starts as `null`.
	 // - `matrix` (2D Array): The game board as [row][col] from top-left to
	 //   bottom-right. A standard game of Tetris is 10 x 22. The top two rows
	 //   should not be shown to the user.
	 // - `queue` (TetriminoFactory): The Tetriminos to be played.
	 // - `score_keeper` (ScoreKeeper): The logic for keeping up with the score.
	 // - `view` (TetrisView): The view of the game.

	var Tetris = module.exports = Clock.extend({

		width: 10,
		height: 22,
		initialDelay: 300,


		attributes: {
			controler: null,     // Controler of the game
			current: null,       // Current Tetrimino in play
			delay: 300,          // Miliseconds before autodrop, inherited from Clock
			dropLock: false,     // Prevents autodrop, enable with #.set
			hold: null,          // Tetrimino on hold
			matrix: null,        // Game area
			queue: null,         // Queue of upcoming Tetriminos
			score_keeper: null,  // Keeps track of the score of this game
			view: null           // View of this game
		},


		initialize: function () {
			Clock.prototype.initialize.call(this);

			var queue = new TetriminoFactory({ bounds: this._bounds.bind(this) });
			var view = new TetrisView({ game: this });
			var controler = new TetrisControl({ game: this });
			var score_keeper = new ScoreKeeper({ game: this });

			this.set({
				'controler': controler,
				'delay': this.initialDelay,
				'matrix': this._getEmptyMatrix(),
				'queue': queue,
				'score_keeper': score_keeper,
				'view': view
			})

			// Pass the score event up from the score_keeper,
			// also increase dificulty
			score_keeper.on('score', function (score, multiplier) {
				var delay = this.get('delay');
				delay *= 99/100
				this.set({'delay': delay});
				this.trigger('score', score, multiplier);
			}.bind(this));

			// Autodrop
			this.on('downtick', function () {
				this.drop()
			}.bind(this))

			// Initialize the controler
			controler.delegateEvents();

			this.spawn();
		},


		 // t.left(), t.right(), t.down()
		 // -----------------------------
		 // Move the current Tetrimino in the desired direction

		left:  function () {return this._move(-1, 0)},
		right: function () {return this._move(1, 0)},
		down:  function () {return this._move(0, 1)},
		_move: function (dx, dy) {
			var current = this.get('current');
			if (current) {
				var x = current.get('x');
				var y = current.get('y');
				var width = current.get('width');
				var height = current.get('height');
				var newpos;

				newpos = current.move(dx, dy);

				// dx, dy become the actual change from new to old
				dx = (newpos.x > x) ? newpos.x - x : x - newpos.x;
				dy = (newpos.y > y) ? newpos.y - y : y - newpos.y;
				x = newpos.x;
				y = newpos.y;

				this.trigger('update', x - dx, y - dy, width + 2 * dx, height + 2 * dy);

				return { 'x': x, 'y': y };
			}
		},


		 // t.rotate()
		 // ----------
		 // Rotate the current Tetrimino, performing wall-kicks and spins.

		rotate: function () {
			var current = this.get('current');
			if (current) {
				var x = current.get('x');
				var y = current.get('y');
				var width = current.get('width');
				var height = current.get('height');

				if (current) {
					current.rotate();
				}

				this.trigger('rotate', this.toJson());
				this.trigger('update', x, y, width, height);
			}
		},


		 // t.drop(hard, nolock)
		 // --------------------
		 // Drops the current Tetrimino. If it can't move down, it is locked.
		 //
		 // ### Params
		 // - `hard` (Boolean): If true, drops all the way down, else drops one line.
		 // - `nolock` (Boolean): If true, prevents the Tetrimino from being locked.

		drop: function (hard, nolock) {
			var matrix = this.get('matrix');
			var current = this.get('current');
			var dropLock = this.get('dropLock');

			if (current && !dropLock) {
				var startpos = { 'x': current.get('x'), 'y': current.get('y') }
				var newpos;
				var width;
				var height;

				if (hard) {
					newpos = startpos = current.drop();
				}
				
				newpos = this.down();
				if (newpos.y == startpos.y && !nolock) {
					this.lock();
				}

				width = current.get('width');
				height = newpos.y - startpos.y;

				this.trigger('update', startpos.x, startpos.y, width, height);
			}
		},


		 // t.hold()
		 // --------
		 // Puts the current piece on hold.

		hold: function () {
			var current = this.get('current');
			var hold = this.get('hold');

			if (!this._holdLock && current) {
				current.initialize(); // Reset to initial values
				if (hold) {
					this.set({
						'current': hold,
						'hold': current
					})
				} else {
					this.set({ 'hold': current });
					this.spawn();
				}
			}

			this._holdLock = true;
		},


		 // t.lock()
		 // --------
		 // Lock the current Tetrimino in place.

		lock: function () {
			var current = this.get('current');

			if (current) {
				var matrix = this.get('matrix');
				var color = current.get('color');
				var coords = current.getCoordinates();
				var x;
				var y;
				for (var i = 0; i < coords.length; i++) {
					x = coords[i][0];
					y = coords[i][1];
					matrix[y][x] = color;
				}
				this.set({current: null})
			}

			this._holdLock = false;

			this.trigger('lock', coords);

			this.clearLines();
		},


		 // t.spawn()
		 // ---------
		 // Spawn the next Tetrimino.

		spawn: function () {
			var queue = this.get('queue');
			var current = queue.pop();
			var x = current.get('x');
			var y = current.get('y');
			var width = current.get('width');
			var height = current.get('height');

			this.set('current', current);
			this.trigger('spawn', this.toJson());
			this.trigger('update', x, y, width, height);
		},


		 // t.restart()
		 // -----------
		 // Restarts the game. The game will be in the "stopped" state.

		restart: function () {
			var queue = new TetriminoFactory({ bounds: this._bounds.bind(this) });
			var score_keeper = this.get('score_keeper');

			score_keeper.set({
				'combo': 0,
				'dryspell': 0,
				'score': 0
			})

			this.set({
				'delay': this.initialDelay,
				'matrix': this._getEmptyMatrix(),
				'queue': queue
			})
			
			Clock.prototype.restart.call(this);
			this.spawn();
		},


		 // t.clearLines()
		 // --------------
		 // Checks if any rows are full and clears them if so.

		clearLines: function () {
			var rows = [];
			var y = 2; // We start at row 2 because 0 and 1 are off canvas
			var matrix = this.get('matrix');

			this._clearLines(y, rows, matrix);
			if (rows.length > 0) {
				this.trigger('clear', rows);
			}
			return;
		},

		_clearLines: function (y, rows, matrix) {
			if (y >= matrix.length) return;

			for (var i = 0; i < this.width; i++) {
				if (matrix[y][i] === null) {
					return this._clearLines(y + 1, rows, matrix);
				}
			}

			rows.push(y);
			for (var i = y; i > 0; i--) {
				for (var j = 0; j < this.width; j++) {
					matrix[i][j] = matrix[i-1][j];
				}
			}

			return this._clearLines(y + 1, rows, matrix);
		},


		 // t.resetDropTime()
		 // -----------------
		 // Resets the time until the next autodrop

		resetDropTime: function () {
			Clock.prototype._stop.call(this);
			Clock.prototype._start.call(this);
		},


		// Returns a 2D array of null elements

		_getEmptyMatrix: function () {
			var matrix = []
			for (var row = 0; row < this.height; row++) {
				matrix[row] = [];
				for (var col = 0; col < this.width; col++) {
					matrix[row][col] = null;
				}
			}
			return matrix;
		},


		// The bounding funciton given to the Tetriminos

		_bounds: function (coordinates) {
			var matrix = this.get('matrix');
			var height = matrix.length;
			var width = matrix[0].length;
			var x;
			var y;
			var ret = true;
			coordinates.forEach(function (pair) {
				x = pair[0];
				y = pair[1];
				if ((x >= width)
					|| (x < 0)
					|| (y >= height)
					|| (y < 0)
					|| (matrix[y][x] !== null)) {
					ret = false;
				}
			})
			return ret;
		},


		toString: function (showMatrix) {
			var matrix = this.get('matrix');
			var current = this.get('current');
			var coords;
			var str = '[Tetris: ';

			if (current) {
				coords = current.getCoordinates()
				str += current.toString();
				str += ']';
			} else {
				str += 'null]';
			}

			
			if (showMatrix) {
				var mark = 'X';
				str += '\n+';
				for (var i = 0; i < matrix[0].length; i++) str += '-';
				str += '+'

				for (var i = 0; i < matrix.length; i++) {
					str += "\n|";
					for (var j = 0; j < matrix[i].length; j++) {
						if (matrix[i][j] !== null) {
							mark = 'X';
						} else {
							mark = ' ';
						}
						if (coords) {
							for (var k = 0; k < coords.length; k++) {
								if (coords[k][0] == j && coords[k][1] == i) {
									mark = 'O';
								}
							}
						}
						str += mark;
					}
					str += '|';
				}

				str += '\n+';
				for (var i = 0; i < matrix[0].length; i++) str += '-';
				str += '+';
			}

			return str;
		}

	})

})