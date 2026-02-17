const nodemailer = require("nodemailer");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, subject, body } = req.body;
  if (!to || !subject || !body) {
    return res
      .status(400)
      .json({ error: "to, subject, and body are required" });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: body,
    });
    return res.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Email send error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
};
