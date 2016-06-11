/**
 * The cell class
 */
function Cell(initialStatus) {
	
	let status = initialStatus !== undefined ? initialStatus : false;

	Object.defineProperty(this, 'live', {
		get: () => {
			return !!status;
		}
	});

	Object.defineProperty(this, 'dead', {
		get: () => {
			return !status;
		}
	});

	this.die = () => {
		status = false ;
		return this;
	};

	this.rise = () => {
		status = true;
		return this;
	};
}

export default Cell;