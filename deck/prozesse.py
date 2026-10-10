"""Windows-Prozesse für das Arbeits-Cockpit: unsichtbar starten, Konsolenfenster verstecken, sauber beenden.

Nur Standardbibliothek + ctypes. Alles hier ist bewusst vorsichtig:
- Browser, Docker Desktop, Explorer und Windows Terminal werden NIE beendet.
- Versteckt werden nur Konsolenfenster (conhost) aus dem eigenen Prozessbaum und Terminal-Fenster,
  deren Titel genau einem `start "Titel"` aus der gestarteten .bat entspricht.
"""
from __future__ import annotations

import ctypes
import ctypes.wintypes as wt
import re
import socket
import subprocess
import threading
import time
from pathlib import Path

OHNE_FENSTER = getattr(subprocess, "CREATE_NO_WINDOW", 0)
NEUE_KONSOLE = getattr(subprocess, "CREATE_NEW_CONSOLE", 0)

# Diese Programme beendet das Cockpit nie – auch dann nicht, wenn eine .bat sie gestartet hat.
GESCHUETZT = {
    "chrome.exe", "msedge.exe", "comet.exe", "firefox.exe", "brave.exe", "opera.exe", "explorer.exe",
    "docker desktop.exe", "com.docker.backend.exe", "com.docker.build.exe", "com.docker.proxy.exe",
    "wslrelay.exe", "wslhost.exe", "wslservice.exe", "vmmem", "vmmemwsl", "svchost.exe", "system",
    "windowsterminal.exe", "searchhost.exe", "lsass.exe", "csrss.exe", "wininit.exe", "services.exe",
}

_k32 = ctypes.WinDLL("kernel32", use_last_error=True)
_u32 = ctypes.WinDLL("user32", use_last_error=True)


class _PE32(ctypes.Structure):
    _fields_ = [("dwSize", wt.DWORD), ("cntUsage", wt.DWORD), ("th32ProcessID", wt.DWORD),
                ("th32DefaultHeapID", ctypes.c_size_t), ("th32ModuleID", wt.DWORD), ("cntThreads", wt.DWORD),
                ("th32ParentProcessID", wt.DWORD), ("pcPriClassBase", ctypes.c_long), ("dwFlags", wt.DWORD),
                ("szExeFile", ctypes.c_wchar * 260)]


_k32.CreateToolhelp32Snapshot.restype = wt.HANDLE
_k32.CreateToolhelp32Snapshot.argtypes = [wt.DWORD, wt.DWORD]
_k32.Process32FirstW.argtypes = [wt.HANDLE, ctypes.POINTER(_PE32)]
_k32.Process32NextW.argtypes = [wt.HANDLE, ctypes.POINTER(_PE32)]
_k32.CloseHandle.argtypes = [wt.HANDLE]
_k32.OpenProcess.restype = wt.HANDLE
_k32.OpenProcess.argtypes = [wt.DWORD, wt.BOOL, wt.DWORD]
_k32.GetProcessTimes.argtypes = [wt.HANDLE] + [ctypes.POINTER(wt.FILETIME)] * 4
_k32.GetExitCodeProcess.argtypes = [wt.HANDLE, ctypes.POINTER(wt.DWORD)]

_FENSTER_CB = ctypes.WINFUNCTYPE(wt.BOOL, wt.HWND, wt.LPARAM)
_u32.EnumWindows.argtypes = [_FENSTER_CB, wt.LPARAM]
_u32.GetWindowThreadProcessId.argtypes = [wt.HWND, ctypes.POINTER(wt.DWORD)]
_u32.IsWindowVisible.argtypes = [wt.HWND]
_u32.GetWindowTextW.argtypes = [wt.HWND, wt.LPWSTR, ctypes.c_int]
_u32.GetClassNameW.argtypes = [wt.HWND, wt.LPWSTR, ctypes.c_int]
_u32.ShowWindow.argtypes = [wt.HWND, ctypes.c_int]

_UNGUELTIG = ctypes.c_void_p(-1).value


def prozesse() -> dict[int, tuple[int, str]]:
    """Momentaufnahme aller Prozesse: pid -> (eltern-pid, exe-name klein)."""
    snap = _k32.CreateToolhelp32Snapshot(0x2, 0)
    if not snap or snap == _UNGUELTIG:
        return {}
    e = _PE32()
    e.dwSize = ctypes.sizeof(e)
    aus: dict[int, tuple[int, str]] = {}
    try:
        ok = _k32.Process32FirstW(snap, ctypes.byref(e))
        while ok:
            aus[e.th32ProcessID] = (e.th32ParentProcessID, e.szExeFile.lower())
            ok = _k32.Process32NextW(snap, ctypes.byref(e))
    finally:
        _k32.CloseHandle(snap)
    return aus


