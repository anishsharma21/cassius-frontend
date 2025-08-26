import React from 'react';
import PageHeader from '../components/PageHeader';
import { influencers } from '../components/InfluencerData';
import InstagramInfluencerTile from '../components/InstagramInfluencerTile';

function Partnerships() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <PageHeader
        title="Partnerships"
        subtitle="Find Instagram creators to grow your business"
      />
      
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {influencers.map((influencer) => (
            <InstagramInfluencerTile 
              key={influencer.id} 
              influencer={influencer} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Partnerships;