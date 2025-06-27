# BSN Development Workflow Regeln für Cursor

## 🔄 Entwicklungsprozess-Regeln

### Git Workflow Standards
```bash
# ✅ RICHTIG - Branch Naming Convention
git checkout -b feature/mining-dashboard-ui
git checkout -b fix/authentication-bug
git checkout -b hotfix/security-vulnerability
git checkout -b refactor/api-optimization

# ✅ RICHTIG - Commit Message Format
git commit -m "feat(mining): add passive mining dashboard component

- Implement mining status display
- Add mining rate calculations
- Include phase-aware UI rendering
- Add security validations for alpha/beta phases

Closes #123"

# ❌ FALSCH - Unklare Commit Messages
git commit -m "fix stuff"
git commit -m "update"
git commit -m "changes"
```

### Pull Request Regeln
```markdown
## PR Template (Verpflichtend)

### 🎯 Beschreibung
Kurze Beschreibung der Änderungen und des Problems, das gelöst wird.

### 📋 Änderungen
- [ ] Frontend-Komponenten
- [ ] Backend-API-Endpoints
- [ ] Datenbank-Migrationen
- [ ] Tests hinzugefügt/aktualisiert
- [ ] Dokumentation aktualisiert

### 🔒 Sicherheits-Checks
- [ ] Input-Validation implementiert
- [ ] Keine hardcoded Secrets
- [ ] Rate-Limiting berücksichtigt
- [ ] Anti-Fraud-Mechanismen geprüft

### ⛏️ Mining-System Checks (falls relevant)
- [ ] Phase-Check implementiert (Alpha/Beta vs Launch)
- [ ] Tageslimits eingehalten
- [ ] Simulation-Mode für frühe Phasen
- [ ] Anti-Fraud-Validierungen aktiv

### 🧪 Testing
- [ ] Unit Tests geschrieben
- [ ] Integration Tests bestanden
- [ ] E2E Tests durchgeführt
- [ ] Manual Testing dokumentiert

### 📚 Dokumentation
- [ ] Code-Kommentare hinzugefügt
- [ ] API-Dokumentation aktualisiert
- [ ] README aktualisiert (falls nötig)
- [ ] Changelog aktualisiert
```

## 🚀 Deployment Workflow

### CI/CD Pipeline Rules
```yaml
# ✅ RICHTIG - GitHub Actions Workflow
name: BSN CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Security Scan
        run: |
          # Check for secrets
          git secrets --scan --recursive
          # Dependency security check
          npm audit --audit-level=high
          pip-audit --requirement requirements.txt

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
      
      - name: Run tests
        run: |
          python manage.py test
          coverage run --source='.' manage.py test
          coverage report --fail-under=80
      
      - name: Mining System Tests
        run: |
          # Specific tests for critical mining system
          python manage.py test mining.tests.MiningPhaseTests
          python manage.py test mining.tests.AntiFramdTests

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: |
          npm run test:unit
          npm run test:integration
          npm run test:e2e

  deployment:
    needs: [security-scan, backend-tests, frontend-tests]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Production
        run: |
          # Deployment script with health checks
          ./scripts/deploy.sh
```

### Environment Management
```python
# ✅ RICHTIG - Environment-basierte Konfiguration
import os
from pathlib import Path

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable must be set")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost').split(',')

# Database configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'bsn_db'),
        'USER': os.environ.get('DB_USER', 'bsn_user'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# BSN-specific configuration
BSN_CONFIG = {
    'MINING_ENABLED': os.environ.get('MINING_ENABLED', 'false').lower() == 'true',
    'CURRENT_PHASE': os.environ.get('CURRENT_PHASE', 'alpha'),
    'DAILY_MINING_LIMIT': float(os.environ.get('DAILY_MINING_LIMIT', '10.0')),
    'BASE_MINING_RATE': float(os.environ.get('BASE_MINING_RATE', '0.01')),
    'FAUCET_ENABLED': os.environ.get('FAUCET_ENABLED', 'true').lower() == 'true',
    'FAUCET_AMOUNT': float(os.environ.get('FAUCET_AMOUNT', '1.0')),
}

# ❌ FALSCH - Hardcoded values
SECRET_KEY = 'django-insecure-hardcoded-key'  # NEVER!
DEBUG = True  # Not in production!
```

## 📋 Code Review Checkliste

