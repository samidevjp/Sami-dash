'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import _, { set } from 'lodash';
// @ts-ignore
import ReactQRScanner from 'react-qr-scanner';
// components
import PageContainer from '@/components/layout/page-container';

// icons
import { Scan, SwitchCamera } from 'lucide-react';
// UI components
import { Heading } from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import {
  TableBody,
  TableCell,
  TableForFixedHeader,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

//hooks
import { useApi } from '@/hooks/useApi';

//utils
import moment from 'moment';

interface TicketCardProps {
  title: string;
  count: number;
}

interface Ticket {
  ticket_ref_number: string;
  expiration_date: string;
  status: string;
  used_at: string | null;
  verified?: boolean;
  ticket_details?: any;
}

export default function Page() {
  const { getTickets, getTicketStatusCount, scanTicket, verifyTicket } =
    useApi();
  const [facingMode, setFacingMode] = useState('user');
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(
    []
  );
  const [hasCameraPermission, setHasCameraPermission] =
    useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [usedTickets, setUsedTickets] = useState(0);
  const [unusedTickets, setUnusedTickets] = useState(0);
  const [expiredTickets, setExpiredTickets] = useState(0);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const isScanInProgress = useRef(false);
  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear}-01-01`;
  const endDate = `${currentYear}-12-31`;

  const fetchTicketCounts = async () => {
    try {
      const counts = await getTicketStatusCount(startDate, endDate);
      setUsedTickets(counts.data?.used || 0);
      setUnusedTickets(counts.data?.unused || 0);
      setExpiredTickets(counts.data?.expired || 0);
    } catch (error) {
      console.error('Error fetching ticket counts:', error);
    }
  };

  // Function to fetch tickets for the current page
  const fetchTickets = async (page: number) => {
    try {
      const ticketsData = await getTickets(startDate, endDate, page);
      const ticketsWithDetails = await Promise.all(
        ticketsData.data.data.map(async (ticket: Ticket) => {
          // Only verify tickets that are not expired
          if (ticket.status !== 'Expired') {
            try {
              const verificationResult = await verifyTicket(
                ticket.ticket_ref_number
              );
              return {
                ...ticket,
                verified: true,
                ticket_details: verificationResult.data
              };
            } catch (error) {
              console.error(
                `Error verifying ticket ${ticket.ticket_ref_number}:`,
                error
              );
              return {
                ...ticket,
                verified: false,
                ticket_details: null
              };
            }
          }
          return {
            ...ticket,
            verified: false,
            ticket_details: null
          };
        })
      );
      setTickets(ticketsWithDetails);
      setCurrentPage(ticketsData.data?.currentPage);
      setLastPage(ticketsData.data?.lastPage);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const debouncedFetchTicketCounts = useCallback(
    _.debounce(() => {
      fetchTicketCounts();
    }, 300),
    []
  );

  const debouncedFetchTickets = useCallback(
    _.debounce((page: number) => {
      fetchTickets(page);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedFetchTicketCounts();
    debouncedFetchTickets(currentPage);
    return () => {
      debouncedFetchTicketCounts.cancel();
      debouncedFetchTickets.cancel();
    };
  }, [debouncedFetchTicketCounts, debouncedFetchTickets, currentPage]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const cameras = devices.filter((device) => device.kind === 'videoinput');
      setAvailableCameras(cameras);
    });
  }, []);

  const handleCameraSwitch = () => {
    setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
    console.log(facingMode);
  };

  const TicketCard: React.FC<TicketCardProps> = ({ title, count }) => (
    <div className="w-40 rounded-lg border px-4 py-2 shadow">
      <div className="flex flex-col">
        <p className="text-sm font-medium">{title}</p>
        <div className="flex self-end font-semibold">{count}</div>
      </div>
    </div>
  );

  const handleScanTicketClick = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        setHasCameraPermission(true);
        setCameraError(null);
        setDialogOpen(true);
      })
      .catch((err) => {
        setCameraError('Camera access denied or error occurred.');
        setHasCameraPermission(false);
      });
  };

  const handleScan = async (data: any) => {
    if (data && !isScanInProgress.current) {
      isScanInProgress.current = true;
      const ticketRefNumber = data.text;
      try {
        const result = await scanTicket(ticketRefNumber);
        await fetchTickets(1);
        setUsedTickets((prev) => prev + 1);
        toast({
          title: 'Ticket Scanned',
          description: `Ticket Scanned Successfully`,
          variant: 'success'
        });
      } catch (err: any) {
        toast({
          title: 'Ticket Scanned',
          description: `${err.response.data?.message}`,
          variant: 'destructive'
        });
      } finally {
        setDialogOpen(false);
        isScanInProgress.current = false;
      }
    }
  };

  const handleError = (err: any) => {
    console.error('Error scanning QR code:', err);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= lastPage) {
      setCurrentPage(page);
      debouncedFetchTickets(page);
    }
  };

  const getBadgeClassByStatus = (status: string) => {
    switch (status) {
      case 'Used':
        return 'bg-green-100 text-green-800';
      case 'Unused':
        return 'bg-gray-100 text-gray-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <PageContainer scrollable>
      <div className="mb-8">
        <Heading
          title={`Tickets`}
          description="Managetickets"
          titleClass="text-xl"
          descriptionClass="text-sm"
        />
      </div>
      <div className="items-end justify-between gap-8 md:flex">
        <div className="flex gap-4">
          <TicketCard title="Used Tickets" count={usedTickets} />
          <TicketCard title="Unused Tickets" count={unusedTickets} />
          <TicketCard title="Expired Tickets" count={expiredTickets} />
        </div>
        <div className="col-span-full mt-4 flex justify-end lg:col-span-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" onClick={handleScanTicketClick}>
                <Scan className="mr-3 h-5 w-5" />
                Scan Ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Scan Ticket</DialogTitle>
              {cameraError ? (
                <div className="mt-4 text-center text-red-600">
                  <p>{cameraError}</p>
                </div>
              ) : hasCameraPermission ? (
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center justify-center">
                    {availableCameras.length > 0 && (
                      <div className="relative">
                        <ReactQRScanner
                          delay={300}
                          facingMode={facingMode}
                          onScan={handleScan}
                          onError={handleError}
                        />
                        <button
                          className="absolute right-4 top-4 rounded-full p-2 text-white shadow-lg"
                          onClick={handleCameraSwitch}
                        >
                          <SwitchCamera />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-center text-blue-600">
                  <p>Requesting camera permission...</p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div
        className="mt-6 rounded-lg"
        style={{ maxHeight: 'calc(100dvh - 310px)', overflowY: 'auto' }}
      >
        <TableForFixedHeader className="sticky top-0 bg-secondary">
          <TableHeader
            className="sticky z-10 bg-secondary"
            style={{ top: '-1px' }}
          >
            <TableRow>
              <TableHead className="w-1/6">Ticket Ref. Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="w-1/12 text-center">Status</TableHead>
              <TableHead>Expiration Date</TableHead>
              <TableHead>Used At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length > 0 ? (
              tickets.map((ticket, index) => (
                <React.Fragment key={index}>
                  <TableRow className="cursor-pointer border-b hover:bg-muted">
                    <TableCell>
                      {'*'.repeat(ticket.ticket_ref_number.length - 6) +
                        ticket.ticket_ref_number.slice(-6)}
                    </TableCell>
                    <TableCell>
                      {ticket.verified && ticket.ticket_details
                        ? ticket.ticket_details.ticket_purchase_detail
                            ?.ticket_type?.name || '--'
                        : '--'}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getBadgeClassByStatus(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {moment(ticket.expiration_date).format(
                        'MMMM Do YYYY, h:mm A'
                      )}
                    </TableCell>
                    <TableCell>
                      {ticket.used_at
                        ? moment(ticket.used_at).format('MMMM Do YYYY, h:mm A')
                        : ''}
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            ) : (
              <p className="p-4">No tickets found</p>
            )}
          </TableBody>
        </TableForFixedHeader>
        <div className="mt-4 flex justify-between">
          <Button
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <div>
            Page {currentPage} of {lastPage}
          </div>
          <Button
            disabled={currentPage >= lastPage}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
