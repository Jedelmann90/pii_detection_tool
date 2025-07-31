#!/usr/bin/env python3
"""
Simple HTTP server to serve the frontend HTML file.
This avoids CORS issues when accessing the backend API.
"""

import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

PORT = 3000
DIRECTORY = Path(__file__).parent

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

if __name__ == "__main__":
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"🎨 Frontend server starting...")
            print(f"📡 Serving at: http://localhost:{PORT}")
            print(f"🔗 PII Detection Tool: http://localhost:{PORT}/simple_frontend.html")
            print(f"⚡ Backend API: http://localhost:8000")
            print("\nPress Ctrl+C to stop the server")
            
            # Automatically open browser
            webbrowser.open(f"http://localhost:{PORT}/simple_frontend.html")
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {PORT} is already in use. Try a different port or stop the existing server.")
        else:
            print(f"❌ Error starting server: {e}")