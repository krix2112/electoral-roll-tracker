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
        import pandas as pd
        # Vectorized registration date count
        dates = pd.Series([r['registration_date'] for r in added])
        date_counts = dates.value_counts()
        
        # Identify dates with > 50 registrations
        high_vol_dates = date_counts[date_counts > 50]
        
        for date, count in high_vol_dates.items():
            alerts.append({
                'type': 'SAME_DAY_REGISTRATION',
                'severity': 'HIGH',
                'message': f'{count} voters registered on same day: {date}',
                'date': str(date),
                'count': int(count)
            })

    
    return alerts
