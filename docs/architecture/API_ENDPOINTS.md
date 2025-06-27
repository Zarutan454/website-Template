# BSN API-Endpunkte

## Überblick

Diese Dokumentation beschreibt die API-Endpunkte des BSN (Blockchain Social Network) Backends. Die API ist nach REST-Prinzipien aufgebaut und verwendet JSON als Datenformat. Alle Endpunkte sind unter der Basis-URL `/api/v1/` erreichbar.

## Authentifizierung

Die API verwendet Token-basierte Authentifizierung. Für die meisten Endpunkte ist ein gültiger JWT-Token erforderlich, der im Authorization-Header übergeben wird:

```
Authorization: Bearer <your-jwt-token>
```

## Basis-URL

```
Entwicklung: http://localhost:8000/api/v1/
Produktion: https://api.bsn.network/v1/
```

## Inhaltsverzeichnis

1. [Authentifizierung](#authentifizierung-endpunkte)
2. [Benutzer](#benutzer-endpunkte)
3. [Faucet](#faucet-endpunkte)
4. [Referral](#referral-endpunkte)
5. [Token-Reservierung](#token-reservierungs-endpunkte)
6. [Newsletter](#newsletter-endpunkte)
7. [Social Features](#social-features-endpunkte)
8. [Blockchain](#blockchain-endpunkte)
9. [Fehlerbehandlung](#fehlerbehandlung)

## Authentifizierung-Endpunkte

### Registrierung

```
POST /api/v1/auth/register/
```

Erstellt einen neuen Benutzeraccount.

**Request-Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "username",
  "first_name": "John",
  "last_name": "Doe",
  "referral_code": "ABC123",
  "accept_terms": true,
  "accept_privacy": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "username": "username",
      "first_name": "John",
      "last_name": "Doe",
      "is_email_verified": false,
      "created_at": "2023-06-17T12:00:00Z"
    },
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
  },
  "message": "Registrierung erfolgreich. Bitte verifizieren Sie Ihre E-Mail-Adresse."
}
```

### Login

```
POST /api/v1/auth/login/
```

Authentifiziert einen Benutzer und gibt Tokens zurück.

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
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "username": "username",
      "first_name": "John",
      "last_name": "Doe",
      "is_email_verified": true,
      "last_login": "2023-06-17T12:00:00Z"
    },
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
  },
  "message": "Login erfolgreich"
}
```

### Token Refresh

```
POST /api/v1/auth/token/refresh/
```

Erneuert den Access-Token mit einem gültigen Refresh-Token.

**Request-Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200 OK):**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Logout

```
POST /api/v1/auth/logout/
```

Invalidiert den Refresh-Token.

**Request-Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout erfolgreich"
}
```

### E-Mail-Verifizierung

```
POST /api/v1/auth/verify-email/
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
  "success": true,
  "message": "E-Mail erfolgreich verifiziert"
}
```

### E-Mail-Verifizierung erneut senden

```
POST /api/v1/auth/resend-verification/
```

Sendet eine neue Verifizierungs-E-Mail.

**Request-Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Verifizierungs-E-Mail wurde gesendet"
}
```

### Passwort zurücksetzen

```
POST /api/v1/auth/password/reset/
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
  "success": true,
  "message": "E-Mail zum Zurücksetzen des Passworts wurde gesendet"
}
```

```
POST /api/v1/auth/password/reset/confirm/
```

Setzt das Passwort mit einem gültigen Token zurück.

**Request-Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "newSecurePassword123",
  "password_confirm": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Passwort erfolgreich zurückgesetzt"
}
```

### Passwort ändern

```
POST /api/v1/auth/password/change/
```

Ändert das Passwort eines authentifizierten Benutzers.

**Request-Body:**
```json
{
  "old_password": "currentPassword123",
  "new_password": "newSecurePassword123",
  "new_password_confirm": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Passwort erfolgreich geändert"
}
```

## Benutzer-Endpunkte

### Benutzerprofil abrufen

```
GET /api/v1/users/me/
```

Gibt das Profil des aktuell authentifizierten Benutzers zurück.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "user@example.com",
    "username": "username",
    "first_name": "John",
    "last_name": "Doe",
    "profile": {
      "display_name": "John Doe",
      "bio": "Blockchain Enthusiast",
      "avatar_url": "https://example.com/avatar.jpg",
      "location": "Berlin, Germany",
      "website": "https://johndoe.com",
      "twitter_handle": "@johndoe",
      "github_handle": "johndoe",
      "linkedin_handle": "johndoe",
      "created_at": "2023-06-17T12:00:00Z",
      "updated_at": "2023-06-17T12:00:00Z"
    },
    "stats": {
      "total_referrals": 5,
      "total_tokens_earned": 150.5,
      "total_faucet_claims": 10,
      "account_level": "Silver"
    },
    "is_email_verified": true,
    "is_active": true,
    "date_joined": "2023-06-17T12:00:00Z",
    "last_login": "2023-06-17T14:30:00Z"
  }
}
```

### Benutzerprofil aktualisieren

```
PATCH /api/v1/users/me/
```

Aktualisiert das Profil des aktuell authentifizierten Benutzers.

**Request-Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "profile": {
    "display_name": "John Doe",
    "bio": "Updated bio text",
    "location": "Munich, Germany",
    "website": "https://johndoe.com",
    "twitter_handle": "@johndoe",
    "github_handle": "johndoe",
    "linkedin_handle": "johndoe"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "user@example.com",
    "username": "username",
    "first_name": "John",
    "last_name": "Doe",
    "profile": {
      "display_name": "John Doe",
      "bio": "Updated bio text",
      "avatar_url": "https://example.com/avatar.jpg",
      "location": "Munich, Germany",
      "website": "https://johndoe.com",
      "twitter_handle": "@johndoe",
      "github_handle": "johndoe",
      "linkedin_handle": "johndoe",
      "updated_at": "2023-06-17T15:00:00Z"
    }
  },
  "message": "Profil erfolgreich aktualisiert"
}
```

### Avatar hochladen

```
POST /api/v1/users/me/avatar/
```

Lädt ein neues Avatar-Bild hoch.

**Request-Body (multipart/form-data):**
```
avatar: <image-file>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "avatar_url": "https://example.com/media/avatars/user_123_avatar.jpg"
  },
  "message": "Avatar erfolgreich hochgeladen"
}
```

### Benutzer löschen

```
DELETE /api/v1/users/me/
```

Löscht den Account des authentifizierten Benutzers.

**Request-Body:**
```json
{
  "password": "currentPassword123",
  "confirm_deletion": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Account erfolgreich gelöscht"
}
```

## Faucet-Endpunkte

### Faucet-Status abrufen

```
GET /api/v1/faucet/status/
```

Gibt den aktuellen Faucet-Status für den authentifizierten Benutzer zurück.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "is_available": true,
    "next_claim_time": null,
    "claim_amount": 1.0,
    "total_claimed": 5.0,
    "daily_limit": 10.0,
    "remaining_limit": 5.0,
    "current_streak": 3,
    "max_streak": 7,
    "active_boosts": [
      {
        "type": "referral_bonus",
        "multiplier": 2.0,
        "expires_at": "2023-06-17T14:00:00Z",
        "description": "Referral Bonus"
      },
      {
        "type": "daily_streak",
        "multiplier": 1.5,
        "expires_at": null,
        "description": "Daily Streak Bonus"
      }
    ],
    "requirements": {
      "email_verified": true,
      "minimum_account_age_hours": 24,
      "captcha_required": true
    }
  }
}
```

