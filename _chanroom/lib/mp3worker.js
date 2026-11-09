// 禪修室：在背景把錄音壓縮成單聲道 MP3（不卡畫面）
importScripts("lame.min.js");
self.onmessage = (ev) => {
  const { pcm, rate, kbps } = ev.data;           // pcm: Float32Array（單聲道）
  try {
    const enc = new lamejs.Mp3Encoder(1, rate, kbps);
    const N = 1152, buf = new Int16Array(N), out = [];
    let lastPct = -1;
    for (let i = 0; i < pcm.length; i += N) {
      const n = Math.min(N, pcm.length - i);
      for (let j = 0; j < n; j++) {
        const v = Math.max(-1, Math.min(1, pcm[i + j]));
        buf[j] = v < 0 ? v * 0x8000 : v * 0x7fff;
      }
      const chunk = enc.encodeBuffer(n === N ? buf : buf.subarray(0, n));
      if (chunk.length) out.push(chunk);
      const pct = Math.floor((i / pcm.length) * 100);
      if (pct !== lastPct && pct % 5 === 0) { lastPct = pct; self.postMessage({ progress: pct }); }
    }
    const end = enc.flush(); if (end.length) out.push(end);
    self.postMessage({ blob: new Blob(out, { type: "audio/mpeg" }) });
  } catch (e) {
    self.postMessage({ error: String((e && e.message) || e) });
  }
};
