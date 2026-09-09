import mongoose from "mongoose"

export default function (req,res,next,id){
    /* const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    console.log(id) */
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: `Invalid ID:${id}`})
    }
    next()
}