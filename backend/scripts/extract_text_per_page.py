

import sys
import json
import pdfplumber

def extract_text_per_page(pdf_path):
    texts = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            texts.append(text.strip())
    return texts

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: extract_text_per_page.py <pdf_file_path>", file=sys.stderr)
        sys.exit(1)

    pdf_file = sys.argv[1]
    try:
        page_texts = extract_text_per_page(pdf_file)
        print(json.dumps(page_texts, indent=2))
    except Exception as e:
        print(f"❌ Failed to extract text: {e}", file=sys.stderr)
        sys.exit(1)