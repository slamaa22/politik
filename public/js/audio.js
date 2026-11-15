// Web Audio API Recorder, Waveform Visualizer, Pitch Tracker & Optional German Speech-to-Text
import { detectPitchHz } from './analyzer.js';

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
    this.analyser.fftSize = 2048;
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
      this.onSpeechError('Automatische Transkription wird nach dem Stoppen auf dem Server erstellt.');
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
          this.onSpeechError('Browser-Spracherkennung blockiert – Transkript wird nach dem Stoppen auf dem Server erstellt.');
        } else if (event.error === 'network') {
          this.onSpeechError('Browser-Live-Text nicht erreichbar – Transkript wird nach dem Stoppen automatisch über Server-Whisper erstellt.');
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
      this.onSpeechError('Transkript wird nach dem Stoppen automatisch über Server-Whisper erstellt.');
    }
  }

  #sampleFrame() {
    if (!this.analyser || !this.audioCtx) {
      return { rms: 0, pitchHz: null, clipped: false };
    }
    const data = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(data);
    let sum = 0;
    let clipped = false;
    for (let i = 0; i < data.length; i++) {
      const v = data[i];
      if (Math.abs(v) >= 0.98) clipped = true;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    const pitchHz = rms >= 0.015 ? detectPitchHz(data, this.audioCtx.sampleRate) : null;
    return { rms, pitchHz, clipped };
  }

  #startSamplingLoop() {
    this.sampleIntervalId = setInterval(() => {
      if (!this.isRecording) return;
      const elapsed = (performance.now() - this.startTime) / 1000;
      const { rms, pitchHz, clipped } = this.#sampleFrame();
      this.samples.push({
        t: Number(elapsed.toFixed(2)),
        rms: Number(rms.toFixed(4)),
        pitchHz,
        clipped,
      });
      this.onTick({ elapsed, rms, pitchHz, clipped, samplesCount: this.samples.length });
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
    let recordedBlob = null;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      recordedBlob = await new Promise((resolve) => {
        this.mediaRecorder.onstop = () => {
          if (this.chunks.length > 0) {
            const blob = new Blob(this.chunks, { type: this.mediaRecorder.mimeType || 'audio/webm' });
            resolve(blob);
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
      if (recordedBlob) {
        audioUrl = URL.createObjectURL(recordedBlob);
      }
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
      blob: recordedBlob,
      transcript: this.finalTranscript.trim(),
    };
  }
}