### Faucet-Claim durchführen

```
POST /api/v1/faucet/claim/
```

Führt einen Faucet-Claim für den authentifizierten Benutzer durch.

**Request-Body:**
```json
{
  "captcha_token": "valid-captcha-token",
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "claim_id": 456,
    "amount": 2.0,
    "base_amount": 1.0,
    "bonus_amount": 1.0,
    "claim_type": "daily_streak",
    "transaction_hash": "0x1234567890abcdef...",
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "timestamp": "2023-06-17T13:00:00Z",
    "next_claim_time": "2023-06-18T13:00:00Z",
    "new_streak": 4,
    "applied_boosts": [
      {
        "type": "daily_streak",
        "multiplier": 1.5,
        "bonus_amount": 0.5
      },
      {
        "type": "referral_bonus",
        "multiplier": 1.5,
        "bonus_amount": 0.5
      }
    ]
  },
  "message": "Claim erfolgreich! 2.0 BSN Token wurden an Ihre Wallet gesendet."
}
```

### Faucet-Historie abrufen

```
GET /api/v1/faucet/history/
```

Gibt die Claim-Historie des authentifizierten Benutzers zurück.

**Query Parameters:**
- `page` (optional): Seitennummer (default: 1)
- `limit` (optional): Anzahl Einträge pro Seite (default: 20, max: 100)
- `start_date` (optional): Startdatum (YYYY-MM-DD)
- `end_date` (optional): Enddatum (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "claims": [
      {
        "id": 456,
        "amount": 2.0,
        "base_amount": 1.0,
        "bonus_amount": 1.0,
        "claim_type": "daily_streak",
        "transaction_hash": "0x1234567890abcdef...",
        "wallet_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        "timestamp": "2023-06-17T13:00:00Z",
        "status": "completed"
      },
      {
        "id": 455,
        "amount": 1.5,
        "base_amount": 1.0,
        "bonus_amount": 0.5,
        "claim_type": "activity_boost",
        "transaction_hash": "0xabcdef1234567890...",
        "wallet_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        "timestamp": "2023-06-16T12:30:00Z",
        "status": "completed"
      }
    ],
    "pagination": {
      "total_claims": 25,
      "total_pages": 2,
      "current_page": 1,
      "per_page": 20,
      "has_next": true,
      "has_previous": false
    },
    "summary": {
      "total_amount": 37.5,
      "total_base_amount": 25.0,
      "total_bonus_amount": 12.5,
      "average_claim": 1.5,
      "current_streak": 4,
      "max_streak": 7
    }
  }
}
```

## Referral-Endpunkte

### Referral-Code abrufen

```
GET /api/v1/referral/code/
```

Gibt den Referral-Code des authentifizierten Benutzers zurück.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "code": "ABC123",
    "referral_link": "https://bsn.network/register?ref=ABC123",
    "qr_code_url": "https://api.bsn.network/v1/referral/qr/ABC123.png",
    "created_at": "2023-06-17T12:00:00Z",
    "is_active": true
  }
}
```

