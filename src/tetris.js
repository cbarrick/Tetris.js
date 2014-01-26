define(function (require, exports, module) {
	'use strict';

	var Clock = require('clock');
	var EventEmitter = require('event_emitter');
	var ScoreKeeper = require('score_keeper');
	var TetriminoFactory = require('tetrimino_factory');
	var TetrisControl = require('tetris_control');
	var TetrisView = require('tetris_view');


	/**
	 * Tetris
	 * ======
	 * The board on which tetris is played.
	 *
	 * A matrix manages its own queue of Tetriminos and hold slots.
	 * It exposes the API for moving pieces around.
	 *
	 * Attributes
	 * ----------
	 * - matrix (Array): A 10 x 22 2D array of blocks on the board
	 * - queue (TetriminoFactory): The Tetriminos to be played
	 * - current (Tetrimino): The current Tetrimino being played
	 * - hold (Tetrimino): The Tetrimino currently on hold
	 */

	var Tetris = module.exports = Clock.extend({

		width: 10,
		height: 22,


		attributes: {
			controler: null,    // Controler of the game
			current: null,      // Current Tetrimino in play
			delay: 300,         // Miliseconds before autodrop, inherited from Clock
			dropLock: false,    // Prevents autodrop, enable with #.set
			hold: null,         // Tetrimino on hold
			matrix: null,       // Game area
			queue: null,        // Queue of upcoming Tetriminos
			score_keeper: null, // Keeps track of the score of this game
			view: null          // View of this game
		},


		/**
		 * var game = new Tetris()
		 * -----------------------
		 *
		 */

		initialize: function () {
			Clock.prototype.initialize.call(this);

			var matrix = []
			for (var row = 0; row < this.height; row++) {
				matrix[row] = [];
				for (var col = 0; col < this.width; col++) {
					matrix[row][col] = null;
				}
			}

			var queue = new TetriminoFactory({ bounds: this._bounds.bind(this) });
			var view = new TetrisView({ game: this });
			var controler = new TetrisControl({ game: this });
			var score_keeper = new ScoreKeeper({ game: this });

			this.set({
				'controler': controler,
				'matrix': matrix,
				'queue': queue,
				'score_keeper': score_keeper,
				'view': view
			})

			this.on('downtick', function () {
				this.drop()
			}.bind(this))

			controler.delegateEvents();

			this.spawn();
		},


		/**
		 * Tetris.prototype.left() / Tetris.prototype.right() / Tetris.prototype.down()
		 * --
		 * Move the current Tetrimino in the desired direction
		 * TODO: Document return value
		 */

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

				// dx, dy become the actual change
				// x, y become the new position
				dx = (newpos.x > x) ? newpos.x - x : x - newpos.x;
				dy = (newpos.y > y) ? newpos.y - y : y - newpos.y;
				x = newpos.x;
				y = newpos.y;

				this.trigger('move');
				this.trigger('update', x - dx, y - dy, width + 2 * dx, height + 2 * dy);

				return { 'x': x, 'y': y };
			}
		},


		/**
		 * Tetris.prototype.rotate()
		 * --
		 * Rotate the current Tetrimino, performing wall-kicks when nessecary
		 */

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

				this.trigger('rotate');
				this.trigger('update', x, y, width, height);
			}
		},


		/**
		 * Tetris.prototype.drop(hard, nolock)
		 * -----------------------------------
		 * Drops the current Tetrimino. If `hard` evaluates to `true`, performs
		 * a hard drop, meaning the Tetrimino is dropped as far as it can go
		 * and locked. Else it moves down only one row. If it can't move down,
		 * it is locked.
		 */

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


		/**
		 *
		 */

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


		/**
		 * Tetris.prototype.lock()
		 * --
		 * Lock the current Tetrimino in place
		 */

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


		/**
		 * Tetris.prototype.spawn()
		 * --
		 * Spawn the next Tetrimino
		 */

		spawn: function () {
			var queue = this.get('queue');
			var current = queue.pop();
			var x = current.get('x');
			var y = current.get('y');
			var width = current.get('width');
			var height = current.get('height');

			this.set('current', current);
			this.trigger('spawn');
			this.trigger('update', x, y, width, height);
		},


		/**
		 * Tetris.prototype.clearLines()
		 * -----------------------------
		 * Checks if any rows are full and clears them if so.
		 */

		clearLines: function () {
			var rows = [];
			var y = 2; // We start at row 2 because 0 and 1 are off canvas
			var matrix = this.get('matrix');

			this._clearLines(y, rows, matrix);
			this.trigger('clear', rows);
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


		/**
		 * Tetris.prototype.resetDropTime()
		 * --------------------------------
		 * Resets the time until the next autodrop
		 */

		resetDropTime: function () {
			Clock.prototype._stop.call(this);
			Clock.prototype._start.call(this);
		},


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