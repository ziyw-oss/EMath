import os
import sys
import json
from pdf2image import convert_from_path
import openai
from PIL import Image
from typing import List
from dotenv import load_dotenv
import base64
import fitz  # PyMuPDF

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")
client = openai.OpenAI()

def pdf_to_images(pdf_path: str, output_dir: str) -> List[str]:
    os.makedirs(output_dir, exist_ok=True)
    images = convert_from_path(pdf_path, dpi=200, poppler_path="/opt/homebrew/bin")
    image_paths = []

    for i, img in enumerate(images):
        img_path = os.path.join(output_dir, f"page_{i+1}.png")
        img.save(img_path, "PNG")
        image_paths.append(img_path)

    return image_paths

def ask_gpt_vision(image_path: str) -> dict:
    with open(image_path, "rb") as f:
        image_bytes = f.read()

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text":
                        "Please extract all math exam questions from this Edexcel A-level question paper page image.\n\nFor each question and sub-question (even without text or marks), return:\n- question_number (e.g., \"2\")\n- level: one of \"main\" or \"sub\"\n- label: e.g., \"2\", \"(a)\"\n- marks: number or null\n- question_text: a string, preserving all original line breaks, containing all relevant text (can be empty if no visible content)\n\n📌 Sub-question rules:\n- If a sub-question (e.g., (a)) contains recognisable sub-parts like (i), (ii), etc., **do not split them** — keep them embedded in the `question_text` field.\n- If there is content between two sub-questions (e.g., between (a) and (b)) that is not labeled as a new part, allocate it contextually to the **most relevant** sub-question based on position and meaning.\n\n📌 Output format:\n[\n  {\n    \"question_number\": \"2\",\n    \"level\": \"sub\",\n    \"label\": \"(a)\",\n    \"marks\": 3,\n    \"question_text\": \"(i) Show that ...\\n(ii) Hence find ...\\n[extra contextual text]\"\n  },\n  {\n    \"question_number\": \"2\",\n    \"level\": \"sub\",\n    \"label\": \"(b)\",\n    \"marks\": 2,\n    \"question_text\": \"...\"\n  }\n]\n\nDo not skip any question, even if it includes diagrams, graphs, or formulas.\nExtract all mathematical instructions, assumptions, and visible mathematical expressions.\nTreat diagrams and associated text as part of the relevant question or sub-question.\nOnly return a raw JSON array of question objects. Do not include any explanation, markdown, or commentary."
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{base64.b64encode(image_bytes).decode()}"
                        }
                    }
                ]
            }
        ],
        max_tokens=1024
    )
    return response.choices[0].message.content

def extract_metadata_from_pdf(pdf_path: str) -> dict:
    doc = fitz.open(pdf_path)
    first_page = doc.load_page(0)
    text = first_page.get_text()
    doc.close()

    metadata = {}
    if "Edexcel" in text:
        metadata["board"] = "Edexcel"
    if "GCE" in text or "A Level" in text:
        metadata["qualification"] = "A Level"
    if "Mathematics" in text:
        metadata["subject"] = "Mathematics"
    if "Paper 1" in text:
        metadata["paper_name"] = "Pure Mathematics Paper 1"
    if "9MA0" in text:
        metadata["paper_code"] = "9MA0/01"
    import re
    match = re.search(r"(January|June|October|November) \d{4}", text)
    if match:
        metadata["exam_session"] = match.group(0)
    return metadata

