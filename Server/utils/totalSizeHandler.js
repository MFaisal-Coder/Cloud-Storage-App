import Directory from "../models/directoryModel.js";

export const directorySizeUpdate = async (directoryId, deltaSize) => {
  while (directoryId) {
    const dir = await Directory.findOne({ _id: directoryId });
    dir.size += deltaSize;
    dir.save();
    directoryId = dir.parentDirId
  }
};
