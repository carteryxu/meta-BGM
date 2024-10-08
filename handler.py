from flask import Flask, Response, stream_with_context
from flask_cors import CORS
import torch
from transformers import AutoProcessor, MusicgenForConditionalGeneration
import itertools

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

processor = AutoProcessor.from_pretrained("facebook/musicgen-large")
model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-large")

prompts = ["A mellow jazz trio with soft piano, gentle upright bass, and subtle brush drums playing in a dimly lit cafe on a rainy evening, creating a sense of warmth and comfort.",
           "Slow, soothing jazz with a deep, resonant saxophone melody, accompanied by a light guitar and a gentle, steady drumbeat, evoking the cozy feeling of sitting by the fireplace.",
           "A smooth, late-night jazz piece with a soft trumpet, relaxed bassline, and delicate cymbals, perfect for winding down in a quiet, candle-lit room.",
           "Warm jazz featuring a soft piano melody with hints of nostalgia, a smooth double bass, and soft drums, reminiscent of a cozy evening spent indoors, escaping the cold outside.",
           "A comforting jazz ballad with a rich, soulful saxophone lead, laid-back guitar chords, and light, rhythmic brushes on drums, creating the feeling of curling up with a good book in a cozy, quiet space."
]

@app.route('/generate-music')
def generate_music():
    def generate():
        # Infinite cycle of prompts to create diverse and interesting music 
        prompt_cycle = itertools.cycle(prompts)
        while True:
            current_prompt = next(prompt_cycle)
            inputs = processor(
                text=[current_prompt],
                padding=True,
                return_tensors="pt"
            )

            #do_sample: Uses sampling for more random inputs, better and more diverse music
            #guidance_scale: Controls the amount of adherence to the given prompts
            audio_values = model.generate(**inputs, do_sample=True, guidance_scale=3, max_new_tokens=256)
            #file format
            audio_data = audio_values[0].numpy().tobytes()
            #save function state and returns audio_data to caller
            yield audio_data

    #Response object that streams audio (.wav file) generated by generate function (content_type can also be mimetype)
    response = Response(stream_with_context(generate()), content_type="audio/wav")
    response.headeres.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == '__main__':
    app.run(debug=True)
        
