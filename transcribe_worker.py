import json
import os
import sys

def main():
    model_size = os.environ.get("WHISPER_MODEL", "small")
    cpu_threads = int(os.environ.get("WHISPER_THREADS", "8"))

    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        print(json.dumps({"ready": False, "error": f"faster-whisper not installed: {exc}"}), flush=True)
        sys.exit(1)

    model = WhisperModel(model_size, device="cpu", compute_type="int8", cpu_threads=cpu_threads)
    print(json.dumps({"ready": True, "model": model_size}), flush=True)

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            req = json.loads(line)
            audio_path = req["path"]
            lang = req.get("language", "de")
            segments, info = model.transcribe(
                audio_path,
                language=lang,
                beam_size=2,
                vad_filter=True,
                vad_parameters={"min_silence_duration_ms": 350},
            )
            text = " ".join(seg.text.strip() for seg in segments if seg.text.strip()).strip()
            print(json.dumps({"ok": True, "text": text, "language": info.language}), flush=True)
        except Exception as err:
            print(json.dumps({"ok": False, "error": str(err)}), flush=True)


if __name__ == "__main__":
    main()
