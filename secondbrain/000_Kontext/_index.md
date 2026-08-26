---
type: index
tags: [kontext, index]
---

# 000_Kontext — mit wem die Academy spricht

Hier steht, **in welcher Welt** die Menschen stehen, die diese Academy benutzen. Ein Ordner je Zugangsebene. Was hier liegt, geht bei jeder Tutor-Frage als Kontext an das Sprachmodell.

| Ordner | Ebene im Programm | Wer das ist |
|---|---|---|
| `admin` | `admin` | Betrieb der Plattform |
| `schule` | `verwaltung` | Schulleitung, Direktorat |
| `lehrer` | `lehrer` | Unterrichtende |
| `eltern` | `eltern` | Erziehungsberechtigte |
| `schueler` | `schueler` | Lernende, etwa 10 bis 18 |

## Warum das hier liegt und nicht im Programm

Weil es sich ändert, ohne dass jemand programmieren können muss. Eine Schule, an der anders gesprochen wird, ändert eine Textdatei in diesem Ordner — und die Tutoren reden anders. Kein Neustart, kein Code.

Gelesen wird das von `pu_ebenen_kontext()` in `srv/profil.php`.

## Was hineingehört

- Wer diese Menschen sind und was sie hierher führt
- Was sie schon können und was sie typischerweise falsch verstehen
- Welche Fragen wirklich kommen — auch die, die niemand ausspricht
- In welchem Ton man mit ihnen redet, und was man ihnen **nie** sagt

## Was nicht hineingehört

- **Keine echten Personendaten.** Keine Namen von Schülern, keine Klassenlisten, keine Adressen. Der Text geht an ein Sprachmodell.
- **Keine Lösungen** zu Aufgaben.
- **Keine Anweisungen an das Modell** („antworte immer mit…"). Der Kontext sagt, *wo* jemand steht — was ein Tutor tun soll, steht in `prompts/`.

## Grenze

Etwa 3.500 Zeichen je Ebene, dann wird gekappt. Der Kontext ist die Begleitmusik, nicht das Stück: ohne Grenze wächst er mit jeder abgelegten Datei und schiebt irgendwann die eigentliche Lektion aus dem Fenster.

Dateien werden alphabetisch gelesen — was zuerst kommt, überlebt die Kappung.
