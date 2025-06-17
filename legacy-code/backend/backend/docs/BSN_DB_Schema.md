# BSN Datenbank – Modellübersicht

Diese Datei enthält eine vollständige Übersicht aller Datenbankmodelle, Felder, Beziehungen und Constraints des BSN Social Network Projekts.

## Inhaltsverzeichnis
- [User & Profile](#user--profile)
- [Soziales Netzwerk](#soziales-netzwerk)
- [Kommunikation](#kommunikation)
- [Gamification & Achievements](#gamification--achievements)
- [Blockchain/Token-Ökonomie](#blockchaintoken-ökonomie)
- [DAO & Governance](#dao--governance)
- [System & Logging](#system--logging)

---

## User & Profile

| Modell            | Feldname                | Typ / Constraint                | Beziehung / Besonderheit                |
|-------------------|-------------------------|----------------------------------|-----------------------------------------|
| User              | username, email, ...    | CharField, EmailField, ...       | AbstractUser, Wallet, ProfileSettings   |
|                   | wallet_address          | CharField (255), null=True       |                                         |
|                   | created_at, updated_at  | DateTimeField                    |                                         |
| ProfileSettings   | user                    | OneToOneField(User, PK)          | 1:1 User                                |
|                   | is_public               | BooleanField                     |                                         |
|                   | notification_preferences| JSONField                        |                                         |
|                   | language                | CharField (10)                   |                                         |
| UserSettings      | user                    | OneToOneField(User)              | 1:1 User                                |
|                   | theme                   | CharField (10)                   |                                         |
|                   | email_notifications     | BooleanField                     |                                         |
|                   | push_notifications      | BooleanField                     |                                         |
|                   | privacy_settings        | JSONField                        |                                         |
|                   | two_factor_auth_enabled | BooleanField                     |                                         |
|                   | auto_staking            | BooleanField                     |                                         |
|                   | updated_at              | DateTimeField                    |                                         |
| NotificationSettings| user                   | OneToOneField(User)              | 1:1 User                                |
|                   | likes, comments, ...    | BooleanField                     | Granulare Benachrichtigungen            |
|                   | updated_at              | DateTimeField                    |                                         |

---

## Soziales Netzwerk

| Modell            | Feldname                | Typ / Constraint                | Beziehung / Besonderheit                |
|-------------------|-------------------------|----------------------------------|-----------------------------------------|
| Friendship        | requester, receiver     | ForeignKey(User)                 | Unique(requester, receiver)             |
|                   | status                  | CharField (10)                   | [pending, accepted, declined]           |
|                   | created_at              | DateTimeField                    |                                         |
| Group             | name, description       | CharField, TextField             |                                         |
|                   | creator                 | ForeignKey(User)                 |                                         |
|                   | privacy                 | CharField (10)                   | [public, private]                       |
|                   | created_at, updated_at  | DateTimeField                    |                                         |
| GroupMembership   | group                   | ForeignKey(Group)                |                                         |
|                   | user                    | ForeignKey(User)                 | Unique(group, user)                     |
|                   | role                    | CharField (10)                   | [member, admin]                         |
|                   | joined_at               | DateTimeField                    |                                         |
| Post              | author                  | ForeignKey(User)                 |                                         |
|                   | group                   | ForeignKey(Group, null=True)     |                                         |
|                   | content, media_url      | TextField, URLField              |                                         |
|                   | created_at, updated_at  | DateTimeField                    |                                         |
| Comment           | post                    | ForeignKey(Post)                 |                                         |
|                   | author                  | ForeignKey(User)                 |                                         |
|                   | content                 | TextField                        |                                         |
|                   | created_at              | DateTimeField                    |                                         |
| Like              | user                    | ForeignKey(User)                 |                                         |
|                   | post                    | ForeignKey(Post, null=True)      |                                         |
|                   | comment                 | ForeignKey(Comment, null=True)   |                                         |
|                   | created_at              | DateTimeField                    | Check: post ODER comment                |
|                   |                        |                                  | Unique(user, post), Unique(user, comment)|
| Story             | author                  | ForeignKey(User)                 |                                         |
|                   | media_url               | URLField                         |                                         |
|                   | expires_at              | DateTimeField                    |                                         |
|                   | created_at              | DateTimeField                    |                                         |

---

## Kommunikation

| Modell            | Feldname                | Typ / Constraint                | Beziehung / Besonderheit                |
|-------------------|-------------------------|----------------------------------|-----------------------------------------|
| Message           | sender                  | ForeignKey(User)                 |                                         |
|                   | receiver                | ForeignKey(User, null=True)      |                                         |
|                   | group                   | ForeignKey(Group, null=True)     |                                         |
|                   | content, media_url      | TextField, URLField              |                                         |
|                   | created_at              | DateTimeField                    |                                         |
|                   |                        |                                  | Check: receiver ODER group              |
| Notification      | user                    | ForeignKey(User)                 |                                         |
|                   | type                    | CharField (20)                   | [like, comment, friend_request, ...]    |
|                   | reference_id            | IntegerField                     |                                         |
|                   | is_read                 | BooleanField                     |                                         |
|                   | created_at              | DateTimeField                    |                                         |

---

## Gamification & Achievements

| Modell            | Feldname                | Typ / Constraint                | Beziehung / Besonderheit                |
|-------------------|-------------------------|----------------------------------|-----------------------------------------|
| Achievement       | name, description       | CharField, TextField             |                                         |
|                   | criteria                | JSONField                        |                                         |
|                   | reward                  | CharField                        |                                         |
| UserAchievement   | user                    | ForeignKey(User)                 |                                         |
|                   | achievement             | ForeignKey(Achievement)          | Unique(user, achievement)               |
|                   | unlocked_at             | DateTimeField                    |                                         |
| AchievementTemplate| name, description      | CharField, TextField             |                                         |
|                   | criteria                | JSONField                        |                                         |
|                   | points                  | IntegerField                     |                                         |
|                   | token_reward            | DecimalField                     |                                         |
|                   | badge_image_url         | URLField                         |                                         |
|                   | is_active               | BooleanField                     |                                         |
|                   | created_at              | DateTimeField                    |                                         |
| Invite            | code                    | CharField (20), unique           |                                         |
|                   | inviter                 | ForeignKey(User)                 |                                         |
|                   | invitee_email           | EmailField                       |                                         |
|                   | is_used                 | BooleanField                     |                                         |
|                   | created_at, used_at     | DateTimeField                    |                                         |
| InviteReward      | inviter                 | ForeignKey(User)                 |                                         |
|                   | invite                  | OneToOneField(Invite)            |                                         |
|                   | reward_amount           | DecimalField                     |                                         |
|                   | is_claimed              | BooleanField                     |                                         |
|                   | claimed_at              | DateTimeField                    |                                         |
| Referral          | referrer, referred      | ForeignKey(User)                 |                                         |
|                   | reward_claimed          | BooleanField                     |                                         |
|                   | reward_amount           | DecimalField                     |                                         |
|                   | created_at, rewarded_at | DateTimeField                    |                                         |

---

## Blockchain/Token-Ökonomie

| Modell            | Feldname                | Typ / Constraint                | Beziehung / Besonderheit                |
|-------------------|-------------------------|----------------------------------|-----------------------------------------|
| Wallet            | user                    | OneToOneField(User)              | 1:1 User                                |
|                   | balance                 | DecimalField                     |                                         |
|                   | address                 | CharField (255), null=True       |                                         |
|                   | private_key_encrypted   | CharField (512), null=True       |                                         |
|                   | created_at, updated_at  | DateTimeField                    |                                         |
| TokenTransaction  | transaction_hash        | CharField (64), unique           |                                         |
|                   | from_wallet             | ForeignKey(Wallet, null=True)    |                                         |
|                   | to_wallet               | ForeignKey(Wallet)               |                                         |
|                   | amount                  | DecimalField                     |                                         |
|                   | transaction_type        | CharField (20)                   | [transfer, mining_reward, ...]          |
|                   | status                  | CharField (10)                   | [pending, completed, ...]               |
|                   | metadata                | JSONField                        |                                         |
|                   | created_at, completed_at| DateTimeField                    |                                         |
| MiningProgress    | user                    | ForeignKey(User)                 |                                         |
|                   | mining_power            | DecimalField                     |                                         |
|                   | last_claim_time         | DateTimeField                    |                                         |
|                   | accumulated_tokens      | DecimalField                     |                                         |
|                   | total_mined             | DecimalField                     |                                         |
|                   | streak_days             | IntegerField                     |                                         |
|                   | created_at, updated_at  | DateTimeField                    |                                         |
| NFT               | token_id                | CharField (64), unique           |                                         |
|                   | name, description       | CharField, TextField             |                                         |
|                   | owner, creator          | ForeignKey(User)                 |                                         |
|                   | nft_type                | CharField (10)                   | [image, audio, ...]                     |
|                   | media_url               | URLField                         |                                         |
|                   | metadata                | JSONField                        |                                         |
|                   | rarity                  | CharField (10)                   | [common, rare, ...]                     |
|                   | is_locked               | BooleanField                     |                                         |
|                   | transaction_hash        | CharField (64), null=True        |                                         |
|                   | created_at              | DateTimeField                    |                                         |
| Staking           | user                    | ForeignKey(User)                 |                                         |
|                   | amount                  | DecimalField                     |                                         |
|                   | status                  | CharField (10)                   | [active, completed, ...]                |
|                   | staking_period          | IntegerField                     |                                         |
|                   | apy_rate                | DecimalField                     |                                         |
|                   | rewards_earned          | DecimalField                     |                                         |
|                   | start_date, end_date    | DateTimeField                    |                                         |
|                   | last_reward_claim       | DateTimeField                    |                                         |
| TokenStreaming    | sender, receiver        | ForeignKey(User)                 |                                         |
|                   | total_amount            | DecimalField                     |                                         |
|                   | amount_per_second       | DecimalField                     |                                         |
|                   | streamed_amount         | DecimalField                     |                                         |
|                   | status                  | CharField (10)                   | [active, paused, ...]                   |
|                   | start_time, end_time    | DateTimeField                    |                                         |
|                   | last_update_time        | DateTimeField                    |                                         |
| SmartContract     | name, contract_type     | CharField                        | [token, nft, ...]                       |
|                   | address                 | CharField (255)                  |                                         |
|                   | network                 | CharField (50)                   |                                         |
|                   | abi                     | JSONField                        |                                         |
|                   | bytecode, source_code   | TextField                        |                                         |
|                   | creator                 | ForeignKey(User, null=True)      |                                         |
|                   | transaction_hash        | CharField (66), null=True        |                                         |
|                   | deployed_at             | DateTimeField                    |                                         |
| TokenFactory      | name, symbol            | CharField                        |                                         |
|                   | decimals                | IntegerField                     |                                         |
|                   | total_supply            | DecimalField                     |                                         |
|                   | token_standard          | CharField (10)                   | [erc20, erc721, ...]                    |
|                   | owner                   | ForeignKey(User)                 |                                         |
|                   | contract                | ForeignKey(SmartContract, null=True)|                                      |
|                   | logo_url                | URLField, null=True              |                                         |
|                   | description             | TextField, null=True             |                                         |
|                   | metadata                | JSONField                        |                                         |
|                   | created_at              | DateTimeField                    |                                         |

---

## DAO & Governance

| Modell            | Feldname                | Typ / Constraint                | Beziehung / Besonderheit                |
|-------------------|-------------------------|----------------------------------|-----------------------------------------|
| DAO               | name, description       | CharField, TextField             |                                         |
|                   | creator                 | ForeignKey(User)                 |                                         |
|                   | governance_token        | CharField (255), null=True       |                                         |
|                   | status                  | CharField (10)                   | [active, suspended, archived]           |
|                   | rules                   | JSONField                        |                                         |
|                   | logo_url                | URLField, null=True              |                                         |
|                   | created_at, updated_at  | DateTimeField                    |                                         |
| DAOMembership     | dao                     | ForeignKey(DAO)                  |                                         |
|                   | user                    | ForeignKey(User)                 | Unique(dao, user)                       |
|                   | role                    | CharField (15)                   | [member, contributor, ...]              |
|                   | voting_power            | DecimalField                     |                                         |
|                   | joined_at               | DateTimeField                    |                                         |
| Proposal          | dao                     | ForeignKey(DAO)                  |                                         |
|                   | creator                 | ForeignKey(User)                 |                                         |
|                   | title, description      | CharField, TextField             |                                         |
|                   | start_date, end_date    | DateTimeField                    |                                         |
|                   | status                  | CharField (10)                   | [draft, active, ...]                    |
|                   | execution_script        | JSONField                        |                                         |
|                   | quorum                  | IntegerField                     |                                         |
|                   | metadata                | JSONField                        |                                         |
|                   | created_at, updated_at  | DateTimeField                    |                                         |
| Vote              | proposal                | ForeignKey(Proposal)             |                                         |
|                   | voter                   | ForeignKey(User)                 | Unique(proposal, voter)                 |
|                   | vote                    | CharField (10)                   | [for, against, abstain]                 |
|                   | voting_power            | DecimalField                     |                                         |
|                   | reason                  | TextField, null=True             |                                         |
|                   | created_at              | DateTimeField                    |                                         |

---

## System & Logging

| Modell            | Feldname                | Typ / Constraint                | Beziehung / Besonderheit                |
|-------------------|-------------------------|----------------------------------|-----------------------------------------|
| AdminLog          | admin                   | ForeignKey(User, null=True)      |                                         |
|                   | action                  | CharField (10)                   | [create, update, ...]                   |
|                   | entity_type, entity_id  | CharField, IntegerField          |                                         |
|                   | description             | TextField                        |                                         |
|                   | metadata                | JSONField                        |                                         |
|                   | ip_address              | GenericIPAddressField, null=True |                                         |
|                   | created_at              | DateTimeField                    |                                         |
| EventLog          | event_type              | CharField (100)                  |                                         |
|                   | level                   | CharField (10)                   | [debug, info, ...]                      |
|                   | user                    | ForeignKey(User, null=True)      |                                         |
|                   | message                 | TextField                        |                                         |
|                   | metadata                | JSONField                        |                                         |
|                   | ip_address              | GenericIPAddressField, null=True |                                         |
|                   | created_at              | DateTimeField                    |                                         |

---

# Hinweise
- Alle ForeignKeys sind als Beziehungen dargestellt.
- Viele Felder sind optional (null=True, blank=True).
- Constraints (Unique, Check) sind explizit aufgeführt.
- JSONField wird für flexible Einstellungen und Metadaten genutzt.
- Zeitstempel (created_at, updated_at) sind fast überall vorhanden.

---

*Letzte Aktualisierung: Automatisch generiert.* 