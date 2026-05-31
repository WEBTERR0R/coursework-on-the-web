import re
from django.conf import settings
from django.http import HttpResponse

class DisableCSRFForAPI:
    
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # для api csrf не нужен
        if re.match(r'^/api/.*', request.path):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return self.get_response(request)


class ApiCorsMiddleware:
    """Разрешает API-запросы с Vite, HTTPS dev-сервера и Tauri WebView."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not re.match(r'^/api/.*', request.path):
            return self.get_response(request)

        if request.method == 'OPTIONS':
            response = HttpResponse(status=204)
        else:
            response = self.get_response(request)

        origin = request.headers.get('Origin')
        if origin in settings.API_CORS_ALLOWED_ORIGINS:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Vary'] = 'Origin'

        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, X-CSRFToken, Authorization'
        return response
