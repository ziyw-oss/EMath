import sys
import os
import fitz  # PyMuPDF
import re
import json
import openai
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
import base64
import cv2
import pytesseract
from pytesseract import Output




def detect_table_header(image_path):
    img = cv2.imread(image_path)
    d = pytesseract.image_to_data(img, output_type=Output.DICT)

    rows = {}
    for i, line_num in enumerate(d['line_num']):
        if line_num not in rows:
            rows[line_num] = []
        word = d['text'][i].strip().lower()
        if word:
            rows[line_num].append(word)

    first_row = next(iter(rows.values()), [])
    header_keywords = {"question", "scheme", "mark", "ao"}
    matched = sum(1 for word in first_row if any(k in word for k in header_keywords))

    return matched >= 2



def extract_exam_metadata(text):
    lines = text.splitlines()
    meta = {
        "board": "Edexcel",
        "qualification": "A Level",
        "subject": "Mathematics",
        "paper_code": None,
        "paper_name": None,
        "exam_session": None
    }
    for i, line in enumerate(lines):
        if match := re.search(r"9MA0\d{2}", line):
            meta["paper_code"] = match.group(0)
        if "Pure Mathematics Paper" in line:
            meta["paper_name"] = line.strip()
        if re.search(r"(June|January)\s+\d{4}", line):
            meta["exam_session"] = line.strip()
        if i > 20 or all(meta.values()):
            break
    return meta


