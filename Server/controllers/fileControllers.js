import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import path from "path";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";
import User from "../models/userModel.js";
import {
  createGetSignedUrl,
  createUploadSignedUrl,
  deleteS3File,
  getS3FileMetaData,
} from "../services/s3Service.js";
import { directorySizeUpdate } from "../utils/totalSizeHandler.js";

export const uploadFile = async (req, res, next) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId.toString();

  try {
    const parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    });

    const filename = req.headers.filename || "untitled";
    const filesize = req.headers.filesize;

    const user = await User.findById(req.user._id);
    const rootDir = await Directory.findById(req.user.rootDirId);

    const remainingSpace = user.maxStorageSize - rootDir.size;

    if (filesize > remainingSpace) {
      console.log("File too large");
      return res.destroy();
    }

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

    const filePath = `./storage/${fullFileName}`;
    const writeStream = createWriteStream(filePath);

    let totalSizeOnUpload = 0;
    let limitExceeded = false;
    let fileUploadCompleted = false;

    // Here we were directly uploading/adding the file to our storage (trusting the client/UI that the size would be accurate)
    /* const writeStream = createWriteStream(`./storage/${fullFileName}`);
  req.pipe(writeStream); */

    // Here we are checking bit by bit (or byte by byte) that the client is sending the actual file with accurate file size
    // If someone tries to exploit our backend storage limit, we will destroy the connection and end the upload
    // for this we need a granular control and hence we are using chunks for tracking using an event listener for incoming data
    req.on("data", async (chunk) => {
      // if file size limit exceeds than the actual one then return else upload file
      if (limitExceeded) return;

      totalSizeOnUpload += chunk.length;
      // console.log({"totalSize": totalSizeOnUpload})
      if (totalSizeOnUpload > filesize) {
        // if file size limit exceeds than the actual one then destroy the connection and stop the incoming req
        limitExceeded = true;
        writeStream.close();
        await fileInserted.deleteOne();
        await rm(filePath);
        return req.destroy(); //destroy the socket and close connection. Can also do res.socket.destroy()
      }
      const canContinue = writeStream.write(chunk);
      if (!canContinue) {
        req.pause();
      }
    });

    writeStream.on("drain", () => {
      if (!limitExceeded) req.resume();
    });

    // If the file is successfully uploaded then 'end' event gets fired
    req.on("end", async () => {
      fileUploadCompleted = true;
      try {
        await directorySizeUpdate(parentDirId, totalSizeOnUpload);
        return res.status(201).json({ message: "File Uploaded" });
      } catch (err) {
        next(err);
      }
    });

    // This is to handle the mid-cancellation on upload of a file
    // 'close' event gets fired when the UI hits cancel mid-upload
    req.on("close", async () => {
      if (!fileUploadCompleted) {
        try {
          await fileInserted.deleteOne();
          await rm(filePath);
          console.log("file cleaned");
        } catch (err) {
          console.error("Error cleaning up aborted upload:", err);
        }
      }
    });

    req.on("error", async () => {
      await File.deleteOne({ _id: fileInserted.insertedId });
      return res.status(404).json({ message: "Error In File Uploaded" });
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const uploadInitiate = async (req, res, next) => {
  const parentDirId = req.body.parentDirId || req.user.rootDirId.toString();

  try {
    const parentDirData = await Directory.findOne({
      _id: parentDirId,
      userId: req.user._id,
    });

    // Check if parent directory exists
    if (!parentDirData) {
      return res.status(404).json({ error: "Parent directory not found!" });
    }

    const filename = req.body.name || "untitled";
    const filesize = req.body.size;

    const user = await User.findById(req.user._id);
    const rootDir = await Directory.findById(req.user.rootDirId);

    const remainingSpace = user.maxStorageSize - rootDir.size;

    if (filesize > remainingSpace) {
      console.log("File too large");
      return res
        .status(507)
        .json({ Error: "Not enough space available to upload." });
    }

    // console.log({ filesize });
    const extension = path.extname(filename);

    const fileInserted = await File.insertOne({
      extension,
      name: filename,
      parentDirId,
      userId: parentDirData.userId,
      size: filesize,
      isUploading: true,
    });

    // console.log(fileInserted)

    const id = fileInserted.id;
    const fullFileName = `${id}${extension}`;

    const signedUrl = await createUploadSignedUrl({
      key: fullFileName,
      contentType: req.body.contentType,
    });

    return res.json({ uploadSignedUrl: signedUrl, fileId: fileInserted.id });
  } catch (err) {
    console.log(err);
    next(err);
  }
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

  const fullFileName = `${id}${fileData.extension}`;

  // If "download" is requested, set the appropriate headers
  if (req.query.action === "download") {
    const getSignedURL = await createGetSignedUrl({
      key: fullFileName,
      filename: fileData.name,
      download: true,
    });
    return res.redirect(getSignedURL);
  }

  // Send file
  const getSignedURL = await createGetSignedUrl({
    key: fullFileName,
    filename: fileData.name,
  });
  return res.redirect(getSignedURL);
};

export const uploadComplete = async (req, res, next) => {
  const file = await File.findById(req.body.fileId);
  if (!file) {
    return res.status(404).json({ error: "File not found in our records" });
  }

  try {
    const fileMetaData = await getS3FileMetaData(`${file.id}${file.extension}`);
    if (fileMetaData.ContentLength !== file.size) {
      await file.deleteOne();
      return res.status(400).json({ error: "File size does not match." });
    }
    file.isUploading = false;
    await file.save();
    await directorySizeUpdate(file.parentDirId, file.size);
    res.json({ message: "Upload completed" });
  } catch (err) {
    console.log(err);
    next(err);
  }
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
    // Remove file from DB
    await deleteS3File({key: `${fileData.id}${fileData.extension}`})
    await directorySizeUpdate(fileData.parentDirId, -fileData.size);
    await fileData.deleteOne();
    // Remove file from S3
    return res.status(200).json({ message: "File Deleted Successfully" });
  } catch (err) {
    next(err);
  }
};
