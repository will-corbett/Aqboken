"""
Voices every text in audio-tts/wanted.tsv that has no file yet, as public/audio/tts/<key>.mp3, with Piper and the Kazakh
voice kk_KZ-issai-high (trained on ISSAI's KazakhTTS2, CC BY 4.0; voice files MIT). Run by `npm run audio:tts`.

Needs: pip install piper-tts lameenc, and the voice files in PIPER_VOICE_DIR (see README). espeak-ng's data dir must
have a short path (it fails on long ones), so it is copied next to the voice.

Usage: python scripts/tts.py <voice-dir>
"""
import os
import shutil
import sys
import wave
from io import BytesIO
from pathlib import Path

import lameenc
import piper
from piper import PiperVoice, SynthesisConfig

SPEAKER = 4  # ISSAI_KazakhTTS2_F1. Changing it means bumping VOICE in src/shared/audio.ts.
voice_dir = Path(sys.argv[1] if len(sys.argv) > 1 else os.environ.get('PIPER_VOICE_DIR', 'data-raw/piper'))
esd = voice_dir / 'esd'
if not esd.exists():
    shutil.copytree(Path(piper.__file__).parent / 'espeak-ng-data', esd)
root = Path(__file__).resolve().parent.parent
wanted_file = root / 'audio-tts' / 'wanted.tsv'
out = root / 'public' / 'audio' / 'tts'
out.mkdir(parents=True, exist_ok=True)
# Stay in the voice directory: espeak-ng is loaded on first use, from the short relative path.
os.chdir(voice_dir)
voice = PiperVoice.load('kk_KZ-issai-high.onnx', espeak_data_dir='esd')

rows = [line.split('\t', 1) for line in wanted_file.read_text(encoding='utf-8').splitlines() if line]
todo = [(k, t) for k, t in rows if not (out / f'{k}.mp3').exists()]
print(f'{len(rows)} texts, {len(todo)} to voice', flush=True)
for i, (key, text) in enumerate(todo, 1):
    buf = BytesIO()
    with wave.open(buf, 'wb') as w:
        voice.synthesize_wav(text, w, SynthesisConfig(speaker_id=SPEAKER))
    buf.seek(0)
    with wave.open(buf, 'rb') as w:
        rate, pcm = w.getframerate(), w.readframes(w.getnframes())
    enc = lameenc.Encoder()
    enc.set_bit_rate(40)
    enc.set_in_sample_rate(rate)
    enc.set_channels(1)
    enc.set_quality(2)
    data = enc.encode(pcm) + enc.flush()
    tmp = out / f'{key}.tmp'
    tmp.write_bytes(data)
    tmp.rename(out / f'{key}.mp3')
    if i % 500 == 0:
        print(f'{i}/{len(todo)}', flush=True)
print('done', flush=True)
