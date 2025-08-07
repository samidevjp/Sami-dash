import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { getFullname } from '@/utils/Utility';
import Image from 'next/image';
import { Dialog, DialogContent } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import _ from 'lodash';
import AddNewGuestModal from './add-new-guest';

interface AllGuestsModalProps {
  isOpenAllGuestsModal: boolean;
  setIsOpenAllGuestsModal: (isOpen: boolean) => void;
  changeGuest: (guest: any) => void;
}

const AllGuestsModal: React.FC<AllGuestsModalProps> = ({
  isOpenAllGuestsModal,
  setIsOpenAllGuestsModal,
  changeGuest
}) => {
  const { getGuests } = useApi();
  const [allGuests, setAllGuests] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [addGuestModal, setAddGuestModal] = useState<boolean>(false);
  const [query, setQuery] = useState('');
  const [isAll, setIsAll] = useState<boolean>(false);

  // Function to fetch guests
  const fetchGuests = useCallback(async () => {
    if (!isAll) {
      setLoading(true);
      try {
        let param: { page: number; keyword?: string } = { page: page };
        if (query) {
          param.keyword = query;
        }
        const response = await getGuests(param);
        if (response.guests.length > 0) {
          setAllGuests((prevGuests) => [...prevGuests, ...response.guests]);
        } else {
          setIsAll(true);
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
  }, [query, isAll, page]);

  // Open modal and fetch first page of guests
  const openAllGuestsModal = async () => {
    setPage(1); // Reset page on open
    setQuery('');
    setAllGuests([]); // Clear previous guests
    await fetchGuests();
    setIsOpenAllGuestsModal(true);
  };

  useEffect(() => {
    if (isOpenAllGuestsModal) {
      openAllGuestsModal();
    }
  }, [isOpenAllGuestsModal]);

  // Handle scroll to bottom for infinite scrolling
  const handleScroll = () => {
    if (isAll) return;
    if (modalContentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = modalContentRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10 && !loading) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  };

  // Fetch new guests when the page number changes
  useEffect(() => {
    if (page > 1) {
      fetchGuests();
    }
  }, [page, fetchGuests]);

  // Add scroll event listener to the modal content
  useEffect(() => {
    const modalContent = modalContentRef.current;
    if (modalContent) {
      modalContent.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (modalContent) {
        modalContent.removeEventListener('scroll', handleScroll);
      }
    };
  }, [loading]);
  const debouncedFetchGuests = useCallback(
    _.debounce(() => {
      setIsAll(false);
      setAllGuests([]);
      setPage(1);
      fetchGuests();
    }, 500),
    [query]
  );

  useEffect(() => {
    debouncedFetchGuests();
    return () => {
      debouncedFetchGuests.cancel();
    };
  }, [query]);

  return (
    <Dialog
      open={isOpenAllGuestsModal}
      onOpenChange={() => setIsOpenAllGuestsModal(!isOpenAllGuestsModal)}
      modal={true}
    >
      <DialogContent className="-webkit-backdrop-blur-3xl h-[100vh] min-w-[100vw] content-start overflow-auto backdrop-blur-3xl ">
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button onClick={() => setAddGuestModal(true)} className="px-4 py-2">
            + Add New
          </Button>
          <Input
            className="max-w-[30%]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Guest"
          />
        </div>
        <div ref={modalContentRef} className="h-full overflow-y-auto">
          <ul className="flex flex-wrap gap-x-[2%] gap-y-2">
            {allGuests.map((guest, index) => (
              <li
                key={index}
                className="flex w-[32%] cursor-pointer items-center gap-2 rounded-lg bg-secondary p-2 transition-all duration-300 hover:opacity-60"
                onClick={() => changeGuest(guest)}
              >
                <div className="flex w-full items-center rounded-sm">
                  <div className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full">
                    {guest.photo ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_IMG_URL + guest.photo}`}
                        alt="User"
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-green"></div>
                    )}
                  </div>

                  <div className="ml-4" style={{ width: 'calc(100% - 80px)' }}>
                    <p className="text-sm">{getFullname(guest)}</p>
                    <p className="text-sm">
                      {guest?.phone || 'No Phone available'}
                    </p>
                    <p className="w-inherit overflow-hidden text-ellipsis whitespace-nowrap break-all text-sm">
                      {guest?.email || 'No email available'}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {loading && <p>Loading more guests...</p>}
        </div>
      </DialogContent>
      {addGuestModal && (
        <AddNewGuestModal
          addGuestModal={addGuestModal}
          setAddGuestModal={setAddGuestModal}
          openAllGuestsModal={openAllGuestsModal}
        />
      )}
    </Dialog>
  );
};

export default AllGuestsModal;
