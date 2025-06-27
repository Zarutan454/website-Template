# 📘 BSN Cursor Rules - Vollständige Entwicklungsrichtlinien

## 🎯 Überblick

Dieses Verzeichnis enthält **umfassende Entwicklungsregeln** für das BSN (Blockchain Social Network) Projekt. Diese Regeln wurden basierend auf der gesamten Projektdokumentation erstellt und stellen sicher, dass **keine Fehler bei der Entwicklung passieren** und alle Entwicklungen **der BSN-Logik entsprechen**.

## 📂 Rule Files Übersicht

| Datei | Fokus | Kritisch für |
|-------|-------|--------------|
| `00_AGENT_ROLES.md` | Multi-Agenten-System & Rollendefinitionen | **Projektkoordination** |
| `01_BSN_PROJECT_RULES.md` | BSN-Projekt-Spezifikationen & Phasen-Logik | **Kernprojekt-Verständnis** |
| `02_ARCHITECTURE_RULES.md` | System- & Komponenten-Architektur | **Code-Struktur** |
| `03_CODING_STANDARDS.md` | Coding-Standards & Best Practices | **Code-Qualität** |
| `04_MINING_SYSTEM_RULES.md` | Mining-System-spezifische Regeln | **🚨 KRITISCH für Mining** |
| `05_API_DEVELOPMENT_RULES.md` | API-Design & Security-Standards | **Backend-Development** |
| `06_DATABASE_SECURITY_RULES.md` | Datenbank & Sicherheits-Regeln | **🔒 KRITISCH für Security** |
| `07_DEVELOPMENT_WORKFLOW_RULES.md` | Entwicklungsprozess & Workflows | **Team-Koordination** |

## 🚨 KRITISCHE REGELN (Immer beachten!)

### ⛏️ Mining-System (HÖCHSTE PRIORITÄT)
```
❌ NIEMALS echte BSN-Token vor 100.000 Nutzern ausgeben
❌ NIEMALS Mining ohne Phase-Check aktivieren  
❌ NIEMALS Mining-Limits (10 BSN/Tag) überschreiten
✅ IMMER Phasen-Logik prüfen: Alpha/Beta = Simulation only
✅ IMMER Anti-Fraud-Checks vor Token-Ausgabe
```

### 🔒 Security (KRITISCH)
```
❌ NIEMALS Passwörter oder API-Keys im Code
❌ NIEMALS Raw SQL ohne Parameter
❌ NIEMALS User Input ohne Validation
✅ IMMER Input Sanitization
✅ IMMER Rate-Limiting für APIs
✅ IMMER Audit-Logging für kritische Aktionen
```

### 🏗️ Architektur (BINDEND)
```
✅ IMMER Atomic Design Pattern (Atoms → Molecules → Organisms)
✅ IMMER Komponenten-Namenskonventionen befolgen
✅ IMMER Error Boundaries implementieren
✅ IMMER Responsive Design (Mobile First)
❌ NIEMALS Props Drilling über 3 Levels
❌ NIEMALS Inline Styles in Production
```

## 🤖 Multi-Agenten-System Workflow

### Agent-Rollen & Automatische Aufgabenverteilung
```
🎯 Projektmanager    → Koordination, Planung, Eskalation
📊 Data Analyst      → Mining-Analyse, Token-Ökonomie
⚙️ Data Engineer     → Backend-Daten, Mining-Pipeline
💻 Software Developer → Frontend/Backend-Features
🧪 Tester/QA         → Testing, Quality Assurance
🎨 UI/UX Designer    → Design-System, User Experience
🏗️ Software Architect → System-Architektur, Tech-Entscheidungen
🚀 DevOps Agent      → Deployment, Infrastruktur
📚 Dokumentation     → API-Docs, User-Guides
🔬 Researcher        → Tech-Research, Innovation
```

### Automatische Kollaboration
- **Jeder Agent** übernimmt eigenständig Aufgaben
- **Automatische Delegation** zwischen Agenten
- **Selbstständige Koordination** bis Projektziel erreicht
- **Zentrale Aufgabenverwaltung** über Task-Board

