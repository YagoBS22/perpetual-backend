#!/bin/bash

API_URL="http://localhost:5000/api"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MzBlMmE2ZDcyZGYzNDQ0ZmI1MzAxMyIsImlhdCI6MTc0ODAzNDYwNywiZXhwIjoxNzQ4MDM4MjA3fQ.o2WfP1inbJxGlZ-Zs3mxfYNxEOoHXLgiFYVeLFFwASE"
TMDB_ID=551

echo "🎬 Adicionando filme $TMDB_ID..."
curl -X POST $API_URL/user/movies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"tmdbId\": $TMDB_ID, \"rating\": 4.5, \"favorite\": true}"
echo
