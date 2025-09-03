import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import InstagramInfluencerTile from '../components/InstagramInfluencerTile';
import { usePartnerships } from '../hooks/usePartnerships';

function Partnerships() {
  const { influencers, isLoading, error } = usePartnerships();
  const [detailsModal, setDetailsModal] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // ESC key handler for modals
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        if (detailsModal) {
          setDetailsModal(null);
        } else if (showInfoModal) {
          setShowInfoModal(false);
        }
      }
    };

    if (detailsModal || showInfoModal) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [detailsModal, showInfoModal]);

  if (isLoading) {
    return (
      <div className="p-6 bg-white min-h-screen">
        <div className="mb-12">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-1">Partnerships</h1>
              <p className="text-gray-600">Find Instagram creators to grow your business</p>
            </div>
            
            {/* Information button */}
            <button
              onClick={() => setShowInfoModal(true)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
              title="Learn about partnership strategy"
            >
              <span className="text-sm">How to use</span>
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <span className="text-xs font-bold">?</span>
              </div>
            </button>
          </div>
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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-1">Partnerships</h1>
              <p className="text-gray-600">Find Instagram creators to grow your business</p>
            </div>
            
            {/* Information button */}
            <button
              onClick={() => setShowInfoModal(true)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
              title="Learn about partnership strategy"
            >
              <span className="text-sm">How to use</span>
              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <span className="text-xs font-bold">?</span>
              </div>
            </button>
          </div>
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-1">Partnerships</h1>
            <p className="text-gray-600">Find Instagram creators to grow your business</p>
          </div>
          
          {/* Information button */}
          <button
            onClick={() => setShowInfoModal(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
            title="Learn about partnership strategy"
          >
            <span className="text-sm">How to use</span>
            <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
              <span className="text-xs font-bold">?</span>
            </div>
          </button>
        </div>
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
                onShowDetails={setDetailsModal}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {detailsModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.75)'}} onClick={() => setDetailsModal(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Influencer Details</h3>
              <button 
                onClick={() => setDetailsModal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {/* Header with photo and name */}
              <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
                <div className="flex justify-center sm:justify-start">
                  <div className="relative">
                    <img 
                      src={detailsModal.photo} 
                      alt={detailsModal.name}
                      className="w-24 h-24 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(detailsModal.name || 'Influencer')}&background=random`;
                      }}
                    />
                    {/* Instagram logo overlay */}
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-1.5">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{detailsModal.name}</h2>
                  <div className="mt-2 space-y-2">
                    <a
                      href={`https://instagram.com/${detailsModal.instagram?.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center break-all"
                    >
                      <span className="mr-1">@{detailsModal.instagram?.replace('@', '')}</span>
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                      </svg>
                    </a>
                    {detailsModal.location && (
                      <p className="text-sm text-gray-500 inline-flex items-center break-words">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{detailsModal.location}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{detailsModal.followers ? (detailsModal.followers >= 1000000 ? (detailsModal.followers / 1000000).toFixed(1) + 'M' : detailsModal.followers >= 1000 ? (detailsModal.followers / 1000).toFixed(1) + 'K' : detailsModal.followers.toString()) : '0'}</div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{detailsModal.posts || '0'}</div>
                  <div className="text-sm text-gray-500">Posts</div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">About</h4>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {detailsModal.description || detailsModal.bio || 'No description available'}
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setDetailsModal(null)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{backgroundColor: 'rgba(0, 0, 0, 0.75)'}} onClick={() => setShowInfoModal(false)}>
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Partnership Strategy</h3>
              <button 
                onClick={() => setShowInfoModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 prose prose-blue max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Partnerships with creators and micro-influencers can be one of the most powerful ways to grow. Right now, Cassius is focused on finding the perfect influencers for your product.
              </p>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Why this matters:</h4>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Influence drives action:</strong> People trust recommendations from creators they already follow.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Micro-influencers convert:</strong> Smaller creators often have higher engagement and more authentic communities.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Clear deals win:</strong> Approaching influencers without a plan makes it harder to get results.</span>
                </li>
              </ul>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Tips for usage:</h4>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <div>
                    <span>Always have a campaign goal in mind before reaching out. Do you want to:</span>
                    <ul className="mt-2 ml-4 space-y-1">
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span>Pay them upfront?</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span>Ask for their rates first?</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span>Structure a performance deal (like $1 per 1,000 views)?</span>
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        <span>Offer an affiliate arrangement?</span>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Be clear on what you want and how you'll measure success. This makes negotiation smoother and more attractive for the influencer.</span>
                </li>
              </ul>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Coming soon:</h4>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Messaging Agent:</strong> Reach out directly to creators from inside Cassius, following best practices on deal structures.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Negotiation Agent:</strong> Set parameters and let AI handle the back-and-forth to secure deals for you.</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>AI UGC Model:</strong> Automatically generate influencer-style videos tailored to your brand</span>
                </li>
              </ul>
              
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-blue-800 font-medium">
                  For now, focus on identifying the right creators and experimenting with deal structures that fit your budget and goals.
                </p>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Partnerships;