const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const getS3Client = require("./_lib/s3");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { filename, contentType } = req.body;
  if (!filename || !contentType) {
    return res
      .status(400)
      .json({ error: "filename and contentType are required" });
  }

  const s3 = getS3Client();
  const key = `uploads/${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  try {
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return res.json({ presignedUrl, fileUrl, key });
  } catch (error) {
    return res.status(500).json({ error: "Failed to generate presigned URL" });
  }
};
