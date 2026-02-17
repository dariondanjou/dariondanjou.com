const connectToDatabase = require("../_lib/mongodb");
const { Image } = require("../_lib/models");

module.exports = async function handler(req, res) {
  await connectToDatabase();
  const { id } = req.query;

  if (req.method === "PUT") {
    try {
      const updatedImage = await Image.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      return res.json(updatedImage);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update image" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await Image.findByIdAndDelete(id);
      return res.json({ message: "Image deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete image" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
