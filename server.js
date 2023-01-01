const express = require("express");
const path = require("path");
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(express.json());

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.use(express.static(path.join(__dirname, "/")));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "/index.html"));
});

app.get("/encyclopedias", function (req, res) {
    res.sendFile(path.join(__dirname, "/encyclopedias.html"));
});

app.get("/offline", function (req, res) {
    res.sendFile(path.join(__dirname, "/offline.html"));
});


app.get("/getEncyclopedias", function (req, res) {
    const rawdata = fs.readFileSync('src/mockData.json')
    const encyclopedias = JSON.parse(rawdata)
    res.json({encyclopedias})
});

app.post("/saveEncyclopedias", function (req, res) {
    const rawdata = fs.readFileSync('src/mockData.json')
    const encyclopedias = JSON.parse(rawdata)
    encyclopedias.push({
        title: req.body.title,
        description: req.body.description
    })

    let data = JSON.stringify(encyclopedias);
    console.log(data)
    fs.writeFileSync('src/mockData.json', data);
});


const httpPort = process.env.PORT || 8080;
app.listen(httpPort, function () {
    console.log(`HTTP listening on port: ${httpPort}`);
});
