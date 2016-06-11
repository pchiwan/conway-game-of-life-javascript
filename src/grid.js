import Cell from './cell.js';

/**
 * The grid class
 */
function Grid(size) {

	let gridSize = size;	
	this.grid = [];	

	//------------------------------- PUBLIC METHODS

	this.createGrid = () => {
		this.grid = [];
		for (let i = 0, l1 = gridSize; i < l1; i++) {
			let row = [];
			for (let j = 0, l2 = gridSize; j < l2; j++) {
				row.push(new Cell());
			}
			this.grid.push(row);
		}
	};	

	this.loadGrid = (table) => {
		if (table.length != this.grid.length) 
			return;

		table.forEach((tr, x) => {
			tr.forEach((td, y) => {
				if (td) {
					this.grid[x][y].rise();
				} else {
					this.grid[x][y].die();
				}				
			});
		})
	};

	this.tick = () => {
		this.grid = newGeneration();
		return {
			currentGrid: encode(),
			liveCells: findLiveCells()
		};
	};

	//------------------------------- PRIVATE METHODS

	const cloneGrid = () => {
		let newGrid = [];
		this.grid.forEach(row => {
			let newRow = [];
			row.forEach(cell => {
				newRow.push(new Cell(cell.live));
			});
			newGrid.push(newRow);
		});
		return newGrid;
	};

	const newGeneration = () => {
		let newGrid = cloneGrid();
		this.grid.forEach((row, x) => {
			row.forEach((cell, y) => {
				let liveNeighbours = checkNeighbours(x, y);
				newGrid[x][y] = getNewCell(cell, liveNeighbours);
			});
		});
		return newGrid;
	};

	const findLiveCells = () => {
		return this.grid.reduce((liveCellsInRow, row) => {
			return liveCellsInRow + row.reduce((liveCells, cell) => {
				return liveCells + (cell.live ? 1 : 0);
			}, 0);
		}, 0);
	};

	const checkNeighbours = (x, y) => {
		let liveNeighbours = 0;
		// check 8 neighbours clockwise
		liveNeighbours += checkNeighbour(getPrevIndex(x), getPrevIndex(y)); // top left cell
		liveNeighbours += checkNeighbour(x, getPrevIndex(y)); // top cell
		liveNeighbours += checkNeighbour(getNextIndex(x), getPrevIndex(y)); // top right cell
		liveNeighbours += checkNeighbour(getNextIndex(x), y); // right cell
		liveNeighbours += checkNeighbour(getNextIndex(x), getNextIndex(y)); // bottom right cell
		liveNeighbours += checkNeighbour(x, getNextIndex(y)); // bottom cell
		liveNeighbours += checkNeighbour(getPrevIndex(x), getNextIndex(y)); // bottom left cell
		liveNeighbours += checkNeighbour(getPrevIndex(x), y); // left cell
		return liveNeighbours;
	};

	const checkNeighbour = (x, y) => {
		return this.grid[x][y].live ? 1 : 0;
	};

	const getPrevIndex = (x) => {
		return x - 1 < 0 ? gridSize - 1 : x - 1;
	};

	const getNextIndex = (x) => {
		return x + 1 === gridSize ? 0 : x + 1;
	};

	const getNewCell = (cell, liveNeighbours) => {
		if (liveNeighbours < 2 && cell.live) {
			// cell dies, as if caused by under-population
			return cell.die();
		} else if (liveNeighbours > 3 && cell.live) {
			// cell dies, as if caused by overcrowding
			return cell.die();
		} else if (liveNeighbours === 3 && cell.dead) {
			// cell becomes live, as if by reproduction
			return cell.rise();
		}
		return cell; // cell lives on to the next generation
	};

	const encode = () => {
		return this.grid.map(row => {
			return row.map(cell => {
				return cell.live ? 1 : 0;
			}).join('');
		}).join('');
	};

	const init = () => {
		this.createGrid();
	};

	init();
}

export default Grid;
