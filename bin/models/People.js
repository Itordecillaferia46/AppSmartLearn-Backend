const moongose = require("mongoose");

const Schema = moongose.Schema;

const PeopleSchema = new Schema({
    name: String,
    last_name: String,
    identification: String,
    gender: String,
    rol: String,
    gender: String,
    username: String,
    password: String,
    asignatures: [{
        _id: {
            type: Schema.Types.ObjectId,
            ref: 'Area',
            autopopulate: true
        },

        Actividades: [{
            _id_actividad: {
                type: Schema.Types.ObjectId,
                ref: 'Exercise',
                autopopulate: true
            },
            _id_state: String,
            dia: {
                dias: String,
                color: String,
                avan: String
            },

        }],
        curso: Array,

    }],
    courestu: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        autopopulate: true
    },
    course: Object,
    title: String,
    menu: Array
});
PeopleSchema.plugin(require('mongoose-autopopulate'));
const People = moongose.model("People", PeopleSchema);

module.exports = People;