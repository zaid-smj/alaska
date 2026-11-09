# Build the normal Sail base first: docker compose build laravel.test
FROM sail-8.5/app
USER root
RUN apt-get update && apt-get install -y --no-install-recommends tesseract-ocr poppler-utils && rm -rf /var/lib/apt/lists/*
