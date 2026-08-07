import os
import subprocess
import shutil
import time

def build_and_export_apk():
    print("==========================================================")
    print("BUILDING HEGEMA FLUTTER RESCUE COLLECTOR APK")
    print("Using: Gradle 8.7 (cached) + AGP 8.3.2 + System JDK")
    print("==========================================================")

    flutter_bat = r"C:\Users\Hunardeep Kaur\Downloads\flutter_windows_3.44.9-stable\flutter\bin\flutter.bat"
    app_dir = r"C:\Users\Hunardeep Kaur\Downloads\HEGEMA\flutter_app"
    dest_apk = os.path.join(app_dir, "HEGEMA_Rescue_Collector.apk")

    # Don't override JAVA_HOME - let Flutter handle it
    env = os.environ.copy()

    cmd = [flutter_bat, "build", "apk", "--debug", "--android-skip-build-dependency-validation"]
    print(f"Executing: {' '.join(cmd)}")
    
    proc = subprocess.Popen(cmd, cwd=app_dir, env=env, 
                           stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                           encoding='utf-8', errors='replace')
    
    output = []
    for line in proc.stdout:
        print(line, end='')
        output.append(line)
    
    proc.wait()
    print(f"\nExit code: {proc.returncode}")

    # Search for the APK
    print("\nSearching for app-debug.apk...")
    
    # Check standard Flutter output path
    standard = os.path.join(app_dir, "build", "app", "outputs", "flutter-apk", "app-debug.apk")
    if os.path.exists(standard):
        shutil.copy2(standard, dest_apk)
        size_mb = os.path.getsize(dest_apk) / (1024 * 1024)
        print(f"SUCCESS! APK at: {dest_apk} ({size_mb:.2f} MB)")
        return
    
    # Check temp directory
    temp_dir = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Temp")
    for root, dirs, files in os.walk(temp_dir):
        for f in files:
            if f == "app-debug.apk":
                src = os.path.join(root, f)
                size = os.path.getsize(src)
                if size > 1000000:  # > 1MB = real APK
                    shutil.copy2(src, dest_apk)
                    print(f"SUCCESS! Found APK at: {src}")
                    print(f"Copied to: {dest_apk} ({size / 1024 / 1024:.2f} MB)")
                    return

    # Search entire user profile
    user = os.path.expanduser("~")
    for root, dirs, files in os.walk(user):
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules', 'AppData']]
        for f in files:
            if f == "app-debug.apk":
                src = os.path.join(root, f)
                size = os.path.getsize(src)
                if size > 1000000:
                    shutil.copy2(src, dest_apk)
                    print(f"SUCCESS! Found APK at: {src}")
                    print(f"Copied to: {dest_apk} ({size / 1024 / 1024:.2f} MB)")
                    return

    print("[FAIL] No APK found.")

if __name__ == "__main__":
    build_and_export_apk()
