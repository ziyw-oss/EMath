

import sys
import pdfplumber
import json

if len(sys.argv) < 3:
    print(json.dumps({ "error": "Missing arguments: pdf_path and page_index" }))
    sys.exit(1)

pdf_path = sys.argv[1]
page_index = int(sys.argv[2]) - 1  # pdfplumber page index starts at 0

try:
    with pdfplumber.open(pdf_path) as pdf:
        if page_index < 0 or page_index >= len(pdf.pages):
            print(json.dumps({ "error": "Page index out of range" }))
            sys.exit(1)

        page = pdf.pages[page_index]
        text = page.extract_text() or ""
        print(json.dumps({ "text": text }))
except Exception as e:
    print(json.dumps({ "error": str(e) }))
    sys.exit(1)