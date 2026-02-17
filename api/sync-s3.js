const { ListObjectsV2Command } = require("@aws-sdk/client-s3");
const getS3Client = require("./_lib/s3");
const connectToDatabase = require("./_lib/mongodb");
const { Image } = require("./_lib/models");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await connectToDatabase();

  try {
    const s3 = getS3Client();
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
    });
    const { Contents } = await s3.send(command);

    if (!Contents) {
      return res.json({ message: "No files found in S3." });
    }

    const s3Urls = Contents.map(
      (file) =>
        `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`
    );

    const existingImages = await Image.find({}, "url");
    const existingUrls = existingImages.map((img) => img.url);
    const newImages = s3Urls
      .filter((url) => !existingUrls.includes(url))
      .map((url) => ({ url }));

    if (newImages.length > 0) {
      await Image.insertMany(newImages);
    }

    return res.json({
      message: `Synced ${newImages.length} new images.`,
      newImages,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to sync images." });
  }
};
