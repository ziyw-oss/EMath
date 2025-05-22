from pdf2image import convert_from_path
import os

pdf_path = "/Users/arthurwang/Projects/EMath/pastpapers/June 2018 QP.pdf"

output_dir = "pages"
os.makedirs(output_dir, exist_ok=True)

images = convert_from_path(pdf_path, dpi=200)
for i, img in enumerate(images):
    img.save(f"{output_dir}/page_{i + 1}.png", "PNG")

print(f"✅ Saved {len(images)} pages to '{output_dir}'")