def main(pdf_path: str, output_json_path: str):
    image_dir = os.path.join(os.path.dirname(output_json_path), "pages")
    image_paths = pdf_to_images(pdf_path, image_dir)

    all_questions = []
    for path in image_paths:
        print(f"🔍 Parsing {os.path.basename(path)}...")
        result = ask_gpt_vision(path).strip()
        if result.startswith("```json") or result.startswith("```"):
            result = result.strip("` \n")
            result = result.partition("\n")[2].rsplit("```", 1)[0].strip()
        if not result:
            print(f"⚠️ GPT returned empty result for {os.path.basename(path)}")
            continue
        if not result.lstrip().startswith("["):
            print(f"⚠️ GPT did not return JSON array on {os.path.basename(path)}:\n{result}\n")
            continue
        try:
            questions = json.loads(result)
        except json.JSONDecodeError as e:
            # Try to fix invalid \ escape sequences in LaTeX
            print(f"⚠️ Trying to fix invalid escapes in GPT response for {os.path.basename(path)}...")
            import re
            safe_result = re.sub(r'(?<!\\)\\(?![\\/"bfnrtu])', r'\\\\', result)
            try:
                questions = json.loads(safe_result)
            except Exception as e2:
                print(f"❌ Still failed to parse after fix: {e2}\n{result}")
                continue

        # Restore LaTeX double backslash after JSON parsing
        for q in questions:
            qt = q.get("question_text")
            if isinstance(qt, str):
                q["question_text"] = qt.replace('\\\\', '\\')
        all_questions.extend(questions)

    # 1. Remove "continued" items
    all_questions = [q for q in all_questions if q.get("question_text", "").strip().lower() != "continued"]

    # 2. Normalize question_number if it contains letters (e.g., "10a")
    for q in all_questions:
        if isinstance(q.get("question_number"), str) and q["question_number"].isdigit() == False:
            digits = ''.join(filter(str.isdigit, q["question_number"]))
            letters = ''.join(filter(str.isalpha, q["question_number"]))
            if digits and letters and q.get("label") in [None, ""]:
                q["question_number"] = digits
                q["label"] = letters

    # 3. Clean marks to be integers or null
    for q in all_questions:
        if isinstance(q.get("marks"), str):
            marks_str = q["marks"].strip("() ")
            q["marks"] = int(marks_str) if marks_str.isdigit() else None

    # 2 (continued). Ensure subsub level items include question_number and parent_label
    # Build a mapping from (question_number, label) to question for sub-levels
    sub_questions = {}
    for q in all_questions:
        if q.get("level") == "sub":
            key = (q.get("question_number"), q.get("label"))
            sub_questions[key] = q

    # 2 (updated): Ensure subsub level items include parent_label based on proximity
    last_sub = {}
    for q in all_questions:
        if q.get("level") == "sub":
            key = q.get("question_number")
            last_sub[key] = q.get("label")
        elif q.get("level") == "subsub":
            key = q.get("question_number")
            if not q.get("parent_label"):
                q["parent_label"] = last_sub.get(key)

    # 4. Check for missing main questions
    seen = set()
    for q in all_questions:
        qn = q.get("question_number")
        if qn is not None:
            # Only consider digits as question_number for main level
            if q.get("level") == "main":
                seen.add(str(qn))
    missing = [str(i) for i in range(1, 15) if str(i) not in seen]
    if missing:
        print("⚠️ Missing question_number(s):", missing)

    # 5. Warn for any main/sub question where question_text appears truncated or empty
    for q in all_questions:
        if q.get("level") in ("main", "sub"):
            qt = q.get("question_text", "").strip()
            if not qt or qt.lower().startswith("continued") or qt.endswith("..."):
                print(f"⚠️ Question {q.get('question_number')} label {q.get('label')} may have truncated or empty question_text.")

    # 6. Remove duplicate raw LaTeX following a rendered block
    import re
    for q in all_questions:
        qt = q.get("question_text", "")
        if isinstance(qt, str):
            # Keep first \[...\], drop any raw LaTeX like \frac or \sqrt following it
            q["question_text"] = re.sub(r"(\\\[.*?\\\])\s+(\\[a-zA-Z]+\{.*?\})", r"\1", qt, flags=re.DOTALL)

    metadata = extract_metadata_from_pdf(pdf_path)

    with open(output_json_path, "w", encoding="utf-8") as f:
        json.dump({
            "exam_metadata": metadata,
            "questions": all_questions
        }, f, indent=2, ensure_ascii=False)

    print(f"✅ Extracted {len(all_questions)} questions to {output_json_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python parse_qp.py <PDF_PATH> [output.json]")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else "output_vision_qp.json"
    main(pdf_path, output_path)