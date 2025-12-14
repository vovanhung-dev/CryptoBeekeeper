from flask import Blueprint, request, jsonify
from services.logger import AttackLogger
from services.web3_service import Web3Service
from models.wallet import Wallet

honeypot_bp = Blueprint('honeypot', __name__, url_prefix='/api')

# Global variables (sẽ được inject từ app.py)
attack_logger = None
web3_service = None
wallet_model = None

def init_honeypot_routes(logger, w3_service, wallet):
    """Initialize routes với dependencies"""
    global attack_logger, web3_service, wallet_model
    attack_logger = logger
    web3_service = w3_service
    wallet_model = wallet


@honeypot_bp.route('/wallet/list', methods=['GET'])
def list_wallets():
    """API lấy danh sách tất cả fake wallets"""

    if wallet_model is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    try:
        limit = request.args.get('limit', 100, type=int)
        skip = request.args.get('skip', 0, type=int)

        result = wallet_model.get_all(limit=limit, skip=skip)

        return jsonify({
            'success': True,
            'data': result
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi lấy danh sách ví: {str(e)}'
        }), 500


@honeypot_bp.route('/wallet/<address>', methods=['GET'])
def get_wallet_detail(address):
    """API lấy chi tiết một wallet"""

    if wallet_model is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    try:
        wallet = wallet_model.get_by_address(address)

        if not wallet:
            return jsonify({
                'success': False,
                'message': 'Không tìm thấy ví'
            }), 404

        return jsonify({
            'success': True,
            'data': wallet
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi: {str(e)}'
        }), 500


@honeypot_bp.route('/wallet/<address>', methods=['DELETE'])
def delete_wallet(address):
    """API xóa wallet"""

    if wallet_model is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    try:
        result = wallet_model.collection.delete_one({'address': address})

        if result.deleted_count > 0:
            return jsonify({
                'success': True,
                'message': 'Đã xóa ví thành công'
            }), 200
        else:
            return jsonify({
                'success': False,
                'message': 'Không tìm thấy ví để xóa'
            }), 404

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi xóa ví: {str(e)}'
        }), 500


@honeypot_bp.route('/wallet/create', methods=['POST'])
def create_wallet():
    """API tạo wallet mới (HONEYPOT - fake)"""

    if attack_logger is None or wallet_model is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    # Log request
    attack_logger.log_request(attack_type='wallet_creation')

    try:
        # Lấy data từ request (nếu có)
        data = request.get_json() if request.is_json else {}

        # Generate fake wallet
        from utils.fake_data import FakeDataGenerator

        fake_wallet = FakeDataGenerator.generate_fake_wallet()

        # Lưu vào database
        wallet_model.create(fake_wallet)

        # Trả về response (giả vờ thành công)
        return jsonify({
            'success': True,
            'message': 'Tạo ví thành công',
            'data': {
                'address': fake_wallet['address'],
                'balance': fake_wallet['balance'],
                'currency': fake_wallet['currency']
                # KHÔNG trả về private_key và seed_phrase ngay
                # Để attacker phải gọi API khác
            }
        }), 201

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi tạo ví: {str(e)}'
        }), 500


