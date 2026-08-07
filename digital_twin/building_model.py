from typing import Dict, Any, List

class DigitalTwinBuildingModel:
    """
    Digital Twin Building Floor Plan Model Parser & Geometry Manager.
    Manages walls, rooms, grid cells, and rescue entry points.
    """
    def __init__(self, building_name: str = "Tactical Building 01"):
        self.building_name = building_name
        self.grid_rows = 15
        self.grid_cols = 20

    def get_floor_plan_metadata(self) -> Dict[str, Any]:
        """Returns floor plan metadata, wall boundaries, and room labels."""
        return {
            "building_name": self.building_name,
            "floor_level": 1,
            "grid_dimensions": {"rows": self.grid_rows, "cols": self.grid_cols},
            "rooms": [
                {"id": "room_101", "name": "Room 101", "bounds": {"r_min": 1, "r_max": 6, "c_min": 1, "c_max": 8}},
                {"id": "corridor_a", "name": "Main Corridor", "bounds": {"r_min": 7, "r_max": 9, "c_min": 1, "c_max": 18}},
                {"id": "room_102", "name": "Room 102 (Collapsed)", "bounds": {"r_min": 10, "r_max": 14, "c_min": 1, "c_max": 8}},
                {"id": "room_105", "name": "Room 105 (Occupied Zone)", "bounds": {"r_min": 10, "r_max": 14, "c_min": 10, "c_max": 18}}
            ],
            "entry_points": [{"x": 0, "y": 8, "name": "Alpha Entry Team Door"}]
        }