### Referral-Statistiken abrufen

```
GET /api/v1/referral/stats/
```

Gibt Statistiken zu den Referrals des authentifizierten Benutzers zurück.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_referrals": 15,
    "verified_referrals": 12,
    "pending_referrals": 3,
    "active_referrals": 10,
    "total_rewards": 75.0,
    "pending_rewards": 15.0,
    "paid_rewards": 60.0,
    "conversion_rate": 0.8,
    "current_tier": "Silver",
    "next_tier": {
      "name": "Gold",
      "required_referrals": 25,
      "current_progress": 15,
      "reward_multiplier": 1.5,
      "benefits": [
        "Höhere Referral-Belohnungen",
        "Exklusive NFT-Zugang",
        "VIP-Community-Zugang"
      ]
    },
    "monthly_stats": {
      "current_month": {
        "referrals": 5,
        "rewards": 25.0
      },
      "last_month": {
        "referrals": 7,
        "rewards": 35.0
      }
    }
  }
}
```

### Referral-Liste abrufen

```
GET /api/v1/referral/list/
```

Gibt eine Liste der Referrals des authentifizierten Benutzers zurück.

**Query Parameters:**
- `page` (optional): Seitennummer (default: 1)
- `limit` (optional): Anzahl Einträge pro Seite (default: 20, max: 100)
- `status` (optional): Filter nach Status (pending, verified, active)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "referrals": [
      {
        "id": 789,
        "username": "referred_user1",
        "display_name": "Max Mustermann",
        "email": "max@example.com",
        "status": "verified",
        "created_at": "2023-06-15T10:00:00Z",
        "verified_at": "2023-06-15T10:30:00Z",
        "reward_paid": true,
        "reward_amount": 5.0,
        "activity_level": "high",
        "total_earned": 25.0
      },
      {
        "id": 790,
        "username": "referred_user2",
        "display_name": "Anna Schmidt",
        "email": "anna@example.com",
        "status": "pending",
        "created_at": "2023-06-16T11:00:00Z",
        "verified_at": null,
        "reward_paid": false,
        "reward_amount": 0.0,
        "activity_level": "low",
        "total_earned": 0.0
      }
    ],
    "pagination": {
      "total_referrals": 15,
      "total_pages": 1,
      "current_page": 1,
      "per_page": 20,
      "has_next": false,
      "has_previous": false
    }
  }
}
```

