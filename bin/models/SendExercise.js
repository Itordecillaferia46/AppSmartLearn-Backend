const moongose = require("mongoose");

const Schema = moongose.Schema;

const SendExerciseSchema = new Schema({
    archive: String,
    people_id: {
        type: Schema.Types.ObjectId,
        ref: "People"
    },
    exercise_id: {
        type: Schema.Types.ObjectId,
        ref: "Exercise"
    },
    note: Number
});

var SendExercise = moongose.model("SendExercise", SendExerciseSchema);

module.exports = SendExercise;