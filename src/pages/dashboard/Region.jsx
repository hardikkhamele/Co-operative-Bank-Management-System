import React, { useState } from 'react';
import { Search, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import RegionModal from '../../components/modals/RegionModal';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import useLocations from '../../hooks/useLocations';

const mockRegions = [];

const Region = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const { states: statesList, availableCities, loading: locationsLoading } = useLocations(selectedState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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
      <PageHeader
        title="Region"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Region & Branch Management" },
          { label: "Region" }
        ]}
      />

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] text-sm"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* State Filter */}
          <div className="relative">
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity('');
              }}
              disabled={locationsLoading}
              className="pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-xs font-semibold text-gray-700 shadow-2xs appearance-none cursor-pointer disabled:bg-gray-50"
            >
              <option value="">All States</option>
              {statesList.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* City Filter */}
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="pl-3 pr-8 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#225091] focus:border-[#225091] bg-white text-xs font-semibold text-gray-700 shadow-2xs appearance-none cursor-pointer"
            >
              <option value="">All Cities</option>
              {availableCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <button 
          onClick={handleCreateClick}
          className="bg-[#225091] hover:bg-[#159a9f] text-white px-5 py-2.5 rounded-full font-medium transition-colors text-sm shadow-sm flex-shrink-0 cursor-pointer"
        >
          + Create Region
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm whitespace-nowrap text-center">
            <thead className="bg-[#225091] text-white text-xs uppercase tracking-wider font-semibold border-b border-[#225091]">
              <tr>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Sr.No.</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Region Name</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Region Manager</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Total Branch</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Total Employee</th>
                <th className="py-3.5 px-3 text-xs font-semibold text-white uppercase tracking-wider border-r border-white/20 text-center">Action</th>
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
        <Pagination
          page={page}
          totalPages={1}
          totalRecords={mockRegions.length}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
        />
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
