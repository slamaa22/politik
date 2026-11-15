// Web Audio API Recorder, Waveform Visualizer & Optional German Speech-to-Text

export class SpeechStudioRecorder {
  constructor({ canvas, onTranscript, onTick, onStatus, onSpeechError } = {}) {
    this.canvas = canvas || null;
    this.onTranscript = onTranscript || (() => {});
    this.onTick = onTick || (() => {});
    this.onStatus = onStatus || (() => {});
    this.onSpeechError = onSpeechError || (() => {});

    this.stream = null;
    this.audioCtx = null;
    this.analyser = null;
    this.mediaRecorder = null;
    this.chunks = [];
    this.samples = [];
    this.recognition = null;
    this.isRecording = false;
    this.startTime = 0;
    this.rafId = null;
    this.sampleIntervalId = null;
    this.finalTranscript = '';
    this.lastAudioUrl = null;
  }

  static isSpeechRecognitionSupported() {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  async start() {
    if (this.isRecording) return;

    this.chunks = [];
    this.samples = [];
    this.finalTranscript = '';
    if (this.lastAudioUrl) {
      URL.revokeObjectURL(this.lastAudioUrl);
      this.lastAudioUrl = null;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Mikrofon-API wird von diesem Browser nicht unterstützt.');
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: false, // Preserve dynamic range for crescendo analysis!
      },
    });

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioCtx();
    const source = this.audioCtx.createMediaStreamSource(this.stream);
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 1024;
    source.connect(this.analyser);

    try {
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) this.chunks.push(e.data);
      };
      this.mediaRecorder.start(250);
    } catch {
      this.mediaRecorder = null;
    }

    this.isRecording = true;
    this.startTime = performance.now();
    this.onStatus('recording');

    this.#startSpeechRecognition();
    this.#startSamplingLoop();
    this.#drawLoop();
  }

  #startSpeechRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      this.onSpeechError('Browser-Spracherkennung nicht verfügbar – Audio wird trotzdem voll analysiert (Transkript optional ergänzen).');
      return;
    }

    try {
      const rec = new SR();
      rec.lang = 'de-DE';
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            this.finalTranscript = `${this.finalTranscript} ${text}`.trim();
          } else {
            interim += text;
          }
        }
        const combined = `${this.finalTranscript} ${interim}`.trim();
        this.onTranscript(combined, Boolean(interim));
      };

      rec.onerror = (event) => {
        if (event.error === 'not-allowed') {
          this.onSpeechError('Spracherkennung blockiert.');
        } else if (event.error === 'network') {
          this.onSpeechError('Live-Transkription offline/nicht erreichbar – Audioaufnahme & Pausen/Dynamik laufen lokal weiter.');
        }
      };

      rec.onend = () => {
        if (this.isRecording) {
          try {
            rec.start();
          } catch {
            // Ignore restart errors
          }
        }
      };

      rec.start();
      this.recognition = rec;
    } catch {
      this.onSpeechError('Live-Transkription konnte nicht gestartet werden.');
    }
  }

  #computeRms() {
    if (!this.analyser) return 0;
    const data = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
  }

  #startSamplingLoop() {
    this.sampleIntervalId = setInterval(() => {
      if (!this.isRecording) return;
      const elapsed = (performance.now() - this.startTime) / 1000;
      const rms = this.#computeRms();
      this.samples.push({ t: Number(elapsed.toFixed(2)), rms: Number(rms.toFixed(4)) });
      this.onTick({ elapsed, rms, samplesCount: this.samples.length });
    }, 80);
  }

  #drawLoop() {
    if (!this.isRecording) return;
    if (this.canvas && this.analyser) {
      const ctx = this.canvas.getContext('2d');
      const { width, height } = this.canvas;
      const data = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteTimeDomainData(data);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, 0, width, height);

      // Center hairline
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Precision waveform
      ctx.strokeStyle = '#0e0f12';
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      const slice = width / data.length;
      let x = 0;
      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0;
        const y = (v * height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += slice;
      }
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    }
    this.rafId = requestAnimationFrame(() => this.#drawLoop());
  }

  async stop() {
    if (!this.isRecording) {
      return {
        durationSec: 0,
        samples: this.samples,
        audioUrl: this.lastAudioUrl,
        transcript: this.finalTranscript,
      };
    }

    this.isRecording = false;
    const durationSec = Math.max(0.5, (performance.now() - this.startTime) / 1000);

    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.sampleIntervalId) clearInterval(this.sampleIntervalId);

    if (this.recognition) {
      try {
        this.recognition.onend = null;
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.recognition = null;
    }

    let audioUrl = null;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      audioUrl = await new Promise((resolve) => {
        this.mediaRecorder.onstop = () => {
          if (this.chunks.length > 0) {
            const blob = new Blob(this.chunks, { type: this.mediaRecorder.mimeType || 'audio/webm' });
            resolve(URL.createObjectURL(blob));
          } else {
            resolve(null);
          }
        };
        try {
          this.mediaRecorder.stop();
        } catch {
          resolve(null);
        }
      });
    }
    this.lastAudioUrl = audioUrl;

    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.audioCtx) {
      try {
        await this.audioCtx.close();
      } catch {
        // ignore
      }
      this.audioCtx = null;
    }

    this.onStatus('stopped');

    return {
      durationSec: Number(durationSec.toFixed(1)),
      samples: [...this.samples],
      audioUrl,
      transcript: this.finalTranscript.trim(),
    };
  }
}
