import { axiosWithCreds } from "./axiosInstances";

export const uploadInitiate = async (fileData) => {
  const { data } = await axiosWithCreds.post("/file/uploads/initiate", fileData);
  return data;
};

export const uploadComplete= async (fileId) => {
  const { data } = await axiosWithCreds.post("/file/uploads/complete", {fileId});
  return data;
};