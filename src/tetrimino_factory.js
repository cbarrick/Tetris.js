define(function (require, exports, module) {
	'use strict';

	var Model = require('model');
	var Tetrimino = require('tetrimino');


	/**
	 * TetriminoFactory
	 * ==============
	 * A factory of pseudo-randomly generated Tetriminos.
	 *
	 * See the Tetris Wiki for the [algorithm][].
	 * [algorithm]: http://tetris.wikia.com/wiki/Random_Generator
	 *
	 * Attributes
	 * ----------
	 * - queue (Array): The current output queue of Tetriminos
	 * - pool (Array): A pool of Tetriminos to refill the queue
	 * - bounds (Array -> Boolean): The bounds function for all Tetriminos
	 *   created by this factory. See `src/tetrimino.js` for details
	 */

	var TetriminoFactory = module.exports = Model.extend({

		attributes: {
			queue: [],
			pool: [],
			bounds: function () {return true}
		},


		initialize: function () {
			this.set({
				queue: this._makeQueue(),
				pool: this._makeQueue()
			});
		},


		/**
		 * queue.pop()
		 * --
		 * Returns a tetrimino from the queue.
		 */

		pop: function () {
			var queue = this.get('queue');
			var pool = this.get('pool');
			var ret = queue.pop();
			var replacement = pool.pop();
			
			queue.unshift(replacement);
			if (pool.length == 0) {
				pool = this._makeQueue();
				this.set('pool', pool);
			}
			return ret;
		},


		//
		//
		_makeQueue: function () {
			var bounds = this.get('bounds');
			var chooseFrom = [];
			var bag = [];
			var tetrimino;
			var randomIndex;
			for (var TypeName in Tetrimino.types) {
				tetrimino = new Tetrimino({type: TypeName, bounds: bounds});
				chooseFrom.push(tetrimino);
			}
			while (chooseFrom.length > 0) {
				randomIndex = Math.floor(Math.random() * chooseFrom.length);
				bag.push(chooseFrom.splice(randomIndex, 1)[0])
			}
			return bag;
		}

	})
})