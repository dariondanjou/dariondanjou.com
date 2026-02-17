const { createClient } = require("@supabase/supabase-js");

let supabaseAdmin;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabaseAdmin;
}

module.exports = getSupabaseAdmin;
