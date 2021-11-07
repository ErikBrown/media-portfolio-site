var express = require('express');
var router = express.Router();
var data = require('../data/data.json');

router.get('/', function(req, res, next) {
	res.render(
		'index',
		{
			pageClass:'landing-page',
			baseUrl: req.get('host'),
			...data
		}
	);
});

module.exports = router;
