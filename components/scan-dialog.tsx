import { Scan, SwitchCamera } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
// @ts-ignore
import ReactQRScanner from 'react-qr-scanner';
import { useState } from 'react';

interface ScanDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  handleScanTicketClick: () => void;
  cameraError: string | null;
  hasCameraPermission: boolean;
  availableCameras: MediaDeviceInfo[];
  handleScan: (data: any) => void;
  handleError: (error: any) => void;
  isPaymentModal?: boolean;
}
export const ScanDialog = ({
  dialogOpen,
  setDialogOpen,
  handleScanTicketClick,
  cameraError,
  hasCameraPermission,
  availableCameras,
  handleScan,
  handleError,
  isPaymentModal = false
}: ScanDialogProps) => {
  const [facingMode, setFacingMode] = useState('user');

  const handleCameraSwitch = () => {
    setFacingMode((prevMode) => (prevMode === 'user' ? 'environment' : 'user'));
  };
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {isPaymentModal ? (
          <Button
            onClick={handleScanTicketClick}
            className="flex h-20 w-32 shrink-0 flex-col items-center justify-center bg-[#1F2122] text-white hover:bg-primary"
          >
            <Scan size={24} />
            <span>Scan Code</span>
          </Button>
        ) : (
          <Button variant="default" onClick={handleScanTicketClick}>
            <Scan className="mr-3 h-5 w-5" />
            Scan Ticket
          </Button>
        )}
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
  );
};
