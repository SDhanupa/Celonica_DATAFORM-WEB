from PIL import Image
import os

image_path = 'public/hero-image.png'
if not os.path.exists(image_path):
    print(f"Error: {image_path} not found.")
    exit(1)

img = Image.open(image_path)
width, height = img.size

# Crop top 14% (roughly 215 pixels on a 1536px tall image)
crop_pixels = int(height * 0.14)

# crop(left, upper, right, lower)
cropped_img = img.crop((0, crop_pixels, width, height))
cropped_img.save('public/hero-image.png')

print(f"Original size: {width}x{height}")
print(f"Cropped {crop_pixels} pixels from top. New size: {cropped_img.size}")
