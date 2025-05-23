import sys
import os
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

import pathlib
prompt_path = pathlib.Path(__file__).resolve().parent / ".." / "assets" / "parse_markscheme_prompt.txt"
with open(prompt_path, "r", encoding="utf-8") as f:
    system_prompt = f.read()


def main():
    
    pdf_path = sys.argv[1]

    if pdf_path.lower().endswith(".png"):
        image_filename = os.path.basename(pdf_path)
        image_page_info = image_filename.replace(".png", "").replace("page_", "")
        image_bytes = open(pdf_path, "rb").read()
        image_b64 = base64.b64encode(image_bytes).decode()
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{image_b64}"
                        }
                    }
                ]}
            ],
            max_tokens=2048
        )
        raw_content = response.choices[0].message.content
        print("📥 GPT raw_content:", file=sys.stderr)
        print(raw_content, file=sys.stderr)
        # 修复 GPT 返回的 Markdown 包裹格式
        if "```json" in raw_content:
            raw_content = re.sub(r"```json|```", "", raw_content).strip()
        
        if not raw_content or not raw_content.strip().startswith("["):
            print(json.dumps({"marks": [], "error": "Empty or invalid JSON"}))
            sys.exit(0)
        try:
            parsed = json.loads(raw_content)
            print(json.dumps({"marks": parsed}))
        except Exception as e:
            print(json.dumps({"marks": [], "error": str(e)}))
        sys.exit(0)



if __name__ == "__main__":
    main()
