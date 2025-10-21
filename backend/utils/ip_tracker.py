import requests

class IPTracker:
    """Tracker để lấy geolocation từ IP address"""

    @staticmethod
    def get_geolocation(ip_address):
        """Lấy geolocation từ IP address (sử dụng free API)"""
        if not ip_address or ip_address == '127.0.0.1' or ip_address == 'localhost':
            return {
                'country': 'Unknown',
                'city': 'Unknown',
                'latitude': 0,
                'longitude': 0
            }

        try:
            # Sử dụng ip-api.com (free, không cần API key)
            response = requests.get(
                f'http://ip-api.com/json/{ip_address}',
                timeout=5
            )

            if response.status_code == 200:
                data = response.json()

                if data.get('status') == 'success':
                    return {
                        'country': data.get('country', 'Unknown'),
                        'country_code': data.get('countryCode', 'Unknown'),
                        'region': data.get('regionName', 'Unknown'),
                        'city': data.get('city', 'Unknown'),
                        'latitude': data.get('lat', 0),
                        'longitude': data.get('lon', 0),
                        'timezone': data.get('timezone', 'Unknown'),
                        'isp': data.get('isp', 'Unknown')
                    }

        except Exception as e:
            print(f"Error getting geolocation for {ip_address}: {str(e)}")

        return {
            'country': 'Unknown',
            'city': 'Unknown',
            'latitude': 0,
            'longitude': 0
        }

    @staticmethod
    def is_suspicious_ip(ip_address, known_vpn_ranges=None):
        """Kiểm tra IP có khả nghi không (VPN, Tor, v.v.)"""
        # Simplified version - chỉ kiểm tra basic
        # Trong production nên dùng service chuyên nghiệp

        if known_vpn_ranges is None:
            known_vpn_ranges = []

        # Kiểm tra IP private
        if ip_address.startswith('10.') or ip_address.startswith('192.168.') or ip_address.startswith('172.'):
            return False

        # TODO: Thêm logic kiểm tra VPN/Tor/Proxy
        return False
