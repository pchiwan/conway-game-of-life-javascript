import GameOfLife from './game-of-life.js';

(function () {
	let game = new GameOfLife(
		$('#grid'), 
		$('#generations'),
		$('#message'));

	$('#startGame').on('click', function() {
		let table = [];
		$('#grid tr').each(function() {
			let tr = [];
			$(this).find('td').each(function() {
				tr.push($(this).hasClass('live') ? true : false);
			});
			table.push(tr);
		});
		game.loadGrid(table);
		game.start();
	});

	$('#stopGame').on('click', function() {
		game.stop();
	});

	$('#grid td').on('click', function() {
		$(this).toggleClass('live');
	});

}());
