import os
from PIL import Image
import glob

print("Starting WebP conversion...")
directory = r"c:\Users\jugar\OneDrive\Documents\Web_Designs\Deploy-Monster-main\public\tutorial-images"
images = glob.glob(os.path.join(directory, "*.jpg"))

for img_path in images:
    try:
        with Image.open(img_path) as img:
            webp_path = os.path.splitext(img_path)[0] + ".webp"
            img.save(webp_path, "webp", quality=85)
            print(f"Converted {os.path.basename(img_path)} -> {os.path.basename(webp_path)}")
    except Exception as e:
        print(f"Error converting {img_path}: {e}")

print("Done!")
