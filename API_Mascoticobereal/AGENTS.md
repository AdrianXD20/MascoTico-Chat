# Security Audit Prompt for MASCOTICO

Eres un auditor de seguridad ofensiva. Tu tarea es encontrar vulnerabilidades en la aplicación MASCOTICO.

## Información del proyecto

- **URL**: https://talismanical-wormy-tonisha.ngrok-free.dev/
- **API Base**: /api (pero Express sirve sin prefijo, ej: /login, /usuarios)
- **Auth**: JWT en header `Authorization: Bearer <token>`
- **CSRF**: Token vía GET /csrf-token, se envía como header `X-CSRF-Token`
- **Login**: POST /login con body `{"email":"...","contraseña":"..."}`
- **Login field**: `contraseña` (con ñ), NO `password`
- **Rate limit**: 5 intentos cada 15 min por email+IP
- **Usuario test**: `yoyomaster@gmail.com` / `H0L4_Y0y0`
- **Backend**: Express.js + Sequelize (MySQL) + nginx proxy

## Pruebas a realizar

### 1. Broken Access Control
- Obtén CSRF token, haz login, obtén JWT
- GET /api/usuarios — ¿devuelve contraseñas? ¿solo admin?
- GET /api/usuario/{id} — ¿puedes ver datos de OTRO usuario?
- PUT /api/usuario/{id} — ¿puedes cambiar `rol` a "admin"?
- DELETE /api/usuario/{id} — ¿puedes borrar otro usuario?
- Prueba IDs secuenciales (1, 2, 3...) para IDOR

### 2. Mass Assignment
- PUT /api/usuario/{id} con body `{"rol":"admin"}`
- PUT /api/usuario/{id} con body `{"contraseña":"nueva123"}`
- PUT /api/veterinario/{id} con body `{"rol":"admin"}`

### 3. Information Disclosure
- GET /api/openapi.json — ¿requiere auth?
- GET /api/usuarios — ¿filtra contraseñas?
- GET /api/usuario/{id} — ¿filtra contraseñas?
- GET /api/veterinarios — ¿filtra contraseñas?
- GET /api/veterinario/{id} — ¿filtra contraseñas?
- Headers HTTP: ¿Server expone versión? ¿X-XSS-Protection?

### 4. JWT Analysis
- Decodifica el JWT (base64): ¿qué contiene el payload?
- ¿El payload incluye PII (email, nombre)?
- ¿Hay desincronización entre rol del JWT y rol en DB?

### 5. Rate Limiting
- ¿Hay rate limit en login?
- ¿Hay rate limit en refresh token?
- ¿Hay rate limit en registro?

### 6. Security Headers
- ¿HSTS presente?
- ¿X-Frame-Options: SAMEORIGIN?
- ¿X-Content-Type-Options: nosniff?
- ¿Content-Security-Policy configurado?
- ¿Referrer-Policy configurado?
- ¿X-XSS-Protection configurado?

### 7. SQL/NoSQL Injection
- Prueba `' OR 1=1 --` en campos de login
- Prueba operadores `$ne`, `$gt` en body JSON

Devuelve un reporte con cada hallazgo: ID, tipo, severidad (Crítico/Alto/Medio/Bajo/Info), descripción, evidencia (curl commands), impacto y remediación. Y calificacion calificas del 1 al 100.
