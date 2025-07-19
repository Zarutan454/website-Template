import re

with open('docs/architecture/API_ENDPOINTS.md', 'r', encoding='utf-8') as f:
    lines = f.readlines()

out = []
inside_code = False
code_lang = ''
for i, line in enumerate(lines):
    # Entferne überflüssige Leerzeichen am Zeilenende
    line = line.rstrip() + '\n'
    # Sprachangabe für Codeblöcke ergänzen
    if line.strip().startswith('```'):
        if not inside_code:
            # Start eines Codeblocks
            inside_code = True
            code_lang = ''
            if line.strip() == '```':
                # Versuche Sprache zu erkennen
                next_line = lines[i+1] if i+1 < len(lines) else ''
                if next_line.strip().startswith('{') or next_line.strip().startswith('['):
                    line = '```json\n'
                elif next_line.strip().startswith('POST') or next_line.strip().startswith('GET') or next_line.strip().startswith('PATCH') or next_line.strip().startswith('DELETE'):
                    line = '```http\n'
                else:
                    line = '```text\n'
            else:
                code_lang = line.strip()[3:]
        else:
            # Ende eines Codeblocks
            inside_code = False
            code_lang = ''
    # Zeilenumbruch für zu lange Zeilen (außer in Codeblöcken)
    if not inside_code and len(line) > 120:
        while len(line) > 120:
            idx = line.rfind(' ', 0, 120)
            if idx == -1:
                idx = 120
            out.append(line[:idx] + '\n')
            line = line[idx+1:]
    out.append(line)

# Doppelte Leerzeilen entfernen
final = []
empty = False
for line in out:
    if line.strip() == '':
        if not empty:
            final.append(line)
        empty = True
    else:
        final.append(line)
        empty = False

# Nach jeder Überschrift, Liste, Tabelle und Codeblock eine Leerzeile einfügen
result = []
for i, line in enumerate(final):
    result.append(line)
    # Nach Überschrift
    if re.match(r'^#{2,6} ', line) and (i+1 < len(final) and final[i+1].strip() != ''):
        result.append('\n')
    # Nach Codeblock
    if line.strip().startswith('```') and (i+1 < len(final) and final[i+1].strip() != ''):
        result.append('\n')
    # Nach Liste
    if line.strip().startswith('- ') and (i+1 < len(final) and final[i+1].strip() != ''):
        result.append('\n')
    # Nach Tabelle
    if '|' in line and (i+1 < len(final) and final[i+1].strip() != '') and line.count('|') > 1:
        result.append('\n')

# Am Ende der Datei eine Leerzeile
if result[-1].strip() != '':
    result.append('\n')

with open('docs/architecture/API_ENDPOINTS.md', 'w', encoding='utf-8') as f:
    f.writelines(result) 