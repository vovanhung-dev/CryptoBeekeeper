from flask import request
from models.attack_log import AttackLog
from utils.ip_tracker import IPTracker

class AttackLogger:
    """Service để ghi log tấn công"""

    def __init__(self, attack_log_model: AttackLog):
        self.attack_log = attack_log_model
        self.ip_tracker = IPTracker()

    def log_request(self, attack_type='unknown', additional_data=None):
        """Ghi log một request"""

        # Lấy IP address
        ip_address = self._get_client_ip()

        # Lấy geolocation
        geolocation = self.ip_tracker.get_geolocation(ip_address)

        # Tạo log data
        log_data = {
            'ip_address': ip_address,
            'method': request.method,
            'endpoint': request.path,
            'headers': dict(request.headers),
            'query_params': dict(request.args),
            'attack_type': attack_type,
            'user_agent': request.headers.get('User-Agent', 'Unknown'),
            'geolocation': geolocation,
            'response_status': 200
        }

        # Thêm payload nếu có
        if request.is_json:
            log_data['payload'] = request.get_json()
        elif request.form:
            log_data['payload'] = dict(request.form)

        # Merge additional data
        if additional_data:
            log_data.update(additional_data)

        # Lưu vào database
        log_id = self.attack_log.create(log_data)

        return log_id

    def _get_client_ip(self):
        """Lấy IP address của client (xử lý proxy)"""
        if request.headers.get('X-Forwarded-For'):
            # Client đằng sau proxy
            ip = request.headers.get('X-Forwarded-For').split(',')[0].strip()
        elif request.headers.get('X-Real-IP'):
            ip = request.headers.get('X-Real-IP')
        else:
            ip = request.remote_addr

        return ip

    def analyze_attack_type(self):
        """Phân tích loại tấn công dựa trên request"""
        path = request.path
        method = request.method
        payload = request.get_json() if request.is_json else {}

        # Brute force detection
        if 'private_key' in str(payload) or 'seed' in str(payload):
            return 'brute_force'

        # API exploit
        if method in ['PUT', 'DELETE', 'PATCH']:
            return 'api_exploit'

        # Transaction test
        if 'transfer' in path or 'transaction' in path:
            return 'transaction_test'

        # Scan
        if method == 'GET' and 'balance' in path:
            return 'balance_scan'

        return 'unknown'
