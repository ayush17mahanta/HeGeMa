import os
import shutil
import glob

def find_and_copy_apk():
    temp_dir = os.path.expanduser("~\\AppData\\Local\\Temp")
    apks = glob.glob(os.path.join(temp_dir, "**", "app-debug.apk"), recursive=True)
    
    dest = os.path.expanduser("~\\Downloads\\HEGEMA_Rescue_Collector.apk")
    
    if apks:
        src = apks[0]
        shutil.copy2(src, dest)
        size_mb = os.path.getsize(dest) / (1024 * 1024)
        print("==========================================================")
        print("[SUCCESS] APK Binary Copied to Downloads Folder!")
        print(f"File Path : {dest}")
        print(f"File Size : {size_mb:.2f} MB")
        print("==========================================================")
    else:
        print("[ERROR] APK file not found in temp directory.")

if __name__ == "__main__":
    find_and_copy_apk()
