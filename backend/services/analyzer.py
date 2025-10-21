from datetime import datetime, timedelta
from collections import Counter

class AttackAnalyzer:
    """Service để phân tích attack patterns"""

    def __init__(self, attack_log_model):
        self.attack_log = attack_log_model

    def analyze_ip_behavior(self, ip_address, hours=24):
        """Phân tích hành vi của một IP trong X giờ"""

        start_time = datetime.utcnow() - timedelta(hours=hours)

        # Lấy tất cả logs của IP này
        result = self.attack_log.get_all(
            limit=1000,
            filters={
                'ip_address': ip_address,
                'start_date': start_time
            }
        )

        logs = result['logs']

        if not logs:
            return {
                'ip_address': ip_address,
                'total_requests': 0,
                'is_suspicious': False
            }

        # Phân tích
        total_requests = len(logs)
        endpoints = [log['endpoint'] for log in logs]
        attack_types = [log['attack_type'] for log in logs]
        methods = [log['method'] for log in logs]

        # Tính frequency
        endpoint_counter = Counter(endpoints)
        attack_type_counter = Counter(attack_types)
        method_counter = Counter(methods)

        # Đánh giá suspicious
        is_suspicious = False
        reasons = []

        # Quá nhiều requests trong thời gian ngắn
        if total_requests > 100:
            is_suspicious = True
            reasons.append(f'Quá nhiều requests: {total_requests} trong {hours} giờ')

        # Nhiều loại tấn công khác nhau
        if len(attack_type_counter) > 3:
            is_suspicious = True
            reasons.append(f'Thử nhiều loại tấn công: {len(attack_type_counter)}')

        # Requests lặp lại cùng endpoint
        most_common_endpoint, endpoint_count = endpoint_counter.most_common(1)[0]
        if endpoint_count > 50:
            is_suspicious = True
            reasons.append(f'Spam endpoint: {most_common_endpoint} ({endpoint_count} lần)')

        return {
            'ip_address': ip_address,
            'total_requests': total_requests,
            'unique_endpoints': len(endpoint_counter),
            'attack_types': dict(attack_type_counter),
            'methods': dict(method_counter),
            'most_targeted_endpoint': most_common_endpoint,
            'is_suspicious': is_suspicious,
            'suspicious_reasons': reasons,
            'time_range_hours': hours
        }

    def get_attack_trends(self, days=7):
        """Phân tích xu hướng tấn công"""

        timeline = self.attack_log.get_timeline(days=days)

        if not timeline:
            return {
                'trend': 'stable',
                'average_per_day': 0,
                'total_attacks': 0
            }

        # Tính trung bình mỗi ngày
        total_attacks = sum(item['count'] for item in timeline)
        avg_per_day = total_attacks / len(timeline) if timeline else 0

        # Phân tích trend
        if len(timeline) >= 2:
            recent_avg = sum(item['count'] for item in timeline[-3:]) / 3
            old_avg = sum(item['count'] for item in timeline[:3]) / 3

            if recent_avg > old_avg * 1.5:
                trend = 'increasing'
            elif recent_avg < old_avg * 0.5:
                trend = 'decreasing'
            else:
                trend = 'stable'
        else:
            trend = 'stable'

        return {
            'trend': trend,
            'average_per_day': round(avg_per_day, 2),
            'total_attacks': total_attacks,
            'days_analyzed': days,
            'timeline': timeline
        }

    def identify_attack_tools(self, user_agent):
        """Nhận diện công cụ tấn công từ User-Agent"""

        user_agent_lower = user_agent.lower()

        known_tools = {
            'python-requests': 'Python Requests Library',
            'curl': 'cURL Command Line',
            'postman': 'Postman API Client',
            'insomnia': 'Insomnia API Client',
            'axios': 'Axios (JavaScript)',
            'httpie': 'HTTPie',
            'wget': 'Wget',
            'scrapy': 'Scrapy Web Scraper',
            'selenium': 'Selenium Automation',
            'nikto': 'Nikto Web Scanner',
            'nmap': 'Nmap Network Scanner',
            'sqlmap': 'SQLMap',
            'burp': 'Burp Suite',
            'metasploit': 'Metasploit Framework',
            'w3af': 'W3AF Security Scanner'
        }

        for tool_key, tool_name in known_tools.items():
            if tool_key in user_agent_lower:
                return tool_name

        # Nếu không match, check browser
        if 'chrome' in user_agent_lower or 'firefox' in user_agent_lower or 'safari' in user_agent_lower:
            return 'Web Browser'

        return 'Unknown Tool'
