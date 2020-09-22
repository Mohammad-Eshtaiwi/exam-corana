const express = require("express");
const superagent = require("superagent");
const pg = require("pg");
const methodOverride = require("method-override");

// setup
const PORT = process.env.PORT || 3000;
const app = express();
require("dotenv").config();
// app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("./public"));
app.set("view engine", "ejs");
const client = new pg.Client(process.env.DATABASE_URL);

app.get("/", async (req, res) => {
    const { body: total } = await superagent("https://api.covid19api.com/world/total");
    // console.log(total);
    res.render("./pages/index", { total });
});
app.post("/search", async (req, res) => {
    // console.log(req.body);
    let from = req.body.from + "T00:00:00Z";
    let to = req.body.to + "T00:00:00Z";
    res.redirect(`/getCountryResult/?country=${req.body.name}&from=${from}&to=${to}`);
});
// Country, Total Confirmed Cases, Total Deaths Cases, Total Recovered Cases, Date, and add-to-my-records button
app.get("/getCountryResult", async (req, res) => {
    const url = `https://api.covid19api.com/country/${req.query.country}/status/confirmed?from=${req.query.from}&to=${req.query.to}`;
    const { body: result } = await superagent(url);
    res.render("./pages/countryResult", { result });
    // Date Cases
});
app.get("/allCountries", async (req, res) => {
    const url = "https://api.covid19api.com/summary";
    let { body: countries } = await superagent(url);
    countries = countries.Countries.map(item => new Country(item));
    // console.log(countries);
    res.render("./pages/allCountries", { countries });
});
// Country, Total Confirmed Cases, Total Deaths Cases, Total Recovered Cases, Date, and add-to-my-records button
function Country(item) {
    this.country = item.Country + "," + item.CountryCode;
    this.totalConfirmed = item.TotalConfirmed;
    this.totalDeaths = item.TotalDeaths;
    this.totalRecovered = item.TotalRecovered;
    this.date = item.Date;
}
app.post("/addCountry", async (req, res) => {
    console.log("booooooooody", req.body);
    const safeValues = [req.body.country, req.body.totalConfirmed, req.body.totalDeaths, req.body.totalRecovered, req.body.date];
    const insert = `INSERT INTO country (country,
        totalConfirmed,
        totalDeaths,
        totalRecovered,
        date)
        VALUES
        ($1,$2,$3,$4,$5);
        `;
    // console.log(insert);
    const { rows: countries } = client
        .query(insert, safeValues)
        .then(data => {
            console.log("hiii");
            console.log("teeeeeeeest", countries);
            res.redirect("/myRecords/?country=" + req.body.country);
        })
        .catch(error => {
            console.log(error);
        });
});
app.get("/myRecords", (req, res) => {
    let select = `select * from country where country = $1`;
    const { rows: country } = client.query(select, [req.query.country]);
    console.log("daaaaaaaaaaata", country);
});
app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
