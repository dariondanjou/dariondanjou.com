const getSupabaseAdmin = require("./_lib/supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Check if already exists in fans table
    const { data: existing } = await supabase
      .from("fans")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return res.status(409).json({ error: "Email already subscribed" });
    }

    const { error } = await supabase
      .from("fans")
      .insert({ email });

    if (error) throw error;

    return res.json({ message: "Subscribed successfully!" });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};
