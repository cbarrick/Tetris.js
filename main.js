'use strict';


require.config({
	baseUrl: 'src'
});


require(['tetris'], function (Tetris) {
	var container = document.getElementById('game');
	var t = new Tetris();

	var view = t.get('view');

	view.attach(container);
	view.render();
});
