const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
let data = require('../data/data.json');
const multer  = require('multer');
const imageUpload = multer({ dest: 'uploads/' });

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		if (file.fieldname === 'image') {
			cb(null, 'public/images/');
		}
		else if (file.fieldname === 'thumbnail') {
			cb(null, 'public/images/thumbnails/');
		} else if (file.fieldname.includes('video')) {
			cb(null, 'public/videos/');
		} else if (file.fieldname === 'galleryImage') {
			cb(null, 'public/images/gallery');
		} else if (file.fieldname === 'galleryThumbnail') {
			cb(null, 'public/images/gallery/thumbnails');
		} else {
			cb(null, 'public/video/');
		}
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
	}
});

const upload = multer({storage: storage});

router.get('/edit', function(req, res, next) {
	res.render(
		'edit',
		{
			pageClass:'edit-page',
			baseUrl: req.get('host'),
			...data
		}
	);
});

router.post('/edit', function(req, res, next) {
	const cpUpload = upload.fields([
		{ name: 'videoMp4', maxCount: 1 },
		{ name: 'videoWebm', maxCount: 1 }
	]);
	cpUpload(req, res, function (err) {
		if (err) {
			console.error(err);
			res.status(500).send(err);
		} else {
			const newData = { ...data };

			if (req.files.videoMp4) {
				deleteFile(`./public/videos/${data.headerVideoMp4}`);
				newData.headerVideoMp4 = req.files.videoMp4[0].filename;
			}
			if (req.files.videoWebm) {
				deleteFile(`./public/videos/${data.headerVideoWebm}`);
				newData.headerVideoWebm = req.files.videoWebm[0].filename;
			}
			// Update general site metadata
			const writeableState = Object.keys(newData).filter(x => {
				if (typeof newData[x] !== 'object') {
					return true;
				}
			})
			writeableState.forEach(x => {
				if (req.body[x]) {
					newData[x] = req.body[x];
				}
			});

			// Update Socials
			newData.socials = newData.socials.map((val, index) => {
				return {
					...val,
					url: req.body.social[index]
				};
			});
			saveData(newData, res, '/edit')
		}
	});
});

/* GET home page. */
router.post('/edit/:path', function(req, res, next) {
	const cpUpload = upload.fields([
		{ name: 'image', maxCount: 1 },
		{ name: 'thumbnail', maxCount: 1 },
		{ name: 'galleryImage' },
		{ name: 'galleryThumbnail' }
	]);
	cpUpload(req, res, function (err) {
		if (err) {
			console.error(err);
			res.status(500).send(err);
		} else {
			const portfolioIndex = req.params.path;
			const newData = { ...data };
			const writeableState = Object.keys(newData.portfolioItems[portfolioIndex]).filter(x => {
				if (typeof newData.portfolioItems[portfolioIndex][x] !== 'object') {
					return true;
				}
			})
			writeableState.forEach(x => {
				if (req.body[x]) {
					newData.portfolioItems[portfolioIndex][x] = req.body[x];
				}
			});
			if (req.files.thumbnail) {
				deleteFile(`./public/images/thumbnails/${data.portfolioItems[portfolioIndex].thumbnail}`);
				newData.portfolioItems[portfolioIndex].thumbnail = req.files.thumbnail[0].filename;
			}
			if (req.files.image) {
				deleteFile(`./public/images/${data.portfolioItems[portfolioIndex].image}`);
				newData.portfolioItems[portfolioIndex].image = req.files.image[0].filename;
			}
			if (req.files.galleryImage) {
				req.files.galleryImage.forEach((val, index) => {
					newData.portfolioItems[portfolioIndex].gallery.push({
						image: val.filename,
						thumbnail: req.files.galleryThumbnail[index].filename
					});
				})
			}
			saveData(newData, res, `/edit/${portfolioIndex}`)
		}
	})
});

router.get('/edit/:path', function(req, res, next) {
	res.render(
		'editPortfolioItem',
		{
			pageClass:'edit-page',
			item: data.portfolioItems[req.params.path],
			baseUrl: req.get('host'),
			...data
		}
	);
});

router.delete('/edit/:path/:galleryIndex', function(req, res, next) {
	const galleryItem = data.portfolioItems[req.params.path].gallery[req.params.galleryIndex];
	deleteFile(`./public/images/gallery/${galleryItem.image}`);
	deleteFile(`./public/images/gallery/thumbnail/${galleryItem.image}`);
	const newData = { ...data };
	newData.portfolioItems[req.params.path].gallery.splice(req.params.galleryIndex, 1);
	saveData(newData);
	res.status(204).send(null);
});

function saveData(newData, res, redirect) {
	fs.copyFile('./data/data.json', './data/data-old.json')
		.then(done => {
			fs.writeFile(
				'./data/data.json',
				JSON.stringify(newData, null, 2),
				'utf-8'
			).then(done => {
				data = newData;
				res.redirect(303, redirect);
			}).catch(err => {
				console.error(err);
				res.status(500).send(err);
			});
		})
		.catch(err => {
			console.error(err);
		});
}

function deleteFile(path) {
	fs.unlink(path)
		.then(done => {
		})
		.catch(err => {
			console.error(err);
		}
	);
}

module.exports = router;
