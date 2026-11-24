#!/usr/bin/env python3
"""在自己電腦上開線上書齋，不用裝 Jekyll。

雙擊根目錄的「預覽書齋」就會執行這支程式，或在儲存庫根目錄打：
    python3 vr/_parts/serve.py

它會在本機開一個小網站，自動打開瀏覽器進到書齋的測試房。
改了 vr/_parts/ 或 _data/vr.yml 之後，回到瀏覽器重新整理就看得到。
關掉這個視窗（或按 Ctrl+C）就停止。
"""
import getpass, http.server, json, os, re, socket, socketserver, sys, threading, time, webbrowser

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build import ROOT, VR, PartError, assemble, syntax_error  # noqa: E402

try:
    sys.stdout.reconfigure(errors='replace')
    sys.stderr.reconfigure(errors='replace')
except Exception:
    pass

try:
    import yaml
except ImportError:
    yaml = None


def vr_data():
    """_data/vr.yml 的內容（書齋裡的文字、菜單、片單…）。"""
    if yaml is None:
        return {}
    path = os.path.join(ROOT, '_data', 'vr.yml')
    if not os.path.exists(path):
        return {}
    return yaml.safe_load(open(path, encoding='utf-8')) or {}


def jsonify(obj):
    return json.dumps(obj, ensure_ascii=False, default=str)


def strip_front_matter(text):
    return re.sub(r'\A---\n(?:.*?\n)?---\n', '', text, flags=re.S)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def send_text(self, body, ctype, status=200):
        data = body.encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', ctype + '; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        path = self.path.split('?', 1)[0]
        try:
            if path in ('/vr', '/vr/', '/vr/index.html'):
                if path == '/vr':
                    self.send_response(301); self.send_header('Location', '/vr/' + self.path[3:]); self.end_headers(); return
                html = strip_front_matter(open(os.path.join(VR, 'index.html'), encoding='utf-8').read())
                html = re.sub(r'\{\{\s*site\.time[^}]*\}\}', str(int(time.time())), html)
                return self.send_text(html, 'text/html')
            if path == '/vr/vr-house.js':
                js = assemble()
                err = syntax_error(js)
                if err:
                    print('\n！ vr-house.js 有語法錯誤，書齋會載不起來：\n' + err, flush=True)
                return self.send_text(js, 'application/javascript')
            if path == '/vr/data.json':
                return self.send_text(jsonify(vr_data()), 'application/json')
            if path == '/vr/gate.json':
                d = vr_data()
                return self.send_text(jsonify({'look': d.get('look'), 'loading': d.get('loading')}), 'application/json')
        except PartError as e:
            print('\n！ ' + str(e), flush=True)
            return self.send_text('/* ' + str(e) + ' */', 'application/javascript', 500)
        return super().do_GET()

    def end_headers(self):
        if self.path.split('?', 1)[0].endswith(('.js', '.json', '.html', '/')):
            self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def log_request(self, code='-', size='-'):
        try:
            code = int(code)
        except (TypeError, ValueError):
            return
        if code >= 400 and '/api/' not in self.path:
            sys.stderr.write('找不到或出錯（%d）：%s\n' % (code, self.path))

    def log_message(self, fmt, *args):
        pass


def free_port(start=8000):
    for port in range(start, start + 50):
        with socket.socket() as s:
            try:
                s.bind(('127.0.0.1', port))
                return port
            except OSError:
                continue
    raise SystemExit('找不到可用的連接埠')


def test_room():
    name = re.sub(r'[^A-Z0-9]', '', getpass.getuser().upper())[:11] or 'LOCAL'
    return 'TEST-' + name


if __name__ == '__main__':
    port = free_port()
    room = test_room()
    url = f'http://localhost:{port}/vr/?room={room}'
    try:
        assemble()
    except PartError as e:
        print('！ ' + str(e))
    print('線上書齋本機預覽')
    print('  網址：', url)
    print('  測試房：', room, '（線上的人看不到你；要和別人一起測，兩邊網址的 room= 改成同一個）')
    if yaml is None:
        print('  提醒：沒有裝 PyYAML，書齋裡的文字會用預設值。要看到後台的文字，先執行：pip install pyyaml')
    print('  改了程式或文字之後，到瀏覽器重新整理就好。關掉這個視窗就停止。\n')
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(('127.0.0.1', port), Handler) as httpd:
        threading.Timer(0.8, lambda: webbrowser.open(url)).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
