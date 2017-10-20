const url = 'https://www.tre.se/mitt3/Oversikt/';
const settings = require('./settings');
const http = require('http');
const schedule = require('node-schedule');
const nightmare = require('nightmare');
const moment = require('moment');
moment.locale("sv");

const feed = {  // TODO: URLS
    author: {
        name: "3"
    },
    title: "Datanvändning",
    description: "Aktuell dataanvändning från Mitt3",
    favicon: "https://jsonfeed.org/graphics/icon.png",
    feed_url: "https://jsonfeed.org/feed.json",
    home_page_url: url,
    items: [],
    user_comment: "",
    version: "https://jsonfeed.org/version/1"
}

const readDataUsage = function () {
    nightmare({ show: !!settings.debug })
        .goto(url)
        .wait(2000)
        .type("input[name='username']", settings.username)
        .type("input[name='password']", settings.password)
        .wait(1000)
        .click('#my3User-content>div>div.form-autofill-handler>div>div>button')
        .wait(16000)
        .click('#overview-usage-summary>div>div:nth-child(2)>div.usage-summary-discs>svg>a:nth-child(9)>circle')
        .wait(3000)
        .evaluate(() => {

            let i = 1;
            let usage = [];
            let available = [];
            let raw = [];

            while (true) {
                const used = document.querySelector(`#overview-usage-summary > div > div.usage-summary-details > div > div:nth-child(1) > div:nth-child(${i}) > div > div > span.used-units.span3 > span.usage`);
                const available = document.querySelector(`#overview-usage-summary > div > div.usage-summary-details > div > div:nth-child(1) > div:nth-child(${i}) > div > div > span.total-units.span4`);

                if (!used || !available) {
                    break;
                } else {
                    usage.push(Number.parseFloat(used.innerText.trim()));
                    available.push(Number.parseFloat(available.innerText.trim()));
                    raw.push(used);
                    raw.push(available);

                    i++
                }
            }

            return {
                usage: usage,
                available: available,
                raw: raw
            }
        })
        .end()
        .then((info) => {
            console.log(info)
            const date = moment().date();
            const daysInMonth = moment().daysInMonth();
            const daysLeft = 1 + daysInMonth - 19;
            const totalUsage = info.usage.reduce((a, b) => a + b, 0)
            const totalAvailable = info.available.reduce((a, b) => a + b, 0)
            console.log(totalUsage);
            console.log(totalAvailable);
            
            const percentUsed = (totalUsage / totalAvailable) * 100;
            const usageLeft = totalAvailable - totalUsage
            const percentLeft = 100 - percentUsed
            const usagePerDay = totalUsage / date;
            const calculatedUsage = totalUsage + usagePerDay * daysLeft;

            feed.items.push({
                content_html: `<b>Godmorgon!</b><br/>${usageLeft.toFixed(2)}GB kvar.<br/><br/>Totalt har ${totalUsage.toFixed(2)} av ${settings.includedGigabytes}GB förbrukats med ${daysLeft} dagar kvar till ny datamängd.<br/><br/>Snittanvändning per dag: ${usagePerDay.toFixed(2)}GB.<br/>Beräknad totalmängd denna månad: ${calculatedUsage.toFixed(2)}GB`,
                date_published: moment().format(),
                id: moment().format("YYYY-MM-DD"),
                title: `${percentUsed.toFixed(1)}% data förbrukat`,
                url: url,
            })
        })
        .catch((error) => {
            console.error("Something went wrong parsing data usage");
            console.error(error);
        });
}

if (!settings.debug) {
    const jobb = schedule.scheduleJob({ hour: 06, minute: 00 }, readDataUsage);

    const app = http.createServer(function (req, res) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(feed));
    });


    app.listen(settings.port);
}
readDataUsage();

// TODO, publish!