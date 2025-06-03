import os
import pathlib
import json
import sys
import openai
from openai import OpenAI
from dotenv import load_dotenv
import logging
logging.basicConfig(filename="gpt_notescheme.log", level=logging.INFO, format="%(asctime)s - %(message)s")
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
import base64

prompt_path = pathlib.Path(__file__).resolve().parent / ".." / "assets" / "get_exam_metadata_prompt.txt"
with open(prompt_path, "r", encoding="utf-8") as f:
    prompt_txt = f.read()

image_path = sys.argv[1]
with open(image_path, "rb") as f:
    image_bytes = f.read()
raw_b64 = base64.b64encode(image_bytes).decode("utf-8")
image_b64 = f"data:image/png;base64,{raw_b64}"
print(f"📏 Base64 length: {len(image_b64)}", file=sys.stderr)

MAX_RETRY = 3

def call_gpt(image_b64, prompt_txt):
    for attempt in range(MAX_RETRY):
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                { "role": "system", "content": prompt_txt },
                {
                    "role": "user",
                    "content": [
                        { "type": "image_url", "image_url": { "url": image_b64 } }
                    ]
                }
            ],
            temperature=0.2,
            max_tokens=4096
        )

        output = response.choices[0].message.content.strip()
        if output:
            if attempt == 0:
                logging.info("📤 Mark Scheme Metadata: %s", output)
            return output

import re

parsed = call_gpt(image_b64, prompt_txt)
print(f"🖼️ Image path: {image_path}", file=sys.stderr)
print(f"📥 GPT raw content: {parsed}", file=sys.stderr)

match = re.search(r'\{[\s\S]*\}', parsed)
if match:
    json_str = match.group(0)
    try:
        parsed_obj = json.loads(json_str)
        print(json.dumps(parsed_obj))
    except json.JSONDecodeError:
        print("❌ GPT returned invalid JSON", file=sys.stderr)
        sys.exit(1)
else:
    print("❌ No JSON object found in GPT response", file=sys.stderr)
    sys.exit(1)
