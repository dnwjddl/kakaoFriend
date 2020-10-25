index.js

const express = require('express');
const app = express();
const academic = require("./academic");
const affiliation = require("./affiliation");
const inform_input = require("./inform_input");
const logger = require('morgan');
const bodyParser = require('body-parser');

const apiRouter = express.Router();

app.use(logger('dev', {}));
app.use(bodyParser.json());
app.use("/academic", academic);
app.use("/affiliation", affiliation);
app.use("/inform_input", inform_input);
app.use(express.static("public"));

app.get('/:name', function(req, res) {
    res.send(`<img src = '/` +`${req.params.name}.jpg'>`);
});

app.listen(3000, function() {       // 설정한 express app을 특정 포트로 실행하는 부분
console.log('Example skill server listening on port 3000!');
}); 