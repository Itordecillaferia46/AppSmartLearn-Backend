const moongose = require("mongoose");

const Schema = moongose.Schema;

const ManagerMicroClasesSchema = new Schema({
    id_area: {
        type: Schema.Types.ObjectId,
        ref: "Area",
        autopopulate: true
    },
    microclase: [{
        curso: {
            type: Schema.Types.ObjectId,
            ref: "Course",
            autopopulate: true
        },
        clases: [{
                type: Schema.Types.ObjectId,
                ref: "MicroClase",
                autopopulate: true
            },

        ]
    }]


});
ManagerMicroClasesSchema.plugin(require('mongoose-autopopulate'));
var ManagerMicroClases = moongose.model("ManagerMicroClases", ManagerMicroClasesSchema);

module.exports = ManagerMicroClases;