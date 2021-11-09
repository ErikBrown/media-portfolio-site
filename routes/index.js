var express = require('express');
var router = express.Router();
const getData = require('../utils/importData')

router.get('/', function(req, res, next) {
	res.render(
		'index',
		{
			pageClass:'landing-page',
			baseUrl: req.get('host'),
			...getData()
		}
	);
});

module.exports = router;
