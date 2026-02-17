const connectToDatabase = require("../_lib/mongodb");
const { Subscriber } = require("../_lib/models");

module.exports = async function handler(req, res) {
  await connectToDatabase();

  if (req.method === "GET") {
    try {
      const subscribers = await Subscriber.find();
      return res.json(subscribers);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch subscribers" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