def main():
    
    pdf_path = sys.argv[1]

    if pdf_path.lower().endswith(".png"):
        image_filename = os.path.basename(pdf_path)
        image_page_info = image_filename.replace(".png", "").replace("page_", "")
        has_header = detect_table_header(pdf_path)
        image_bytes = open(pdf_path, "rb").read()
        image_b64 = base64.b64encode(image_bytes).decode()
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "Extract all scoring points from the provided image in this exact JSON format:\n\n[\n  {\n    \"exam_paper_id\": null,\n    \"question_number\": \"1\",\n    \"label\": \"\",\n    \"level\": \"main\",\n    \"mark_code\": \"M1\",\n    \"mark_content\": \"Attempts either sin(3θ) ≈ 3θ or cos(4θ) ≈ 1 - (4θ)²/2 in 1 - cos(4θ) / (2θsin(3θ))\",\n    \"ao_code\": \"1.1b\",\n    \"explanation\": \"Attempts either sin(3θ) ≈ 3θ or cos(4θ) ≈ 1 - (4θ)²/2 in the given expression. See below for description of marking of cos(4θ).\"\n  },\n  {\n    \"exam_paper_id\": null,\n    \"question_number\": \"12\",\n    \"label\": \"(a)(i)\",\n    \"level\": \"subsub\",\n    \"mark_code\": \"M1\",\n    \"mark_content\": \"Method to find p, e.g. divides 32000 = Ap⁴ by 50000 = Ap¹¹, derives p⁷ = 50000 / 32000 → p = (50000 / 32000)^(1/7)\",\n    \"ao_code\": \"3.1a\",\n    \"explanation\": \"M1: Attempts to use both pieces of information within V = Ap^t, eliminates A correctly and solves an equation of the form p^n = k to reach a value for p. Allow for slips on 32000 and 50000. Accept p = awrt 1.0658.\"\n  },\n  {\n    \"exam_paper_id\": null,\n    \"question_number\": \"12\",\n    \"label\": \"(a)(ii)\",\n    \"level\": \"subsub\",\n    \"mark_code\": \"M1\",\n    \"mark_content\": \"Substitutes their p = 1.0658 into either equation and finds A = 32000 / 1.0658⁴ or A = 50000 / 1.0658¹¹\",\n    \"ao_code\": \"1.1b\",\n    \"explanation\": \"M1: Substitutes p = 1.0658 into either of their equations and finds A. Allow follow-through from incorrect equations from part (i).\"\n  }\n]\n\nLabel and Level rules:\n- question_number is always the outer number, e.g. \"2\", \"11\"\n- label is the subpart or sub-subpart, e.g. \"(a)\", \"(a)(i)\", \"(b)\"\n- level is one of:\n  - \"main\" if no label (i.e. whole question)\n  - \"sub\" if label is like \"(a)\", \"(b)\"\n  - \"subsub\" if label is like \"(a)(i)\", \"(b)(ii)\"\n\nAdditional rules:\n- Do not merge label into question_number. Always keep \"question_number\": \"2\", and \"label\": \"(a)(i)\".\n- Extract note lines (text after '(n marks)') and assign each one to the correct mark point.\n- Match notes to marks by mark_code or label. Do not attach unmatched notes.\n- Return only a JSON array. Do not include any markdown or explanation."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Extract all mark points from this mark scheme page as a JSON array with fields: question_number, label, level, mark_code, mark_content, ao_code."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{image_b64}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=2048
        )
        raw_content = response.choices[0].message.content
        # 修复 GPT 返回的 Markdown 包裹格式
        if "```json" in raw_content:
            raw_content = re.sub(r"```json|```", "", raw_content).strip()
        print(f"📥 GPT raw_content (len={len(raw_content)}):\n{raw_content}", file=sys.stderr)
        if not raw_content or not raw_content.strip().startswith("["):
            print(f"⚠️ Empty or invalid JSON on page {image_page_info}", file=sys.stderr)
            print(json.dumps({"header": detect_table_header(pdf_path), "marks": [], "error": "Empty or invalid JSON"}))
            sys.exit(0)
        try:
            parsed = json.loads(raw_content)
            print(json.dumps({"header": has_header, "marks": parsed}))
        except Exception as e:
            print(json.dumps({"header": has_header, "marks": [], "error": str(e)}))
        sys.exit(0)

    doc = fitz.open(pdf_path)

    first_page_text = doc[0].get_text()
    exam_metadata = extract_exam_metadata(first_page_text)

    # Note: mark point extraction is now handled by GPT Vision API from images
    marks = []

    current_explanation = ""

    for i, page in enumerate(doc):
        print(f"🧠 Sending page {i+1} to GPT Vision...", file=sys.stderr)
        image_bytes = page.get_pixmap(dpi=300).tobytes("png")
        image_b64 = base64.b64encode(image_bytes).decode()
        print("🧠 Awaiting GPT response for", f"page_{i+1}.png")
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": "Extract all scoring points from the provided image in this exact JSON format:\n\n[\n  {\n    \"exam_paper_id\": null,\n    \"question_number\": \"1\",\n    \"label\": \"\",\n    \"level\": \"main\",\n    \"mark_code\": \"M1\",\n    \"mark_content\": \"Attempts either sin(3θ) ≈ 3θ or cos(4θ) ≈ 1 - (4θ)²/2 in 1 - cos(4θ) / (2θsin(3θ))\",\n    \"ao_code\": \"1.1b\",\n    \"explanation\": \"Attempts either sin(3θ) ≈ 3θ or cos(4θ) ≈ 1 - (4θ)²/2 in the given expression. See below for description of marking of cos(4θ).\"\n  },\n  {\n    \"exam_paper_id\": null,\n    \"question_number\": \"12\",\n    \"label\": \"(a)(i)\",\n    \"level\": \"subsub\",\n    \"mark_code\": \"M1\",\n    \"mark_content\": \"Method to find p, e.g. divides 32000 = Ap⁴ by 50000 = Ap¹¹, derives p⁷ = 50000 / 32000 → p = (50000 / 32000)^(1/7)\",\n    \"ao_code\": \"3.1a\",\n    \"explanation\": \"M1: Attempts to use both pieces of information within V = Ap^t, eliminates A correctly and solves an equation of the form p^n = k to reach a value for p. Allow for slips on 32000 and 50000. Accept p = awrt 1.0658.\"\n  },\n  {\n    \"exam_paper_id\": null,\n    \"question_number\": \"12\",\n    \"label\": \"(a)(ii)\",\n    \"level\": \"subsub\",\n    \"mark_code\": \"M1\",\n    \"mark_content\": \"Substitutes their p = 1.0658 into either equation and finds A = 32000 / 1.0658⁴ or A = 50000 / 1.0658¹¹\",\n    \"ao_code\": \"1.1b\",\n    \"explanation\": \"M1: Substitutes p = 1.0658 into either of their equations and finds A. Allow follow-through from incorrect equations from part (i).\"\n  }\n]\n\nLabel and Level rules:\n- question_number is always the outer number, e.g. \"2\", \"11\"\n- label is the subpart or sub-subpart, e.g. \"(a)\", \"(a)(i)\", \"(b)\"\n- level is one of:\n  - \"main\" if no label (i.e. whole question)\n  - \"sub\" if label is like \"(a)\", \"(b)\"\n  - \"subsub\" if label is like \"(a)(i)\", \"(b)(ii)\"\n\nAdditional rules:\n- Do not merge label into question_number. Always keep \"question_number\": \"2\", and \"label\": \"(a)(i)\".\n- Extract note lines (text after '(n marks)') and assign each one to the correct mark point.\n- Match notes to marks by mark_code or label. Do not attach unmatched notes.\n- Return only a JSON array. Do not include any markdown or explanation."
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Extract all mark points from this mark scheme page as a JSON array with fields: question_number, label, level, mark_code, mark_content, ao_code."
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{image_b64}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=2048
        )

        raw_content = response.choices[0].message.content
        print(f"📥 GPT raw_content (len={len(raw_content)}):\n{raw_content}", file=sys.stderr)

        if not raw_content or not raw_content.strip().startswith("["):
            print(f"⚠️ GPT response on page {i+1} is not JSON.", file=sys.stderr)
            # Treat this as explanation-only content
            note_match = re.search(r'(?i)note:([\s\S]+)', raw_content)
            if note_match:
                current_explanation += note_match.group(1).strip()
            else:
                current_explanation += raw_content.strip()
            continue

        note_match = re.search(r'(?i)note:([\s\S]+)', raw_content)

        try:
            parsed = json.loads(raw_content)
            for m in parsed:
                m.setdefault("explanation", "")
            has_marks = any(m.get("level") == "main" for m in parsed if isinstance(m, dict))
            if not has_marks:
                # No scoring content, treat note as explanation only
                if note_match:
                    current_explanation += note_match.group(1).strip()
            else:
                # Distribute note lines to marks based on label or mark_code
                if note_match:
                    note_lines = [line.strip() for line in note_match.group(1).splitlines() if line.strip()]
                    unmatched_lines = []
                    for line in note_lines:
                        matched = False
                        for m in parsed:
                            label = m.get("label", "")
                            mark_code = m.get("mark_code", "")
                            if label and label in line:
                                m["explanation"] = (m.get("explanation", "") + " " + line).strip()
                                matched = True
                                break
                            elif mark_code and mark_code in line:
                                m["explanation"] = (m.get("explanation", "") + " " + line).strip()
                                matched = True
                                break
                        if not matched:
                            unmatched_lines.append(line)
                    if unmatched_lines:
                        # Append unmatched lines to main-level explanation
                        main_marks = [m for m in parsed if m.get("level") == "main"]
                        main_explanation = " ".join(unmatched_lines).strip()
                        for m in main_marks:
                            m["explanation"] = (m.get("explanation", "") + " " + main_explanation).strip()
                for m in parsed:
                    m["page"] = i + 1
                    if m.get("level") == "main" and not m.get("explanation"):
                        m["explanation"] = current_explanation.strip()
                current_explanation = ""
                marks.extend(parsed)
        except Exception as e:
            print(f"⚠️ Failed to parse GPT output on page {i+1}: {e}", file=sys.stderr)

    print(json.dumps({"exam_metadata": exam_metadata, "marks": marks}, indent=2))


if __name__ == "__main__":
    main()
