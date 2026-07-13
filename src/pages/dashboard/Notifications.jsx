import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, UserPlus, Briefcase, Calendar } from 'lucide-react';

const notificationsData = [
  {
    id: 1,
    title: '5 New Lead',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    time: 'Just Now',
    icon: <UserPlus className="text-[#32c965]" size={28} />,
    bgColor: 'bg-[#32c965]/10',
    iconColor: 'text-[#32c965]',
    link: '#'
  },
  {
    id: 2,
    title: '10 Loan Overdue',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    time: '6:30 AM',
    icon: <Briefcase className="text-[#ff3d67]" size={28} />,
    bgColor: 'bg-[#ff3d67]/10',
    iconColor: 'text-[#ff3d67]',
    link: '#'
  },
  {
    id: 3,
    title: '15 Loan Due Date',
    description: 'Lorem ipsum dolor sit amet consectetur.',
    time: '6:30 AM',
    icon: <Calendar className="text-[#f5781e]" size={28} />,
    bgColor: 'bg-[#f5781e]/10',
    iconColor: 'text-[#f5781e]',
    link: '#'
  }
];

const Notifications = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#1b7ef7] mb-2">Notification</h2>
        <div className="flex items-center text-sm font-medium">
          <Link to="/dashboard" className="text-gray-500 hover:text-gray-800 transition-colors">
            Dashboard
          </Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-[#1b7ef7]">Notification</span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notificationsData.map((notification) => (
          <div 
            key={notification.id}
            className="bg-[#fafafa] hover:bg-gray-50 p-6 rounded-2xl flex items-center justify-between transition-colors border border-transparent hover:border-gray-100"
          >
            <div className="flex items-start gap-6">
              {/* Icon */}
              <div className="mt-1">
                {notification.icon}
              </div>

              {/* Content */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{notification.title}</h3>
                <p className="text-gray-500 text-sm mb-2">{notification.description}</p>
                <span className="text-xs font-medium text-gray-400">{notification.time}</span>
              </div>
            </div>

            {/* Action */}
            <div>
              <Link 
                to={notification.link} 
                className="text-[#5a5ce5] font-semibold text-sm hover:text-[#484ab9] transition-colors whitespace-nowrap"
              >
                Check Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
