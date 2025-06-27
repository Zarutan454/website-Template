
#!/bin/bash
# Dieses Skript führt die Unit-Tests für das Projekt aus

echo "###################################################"
echo "#           Start der Test-Ausführung             #"
echo "###################################################"

echo "Ausführen der Unit-Tests mit Vitest..."
npx vitest run

echo "###################################################"
echo "#           Start des Coverage-Reports            #"
echo "###################################################"

echo "Ausführen der Tests mit Coverage..."
npx vitest run --coverage

echo "###################################################"
echo "#         Test-Ausführung abgeschlossen           #"
echo "###################################################"
