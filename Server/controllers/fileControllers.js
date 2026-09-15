import { rm } from "fs/promises";
import path from "path";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import { createWriteStream } from "fs";
import { directorySizeUpdate } from "../utils/totalSizeHandler.js";

export const uploadFile = async (req, res, next) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId.toString();

  const parentDirData = await Directory.findOne({
    _id: parentDirId,
    userId: req.user._id,
  });

  const filename = req.headers.filename || "untitled";
  const filesize = req.headers.filesize;
  // console.log({ filesize });
  const extension = path.extname(filename);

  const fileInserted = await File.insertOne({
    extension,
    name: filename,
    parentDirId,
    userId: parentDirData.userId,
    size: filesize,
  });

  // console.log(fileInserted)

  const id = fileInserted._id.toString();
  const fullFileName = `${id}${extension}`;

  const filePath = `./storage/${fullFileName}`
  const writeStream = createWriteStream(filePath)

  let totalSizeOnUpload = 0;
  let limitExceeded = false

  // Here we were directly uploading/adding the file to our storage (trusting the client/UI that the size would be accurate)
  /* const writeStream = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeStream); */


  // Here we are checking bit by bit (or byte by byte) that the client is sending the actual file with accurate file size
  // If someone tries to exploit our backend storage limit, we will destroy the connection and end the upload
  // for this we need a granular control and hence we are using chunks for tracking using an event listener for incoming data
  req.on("data", async (chunk) => {
    // if file size limit exceeds than the actual one then return else upload file
    if(limitExceeded) return

    totalSizeOnUpload += chunk.length;
    // console.log({"totalSize": totalSizeOnUpload})
    if (totalSizeOnUpload > filesize) {
      // if file size limit exceeds than the actual one then destroy the connection and stop the incoming req
      limitExceeded = true
      writeStream.close()
      await fileInserted.deleteOne()
      await rm(filePath)
      return req.destroy(); //destroy the socket and close connection. Can also do res.socket.destroy()
    }
    const canContinue = writeStream.write(chunk)
    if(!canContinue){
      req.pause()
    }
  });

  writeStream.on('drain', ()=>{
    if(!limitExceeded) req.resume()
  })

  req.on("end", async() => {
    try {
      await directorySizeUpdate(parentDirId, totalSizeOnUpload)
      return res.status(201).json({ message: "File Uploaded" });
    } catch (err) {
      next(err);
    }
  });

  req.on("error", async() => {
    await File.deleteOne({ _id: insertedFile.insertedId });
    return res.status(404).json({ message: "Error In File Uploaded" });
  });
};

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
};

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
      { name: req.body.newFilename },
    );

    return res.status(200).json({ message: "Renamed" });
  } catch (err) {
    err.status = 500;
    next(err);
  }
};

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
    await File.deleteOne({ _id: id });
    await directorySizeUpdate(fileData.parentDirId,-fileData.size)
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
};
