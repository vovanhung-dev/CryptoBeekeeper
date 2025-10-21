from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from config import Config

# Models
from models.attack_log import AttackLog
from models.wallet import Wallet

# Services
from services.logger import AttackLogger
from services.web3_service import Web3Service
from services.analyzer import AttackAnalyzer

# Routes
from routes import (
    honeypot_bp,
    analytics_bp,
    init_honeypot_routes,
    init_analytics_routes
)

# Middleware
from middleware import (
    register_error_handlers,
    setup_logging_middleware,
    get_logger
)

# Utils
from utils.fake_data import FakeDataGenerator

# Get logger
logger = get_logger()

def create_app():
    """Factory function để tạo Flask app"""

    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Setup middleware
    setup_logging_middleware(app)
    register_error_handlers(app)

    logger.info("Khoi dong CryptoBeekeeper Honeypot System")

    # MongoDB connection
    try:
        mongo_client = MongoClient(Config.MONGODB_URI)
        db = mongo_client[Config.MONGODB_DB]

        # Test connection
        mongo_client.server_info()
        logger.info(f"[OK] Ket noi MongoDB thanh cong: {Config.MONGODB_DB}")
        print(f"[OK] Ket noi MongoDB thanh cong: {Config.MONGODB_DB}")

    except Exception as e:
        logger.error(f"[ERROR] Loi ket noi MongoDB: {str(e)}")
        print(f"[ERROR] Loi ket noi MongoDB: {str(e)}")
        print("[WARNING] Dam bao MongoDB dang chay tren localhost:27017")
        db = None

    # Initialize models and services
    attack_log_model = None
    wallet_model = None
    attack_logger = None
    web3_service = None
    analyzer = None

    if db is not None:
        attack_log_model = AttackLog(db)
        wallet_model = Wallet(db)

        # Initialize services
        attack_logger = AttackLogger(attack_log_model)
        web3_service = Web3Service()
        analyzer = AttackAnalyzer(attack_log_model)

        logger.info("[OK] Da khoi tao models va services")
        print("[OK] Da khoi tao models va services")
    else:
        logger.warning("[WARNING] Chay ung dung khong co database - API se tra ve loi")
        print("[WARNING] Chay ung dung khong co database - API se tra ve loi")

    # Register blueprints FIRST
    print("[DEBUG] Registering blueprints...")
    app.register_blueprint(honeypot_bp)
    print(f"[DEBUG] honeypot_bp registered with prefix: {honeypot_bp.url_prefix}")
    app.register_blueprint(analytics_bp)
    print(f"[DEBUG] analytics_bp registered with prefix: {analytics_bp.url_prefix}")

    # Initialize routes dependencies AFTER
    print("[DEBUG] Initializing route dependencies...")
    init_honeypot_routes(attack_logger, web3_service, wallet_model)
    init_analytics_routes(attack_log_model, analyzer)

    logger.info("[OK] Da dang ky tat ca routes")
    print("[OK] Da dang ky tat ca routes")

    # Debug: Print all registered routes
    print("\n[DEBUG] Registered routes:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule.endpoint}: {rule.rule} [{', '.join(rule.methods - {'HEAD', 'OPTIONS'})}]")
    print()

    # Root endpoint
    @app.route('/')
    def index():
        return jsonify({
            'message': 'CryptoBeekeeper API - Honeypot System',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'honeypot': '/api/*',
                'analytics': '/api/analytics/*'
            }
        }), 200

    # Health check
    @app.route('/health')
    def health():
        db_status = 'connected' if db is not None else 'disconnected'

        return jsonify({
            'status': 'healthy',
            'database': db_status
        }), 200

    return app


if __name__ == '__main__':
    app = create_app()

    print("\n" + "="*50)
    print("CryptoBeekeeper Honeypot System")
    print("="*50)
    print(f"Server dang chay tren: http://localhost:{Config.FLASK_PORT}")
    print(f"MongoDB Database: {Config.MONGODB_DB}")
    print("="*50 + "\n")

    app.run(
        host='0.0.0.0',
        port=Config.FLASK_PORT,
        debug=Config.FLASK_ENV == 'development'
    )
