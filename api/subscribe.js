const connectToDatabase = require("./_lib/mongodb");
const { Subscriber } = require("./_lib/models");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await connectToDatabase();

  const { email } = req.body;
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(409).json({ error: "Email already subscribed" });
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();
    return res.json({ message: "Subscribed successfully!" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
