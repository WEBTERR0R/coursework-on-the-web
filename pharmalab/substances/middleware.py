import re

class DisableCSRFForAPI:
    """Отключает CSRF-проверку для всех эндпоинтов /api/"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Если путь начинается с /api/ — пропускаем CSRF-проверку
        if re.match(r'^/api/.*', request.path):
            setattr(request, '_dont_enforce_csrf_checks', True)
        return self.get_response(request)