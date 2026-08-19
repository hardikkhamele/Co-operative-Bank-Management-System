import React, { useState } from 'react';
import { Search, Edit, Trash2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import RegionModal from '../../components/modals/RegionModal';

const mockRegions = [
  { id: 1, srNo: 1, name: 'Eastern Region', manager: 'Clark Kent', managerInitials: 'CK', managerBg: 'bg-purple-100 text-purple-600', totalBranch: 108, totalEmployee: 1242, avatar: 'https://ui-avatars.com/api/?name=Clark+Kent&background=random' },
  { id: 3, srNo: 3, name: 'Western Region', manager: 'Bruce Wayne', managerInitials: 'BW', managerBg: 'bg-gray-200 text-gray-700', totalBranch: 117, totalEmployee: 1378, avatar: '' },
  { id: 5, srNo: 5, name: 'Northern Region', manager: 'Steve Rogers', managerInitials: 'SR', managerBg: 'bg-gray-200 text-gray-700', totalBranch: 194, totalEmployee: 1842, avatar: '' },
  { id: 7, srNo: 7, name: 'Southern Region', manager: 'Scott Lang', managerInitials: 'SL', managerBg: 'bg-gray-200 text-gray-700', totalBranch: 137, totalEmployee: 1536, avatar: '' },
  { id: 8, srNo: 8, name: 'Central Region', manager: 'Peter Parker', managerInitials: 'PP', managerBg: 'bg-gray-200 text-gray-700', totalBranch: 175, totalEmployee: 1742, avatar: '' },
];

const Region = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedRegion, setSelectedRegion] = useState(null);

  const handleCreateClick = () => {
    setModalMode('create');
    setSelectedRegion(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (region) => {
    setModalMode('edit');
    setSelectedRegion(region);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumb */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-semibold text-[#1B58A6] mb-2">Region</h1>
        <div className="flex items-center text-sm text-gray-600 gap-2">
          <Link to="/dashboard" className="hover:text-gray-900 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="text-gray-400" />
          <span>Region & Branch Management</span>
          <ChevronRight size={16} className="text-gray-400" />
          <span className="text-[#1B58A6]">Region</span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] focus:border-[#1D4ED8] text-sm"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={handleCreateClick}
          className="bg-[#1D4ED8] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-medium transition-colors text-sm shadow-sm flex-shrink-0"
        >
          + Create Region
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f8f9ff] text-gray-700 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Sr.No.</th>
                <th className="px-6 py-4">Region Name</th>
                <th className="px-6 py-4">Region Manager</th>
                <th className="px-6 py-4">Total Branch</th>
                <th className="px-6 py-4">Total Employee</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockRegions.map((region) => (
                <tr key={region.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-700">{region.srNo}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{region.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {region.srNo === 1 ? (
                         <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shrink-0">
                           <img src={region.avatar} alt={region.manager} className="w-full h-full object-cover" />
                         </div>
                      ) : (
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium shrink-0 ${region.managerBg}`}>
                            {region.managerInitials}
                         </div>
                      )}
                      <span className="text-gray-700">{region.manager}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{region.totalBranch}</td>
                  <td className="px-6 py-4 text-gray-700">{region.totalEmployee}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button 
                        onClick={() => handleEditClick(region)}
                        className="text-gray-600 hover:text-gray-900 transition-colors" 
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button className="text-red-500 hover:text-red-700 transition-colors" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600 font-medium">
            Showing 1 to 5 of 5 Entries
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1D4ED8] hover:bg-gray-50 transition-colors">
              <ChevronRight size={16} className="rotate-180" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1D4ED8] text-white font-medium shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1D4ED8] text-[#1D4ED8] hover:bg-gray-50 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <RegionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={selectedRegion}
      />
    </div>
  );
};

export default Region;
