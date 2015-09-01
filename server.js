var express = require('express');
var path = require('path');
var glob = require('glob');
var browserify = require('browserify');
var PORT = process.env.PORT || 4201;
var app = express();
app.get('/test/tmp/test.js', function (req, res, next) {
  glob("test/**/*.test.js", {}, function (er, testfiles) {
    if (er || !testfiles || testfiles.length === 0) {
      console.error('No tests found.');
      res.send('500');
    } else {
      console.log('Found test files:', testfiles);
      browserify({ debug: true })
        .add(testfiles.map(function(file) {
          return path.join(__dirname, file);
        }))
        .bundle()
        .on('error', function(err, data){
          console.error(err.message);
          res.send('console.log("'+err.message+'");');
        })
        .pipe(res);
    }
  });
});
app.use(express.static(__dirname));
app.listen(PORT);
console.log('Server is listening on %s', PORT);
console.log('To run the test suite go to https://localhost:%s/test', PORT);
