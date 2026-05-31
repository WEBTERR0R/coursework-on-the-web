# Инструкция по запуску проекта ФармаЛаб

## Предварительные требования

- Python 3.9+
- Docker и Docker Compose
- PostgreSQL 15+
- MinIO

## Быстрый запуск через Docker

```bash
# Запуск PostgreSQL и MinIO
docker-compose up -d

# Установка зависимостей
pip install -r requirements.txt

# Применение миграций
python manage.py makemigrations
python manage.py migrate

# Загрузка демонстрационных данных
python manage.py load_demo_data

# Запуск сервера
python manage.py runserver


Базовый адрес: http://127.0.0.1:8000

Главная страница (каталог)	http://127.0.0.1:8000/
Django Admin (админка)	http://127.0.0.1:8000/admin/
Детальная страница субстанции	http://127.0.0.1:8000/substance/1/
Страница заявки	http://127.0.0.1:8000/request/1/

Субстанции

Список всех субстанций	http://127.0.0.1:8000/api/substances/
Список с фильтром по названию	http://127.0.0.1:8000/api/substances/?search=парацетамол
Список с фильтром по CAS	http://127.0.0.1:8000/api/substances/?search=103-90-2
Одна субстанция (id=1)	http://127.0.0.1:8000/api/substances/1/
Заявки

Корзина (иконка)	http://127.0.0.1:8000/api/requests/cart/
Список всех заявок	http://127.0.0.1:8000/api/requests/
Фильтр по статусу (сформированные)	http://127.0.0.1:8000/api/requests/?status=formed
Фильтр по статусу (черновики)	http://127.0.0.1:8000/api/requests/?status=draft
Одна заявка (id=35)	http://127.0.0.1:8000/api/requests/35/


Swagger	http://127.0.0.1:8000/api/swagger/


MinIO Console (хранилище файлов)	http://localhost:9001	minioadmin / minioadmin
Adminer (управление БД)	http://localhost:8080	


фронт + бэк
 .\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
  npm run dev

сборка пва мок
http://127.0.0.1:4173/coursework-on-the-web/
 npm run preview:pages

 локальное апи
 http://192.168.1.186:8000/api/substances/

таури
 C:\programs\pharmaproject\frontend\src-tauri\target\release\pharmalab_guest.exe
 
 адрес айпи
 C:\programs\pharmaproject\frontend\.env.tauri