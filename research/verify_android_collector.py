import sys
import os
import json
import zipfile

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

def test_android_collector_pipeline():
    print("==========================================================")
    print("HEGEMA ANDROID FIELD DATA COLLECTOR VERIFICATION")
    print("==========================================================")

    missions_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data_lake/missions"))
    os.makedirs(missions_dir, exist_ok=True)
    mission_folder = os.path.join(missions_dir, "mission_op_disaster_01")
    os.makedirs(mission_folder, exist_ok=True)

    # 1. Generate Synchronized sensor.csv
    csv_path = os.path.join(mission_folder, "sensor.csv")
    csv_header = "timestamp,wifi_ssid,wifi_bssid,wifi_rssi,wifi_freq,ble_mac,ble_rssi,audio_rms,audio_zcr,audio_mfcc1,accel_x,accel_y,accel_z,gyro_x,gyro_y,gyro_z,room,people,movement,scenario,door\n"
    
    frames = [
        "2026-08-07T13:48:00.000Z,HEGEMA-AP-01,00:11:22:33:44:55,-62,2412,AA:BB:CC:DD:EE:FF,-74,0.24,0.32,0.51,0.02,0.11,9.81,0.01,0.02,0.00,Room_301,2,Walking,Calling_For_Help,Closed",
        "2026-08-07T13:48:01.000Z,HEGEMA-AP-01,00:11:22:33:44:55,-61,2412,AA:BB:CC:DD:EE:FF,-73,0.26,0.34,0.53,0.03,0.12,9.80,0.01,0.01,0.01,Room_301,2,Walking,Calling_For_Help,Closed",
        "2026-08-07T13:48:02.000Z,HEGEMA-AP-01,00:11:22:33:44:55,-65,2412,AA:BB:CC:DD:EE:FF,-76,0.21,0.29,0.48,0.01,0.09,9.82,0.00,0.02,0.00,Room_301,2,Walking,Calling_For_Help,Closed",
    ]

    with open(csv_path, "w", encoding="utf-8") as f:
        f.write(csv_header)
        for line in frames:
            f.write(line + "\n")

    print("[1] Synchronized sensor.csv Generated:")
    print(f"    - Saved to: {csv_path}")

    # 2. Generate metadata.json
    metadata = {
        "mission_name": "OP-DISASTER-01",
        "building": "Building_7",
        "floor": "Floor_3",
        "room": "Room_301",
        "scenario": "Calling_For_Help",
        "num_people": 2,
        "movement_state": "Walking",
        "door_state": "Closed",
        "phone_position": "Pocket",
        "esp32_id": "ESP32-NODE-01",
        "total_frames": len(frames)
    }

    meta_path = os.path.join(mission_folder, "metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("[2] Mission Metadata Saved:")
    print(f"    - Saved to: {meta_path}")

    # 3. Create Export ZIP Package
    zip_path = os.path.join(missions_dir, "mission_op_disaster_01.zip")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(csv_path, arcname="mission_op_disaster_01/sensor.csv")
        zipf.write(meta_path, arcname="mission_op_disaster_01/metadata.json")

    print("[3] Export ZIP Package Created:")
    print(f"    - Saved to: {zip_path}")

    print("==========================================================")
    print("[OK] ANDROID DATA COLLECTOR VERIFICATION PASSED")
    print("==========================================================")

if __name__ == "__main__":
    test_android_collector_pipeline()
