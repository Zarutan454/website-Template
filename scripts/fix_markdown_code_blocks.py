#!/usr/bin/env python3
"""
Skript zur Korrektur von Markdown-Code-Blöcken in API_ENDPOINTS.md
Behebt häufige Markdown-Linting-Warnungen
"""

import re
import sys
from pathlib import Path

def fix_markdown_code_blocks(file_path):
    """Korrigiert Code-Blöcke in Markdown-Dateien"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. HTTP-Endpunkte mit ```http markieren
    content = re.sub(
        r'```\n(POST|GET|PUT|PATCH|DELETE)\s+/api/v1/',
        r'```http\n\1 /api/v1/',
        content
    )
    
    # 2. JSON-Blöcke nach Request-Body/Response mit ```json markieren
    content = re.sub(
        r'(\*\*Request-Body:\*\*)\n```\n',
        r'\1\n\n```json\n',
        content
    )
    
    content = re.sub(
        r'(\*\*Response.*:\*\*)\n```\n',
        r'\1\n\n```json\n',
        content
    )
    
    # 3. Fehlerformat-Blöcke mit ```json markieren
    content = re.sub(
        r'```\n\{\s*"success":\s*false',
        r'```json\n{\n  "success": false',
        content
    )
    
    # 4. Rate-Limit-Header mit ```http markieren
    content = re.sub(
        r'```\nX-RateLimit-Limit:',
        r'```http\nX-RateLimit-Limit:',
        content
    )
    
    # 5. Paginierung-Format mit ```json markieren
    content = re.sub(
        r'```\n\{\s*"pagination":',
        r'```json\n{\n  "pagination":',
        content
    )
    
    # 6. Webhook-Konfiguration mit ```json markieren
    content = re.sub(
        r'```\n\{\s*"url":',
        r'```json\n{\n  "url":',
        content
    )
    
    # 7. Alle anderen leeren Code-Blöcke mit ```text markieren
    content = re.sub(
        r'```\n([^`]+?)\n```',
        lambda m: f'```text\n{m.group(1)}\n```' if not m.group(1).strip().startswith('{') else f'```json\n{m.group(1)}\n```',
        content
    )
    
    # 8. Spezielle Fälle für verschiedene Code-Typen
    patterns = [
        # HTTP-Header
        (r'```\nAuthorization:', r'```http\nAuthorization:'),
        (r'```\nContent-Type:', r'```http\nContent-Type:'),
        
        # URL-Beispiele
        (r'```\nhttps?://', r'```text\n'),
        
        # E-Mail-Adressen
        (r'```\n[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', r'```text\n'),
        
        # Token-Beispiele
        (r'```\neyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9', r'```text\neyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9'),
    ]
    
    for pattern, replacement in patterns:
        content = re.sub(pattern, replacement, content)
    
    # 9. Leerzeilen vor Code-Blöcken hinzufügen
    content = re.sub(
        r'(\*\*[^*]+:\*\*)\n```',
        r'\1\n\n```',
        content
    )
    
    # 10. Konsistente Formatierung für JSON
    content = re.sub(
        r'```json\n\{([^}]+)\}',
        lambda m: f'```json\n{{\n  {m.group(1).strip()}\n}}',
        content
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ {file_path} wurde erfolgreich korrigiert!")

if __name__ == "__main__":
    file_path = Path("docs/architecture/API_ENDPOINTS.md")
    
    if not file_path.exists():
        print(f"❌ Datei {file_path} nicht gefunden!")
        sys.exit(1)
    
    fix_markdown_code_blocks(file_path) 