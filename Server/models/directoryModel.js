import { model, Schema } from "mongoose";

const directorySchema = new Schema({
    name:{
        type: String,
        minLength: [3, "Folder name must have at least 3 characters"],
        required: true
    },
    userId:{
        type: Schema.Types.ObjectId,
        required: true
    },
    parentDirId:{
        type: Schema.Types.ObjectId,
        default: null,
        ref: 'Directory'
    }
},{
    strict: 'throw' // this is equivalent to 'additionalProperties: false' in MongoDB which does not allow to add any other fields that arent in schema
})

const Directory = model('Directory', directorySchema)
export default Directory