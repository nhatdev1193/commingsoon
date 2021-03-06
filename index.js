const express = require('express');
const app = express();

app.use(express.static(__dirname));

app.get('*', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.listen(3030, function(err) {
  if (err) {
    console.log(err);
  };

  console.log('Server is listening at port 3000');
});
