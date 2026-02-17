const { S3Client } = require("@aws-sdk/client-s3");

let s3;

function getS3Client() {
  if (!s3) {
    s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION,
    });
  }
  return s3;
}

module.exports = getS3Client;
