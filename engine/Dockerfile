FROM python:3.9-slim
ENV REFRESHED_AT=2024-02-06_0300

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy engine code
COPY . .

# Run the main script
CMD ["python", "main.py"]