## 📊 BSN-Entwicklungsphasen Integration

### Phase 1: Alpha (0-10k Nutzer) - AKTUELL
```python
STATUS = {
    "mining": False,        # NUR Simulation!
    "tokens": "Faucet only", # Keine echten BSN-Token
    "blockchain": "Internal", # Keine Blockchain-Integration
    "focus": "Grundfunktionen, ICO-Landing"
}
```

### Phase 2: Beta (10k-100k Nutzer)
```python
STATUS = {
    "mining": False,        # Weiterhin nur Simulation
    "tokens": "Faucet only", # Vorbereitung für Token-Launch
    "blockchain": "Preparation", # Multi-Chain Vorbereitung
    "focus": "Community-Aufbau, Social Features"
}
```

### Phase 3: Launch (100k-5M Nutzer)
```python
STATUS = {
    "mining": True,         # ECHTES Mining aktiviert!
    "tokens": "Real BSN",   # Echter BSN-Token über LayerZero
    "blockchain": "Multi-Chain", # Ethereum, BNB, Polygon
    "focus": "Token-Economy, Skalierung"
}
```

## 🛠️ Entwicklungsrichtlinien nach Komponenten

### 🎨 Frontend Development
```javascript
// ✅ IMMER - Atomic Design Pattern befolgen
// ✅ IMMER - TypeScript für Type Safety
// ✅ IMMER - Responsive Design (Mobile First)
// ✅ IMMER - Phase-Awareness in UI
// ❌ NIEMALS - Hardcoded API-URLs
// ❌ NIEMALS - Inline Styles für Production

// Beispiel: Phase-bewusste Mining-Komponente
const MiningDashboard = () => {
  const { phase, miningEnabled } = useMiningStatus()
  
  if (phase === 'alpha' || phase === 'beta') {
    return <MiningSimulationUI />
  }
  
  return <MiningActiveUI />
}
```

### 🔧 Backend Development
```python
# ✅ IMMER - Django ORM für DB-Queries
# ✅ IMMER - Input Validation mit Serializers
# ✅ IMMER - Phase-Checks für Mining-Operationen
# ✅ IMMER - Error Handling und Logging
# ❌ NIEMALS - Raw SQL ohne Parameter
# ❌ NIEMALS - Mining ohne Anti-Fraud-Checks

# Beispiel: Phase-bewusste Mining-API
@api_view(['POST'])
def start_mining(request):
    current_phase = get_current_mining_phase()
    
    if current_phase in ['alpha', 'beta']:
        return Response({
            'error': 'Mining not available in current phase',
            'phase': current_phase
        }, status=400)
    
    # Nur echtes Mining ab Launch-Phase
    return process_real_mining(request.user)
```

### 🗄️ Database Development
```python
# ✅ IMMER - Indexes für häufige Queries
# ✅ IMMER - Foreign Key Constraints
# ✅ IMMER - Sensitive Daten verschlüsselt
# ✅ IMMER - Audit-Trails für kritische Daten
# ❌ NIEMALS - Unbegrenzte Queries ohne Pagination
# ❌ NIEMALS - N+1 Query-Problem

# Beispiel: Mining-Model mit Security
class MiningTransaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    mining_phase = models.CharField(max_length=20)  # KRITISCH!
    is_simulation = models.BooleanField(default=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['mining_phase', 'is_simulation']),
        ]
```

## 🔄 Code Review Prozess

### Automatische Checks (CI/CD)
```yaml
- Security Scan (keine Secrets)
- Linting & Formatting (Black, ESLint)
- Unit Tests (>80% Coverage)
- Mining-System-Tests (Phase-Logic)
- Performance Tests
- Documentation Check
```

### Manuelle Review-Punkte
```markdown
🔍 PRÜFEN bei jedem PR:
- [ ] Mining-Phase-Checks implementiert
- [ ] Keine hardcoded Secrets
- [ ] Input Validation vorhanden
- [ ] Error Handling implementiert
- [ ] Tests geschrieben
- [ ] Dokumentation aktualisiert
- [ ] Agent-Rolle entsprechend zugewiesen
```

## 📈 Monitoring & Quality Assurance

