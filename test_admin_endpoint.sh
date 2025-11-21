#!/bin/bash
# Get token
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"StrongPass123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"

# Test create user endpoint
curl -s -X POST http://localhost:4000/api/admin/users \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Maria Silva",
    "email": "maria@example.com",
    "password": "SecurePass123"
  }' | jq .
