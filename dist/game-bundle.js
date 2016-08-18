(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * The cell class
 */
function Cell(initialStatus) {
	var _this = this;

	var status = initialStatus !== undefined ? initialStatus : false;

	Object.defineProperty(this, 'live', {
		get: function get() {
			return !!status;
		}
	});

	Object.defineProperty(this, 'dead', {
		get: function get() {
			return !status;
		}
	});

	this.die = function () {
		status = false;
		return _this;
	};

	this.rise = function () {
		status = true;
		return _this;
	};
}

exports.default = Cell;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _grid = require('./grid.js');

var _grid2 = _interopRequireDefault(_grid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The jQuery Game of life class
 */
function GameOfLife(gridSize, $grid, $score, $message) {
    var _this = this;

    var intervalTime = 1000;
    var g = new _grid2.default(gridSize);
    var interval = null;
    var generations = 0;
    var prevGrid = '';

    //------------------------------- PUBLIC METHODS

    this.start = function () {
        init();
        interval = setInterval(function () {
            var result = g.tick();
            generations++;
            _this.drawGrid();
            if (!result.liveCells) {
                // our population has died, the game of life is over
                $message.text('The population has died');
                _this.stop();
                return;
            }
            if (result.currentGrid === prevGrid) {
                // our population has stagnated, the game of life is over
                $message.text('The population has stagnated');
                _this.stop();
                return;
            }
            $message.text('Live cells: ' + result.liveCells);
            prevGrid = result.currentGrid;
        }, intervalTime);
    };

    this.stop = function () {
        if (interval) {
            clearInterval(interval);
        }
    };

    this.loadGrid = function (table) {
        g.loadGrid(table);
    };

    this.drawGrid = function () {
        $grid.empty();
        g.grid.forEach(function (row) {
            var $row = $('<tr></tr>');
            row.forEach(function (cell) {
                var $cell = $('<td></td>');
                if (cell.live) $cell.addClass('live');
                $row.append($cell);
            });
            $grid.append($row);
        });
        $score.text(generations);
    };

    //------------------------------- PRIVATE METHODS

    var init = function init() {
        generations = 0;
        $score.text('0');
        $message.text('');
        _this.stop();
        _this.drawGrid();
    };

    init();
}

exports.default = GameOfLife;

},{"./grid.js":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _cell = require('./cell.js');

var _cell2 = _interopRequireDefault(_cell);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The grid class
 */
function Grid(size) {
	var _this = this;

	var gridSize = size;
	this.grid = [];

	//------------------------------- PUBLIC METHODS

	this.createGrid = function () {
		_this.grid = [];
		for (var i = 0, l1 = gridSize; i < l1; i++) {
			var row = [];
			for (var j = 0, l2 = gridSize; j < l2; j++) {
				row.push(new _cell2.default());
			}
			_this.grid.push(row);
		}
	};

	this.loadGrid = function (table) {
		if (table.length != _this.grid.length) return;

		table.forEach(function (tr, x) {
			tr.forEach(function (td, y) {
				if (td) {
					_this.grid[x][y].rise();
				} else {
					_this.grid[x][y].die();
				}
			});
		});
	};

	this.tick = function () {
		_this.grid = newGeneration();
		return {
			currentGrid: encode(),
			liveCells: findLiveCells()
		};
	};

	//------------------------------- PRIVATE METHODS

	var cloneGrid = function cloneGrid() {
		var newGrid = [];
		_this.grid.forEach(function (row) {
			var newRow = [];
			row.forEach(function (cell) {
				newRow.push(new _cell2.default(cell.live));
			});
			newGrid.push(newRow);
		});
		return newGrid;
	};

	var newGeneration = function newGeneration() {
		var newGrid = cloneGrid();
		_this.grid.forEach(function (row, x) {
			row.forEach(function (cell, y) {
				var liveNeighbours = checkNeighbours(x, y);
				newGrid[x][y] = getNewCell(cell, liveNeighbours);
			});
		});
		return newGrid;
	};

	var findLiveCells = function findLiveCells() {
		return _this.grid.reduce(function (liveCellsInRow, row) {
			return liveCellsInRow + row.reduce(function (liveCells, cell) {
				return liveCells + (cell.live ? 1 : 0);
			}, 0);
		}, 0);
	};

	var checkNeighbours = function checkNeighbours(x, y) {
		var liveNeighbours = 0;
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

	var checkNeighbour = function checkNeighbour(x, y) {
		return _this.grid[x][y].live ? 1 : 0;
	};

	var getPrevIndex = function getPrevIndex(x) {
		return x - 1 < 0 ? gridSize - 1 : x - 1;
	};

	var getNextIndex = function getNextIndex(x) {
		return x + 1 === gridSize ? 0 : x + 1;
	};

	var getNewCell = function getNewCell(cell, liveNeighbours) {
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

	var encode = function encode() {
		return _this.grid.map(function (row) {
			return row.map(function (cell) {
				return cell.live ? 1 : 0;
			}).join('');
		}).join('');
	};

	var init = function init() {
		_this.createGrid();
	};

	init();
}

exports.default = Grid;

},{"./cell.js":1}],4:[function(require,module,exports){
'use strict';

var _gameOfLife = require('./game-of-life.js');

var _gameOfLife2 = _interopRequireDefault(_gameOfLife);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function () {
	var game = null;

	$('#createGrid').on('click', function () {
		var gridSize = $('#gridSize').val();

		if (gridSize) {
			game = new _gameOfLife2.default(parseInt(gridSize, 10), $('#grid'), $('#generations'), $('#message'));

			bindGrid();
			$('#game-of-life').show();
		}
	});

	$('#startGame').on('click', function () {
		if (game) {
			(function () {
				var table = [];
				$('#grid tr').each(function () {
					var tr = [];
					$(this).find('td').each(function () {
						tr.push($(this).hasClass('live') ? true : false);
					});
					table.push(tr);
				});
				game.loadGrid(table);
				game.start();
			})();
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
})();

},{"./game-of-life.js":2}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL1PDrWx2aWEvQXBwRGF0YS9Sb2FtaW5nL25wbS9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyY1xcY2VsbC5qcyIsInNyY1xcZ2FtZS1vZi1saWZlLmpzIiwic3JjXFxncmlkLmpzIiwic3JjXFxnYW1lLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNHQSxTQUFTLElBQVQsQ0FBYyxhQUFkLEVBQTZCO0FBQUE7O0FBRTVCLEtBQUksU0FBUyxrQkFBa0IsU0FBbEIsR0FBOEIsYUFBOUIsR0FBOEMsS0FBM0Q7O0FBRUEsUUFBTyxjQUFQLENBQXNCLElBQXRCLEVBQTRCLE1BQTVCLEVBQW9DO0FBQ25DLE9BQUssZUFBTTtBQUNWLFVBQU8sQ0FBQyxDQUFDLE1BQVQ7QUFDQTtBQUhrQyxFQUFwQzs7QUFNQSxRQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsTUFBNUIsRUFBb0M7QUFDbkMsT0FBSyxlQUFNO0FBQ1YsVUFBTyxDQUFDLE1BQVI7QUFDQTtBQUhrQyxFQUFwQzs7QUFNQSxNQUFLLEdBQUwsR0FBVyxZQUFNO0FBQ2hCLFdBQVMsS0FBVDtBQUNBO0FBQ0EsRUFIRDs7QUFLQSxNQUFLLElBQUwsR0FBWSxZQUFNO0FBQ2pCLFdBQVMsSUFBVDtBQUNBO0FBQ0EsRUFIRDtBQUlBOztrQkFFYyxJOzs7Ozs7Ozs7QUM5QmY7Ozs7Ozs7OztBQUtBLFNBQVMsVUFBVCxDQUFxQixRQUFyQixFQUErQixLQUEvQixFQUFzQyxNQUF0QyxFQUE4QyxRQUE5QyxFQUF3RDtBQUFBOztBQUVwRCxRQUFNLGVBQWUsSUFBckI7QUFDQSxRQUFJLElBQUksbUJBQVMsUUFBVCxDQUFSO0FBQ0EsUUFBSSxXQUFXLElBQWY7QUFDQSxRQUFJLGNBQWMsQ0FBbEI7QUFDQSxRQUFJLFdBQVcsRUFBZjs7OztBQUlBLFNBQUssS0FBTCxHQUFhLFlBQU07QUFDZjtBQUNBLG1C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RixDQUpNLENBQVA7O0FBTUE7QUFDQSxLQUFFLGVBQUYsRUFBbUIsSUFBbkI7QUFDQTtBQUNELEVBYkQ7O0FBZUEsR0FBRSxZQUFGLEVBQWdCLEVBQWhCLENBQW1CLE9BQW5CLEVBQTRCLFlBQVk7QUFDdkMsTUFBSSxJQUFKLEVBQVU7QUFBQTtBQUNULFFBQUksUUFBUSxFQUFaO0FBQ0EsTUFBRSxVQUFGLEVBQWMsSUFBZCxDQUFtQixZQUFZO0FBQzlCLFNBQUksS0FBSyxFQUFUO0FBQ0EsT0FBRSxJQUFGLEVBQVEsSUFBUixDQUFhLElBQWIsRUFBbUIsSUFBbkIsQ0FBd0IsWUFBWTtBQUNuQyxTQUFHLElBQUgsQ0FBUSxFQUFFLElBQUYsRUFBUSxRQUFSLENBQWlCLE1BQWpCLElBQTJCLElBQTNCLEdBQWtDLEtBQTFDO0FBQ0EsTUFGRDtBQUdBLFdBQU0sSUFBTixDQUFXLEVBQVg7QUFDQSxLQU5EO0FBT0EsU0FBSyxRQUFMLENBQWMsS0FBZDtBQUNBLFNBQUssS0FBTDtBQVZTO0FBV1Q7QUFDRCxFQWJEOztBQWVBLEdBQUUsV0FBRixFQUFlLEVBQWYsQ0FBa0IsT0FBbEIsRUFBMkIsWUFBWTtBQUN0QyxNQUFJLElBQUosRUFBVTtBQUNULFFBQUssSUFBTDtBQUNBO0FBQ0QsRUFKRDs7QUFNQSxVQUFTLFFBQVQsR0FBb0I7QUFDbkIsSUFBRSxVQUFGLEVBQWMsRUFBZCxDQUFpQixPQUFqQixFQUEwQixZQUFZO0FBQ3JDLEtBQUUsSUFBRixFQUFRLFdBQVIsQ0FBb0IsTUFBcEI7QUFDQSxHQUZEO0FBR0E7QUFDRCxDQTVDQSxHQUFEIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxyXG4gKiBUaGUgY2VsbCBjbGFzc1xyXG4gKi9cclxuZnVuY3Rpb24gQ2VsbChpbml0aWFsU3RhdHVzKSB7XHJcblx0XHJcblx0bGV0IHN0YXR1cyA9IGluaXRpYWxTdGF0dXMgIT09IHVuZGVmaW5lZCA/IGluaXRpYWxTdGF0dXMgOiBmYWxzZTtcclxuXHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdsaXZlJywge1xyXG5cdFx0Z2V0OiAoKSA9PiB7XHJcblx0XHRcdHJldHVybiAhIXN0YXR1cztcclxuXHRcdH1cclxuXHR9KTtcclxuXHJcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdkZWFkJywge1xyXG5cdFx0Z2V0OiAoKSA9PiB7XHJcblx0XHRcdHJldHVybiAhc3RhdHVzO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cclxuXHR0aGlzLmRpZSA9ICgpID0+IHtcclxuXHRcdHN0YXR1cyA9IGZhbHNlIDtcclxuXHRcdHJldHVybiB0aGlzO1xyXG5cdH07XHJcblxyXG5cdHRoaXMucmlzZSA9ICgpID0+IHtcclxuXHRcdHN0YXR1cyA9IHRydWU7XHJcblx0XHRyZXR1cm4gdGhpcztcclxuXHR9O1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBDZWxsOyIsImltcG9ydCBHcmlkIGZyb20gJy4vZ3JpZC5qcyc7XHJcblxyXG4vKipcclxuICogVGhlIGpRdWVyeSBHYW1lIG9mIGxpZmUgY2xhc3NcclxuICovXHJcbmZ1bmN0aW9uIEdhbWVPZkxpZmUgKGdyaWRTaXplLCAkZ3JpZCwgJHNjb3JlLCAkbWVzc2FnZSkge1xyXG5cclxuICAgIGNvbnN0IGludGVydmFsVGltZSA9IDEwMDA7XHJcbiAgICBsZXQgZyA9IG5ldyBHcmlkKGdyaWRTaXplKTtcclxuICAgIGxldCBpbnRlcnZhbCA9IG51bGw7XHJcbiAgICBsZXQgZ2VuZXJhdGlvbnMgPSAwO1xyXG4gICAgbGV0IHByZXZHcmlkID0gJyc7XHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFBVQkxJQyBNRVRIT0RTXHJcblxyXG4gICAgdGhpcy5zdGFydCA9ICgpID0+IHtcclxuICAgICAgICBpbml0KCk7XHJcbiAgICAgICAgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBnLnRpY2soKTtcclxuICAgICAgICAgICAgZ2VuZXJhdGlvbnMrKztcclxuICAgICAgICAgICAgdGhpcy5kcmF3R3JpZCgpO1xyXG4gICAgICAgICAgICBpZiAoIXJlc3VsdC5saXZlQ2VsbHMpIHtcclxuICAgICAgICAgICAgICAgIC8vIG91ciBwb3B1bGF0aW9uIGhhcyBkaWVkLCB0aGUgZ2FtZSBvZiBsaWZlIGlzIG92ZXJcclxuICAgICAgICAgICAgICAgICRtZXNzYWdlLnRleHQoJ1RoZSBwb3B1bGF0aW9uIGhhcyBkaWVkJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3AoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocmVzdWx0LmN1cnJlbnRHcmlkID09PSBwcmV2R3JpZCkge1xyXG4gICAgICAgICAgICAgICAgLy8gb3VyIHBvcHVsYXRpb24gaGFzIHN0YWduYXRlZCwgdGhlIGdhbWUgb2YgbGlmZSBpcyBvdmVyIFxyXG4gICAgICAgICAgICAgICAgJG1lc3NhZ2UudGV4dCgnVGhlIHBvcHVsYXRpb24gaGFzIHN0YWduYXRlZCcpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJG1lc3NhZ2UudGV4dCgnTGl2ZSBjZWxsczogJyArIHJlc3VsdC5saXZlQ2VsbHMpO1xyXG4gICAgICAgICAgICBwcmV2R3JpZCA9IHJlc3VsdC5jdXJyZW50R3JpZDtcclxuICAgICAgICB9LCBpbnRlcnZhbFRpbWUpO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnN0b3AgPSAoKSA9PiB7XHJcbiAgICAgICAgaWYgKGludGVydmFsKSB7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5sb2FkR3JpZCA9ICh0YWJsZSkgPT4ge1xyXG4gICAgICAgIGcubG9hZEdyaWQodGFibGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLmRyYXdHcmlkID0gKCkgPT4ge1xyXG4gICAgICAgICRncmlkLmVtcHR5KCk7XHJcbiAgICAgICAgZy5ncmlkLmZvckVhY2gocm93ID0+IHtcclxuICAgICAgICAgICAgbGV0ICRyb3cgPSAkKCc8dHI+PC90cj4nKTtcclxuICAgICAgICAgICAgcm93LmZvckVhY2goY2VsbCA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgJGNlbGwgPSAkKCc8dGQ+PC90ZD4nKTtcclxuICAgICAgICAgICAgICAgIGlmIChjZWxsLmxpdmUpICRjZWxsLmFkZENsYXNzKCdsaXZlJyk7XHJcbiAgICAgICAgICAgICAgICAkcm93LmFwcGVuZCgkY2VsbCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkZ3JpZC5hcHBlbmQoJHJvdyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJHNjb3JlLnRleHQoZ2VuZXJhdGlvbnMpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUFJJVkFURSBNRVRIT0RTXHJcbiAgICBcclxuICAgIGNvbnN0IGluaXQgPSAoKSA9PiB7XHJcbiAgICAgICAgZ2VuZXJhdGlvbnMgPSAwO1xyXG4gICAgICAgICRzY29yZS50ZXh0KCcwJyk7XHJcbiAgICAgICAgJG1lc3NhZ2UudGV4dCgnJyk7XHJcbiAgICAgICAgdGhpcy5zdG9wKCk7XHJcbiAgICAgICAgdGhpcy5kcmF3R3JpZCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICBpbml0KCk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdhbWVPZkxpZmU7XHJcbiIsImltcG9ydCBDZWxsIGZyb20gJy4vY2VsbC5qcyc7XHJcblxyXG4vKipcclxuICogVGhlIGdyaWQgY2xhc3NcclxuICovXHJcbmZ1bmN0aW9uIEdyaWQoc2l6ZSkge1xyXG5cclxuXHRsZXQgZ3JpZFNpemUgPSBzaXplO1x0XHJcblx0dGhpcy5ncmlkID0gW107XHRcclxuXHJcblx0Ly8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFBVQkxJQyBNRVRIT0RTXHJcblxyXG5cdHRoaXMuY3JlYXRlR3JpZCA9ICgpID0+IHtcclxuXHRcdHRoaXMuZ3JpZCA9IFtdO1xyXG5cdFx0Zm9yIChsZXQgaSA9IDAsIGwxID0gZ3JpZFNpemU7IGkgPCBsMTsgaSsrKSB7XHJcblx0XHRcdGxldCByb3cgPSBbXTtcclxuXHRcdFx0Zm9yIChsZXQgaiA9IDAsIGwyID0gZ3JpZFNpemU7IGogPCBsMjsgaisrKSB7XHJcblx0XHRcdFx0cm93LnB1c2gobmV3IENlbGwoKSk7XHJcblx0XHRcdH1cclxuXHRcdFx0dGhpcy5ncmlkLnB1c2gocm93KTtcclxuXHRcdH1cclxuXHR9O1x0XHJcblxyXG5cdHRoaXMubG9hZEdyaWQgPSAodGFibGUpID0+IHtcclxuXHRcdGlmICh0YWJsZS5sZW5ndGggIT0gdGhpcy5ncmlkLmxlbmd0aCkgXHJcblx0XHRcdHJldHVybjtcclxuXHJcblx0XHR0YWJsZS5mb3JFYWNoKCh0ciwgeCkgPT4ge1xyXG5cdFx0XHR0ci5mb3JFYWNoKCh0ZCwgeSkgPT4ge1xyXG5cdFx0XHRcdGlmICh0ZCkge1xyXG5cdFx0XHRcdFx0dGhpcy5ncmlkW3hdW3ldLnJpc2UoKTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0dGhpcy5ncmlkW3hdW3ldLmRpZSgpO1xyXG5cdFx0XHRcdH1cdFx0XHRcdFxyXG5cdFx0XHR9KTtcclxuXHRcdH0pXHJcblx0fTtcclxuXHJcblx0dGhpcy50aWNrID0gKCkgPT4ge1xyXG5cdFx0dGhpcy5ncmlkID0gbmV3R2VuZXJhdGlvbigpO1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0Y3VycmVudEdyaWQ6IGVuY29kZSgpLFxyXG5cdFx0XHRsaXZlQ2VsbHM6IGZpbmRMaXZlQ2VsbHMoKVxyXG5cdFx0fTtcclxuXHR9O1xyXG5cclxuXHQvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUFJJVkFURSBNRVRIT0RTXHJcblxyXG5cdGNvbnN0IGNsb25lR3JpZCA9ICgpID0+IHtcclxuXHRcdGxldCBuZXdHcmlkID0gW107XHJcblx0XHR0aGlzLmdyaWQuZm9yRWFjaChyb3cgPT4ge1xyXG5cdFx0XHRsZXQgbmV3Um93ID0gW107XHJcblx0XHRcdHJvdy5mb3JFYWNoKGNlbGwgPT4ge1xyXG5cdFx0XHRcdG5ld1Jvdy5wdXNoKG5ldyBDZWxsKGNlbGwubGl2ZSkpO1xyXG5cdFx0XHR9KTtcclxuXHRcdFx0bmV3R3JpZC5wdXNoKG5ld1Jvdyk7XHJcblx0XHR9KTtcclxuXHRcdHJldHVybiBuZXdHcmlkO1xyXG5cdH07XHJcblxyXG5cdGNvbnN0IG5ld0dlbmVyYXRpb24gPSAoKSA9PiB7XHJcblx0XHRsZXQgbmV3R3JpZCA9IGNsb25lR3JpZCgpO1xyXG5cdFx0dGhpcy5ncmlkLmZvckVhY2goKHJvdywgeCkgPT4ge1xyXG5cdFx0XHRyb3cuZm9yRWFjaCgoY2VsbCwgeSkgPT4ge1xyXG5cdFx0XHRcdGxldCBsaXZlTmVpZ2hib3VycyA9IGNoZWNrTmVpZ2hib3Vycyh4LCB5KTtcclxuXHRcdFx0XHRuZXdHcmlkW3hdW3ldID0gZ2V0TmV3Q2VsbChjZWxsLCBsaXZlTmVpZ2hib3Vycyk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0XHRyZXR1cm4gbmV3R3JpZDtcclxuXHR9O1xyXG5cclxuXHRjb25zdCBmaW5kTGl2ZUNlbGxzID0gKCkgPT4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuZ3JpZC5yZWR1Y2UoKGxpdmVDZWxsc0luUm93LCByb3cpID0+IHtcclxuXHRcdFx0cmV0dXJuIGxpdmVDZWxsc0luUm93ICsgcm93LnJlZHVjZSgobGl2ZUNlbGxzLCBjZWxsKSA9PiB7XHJcblx0XHRcdFx0cmV0dXJuIGxpdmVDZWxscyArIChjZWxsLmxpdmUgPyAxIDogMCk7XHJcblx0XHRcdH0sIDApO1xyXG5cdFx0fSwgMCk7XHJcblx0fTtcclxuXHJcblx0Y29uc3QgY2hlY2tOZWlnaGJvdXJzID0gKHgsIHkpID0+IHtcclxuXHRcdGxldCBsaXZlTmVpZ2hib3VycyA9IDA7XHJcblx0XHQvLyBjaGVjayA4IG5laWdoYm91cnMgY2xvY2t3aXNlXHJcblx0XHRsaXZlTmVpZ2hib3VycyArPSBjaGVja05laWdoYm91cihnZXRQcmV2SW5kZXgoeCksIGdldFByZXZJbmRleCh5KSk7IC8vIHRvcCBsZWZ0IGNlbGxcclxuXHRcdGxpdmVOZWlnaGJvdXJzICs9IGNoZWNrTmVpZ2hib3VyKHgsIGdldFByZXZJbmRleCh5KSk7IC8vIHRvcCBjZWxsXHJcblx0XHRsaXZlTmVpZ2hib3VycyArPSBjaGVja05laWdoYm91cihnZXROZXh0SW5kZXgoeCksIGdldFByZXZJbmRleCh5KSk7IC8vIHRvcCByaWdodCBjZWxsXHJcblx0XHRsaXZlTmVpZ2hib3VycyArPSBjaGVja05laWdoYm91cihnZXROZXh0SW5kZXgoeCksIHkpOyAvLyByaWdodCBjZWxsXHJcblx0XHRsaXZlTmVpZ2hib3VycyArPSBjaGVja05laWdoYm91cihnZXROZXh0SW5kZXgoeCksIGdldE5leHRJbmRleCh5KSk7IC8vIGJvdHRvbSByaWdodCBjZWxsXHJcblx0XHRsaXZlTmVpZ2hib3VycyArPSBjaGVja05laWdoYm91cih4LCBnZXROZXh0SW5kZXgoeSkpOyAvLyBib3R0b20gY2VsbFxyXG5cdFx0bGl2ZU5laWdoYm91cnMgKz0gY2hlY2tOZWlnaGJvdXIoZ2V0UHJldkluZGV4KHgpLCBnZXROZXh0SW5kZXgoeSkpOyAvLyBib3R0b20gbGVmdCBjZWxsXHJcblx0XHRsaXZlTmVpZ2hib3VycyArPSBjaGVja05laWdoYm91cihnZXRQcmV2SW5kZXgoeCksIHkpOyAvLyBsZWZ0IGNlbGxcclxuXHRcdHJldHVybiBsaXZlTmVpZ2hib3VycztcclxuXHR9O1xyXG5cclxuXHRjb25zdCBjaGVja05laWdoYm91ciA9ICh4LCB5KSA9PiB7XHJcblx0XHRyZXR1cm4gdGhpcy5ncmlkW3hdW3ldLmxpdmUgPyAxIDogMDtcclxuXHR9O1xyXG5cclxuXHRjb25zdCBnZXRQcmV2SW5kZXggPSAoeCkgPT4ge1xyXG5cdFx0cmV0dXJuIHggLSAxIDwgMCA/IGdyaWRTaXplIC0gMSA6IHggLSAxO1xyXG5cdH07XHJcblxyXG5cdGNvbnN0IGdldE5leHRJbmRleCA9ICh4KSA9PiB7XHJcblx0XHRyZXR1cm4geCArIDEgPT09IGdyaWRTaXplID8gMCA6IHggKyAxO1xyXG5cdH07XHJcblxyXG5cdGNvbnN0IGdldE5ld0NlbGwgPSAoY2VsbCwgbGl2ZU5laWdoYm91cnMpID0+IHtcclxuXHRcdGlmIChsaXZlTmVpZ2hib3VycyA8IDIgJiYgY2VsbC5saXZlKSB7XHJcblx0XHRcdC8vIGNlbGwgZGllcywgYXMgaWYgY2F1c2VkIGJ5IHVuZGVyLXBvcHVsYXRpb25cclxuXHRcdFx0cmV0dXJuIGNlbGwuZGllKCk7XHJcblx0XHR9IGVsc2UgaWYgKGxpdmVOZWlnaGJvdXJzID4gMyAmJiBjZWxsLmxpdmUpIHtcclxuXHRcdFx0Ly8gY2VsbCBkaWVzLCBhcyBpZiBjYXVzZWQgYnkgb3ZlcmNyb3dkaW5nXHJcblx0XHRcdHJldHVybiBjZWxsLmRpZSgpO1xyXG5cdFx0fSBlbHNlIGlmIChsaXZlTmVpZ2hib3VycyA9PT0gMyAmJiBjZWxsLmRlYWQpIHtcclxuXHRcdFx0Ly8gY2VsbCBiZWNvbWVzIGxpdmUsIGFzIGlmIGJ5IHJlcHJvZHVjdGlvblxyXG5cdFx0XHRyZXR1cm4gY2VsbC5yaXNlKCk7XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gY2VsbDsgLy8gY2VsbCBsaXZlcyBvbiB0byB0aGUgbmV4dCBnZW5lcmF0aW9uXHJcblx0fTtcclxuXHJcblx0Y29uc3QgZW5jb2RlID0gKCkgPT4ge1xyXG5cdFx0cmV0dXJuIHRoaXMuZ3JpZC5tYXAocm93ID0+IHtcclxuXHRcdFx0cmV0dXJuIHJvdy5tYXAoY2VsbCA9PiB7XHJcblx0XHRcdFx0cmV0dXJuIGNlbGwubGl2ZSA/IDEgOiAwO1xyXG5cdFx0XHR9KS5qb2luKCcnKTtcclxuXHRcdH0pLmpvaW4oJycpO1xyXG5cdH07XHJcblxyXG5cdGNvbnN0IGluaXQgPSAoKSA9PiB7XHJcblx0XHR0aGlzLmNyZWF0ZUdyaWQoKTtcclxuXHR9O1xyXG5cclxuXHRpbml0KCk7XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IEdyaWQ7XHJcbiIsImltcG9ydCBHYW1lT2ZMaWZlIGZyb20gJy4vZ2FtZS1vZi1saWZlLmpzJztcclxuXHJcbihmdW5jdGlvbiAoKSB7XHJcblx0bGV0IGdhbWUgPSBudWxsO1xyXG5cclxuXHQkKCcjY3JlYXRlR3JpZCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdGxldCBncmlkU2l6ZSA9ICQoJyNncmlkU2l6ZScpLnZhbCgpO1xyXG5cclxuXHRcdGlmIChncmlkU2l6ZSkge1xyXG5cdFx0XHRnYW1lID0gbmV3IEdhbWVPZkxpZmUoXHJcblx0XHRcdFx0cGFyc2VJbnQoZ3JpZFNpemUsIDEwKSxcclxuXHRcdFx0XHQkKCcjZ3JpZCcpLFxyXG5cdFx0XHRcdCQoJyNnZW5lcmF0aW9ucycpLFxyXG5cdFx0XHRcdCQoJyNtZXNzYWdlJykpO1xyXG5cclxuXHRcdFx0YmluZEdyaWQoKTtcclxuXHRcdFx0JCgnI2dhbWUtb2YtbGlmZScpLnNob3coKTtcclxuXHRcdH1cclxuXHR9KTtcclxuXHJcblx0JCgnI3N0YXJ0R2FtZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmIChnYW1lKSB7XHJcblx0XHRcdGxldCB0YWJsZSA9IFtdO1xyXG5cdFx0XHQkKCcjZ3JpZCB0cicpLmVhY2goZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRcdGxldCB0ciA9IFtdO1xyXG5cdFx0XHRcdCQodGhpcykuZmluZCgndGQnKS5lYWNoKGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0XHRcdHRyLnB1c2goJCh0aGlzKS5oYXNDbGFzcygnbGl2ZScpID8gdHJ1ZSA6IGZhbHNlKTtcclxuXHRcdFx0XHR9KTtcclxuXHRcdFx0XHR0YWJsZS5wdXNoKHRyKTtcclxuXHRcdFx0fSk7XHJcblx0XHRcdGdhbWUubG9hZEdyaWQodGFibGUpO1xyXG5cdFx0XHRnYW1lLnN0YXJ0KCk7XHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cdCQoJyNzdG9wR2FtZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcclxuXHRcdGlmIChnYW1lKSB7XHJcblx0XHRcdGdhbWUuc3RvcCgpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cclxuXHRmdW5jdGlvbiBiaW5kR3JpZCgpIHtcclxuXHRcdCQoJyNncmlkIHRkJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xyXG5cdFx0XHQkKHRoaXMpLnRvZ2dsZUNsYXNzKCdsaXZlJyk7XHJcblx0XHR9KTtcclxuXHR9XHJcbn0gKCkpO1xyXG4iXX0=
