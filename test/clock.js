define(function (require) {
	'use strict';

	var expect = require('chai').expect;

	var Clock = require('clock');


	describe('Clock', function () {

		it('will reset the tick count on restart', function (done) {
			var c = new Clock();
			var hasBeenRestarted = false;
			c.on('downtick', function (data) {
				if (data.ticks > 1) {
					if (hasBeenRestarted) {
						c.stop();
						done();
					} else {
						hasBeenRestarted = true;
						c.restart();
					}
				}
			})
			c.on('restart', function (data) {
				expect(data.ticks).to.equal(0);
			})
			c.start();
		})


		it('can be automatically stopped after a set number of ticks', function (done) {
			var c = new Clock({maxTicks: 3});
			c.on('stop', function (data) {
				expect(data.maxTicks).to.equal(3);
				expect(data.ticks).to.equal(3);
				done();
			})
			c.start();
		})


		it('supports a delay between ticks', function (done) {
			var c1 = new Clock({delay: 20, maxTicks: 2}); // 40ms
			var c2 = new Clock({delay: 10, maxTicks: 3}); // 30ms
			c1.on('stop', function () {
				expect(c2.get('state')).to.equal('stopped');
				done();
			})
			c1.start()
			c2.start();
		})
		

		describe('Events', function () {

			it('fires a `start` event when started', function (done) {
				var c = new Clock();
				var hasBeenRestarted = false;
				c.on('start', function (data) {
					expect(data.state).to.equal('running');
					done();
				})
				c.start();
			})


			it('fires a `stop` event when stopped', function (done) {
				var c = new Clock();
				c.on('stop', function (data) {
					expect(data.state).to.equal('stopped');
					done();
				})
				c.start();
				c.stop();
			})


			it('fires a `restart` event', function (done) {
				var c = new Clock();
				c.on('downtick', function () {
					c.restart();
				})
				c.on('restart', function () {
					c.stop();
					done();
				})
				c.start();
			})


			it('fires `uptick` and `downtick` events once each tick', function (done) {
				var c = new Clock();
				var tickCount = 0;
				c.on('uptick', function (data) {
					expect(data.state).to.equal('running');
					expect(data.ticks).to.equal(tickCount);
				})
				c.on('downtick', function (data) {
					expect(data.state).to.equal('running');
					expect(data.ticks).to.equal(tickCount);
					tickCount += 1;
					if (tickCount > 3) {
						c.stop();
						done();
					}
				})
				c.start();
			})
		})
	})
})
