const getSupabaseAdmin = require("../_lib/supabase");
const requireAuth = require("../_lib/auth");

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    const user = await requireAuth(req, res);
    if (!user) return;

    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.from("subscribers").select("*");

      if (error) throw error;

      const subscribers = data.map((sub) => ({ ...sub, _id: sub.id }));
      return res.json(subscribers);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch subscribers" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