def startzeit(pid: int) -> int | None:
    """Startzeit eines LEBENDEN Prozesses (FILETIME als Zahl) – None, wenn er nicht (mehr) läuft."""
    h = _k32.OpenProcess(0x1000, False, pid)  # PROCESS_QUERY_LIMITED_INFORMATION
    if not h:
        return None
    try:
        code = wt.DWORD()
        if not _k32.GetExitCodeProcess(h, ctypes.byref(code)) or code.value != 259:  # STILL_ACTIVE
            return None
        c, e, k, u = wt.FILETIME(), wt.FILETIME(), wt.FILETIME(), wt.FILETIME()
        if not _k32.GetProcessTimes(h, ctypes.byref(c), ctypes.byref(e), ctypes.byref(k), ctypes.byref(u)):
            return None
        return (c.dwHighDateTime << 32) | c.dwLowDateTime
    finally:
        _k32.CloseHandle(h)


def nachkommen(wurzeln: dict[int, int], snap: dict[int, tuple[int, str]] | None = None) -> dict[int, int]:
    """Ergänzt {pid: startzeit} um alle Nachkommen. Ein Kind zählt nur, wenn es NACH seinem Elternteil
    gestartet wurde – so wird eine wiederverwendete PID nicht fälschlich eingesammelt."""
    snap = snap if snap is not None else prozesse()
    pids = dict(wurzeln)
    geaendert = True
    while geaendert:
        geaendert = False
        for pid, (eltern, _name) in snap.items():
            if pid in pids or eltern not in pids or pid == eltern:
                continue
            st = startzeit(pid)
            if st is not None and st >= pids[eltern]:
                pids[pid] = st
                geaendert = True
    return pids


# ------------------------------------------------------------------ Fenster
def fenster() -> list[tuple[int, int, str, str]]:
    """Sichtbare Hauptfenster: (hwnd, pid, titel, klasse)."""
    liste: list[tuple[int, int, str, str]] = []

    def cb(h, _l):
        if _u32.IsWindowVisible(h):
            pid = wt.DWORD()
            _u32.GetWindowThreadProcessId(h, ctypes.byref(pid))
            t = ctypes.create_unicode_buffer(300)
            _u32.GetWindowTextW(h, t, 300)
            k = ctypes.create_unicode_buffer(120)
            _u32.GetClassNameW(h, k, 120)
            liste.append((h, pid.value, t.value, k.value))
        return True

    _u32.EnumWindows(_FENSTER_CB(cb), 0)
    return liste


def konsolen_verstecken(pids: set[int], titel: set[str]) -> int:
    """Versteckt Konsolenfenster des eigenen Prozessbaums und Terminal-Fenster mit bekanntem Titel."""
    n = 0
    for h, pid, t, klasse in fenster():
        eigen = klasse == "ConsoleWindowClass" and pid in pids
        bekannt = klasse in ("CASCADIA_HOSTING_WINDOW_CLASS", "ConsoleWindowClass") and t and _titel_passt(t, titel)
        if eigen or bekannt:
            _u32.ShowWindow(h, 0)  # SW_HIDE
            n += 1
    return n


def _titel_passt(t: str, titel: set[str]) -> bool:
    t = t.strip().lower()
    for x in titel:
        x = x.strip().lower()
        if x and (t == x or t.startswith(x + " ") or t.endswith(" " + x) or t.startswith(x + ":")):
            return True
    return False


def titel_aus_bat(pfad: Path) -> set[str]:
    """Fenstertitel, die eine .bat ihren Unterfenstern gibt (`start "Titel" …`)."""
    try:
        text = pfad.read_text("utf-8", errors="replace")
    except OSError:
        return set()
    return {m for m in re.findall(r'(?im)^\s*start\s+"([^"]+)"', text) if not m.lower().startswith("http")}


# ------------------------------------------------------------------ Ports
# Ein Verbindungsversuch auf einen GESCHLOSSENEN Port dauert unter Windows ~0,5–2 s (SYN-Wiederholungen).
# Darum fragt das Cockpit die TCP-Tabelle ab: ein Aufruf, alle lauschenden Ports samt PID, ohne Wartezeit.
_iphlp = ctypes.WinDLL("iphlpapi")
_iphlp.GetExtendedTcpTable.argtypes = [ctypes.c_void_p, ctypes.POINTER(wt.DWORD), wt.BOOL, wt.ULONG, ctypes.c_int, wt.ULONG]
_iphlp.GetExtendedTcpTable.restype = wt.DWORD
_lausch_cache: tuple[float, dict[int, set[int]]] = (0.0, {})
_lausch_lock = threading.Lock()


