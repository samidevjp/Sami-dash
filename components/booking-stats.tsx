import React from 'react';

interface BookingStatsProps {
  receivedBooking: any[];
  bookingDifference: number;
  bookingPercentageChange: string | number;
  totalBookingPartySize: number;
  partySizeDifference: number;
  percentageChange: string | number;
  comparisonLabel?: string;
}

export const BookingStats: React.FC<BookingStatsProps> = ({
  receivedBooking,
  bookingDifference,
  bookingPercentageChange,
  totalBookingPartySize,
  partySizeDifference,
  percentageChange,
  comparisonLabel
}) => {
  return (
    <div className="mb-4 mt-8 flex flex-wrap items-center gap-6 pl-2">
      {/* left */}
      <div className="relative flex h-40 w-40 min-w-[10rem] items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-primary" />
        <div className="max-w-[8rem] px-2 text-center">
          <div className="text-center text-2xl font-medium">
            {receivedBooking?.length || 0}
            <p className="text-[9px] leading-none text-muted-foreground">
              Bookings
            </p>
          </div>
          <div className="flex gap-2">
            <p
              className={`mt-4 text-[9px] ${
                bookingDifference > 0
                  ? 'text-green-600'
                  : bookingDifference < 0
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              {bookingDifference >= 0 ? '+' : ''}
              {bookingDifference}
            </p>
            <p
              className={`mt-4 text-[9px] ${
                Number(bookingPercentageChange) > 0
                  ? 'text-green-600'
                  : Number(bookingPercentageChange) < 0
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              {Number(bookingPercentageChange) >= 0 ? '▲' : '▼'}
              {bookingPercentageChange}%
            </p>
          </div>
        </div>
      </div>
      {/* right */}
      <div className="">
        <p>
          {totalBookingPartySize}
          <span className="pl-1 text-[9px] text-muted-foreground">Covers</span>
        </p>
        <div className="flex gap-2 ">
          <p
            className={`text-[9px] ${
              partySizeDifference > 0
                ? 'text-green-600'
                : partySizeDifference < 0
                ? 'text-red-600'
                : 'text-gray-500'
            }`}
          >
            {partySizeDifference >= 0 ? '+' : ''}
            {partySizeDifference}
          </p>
          <p
            className={`text-[9px] ${
              Number(percentageChange) > 0
                ? 'text-green-600'
                : Number(percentageChange) < 0
                ? 'text-red-600'
                : 'text-gray-500'
            }`}
          >
            {Number(percentageChange) >= 0 ? '▲' : '▼'}
            {percentageChange}%
          </p>
        </div>
      </div>
    </div>
  );
};
