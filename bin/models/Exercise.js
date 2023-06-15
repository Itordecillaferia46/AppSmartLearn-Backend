const { S3RequestPresigner } = require("@aws-sdk/s3-request-presigner");
const moongose = require("mongoose");

const Schema = moongose.Schema;

const ExerciseSchema = new Schema({
    task_asignature: [{
        type: Schema.Types.ObjectId,
        ref: "Area",
        autopopulate: true
    }],
    topic: [{
        type: Schema.Types.ObjectId,
        ref: "Course",
        autopopulate: true
    }],
   
    task_type: String,
    task_title: String,
    task_description: String,
    deliveryDateInicial: Date,
    deliveryDateFinal: Date,
    task_status: String,
    archivoAWS: String,
    archivo: Array,
    enviados: [
        {
            curso : String,
            trabajos : [{
                people_id: {
                  type: Schema.Types.ObjectId,
                  ref: "People"
                 },
                fechaEnvio: {
                  type: Date,
                  default: Date.now
                },
                archivo: Array,
                 nota: {
                   calificacion: {
                   type: Number
                    },
                   observacion: String
                 }
                }
            ]
    }],
    people_id: {
        type: Schema.Types.ObjectId,
        ref: "People",
        autopopulate: true
    }
});
//ExerciseSchema.plugin(require('mongoose-autopopulate'));
var Exercise = moongose.model("Exercise", ExerciseSchema);

module.exports = Exercise;