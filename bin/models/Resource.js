const moongose = require("mongoose");

const Schema = moongose.Schema;

const ResourceSchema = new Schema({
    title: String,
    name: String,
    resource_type: String,
    people_id: {
        type: Schema.Types.ObjectId,
        ref: "People"
    }
});

var Resource = moongose.model("Resource", ResourceSchema);

module.exports = Resource;