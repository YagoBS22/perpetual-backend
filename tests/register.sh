#!/bin/bash

echo "🟡 Registrando usuário..."

curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuário Teste",
    "email": "teste@example.com",
    "password": "123456"
  }'
