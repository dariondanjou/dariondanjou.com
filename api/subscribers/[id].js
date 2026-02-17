const getSupabaseAdmin = require("../_lib/supabase");
const requireAuth = require("../_lib/auth");

module.exports = async function handler(req, res) {
  const { id } = req.query;
  const supabase = getSupabaseAdmin();

  if (req.method === "PUT") {
    const user = await requireAuth(req, res);
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("subscribers")
        .update(req.body)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return res.json({ ...data, _id: data.id });
    } catch (error) {
      return res.status(500).json({ error: "Failed to update subscriber" });
    }
  }

  if (req.method === "DELETE") {
    const user = await requireAuth(req, res);
    if (!user) return;

    try {
      const { error } = await supabase
        .from("subscribers")
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
