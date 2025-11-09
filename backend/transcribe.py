# pip install openai-whisper
# Run PowerShell as Administrator
# choco install ffmpeg
# python transcribe.py

import whisper
import PyPDF2
import os

def transcribe_video(file_path):
    print("Loading Whisper model...")
    model = whisper.load_model("base")
    
    print("Transcribing video...")
    result = model.transcribe(file_path, verbose=True)
    return result["text"]

def extract_pdf_text(file_path):
    print("Extracting text from PDF...")
    text = ""
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page_num, page in enumerate(pdf_reader.pages, 1):
            print(f"Processing page {page_num}/{len(pdf_reader.pages)}")
            text += page.extract_text() + "\n\n"
    return text

# Main script
file_path = input("Enter the path to your file (MP4 or PDF): ")

# Check file extension
if file_path.lower().endswith('.mp4'):
    text = transcribe_video(file_path)
elif file_path.lower().endswith('.pdf'):
    text = extract_pdf_text(file_path)
else:
    print("Unsupported file type! Please use .mp4 or .pdf")
    exit()

# Display and save results
print("\n" + "="*50)
print("EXTRACTED TEXT:")
print("="*50)
print(text)

# Save to file
output_name = file_path.rsplit('.', 1)[0] + "_extracted.txt"
with open(output_name, "w", encoding="utf-8") as f:
    f.write(text)
    
print(f"\nSaved to {output_name}!")