import { model, Schema } from "mongoose";

const fileSchema = new Schema(
  {
    name: {
      type: String,
      minLength: [3, "File name must have at least 3 characters"],
      required: true,
    },
    extension: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    parentDirId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Directory",
    },
  },
  {
    strict: "throw", // this is equivalent to 'additionalProperties: false' in MongoDB which does not allow to add any other fields that arent in schema
    timestamps: true
  },
);

const File = model("File", fileSchema);
export default File;
