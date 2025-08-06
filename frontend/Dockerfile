FROM python:3.11-slim

WORKDIR /app

# Copy the simple frontend and server
COPY simple_frontend.html ./simple_frontend.html
COPY serve_frontend.py ./serve_frontend.py

# Install Python dependencies if needed
RUN pip install --no-cache-dir fastapi uvicorn

EXPOSE 3000

# Run the simple frontend server
CMD ["python", "serve_frontend.py"]