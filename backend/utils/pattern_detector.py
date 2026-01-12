"""Pattern Detector - Detect suspicious patterns"""

def detect_suspicious_patterns(diff_result):
    alerts = []
    added = diff_result.get('added', [])
    deleted = diff_result.get('deleted', [])
    stats = diff_result.get('stats', {})
    
    if stats['total_deleted'] > 100:
        alerts.append({
            'type': 'BULK_DELETION',
            'severity': 'HIGH',
            'message': f'{stats["total_deleted"]} voters deleted in single operation',
            'count': stats['total_deleted']
        })
    
    if stats['total_added'] > 100:
        alerts.append({
            'type': 'BULK_ADDITION',
            'severity': 'MEDIUM',
            'message': f'{stats["total_added"]} new voters added',
            'count': stats['total_added']
        })
    
    if added:
        registration_dates = [r['registration_date'] for r in added]
        date_counts = {}
        for date in registration_dates:
            date_counts[date] = date_counts.get(date, 0) + 1
        
        for date, count in date_counts.items():
            if count > 50:
                alerts.append({
                    'type': 'SAME_DAY_REGISTRATION',
                    'severity': 'HIGH',
                    'message': f'{count} voters registered on same day: {date}',
                    'date': date,
                    'count': count
                })
    
    return alerts
