MOVIE_ID="68214a828237fe16e618ffa0"

curl -X GET http://localhost:5000/movies/$MOVIE_ID \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MTViMjcyNzVmNjcwNDFlZGRjZTJkMCIsImlhdCI6MTc0NzAxNDA2MCwiZXhwIjoxNzQ3MDE3NjYwfQ.mhJN7Urt2vggLCGHkARRtqxpZzHCT7KydNTHCU-R-sQ"
