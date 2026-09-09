import { model, Schema } from "mongoose";

const fileSchema = new Schema({
    name:{
        type: String,
        minLength: [3, "File name must have at least 3 characters"],
        required: true
    },
    extension:{
        type: String,
        required: true
    },
    userId:{
        type: Schema.Types.ObjectId,
        required: true
    },
    parentDirId:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Directory'
    }
},{
    strict: 'throw' // this is equivalent to 'additionalProperties: false' in MongoDB which does not allow to add any other fields that arent in schema
})

const File = model('File', fileSchema)
export default File