### Performance Benchmarks
```javascript
BENCHMARKS = {
  "page_load": "< 3s",
  "api_response": "< 500ms", 
  "bundle_size": "< 500KB",
  "database_query": "< 100ms",
  "mining_calculation": "< 50ms"
}
```

### Security Standards
```python
SECURITY_STANDARDS = {
  "password_strength": "min 8 chars, mixed case, numbers",
  "session_timeout": "24 hours",
  "failed_login_lockout": "5 attempts = 1 hour lock",
  "api_rate_limiting": "100 requests/minute",
  "input_validation": "all user inputs sanitized"
}
```

## 🚀 Quick Start für Entwickler

### 1. Repository Setup
```bash
git clone <repository>
cd bsn-project

# Backend Setup
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser

# Frontend Setup
npm install
npm run dev

# Regel-Validierung
./scripts/validate-rules.sh
```

### 2. Vor jedem Feature
```bash
# 1. Check aktueller Phase
python manage.py check_mining_phase

# 2. Agent-Rolle zuweisen
echo "Feature: Mining Dashboard UI" 
echo "Assigned Agent: UI/UX Designer + Software Developer"

# 3. Branch erstellen
git checkout -b feature/mining-dashboard-ui

# 4. Regeln lesen
cat .cursor/rules/04_MINING_SYSTEM_RULES.md
```

### 3. Development Cycle
```bash
# Entwicklung mit Regel-Compliance
python manage.py test mining.tests.PhaseTests
npm run test:mining-components
npm run lint
python manage.py check --deploy

# Commit mit Standards
git commit -m "feat(mining): add phase-aware dashboard

- Implement simulation UI for alpha/beta phases
- Add real mining UI for launch phase
- Include security validations
- Add comprehensive tests

Agent: UI/UX Designer + Software Developer
Closes #123"
```

## ⚠️ Häufige Fehlerquellen (Vermeiden!)

### 🚨 KRITISCHE Fehler
```python
# ❌ NIEMALS - Mining ohne Phase-Check
def start_mining(user):
    user.mining_balance += 10  # GEFÄHRLICH!

# ❌ NIEMALS - Hardcoded Mining-Values
DAILY_LIMIT = 10  # Use settings!

# ❌ NIEMALS - Unvalidierte API-Inputs
def api_endpoint(request):
    amount = request.data['amount']  # XSS/Injection Risk!
```

### 🔧 Häufige Code-Probleme
```javascript
// ❌ NIEMALS - Unhandled Promises
apiCall()  // Missing .catch()!

// ❌ NIEMALS - Props Drilling
<A user={user}>
  <B user={user}>
    <C user={user} />  // Use Context!
  </B>
</A>

// ❌ NIEMALS - Unresponsive Design
.component { width: 800px; }  // Use responsive units!
```

## 📞 Support & Eskalation

### Bei Regel-Problemen
1. **Projekt-Manager-Agent** konsultieren
2. **Dokumentations-Agent** für Klarstellungen
3. **Software-Architect** für Architektur-Fragen
4. **Security-Review** für kritische Änderungen

### Bei kritischen Mining-System-Problemen
1. **SOFORTIGER STOPP** aller Mining-Operationen
2. **Data-Engineer** & **Tester** informieren
3. **Security-Audit** durchführen
4. **Phase-Zurückstufung** falls nötig

---

## ✅ Zusammenfassung

Diese Regeln stellen sicher, dass:
- **🔒 BSN-Projekt sicher entwickelt wird**
- **⛏️ Mining-System korrekt implementiert wird**
- **🤖 Multi-Agenten-System effizient koordiniert**
- **📊 Entwicklungsphasen-Logik eingehalten wird**
- **🎯 Keine kritischen Fehler auftreten**

**Alle Regeln sind BINDEND und müssen bei jeder Entwicklung befolgt werden!**

---

**📝 Letzte Aktualisierung**: 21. Dezember 2024  
**📋 Status**: Vollständig & Produktionsbereit  
**🎯 Ziel**: Fehlerfreie BSN-Entwicklung mit Multi-Agenten-Koordination 