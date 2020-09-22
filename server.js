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
    const insert = `INSERT INTO country (country,totalConfirmed,totalDeaths,totalRecovered,date)VALUES($1,$2,$3,$4,$5);`;
    // console.log(insert);
    debugger;
    const test = client.query(insert, safeValues);

    console.log("hiii");
    console.log("teeeeeeeest", test);
    // res.redirect("/myRecords/?country=" + req.body.country);
    res.redirect("/myRecords" + req.body.country);
});
app.get("/myRecords", async (req, res) => {
    // let select = `select * from country where country = $1`;
    let select = `select * from country`;

    let { rows } = await client.query(select);

    console.log("daaaaaaaaaaata", rows);
    res.render("./pages/myRecords", { rows });
});
app.get("/details", async (req, res) => {
    let select = `select * from country where country = $1`;

    let { rows } = await client.query(select, [req.query.country]);
    let item = rows[0];
    console.log("daaaaaaaaaaata", item);
    res.render("./pages/details", { item });
});
app.get("/delete", async (req, res) => {
    //     DELETE FROM table_name
    // WHERE condition;
    let select = `delete  from country where country = $1`;

    let item = await client.query(select, [req.query.country]);

    console.log("delete", item);
    res.redirect("/myRecords");
});

client.connect().then(() => {
    app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
});