@honeypot_bp.route('/wallet/import', methods=['POST'])
def import_wallet():
    """API import wallet từ seed phrase (HONEYPOT - fake)"""

    if attack_logger is None or wallet_model is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    # Log request
    attack_logger.log_request(attack_type='wallet_import')

    try:
        data = request.get_json()

        if not data or 'seed_phrase' not in data:
            return jsonify({
                'success': False,
                'message': 'Thiếu seed phrase'
            }), 400

        seed_phrase = data['seed_phrase']

        # Validate seed phrase (lỏng lẻo - cố ý)
        words = seed_phrase.split()
        if len(words) not in [12, 24]:
            return jsonify({
                'success': False,
                'message': 'Seed phrase phải có 12 hoặc 24 từ'
            }), 400

        # Generate fake wallet từ seed
        from utils.fake_data import FakeDataGenerator

        fake_wallet = FakeDataGenerator.generate_fake_wallet()
        fake_wallet['seed_phrase'] = seed_phrase

        # Lưu vào database
        wallet_model.create(fake_wallet)

        return jsonify({
            'success': True,
            'message': 'Import ví thành công',
            'data': {
                'address': fake_wallet['address'],
                'balance': fake_wallet['balance']
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi import ví: {str(e)}'
        }), 500


@honeypot_bp.route('/wallet/balance', methods=['GET'])
def get_balance():
    """API lấy balance (HONEYPOT - fake)"""

    if attack_logger is None or web3_service is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    # Log request
    attack_logger.log_request(attack_type='balance_scan')

    try:
        address = request.args.get('address')

        if not address:
            return jsonify({
                'success': False,
                'message': 'Thiếu địa chỉ ví'
            }), 400

        # Validate address (lỏng lẻo)
        if not web3_service.validate_address(address):
            return jsonify({
                'success': False,
                'message': 'Địa chỉ ví không hợp lệ'
            }), 400

        # Lấy fake balance
        balance = web3_service.get_fake_balance(address)

        return jsonify({
            'success': True,
            'data': {
                'address': address,
                'balance': balance,
                'currency': 'ETH'
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi lấy số dư: {str(e)}'
        }), 500


@honeypot_bp.route('/transfer', methods=['POST'])
def transfer():
    """API chuyển tiền (HONEYPOT - fake transaction)"""

    if attack_logger is None or web3_service is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    # Log request
    attack_logger.log_request(attack_type='transaction_test')

    try:
        data = request.get_json()

        # Validation lỏng lẻo
        required_fields = ['from_address', 'to_address', 'amount']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Thiếu trường: {field}'
                }), 400

        from_address = data['from_address']
        to_address = data['to_address']
        amount = data['amount']

        # Validate addresses
        if not web3_service.validate_address(from_address):
            return jsonify({
                'success': False,
                'message': 'Địa chỉ gửi không hợp lệ'
            }), 400

        if not web3_service.validate_address(to_address):
            return jsonify({
                'success': False,
                'message': 'Địa chỉ nhận không hợp lệ'
            }), 400

        # Tạo fake transaction
        fake_tx = web3_service.create_fake_transaction(
            from_address,
            to_address,
            amount
        )

        # Estimate gas
        gas_estimate = web3_service.estimate_gas(fake_tx)

        return jsonify({
            'success': True,
            'message': 'Giao dịch đang được xử lý',
            'data': {
                'transaction_hash': fake_tx['hash'],
                'status': 'pending',
                'from': from_address,
                'to': to_address,
                'amount': amount,
                'gas': gas_estimate
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi chuyển tiền: {str(e)}'
        }), 500


@honeypot_bp.route('/transaction/history', methods=['GET'])
def transaction_history():
    """API lấy lịch sử giao dịch (HONEYPOT - fake)"""

    if attack_logger is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    # Log request
    attack_logger.log_request(attack_type='history_scan')

    try:
        address = request.args.get('address')

        if not address:
            return jsonify({
                'success': False,
                'message': 'Thiếu địa chỉ ví'
            }), 400

        # Generate fake transaction history
        import random
        from datetime import datetime, timedelta

        fake_transactions = []
        for i in range(random.randint(3, 10)):
            fake_transactions.append({
                'hash': '0x' + ''.join(random.choices('0123456789abcdef', k=64)),
                'from': address if random.random() > 0.5 else '0x' + ''.join(random.choices('0123456789abcdef', k=40)),
                'to': '0x' + ''.join(random.choices('0123456789abcdef', k=40)) if random.random() > 0.5 else address,
                'value': round(random.uniform(0.01, 1.0), 6),
                'timestamp': (datetime.utcnow() - timedelta(days=random.randint(1, 30))).isoformat(),
                'status': 'success'
            })

        return jsonify({
            'success': True,
            'data': {
                'address': address,
                'transactions': fake_transactions,
                'total': len(fake_transactions)
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi lấy lịch sử: {str(e)}'
        }), 500


@honeypot_bp.route('/transaction/status', methods=['GET'])
def transaction_status():
    """API kiểm tra trạng thái transaction (HONEYPOT - fake)"""

    if attack_logger is None or web3_service is None:
        return jsonify({
            'success': False,
            'message': 'Database chưa được kết nối'
        }), 503

    # Log request
    attack_logger.log_request(attack_type='status_check')

    try:
        tx_hash = request.args.get('hash')

        if not tx_hash:
            return jsonify({
                'success': False,
                'message': 'Thiếu transaction hash'
            }), 400

        # Get fake status
        status = web3_service.get_transaction_status(tx_hash)

        return jsonify({
            'success': True,
            'data': status
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi kiểm tra trạng thái: {str(e)}'
        }), 500
