const connectToDatabase = require("../_lib/mongodb");
const { Image } = require("../_lib/models");

module.exports = async function handler(req, res) {
  await connectToDatabase();

  if (req.method === "GET") {
    try {
      const images = await Image.find();
      return res.json(images);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch images" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
