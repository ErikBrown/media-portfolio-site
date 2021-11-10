let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let indexRouter = require('./routes/index');
let porfolioRouter = require('./routes/portfolio');
let editRouter = require('./routes/edit');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(indexRouter);
app.use(porfolioRouter);
// app.use(editRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next();
});

// error handler
module.exports = app;
