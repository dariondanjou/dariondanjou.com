const getSupabaseAdmin = require("../_lib/supabase");
const requireAuth = require("../_lib/auth");

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    const user = await requireAuth(req, res);
    if (!user) return;

    try {
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.from("fans").select("*");

      if (error) throw error;

      // Map snake_case DB columns to camelCase for frontend
      const fans = data.map((fan) => ({
        _id: fan.id,
        id: fan.id,
        email: fan.email,
        firstName: fan.first_name || "",
        lastName: fan.last_name || "",
        phone: fan.phone || "",
        fanNumber: fan.fan_number,
        phoneVerified: fan.phone_verified,
        created_at: fan.created_at,
      }));
      return res.json(fans);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch subscribers" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
