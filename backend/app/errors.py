class AppError(Exception):
    def __init__(self, code: str, message: str, status: int = 400, retryable: bool = False):
        self.code, self.message, self.status, self.retryable = code, message, status, retryable


def not_found():
    return AppError("NOT_FOUND", "Kayıt bulunamadı.", 404)
