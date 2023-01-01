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

app.post("/saveEncyclopedias", async function (req, res) {
    const rawdata = fs.readFileSync('src/mockData.json')
    const encyclopedias = JSON.parse(rawdata)
    encyclopedias.push({
        title: req.body.title,
        description: req.body.description
    })

    let data = JSON.stringify(encyclopedias);
    console.log(data)
    await sendPushNotifications(req.body.title);
    fs.writeFileSync('src/mockData.json', data);
});

const webpush = require('web-push');

// Umjesto baze podataka, čuvam pretplate u datoteci:
let subscriptions = [];
const SUBS_FILENAME = 'subscriptions.json';
try {
    subscriptions = JSON.parse(fs.readFileSync(SUBS_FILENAME));
} catch (error) {
    console.error(error);
}

app.post("/saveSubscription", function(req, res) {
    console.log(req.body);
    let sub = req.body.sub;
    subscriptions.push(sub);
    fs.writeFileSync(SUBS_FILENAME, JSON.stringify(subscriptions));
    res.json({
        success: true
    });
});

async function sendPushNotifications(snapTitle) {
    webpush.setVapidDetails('mailto:igor.mekterovic@fer.hr',
        'BL1oXiSXCjKRPParkSNUP7ik7Ltl3RpPUxurkh7ro4rdpNLylON7f3xxZryBF_xN8CqxvemlVdT2EJGH33qe5iw',
        '4B9u-sA9uJ8zISw3FXlsbbsaVixK3NJn6o_BZshEZnI');
    for (const sub of subscriptions) {
        try {
            console.log("Sending notif to", sub);
            await webpush.sendNotification(sub, JSON.stringify({
                title: 'New encyclopedia uploaded!',
                body: 'Somebody just uploaded a new one: ' + snapTitle,
                redirectUrl: '/index.html'
            }));
        } catch (error) {
            console.error(error);
        }
    }
}


const httpPort = process.env.PORT || 8080;
app.listen(httpPort, function () {
    console.log(`HTTP listening on port: ${httpPort}`);
});
