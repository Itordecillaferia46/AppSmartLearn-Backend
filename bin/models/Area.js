const moongose = require("mongoose");

const Schema = moongose.Schema;

const AreaSchema = new Schema({
    name: String,
    creation_date: Date,
    courses: Array
});

var Area = moongose.model("Area", AreaSchema);

module.exports = Area;