apiVersion: v1
kind: Namespace
metadata:
  name: pharmalab
---
apiVersion: v1
kind: Secret
metadata:
  name: pharmalab-secret
  namespace: pharmalab
type: Opaque
stringData:
  SECRET_KEY: "change-this-secret-key-before-real-production"
  DB_PASSWORD: "postgres"
  MINIO_ACCESS_KEY: "minioadmin"
  MINIO_SECRET_KEY: "minioadmin"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: pharmalab-config
  namespace: pharmalab
data:
  DEBUG: "False"
  ALLOWED_HOSTS: "${PUBLIC_HOST},${VM_IP},localhost,127.0.0.1"
  CSRF_TRUSTED_ORIGINS: "http://${PUBLIC_HOST}:30080,http://${VM_IP}:30080"
  API_CORS_ALLOWED_ORIGINS: "http://${PUBLIC_HOST}:30080,http://${VM_IP}:30080,http://localhost:30080,http://127.0.0.1:30080"
  DB_NAME: "pharmalab"
  DB_USER: "postgres"
  DB_HOST: "postgres"
  DB_PORT: "5432"
  REDIS_URL: "redis://redis:6379/1"
  MINIO_ENDPOINT: "minio:9000"
  MINIO_PUBLIC_ENDPOINT: "${PUBLIC_HOST}:30090"
  MINIO_BUCKET: "pharmalab-media"
  MINIO_USE_SSL: "False"
  MINIO_PUBLIC_USE_SSL: "False"
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-data
  namespace: pharmalab
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 3Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: pharmalab
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_DB
              valueFrom:
                configMapKeyRef:
                  name: pharmalab-config
                  key: DB_NAME
            - name: POSTGRES_USER
              valueFrom:
                configMapKeyRef:
                  name: pharmalab-config
                  key: DB_USER
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: pharmalab-secret
                  key: DB_PASSWORD
          volumeMounts:
            - name: postgres-data
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: postgres-data
          persistentVolumeClaim:
            claimName: postgres-data
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: pharmalab
spec:
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: adminer
  namespace: pharmalab
spec:
  replicas: 1
  selector:
    matchLabels:
      app: adminer
  template:
    metadata:
      labels:
        app: adminer
    spec:
      containers:
        - name: adminer
          image: adminer:latest
          ports:
            - containerPort: 8080
          env:
            - name: ADMINER_DEFAULT_SERVER
              value: postgres
---
apiVersion: v1
kind: Service
metadata:
  name: adminer
  namespace: pharmalab
spec:
  type: NodePort
  selector:
    app: adminer
  ports:
    - port: 8080
      targetPort: 8080
      nodePort: 30082
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: redis-data
  namespace: pharmalab
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: pharmalab
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
        - name: redis
          image: redis:7-alpine
          command:
            - redis-server
            - --appendonly
            - "yes"
          ports:
            - containerPort: 6379
          volumeMounts:
            - name: redis-data
              mountPath: /data
      volumes:
        - name: redis-data
          persistentVolumeClaim:
            claimName: redis-data
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: pharmalab
spec:
  selector:
    app: redis
  ports:
    - port: 6379
      targetPort: 6379
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: minio-data
  namespace: pharmalab
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 3Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: minio
  namespace: pharmalab
spec:
  replicas: 1
  selector:
    matchLabels:
      app: minio
  template:
    metadata:
      labels:
        app: minio
    spec:
      containers:
        - name: minio
          image: minio/minio
          args:
            - server
            - /data
            - --console-address
            - ":9001"
          ports:
            - containerPort: 9000
            - containerPort: 9001
          env:
            - name: MINIO_ROOT_USER
              valueFrom:
                secretKeyRef:
                  name: pharmalab-secret
                  key: MINIO_ACCESS_KEY
            - name: MINIO_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: pharmalab-secret
                  key: MINIO_SECRET_KEY
          volumeMounts:
            - name: minio-data
              mountPath: /data
      volumes:
        - name: minio-data
          persistentVolumeClaim:
            claimName: minio-data
---
apiVersion: v1
kind: Service
metadata:
  name: minio
  namespace: pharmalab
spec:
  type: NodePort
  selector:
    app: minio
  ports:
    - name: api
      port: 9000
      targetPort: 9000
      nodePort: 30090
    - name: console
      port: 9001
      targetPort: 9001
      nodePort: 30091
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: pharmalab
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: pharmalab-backend:local
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8000
          envFrom:
            - configMapRef:
                name: pharmalab-config
            - secretRef:
                name: pharmalab-secret
          command:
            - /bin/sh
            - -c
          args:
            - |
              until python -c "import socket; socket.create_connection(('postgres', 5432), 5)"; do
                echo "waiting for postgres"
                sleep 2
              done

              python manage.py migrate
              python manage.py collectstatic --noinput
              python manage.py load_initial_data

              python manage.py shell -c "from substances.models import User; u,_=User.objects.get_or_create(username='user', defaults={'email':'user@example.com'}); u.set_password('user123'); u.is_active=True; u.save(); m,_=User.objects.get_or_create(username='moderator', defaults={'email':'moderator@example.com'}); m.set_password('moderator123'); m.is_moderator=True; m.is_staff=True; m.is_active=True; m.save()"

              gunicorn pharmalab.wsgi:application --bind 0.0.0.0:8000
---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: pharmalab
spec:
  selector:
    app: backend
  ports:
    - port: 8000
      targetPort: 8000
---
apiVersion: batch/v1
kind: Job
metadata:
  name: upload-media
  namespace: pharmalab
spec:
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: upload-media
          image: pharmalab-media:local
          imagePullPolicy: IfNotPresent
          env:
            - name: MINIO_ENDPOINT
              value: "minio:9000"
            - name: MINIO_BUCKET
              valueFrom:
                configMapKeyRef:
                  name: pharmalab-config
                  key: MINIO_BUCKET
            - name: MINIO_ACCESS_KEY
              valueFrom:
                secretKeyRef:
                  name: pharmalab-secret
                  key: MINIO_ACCESS_KEY
            - name: MINIO_SECRET_KEY
              valueFrom:
                secretKeyRef:
                  name: pharmalab-secret
                  key: MINIO_SECRET_KEY
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: pharmalab
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: pharmalab-frontend:local
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: pharmalab
spec:
  type: NodePort
  selector:
    app: frontend
  ports:
    - port: 80
      targetPort: 80
      nodePort: 30080
