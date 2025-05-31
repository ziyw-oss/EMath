import pathlib
import sys
import os
import re
import json
from openai import OpenAI
from dotenv import load_dotenv
import logging
logging.basicConfig(filename="gpt_notescheme.log", level=logging.INFO, format="%(asctime)s - %(message)s")
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
import base64
import cv2
import pytesseract
from pytesseract import Output

image_path = sys.argv[1]


prompt_path = pathlib.Path(__file__).resolve().parent / ".." / "assets" / "gpt_prompt_notescheme.txt"
with open(image_path, "rb") as f:
    image_bytes = f.read()
image_b64 = base64.b64encode(image_bytes).decode("utf-8")

with open(prompt_path, "r", encoding="utf-8") as f:
    prompt_txt = f.read()

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
                        { "type": "text", "text": "Please extract structured explanation marks from the image below." },
                        { "type": "image_url", "image_url": { "url": f"data:image/png;base64,{image_b64}" } }
                    ]
                }
            ],
            temperature=0.2,
            max_tokens=4096
        )

        output = response.choices[0].message.content.strip()
        if output:
            if attempt == 0:
                logging.info("📤 GPT raw response: %s", output)
            return output

parsed = call_gpt(image_b64, prompt_txt)
print(parsed)