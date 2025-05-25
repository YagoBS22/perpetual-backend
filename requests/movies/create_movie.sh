curl -X POST http://localhost:5000/movies \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MTViMjcyNzVmNjcwNDFlZGRjZTJkMCIsImlhdCI6MTc0NzAxNDA2MCwiZXhwIjoxNzQ3MDE3NjYwfQ.mhJN7Urt2vggLCGHkARRtqxpZzHCT7KydNTHCU-R-sQ" \
-d '{
  "title": "Karate Kid: Legends",
  "genre": "Action",
  "releaseYear": 2025,
  "rating": 7.0
}'