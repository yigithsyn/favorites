var express = require('express')
var bodyParser = require("body-parser")
var cors = require('cors')

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.listen()


// ============================================================================
// Ngrok
// ============================================================================
var ngrok = require('ngrok');

app.post("/ngrok", function (req, res) {
  ngrok.connect(req.body, function (err, url) {
    if (err) res.send({ error: { type: "api", msg: err } })
    else res.send({ url: url })
  })
})