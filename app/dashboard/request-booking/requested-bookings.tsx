import React, { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { useSession } from 'next-auth/react';
import moment from 'moment';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RequestedBookingDetail from './components/requested-booking-detail';
const RequestedBookings: React.FC = () => {
  const { data: session } = useSession();
  const { getBookingList } = useApi();
  const [requestBookings, setRequestBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [archivedBookings, setArchivedBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isArchive, setIsArchive] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  useEffect(() => {
    const fetchBookingRequest = async () => {
      try {
        if (!session) return;
        const widget_token = session?.user.widget_token;
        if (!widget_token) {
          throw new Error('Widget token is undefined');
        }
        const paramsRequested = {
          status: [19]
        };
        const paramsArchived = {
          status: [22]
        };
        const requestedResponse = await getBookingList(
          // widget_token,
          paramsRequested
        );
        const archivedResponse = await getBookingList(
          // widget_token,
          paramsArchived
        );
        setRequestBookings(requestedResponse.data.bookings);
        setFilteredBookings(requestedResponse.data.bookings);
        setArchivedBookings(archivedResponse.data.bookings);
      } catch (error) {
        console.log(error);
      }
    };
    fetchBookingRequest();
  }, [session]);
  useEffect(() => {
    let filtered = isArchive ? archivedBookings : requestBookings;
    if (searchTerm) {
      filtered = filtered.filter((booking) => {
        const fullName =
          `${booking.guest.first_name} ${booking.guest.last_name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      });
    }
    if (dateFilter) {
      filtered = filtered.filter(
        (booking) => moment(booking.date).format('YYYY-MM-DD') === dateFilter
      );
    }
    setFilteredBookings(filtered);
  }, [searchTerm, dateFilter, requestBookings, archivedBookings, isArchive]);
  const groupedBookings: Record<string, any[]> | undefined =
    filteredBookings?.reduce(
      (acc: Record<string, any[]>, booking: any) => {
        const formattedDate = moment(booking.created_at).format('ddd, MMM DD');
        if (!acc[formattedDate]) {
          acc[formattedDate] = [];
        }
        acc[formattedDate].push(booking);
        return acc;
      },
      {} as Record<string, any[]>
    );
  const handleRequestBookingClick = (booking: any) => {
    setSelectedBooking(booking);
    setIsDetailOpen(true);
  };
  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedBooking(null), 300);
  };
  return (
    <>
      <div className="mb-8 flex items-center md:justify-between">
        <div className="flex gap-8">
          <div className="">
            <p className="mb-2  text-sm text-muted-foreground">
              Search Booking by Name
            </p>
            <Input
              placeholder="Search Booking by Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-56 rounded-lg px-4"
            />
          </div>
          <div className="">
            <p className="mb-2 text-sm text-muted-foreground">Date requested</p>
            <div className="flex items-end gap-2">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="mt-1 block w-full max-w-40"
              />
              <Button
                className="w-40"
                variant="secondary"
                onClick={() => setDateFilter('')}
              >
                Reset Date
              </Button>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsArchive(!isArchive)}>
          {isArchive ? 'Active Requests' : 'Expired Requests'}
        </Button>
      </div>
      <div className="rounded-lg bg-secondary p-4">
        {groupedBookings &&
          Object.entries(groupedBookings).map(([date, bookings]) => (
            <div key={date}>
              <p className="mb-4 mt-4 text-sm font-bold text-muted-foreground">
                {date}
              </p>
              <div className="mb-8 ml-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell className="w-40">Name</TableCell>
                      <TableCell className="w-32">Requested Date</TableCell>
                      <TableCell className="w-20">Partysize</TableCell>
                      <TableCell className="">Reservation Notes</TableCell>
                      <TableCell className="w-40">Email</TableCell>
                      <TableCell className="w-40">Phone</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow
                        key={booking.id}
                        onClick={() => handleRequestBookingClick(booking)}
                        className="cursor-pointer"
                      >
                        <TableCell>
                          {booking.guest.first_name} {booking.guest.last_name}
                        </TableCell>
                        <TableCell>
                          {moment(booking.date).format('ddd, MMM DD')}
                        </TableCell>
                        <TableCell>{booking.party_size}</TableCell>

                        <TableCell>
                          <p className="max-w-[400px] overflow-hidden break-words">
                            {booking.reservation_note?.length > 200
                              ? `${booking.reservation_note.slice(0, 200)}...`
                              : booking.reservation_note}
                          </p>
                        </TableCell>
                        <TableCell>{booking.guest.email}</TableCell>
                        <TableCell>{booking.guest.phone}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
      </div>
      <RequestedBookingDetail
        isDetailOpen={isDetailOpen}
        handleCloseDetail={handleCloseDetail}
        selectedBooking={selectedBooking}
      />
    </>
  );
};
export default RequestedBookings;
