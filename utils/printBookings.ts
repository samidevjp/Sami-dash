import { Booking } from '@/hooks/useBookings';
import { getFullname, getTimeOnly } from '@/utils/Utility';

export const printBookings = (
  shiftName: string = 'All Day',
  shiftId: number | undefined,
  allBookings: Booking[],
  filteredShiftsData: any[]
) => {
  let bookingsToPrint: Booking[] = [];
  let stats = {
    totalPartySize: 0,
    totalTables: 0
  };

  if (shiftName === 'All Day') {
    bookingsToPrint = allBookings;
    stats.totalPartySize = allBookings.reduce(
      (total, item) => total + item.party_size,
      0
    );
    stats.totalTables = allBookings.reduce(
      (total, item) => total + item.table.length,
      0
    );
  } else {
    const shift = filteredShiftsData.find((s: any) => s.id === shiftId);
    if (!shift) return;

    const filteredByShift = allBookings.filter(
      (booking: any) =>
        booking.end_time > shift.start_time &&
        booking.start_time < shift.end_time
    );

    bookingsToPrint = filteredByShift;
    stats.totalPartySize = filteredByShift.reduce(
      (total, item) => total + item.party_size,
      0
    );
    stats.totalTables = filteredByShift.reduce(
      (total, item) => total + item.table.length,
      0
    );
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  const printContent = `
  <html>
  <head>
      <title>Bookings - ${shiftName}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 40px;
          background: #f4f4f4;
        }

        h1 {
          text-align: center;
          margin-bottom: 30px;
        }

        .stats {
          display: flex;
          justify-content: space-around;
          background: #ffffff;
          padding: 20px;
          margin-bottom: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .booking-header {
          display: flex;
          padding: 0 20px;
          margin-bottom: 5px;
          font-weight: bold;
          color: #555;
          gap: 20px;
        }

        .booking-item {
          display: flex;
          align-items: center;
          gap: 20px;
          background: #fff;
          padding: 15px 20px;
          margin-bottom: 15px;
          border-left: 4px solid #485df9;
          border-radius: 6px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        
        .booking-col {
          font-size: 14px;
          line-height: 1.4;
        }
        
        .col-time    { flex-basis: 12%; }
        .col-guest   { flex-basis: 15%; font-weight: bold; }
        .col-size    { flex-basis: 5%; text-align: center; }
        .col-tables  { flex-basis: 10%; }
        .col-contact { flex-basis: 18%; font-size: 13px; color: #666; }
        .col-address { flex-basis: 20%; font-size: 13px; color: #666; }
        .col-note    { flex-basis: 20%; font-style: italic; font-size: 13px; color: #888; }
        
        .party-size-highlight {
          font-weight: normal;
          color: #777;
        }

        .no-print {
          text-align: right;
          margin-bottom: 20px;
        }

        .no-print button {
          padding: 8px 16px;
          background-color: #485df9;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        @media print {
          .no-print, button {
            display: none;
          }
          body {
            background: #fff;
            font-size: 11px;
          }
          .booking-item, .booking-header {
            gap: 15px;
          }
          .booking-col {
            font-size: 11px;
          }
        }
      </style>
    </head>
  <body>
    <div class="no-print"><button onclick="window.print()">Print</button></div>
    <h1>Bookings - ${shiftName}</h1>
    <div class="stats">
      <div><strong>Total Guests:</strong> ${stats.totalPartySize}</div>
      <div><strong>Total Tables:</strong> ${stats.totalTables}</div>
      <div><strong>Bookings Count:</strong> ${bookingsToPrint.length}</div>
    </div>
    
    <div class="booking-header">
      <div class="booking-col col-time">Time</div>
      <div class="booking-col col-guest">Guest</div>
      <div class="booking-col col-size">Guests</div>
      <div class="booking-col col-tables">Table(s)</div>
      <div class="booking-col col-contact">Contact Info</div>
      <div class="booking-col col-address">Address</div>
      <div class="booking-col col-note">Reservation Note</div>
    </div>
    
    <div class="bookings">
      ${bookingsToPrint
        .map((booking: any) => {
          const contactInfo = [];
          if (booking.guest?.email) {
            contactInfo.push(booking.guest.email);
          }
          if (
            booking.guest?.phone &&
            booking.guest.phone !== 'No phone number'
          ) {
            contactInfo.push(booking.guest.phone);
          }

          const tableNames = booking.table.map((t: any) => t.name).join(', ');

          return `
            <div class="booking-item">
              <div class="booking-col col-time">
                ${getTimeOnly(booking.start_date)} — ${getTimeOnly(
                  booking.end_date
                )}
              </div>
              <div class="booking-col col-guest">
                ${getFullname(booking.guest)}
              </div>
              <div class="booking-col col-size">
                ${booking.party_size}
              </div>
              <div class="booking-col col-tables">
                ${tableNames || 'N/A'}
              </div>
              <div class="booking-col col-contact">
                ${contactInfo.join('<br>')}
              </div>
              <div class="booking-col col-address">
                ${booking.guest?.address || 'N/A'}
              </div>
              <div class="booking-col col-note">
                ${booking.reservation_note || ''}
              </div>
            </div>`;
        })
        .join('')}
    </div>
  </body>
  </html>
`;

  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
};
