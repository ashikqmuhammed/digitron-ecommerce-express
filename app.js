const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const hbs = require ('express-handlebars')
const session=require('express-session')
const nocache=require('nocache')
const dotenv=require('dotenv')
dotenv.config()


var authRouter=require('./routes/auth')
var customerRouter = require('./routes/customer');
var adminRouter = require('./routes/admin')
var vendorRouter= require('./routes/vendor')





var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({helpers: {
  inc: function (value, options) {
      return parseInt(value) + 1;
  }
}, extname:'hbs',layoutsDir: __dirname+'/views/layout',partialsDir: __dirname + '/views/partials'}));


app.use(nocache())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"Key",resave:true,saveUninitialized:false,cookie:{maxAge:6000000}}))

app.use('/', customerRouter);
app.use('/auth',authRouter)
app.use('/admin',adminRouter)
app.use('/vendor',vendorRouter)



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('error/error-404',{layout:'error-layout'})
});

// error handler
app.use(function(err, req, res, next) {
  res.render('error/error-500',{layout:'error-layout'})
});

module.exports = app;
