define(function (require, exports, module) {
	'use strict';

	var Model = require('model');
	var util = require('util');


	var TetrisView = module.exports = Model.extend({

		className: 'tetris-canvas',
		detail: 50, // higher is better


		attributes: {
			'el': null,       // Canvas element we draw to
			'pen': null,      // 2D rendering context
			'roundness': 0.3, // Roundness of the blocks; 0 = square, 1 = circle, 2 = max
			'padding': 0.3,   // Padding as a percent; 1 = max
			'border': 0.3     // Width of block border as a percent; 1 = max
		},


		/**
		 * var tv = new TetrisView(attributes)
		 * -----------------------------------
		 * You should set the `game` attribute on construction
		 */

		initialize: function () {
			var el = document.createElement('canvas');
			var pen = el.getContext('2d');
			var game = this.get('game');

			el.className = this.className;
			el.width = game.width * this.detail;
			el.height = (game.height - 2) * this.detail; // We hide top 2 rows

			this.set({
				'el': el,
				'pen': pen
			})

			game.on('update', function (x, y, width, height) {
				this.render();
			}.bind(this))
		},


		/**
		 *
		 */

		attach: function (parent) {
			var canvas = this.get('el');
			parent.appendChild(canvas);
		},


		/**
		 * TetrisView.prototype.render(x, y, width, height)
		 * ------------------------------------------------
		 * Renders the current state of the game for the region specified.
		 * The units are in terms of game "blocks", not pixles.
		 */

		render: function (x, y, width, height) {
			var game = this.get('game');
			var matrix = game.get('matrix');
			var fillStyle;

			if (typeof x !== 'number') x = 0;
			if (typeof y !== 'number') y = 0;
			if (typeof width !== 'number') width = game.width;
			if (typeof height !== 'number') height = game.height;

			this.clearArea(x, y, width, height);

			// Note that we draw the top two rows above the top of the canvas
			for (var i = y; i < y + height; i++) {
				for (var j = x; j < x + width; j++) {
					if ((j >= 0) && (i >= 2) && matrix[i] && matrix[i][j]) {
						fillStyle = matrix[i][j];
						this.drawBlock(j, i, fillStyle);
					}
				}
			}

			this.drawGhost();
			this.drawCurrent();
		},


		/**
		 * TetrisView.prototype.drawCurrent()
		 * ----------------------------------
		 * Draws the current Tetrimino in play.
		 */

		drawCurrent: function () {
			var game = this.get('game');
			var current = game.get('current');
			if (current) {
				var x = current.get('x');
				var y = current.get('y');
				var width = current.get('width');
				var height = current.get('height');
				var box = current.get('box');
				var color = current.get('color');

				for (var row = 0; row < height; row++) {
					for (var col = 0; col < width; col++) {
						if (box[row][col]) {
							this.drawBlock(x + col, y + row, color)
						}
					}
				}
			}
		},


		/**
		 * TetrisView.prototype.drawGhost()
		 * --------------------------------
		 * Draws the ghost piece
		 */

		drawGhost: function () {
			var game = this.get('game');
			var current = game.get('current');

			if (current) {
				var ghost = current.clone();
				ghost.drop();
				var x = ghost.get('x');
				var y = ghost.get('y');
				var width = ghost.get('width');
				var height = ghost.get('height');
				var box = ghost.get('box');

				for (var row = 0; row < height; row++) {
					for (var col = 0; col < width; col++) {
						if (box[row][col]) {
							this.drawBlock(x + col, y + row, 'transparent')
						}
					}
				}
			}
		},


		/**
		 * TetrisView.prototype.drawBlock(x, y, fillStyle)
		 * -----------------------------------------------
		 * Draws a block at an arbitrary coordinate with the given fillStyle
		 */

		drawBlock: function (x, y, fillStyle) {
			var scale = this.detail;

			// We draw the top two rows above the canvas
			y -= 2;

			// Convert x and y from cell indicies to pixle locations
			x *= scale;
			y *= scale;

			var pen = this.get('pen');
			var padding = this.get('padding') * scale / 2;
			var border = this.get('border');
			var roundness = this.get('roundness');
			var radius = (roundness * (scale - (2 * padding))) / 2;

			// Corner locations
			var tl = { 'x': x + padding, 'y': y + padding }
			var tr = { 'x': x + scale - padding, 'y': y + padding }
			var bl = { 'x': x + padding, 'y': y + scale - padding }
			var br = { 'x': x + scale - padding, 'y': y + scale - padding }
			
			pen.save();

			pen.fillStyle = fillStyle;
			pen.strokeStyle = 'black';
			pen.lineWidth = border * scale / 2;

			pen.moveTo(tl.x + radius, tl.y);
			pen.beginPath();

			pen.lineTo(tr.x - radius, tr.y);
			pen.arcTo(tr.x, tr.y, tr.x, tr.y + radius, radius);
			
			pen.lineTo(br.x, br.y - radius);
			pen.arcTo(br.x, br.y, br.x - radius, br.y, radius);

			pen.lineTo(bl.x + radius, bl.y);
			pen.arcTo(bl.x, bl.y, bl.x, bl.y - radius, radius);

			pen.lineTo(tl.x, tl.y + radius);
			pen.arcTo(tl.x, tl.y, tl.x + radius, tl.y, radius);
			pen.closePath();

			pen.fill();
			pen.stroke();

			pen.restore();
		},


		/**
		 *
		 */

		clearArea: function (x, y, width, height) {
			var pen = this.get('pen');
			var scale = this.detail;

			// Note that we draw the top two rows above the canvas
			y -= 2;

			pen.clearRect(x * scale - 1, y * scale - 1, width * scale + 2, height * scale + 2);
		},


		_blur: function () {
			var detail = this.detail;
			var el = this.get('el');
			var pen = this.get('pen');
			var width = el.width;
			var height = el.height;

			var source = pen.getImageData(0, 0, width, height);
			var dest = pen.createImageData(source);
			var radius = Math.floor(detail / 5);

			var pixle;
			var total;

			for (var i = 0; i < dest.data.length; i++) {
				total = [
					0, // Red totals
					0, // Green totals
					0, // Blue totals
					0  // Alpha totals
				]
				for (var j = -radius; j <= radius; ++j) {
					if (i + (j * 4) > 0 && i + (j * 4) < dest.data.length) {
						total[i % 4] += source.data[i + (j * 4)];
					}
				}
				dest.data[i] = total[i % 4] / (radius * 2 + 1);
			}

			pen.putImageData(dest, 0, 0);
		}
	})
})
