/*
 * Tetris.js - A Tetris clone for HTML5
 * Copyright (C) 2014  Chris Barrick <cbarrick1@gmail.com>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


define(function (require, exports, module) {
	'use strict';

	var Model = require('model');


	/**
	 * Tetrimino
	 * =========
	 * A collection of 4 adjacent blocks in 2D space.
	 *
	 * There are 7 unique shapes of Tetrimino, named by the letters they look
	 * most similar to: S, Z, J, L, I, O, and T. Each Tetrimino consists of
	 * the 4 Blocks arranged in a 4x4 grid. And each shape other than the O
	 * has 4 unique orientations. An X and Y coordinate may be applied to the
	 * Tetrimino, and a coordinate pair for each Block can be calculated as an
	 * offset relative to the Tetrimino.
	 *
	 * Attributes
	 * ----------
	 * - x (Number): The X coordinate, right is positive
	 * - y (Number): The Y coordinate, down is positive
	 * - state (Number): The rotation state
	 * - type (String): The name of this Tetrimino's shape
	 * - bounds (Array -> Boolean): A function representing the bounds on the
	 *   Tetrimino's movement. It gets passed an array of 4 coordinate pairs
	 *   of the form [x,y] that represent the coordinates the tetrimino
	 *   requires. It should return `false` if any of the coordinates are bad.
	 */

	var Tetrimino = module.exports = Model.extend({

		attributes: {
			type: 'T',
			bounds: function () {return true},
			offsets: [
				// Common offsets for J, L, S, Z, and T
				[[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
				[[ 0, 0], [+1, 0], [+1,-1], [ 0,+2], [+1,+2]],
				[[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
				[[ 0, 0], [-1, 0], [-1,-1], [ 0,+2], [-1,+2]]
			]
		},


		/**
		 * var tetrimino = new Tetrimino([attributes])
		 * -------------------------------------------
		 */

		initialize: function () {
			var type = Tetrimino.types[this.get('type')];
			this.set(type);
		},


		/**
		 * Tetrimino.prototype.rotate()
		 * ----------------------------
		 * Rotates the piece clockwise, following the Super Rotation System
		 * algorithm. The normal rotation and 4 differents wall kicks are
		 * attempted. If none work, the piece is left as-is.
		 */

		rotate: function (count) {
			var x = this.get('x');
			var y = this.get('y');
			var dx;
			var dy;
			var offsets = this.get('offsets');
			var oldState = this.get('state');
			var newState = (oldState + 1) % 4;
			var oldBox = this.get('box');
			var newBox = [];

			// Rotate
			for (var row = 0; row < oldBox.length; row++) {
				newBox[row] = [];
				for (var col = 0; col < oldBox[row].length; col++) {
					newBox[row][col] = oldBox[oldBox.length - col - 1][row];
				}
			}

			// Apply the offsets
			for (var col = 0; col < 5; col++) {
				dx = offsets[oldState][col][0] - offsets[newState][col][0];
				dy = offsets[oldState][col][1] - offsets[newState][col][1];

				if (this._inBounds(newBox, x+dx, y+dy)) {
					this.set({
						box: newBox,
						state: newState,
						x: x+dx,
						y: y+dy
					})
					return;
				}
			}
		},


		/**
		 * Tetrimino.prototype.move(dx, dy)
		 * --------------------------------
		 * Attempts to move the Tetrimino.
		 * Returns an object providing the new position
		 */

		move: function (dx, dy) {
			var x = this.get('x');
			var y = this.get('y');
			var box = this.get('box')

			if (this._inBounds(box, x+dx, y+dy)) {
				this.set({
					x: x + dx,
					y: y + dy
				})
				x += dx;
				y += dy;
			}

			return { 'x': x, 'y': y }
		},


		/**
		 * Tetrimino.prototype.drop()
		 * --------------------------
		 * Moves the tetrimino as far down as it can go
		 */

		drop: function () {
			var x = this.get('x');
			var y = this.get('y');

			var newpos = this.move(0, 1);

			if (y === newpos.y) return newpos;
			return this.drop();
		},


		/**
		 * Tetrimino.prototype.getCoordinates()
		 * ------------------------------------
		 * Returns a list of [x,y] coordinate pairs for each block of the
		 * tetrimino.
		 */

		getCoordinates: function () {
			var box = this.get('box');
			var x = this.get('x');
			var y = this.get('y');
			return this._getCoordinates(box, x, y);
		},



		/***
		 * Tetrimino.prototype._getCoordinates(box, x, y)
		 * ----------------------------------------------
		 * Returns a list of [x,y] coordinate pairs for each "block" in the
		 * given "box" offset by the given coordinates.
		 */

		_getCoordinates: function (box, x, y) {
			var coords = [];
			for (var dy = 0; dy < box.length; dy++) {
				for (var dx = 0; dx < box[dy].length; dx++) {
					if (box[dy][dx] !== null) {
						coords.push([x+dx, y+dy]);
					}
				}
			}
			return coords;
		},


		/***
		 * Tetrimino.prototype._inBounds(box, x, y)
		 * ----------------------------------------
		 * Returns false if the Tetrimino cannot be positioned at the given
		 * coordinates with the given box. Uses the public `bounds` attribute
		 * function to do the actuall bounds checking.
		 */

		_inBounds: function (box, x, y) {
			var bounds = this.get('bounds');
			var ret = bounds(this._getCoordinates(box, x, y));
			return ret;
		},


		toString: function (showBox) {
			var box = this.get('box');
			var x = this.get('x');
			var y = this.get('y');
			var state = this.get('state');
			var type = this.get('type');
			var str = "[Tetrimino: " + type + ' (' + x + ',' + y + ') ' + state + ']'

			if (showBox) {
				str += '\n+';
				for (var i = 0; i < box[0].length; i++) str += '-';
				str += '+'

				for (var i = 0; i < box.length; i++) {
					str += "\n|";
					for (var j = 0; j < box[i].length; j++) {
						if (box[i][j] == 'x') str += 'X';
						else str += ' ';
					}
					str += '|';
				}

				str += '\n+';
				for (var i = 0; i < box[0].length; i++) str += '-';
				str += '+';
			}

			return str;
		}
	})

	Tetrimino.types = {
		J: {
			x: 3,
			y: 0,
			width: 3,
			height: 3,
			state: 0,
			box: [
				['x',  null, null],
				['x',  'x',  'x' ],
				[null, null, null]
			],
			color: 'Blue'
		},
		L: {
			x: 3,
			y: 0,
			width: 3,
			height: 3,
			state: 0,
			box: [
				[null, null, 'x'],
				['x',  'x',  'x'],
				[null, null, null]
			],
			color: 'Orange'
		},
		S: {
			x: 3,
			y: 0,
			width: 3,
			height: 3,
			state: 0,
			box: [
				[null, 'x',  'x' ],
				['x',  'x',  null],
				[null, null, null]
			],
			color: 'Lime'
		},
		Z: {
			x: 3,
			y: 0,
			width: 3,
			height: 3,
			state: 0,
			box: [
				['x',  'x',  null],
				[null, 'x',  'x' ],
				[null, null, null]
			],
			color: 'Red'
		},
		T: {
			x: 3,
			y: 0,
			width: 3,
			height: 3,
			state: 0,
			box: [
				[null, 'x',  null],
				['x',  'x',  'x' ],
				[null, null, null]
			],
			color: 'DarkMagenta'
		},
		O: {
			x: 3,
			y: 0,
			width: 3,
			height: 3,
			state: 0,
			box: [
				[null, 'x',  'x' ],
				[null, 'x',  'x' ],
				[null, null, null]
			],
			offsets: [
				[[ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0]],
				[[ 0,-1], [ 0,-1], [ 0,-1], [ 0,-1], [ 0,-1]],
				[[-1,-1], [-1,-1], [-1,-1], [-1,-1], [-1,-1]],
				[[-1, 0], [-1, 0], [-1, 0], [-1, 0], [-1, 0]]
			],
			color: 'Yellow'
		},
		I: {
			x: 2,
			y: 0,
			width: 5,
			height: 5,
			state: 0,
			box: [
				[null, null, null, null, null],
				[null, null, null, null, null],
				[null, 'x',  'x',  'x',  'x' ],
				[null, null, null, null, null],
				[null, null, null, null, null]
			],
			offsets: [
				[[ 0, 0], [-1, 0], [+2, 0], [-1, 0], [+2, 0]],
				[[-1, 0], [ 0, 0], [ 0, 0], [ 0,+1], [ 0,-2]],
				[[-1,+1], [+1,+1], [-2,+1], [+1, 0], [-2, 0]],
				[[ 0,+1], [ 0,+1], [ 0,+1], [ 0,-1], [ 0,+2]]
			],
			color: "Cyan"
		}
	}
})
