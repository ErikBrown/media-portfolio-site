const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
let data = require('../data/data.json');
const multer  = require('multer');
const imageUpload = multer({ dest: 'uploads/' });
const getData = require('../utils/importData')

const diskStorage = multer.diskStorage({
	destination: function (req, file, cb) {
		if (file.fieldname === 'image') {
			cb(null, 'public/images/');
		} else if (file.fieldname === 'thumbnail') {
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
const diskUpload = multer({storage: diskStorage});

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

router.get('/edit', function(req, res, next) {
	res.render(
		'edit',
		{
			pageClass:'edit-page',
			baseUrl: req.get('host'),
			...getData()
		}
	);
});

router.post('/edit', function(req, res, next) {
	const cpUpload = diskUpload.fields([
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
			Object.keys(req.body).forEach(x => {
				newData[x] = req.body[x];
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
			const promises = [];
			Object.keys(req.body).forEach(x => {
				newData.portfolioItems[portfolioIndex][x] = req.body[x];
			});
			if (req.files.thumbnail) {
				const path = 'public/images/thumbnails/';
				const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
				const fileName = `${req.files.thumbnail[0].fieldname}-${uniqueSuffix}.webp`;
				promises.push(new Promise((resolve, reject) => {
					sharp(req.files.thumbnail[0].buffer)
						.webp({
							quality: 100,
						})
						.resize({
							width: 450 * Number(data.portfolioItems[portfolioIndex].gridLength),
							height: 450,
							fit: 'cover'
						})
						.toFile(`${path}${fileName}`)
						.then(info => {
							deleteFile(`./public/images/thumbnails/${data.portfolioItems[portfolioIndex].thumbnail}`);
							newData.portfolioItems[portfolioIndex].thumbnail = fileName;
							resolve();
						});
				}));
			}
			if (req.files.image) {
				const path = 'public/images/';
				const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
				const fileName = `${req.files.image[0].fieldname}-${uniqueSuffix}.webp`;
				promises.push(new Promise((resolve, reject) => {
					sharp(req.files.image[0].buffer)
						.webp({
							quality: 100
						})
						.resize({
							width: 1280,
							height: 720,
							fit: 'cover'
						})
						.toFile(`${path}${fileName}`)
						.then(info => {
							deleteFile(`./public/images/${data.portfolioItems[portfolioIndex].image}`);
							newData.portfolioItems[portfolioIndex].image = fileName;
							resolve();
						});
				}));
			}
			if (req.files.galleryImage) {
				const path = 'public/images/gallery/';
				const pathThumbnail = 'public/images/gallery/thumbnails/';
				req.files.galleryImage.forEach((val, index) => {
					const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
					const fileName = `${val.fieldname}-${uniqueSuffix}.webp`;
					const galleryPromises = [];
					promises.push(new Promise((resolve, reject) => {
						sharp(val.buffer)
							.webp({
								quality: 100
							})
							.toFile(`${path}${fileName}`)
							.then(info => {
								resolve();
							});
					}));
					promises.push(new Promise((resolve, reject) => {
						sharp(req.files.galleryThumbnail[index].buffer)
							.webp({
								quality: 100
							})
							.resize({
								width: 450,
								height: 450,
								fit: 'cover'
							})
							.toFile(`${pathThumbnail}${fileName}`)
							.then(info => {
								newData.portfolioItems[portfolioIndex].gallery.push({
									id: Math.round(Math.random() * 1E9),
									image: fileName,
									thumbnail: fileName
								});
								resolve();
							});
					}));
				})
			}
			Promise.all(promises)
			.then(() => {
				saveData(newData, res, `/edit/${portfolioIndex}`)
			})
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
			...getData()
		}
	);
});

router.delete('/edit/:portfolioIndex/:galleryId', function(req, res, next) {
	data.portfolioItems[req.params.portfolioIndex].gallery.forEach((val, index) => {
		if (val.id.toString() === req.params.galleryId.toString()) {
			const galleryItem = data.portfolioItems[req.params.portfolioIndex].gallery[index];
			deleteFile(`./public/images/gallery/${galleryItem.image}`);
			deleteFile(`./public/images/gallery/thumbnails/${galleryItem.image}`);
			const newData = { ...data };
			newData.portfolioItems[req.params.portfolioIndex].gallery.splice(index, 1);
			saveData(newData, res, '');
		}
	});
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
				if (redirect) {
					res.redirect(303, redirect);
				}
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
