const moongose = require("mongoose");

const Schema = moongose.Schema;

const MicroClaseSchema = new Schema({
    name: String,
    cursos: [{
        type: Schema.Types.ObjectId,
        ref: "Course",
    }],
    objetivos: String,
    descripcion: String,
    videos: Array,
    recursos: Array,
    actividadH5p: Array,
});

var MicroClase = moongose.model("MicroClase", MicroClaseSchema);

module.exports = MicroClase;