import React from 'react';
import { Clock } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

const ComingSoon = ({ title = "Coming Soon", featureName }) => {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
      {featureName && (
        <PageHeader
          title={featureName}
          breadcrumbs={[
            { label: "Dashboard", to: "/dashboard" },
            { label: featureName }
          ]}
        />
      )}
      <div className="flex flex-col items-center justify-center min-h-[55vh] bg-white rounded-2xl shadow-xs border border-gray-100 p-8 text-center">
        <div className="w-20 h-20 bg-[#225091]/10 text-[#225091] rounded-full flex items-center justify-center mb-6">
          <Clock size={40} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">{title}</h1>
        <p className="text-gray-500 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
          {featureName 
            ? `${featureName} is under active development. It will be available in an upcoming update!`
            : "We are working hard to bring you this feature. It will be available in an upcoming update!"}
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
