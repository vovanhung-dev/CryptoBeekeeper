import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Cấu hình ứng dụng Flask"""

    # Flask config
    FLASK_APP = os.getenv('FLASK_APP', 'app.py')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    FLASK_PORT = int(os.getenv('FLASK_PORT', 5000))
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

    # MongoDB config
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
    MONGODB_DB = os.getenv('MONGODB_DB', 'cryptobeekeeper')

    # Ethereum Testnet
    ETHEREUM_TESTNET_URL = os.getenv('ETHEREUM_TESTNET_URL', '')

    # Log retention (days)
    LOG_RETENTION_DAYS = 90

    # Fake wallet settings
    FAKE_WALLETS_COUNT = 10
    FAKE_BALANCE_MIN = 0.1
    FAKE_BALANCE_MAX = 5.0
