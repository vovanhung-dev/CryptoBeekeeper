from web3 import Web3
from config import Config

class Web3Service:
    """Service để tương tác với Ethereum (fake)"""

    def __init__(self):
        # Kết nối với testnet (nếu có URL)
        if Config.ETHEREUM_TESTNET_URL:
            self.w3 = Web3(Web3.HTTPProvider(Config.ETHEREUM_TESTNET_URL))
        else:
            # Sử dụng fake provider cho testing
            self.w3 = Web3()

        self.is_connected = self.w3.is_connected() if Config.ETHEREUM_TESTNET_URL else False

    def validate_address(self, address):
        """Validate Ethereum address"""
        return self.w3.is_address(address)

    def validate_private_key(self, private_key):
        """Validate private key format"""
        try:
            # Kiểm tra format
            if not private_key.startswith('0x'):
                private_key = '0x' + private_key

            # Private key phải là 64 hex chars (32 bytes)
            if len(private_key) != 66:  # 0x + 64 chars
                return False

            # Thử convert sang int để kiểm tra hex hợp lệ
            int(private_key, 16)
            return True

        except (ValueError, TypeError):
            return False

    def get_fake_balance(self, address):
        """Lấy fake balance cho address"""
        # Trong honeypot, ta trả về fake balance
        # Không query blockchain thật

        import random
        return round(random.uniform(0.1, 5.0), 6)

    def create_fake_transaction(self, from_address, to_address, amount):
        """Tạo fake transaction (không thực sự gửi lên blockchain)"""

        # Tạo fake transaction hash
        import secrets
        tx_hash = '0x' + secrets.token_hex(32)

        fake_transaction = {
            'hash': tx_hash,
            'from': from_address,
            'to': to_address,
            'value': amount,
            'status': 'pending',
            'blockNumber': None,
            'timestamp': None,
            'is_fake': True
        }

        return fake_transaction

    def estimate_gas(self, transaction):
        """Estimate gas cho transaction (fake)"""
        # Trả về fake gas estimate
        return {
            'gas': 21000,
            'gasPrice': 20000000000,  # 20 Gwei
            'estimatedCost': '0.00042'  # ETH
        }

    def get_transaction_status(self, tx_hash):
        """Lấy status của transaction (fake)"""
        # Luôn trả về pending hoặc failed
        # Không bao giờ success để tránh attacker nghi ngờ

        return {
            'hash': tx_hash,
            'status': 'pending',
            'confirmations': 0,
            'is_fake': True
        }
