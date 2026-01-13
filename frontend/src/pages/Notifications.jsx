import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react'

// TEMP SAMPLE DATA — WILL BE REPLACED BY BACKEND
const generateSampleNotifications = () => {
  const now = new Date();
  const sampleNotifications = [
    {
      id: 1,
      title: 'Suspicious Activity Detected',
      message: 'Unusual number of voter deletions detected in Assembly Constituency 103 - North District. A total of 189 deletions were recorded on January 11-12, 2026, which represents a 2.4× increase compared to the previous week. This requires immediate review and verification.',
      severity: 'critical',
      relatedEntity: 'AC-103',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      action: 'View Details',
      actionUrl: '/diffviewer',
      actionType: 'navigate'
    },
    {
      id: 2,
      title: 'Audit Report Ready',
      message: 'The comprehensive audit report for January 2026 has been generated and is ready for download. The report includes all roll changes, constituency-level summaries, and risk assessments.',
      severity: 'success',
      relatedEntity: 'Monthly Report - January 2026',
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      read: true,
      action: 'Download Report',
      actionUrl: '/dashboard',
      actionType: 'navigate'
    },
    {
      id: 3,
      title: 'System Update Completed',
      message: 'RollDiff engine has been updated to version 2.4. Performance improvements include a 15% reduction in processing time and enhanced data validation algorithms. All systems are operating normally.',
      severity: 'info',
      relatedEntity: 'System Maintenance',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 4,
      title: 'High Deletion Volume Alert',
      message: 'Municipal Ward 13 - Central District has recorded 137 deletions in the past 48 hours. This exceeds the normal threshold and may require investigation.',
      severity: 'warning',
      relatedEntity: 'Ward-13',
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
      read: false,
      action: 'View Details',
      actionUrl: '/diffviewer',
      actionType: 'navigate'
    },
    {
      id: 5,
      title: 'Data Validation Complete',
      message: 'Scheduled data validation for all constituencies has completed successfully. No inconsistencies were detected in the electoral roll database.',
      severity: 'success',
      relatedEntity: 'System Validation',
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      read: true,
      action: 'View Report',
      actionUrl: '/dashboard',
      actionType: 'navigate'
    },
    {
      id: 6,
      title: 'Backup Completed',
      message: 'Daily database backup has been completed successfully. All electoral roll data has been securely archived.',
      severity: 'info',
      relatedEntity: 'System Backup',
      timestamp: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 7,
      title: 'Constituency Analysis Available',
      message: 'Detailed analysis report for Assembly Constituency 107 - Central District is now available. The report shows 203 total changes with high-risk deletion patterns detected.',
      severity: 'warning',
      relatedEntity: 'AC-107',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      read: false,
      action: 'View Details',
      actionUrl: '/diffviewer',
      actionType: 'navigate'
    },
    {
      id: 8,
      title: 'Weekly Summary Report Generated',
      message: 'Weekly summary report for the period January 8-14, 2026 has been generated. The report includes statistics, trend analysis, and risk assessments for all constituencies.',
      severity: 'success',
      relatedEntity: 'Weekly Report - Week 2',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      read: true,
      action: 'View Report',
      actionUrl: '/dashboard',
      actionType: 'navigate'
    },
    {
      id: 9,
      title: 'Anomaly Detected in Booth-B46',
      message: 'Polling Booth B46 - South District has shown unusual modification patterns. 132 modifications were recorded in a single day, which is significantly higher than the baseline.',
      severity: 'critical',
      relatedEntity: 'Booth-B46',
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      read: false,
      action: 'View Details',
      actionUrl: '/diffviewer',
      actionType: 'navigate'
    },
    {
      id: 10,
      title: 'Monthly Export Ready',
      message: 'Monthly data export for January 2026 is ready. The export includes all roll changes, audit logs, and constituency-level breakdowns in CSV format.',
      severity: 'info',
      relatedEntity: 'Monthly Export - January 2026',
      timestamp: new Date(now.getTime() - 10 * 60 * 60 * 1000).toISOString(),
      read: true,
      action: 'Download Report',
      actionUrl: '/dashboard',
      actionType: 'navigate'
    }
  ];
  return sampleNotifications;
};

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(() => generateSampleNotifications());
  const [expandedId, setExpandedId] = useState(null);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const handleNotificationClick = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  const handleAction = (e, notification) => {
    e.stopPropagation();
    
    if (notification.actionType === 'navigate' && notification.actionUrl) {
      navigate(notification.actionUrl);
    } else if (notification.actionType === 'download') {
      console.log(`Downloading report: ${notification.relatedEntity}`);
    } else {
      console.log(`Action clicked: ${notification.action} for ${notification.title}`);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-red-50',
          iconColor: 'text-red-600',
          border: 'border-l-4 border-red-500'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-600',
          border: 'border-l-4 border-amber-500'
        };
      case 'success':
        return {
          icon: CheckCircle2,
          iconBg: 'bg-green-50',
          iconColor: 'text-green-600',
          border: 'border-l-4 border-green-500'
        };
      case 'info':
      default:
        return {
          icon: Info,
          iconBg: 'bg-blue-50',
          iconColor: 'text-blue-600',
          border: 'border-l-4 border-blue-500'
        };
    }
  };

  const IconComponent = ({ severity }) => {
    const styles = getSeverityStyles(severity);
    const Icon = styles.icon;
    return <Icon className={`w-5 h-5 ${styles.iconColor}`} />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-500 mt-1">Manage your alerts and system updates</p>
            </div>
            {unreadCount > 0 && (
              <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
                <span className="text-indigo-600 font-bold">{unreadCount}</span> unread notification{unreadCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No system alerts at this time.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {notifications.map((notification) => {
                const styles = getSeverityStyles(notification.severity);
                const isExpanded = expandedId === notification.id;
                
                return (
                  <div
                    key={notification.id}
                    className={`p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? `${styles.border} bg-gray-50/50` : ''
                    }`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${styles.iconBg}`}>
                        <IconComponent severity={notification.severity} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className={`font-semibold text-lg ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                            {!notification.read && (
                              <span className="ml-2 inline-block w-2 h-2 bg-indigo-500 rounded-full"></span>
                            )}
                          </h3>
                          <span className="text-sm text-gray-400 whitespace-nowrap ml-2">{formatTimestamp(notification.timestamp)}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">{notification.message}</p>
                        
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                            <div className="text-sm">
                              <span className="text-gray-500 font-medium">Related Entity: </span>
                              <span className="text-gray-700">{notification.relatedEntity}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500 font-medium">Timestamp: </span>
                              <span className="text-gray-700">
                                {new Date(notification.timestamp).toLocaleString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                  hour12: true
                                })}
                              </span>
                            </div>
                            {notification.action && (
                              <div className="pt-2">
                                <button
                                  onClick={(e) => handleAction(e, notification)}
                                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                  {notification.action}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {notifications.length > 0 && (
            <div className="mt-8 text-center text-gray-400 text-sm">
              End of notifications
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications
