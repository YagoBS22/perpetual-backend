#!/bin/bash

API_URL="http://localhost:5000/api"
TOKEN="COLE_SEU_TOKEN_AQUI"
TMDB_ID=550

echo "🗑️ Removendo filme $TMDB_ID..."
curl -X DELETE $API_URL/user/movies/$TMDB_ID \
  -H "Authorization: Bearer $TOKEN"
echo
