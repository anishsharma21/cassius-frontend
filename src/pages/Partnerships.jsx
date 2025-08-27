import React from 'react';
import PageHeader from '../components/PageHeader';
import InstagramInfluencerTile from '../components/InstagramInfluencerTile';
import { usePartnerships } from '../hooks/usePartnerships';

function Partnerships() {
  const { influencers, isLoading, error } = usePartnerships();

  if (isLoading) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-1">GEO Hub</h1>
          <p className="text-gray-600">Create generative-engine-optimized content for your business</p>
        </div>
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 bg-gray-50">
                  <div className="grid grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="text-center">
                        <div className="h-5 bg-gray-300 rounded mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-3/4 mx-auto"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-1">Partnerships</h1>
          <p className="text-gray-600">Find Instagram creators to grow your business</p>
        </div>
        <div className="mt-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800 mb-4">Failed to load influencers</p>
            <p className="text-red-600 text-sm">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-1">Partnerships</h1>
        <p className="text-gray-600">Find Instagram creators to grow your business</p>
      </div>
      
      <div className="mt-8">
        {influencers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No influencers found</p>
            <p className="text-gray-400 text-sm mt-2">Check back later for partnership opportunities</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {influencers.map((influencer) => (
              <InstagramInfluencerTile 
                key={influencer.id} 
                influencer={influencer} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Partnerships;