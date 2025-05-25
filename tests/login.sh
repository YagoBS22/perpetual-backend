#!/bin/bash

API_URL="http://localhost:5000"
EMAIL="teste@example.com"
PASSWORD="123456"

echo "🟢 Fazendo login para obter token..."
curl -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}"
echo
