import { Navbar } from '../components/Navbar'
import { motion } from 'framer-motion'
import { Bell, CheckCircle2, AlertTriangle, Info } from 'lucide-react'

// Mock data - Teammate can replace this with API call
const notifications = [
    {
        id: 1,
        type: 'alert',
        title: 'Suspicious Activity Detected',
        message: 'Unusual number of voter deletions in Constituency A-12',
        time: '2 hours ago',
        read: false
    },
    {
        id: 2,
        type: 'success',
        title: 'Audit Report Ready',
        message: 'The comprehensive audit report for January 2026 is ready for download.',
        time: '5 hours ago',
        read: true
    },
    {
        id: 3,
        type: 'info',
        title: 'System Update',
        message: 'Matsetu engine updated to version 2.4. Performance improved by 15%.',
        time: '1 day ago',
        read: true
    }
]

function Notifications() {
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
                        <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-600">
                            <span className="text-indigo-600 font-bold">1</span> unread notification
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {notifications.map((notification, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                key={notification.id}
                                className={`p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-indigo-50/30' : ''}`}
                            >
                                <div className="flex gap-4">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                    ${notification.type === 'alert' ? 'bg-red-100 text-red-600' :
                                            notification.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {notification.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> :
                                            notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className={`font-semibold text-lg ${!notification.read ? 'text-indigo-900' : 'text-gray-900'}`}>
                                                {notification.title}
                                                {!notification.read && <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>}
                                            </h3>
                                            <span className="text-sm text-gray-400">{notification.time}</span>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed">{notification.message}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-8 text-center text-gray-400 text-sm">
                        End of notifications
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Notifications
