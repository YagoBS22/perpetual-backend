#!/bin/bash

API_URL="http://localhost:5000/api"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MzBlMmE2ZDcyZGYzNDQ0ZmI1MzAxMyIsImlhdCI6MTc0ODAzNDYwNywiZXhwIjoxNzQ4MDM4MjA3fQ.o2WfP1inbJxGlZ-Zs3mxfYNxEOoHXLgiFYVeLFFwASE"

echo "📃 Listando filmes do usuário..."
curl -X GET $API_URL/user/movies \
  -H "Authorization: Bearer $TOKEN"
echo
