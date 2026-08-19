import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, ChevronDown, Edit, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';

const mockBanners = [
  { id: 1, portalType: 'Customer App', bannerType: 'Top Slider', category: 'Home Loan', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80' },
  { id: 2, portalType: 'Customer App', bannerType: 'Top Slider', category: 'Personal Loan', image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=400&q=80' },
  { id: 3, portalType: 'Customer App', bannerType: 'Top Slider', category: 'Car Loan', image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80' },
  { id: 4, portalType: 'Loan Executive App', bannerType: 'Top Slider', category: 'Home Loan', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80' },
];

const Banners = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);

  return (
    <div className="max-w-[1400px] w-full">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h2 className="text-xl font-bold text-[#1b7ef7] mb-2">Banner Management</h2>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <Link to="/dashboard" className="hover:text-gray-800 transition-colors">Dashboard</Link>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span>App Management</span>
          <ChevronRight size={16} className="mx-1 text-gray-400" />
          <span className="text-[#1B58A6]">Banner Management</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        
        {/* Left Side: Search */}
        <div className="flex items-center w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-[#1D4ED8] focus:border-[#1D4ED8] sm:text-sm bg-white shadow-sm"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Right Side: Add Button */}
        <div className="flex items-center w-full md:w-auto justify-end">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#1D4ED8] hover:bg-[#159a9f] text-white py-2.5 px-6 rounded-full text-sm font-medium transition-colors shadow-sm whitespace-nowrap w-full md:w-auto"
          >
            + Create Banner
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#f4f2ff]">
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Sr.No.</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Portal Type</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Banner Type</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm">Product Category</th>
                <th className="py-4 px-6 font-semibold text-gray-700 text-sm text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockBanners.map((banner, idx) => (
                <tr key={banner.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-6 px-6 text-sm text-gray-600">{idx + 1}</td>
                  <td className="py-6 px-6 text-sm text-gray-600 font-medium">{banner.portalType}</td>
                  <td className="py-6 px-6 text-sm text-gray-600">{banner.bannerType}</td>
                  <td className="py-6 px-6">
                    <div 
                      onClick={() => { setSelectedBanner(banner); setIsPreviewModalOpen(true); }}
                      className="relative w-64 h-24 rounded-lg overflow-hidden shadow-sm group cursor-pointer"
                    >
                      <img src={banner.image} alt={banner.category} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute top-2 left-2 flex items-center gap-1.5 text-white">
                        <ImageIcon size={12} className="opacity-80" />
                        <span className="text-[10px] font-semibold opacity-90">Company Name</span>
                      </div>
                      <div className="absolute top-2 right-2 text-white text-xs font-semibold px-2 py-0.5 rounded bg-black/30 backdrop-blur-sm">
                        {banner.category}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                        <div>
                          <p className="text-white text-sm font-bold leading-tight mb-1">Get Instant {banner.category}<br/>at 7% Interest</p>
                          <span className="inline-block bg-white/20 backdrop-blur-md border border-white/40 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">Know More</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6 text-right">
                    <div className="flex justify-end items-center gap-4">
                      <button className="text-gray-500 hover:text-gray-800 transition-colors">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => { setBannerToDelete(banner); setIsDeleteModalOpen(true); }}
                        className="text-[#ff3d67] hover:text-[#e02e55] transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 text-sm text-gray-600">
        <div className="mb-4 sm:mb-0 font-medium text-[15px]">
          Showing 1 to 4 of 12 Entries
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1D4ED8] hover:bg-teal-50 transition-colors bg-white">
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-[#1D4ED8] text-white font-medium shadow-sm">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1D4ED8] hover:bg-teal-50 transition-colors bg-white font-medium">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1D4ED8] hover:bg-teal-50 transition-colors bg-white font-medium">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-[#1D4ED8] hover:bg-teal-50 transition-colors bg-white">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Create Banner Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#f4f3fb] rounded-xl w-full max-w-[500px] shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-200/50">
              <h2 className="text-[17px] font-bold text-[#1b2559]">Create Banner</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-800 transition-colors">
                <X size={22} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Portal Type</label>
                  <div className="relative">
                    <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all bg-white appearance-none text-gray-500 shadow-sm text-sm">
                      <option value="" disabled selected>Select</option>
                      <option value="customer">Customer App</option>
                      <option value="executive">Loan Executive App</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Banner Type</label>
                  <div className="relative">
                    <select className="w-full px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8] transition-all bg-white appearance-none text-gray-500 shadow-sm text-sm">
                      <option value="" disabled selected>Select</option>
                      <option value="top">Top Slider</option>
                      <option value="middle">Middle Banner</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-800 mb-2">Upload Banner</label>
                <div className="w-full px-4 py-8 rounded-xl border-2 border-dashed border-gray-200 bg-white hover:bg-gray-50 transition-colors flex flex-col items-center justify-center cursor-pointer shadow-sm">
                  <Upload size={20} className="text-gray-500 mb-2" />
                  <span className="text-[13px] text-gray-600">Upload image (jpg, jpeg, png)</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2 rounded-full border border-[#1D4ED8] text-[#1D4ED8] font-semibold hover:bg-teal-50 transition-colors text-sm bg-white"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2 rounded-full bg-[#1D4ED8] text-white font-semibold hover:bg-[#168f94] transition-colors shadow-sm text-sm"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Banner</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete this banner? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setBannerToDelete(null); }}
                className="flex-1 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setIsDeleteModalOpen(false); setBannerToDelete(null); }}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Banner Modal */}
      {isPreviewModalOpen && selectedBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-[#cfcfcf] rounded-xl w-full max-w-4xl flex flex-col p-4">
            
            <div className="mb-2">
              <span className="text-gray-500 font-medium text-sm">Banner Preview</span>
            </div>

            <div className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-md bg-gray-200">
              <img src={selectedBanner.image} alt={selectedBanner.category} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30"></div>
              
              <div className="absolute top-6 left-6 flex items-center gap-3 text-white">
                <ImageIcon size={24} className="opacity-90" />
                <span className="text-xl font-bold opacity-100">Company Name</span>
              </div>
              
              <div className="absolute top-6 right-16 text-white text-2xl font-bold">
                {selectedBanner.category}
              </div>

              <div className="absolute bottom-12 left-10 right-10 flex justify-between items-end">
                <div>
                  <h3 className="text-white text-[40px] font-bold leading-tight mb-6">
                    Get Instant {selectedBanner.category}<br/>at 0% Interest
                  </h3>
                  <button className="bg-white border-[3px] border-[#1D4ED8] text-[#1D4ED8] text-lg font-bold px-8 py-2.5 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                    Know More
                  </button>
                </div>
              </div>

              {/* Close Button on Banner */}
              <button 
                onClick={() => setIsPreviewModalOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center hover:bg-[#168f94] transition-colors shadow-md z-10"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
