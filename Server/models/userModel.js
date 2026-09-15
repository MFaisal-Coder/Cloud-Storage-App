import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    name: {
      type: String,
      minLength: [3, "User name must have at least 3 characters"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,
        "please enter a valid email",
      ],
      unique: true, // added a unique option as true which creates for us a unique index (This is not a validator rather it creates for us unique index)
    },
    password: {
      type: String,
      minLength: [3, "Password must have at least 3 characters"],
      // required: true //earlier we set it true because we were asking the user to manually enter password for register or login. Now after using the Google OAuth for login and register ( we will eventually use One Tap Login and Google's login ) we dont need password as mandatory field.
    },
    maxStorageSize: {
      type: Number,
      default: 1 * 1024 ** 3, //1 GB (1024 **3 is GB)
    },
    // Adding Mongoose schema for roles
    role: {
      type: String,
      enum: ["Admin", "Manager", "User"],
      default: "User",
    },
    // Here we are implementing Soft delete, rather than permanently deleting user's all info
    // We can add options for hard dlete OR soft delete
    // Generally large organizations keep users data safe and they use soft delete, in case recovery is needed
    isDeleted: {
      type: Boolean,
      default: false
    },
    picture: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/128/1144/1144760.png",
    },
    rootDirId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    strict: "throw", // this is equivalent to 'additionalProperties: false' in MongoDB which does not allow to add any other fields that arent in schema
  },
);

userSchema.pre("save", async function () {
  // console.log(this) // this points to the document (model/collection instance) THATS WHY always use function declaration and not arrow function
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (userPassword) {
  return bcrypt.compare(userPassword, this.password);
};

const User = model("User", userSchema);
export default User;