### Referral-Code validieren

```
GET /api/v1/referral/validate/{code}/
```

Validiert einen Referral-Code.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "is_valid": true,
    "referrer": {
      "username": "referrer_user",
      "display_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg",
      "tier": "Silver",
      "total_referrals": 15
    },
    "bonus_info": {
      "referrer_bonus": 5.0,
      "referee_bonus": 2.0,
      "description": "Beide erhalten Bonus-Token bei erfolgreicher Registrierung"
    }
  }
}
```

### Einladungs-E-Mail senden

```
POST /api/v1/referral/invite/
```

Sendet eine Einladungs-E-Mail mit dem Referral-Code des authentifizierten Benutzers.

**Request-Body:**
```json
{
  "emails": ["friend1@example.com", "friend2@example.com"],
  "message": "Schließe dich mir bei BSN an und verdiene Token!",
  "language": "de"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "sent_count": 2,
    "failed_count": 0,
    "sent_to": ["friend1@example.com", "friend2@example.com"],
    "failed_to": []
  },
  "message": "Einladungen erfolgreich gesendet"
}
```

## Token-Reservierungs-Endpunkte

### Token reservieren

```
POST /api/v1/token/reserve/
```

Erstellt eine neue Token-Reservierung für den authentifizierten Benutzer.

**Request-Body:**
```json
{
  "amount": 1000.0,
  "payment_method": "crypto",
  "payment_currency": "USDT",
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "terms_accepted": true,
  "privacy_accepted": true,
  "not_us_citizen": true,
  "not_restricted_country": true,
  "kyc_completed": false
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "reservation": {
      "id": 901,
      "amount": 1000.0,
      "price_per_token": 0.15,
      "total_value_usd": 150.0,
      "payment_method": "crypto",
      "payment_currency": "USDT",
      "wallet_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      "phase": "private",
      "status": "pending_payment",
      "created_at": "2023-06-17T14:00:00Z",
      "expires_at": "2023-06-17T15:00:00Z"
    },
    "payment_info": {
      "payment_address": "0x1234567890123456789012345678901234567890",
      "amount_due": 150.0,
      "currency": "USDT",
      "network": "Ethereum",
      "payment_deadline": "2023-06-17T15:00:00Z",
      "qr_code_url": "https://api.bsn.network/v1/payment/qr/901.png"
    }
  },
  "message": "Token-Reservierung erstellt. Bitte führen Sie die Zahlung innerhalb von 1 Stunde durch."
}
```

### Reservierungen abrufen

```
GET /api/v1/token/reservations/
```

Gibt die Token-Reservierungen des authentifizierten Benutzers zurück.

**Query Parameters:**
- `page` (optional): Seitennummer (default: 1)
- `limit` (optional): Anzahl Einträge pro Seite (default: 20, max: 100)
- `status` (optional): Filter nach Status (pending_payment, confirmed, cancelled, expired)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "reservations": [
      {
        "id": 901,
        "amount": 1000.0,
        "price_per_token": 0.15,
        "total_value_usd": 150.0,
        "payment_method": "crypto",
        "payment_currency": "USDT",
        "wallet_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        "phase": "private",
        "status": "confirmed",
        "created_at": "2023-06-17T14:00:00Z",
        "confirmed_at": "2023-06-17T14:30:00Z",
        "transaction_hash": "0xabcdef1234567890..."
      }
    ],
    "pagination": {
      "total_reservations": 3,
      "total_pages": 1,
      "current_page": 1,
      "per_page": 20,
      "has_next": false,
      "has_previous": false
    },
    "summary": {
      "total_reserved": 2500.0,
      "total_value_usd": 375.0,
      "confirmed_reservations": 2,
      "pending_reservations": 1
    }
  }
}
```

### Aktuelle Sale-Phase abrufen

```
GET /api/v1/token/phase/
```

