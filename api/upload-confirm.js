const connectToDatabase = require("./_lib/mongodb");
const { Image } = require("./_lib/models");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await connectToDatabase();

  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: "fileUrl is required" });
  }

  try {
    const newImage = new Image({ url: fileUrl });
    await newImage.save();
    return res.json({
      message: "Image saved successfully",
      imageId: newImage._id,
      fileUrl,
    });
  } catch (error) {
    return res.status(500).json({ error: "Error saving image data" });
  }
};
