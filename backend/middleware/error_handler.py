from flask import jsonify
from functools import wraps
import traceback

class APIError(Exception):
    """Custom API Error"""
    def __init__(self, message, status_code=400, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['success'] = False
        rv['message'] = self.message
        return rv


def handle_errors(f):
    """Decorator để handle errors"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except APIError as e:
            return jsonify(e.to_dict()), e.status_code
        except Exception as e:
            # Log error
            print(f"Error in {f.__name__}: {str(e)}")
            traceback.print_exc()

            return jsonify({
                'success': False,
                'message': f'Lỗi server: {str(e)}'
            }), 500

    return decorated_function


def register_error_handlers(app):
    """Register global error handlers"""

    @app.errorhandler(APIError)
    def handle_api_error(error):
        response = jsonify(error.to_dict())
        response.status_code = error.status_code
        return response

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'success': False,
            'message': 'Endpoint không tồn tại'
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            'success': False,
            'message': 'Lỗi server nội bộ'
        }), 500

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            'success': False,
            'message': 'Phương thức không được hỗ trợ'
        }), 405
