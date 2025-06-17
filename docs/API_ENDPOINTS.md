# BSN API-Endpunkte

## Überblick

Diese Dokumentation beschreibt die API-Endpunkte des BSN (Blockchain Social Network) Backends. Die API ist nach REST-Prinzipien aufgebaut und verwendet JSON als Datenformat. Alle Endpunkte sind unter der Basis-URL `/api/` erreichbar.

## Authentifizierung

Die API verwendet Token-basierte Authentifizierung. Für die meisten Endpunkte ist ein gültiger JWT-Token erforderlich, der im Authorization-Header übergeben wird.

### Auth-Endpunkte

#### Registrierung

```
POST /api/auth/register/
```

Erstellt einen neuen Benutzeraccount.

**Request-Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "username",
  "referral_code": "ABC123"  // Optional
}
```

**Response (201 Created):**
```json
{
  "id": 123,
  "email": "user@example.com",
  "username": "username",
  "created_at": "2023-06-17T12:00:00Z",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### Login

```
POST /api/auth/login/
```

Authentifiziert einen Benutzer und gibt einen Token zurück.

**Request-Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "id": 123,
  "email": "user@example.com",
  "username": "username",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### E-Mail-Verifizierung

```
POST /api/auth/verify-email/
```

Verifiziert die E-Mail-Adresse eines Benutzers.

**Request-Body:**
```json
{
  "token": "verification-token-from-email"
}
```

**Response (200 OK):**
```json
{
  "message": "E-Mail erfolgreich verifiziert"
}
```

#### Passwort zurücksetzen

```
POST /api/auth/reset-password/request/
```

Sendet eine E-Mail mit einem Token zum Zurücksetzen des Passworts.

**Request-Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "E-Mail zum Zurücksetzen des Passworts wurde gesendet"
}
```

```
POST /api/auth/reset-password/confirm/
```

Setzt das Passwort mit einem gültigen Token zurück.

**Request-Body:**
```json
{
  "token": "reset-token-from-email",
  "new_password": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Passwort erfolgreich zurückgesetzt"
}
```

## Benutzer-Endpunkte

#### Benutzerprofil abrufen

```
GET /api/users/me/
```

Gibt das Profil des aktuell authentifizierten Benutzers zurück.

**Response (200 OK):**
```json
{
  "id": 123,
  "email": "user@example.com",
  "username": "username",
  "profile": {
    "display_name": "User Display Name",
    "bio": "User bio text",
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2023-06-17T12:00:00Z",
    "is_email_verified": true
  }
}
```

#### Benutzerprofil aktualisieren

```
PATCH /api/users/me/
```

Aktualisiert das Profil des aktuell authentifizierten Benutzers.

**Request-Body:**
```json
{
  "profile": {
    "display_name": "Updated Display Name",
    "bio": "Updated bio text",
    "avatar_url": "https://example.com/new-avatar.jpg"
  }
}
```

**Response (200 OK):**
```json
{
  "id": 123,
  "email": "user@example.com",
  "username": "username",
  "profile": {
    "display_name": "Updated Display Name",
    "bio": "Updated bio text",
    "avatar_url": "https://example.com/new-avatar.jpg",
    "created_at": "2023-06-17T12:00:00Z",
    "is_email_verified": true
  }
}
```

## Faucet-Endpunkte

#### Faucet-Status abrufen

```
GET /api/faucet/status/
```

Gibt den aktuellen Faucet-Status für den authentifizierten Benutzer zurück.

**Response (200 OK):**
```json
{
  "is_available": true,
  "next_claim_time": null,
  "claim_amount": 1.0,
  "total_claimed": 5.0,
  "daily_limit": 10.0,
  "remaining_limit": 5.0,
  "active_boosts": [
    {
      "type": "referral_bonus",
      "multiplier": 2.0,
      "expires_at": "2023-06-17T14:00:00Z"
    }
  ]
}
```

#### Faucet-Claim durchführen

```
POST /api/faucet/claim/
```

Führt einen Faucet-Claim für den authentifizierten Benutzer durch.

**Request-Body:**
```json
{
  "captcha_token": "valid-captcha-token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "claim_id": 456,
  "amount": 1.0,
  "claim_type": "standard",
  "timestamp": "2023-06-17T13:00:00Z",
  "next_claim_time": "2023-06-18T13:00:00Z"
}
```

#### Faucet-Historie abrufen

```
GET /api/faucet/history/
```

Gibt die Claim-Historie des authentifizierten Benutzers zurück.

**Response (200 OK):**
```json
{
  "claims": [
    {
      "id": 456,
      "amount": 1.0,
      "claim_type": "standard",
      "timestamp": "2023-06-17T13:00:00Z"
    },
    {
      "id": 455,
      "amount": 1.5,
      "claim_type": "activity_boost",
      "timestamp": "2023-06-16T12:30:00Z"
    }
  ],
  "total_claims": 2,
  "total_amount": 2.5
}
```

## Referral-Endpunkte

#### Referral-Code abrufen

```
GET /api/referral/code/
```

Gibt den Referral-Code des authentifizierten Benutzers zurück.

**Response (200 OK):**
```json
{
  "code": "ABC123",
  "referral_link": "https://bsn.network/register?ref=ABC123"
}
```

#### Referral-Statistiken abrufen

```
GET /api/referral/stats/
```

Gibt Statistiken zu den Referrals des authentifizierten Benutzers zurück.

**Response (200 OK):**
```json
{
  "total_referrals": 5,
  "verified_referrals": 3,
  "pending_referrals": 2,
  "total_rewards": 2.5,
  "next_milestone": {
    "level": 10,
    "current_progress": 5,
    "reward": 5.0
  }
}
```

#### Referral-Liste abrufen

```
GET /api/referral/list/
```

Gibt eine Liste der Referrals des authentifizierten Benutzers zurück.

**Response (200 OK):**
```json
{
  "referrals": [
    {
      "id": 789,
      "username": "referred_user1",
      "status": "verified",
      "created_at": "2023-06-15T10:00:00Z",
      "reward_paid": true
    },
    {
      "id": 790,
      "username": "referred_user2",
      "status": "pending",
      "created_at": "2023-06-16T11:00:00Z",
      "reward_paid": false
    }
  ]
}
```

#### Referral-Code validieren

```
GET /api/referral/validate/{code}/
```

Validiert einen Referral-Code.

**Response (200 OK):**
```json
{
  "is_valid": true,
  "referrer_username": "username"
}
```

#### Einladungs-E-Mail senden

```
POST /api/referral/share/
```

Sendet eine Einladungs-E-Mail mit dem Referral-Code des authentifizierten Benutzers.

**Request-Body:**
```json
{
  "emails": ["friend1@example.com", "friend2@example.com"],
  "message": "Join me on BSN!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "sent_count": 2
}
```

## Token-Reservierungs-Endpunkte

#### Token reservieren

```
POST /api/token/reserve/
```

Erstellt eine neue Token-Reservierung für den authentifizierten Benutzer.

**Request-Body:**
```json
{
  "amount": 100.0,
  "terms_accepted": true,
  "not_us_citizen": true,
  "not_restricted_country": true
}
```

**Response (201 Created):**
```json
{
  "id": 901,
  "amount": 100.0,
  "price_per_token": 0.15,
  "total_value_usd": 15.0,
  "phase": "private",
  "status": "pending",
  "created_at": "2023-06-17T14:00:00Z"
}
```

#### Reservierungen abrufen

```
GET /api/token/reservations/
```

Gibt die Token-Reservierungen des authentifizierten Benutzers zurück.

**Response (200 OK):**
```json
{
  "reservations": [
    {
      "id": 901,
      "amount": 100.0,
      "price_per_token": 0.15,
      "total_value_usd": 15.0,
      "phase": "private",
      "status": "pending",
      "created_at": "2023-06-17T14:00:00Z"
    }
  ],
  "total_reserved": 100.0,
  "total_value_usd": 15.0
}
```

#### Aktuelle Sale-Phase abrufen

```
GET /api/token/phase/
```

Gibt Informationen zur aktuellen Token-Sale-Phase zurück.

**Response (200 OK):**
```json
{
  "phase_name": "private",
  "start_date": "2023-06-01T00:00:00Z",
  "end_date": "2023-07-31T23:59:59Z",
  "price_per_token": 0.15,
  "min_reservation": 50.0,
  "max_reservation": 5000.0,
  "total_allocation": 1000000.0,
  "remaining_allocation": 950000.0,
  "whitelist_only": true,
  "kyc_required": false
}
```

#### Whitelist-Status abrufen

```
GET /api/token/whitelist/status/
```

Gibt den Whitelist-Status des authentifizierten Benutzers zurück.

**Response (200 OK):**
```json
{
  "is_whitelisted": true,
  "status": "approved",
  "application_date": "2023-06-10T09:00:00Z",
  "review_date": "2023-06-12T14:00:00Z"
}
```

#### Für Whitelist bewerben

```
POST /api/token/whitelist/apply/
```

Bewirbt den authentifizierten Benutzer für die Whitelist.

**Response (200 OK):**
```json
{
  "success": true,
  "status": "pending",
  "application_date": "2023-06-17T14:30:00Z",
  "message": "Deine Bewerbung wird geprüft"
}
```

## Newsletter-Endpunkte

#### Newsletter-Anmeldung

```
POST /api/newsletter/subscribe/
```

Meldet eine E-Mail-Adresse für den Newsletter an.

**Request-Body:**
```json
{
  "email": "subscriber@example.com",
  "name": "Subscriber Name",  // Optional
  "interests": ["updates", "token_sale"]  // Optional
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Erfolgreich für den Newsletter angemeldet"
}
```

#### Newsletter-Abmeldung

```
POST /api/newsletter/unsubscribe/
```

Meldet eine E-Mail-Adresse vom Newsletter ab.

**Request-Body:**
```json
{
  "email": "subscriber@example.com",
  "token": "unsubscribe-token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Erfolgreich vom Newsletter abgemeldet"
}
```

## Fehlerbehandlung

Die API verwendet standardisierte HTTP-Statuscodes, um den Erfolg oder Misserfolg einer Anfrage anzuzeigen:

- `200 OK`: Die Anfrage war erfolgreich
- `201 Created`: Die Ressource wurde erfolgreich erstellt
- `400 Bad Request`: Die Anfrage enthält ungültige Parameter oder fehlerhafte Daten
- `401 Unauthorized`: Authentifizierung ist erforderlich oder fehlgeschlagen
- `403 Forbidden`: Der authentifizierte Benutzer hat keine Berechtigung für diese Aktion
- `404 Not Found`: Die angeforderte Ressource wurde nicht gefunden
- `429 Too Many Requests`: Rate-Limit überschritten
- `500 Internal Server Error`: Ein Serverfehler ist aufgetreten

Fehlermeldungen werden im folgenden Format zurückgegeben:

```json
{
  "error": {
    "code": "invalid_input",
    "message": "Die angegebenen Daten sind ungültig",
    "details": {
      "email": ["Dieses Feld ist erforderlich"]
    }
  }
}
```

## Versionierung

Die API ist versioniert, um Abwärtskompatibilität zu gewährleisten. Die aktuelle Version ist `v1` und wird in der URL-Struktur verwendet: `/api/v1/...`

## Rate-Limiting

Die API implementiert Rate-Limiting, um Missbrauch zu verhindern. Die Limits variieren je nach Endpunkt:

- Authentifizierungs-Endpunkte: 10 Anfragen pro Minute
- Faucet-Claim: 1 Anfrage pro Minute, 10 Anfragen pro Tag
- Allgemeine Endpunkte: 60 Anfragen pro Minute

Die aktuellen Rate-Limit-Informationen werden in den Antwort-Headern zurückgegeben:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1623938400
```