Gibt Informationen zur aktuellen Token-Sale-Phase zurück.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "current_phase": {
      "name": "private",
      "display_name": "Private Sale",
      "start_date": "2023-06-01T00:00:00Z",
      "end_date": "2023-07-31T23:59:59Z",
      "price_per_token": 0.15,
      "min_reservation": 100.0,
      "max_reservation": 10000.0,
      "total_allocation": 1000000.0,
      "sold_amount": 250000.0,
      "remaining_allocation": 750000.0,
      "progress_percentage": 25.0,
      "whitelist_only": true,
      "kyc_required": false,
      "payment_methods": ["crypto", "fiat"],
      "accepted_currencies": ["USDT", "USDC", "ETH", "BTC"],
      "bonus_percentage": 20.0,
      "is_active": true
    },
    "next_phase": {
      "name": "public",
      "display_name": "Public Sale",
      "start_date": "2023-08-01T00:00:00Z",
      "price_per_token": 0.20,
      "bonus_percentage": 10.0
    },
    "statistics": {
      "total_participants": 1250,
      "total_raised_usd": 37500.0,
      "average_investment": 30.0
    }
  }
}
```

### Whitelist-Status abrufen

```
GET /api/v1/token/whitelist/status/
```

Gibt den Whitelist-Status des authentifizierten Benutzers zurück.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "is_whitelisted": true,
    "status": "approved",
    "tier": "gold",
    "allocation_limit": 10000.0,
    "used_allocation": 2500.0,
    "remaining_allocation": 7500.0,
    "application_date": "2023-06-10T09:00:00Z",
    "review_date": "2023-06-12T14:00:00Z",
    "approved_by": "admin",
    "benefits": [
      "Früher Zugang zu Private Sale",
      "Höhere Allocation-Limits",
      "Bonus-Token bei Reservierung",
      "Exklusive Community-Zugang"
    ]
  }
}
```

### Für Whitelist bewerben

```
POST /api/v1/token/whitelist/apply/
```

Bewirbt den authentifizierten Benutzer für die Whitelist.

**Request-Body:**
```json
{
  "telegram_handle": "@johndoe",
  "twitter_handle": "@johndoe",
  "linkedin_profile": "https://linkedin.com/in/johndoe",
  "investment_experience": "intermediate",
  "planned_investment": 5000.0,
  "referral_source": "twitter",
  "additional_info": "Langjähriger Krypto-Investor mit Fokus auf DeFi-Projekte"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "application_id": 123,
    "status": "pending",
    "application_date": "2023-06-17T14:30:00Z",
    "estimated_review_time": "2-3 Werktage",
    "next_steps": [
      "Warten auf Review durch das Team",
      "E-Mail-Benachrichtigung bei Statusänderung",
      "Bei Genehmigung: Zugang zu Private Sale"
    ]
  },
  "message": "Whitelist-Bewerbung eingereicht. Sie erhalten eine E-Mail sobald Ihre Bewerbung geprüft wurde."
}
```

## Newsletter-Endpunkte

### Newsletter-Anmeldung

```
POST /api/v1/newsletter/subscribe/
```

Meldet eine E-Mail-Adresse für den Newsletter an.

**Request-Body:**
```json
{
  "email": "subscriber@example.com",
  "name": "John Doe",
  "interests": ["updates", "token_sale", "technical"],
  "language": "de",
  "source": "website",
  "gdpr_consent": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "subscription_id": 456,
    "email": "subscriber@example.com",
    "status": "active",
    "subscribed_at": "2023-06-17T14:30:00Z",
    "interests": ["updates", "token_sale", "technical"],
    "language": "de"
  },
  "message": "Erfolgreich für den Newsletter angemeldet"
}
```

### Newsletter-Abmeldung

```
POST /api/v1/newsletter/unsubscribe/
```

Meldet eine E-Mail-Adresse vom Newsletter ab.

**Request-Body:**
```json
{
  "email": "subscriber@example.com",
  "token": "unsubscribe-token-from-email"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Erfolgreich vom Newsletter abgemeldet"
}
```

### Newsletter-Einstellungen aktualisieren

```
PATCH /api/v1/newsletter/preferences/
```

Aktualisiert die Newsletter-Einstellungen.

**Request-Body:**
```json
{
  "email": "subscriber@example.com",
  "token": "preferences-token-from-email",
  "interests": ["updates", "token_sale"],
  "frequency": "weekly",
  "language": "en"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "email": "subscriber@example.com",
    "interests": ["updates", "token_sale"],
    "frequency": "weekly",
    "language": "en",
    "updated_at": "2023-06-17T14:30:00Z"
  },
  "message": "Newsletter-Einstellungen aktualisiert"
}
```

