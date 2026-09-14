// Below line is pure mongoDB syntax for creating schemaValidation at database level on our node-js driver
// import connectDB, { client } from "./db.js";

// now we are using mongoose
import mongoose from "mongoose";
import { connectDB } from "./db.js";

await connectDB();
const client = mongoose.connection.getClient();

try {
  const db = mongoose.connection.db;
  // console.log({db, client});
  // Computed property name
  const collectionMethod = "collMod";

  // directories JSONSchema validation
  await db.command({
    // Computed property name way for dynamic object keys ES6
    [collectionMethod]: "directories",
    //   create: "directories", older method if we didnt use the above mthod
    validator: {
      $jsonSchema: {
        required: ["_id", "name", "parentDirId", "userId"],
        properties: {
          _id: {
            bsonType: "objectId",
          },
          name: {
            bsonType: "string",
            minLength: 3,
            description: "Folder name must have at least 3 characters",
          },
          parentDirId: {
            bsonType: ["objectId", "null"],
          },
          userId: {
            bsonType: "objectId",
          },
          __v: {
            bsonType: "int",
          },
        },
        additionalProperties: true,
      },
    },
    validationAction: "error",
    validationLevel: "strict",
  });

  await db.command({
    [collectionMethod]: "files",
    validator: {
      $jsonSchema: {
        required: ["_id", "extension", "name", "parentDirId", "userId"],
        properties: {
          _id: {
            bsonType: "objectId",
          },
          extension: {
            bsonType: "string",
          },
          name: {
            bsonType: "string",
            minLength: 3,
            description: "File name must have at least 3 characters",
          },
          size: {
            bsonType: "int",
          },
          parentDirId: {
            bsonType: "objectId",
          },
          userId: {
            bsonType: "objectId",
          },
          __v: {
            bsonType: "int",
          },
        },
        additionalProperties: true
      },
    },
    validationAction: "error",
    validationLevel: "strict",
  });

  await db.command({
    [collectionMethod]: "users",
    validator: {
      $jsonSchema: {
        required: ["_id", "email", "name", "rootDirId"],
        properties: {
          _id: {
            bsonType: "objectId",
          },
          email: {
            bsonType: "string",
            pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$",
            description: "Email must be in a valid format",
          },
          name: {
            bsonType: "string",
            minLength: 3,
            description: "User name must have at least 3 characters",
          },
          password: {
            bsonType: "string",
            minLength: 3,
            description: "Password must have at least 3 characters",
          },
          // Adding MongoDB schema for roles
          role: {
            enum: ["Admin", "Manager", "User"],
          },
          isDeleted: {
            bsonType: "bool",
          },
          picture: {
            bsonType: "string",
          },
          rootDirId: {
            bsonType: "objectId",
          },
          __v: {
            bsonType: "int",
          },
        },
        additionalProperties: true
      },
    },
    validationAction: "error",
    validationLevel: "strict",
  });
} catch (err) {
  console.log("Error setting up the database!");
} finally {
  await client.close();
}
