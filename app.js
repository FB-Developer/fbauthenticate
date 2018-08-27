var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const mongoose=require('mongoose');
const corst=require('cors');
var jwt =require('jsonwebtoken');
var index = require('./routes/index');
var users = require('./routes/users');
var results = require('./routes/results');
var details = require('./routes/details');
var upload = require('./routes/upload');
var config = require('./config');
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//
//connect db
mongoose.connect(config.database,{useMongoClient:true});
//
//check db connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Connected");
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(corst());
app.use(bodyParser.json({limit:'100mb'}));





app.use(bodyParser.urlencoded({ extended: true,limit:'100mb' }));
app.use(cookieParser());


//
//
app.use(express.static(path.join(__dirname, 'dist')));
app.use('/fbapi', index);
/*
app.use((request,response,next)=>{
  var credential=request.headers['credential'];
  if(credential){
    jwt.verify(credential,config.jwtsecret,(error,decoded)=>{
      if(error){
        return response.json({success:false,mesg:'Credential Expired, Requierd'});
      }
      else {
        request.decoded=decoded;
        next();
      }
    });
  }
 else {
    return response.status(201).json({
      success:false,
      mesg:'Valid Credential Required to access Content'
    });
  }
});
*/
//make use of the routes
app.use('/fbapi/users', users);
app.use('/fbapi/fbresult', results);
app.use('/fbapi/details', details);
app.use('/fbapi/upload',upload);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

//if any route not found
//
// app.get('/test1',(request,response)=>{
//   response.sendFile(path.join(__dirname,'dist/index.html'));
// });
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
//
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//---------------------------------CUSTIOM VALIDATION PURVIK
//custom validation for excel file uploaded
// app.use(validator({
//   customValidators: {
//       isXLS: function(value, filename){
//         var extention = ("/fileUploads" .extname(filename)).toLowerCase();
//       return extension == '.pdf';
//
//       }
//   }
//
// }));



//export app
module.exports = app;
