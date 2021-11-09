var express = require('express');
var router = express.Router();
var data = require('../data/data.json');
const getData = require('../utils/importData');

router.get('/:path', function(req, res, next) {
	const filteredItems = data.portfolioItems.filter(item => {
		if (item.url === req.params.path) {
			return true;
		} else {
			return false;
		}
	});
	console.log(req.params.path, filteredItems)
	if (!filteredItems.length) {
		next()
		return
	}
	const item = filteredItems[0];
	res.render(
		'portfolio',
		{
			pageClass:'portfolio-page',
			item: item,
			baseUrl: req.get('host'),
			...getData()
		}
	);
});

module.exports = router;
