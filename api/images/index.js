const getSupabaseAdmin = require("../_lib/supabase");

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.from("images").select("*");

      if (error) throw error;

      const images = data.map((img) => ({ ...img, _id: img.id }));
      return res.json(images);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch images" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
