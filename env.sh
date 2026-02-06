#!/bin/sh

# config
cat <<EOF > /usr/share/nginx/html/env-config.js
window.env = {
  VITE_SUPABASE_URL: "${VITE_SUPABASE_URL}",
  VITE_SUPABASE_ANON_KEY: "${VITE_SUPABASE_ANON_KEY}",
  VITE_GEMINI_API_KEY: "${VITE_GEMINI_API_KEY}",
  API_KEY: "${API_KEY}",
};
EOF
