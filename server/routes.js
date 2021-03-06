/**
 * Main application routes
 */

'use strict';
//this file sets all the global url in this application

var errors = require('./components/errors');
var auth = require('./auth/auth.service');
var path = require('path');

module.exports = function(app) {

  //this maps all the routes to the file in /api/user folder
    //all urls start with /api/users
  app.use('/api/users', require('./api/user'));
  app.use('/api/look',require('./api/look'));
  app.use('/api/links',require('./api/imgScraper'));
  app.use('/api/comments',require('./api/comments'));

  app.use('/auth', require('./auth'));
  app.post('/forgotpassword', require('./forgotpassword').reset);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);


  app.route('/*')
    .get(function(req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};
