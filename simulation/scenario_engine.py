import math
import random
from typing import Dict, Any, List

class ScenarioSimulationEngine:
    """
    Disaster Scenario Generator & Timeline Simulation Engine.
    Generates synthetic earthquake collapse presets, survivor trajectories, and sensor noise.
    """
    def __init__(self):
        self.time_step = 0
        self.scenarios = ["earthquake_collapse", "moving_survivors", "isolated_acoustic_taps"]

    def step_simulation(self, scenario_name: str = "moving_survivors", rows: int = 15, cols: int = 20) -> Dict[str, Any]:
        """
        Steps the simulation forward in time, calculating moving survivor trajectory
        and dynamic probability heatmap.
        """
        self.time_step += 1
        t = self.time_step

        # Trajectory trajectory: Room 101 -> Corridor A -> Room 105
        if t < 5:
            target_r, target_c = 3, 4 # Room 101
            current_room = "Room 101"
        elif t < 12:
            progress = (t - 5) / 7.0
            target_r = 8
            target_c = int(4 + progress * 10) # Corridor A movement
            current_room = "Main Corridor"
        else:
            target_r, target_c = 12, 14 # Room 105
            current_room = "Room 105"

        grid = []
        for r in range(rows):
            row_vals = []
            for c in range(cols):
                dist_sq = (r - target_r) ** 2 + (c - target_c) ** 2
                noise = random.uniform(-0.02, 0.02)
                prob = max(0.0, min(0.98, math.exp(-dist_sq / 8.0) + noise))
                row_vals.append(round(prob, 3))
            grid.append(row_vals)

        time_labels = ["10:00 AM", "10:05 AM", "10:10 AM", "10:15 AM"]
        current_time_str = time_labels[min(3, t // 4)]

        return {
            "time_step": t,
            "timestamp_str": current_time_str,
            "scenario": scenario_name,
            "current_zone": current_room,
            "grid_matrix": grid,
            "simulated_features": {
                "wifi_rssi_norm": round(max(0.2, min(0.9, 0.8 - (dist_sq * 0.01))), 2),
                "ble_rssi_norm": round(max(0.3, min(0.95, 0.9 - (dist_sq * 0.02))), 2),
                "audio_db_norm": 0.85 if t % 3 == 0 else 0.2,
                "imu_vibration_norm": 0.6 if t % 2 == 0 else 0.1,
                "distance_est_norm": round(min(1.0, math.sqrt(dist_sq) / 20.0), 2)
            }
        }
