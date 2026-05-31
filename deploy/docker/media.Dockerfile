FROM minio/mc

COPY frontend/public/pharmalab-media /media
COPY deploy/media/upload-media.sh /upload-media.sh

ENTRYPOINT ["/bin/sh", "/upload-media.sh"]
