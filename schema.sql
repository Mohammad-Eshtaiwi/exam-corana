-- CREATE TABLE [IF NOT EXISTS] table_name (
--    column1 datatype(length) column_contraint,
--    column2 datatype(length) column_contraint,
--    column3 datatype(length) column_contraint,
--    table_constraints
-- );
-- this.country = item.Country + "," + item.CountryCode;
--     this.totalConfirmed = item.TotalConfirmed;
--     this.totalDeaths = item.TotalDeaths;
--     this.totalRecovered = item.TotalRecovered;
--     this.date = item.Date;
DROP TABLE country;
CREATE TABLE  country(
    country_id serial primary key,
    country varchar(255) unique,
    totalConfirmed int, 
    totalDeaths int , 
    totalRecovered int ,
    date varchar(255)

);