from flask import request, g
import time
import logging
from datetime import datetime

# Setup logger
logger = logging.getLogger('cryptobeekeeper')
logger.setLevel(logging.INFO)

# File handler
file_handler = logging.FileHandler('logs/app.log')
file_handler.setLevel(logging.INFO)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

# Formatter
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
file_handler.setFormatter(formatter)
console_handler.setFormatter(formatter)

logger.addHandler(file_handler)
logger.addHandler(console_handler)


def setup_logging_middleware(app):
    """Setup request logging middleware"""

    @app.before_request
    def before_request():
        g.start_time = time.time()

        # Log incoming request
        logger.info(f"Request: {request.method} {request.path} from {request.remote_addr}")

    @app.after_request
    def after_request(response):
        # Calculate request duration
        if hasattr(g, 'start_time'):
            duration = time.time() - g.start_time
            logger.info(
                f"Response: {request.method} {request.path} - "
                f"Status: {response.status_code} - "
                f"Duration: {duration:.3f}s"
            )

        return response

    @app.teardown_request
    def teardown_request(exception=None):
        if exception:
            logger.error(f"Request error: {str(exception)}")


def get_logger():
    """Get logger instance"""
    return logger
