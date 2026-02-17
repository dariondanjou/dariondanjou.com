const getSupabaseAdmin = require("./_lib/supabase");
const requireAuth = require("./_lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  const { filename, contentType } = req.body;
  if (!filename || !contentType) {
    return res
      .status(400)
      .json({ error: "filename and contentType are required" });
  }

  const key = `uploads/${Date.now()}-${filename}`;

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage
      .from("portfolio-images")
      .createSignedUploadUrl(key);

    if (error) throw error;

    const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/portfolio-images/${key}`;

    return res.json({
      presignedUrl: data.signedUrl,
      token: data.token,
      fileUrl,
      key,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to generate presigned URL" });
  }
};
