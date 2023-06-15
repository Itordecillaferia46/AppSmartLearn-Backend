const moongose = require("mongoose");

const Schema = moongose.Schema;

const ExerciseTypeSchema = new Schema({
    topic: String,
    subtopic: String
});

var ExerciseType = moongose.model("ExerciseType", ExerciseTypeSchema);

module.exports = ExerciseType;