#!/usr/bin/env python3
"""Local, no-cache design preview. Run from any directory; no dependencies."""

import argparse
import hashlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
ENTRY = "/prototypes/pension/"


def revision():
    digest = hashlib.sha256()
    paths = [ROOT / "index.html", ROOT / "styles.css", *(ROOT / "js").glob("*.js")]
    for path in sorted(paths):
        digest.update(path.relative_to(ROOT).as_posix().encode())
        digest.update(path.read_bytes())
    return digest.hexdigest()[:12]


class PreviewHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_head(self):
        path = urlsplit(self.path).path
        if path in {"/", "/app.html", "/index.html"}:
            self.send_response(307)
            self.send_header("Location", ENTRY)
            self.end_headers()
            return None
        # Never return 304 for a saved, stale preview document or stylesheet.
        if "If-Modified-Since" in self.headers:
            del self.headers["If-Modified-Since"]
        return super().send_head()

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == "/__preview_revision":
            body = json.dumps({"revision": revision()}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path in {ENTRY, ENTRY + "index.html"}:
            # The watcher exists only in the local preview response, not the app.
            body = (ROOT / "index.html").read_text(encoding="utf-8")
            body = body.replace('<html lang="en-CA">', '<html lang="en-CA" data-preview="true">')
            body = body.replace("<head>", '<head><base href="/">')
            watcher = '<script src="/scripts/preview-reload.js" data-revision="' + revision() + '"></script>'
            body = body.replace("</body>", watcher + "</body>").encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=63047)
    args = parser.parse_args()
    print(f"Design preview: http://127.0.0.1:{args.port}{ENTRY}", flush=True)
    ThreadingHTTPServer(("127.0.0.1", args.port), PreviewHandler).serve_forever()
