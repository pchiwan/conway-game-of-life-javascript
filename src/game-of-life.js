import Grid from './grid.js';

/**
 * The jQuery Game of life class
 */
function GameOfLife (gridSize, $grid, $score, $message) {

    const intervalTime = 1000;
    let g = new Grid(gridSize);
    let interval = null;
    let generations = 0;
    let prevGrid = '';

    //------------------------------- PUBLIC METHODS

    this.start = () => {
        init();
        interval = setInterval(() => {
            let result = g.tick();
            generations++;
            this.drawGrid();
            if (!result.liveCells) {
                // our population has died, the game of life is over
                $message.text('The population has died');
                this.stop();
                return;
            }
            if (result.currentGrid === prevGrid) {
                // our population has stagnated, the game of life is over 
                $message.text('The population has stagnated');
                this.stop();
                return;
            }
            $message.text('Live cells: ' + result.liveCells);
            prevGrid = result.currentGrid;
        }, intervalTime);
    };

    this.stop = () => {
        if (interval) {
            clearInterval(interval);
        }
    };

    this.loadGrid = (table) => {
        g.loadGrid(table);
    };

    this.drawGrid = () => {
        $grid.empty();
        g.grid.forEach(row => {
            let $row = $('<tr></tr>');
            row.forEach(cell => {
                let $cell = $('<td></td>');
                if (cell.live) $cell.addClass('live');
                $row.append($cell);
            });
            $grid.append($row);
        });
        $score.text(generations);
    };

    //------------------------------- PRIVATE METHODS
    
    const init = () => {
        generations = 0;
        $score.text('0');
        $message.text('');
        this.stop();
        this.drawGrid();
    };

    init();
}

export default GameOfLife;
