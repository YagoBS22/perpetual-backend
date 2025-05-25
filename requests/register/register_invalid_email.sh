curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João", "email":"email-invalido", "password":"123456"}'
