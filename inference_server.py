import asyncio
import websockets
import torch
from transformers import AutoProcessor, MusicgenForConditionalGeneration
import io
import soundfile as sf
import numpy as npweb
import pydub

# Load MusicGen model
processor = AutoProcessor.from_pretrained("facebook/musicgen-large")
model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-large")

prompts = [
    "A mellow jazz trio with soft piano, gentle upright bass, and subtle brush drums playing in a dimly lit cafe on a rainy evening, creating a sense of warmth and comfort.",
    "Slow, soothing jazz with a deep, resonant saxophone melody, accompanied by a light guitar and a gentle, steady drumbeat, evoking the cozy feeling of sitting by the fireplace.",
    "A smooth, late-night jazz piece with a soft trumpet, relaxed bassline, and delicate cymbals, perfect for winding down in a quiet, candle-lit room.",
    "Warm jazz featuring a soft piano melody with hints of nostalgia, a smooth double bass, and soft drums, reminiscent of a cozy evening spent indoors, escaping the cold outside.",
    "A comforting jazz ballad with a rich, soulful saxophone lead, laid-back guitar chords, and light, rhythmic brushes on drums, creating the feeling of curling up with a good book in a cozy, quiet space."
]

async def generate_music():
    prompt = np.random.choice(prompts)
    inputs = processor(text=[prompt], padding=True, return_tensors="pt")
    audio_values = model.generate(**inputs, do_sample=True, guidance_scale=3, max_new_tokens=256)
    audio_data = audio_values[0, 0].cpu().numpy()
    
    # Convert to float32 and normalize
    audio_data = audio_data.astype(np.float32)
    audio_data /= np.max(np.abs(audio_data))
    
    # Convert to WAV
    buffer = io.BytesIO()
    sf.write(buffer, audio_data, samplerate=32000, format='wav')
    buffer.seek(0)
    
    # Convert WAV to MP3
    audio = pydub.AudioSegment.from_wav(buffer)
    mp3_buffer = io.BytesIO()
    audio.export(mp3_buffer, format="mp3")
    return mp3_buffer.getvalue()

async def websocket_handler(websocket, path):
    try:
        async for message in websocket:
            if message == "generate":
                mp3_data = await generate_music()
                await websocket.send(mp3_data)
    except websockets.exceptions.ConnectionClosed:
        pass

start_server = websockets.serve(websocket_handler, "localhost", 8765)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()