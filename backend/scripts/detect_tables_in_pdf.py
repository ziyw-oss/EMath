import pdfplumber
import json
import sys
import os

if len(sys.argv) < 2:
    print("Usage: python detect_tables_in_pdf.py <path_to_pdf>")
    sys.exit(1)

pdf_path = sys.argv[1]
if not os.path.exists(pdf_path):
    print(f"❌ PDF not found: {pdf_path}")
    sys.exit(1)

pages_status = []

with pdfplumber.open(pdf_path) as pdf:
    for i, page in enumerate(pdf.pages):
        page_status = {"page": i + 1, "has_table": False, "has_header": False}
        tables = page.extract_tables()
        if tables and any(len(row) > 1 for table in tables for row in table):
            page_status["has_table"] = True
            first_table = tables[0]
            # New header detection logic
            if first_table and first_table[0]:
                header_row = [cell.lower() if isinstance(cell, str) else "" for cell in first_table[0]]
                print(f"🧪 Page {i+1} table header:", header_row)
                raw_header_line = "".join(header_row).replace(" ", "")
                if all(k in raw_header_line for k in ["question", "scheme", "mark", "ao"]):
                    page_status["has_header"] = True
        print(f"📄 Page {i+1}: has_table={page_status['has_table']}, has_header={page_status['has_header']}")
        pages_status.append(page_status)

output_path = os.path.join(os.getcwd(), "tmp/pages_with_tables.json")
os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, "w") as f:
    json.dump({"pages": pages_status}, f, indent=2)

print(f"✅ Analyzed {len(pages_status)} pages.")
print(f"💾 Output written to {output_path}")