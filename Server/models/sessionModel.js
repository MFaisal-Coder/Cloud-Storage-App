import {Schema, model} from 'mongoose'

const sessionSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        required: true,
    },
    // TTL session expiry below (mongoose) [For MongoDB the syntax is different, refer docs online]
    createdAt:{
        type: Date,
        default: Date.now,
        expires: 3600
    }
})

const Session = model('Session', sessionSchema)
export default Session