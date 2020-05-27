function waveToDataURL(wave){
  const f = n => '%' + (n >> 4).toString(16) + (n & 0xf).toString(16)
  const f2 = n => f(n & 0xff) + f(n >> 8)
  const f4 = n => f2(n & 0xffff) + f2(n >> 16)
  return 'data:audio/wav,' + [
    'RIFF',
    f4(wave.length * 2 + 32),
    'WAVEfmt%20',
    f4(16),
    f4(0x10001),
    f4(44100),
    f4(88200),
    f4(0x100004),
    'data',
    f4(wave.length * 2),
    wave.map(v => {
      v = Math.round(0x8000 * v);
      return f2(v > 0x7fff ? 0x7fff : v < -0x7fff ? 0x8000 : v < 0 ? v + 0x10000 : v)
    }).join('')
  ].join('')
}
function createWaveFromParameters(parameters) {
  const waveData=new Array(44100 * 5).fill(0)
  parameters.forEach(({ w, hz, fadein, fadeout, delay, volume }) => {
    const th = 2 * Math.PI * hz / 44100
    const ex = Math.exp(-w * hz / 44100 / 2)
    const ac = ex * Math.cos(th)
    const as = ex * Math.sin(th)
    const bc = ex * ac
    const bs = ex * as
    const cc = ex * bc
    const cs = ex * bs
    const scale = Math.sqrt(hz * w) * volume
    let ar = 0, ai = 0
    let br = 0, bi = 0
    let cr = 0, ci = 0
    for(i = delay - 44100; i < waveData.length; i++) {
      const r = 2 * Math.random() - 1
      let tmp
      tmp = ar
      ar = tmp * ac - ai * as + r
      ai = ai * ac + tmp * as
      tmp = br
      br = tmp * bc - bi * bs + r
      bi = bi * bc + tmp * bs
      tmp = cr
      cr = tmp * cc - ci * cs + r
      ci = ci * cc + tmp * cs
      const j = i - delay
      if (j < 0) continue
      waveData[i] += (fadein ? 1 - Math.exp(-j / fadein) : 1) * Math.exp(-j / fadeout) * (2 * br - ar - cr) * scale
    }
  })
  let max = 0;
  waveData.forEach(v => { max = Math.max(max, Math.abs(v)) })
  waveData.forEach((_, i) => waveData[i] /= max)
  return waveData
}
