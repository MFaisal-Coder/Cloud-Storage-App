import { rm } from "fs/promises";
import Directory from "../models/directoryModel.js";
import File from "../models/fileModel.js";

export const getDirectoryByID = async (req, res) => {
  const user = req.user;
  const _id = req.params.id || user.rootDirId.toString(); // we dont need to convert id into new ObjectId since mongoose handles that efficiently behind the scenes

  // Find the directory and verify ownership
  const directoryData = await Directory.findOne({ _id}).lean()
  if (!directoryData) {
    return res
      .status(404)
      .json({ error: "Directory not found or you do not have access to it!" });
  }

  const files = await File.find({ parentDirId: _id }).lean();
  const directories = await Directory.find({ parentDirId: _id }).lean();
  
  return res.status(200).json({
    ...directoryData,
    files: files.map((file) => ({ ...file, id: file._id })),
    directories: directories.map((dir) => ({ ...dir, id: dir._id })),
  });
}

export const createDirectory = async (req, res, next) => {
  const user = req.user;
  const parentDirId = req.params.parentDirId || user.rootDirId.toString();
  const dirname = req.headers.dirname || "New Folder";

  const parentDir = await Directory.findOne({
    _id: parentDirId,
  });

  if (!parentDir)
    return res
      .status(404)
      .json({ message: "Parent Directory Does not exist!" });

  try {
    const dir = await Directory.insertOne({
      name: dirname,
      parentDirId,
      userId: user._id,
    });
    return res.status(200).json({ message: "Directory Created!" });
  } catch (err) {
    // console.log(err.errorResponse.errInfo.details.schemaRulesNotSatisfied)
    next(err);
  }
}

export const renameDirectory = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;  // id coming from req.params will always be string
  const { newDirName } = req.body;

  // console.log(id)  // confirmed
  try {
    await Directory.updateOne(
      { _id: id, userId: user._id },
      { name: newDirName },
    );
    res.status(200).json({ message: "Directory Renamed!" });
  } catch (err) {
    next(err);
  }
}

export default async function deleteDirectory(req, res, next){
  const user = req.user;
  const { id } = req.params;

  const dirData = await Directory.findOne({_id: id, userId: user._id}).select("-_id -name -parentDirId -userId")
  if(!dirData){
    return res.status(404).json({error: 'Directory not found'})
  }

  async function getDirectoryContent(id) {
    let fileData = await File.find({ parentDirId: id }).select('_id extension').lean();
    let directoryData = await Directory.find({ parentDirId: id }).select("_id").lean();

    for (const { _id } of directoryData) {
      const { fileData: childFiles, directoryData: childDirectories } =
        await getDirectoryContent(_id);
      fileData = [...fileData, ...childFiles];
      directoryData = [...directoryData, ...childDirectories];
    }

    return { fileData, directoryData };
  }

  const {fileData, directoryData} = await getDirectoryContent(id);

  for (const { _id, extension } of fileData) {
    await rm(`./storage/${_id.toString()}${extension}`);
  }

  await File.deleteMany({_id: {$in : fileData.map(({_id})=> _id)}})
  await Directory.deleteMany({_id: {$in : [...directoryData.map(({_id})=> _id), id]}})

  return res.status(201).json({ message: "File deleted successfully" });
}