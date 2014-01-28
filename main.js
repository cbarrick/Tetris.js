'use strict';


require.config({
	baseUrl: 'src'
})


require(['tetris'], function (Tetris, DomControl) {
	var container = document.getElementById('game');
	window.t = new Tetris();

	var view = t.get('view');

	view.attach(container);
	view.render();
})
