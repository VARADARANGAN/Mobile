import http.server
import socketserver
import os
import sys

DEFAULT_PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    port = DEFAULT_PORT
    max_attempts = 10

    for attempt in range(max_attempts):
        try:
            with socketserver.TCPServer(("127.0.0.1", port), Handler) as httpd:
                print("=" * 60)
                print(f"  AURA Landing Page Dev Server Running")
                print(f"  URL: http://localhost:{port}/index.html")
                print(f"  Press Ctrl+C to stop the server")
                print("=" * 60)
                sys.stdout.flush()
                httpd.serve_forever()
                break
        except OSError as e:
            if e.winerror == 10048 or getattr(e, 'errno', None) in (48, 98):
                print(f"Port {port} is in use, trying port {port + 1}...")
                port += 1
            else:
                raise e

if __name__ == "__main__":
    start_server()
