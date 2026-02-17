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
        .from("images")
        .update(req.body)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return res.json({ ...data, _id: data.id });
    } catch (error) {
      return res.status(500).json({ error: "Failed to update image" });
    }
  }

  if (req.method === "DELETE") {
    const user = await requireAuth(req, res);
    if (!user) return;

    try {
      // Fetch the image first to get its URL for storage cleanup
      const { data: image, error: fetchError } = await supabase
        .from("images")
        .select("url")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage if the URL points to our Supabase bucket
      if (image.url && image.url.includes("/storage/v1/object/public/portfolio-images/")) {
        const path = image.url.split("/storage/v1/object/public/portfolio-images/")[1];
        if (path) {
          await supabase.storage.from("portfolio-images").remove([decodeURIComponent(path)]);
        }
      }

      // Delete the database record
      const { error } = await supabase.from("images").delete().eq("id", id);
      if (error) throw error;

      return res.json({ message: "Image deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete image" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
