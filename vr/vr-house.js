---
# 線上書齋的 3D 程式。真正的程式碼分段放在 vr/_parts/，這個檔只負責依序把它們接起來（GitHub Pages 建置時由 Jekyll 組成一個檔）。
# 要改程式請改 vr/_parts/ 裡對應的檔案；分段一覽與本機組檔方法見 vr/_parts/README.md。
---
{% include_relative _parts/01-core.js %}
{% include_relative _parts/02-compound-lights.js %}
{% include_relative _parts/03-xuejiu-furniture.js %}
{% include_relative _parts/04-zhiliao.js %}
{% include_relative _parts/05-looks-plan.js %}
{% include_relative _parts/06-gate-controls-ui.js %}
{% include_relative _parts/07-network-voice.js %}
{% include_relative _parts/08-chat-map-gestures.js %}
{% include_relative _parts/09-vr-loop-perf.js %}
{% include_relative _parts/10-eaves-windows-beds.js %}
{% include_relative _parts/11-npc.js %}
{% include_relative _parts/12-kitchen-dining.js %}
{% include_relative _parts/13-classroom.js %}
{% include_relative _parts/14-cinema.js %}
{% include_relative _parts/14a-laundry.js %}
{% include_relative _parts/14b-cinema-play.js %}
{% include_relative _parts/15-staff-pages.js %}
{% include_relative _parts/16-talk.js %}
{% include_relative _parts/17-steward.js %}
{% include_relative _parts/18-snacks-gramophone.js %}
{% include_relative _parts/19-land.js %}
{% include_relative _parts/19a-zhang-phone.js %}
{% include_relative _parts/19b-station.js %}
{% include_relative _parts/20-blinds.js %}
