TOKEN=$(curl -s -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@email.com", "password":"123456"}' | jq -r .token)

curl -X GET http://localhost:5000/api/protected \
  -H "Authorization: Bearer $TOKEN"
