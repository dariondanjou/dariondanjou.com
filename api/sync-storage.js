const getSupabaseAdmin = require("./_lib/supabase");
const requireAuth = require("./_lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireAuth(req, res);
  if (!user) return;

  try {
    const supabase = getSupabaseAdmin();

    // List all files in the storage bucket
    const { data: files, error: listError } = await supabase.storage
      .from("portfolio-images")
      .list("", { limit: 1000 });

    if (listError) throw listError;

    if (!files || files.length === 0) {
      return res.json({ message: "No files found in storage." });
    }

    const storageUrls = files
      .filter((file) => file.name) // skip folders
      .map(
        (file) =>
          `${process.env.SUPABASE_URL}/storage/v1/object/public/portfolio-images/${file.name}`
      );

    // Also list files in subdirectories (e.g. uploads/)
    const { data: uploadFiles } = await supabase.storage
      .from("portfolio-images")
      .list("uploads", { limit: 1000 });

    if (uploadFiles) {
      uploadFiles
        .filter((file) => file.name)
        .forEach((file) => {
          storageUrls.push(
            `${process.env.SUPABASE_URL}/storage/v1/object/public/portfolio-images/uploads/${file.name}`
          );
        });
    }

    // Get existing image URLs from database
    const { data: existingImages, error: dbError } = await supabase
      .from("images")
      .select("url");

    if (dbError) throw dbError;

    const existingUrls = existingImages.map((img) => img.url);
    const newImages = storageUrls
      .filter((url) => !existingUrls.includes(url))
      .map((url) => ({ url }));

    if (newImages.length > 0) {
      const { error: insertError } = await supabase
        .from("images")
        .insert(newImages);

      if (insertError) throw insertError;
    }

    return res.json({
      message: `Synced ${newImages.length} new images.`,
      newImages,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to sync images." });
  }
};
