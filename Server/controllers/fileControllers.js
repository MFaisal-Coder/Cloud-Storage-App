import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import path from "path";
import Directory from '../models/directoryModel.js'
import File from "../models/fileModel.js";

export const uploadFile = async (req, res, next) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId.toString();

  const parentDirData = await Directory.findOne({
    _id: parentDirId,
    userId: req.user._id,
  });

  const filename = req.headers.filename || "untitled";
  const extension = path.extname(filename);

  const fileInserted = await File.insertOne({
    extension,
    name: filename,
    parentDirId,
    userId: parentDirData.userId,
  });

  // console.log(fileInserted)

  const id = fileInserted._id.toString();
  const fullFileName = `${id}${extension}`;

  const writeStream = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeStream);

  req.on("end", () => {
    try {
      return res.status(201).json({ message: "File Uploaded" });
    } catch (err) {
      next(err);
    }
  });
  
  req.on('error', ()=>{
     return res.status(404).json({ message: "Error In File Uploaded" });
  })
  

}

export const readFile = async (req, res) => {
  const { id } = req.params;

  const fileData = await File.findOne({
    _id: id,
    userId: req.user._id,
  });

  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  const filePath = `${process.cwd()}/storage/${id}${fileData.extension}`;

  // If "download" is requested, set the appropriate headers
  if (req.query.action === "download") {
    res.download(filePath, fileData.name);
  }

  // Send file
  return res.sendFile(filePath, (err) => {
    if (!res.headersSent && err) {
      return res.status(404).json({ error: "File not found!" });
    }
  });
}

export const updateFile = async (req, res, next) => {
  const { id } = req.params;

  const fileData = await File.findOne({
    _id: id,
    userId: req.user._id,
  });

  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    // Perform rename
    await File.updateOne(
      { _id: id, userId: req.user._id },
      { name: req.body.newFilename } ,
    );

    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
}

export const deleteFile = async (req, res, next) => {
  const { id } = req.params;

  const fileData = await File.findOne({
    _id: id,
    userId: req.user._id,
  });

  // Check if file exists
  if (!fileData) {
    return res.status(404).json({ error: "File not found!" });
  }

  try {
    // Remove file from filesystem
    await rm(`./storage/${id}${fileData.extension}`);

    // Remove file from DB
    await File.deleteOne({_id: id})
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
}