### Mandatory Review Items
```markdown
## 🔍 Code Review Checklist

### Allgemeine Code-Qualität
- [ ] Code folgt BSN Naming Conventions
- [ ] Funktionen sind kleiner als 50 Zeilen
- [ ] Klassen haben klare Verantwortlichkeiten
- [ ] Error Handling implementiert
- [ ] Logging für wichtige Operationen

### Security Review
- [ ] Keine hardcoded Secrets oder API Keys
- [ ] Input Validation für alle User Inputs
- [ ] SQL Injection Prevention (ORM verwendet)
- [ ] XSS Prevention (kein innerHTML mit User Data)
- [ ] CSRF Protection für Forms
- [ ] Rate Limiting für API Endpoints
- [ ] Proper Authentication/Authorization

### BSN-spezifische Checks
- [ ] Mining-Phase-Checks implementiert wo relevant
- [ ] Keine echten Token-Ausgaben in Alpha/Beta Phase
- [ ] Anti-Fraud-Mechanismen berücksichtigt
- [ ] Tageslimits eingehalten
- [ ] Simulation-Mode für frühe Phasen

### Performance
- [ ] Keine N+1 Queries
- [ ] Database Queries optimiert
- [ ] Caching implementiert wo sinnvoll
- [ ] Bundle Size berücksichtigt (Frontend)
- [ ] Lazy Loading implementiert

### Testing
- [ ] Unit Tests für neue Funktionen
- [ ] Integration Tests für API Endpoints
- [ ] Mock-Tests für externe Dependencies
- [ ] Test Coverage > 80%

### Documentation
- [ ] Code-Kommentare für komplexe Logik
- [ ] API-Dokumentation aktualisiert
- [ ] README-Updates falls nötig
- [ ] Migration-Anweisungen dokumentiert
```

## 🔧 Development Environment Setup

### Required Tools & Versions
```bash
# ✅ RICHTIG - Entwicklungsumgebung Setup
# Python Backend
python --version  # 3.11+
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Node.js Frontend
node --version  # 18+
npm --version   # 9+
npm install

# Database
postgresql --version  # 14+
redis-server --version  # 7+

# Development Tools
git --version
docker --version
docker-compose --version

# Code Quality Tools
black --version      # Code formatting
flake8 --version     # Linting
mypy --version       # Type checking
bandit --version     # Security scanning
```

### Local Development Commands
```bash
# ✅ RICHTIG - Development Commands
# Backend Setup
python manage.py migrate
python manage.py collectstatic
python manage.py createsuperuser
python manage.py runserver

# Frontend Setup
npm install
npm run dev

# Testing
python manage.py test
npm run test
npm run test:e2e

# Code Quality
black .
flake8 .
mypy .
bandit -r .

# Security Checks
python manage.py check --deploy
npm audit
git secrets --scan

# Database Management
python manage.py makemigrations
python manage.py migrate
python manage.py dbshell
```

## 🎯 Task Management & Agent Coordination

### Task Priority Matrix
```
HIGH PRIORITY (SOFORT):
- Security Vulnerabilities
- Mining System Bugs (wenn aktiv)
- User Authentication Issues
- Data Loss Prevention
- Performance Issues (>5s load time)

MEDIUM PRIORITY (DIESE WOCHE):
- Feature Implementations
- UI/UX Improvements
- API Optimizations
- Code Refactoring
- Documentation Updates

LOW PRIORITY (NÄCHSTE SPRINT):
- Code Cleanup
- Dependency Updates
- Nice-to-have Features
- Performance Optimizations (<2s improvement)
```

