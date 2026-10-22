# QuantumLens Dockerfile for Hugging Face Spaces / Container Deployment
FROM python:3.10-slim

WORKDIR /app

# Install system utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Expose standard Streamlit port
EXPOSE 7860
EXPOSE 8000

# Streamlit command for Hugging Face Spaces (Port 7860)
CMD ["streamlit", "run", "app.py", "--server.port=7860", "--server.address=0.0.0.0"]
