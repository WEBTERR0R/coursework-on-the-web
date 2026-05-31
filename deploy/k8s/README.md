# Деплой PharmaLab в Kubernetes

Инструкция рассчитана на чистую Ubuntu VM и один узел Kubernetes через K3s.

## 1. Установка пакетов

```bash
sudo apt update
sudo apt install -y git curl ca-certificates docker.io gettext-base ufw

sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
```

## 2. Установка K3s

```bash
curl -sfL https://get.k3s.io | sh -
sudo chmod 644 /etc/rancher/k3s/k3s.yaml

kubectl get nodes
```

В колонке `STATUS` должно быть `Ready`.

## 3. Открытие портов

```bash
sudo ufw allow OpenSSH
sudo ufw allow 30080/tcp
sudo ufw allow 30082/tcp
sudo ufw allow 30090/tcp
sudo ufw allow 30091/tcp
sudo ufw --force enable
```

Порты:

- `30080` - сайт
- `30082` - Adminer для просмотра PostgreSQL
- `30090` - MinIO media API
- `30091` - MinIO console

Redis наружу не открывается. Он доступен только внутри Kubernetes-кластера как сервис `redis:6379`.

## 4. Клонирование проекта

```bash
cd ~
git clone -b lab8 https://github.com/WEBTERR0R/coursework-on-the-web.git pharmaproject
cd ~/pharmaproject
```

Если используется другая ветка, замени `lab8` на свою.

## 5. Подготовка IP

```bash
export VM_IP=$(hostname -I | awk '{print $1}')
echo $VM_IP
```

Этот IP будет использоваться в настройках Django, React и MinIO.

## 6. Сборка образов

```bash
docker build -f deploy/docker/backend.Dockerfile -t pharmalab-backend:local .

docker build \
  --build-arg VITE_API_BASE_URL=/api \
  --build-arg VITE_PROMO_VIDEO_URL=http://$VM_IP:30090/pharmalab-media/promo.mp4 \
  -f deploy/docker/frontend.Dockerfile \
  -t pharmalab-frontend:local .

docker build -f deploy/docker/media.Dockerfile -t pharmalab-media:local .
```

## 7. Импорт образов в K3s

```bash
docker save pharmalab-backend:local | sudo k3s ctr images import -
docker save pharmalab-frontend:local | sudo k3s ctr images import -
docker save pharmalab-media:local | sudo k3s ctr images import -
```

Проверка:

```bash
sudo k3s ctr images ls | grep pharmalab
```

## 8. Запуск в Kubernetes

```bash
envsubst < deploy/k8s/pharmalab.yaml.tpl > deploy/k8s/pharmalab.yaml
kubectl apply -f deploy/k8s/pharmalab.yaml
```

Проверка:

```bash
kubectl get pods -n pharmalab
kubectl get svc -n pharmalab
```

Сначала часть подов может быть в статусе `ContainerCreating` или `Init`. Через некоторое время должны остаться `Running`, а `upload-media` должен стать `Completed`.

В нормальном состоянии должны быть такие рабочие части:

- `frontend` - React-сайт в nginx
- `backend` - Django API
- `postgres` - база данных
- `adminer` - веб-интерфейс для просмотра PostgreSQL
- `redis` - внутренний кэш
- `minio` - хранилище картинок и видео
- `upload-media` - одноразовая загрузка медиа в MinIO

## 9. Открытие сайта

```text
http://IP_ВИРТУАЛЬНОЙ_МАШИНЫ:30080
```

Например:

```text
http://192.168.1.186:30080
```

Пользователи для проверки:

- `user` / `user123`
- `moderator` / `moderator123`

MinIO:

```text
http://IP_ВИРТУАЛЬНОЙ_МАШИНЫ:30091
```

Логин MinIO:

- `minioadmin`
- `minioadmin`

Adminer:

```text
http://IP_ВИРТУАЛЬНОЙ_МАШИНЫ:30082
```

Данные входа:

- System: `PostgreSQL`
- Server: `postgres`
- Username: `postgres`
- Password: `postgres`
- Database: `pharmalab`

## 10. Логи

```bash
kubectl logs -n pharmalab deployment/backend
kubectl logs -n pharmalab deployment/frontend
kubectl logs -n pharmalab deployment/adminer
kubectl logs -n pharmalab deployment/redis
kubectl logs -n pharmalab deployment/minio
kubectl logs -n pharmalab job/upload-media
```

## 11. Пересборка после изменений

```bash
docker build -f deploy/docker/backend.Dockerfile -t pharmalab-backend:local .

docker build \
  --build-arg VITE_API_BASE_URL=/api \
  --build-arg VITE_PROMO_VIDEO_URL=http://$VM_IP:30090/pharmalab-media/promo.mp4 \
  -f deploy/docker/frontend.Dockerfile \
  -t pharmalab-frontend:local .

docker build -f deploy/docker/media.Dockerfile -t pharmalab-media:local .

docker save pharmalab-backend:local | sudo k3s ctr images import -
docker save pharmalab-frontend:local | sudo k3s ctr images import -
docker save pharmalab-media:local | sudo k3s ctr images import -

kubectl delete job upload-media -n pharmalab --ignore-not-found
kubectl apply -f deploy/k8s/pharmalab.yaml
kubectl rollout restart deployment/backend -n pharmalab
kubectl rollout restart deployment/frontend -n pharmalab
```

## 12. Полное удаление

```bash
kubectl delete namespace pharmalab
```
