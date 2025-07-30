import React from 'react';
import DashboardTile from '../components/DashboardTile';

function DashboardHome() {
  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-18">
        <DashboardTile
          title="Strategy Hub"
          content={
            <div className="text-left">
              <p className="text-sm text-black">
                Data here about Strategy Hub.
              </p>
            </div>
          }
          path="../strategy"
        />
        <DashboardTile
          title="GEO Hub"
          content={
            <div className="text-left">
              <p className="text-sm text-black">
                Data here about GEO Hub.
              </p>
            </div>
          }
          path="../geo"
        />
        <DashboardTile
          title="Social Media Hub"
          content={
            <div className="text-left">
              <p className="text-sm text-black">
                Data here about Social Media Hub.
              </p>
            </div>
          }
          path="../social-media"
        />
      </div>

      <div className="mt-2">
        <div className="flex flex-wrap gap-12">
        <DashboardTile
            title="Reddit Hub"
            content={
              <div className="text-left">
                <p className="text-sm text-black">
                  Data here about Reddit Hub.
                </p>
              </div>
            }
            path="../reddit"
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
