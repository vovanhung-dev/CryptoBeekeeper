from flask import request, jsonify
from datetime import datetime, timedelta
from collections import defaultdict
import threading

class SimpleRateLimiter:
    """Simple in-memory rate limiter"""

    def __init__(self):
        self.requests = defaultdict(list)
        self.lock = threading.Lock()

    def is_allowed(self, ip_address, max_requests=100, window_seconds=60):
        """Check if request is allowed"""
        with self.lock:
            now = datetime.utcnow()
            cutoff = now - timedelta(seconds=window_seconds)

            # Clean old requests
            self.requests[ip_address] = [
                req_time for req_time in self.requests[ip_address]
                if req_time > cutoff
            ]

            # Check limit
            if len(self.requests[ip_address]) >= max_requests:
                return False

            # Add current request
            self.requests[ip_address].append(now)
            return True

    def cleanup(self):
        """Clean up old data"""
        with self.lock:
            now = datetime.utcnow()
            cutoff = now - timedelta(minutes=5)

            for ip in list(self.requests.keys()):
                self.requests[ip] = [
                    req_time for req_time in self.requests[ip]
                    if req_time > cutoff
                ]

                if not self.requests[ip]:
                    del self.requests[ip]


# Global rate limiter instance
rate_limiter = SimpleRateLimiter()


def apply_rate_limit(max_requests=100, window_seconds=60):
    """Decorator for rate limiting"""
    def decorator(f):
        def wrapped(*args, **kwargs):
            ip = request.remote_addr

            if not rate_limiter.is_allowed(ip, max_requests, window_seconds):
                return jsonify({
                    'success': False,
                    'message': 'Quá nhiều requests. Vui lòng thử lại sau.'
                }), 429

            return f(*args, **kwargs)

        wrapped.__name__ = f.__name__
        return wrapped

    return decorator