## Social Features-Endpunkte

### Posts erstellen

```
POST /api/v1/social/posts/
```

Erstellt einen neuen Social Media Post.

**Request-Body:**
```json
{
  "content": "Gerade meine ersten BSN Token über den Faucet erhalten! 🚀",
  "media_urls": ["https://example.com/image.jpg"],
  "tags": ["BSN", "Faucet", "Crypto"],
  "visibility": "public"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 789,
    "content": "Gerade meine ersten BSN Token über den Faucet erhalten! 🚀",
    "media_urls": ["https://example.com/image.jpg"],
    "tags": ["BSN", "Faucet", "Crypto"],
    "visibility": "public",
    "author": {
      "id": 123,
      "username": "johndoe",
      "display_name": "John Doe",
      "avatar_url": "https://example.com/avatar.jpg"
    },
    "stats": {
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "views": 0
    },
    "created_at": "2023-06-17T14:30:00Z",
    "updated_at": "2023-06-17T14:30:00Z"
  },
  "message": "Post erfolgreich erstellt"
}
```

### Posts abrufen

```
GET /api/v1/social/posts/
```

Gibt eine Liste von Posts zurück.

**Query Parameters:**
- `page` (optional): Seitennummer (default: 1)
- `limit` (optional): Anzahl Einträge pro Seite (default: 20, max: 100)
- `user_id` (optional): Filter nach Benutzer-ID
- `tag` (optional): Filter nach Tag
- `sort` (optional): Sortierung (newest, oldest, popular)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 789,
        "content": "Gerade meine ersten BSN Token über den Faucet erhalten! 🚀",
        "media_urls": ["https://example.com/image.jpg"],
        "tags": ["BSN", "Faucet", "Crypto"],
        "visibility": "public",
        "author": {
          "id": 123,
          "username": "johndoe",
          "display_name": "John Doe",
          "avatar_url": "https://example.com/avatar.jpg"
        },
        "stats": {
          "likes": 15,
          "comments": 3,
          "shares": 2,
          "views": 150
        },
        "user_interaction": {
          "liked": false,
          "shared": false,
          "bookmarked": false
        },
        "created_at": "2023-06-17T14:30:00Z",
        "updated_at": "2023-06-17T14:30:00Z"
      }
    ],
    "pagination": {
      "total_posts": 250,
      "total_pages": 13,
      "current_page": 1,
      "per_page": 20,
      "has_next": true,
      "has_previous": false
    }
  }
}
```

## Blockchain-Endpunkte

### Wallet-Adresse validieren

```
POST /api/v1/blockchain/validate-address/
```

Validiert eine Blockchain-Wallet-Adresse.

**Request-Body:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "network": "ethereum"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "is_valid": true,
    "network": "ethereum",
    "address_type": "EOA",
    "checksum_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  }
}
```

### Transaktions-Status abrufen

```
GET /api/v1/blockchain/transaction/{tx_hash}/
```

Gibt den Status einer Blockchain-Transaktion zurück.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transaction_hash": "0xabcdef1234567890...",
    "status": "confirmed",
    "confirmations": 15,
    "block_number": 18500000,
    "from_address": "0x1234567890123456789012345678901234567890",
    "to_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "value": "1000000000000000000",
    "gas_used": "21000",
    "gas_price": "20000000000",
    "network": "ethereum",
    "timestamp": "2023-06-17T14:30:00Z"
  }
}
```

### Token-Balance abrufen

```
GET /api/v1/blockchain/balance/{address}/
```

Gibt die Token-Balance einer Wallet-Adresse zurück.

**Query Parameters:**
- `network` (optional): Blockchain-Netzwerk (default: ethereum)
- `token_contract` (optional): Token-Contract-Adresse

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "network": "ethereum",
    "balances": {
      "native": {
        "symbol": "ETH",
        "balance": "1.5",
        "balance_wei": "1500000000000000000",
        "usd_value": 2400.0
      },
      "tokens": [
        {
          "contract_address": "0x1234567890123456789012345678901234567890",
          "symbol": "BSN",
          "name": "BSN Token",
          "balance": "1000.0",
          "decimals": 18,
          "usd_value": 150.0
        }
      ]
    },
    "total_usd_value": 2550.0,
    "last_updated": "2023-06-17T14:30:00Z"
  }
}
```

## Fehlerbehandlung

