# HEGEMA Repository Mock Data & State Inconsistency Audit Report

**Date**: August 12, 2026  
**Audit Objective**: Identify all remaining hardcoded mock state, component contradictions, and state drift across Navbar, Sidebar, FloorPlan, and Hardware views.

---

## 1. Second-Pass Audit Inventory

| File Path | Line(s) | Contradictory / Hardcoded Value | Classification | Action Plan |
| :--- | :--- | :--- | :--- | :--- |
| `frontend/src/components/Navbar.tsx` | L14 | `const [timerSeconds, setTimerSeconds] = useState(5078)` (`01:24:38`) | Auto-Running Timer | Default to `00:00:00`. Timer starts ONLY when `missionStatus === "ACTIVE"`. Derived from `missionStartedAt`. |
| `frontend/src/components/Navbar.tsx` | L76 | `28.6139° N, 77.2090° E` | Hardcoded Fallback GPS | Remove fixed Delhi coordinates. Display `LOCATION NOT AVAILABLE` unless physical GPS payload is received. |
| `frontend/src/components/Navbar.tsx` | L102–L103 | `⚡ 98%`, `🧠 EDGE LOCAL` | Manufactured Header Metric | Replace with `LOCAL BACKEND ● ONLINE (PORT 8000)` derived from authoritative backend state. |
| `frontend/src/components/Sidebar.tsx` | L116 | `MISSION ACTIVE` | Hardcoded Sidebar State | Render from `missionStatus`. Default to `MISSION IDLE`. |
| `frontend/src/components/Sidebar.tsx` | L117 | `Building 7 · Floor 3` | Implied Mission Context | Relabel as `SELECTED MAP: Building 7 · Floor 3`. Decouple map selection from active mission status. |
| `frontend/src/components/Sidebar.tsx` | L186–L190 | `ESP32 Node ● LIVE`, `AI Model Zoo ● LIVE` | Contradictory Live Badges | Render `ESP32 Nodes: 0 ONLINE` and `AI Model Zoo: LOADED / READY`. |
| `frontend/src/views/Hardware.tsx` | L28, L45 | `6 / 6 Active ESP32 Nodes` | Hardcoded Hardware Table | Bind directly to `verified_devices` array from `SystemRuntimeState`. Render `0 Nodes Online` when OFFLINE. |

---

## 2. 5 Distinct System States Model

1. **Backend State**: `ONLINE (PORT 8000)` vs `OFFLINE`.
2. **Hardware State**: `ESP32 OFFLINE (0 Nodes)` vs `1+ ESP32 ONLINE`.
3. **Mission State**: `MISSION IDLE` vs `WAITING FOR HARDWARE` vs `MISSION ACTIVE` vs `PAUSED` vs `STOPPED`.
4. **AI Inference State**: `AI MODEL LOADED` vs `AI INFERENCE ACTIVE` vs `IDLE`.
5. **Location State**: `LOCATION NOT AVAILABLE` vs `GPS (Physical)` vs `SIMULATION`.

Opening HEGEMA defaults to:
- `Backend`: `ONLINE`
- `Hardware`: `OFFLINE`
- `Mission`: `IDLE`
- `Timer`: `00:00:00`
- `AI Model`: `READY / LOADED`
- `Location`: `NOT AVAILABLE`
