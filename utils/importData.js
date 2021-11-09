const fs = require('fs');
const path = require('path');


function getData() {
	const filepath = path.resolve(__dirname, '../data/data.json');
	return JSON.parse(fs.readFileSync(filepath, {
		encoding: 'utf8'
	}))
}

module.exports = getData;
