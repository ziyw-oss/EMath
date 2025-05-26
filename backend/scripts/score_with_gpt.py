import sys
import os
import json
import base64
from openai import OpenAI
from dotenv import load_dotenv
import pathlib
import re
from PIL import Image
import io
from datetime import datetime

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

log_file_path = pathlib.Path(__file__).resolve().parent / "py_stderr.log"

def log_stderr(message: str):
    timestamp = datetime.now().isoformat()
    with open(log_file_path, "a") as f:
        f.write(f"[{timestamp}] {message.strip()}\n")

rules_path = pathlib.Path(__file__).resolve().parent / ".." / "assets" / "scoring_rules.txt"
with open(rules_path, "r", encoding="utf-8") as f:
    scoring_rules = f.read()

task_template_path = pathlib.Path(__file__).resolve().parent / ".." / "assets" / "scoring_prompt.txt"
with open(task_template_path, "r", encoding="utf-8") as f:
    task_template = f.read()

system_prompt = scoring_rules.strip() + "\n\n" + task_template.strip()

def main():
    def fix_base64_padding(b64: str) -> str:
        return b64 + '=' * (-len(b64) % 4)

    def ensure_png_base64(b64_str):
        try:
            image_data = base64.b64decode(b64_str)
            image = Image.open(io.BytesIO(image_data))
            buffer = io.BytesIO()
            image.convert("RGB").save(buffer, format="PNG")
            return base64.b64encode(buffer.getvalue()).decode("utf-8")
        except Exception as e:
            print("❌ Failed to re-encode image to PNG:", str(e), file=sys.stderr)
            log_stderr("❌ Failed to re-encode image to PNG: " + str(e))
            return b64_str  # fallback

    if sys.stdin.isatty():
        print(json.dumps({"error": "No input provided via stdin"}))
        log_stderr(json.dumps({"error": "No input provided via stdin"}))
        sys.exit(1)

    input_str = sys.stdin.read()
    try:
        data = json.loads(input_str)
    except Exception as e:
        print(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
        log_stderr(json.dumps({"error": f"Invalid JSON input: {str(e)}"}))
        sys.exit(1)

    question_text = data.get("questionText", "")
    reference = data.get("referenceAnswer", "")
    guidance = data.get("guidance", "")
    student_text = data.get("studentText", "")
    original_student_images = data.get("studentImagePaths", [])

    valid_student_images = []
    for idx, image_path in enumerate(original_student_images):
        try:
            if not os.path.exists(image_path):
                print(f"❌ student_image[{idx}] path not found or inaccessible: {image_path}", file=sys.stderr)
                log_stderr(f"❌ student_image[{idx}] path not found or inaccessible: {image_path}")
                log_stderr("📥 Received studentImagePaths: " + json.dumps(original_student_images))
                continue
            with open(image_path, "rb") as f:
                raw = f.read()
            b64 = base64.b64encode(raw).decode()
            print(f"✅ student_image[{idx}] raw base64 length: {len(b64)}", file=sys.stderr)
            log_stderr(f"✅ student_image[{idx}] raw base64 length: {len(b64)}")
            encoded = ensure_png_base64(b64)
            print(f"✅ student_image[{idx}] re-encoded base64 length: {len(encoded)}", file=sys.stderr)
            log_stderr(f"✅ student_image[{idx}] re-encoded base64 length: {len(encoded)}")
            valid_student_images.append(encoded)
        except Exception as e:
            print(f"❌ Failed to process student_image[{idx}]:", str(e), file=sys.stderr)
            log_stderr(f"❌ Failed to process student_image[{idx}]: {str(e)}")
    student_images = valid_student_images

    question_image_path = data.get("questionImagePath", "")
    print("🖼️ Raw image paths received:", file=sys.stderr)
    log_stderr("==== Received Image Paths ====")
    log_stderr("🖼️ Raw image paths received:")
    print(f"  questionImagePath = {question_image_path}", file=sys.stderr)
    log_stderr(f"  questionImagePath = {question_image_path}")
    print(f"  studentImages (original) = {original_student_images}", file=sys.stderr)
    log_stderr(f"  studentImages (original) = {original_student_images}")
    print(f"  studentImages (resolved paths) = {student_images}", file=sys.stderr)
    log_stderr(f"  studentImages (resolved paths) = {student_images}")
    log_stderr("==== End Image Path Logging ====")

    question_image = ""
    if question_image_path and os.path.exists(question_image_path):
        with open(question_image_path, "rb") as f:
            image_bytes = f.read()
            question_image = base64.b64encode(image_bytes).decode()
    else:
        print("⚠️ Question image path invalid or not provided:", question_image_path, file=sys.stderr)
        log_stderr("⚠️ Question image path invalid or not provided: " + question_image_path)

    # apply re-encoding to PNG base64 for question_image and student_images
    question_image = ensure_png_base64(question_image)
    student_images = [ensure_png_base64(img) for img in student_images]

    # Debug output for final Base64 lengths
    print("🧾 Final Base64 lengths:", file=sys.stderr)
    log_stderr("🧾 Final Base64 lengths:")
    print("  question_image base64 length:", len(question_image) if question_image else "None", file=sys.stderr)
    log_stderr("  question_image base64 length: " + (str(len(question_image)) if question_image else "None"))
    print("  student_images base64 lengths:", [len(img) for img in student_images] if student_images else "None", file=sys.stderr)
    log_stderr("  student_images base64 lengths: " + (str([len(img) for img in student_images]) if student_images else "None"))

    mark_points = data.get("markPoints", [])

    image_blocks = []
    if question_image:
        image_blocks.append({
            "type": "image_url",
            "image_url": { "url": f"data:image/png;base64,{question_image}" }
        })
    if student_images:
        image_blocks.extend([
            { "type": "image_url", "image_url": { "url": f"data:image/png;base64,{img}" } }
            for img in student_images
        ])

    messages = [
        { "role": "system", "content": system_prompt },
        {
            "role": "user",
            "content": [
                { "type": "text", "text": f"Question:\n{question_text}" },
                *image_blocks[:1],
                { "type": "text", "text": f"Student Answer:\n{student_text}" },
                *image_blocks[1:],
                { "type": "text", "text": "Marking Points with Guidance:" },
                { "type": "text", "text": json.dumps(mark_points, indent=2, ensure_ascii=False) },
                { "type": "text", "text": "Please return JSON: {\"score\": number, \"reason\": string}" }
            ]
        }
    ]

    print("🖼️ Debug - Images to GPT:", file=sys.stderr)
    log_stderr("🖼️ Debug - Images to GPT:")
    print(f"  Question image: {'Yes' if question_image else 'No'}", file=sys.stderr)
    log_stderr(f"  Question image: {'Yes' if question_image else 'No'}")
    print(f"  Student images: {len(student_images)}", file=sys.stderr)
    log_stderr(f"  Student images: {len(student_images)}")

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        max_tokens=2048
    )

    raw_content = response.choices[0].message.content
    print("📥 GPT raw_content:", file=sys.stderr)
    log_stderr("📥 GPT raw_content:")
    print(raw_content, file=sys.stderr)
    log_stderr(raw_content)
    print("🧾 GPT response preview (first 300 chars):", raw_content[:300], file=sys.stderr)
    log_stderr("🧾 GPT response preview (first 300 chars): " + raw_content[:300])

    if "```json" in raw_content:
        raw_content = re.sub(r"```json|```", "", raw_content).strip()

    try:
        result = json.loads(raw_content)
        score = result.get("score")
        matched = result.get("matched", [])
        reason = result.get("reason", "No reason provided")
        student_analysis = result.get("studentImageAnalysis", [])

        # Helper function to decide if studentImageAnalysis is invalid
        def is_analysis_invalid(analysis):
            if not analysis:
                return True
            joined = " ".join(analysis).lower()
            return any(keyword in joined for keyword in ["blank", "no content", "empty", "unreadable", "missing", "unclear"])

        # Retry up to 3 times if studentImageAnalysis is missing, empty, or contains invalid keywords
        MAX_RETRIES = 3
        attempt = 0

        while is_analysis_invalid(student_analysis):
            if attempt >= MAX_RETRIES:
                print(json.dumps({
                    "score": 0,
                    "matched": [],
                    "reason": "❌ Image content is missing or invalid. No credit awarded.",
                    "studentImageAnalysis": ["⚠️ GPT did not detect valid math content in the uploaded image."]
                }))
                exit(0)

            attempt += 1
            print(f"🔁 Retry attempt {attempt} due to invalid studentImageAnalysis...", file=sys.stderr)
            log_stderr(f"🔁 Retry attempt {attempt} due to invalid studentImageAnalysis...")

            retry_response = client.chat.completions.create(
                model="gpt-4o",
                messages=messages,
                max_tokens=2048
            )
            raw_content = retry_response.choices[0].message.content
            print("📥 [RETRY] GPT raw_content:", file=sys.stderr)
            log_stderr("📥 [RETRY] GPT raw_content:")
            print(raw_content, file=sys.stderr)
            log_stderr(raw_content)

            if "```json" in raw_content:
                raw_content = re.sub(r"```json|```", "", raw_content).strip()

            try:
                result = json.loads(raw_content)
                score = result.get("score", 0)
                matched = result.get("matched", [])
                reason = result.get("reason", "No reason provided")
                student_analysis = result.get("studentImageAnalysis", [])
            except Exception as e:
                print(f"❌ [RETRY {attempt}] Error parsing GPT output:", raw_content, file=sys.stderr)
                log_stderr(f"❌ [RETRY {attempt}] Error parsing GPT output: " + raw_content)
                print(json.dumps({
                    "score": None,
                    "matched": [],
                    "reason": str(e)
                }))
                exit(0)

        print(json.dumps({
            "score": score,
            "matched": matched,
            "reason": reason,
            "studentImageAnalysis": student_analysis
        }))
    except Exception as e:
        print("❌ Error parsing GPT output:", raw_content, file=sys.stderr)
        log_stderr("❌ Error parsing GPT output: " + raw_content)
        print(json.dumps({
            "score": 0,
            "matched": [],
            "reason": f"❌ Invalid GPT response format: {str(e)}",
            "studentImageAnalysis": ["⚠️ GPT response was not valid JSON."]
        }))

if __name__ == "__main__":
    main()
