"""
Tests cho fake_data generator
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.fake_data import FakeDataGenerator

def test_generate_private_key():
    """Test generate private key"""
    key = FakeDataGenerator.generate_private_key()

    assert key.startswith('0x')
    assert len(key) == 66  # 0x + 64 hex chars

def test_generate_ethereum_address():
    """Test generate Ethereum address"""
    address = FakeDataGenerator.generate_ethereum_address()

    assert address.startswith('0x')
    assert len(address) == 42  # 0x + 40 hex chars

def test_generate_seed_phrase():
    """Test generate seed phrase"""
    # 12 words
    seed12 = FakeDataGenerator.generate_seed_phrase(12)
    assert len(seed12.split()) == 12

    # 24 words
    seed24 = FakeDataGenerator.generate_seed_phrase(24)
    assert len(seed24.split()) == 24

def test_generate_fake_balance():
    """Test generate fake balance"""
    balance = FakeDataGenerator.generate_fake_balance(0.1, 5.0)

    assert 0.1 <= balance <= 5.0
    assert isinstance(balance, float)

def test_generate_fake_wallet():
    """Test generate complete fake wallet"""
    wallet = FakeDataGenerator.generate_fake_wallet()

    assert 'address' in wallet
    assert 'private_key' in wallet
    assert 'balance' in wallet
    assert 'currency' in wallet
    assert 'seed_phrase' in wallet

    assert wallet['currency'] == 'ETH'

def test_generate_multiple_wallets():
    """Test generate multiple wallets"""
    wallets = FakeDataGenerator.generate_multiple_wallets(5)

    assert len(wallets) == 5

    # Check uniqueness
    addresses = [w['address'] for w in wallets]
    assert len(addresses) == len(set(addresses))

if __name__ == '__main__':
    import pytest
    pytest.main([__file__, '-v'])
