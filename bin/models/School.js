const moongose = require("mongoose");

const Schema = moongose.Schema;

const SchoolSchema = new Schema({
    name: String,
    nit: String,
    direction: String,
    contact: String,
    grade: Array
});

var School = moongose.model("School", SchoolSchema);

module.exports = School;