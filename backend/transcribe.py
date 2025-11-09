# pip install openai-whisper
# Run PowerShell as Administrator
# choco install ffmpeg
# python transcribe.py

import whisper

# Load model (first time downloads ~150MB, then cached)
print("Loading model...")
model = whisper.load_model("base")

# Transcribe your MP4
print("Transcribing...")
result = model.transcribe("xsd-xfmx-sug (2025-11-08 17_50 GMT-6).mp4")

# Print the full transcript
print("\n" + "="*50)
print("TRANSCRIPT:")
print("="*50)
print(result["text"])

# Save to a text file
with open("transcript.txt", "w") as f:
    f.write(result["text"])
    
print("\nSaved to transcript.txt!")