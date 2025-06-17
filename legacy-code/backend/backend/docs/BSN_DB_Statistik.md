# BSN Datenbank – Statistiken & Beispiel-Queries

Hier findest du typische Auswertungen und Beispiel-Statistiken für die wichtigsten Tabellen.

## User & Social Graph
- **Anzahl User:**
  ```python
  User.objects.count()
  ```
- **Anzahl Freundschaften (akzeptiert):**
  ```python
  Friendship.objects.filter(status='accepted').count()
  ```
- **Anzahl Gruppen:**
  ```python
  Group.objects.count()
  ```
- **Anzahl Gruppenmitglieder:**
  ```python
  GroupMembership.objects.count()
  ```

## Content & Interaktion
- **Anzahl Posts:**
  ```python
  Post.objects.count()
  ```
- **Anzahl Kommentare:**
  ```python
  Comment.objects.count()
  ```
- **Anzahl Likes:**
  ```python
  Like.objects.count()
  ```
- **Anzahl Stories:**
  ```python
  Story.objects.count()
  ```

## Blockchain/Token
- **Anzahl Wallets:**
  ```python
  Wallet.objects.count()
  ```
- **Gesamte Token-Transaktionen:**
  ```python
  TokenTransaction.objects.count()
  ```
- **Gesamte gestakte Tokens:**
  ```python
  Staking.objects.aggregate(Sum('amount'))
  ```
- **Anzahl NFTs:**
  ```python
  NFT.objects.count()
  ```

## DAO & Governance
- **Anzahl DAOs:**
  ```python
  DAO.objects.count()
  ```
- **Anzahl DAO-Mitglieder:**
  ```python
  DAOMembership.objects.count()
  ```
- **Anzahl Proposals:**
  ```python
  Proposal.objects.count()
  ```
- **Anzahl Votes:**
  ```python
  Vote.objects.count()
  ```

## Integritäts- und Qualitätsprüfungen
- **Verwaiste Kommentare (ohne Post):**
  ```python
  Comment.objects.filter(post__isnull=True)
  ```
- **Likes ohne Ziel:**
  ```python
  Like.objects.filter(post__isnull=True, comment__isnull=True)
  ```
- **Doppelte Freundschaften:**
  ```python
  Friendship.objects.values('requester', 'receiver').annotate(count=Count('id')).filter(count__gt=1)
  ```

## Hinweise
- Die Queries sind für das Django ORM geschrieben.
- Für SQL können sie entsprechend angepasst werden.
- Für große Tabellen empfiehlt sich Indexierung auf ForeignKeys und häufig gefilterte Felder.

---

*Letzte Aktualisierung: Automatisch generiert.* 