def _tabelle(familie: int) -> list[tuple[int, int]]:
    groesse = wt.DWORD(0)
    _iphlp.GetExtendedTcpTable(None, ctypes.byref(groesse), False, familie, 3, 0)  # 3 = OWNER_PID_LISTENER
    for _ in range(3):
        puffer = ctypes.create_string_buffer(groesse.value + 4096)
        if _iphlp.GetExtendedTcpTable(puffer, ctypes.byref(groesse), False, familie, 3, 0) == 0:
            break
    else:
        return []
    anzahl = ctypes.cast(puffer, ctypes.POINTER(wt.DWORD))[0]
    # Zeile v4: state, laddr, lport, raddr, rport, pid (6 DWORD) – v6: 16+4+4+16+4+4+4+4 Byte
    zeile, port_off, pid_off = (24, 8, 20) if familie == socket.AF_INET else (56, 20, 52)
    roh = ctypes.string_at(ctypes.addressof(puffer) + 4, anzahl * zeile)
    aus = []
    for i in range(anzahl):
        b = i * zeile
        port = int.from_bytes(roh[b + port_off:b + port_off + 2], "big")
        pid = int.from_bytes(roh[b + pid_off:b + pid_off + 4], "little")
        aus.append((port, pid))
    return aus


def lauschend(max_alter: float = 1.0) -> dict[int, set[int]]:
    """{port: {pid, …}} aller lauschenden TCP-Ports (IPv4 + IPv6), kurz zwischengespeichert."""
    global _lausch_cache
    with _lausch_lock:
        if time.time() - _lausch_cache[0] < max_alter:
            return _lausch_cache[1]
        ports: dict[int, set[int]] = {}
        for fam in (socket.AF_INET, socket.AF_INET6):
            for port, pid in _tabelle(fam):
                ports.setdefault(port, set()).add(pid)
        _lausch_cache = (time.time(), ports)
        return ports


def port_offen(port: int) -> bool:
    return port in lauschend()


def port_pids(port: int) -> set[int]:
    """PIDs, die auf dem Port lauschen."""
    return {p for p in lauschend(0).get(port, set()) if p > 4}


# ------------------------------------------------------------------ Beenden
def beenden(pids: set[int], snap: dict[int, tuple[int, str]] | None = None) -> list[str]:
    """Beendet die PIDs einzeln (kein /T – sonst stürben auch Browser, die eine .bat geöffnet hat)."""
    snap = snap if snap is not None else prozesse()
    beendet = []
    for pid in sorted(pids, reverse=True):
        name = snap.get(pid, (0, ""))[1]
        if not name or name in GESCHUETZT or pid in (0, 4):
            continue
        r = subprocess.run(["taskkill", "/F", "/PID", str(pid)], capture_output=True, timeout=10, creationflags=OHNE_FENSTER)
        if r.returncode == 0:
            beendet.append(f"{name} ({pid})")
    return beendet


def port_baum(port: int) -> set[int]:
    """Lauscher auf dem Port samt Nachkommen und – falls es nur eine cmd-Hülle ist – deren cmd-Elternteil."""
    snap = prozesse()
    wurzeln: dict[int, int] = {}
    for pid in port_pids(port):
        st = startzeit(pid)
        if st is None:
            continue
        wurzeln[pid] = st
        eltern, _ = snap.get(pid, (0, ""))
        if snap.get(eltern, (0, ""))[1] == "cmd.exe":
            est = startzeit(eltern)
            if est is not None and est <= st:
                wurzeln[eltern] = est
    return set(nachkommen(wurzeln, snap))


# ------------------------------------------------------------------ Lauf eines Programms
class Lauf:
    """Ein gestartetes Programm: Wurzelprozess, eingesammelte Nachkommen, Fensterwächter."""

    def __init__(self, proc: subprocess.Popen, titel: set[str], verstecken: bool):
        self.proc = proc
        self.gestartet = time.time()
        st = startzeit(proc.pid)
        self.pids: dict[int, int] = {proc.pid: st} if st else {}
        self.titel = titel
        self.verstecken = verstecken
        self.versteckt = 0
        self._lock = threading.Lock()
        threading.Thread(target=self._waechter, daemon=True).start()

    def _waechter(self) -> None:
        # 45 s eng: neue Konsolenfenster sofort verstecken; danach 10 min locker Nachkommen einsammeln.
        ende_eng, ende = self.gestartet + 45, self.gestartet + 600
        while time.time() < ende:
            snap = prozesse()
            with self._lock:
                # tote PIDs fallen heraus, damit eine wiederverwendete PID keine fremden Kinder „erbt“
                self.pids = {p: s for p, s in nachkommen(self.pids, snap).items() if p in snap and startzeit(p) == s}
                pids = set(self.pids)
            eng = time.time() < ende_eng
            if self.verstecken and eng:
                self.versteckt += konsolen_verstecken(pids, self.titel)
            if not pids and not eng:
                return
            time.sleep(0.2 if eng else 3)

    def lebende(self) -> set[int]:
        with self._lock:
            return {p for p, s in self.pids.items() if startzeit(p) == s}

    def rueckgabe(self) -> int | None:
        return self.proc.poll()
