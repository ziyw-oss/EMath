from pdf2image import convert_from_path
import os
import sys

pdf_path = sys.argv[1]
output_dir = sys.argv[2]
os.makedirs(output_dir, exist_ok=True)

images = convert_from_path(pdf_path, dpi=200)
for i, img in enumerate(images):
    img.save(os.path.join(output_dir, f"page_{i + 1}.png"), "PNG")

print(f"✅ Saved {len(images)} pages to '{output_dir}'")