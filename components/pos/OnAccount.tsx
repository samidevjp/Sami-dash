'use client';
import { useApi } from '@/hooks/useApi';
import { useEffect, useState, useRef } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';

interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  photo: string | null;
  company: string | null;
  birthdate: string | null;
  anniversary: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal: string;
  country: string | null;
  tags: any | null;
  string_tags: string | null;
  general_note: string | null;
  special_relationship: string | null;
  food_drink_preference: string | null;
  seating_preference: string | null;
}

export const OnAccount = () => {
  const { getGuests } = useApi();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const fetchGuests = async (pageNumber: number) => {
    try {
      const data = await getGuests({ page: pageNumber });
      console.log('data', data.guests.length);
      if (data.guests.length === 0) {
        setHasMore(false);
      } else {
        setGuests((prevGuests) => [...prevGuests, ...data.guests]);
        setPage(pageNumber);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    }
  };

  useEffect(() => {
    fetchGuests(1);
  }, []);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`guest-${letter}`);
    if (element && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = element.offsetTop - 16; // 16px for padding
    }
  };

  const groupedGuests = guests.reduce(
    (acc, guest) => {
      const firstLetter = guest.first_name[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(guest);
      return acc;
    },
    {} as Record<string, Guest[]>
  );

  return (
    <div className="flex h-full">
      <ScrollArea className="h-full flex-grow" ref={scrollAreaRef}>
        <div className="flex h-full flex-col bg-black text-white">
          <div className="space-y-2 p-4">
            {alphabet.map((letter) => (
              <div key={letter} id={`guest-${letter}`}>
                {groupedGuests[letter] && groupedGuests[letter].length > 0 && (
                  <>
                    <h3 className="mb-2 text-lg font-bold">{letter}</h3>
                    {groupedGuests[letter].map((guest) => (
                      <div
                        key={guest.id}
                        className="mb-2 flex items-center rounded-lg bg-zinc-800 p-3"
                      >
                        {guest.photo ? (
                          <img
                            src={process.env.NEXT_PUBLIC_IMG_URL + guest?.photo}
                            alt={guest.first_name}
                            className="mr-2 h-12 w-12 rounded-full bg-white"
                          />
                        ) : (
                          <Avatar className="mr-2 h-12 w-12 rounded-full bg-white" />
                        )}
                        <div>
                          <h2 className="font-semibold">{`${guest.first_name} ${guest.last_name}`}</h2>
                          <p className="text-sm text-gray-400">{guest.phone}</p>
                          <p className="text-sm text-gray-400">{guest.email}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="p-4">
              <Button
                onClick={() => fetchGuests(page + 1)}
                className="w-full bg-zinc-800 hover:bg-zinc-700"
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="flex flex-col justify-center bg-zinc-900 p-2">
        {alphabet.map((letter) => (
          <button
            key={letter}
            className="rounded px-2 py-1 text-sm text-white hover:bg-zinc-700"
            onClick={() => scrollToLetter(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
};
