const moongose = require("mongoose");

const Schema = moongose.Schema;

const CourseSchema = new Schema({
    grade: String,
    group: String,
    nomenclature: String
});

var Course = moongose.model("Course", CourseSchema);

module.exports = Course;