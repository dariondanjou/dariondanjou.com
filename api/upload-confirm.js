const getSupabaseAdmin = require("./_lib/supabase");
const requireAuth = require("./_lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  const { fileUrl } = req.body;
  if (!fileUrl) {
    return res.status(400).json({ error: "fileUrl is required" });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("images")
      .insert({ url: fileUrl })
      .select()
      .single();

    if (error) throw error;

    return res.json({
      message: "Image saved successfully",
      imageId: data.id,
      fileUrl,
    });
  } catch (error) {
    return res.status(500).json({ error: "Error saving image data" });
  }
};