### Agent Task Assignment
```python
# ✅ RICHTIG - Automatische Task-Zuweisung basierend auf Expertise
AGENT_TASK_MAPPING = {
    "ProjectManager": [
        "project_planning",
        "sprint_coordination", 
        "milestone_tracking",
        "risk_management"
    ],
    
    "DataAnalyst": [
        "mining_rate_analysis",
        "user_behavior_analysis",
        "tokenomics_modeling",
        "fraud_pattern_detection"
    ],
    
    "DataEngineer": [
        "database_optimization",
        "mining_pipeline_implementation",
        "data_migration",
        "etl_processes"
    ],
    
    "SoftwareDeveloper": [
        "frontend_development",
        "backend_api_development",
        "web3_integration",
        "bug_fixes"
    ],
    
    "TesterQA": [
        "test_planning",
        "bug_testing",
        "security_testing",
        "performance_testing",
        "mining_system_validation"
    ],
    
    "UIUXDesigner": [
        "interface_design",
        "user_experience_optimization",
        "design_system_maintenance",
        "prototype_creation"
    ],
    
    "SoftwareArchitect": [
        "system_architecture",
        "technology_decisions",
        "scalability_planning",
        "code_review_critical"
    ],
    
    "DevOpsAgent": [
        "deployment_automation",
        "infrastructure_management",
        "monitoring_setup",
        "security_hardening"
    ],
    
    "DocumentationAgent": [
        "api_documentation",
        "user_guides",
        "technical_documentation",
        "changelog_maintenance"
    ],
    
    "Researcher": [
        "technology_research",
        "best_practices_research",
        "security_research",
        "blockchain_trends"
    ]
}
```

### Cross-Agent Communication Protocol
```python
# ✅ RICHTIG - Inter-Agent Communication
class TaskBoard:
    """Central task management for multi-agent coordination."""
    
    def create_task(self, title, description, assigned_agent, priority="medium"):
        """Create new task with automatic agent notification."""
        task = {
            'id': generate_task_id(),
            'title': title,
            'description': description,
            'assigned_agent': assigned_agent,
            'priority': priority,
            'status': 'todo',
            'created_at': datetime.now(),
            'dependencies': [],
            'blockers': []
        }
        
        # Notify assigned agent
        self.notify_agent(assigned_agent, task)
        
        return task
    
    def escalate_task(self, task_id, reason):
        """Escalate blocked task to ProjectManager."""
        task = self.get_task(task_id)
        
        escalation = {
            'original_task': task,
            'escalation_reason': reason,
            'escalated_at': datetime.now(),
            'requires_attention': True
        }
        
        self.notify_agent('ProjectManager', escalation)
    
    def complete_task(self, task_id, completion_notes):
        """Mark task as complete and notify dependent agents."""
        task = self.get_task(task_id)
        task['status'] = 'completed'
        task['completed_at'] = datetime.now()
        task['completion_notes'] = completion_notes
        
        # Notify dependent tasks
        dependent_tasks = self.get_dependent_tasks(task_id)
        for dep_task in dependent_tasks:
            self.notify_agent(dep_task['assigned_agent'], {
                'type': 'dependency_resolved',
                'task': dep_task
            })
```

## ⚠️ Development DON'Ts

### NIEMALS während Entwicklung:
```python
# ❌ NIEMALS - Direct Production DB Changes
UPDATE users SET mining_balance = 1000000;  # DANGEROUS!

# ❌ NIEMALS - Debugging Code in Production
print("DEBUG: User data:", user.password)  # Info leak!
logger.debug(f"Secret key: {settings.SECRET_KEY}")  # NEVER!

# ❌ NIEMALS - Ungetestete Migrations
class Migration(migrations.Migration):
    operations = [
        migrations.RunSQL("DROP TABLE users;")  # WITHOUT BACKUP!
    ]

# ❌ NIEMALS - Hardcoded Environment-specific Values
if request.META['HTTP_HOST'] == 'localhost:8000':  # Environment coupling!

# ❌ NIEMALS - Unvalidated External Inputs
user_input = request.POST['content']
Post.objects.create(content=user_input)  # XSS risk!

# ❌ NIEMALS - Blocking Operations in Views
def slow_view(request):
    time.sleep(30)  # Blocks entire server!
    return Response({'status': 'done'})
```

## ✅ Development Success Metrics

### Daily Checks (Automated)
- [ ] All Tests passing (Backend & Frontend)
- [ ] Security Scan clean
- [ ] Performance metrics within bounds
- [ ] No critical bugs in production
- [ ] Mining system functioning (if active)

### Weekly Reviews
- [ ] Code Review feedback addressed
- [ ] Documentation updated
- [ ] Performance optimizations identified
- [ ] Security patches applied
- [ ] Agent coordination efficiency reviewed

### Sprint Goals (2 Wochen)
- [ ] All planned features delivered
- [ ] Technical debt addressed
- [ ] Mining system improvements (if active phase)
- [ ] User feedback incorporated
- [ ] Next phase preparation completed

**Diese Entwicklungsregeln sind bindend und stellen sicher, dass BSN professionell und fehlerfrei entwickelt wird!** 