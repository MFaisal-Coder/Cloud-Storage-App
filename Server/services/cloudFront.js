import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const privateKey = process.env.CLOUDFRONT_PRIVATE_KEY;
const keyPairId = "K29I2T8W1ASW4A";
const dateLessThan = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // any Date constructor compatible
const distributionName = "https://d16nsmlnwunln6.cloudfront.net";

export const createCloudFrontGetSignedUrl = ({
  key,
  download = false,
  filename,
}) => {
  // Here we dont have any option for content disposition as we had in s3 signer, so we pass query param here
  // IMP: also save this 'response-content-disposition' as a cache policy in your cloudfront policy
  // and once created, attach it to your cloudfront distruibution, only then will it work
  const url = `${distributionName}/${key}?response-content-disposition=${encodeURIComponent(`${download ? "attachment" : "inline"}; filename=${filename}`)}`;
  const signedUrl = getSignedUrl({
    url,
    keyPairId,
    dateLessThan,
    privateKey,
  });
  return signedUrl;
};

// refer the article below for more info
// https://bibwild.wordpress.com/2024/06/18/cloudfront-in-front-of-s3-using-response-content-disposition/
