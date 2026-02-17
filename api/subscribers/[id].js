const getSupabaseAdmin = require("../_lib/supabase");
const requireAuth = require("../_lib/auth");

// Map camelCase field names from frontend to snake_case DB columns
const fieldMap = {
  firstName: "first_name",
  lastName: "last_name",
  fanNumber: "fan_number",
  phoneVerified: "phone_verified",
};

function toDbFields(body) {
  const mapped = {};
  for (const [key, value] of Object.entries(body)) {
    mapped[fieldMap[key] || key] = value;
  }
  return mapped;
}

module.exports = async function handler(req, res) {
  const { id } = req.query;
  const supabase = getSupabaseAdmin();

  if (req.method === "PUT") {
    const user = await requireAuth(req, res);
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("fans")
        .update(toDbFields(req.body))
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return res.json({
        _id: data.id,
        id: data.id,
        email: data.email,
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        phone: data.phone || "",
        fanNumber: data.fan_number,
        phoneVerified: data.phone_verified,
        created_at: data.created_at,
      });
    } catch (error) {
      return res.status(500).json({ error: "Failed to update subscriber" });
    }
  }

  if (req.method === "DELETE") {
    const user = await requireAuth(req, res);
    if (!user) return;

    try {
      const { error } = await supabase
        .from("fans")
        .delete()
        .eq("id", id);

      if (error) throw error;

      return res.json({ message: "Subscriber deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete subscriber" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
