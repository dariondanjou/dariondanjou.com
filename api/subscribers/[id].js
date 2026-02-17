const connectToDatabase = require("../_lib/mongodb");
const { Subscriber } = require("../_lib/models");

module.exports = async function handler(req, res) {
  await connectToDatabase();
  const { id } = req.query;

  if (req.method === "PUT") {
    try {
      const updatedSubscriber = await Subscriber.findByIdAndUpdate(
        id,
        req.body,
        { new: true }
      );
      return res.json(updatedSubscriber);
    } catch (error) {
      return res.status(500).json({ error: "Failed to update subscriber" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await Subscriber.findByIdAndDelete(id);
      return res.json({ message: "Subscriber deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete subscriber" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
