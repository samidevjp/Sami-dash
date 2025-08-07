import React, { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { X, Bookmark, Phone, Mail, Calendar, Users } from 'lucide-react';
import ChatBox from './chat-box';

interface RequestedBookingDetailProps {
  isDetailOpen: boolean;
  handleCloseDetail: () => void;
  selectedBooking: any;
}

const RequestedBookingDetail: React.FC<RequestedBookingDetailProps> = ({
  isDetailOpen,
  handleCloseDetail,
  selectedBooking
}) => {
  const detailRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'guest' | 'chat'>('guest');

  useEffect(() => {
    if (isDetailOpen) {
      document.addEventListener('mouseup', handleClickOutside);
    } else {
      document.removeEventListener('mouseup', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, [isDetailOpen]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      detailRef.current &&
      !detailRef.current.contains(event.target as Node)
    ) {
      event.preventDefault();
      event.stopPropagation();
      setTimeout(() => handleCloseDetail(), 0);
    }
  };

  return (
    <div
      ref={detailRef}
      onMouseDown={(e) => e.stopPropagation()}
      className={`fixed right-0 top-0 z-50 h-full w-full transform bg-background shadow-lg transition-all duration-300 ease-in-out md:w-2/3
      ${
        isDetailOpen
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
    >
      <div className="relative h-full max-h-dvh">
        <button
          className="absolute right-4 top-4 hover:text-gray-800"
          onClick={handleCloseDetail}
        >
          <X size={24} />
        </button>
        <h1 className="mb-6 ml-6 border-b pb-4 pt-12 text-xl font-bold">
          Requested Booking
        </h1>
        <div className="flex border-b md:hidden">
          <button
            className={`w-1/2 p-2 ${
              activeTab === 'guest' ? 'border-b-2 border-primary' : ''
            }`}
            onClick={() => setActiveTab('guest')}
          >
            Request Detail
          </button>
          <button
            className={`w-1/2 p-2 ${
              activeTab === 'chat' ? 'border-b-2 border-primary' : ''
            }`}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
        </div>
        <div className="h-full max-h-[calc(100dvh-150px)] md:flex">
          <div
            className={`h-full overflow-y-auto p-8 md:w-1/2 md:border-r md:py-0 ${
              activeTab === 'guest' ? 'block' : 'hidden'
            } md:block`}
          >
            <div className="">
              {/* Guest Information */}
              <h2 className="mb-4 text-sm font-bold">Guest information</h2>
              <div className="mb-10 rounded-lg bg-secondary p-4">
                <div className="">
                  <div className="mb-2 flex items-center">
                    <Bookmark size={16} />
                    <p className="ml-4 text-sm">
                      {selectedBooking?.guest?.first_name}{' '}
                      {selectedBooking?.guest?.last_name}
                    </p>
                  </div>
                  <div className="mb-2 flex items-center">
                    <Phone size={16} />
                    <p className="ml-4 text-sm">
                      {selectedBooking?.guest?.phone || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Mail size={16} />
                    <p className="ml-4 text-sm">
                      {selectedBooking?.guest?.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date & Party Size */}
              <h2 className="mb-4 text-sm font-bold">Date & Party Size</h2>
              <div className="mb-10 rounded-lg bg-secondary p-4">
                <div className="">
                  <div className="mb-2 flex items-center">
                    <Calendar size={16} />
                    <p className="ml-4 text-sm">
                      {selectedBooking?.date
                        ? moment(selectedBooking.date).format(
                            'ddd, DD MMM YYYY'
                          )
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Users size={16} />
                    <p className="ml-4 text-sm">
                      {selectedBooking?.party_size
                        ? `${selectedBooking?.party_size} Guests`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reservation Notes */}
              <h2 className="mb-2 text-sm font-bold">Reservation Notes</h2>
              <div className="max-h-[30dvh] overflow-y-auto rounded-lg bg-secondary p-4">
                <p className="text-sm">
                  {selectedBooking?.reservation_note || 'N/A'}
                </p>
              </div>
            </div>
          </div>
          {/* ChatBox */}
          <div
            className={`relative z-10 p-8 md:w-1/2  md:py-0 ${
              activeTab === 'chat' ? 'block' : 'hidden'
            } md:block`}
          >
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-700 bg-opacity-70">
              <p className="text-xl font-semibold text-white">Coming Soon</p>
            </div>
            <ChatBox />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestedBookingDetail;
