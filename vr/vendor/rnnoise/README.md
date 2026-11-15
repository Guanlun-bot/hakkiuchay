# RNNoise（語音降噪）

來自 npm 套件 @sapphi-red/web-noise-suppressor 0.4.1（MIT，見 LICENSE），內含 xiph/rnnoise 經 shiguredo/rnnoise-wasm 編譯的 WebAssembly。
線上書齋開麥時才載入，用於去除風扇、冷氣、鍵盤等持續噪音。更新時換掉這三個檔即可：workletProcessor.js、rnnoise.wasm、rnnoise_simd.wasm。
