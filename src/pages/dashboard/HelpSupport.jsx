import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MessageSquare } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

const HelpSupport = () => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto h-full">
      {/* Header Card */}
      <PageHeader
        title="Help & Support"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Settings" },
          { label: "Help & Support" }
        ]}
      />

      <div className="px-2">
        <p className="text-gray-600 text-lg font-medium mb-8 max-w-4xl">
          Don't hesitate to contact us whether you have a suggestion on our improvement, a complain to discuss or an issue to solve.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Call Us Card */}
          <div className="bg-[#eefceb] rounded-2xl p-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#225091] rounded-xl flex items-center justify-center text-white mb-6 shadow-sm">
              <Phone size={24} />
            </div>
            <div className="text-gray-700 font-medium mb-4">
              8080494923
            </div>
            <h3 className="text-2xl font-bold text-[#225091] mb-6">Call us</h3>
            <div className="text-gray-500 text-sm">
              Our team is on the line<br />
              Mon-Fri &bull; 10-8
            </div>
          </div>

          {/* Email Us Card */}
          <div className="bg-[#eefceb] rounded-2xl p-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[#225091] rounded-xl flex items-center justify-center text-white mb-6 shadow-sm">
              <Mail size={24} />
            </div>
            <div className="text-gray-700 font-medium mb-4">
              info@advitacredit.in
            </div>
            <h3 className="text-2xl font-bold text-[#225091] mb-6">Email us</h3>
            <div className="text-gray-500 text-sm">
              Our team is online<br />
              Mon-Fri &bull; 10-8
            </div>
          </div>
        </div>

        {/* Chat Support Card - Centered below */}
        <div className="mt-8 flex justify-center">
          <div className="bg-[#eefceb] rounded-2xl p-8 flex flex-col items-center text-center w-full max-w-xl">
            <div className="w-12 h-12 bg-[#225091] rounded-xl flex items-center justify-center text-white mb-4 shadow-sm">
              <MessageSquare size={24} />
            </div>
            <div className="text-gray-600 font-medium text-sm mb-3">
              Chat Support
            </div>
            <h3 className="text-2xl font-bold text-[#225091] mb-6">Chat With Admin</h3>
            <div className="text-gray-500 text-sm">
              Our team is on the line<br />
              Mon-Fri &bull; 10-8
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HelpSupport;
