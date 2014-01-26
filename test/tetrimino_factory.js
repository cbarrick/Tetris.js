define(function (require) {
	'use strict';

	var expect = require('chai').expect;

	var TetriminoFactory = require('tetrimino_factory');


	describe('TetriminoFactory', function () {

		it('can generate permutations of Tetrimino types', function permuteTest(done, count) {
			if (!count) count = 0;
			if (count >= 2)	return done();
			var queue = new TetriminoFactory();
			var types = [];
			for (var i = 0; i < 7; i++) {
				var tetrimino = queue.pop();
				types.push(tetrimino.get('type'));
			}
			expect(types.indexOf('J')).to.be.at.least(0);
			expect(types.indexOf('L')).to.be.at.least(0);
			expect(types.indexOf('S')).to.be.at.least(0);
			expect(types.indexOf('Z')).to.be.at.least(0);
			expect(types.indexOf('T')).to.be.at.least(0);
			expect(types.indexOf('O')).to.be.at.least(0);
			expect(types.indexOf('I')).to.be.at.least(0);
			permuteTest(done, ++count);
		})

		it('should automatically refill', function () {
			var queue = new TetriminoFactory();
			for (var i = 0; i < 32; i++) {
				var tetrimino = queue.pop();
				expect(tetrimino).to.be.ok;
			}
		})
	})


})