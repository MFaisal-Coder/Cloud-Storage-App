import { axiosWithCreds } from "./axiosInstances";

export const uploadInitiate = async (fileData) => {
  const { data } = await axiosWithCreds.post("/file/uploads/initiate", fileData);
  return data;
};