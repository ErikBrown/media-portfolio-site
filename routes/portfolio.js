var express = require('express');
var router = express.Router();
var data = require('../data/data.json');

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
			...data
		}
	);
});

module.exports = router;
