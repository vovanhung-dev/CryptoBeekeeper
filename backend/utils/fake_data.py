import secrets
import random
from web3 import Web3

class FakeDataGenerator:
    """Generator cho fake crypto data"""

    # BIP39 wordlist (simplified - 100 từ phổ biến nhất)
    BIP39_WORDS = [
        'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
        'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
        'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
        'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
        'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
        'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album',
        'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone',
        'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among',
        'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry',
        'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique',
        'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april',
        'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor',
        'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow'
    ]

    @staticmethod
    def generate_private_key():
        """Sinh fake private key (64 hex characters)"""
        return '0x' + secrets.token_hex(32)

    @staticmethod
    def generate_ethereum_address():
        """Sinh fake Ethereum address"""
        # Tạo random address
        address_bytes = secrets.token_bytes(20)
        address = Web3.to_checksum_address('0x' + address_bytes.hex())
        return address

    @staticmethod
    def generate_seed_phrase(word_count=12):
        """Sinh fake seed phrase (12 hoặc 24 từ)"""
        if word_count not in [12, 24]:
            word_count = 12

        words = random.choices(FakeDataGenerator.BIP39_WORDS, k=word_count)
        return ' '.join(words)

    @staticmethod
    def generate_fake_balance(min_value=0.1, max_value=5.0):
        """Sinh fake balance (ETH)"""
        return round(random.uniform(min_value, max_value), 6)

    @staticmethod
    def generate_fake_wallet(include_seed=True):
        """Sinh một fake wallet hoàn chỉnh"""
        wallet = {
            'address': FakeDataGenerator.generate_ethereum_address(),
            'private_key': FakeDataGenerator.generate_private_key(),
            'balance': FakeDataGenerator.generate_fake_balance(),
            'currency': 'ETH'
        }

        if include_seed:
            wallet['seed_phrase'] = FakeDataGenerator.generate_seed_phrase()

        return wallet

    @staticmethod
    def generate_multiple_wallets(count=10):
        """Sinh nhiều fake wallets"""
        wallets = []
        for _ in range(count):
            wallets.append(FakeDataGenerator.generate_fake_wallet())

        return wallets