Die API verwendet standardisierte HTTP-Statuscodes und gibt strukturierte Fehlermeldungen zurück:

### HTTP-Statuscodes

- `200 OK`: Anfrage erfolgreich
- `201 Created`: Ressource erfolgreich erstellt
- `400 Bad Request`: Ungültige Anfrage oder fehlerhafte Daten
- `401 Unauthorized`: Authentifizierung erforderlich oder fehlgeschlagen
- `403 Forbidden`: Keine Berechtigung für diese Aktion
- `404 Not Found`: Ressource nicht gefunden
- `422 Unprocessable Entity`: Validierungsfehler
- `429 Too Many Requests`: Rate-Limit überschritten
- `500 Internal Server Error`: Serverfehler

### Fehlerformat

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Die übermittelten Daten sind ungültig",
    "details": {
      "email": ["Dieses Feld ist erforderlich"],
      "password": ["Das Passwort muss mindestens 8 Zeichen lang sein"]
    },
    "timestamp": "2023-06-17T14:30:00Z",
    "request_id": "abc123def456"
  }
}
```

### Häufige Fehlercodes

- `INVALID_CREDENTIALS`: Ungültige Anmeldedaten
- `EMAIL_NOT_VERIFIED`: E-Mail-Adresse nicht verifiziert
- `RATE_LIMIT_EXCEEDED`: Rate-Limit überschritten
- `INSUFFICIENT_BALANCE`: Unzureichendes Guthaben
- `INVALID_TOKEN`: Ungültiger oder abgelaufener Token
- `WHITELIST_REQUIRED`: Whitelist-Berechtigung erforderlich
- `VALIDATION_ERROR`: Validierungsfehler bei Eingabedaten
- `RESOURCE_NOT_FOUND`: Angeforderte Ressource nicht gefunden
- `PERMISSION_DENIED`: Keine Berechtigung für diese Aktion

## Rate Limiting

Die API implementiert Rate-Limiting zur Vermeidung von Missbrauch:

### Limits nach Endpunkt-Typ

- **Authentifizierung**: 10 Anfragen pro Minute
- **Faucet-Claims**: 1 Anfrage pro Minute, 10 pro Tag
- **Token-Reservierungen**: 5 Anfragen pro Minute
- **Allgemeine Endpunkte**: 100 Anfragen pro Minute
- **Blockchain-Abfragen**: 20 Anfragen pro Minute

### Rate-Limit-Header

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1687012800
X-RateLimit-Reset-After: 45
```

## Versionierung

Die API verwendet Versionierung über die URL:
- Aktuelle Version: `v1`
- Basis-URL: `/api/v1/`
- Deprecated Versionen werden 6 Monate unterstützt

## Paginierung

Alle Listen-Endpunkte unterstützen Paginierung:

### Query Parameters
- `page`: Seitennummer (Standard: 1)
- `limit`: Einträge pro Seite (Standard: 20, Maximum: 100)

### Response-Format
```json
{
  "pagination": {
    "total_items": 250,
    "total_pages": 13,
    "current_page": 1,
    "per_page": 20,
    "has_next": true,
    "has_previous": false,
    "next_page": 2,
    "previous_page": null
  }
}
```

## Webhooks

Für Echtzeit-Benachrichtigungen unterstützt die API Webhooks:

### Verfügbare Events
- `user.registered`: Neue Benutzerregistrierung
- `user.verified`: E-Mail-Verifizierung abgeschlossen
- `faucet.claimed`: Faucet-Claim durchgeführt
- `token.reserved`: Token-Reservierung erstellt
- `payment.completed`: Zahlung abgeschlossen
- `referral.completed`: Referral-Bonus ausgezahlt

### Webhook-Konfiguration
```
POST /api/v1/webhooks/
```

**Request-Body:**
```json
{
  "url": "https://your-app.com/webhooks/bsn",
  "events": ["faucet.claimed", "token.reserved"],
  "secret": "your-webhook-secret"
}
```

## Support

Für weitere Unterstützung:
- **Dokumentation**: [BSN API Docs](https://docs.bsn.network)
- **Support**: [support@bsn.network](mailto:support@bsn.network)
- **Status Page**: [status.bsn.network](https://status.bsn.network)
- **GitHub**: [BSN Repository](https://github.com/bsn-network/api)
