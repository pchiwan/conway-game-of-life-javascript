import GameOfLife from './game-of-life.js';

(function () {
	let game = null;

	$('#createGrid').on('click', function () {
		let gridSize = $('#gridSize').val();

		if (gridSize) {
			game = new GameOfLife(
				parseInt(gridSize, 10),
				$('#grid'),
				$('#generations'),
				$('#message'));

			bindGrid();
			$('#game-of-life').show();
		}
	});

	$('#startGame').on('click', function () {
		if (game) {
			let table = [];
			$('#grid tr').each(function () {
				let tr = [];
				$(this).find('td').each(function () {
					tr.push($(this).hasClass('live') ? true : false);
				});
				table.push(tr);
			});
			game.loadGrid(table);
			game.start();
		}
	});

	$('#stopGame').on('click', function () {
		if (game) {
			game.stop();
		}
	});

	function bindGrid() {
		$('#grid td').on('click', function () {
			$(this).toggleClass('live');
		});
	}
} ());
