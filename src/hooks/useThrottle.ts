
import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom Hook für Throttling von Funktionsaufrufen
 * 
 * Throttling begrenzt die Ausführungshäufigkeit einer Funktion, indem sichergestellt wird,
 * dass sie nur einmal innerhalb eines festgelegten Zeitrahmens aufgerufen wird.
 * 
 * @param fn Die zu drosselnde Funktion
 * @param delay Die Verzögerung in Millisekunden (standardmäßig 300ms)
 * @returns Die gedrosselte Funktion
 */
export const useThrottle = <T extends (...args: unknown[]) => unknown>(
  fn: T, 
  delay = 300
): ((...args: Parameters<T>) => void) => {
  const lastExecutedRef = useRef<number>(0);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const fnRef = useRef<T>(fn);
  const argsRef = useRef<Parameters<T> | null>(null);
  
  // Aktualisieren der Funktionsreferenz, wenn sich die Funktion ändert
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  // Bereinigung des Timeouts bei Unmount der Komponente
  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastExecution = now - lastExecutedRef.current;

    // Aktualisiere die letzten Argumente für einen möglichen späteren Aufruf
    argsRef.current = args;

    // Wenn noch keine Ausführung stattgefunden hat oder die Verzögerungszeit verstrichen ist
    if (timeSinceLastExecution >= delay) {
      // Aktualisieren des Zeitstempels der letzten Ausführung
      lastExecutedRef.current = now;
      
      // Ausführen der Funktion mit den gegebenen Argumenten
      fnRef.current(...args);
      
      // Aufräumen eines möglicherweise ausstehenden Timeouts
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    } else if (!timeoutIdRef.current) {
      // Wenn die letzte Ausführung zu kurz zurückliegt und kein Timeout gesetzt ist,
      // planen wir die Ausführung am Ende des Verzögerungszeitraums
      const timeToWait = delay - timeSinceLastExecution;
      
      timeoutIdRef.current = setTimeout(() => {
        lastExecutedRef.current = Date.now();
        // Verwende die zuletzt übergebenen Argumente für den verzögerten Aufruf
        if (argsRef.current) {
          fnRef.current(...argsRef.current);
        }
        timeoutIdRef.current = null;
        argsRef.current = null; // Bereinige die Argumente nach Verwendung
      }, timeToWait);
    }
  }, [delay]);
};
