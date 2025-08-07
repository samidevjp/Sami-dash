'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useBooking } from '@/hooks/bookingStore';
import { useFloor } from '@/hooks/floorStore';
import { useEmployee } from '@/hooks/useEmployee';
import { usePermissionsStore } from '@/hooks/usePermissionsStore';
import { useProducts } from '@/hooks/useProducts';
import { useShiftsStore } from '@/hooks/useShiftsStore';
import { useShiftStore } from '@/hooks/useShiftStore';
import { signOut, useSession } from 'next-auth/react';
export function UserNav() {
  const { data: session } = useSession();
  const { setAllEmployees, clearCurrentEmployee } = useEmployee();
  const { setShifts } = useShiftsStore();
  const { setPermissions } = usePermissionsStore();
  const { removeProducts } = useProducts();
  const { removeFloor, setTable } = useFloor();
  const { removeBooking } = useBooking();
  const { setCurrentShiftId, setSelectedShiftId } = useShiftStore();
  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                // @ts-ignore
                src={session.user?.logo ?? ''}
                alt={session.user?.name ?? ''}
              />
              <AvatarFallback>{session.user?.name?.[0]}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user?.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* <DropdownMenuGroup>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Billing
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>New Team</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator /> */}
          <DropdownMenuItem
            onClick={() => {
              localStorage.removeItem('pinPreference');
              setAllEmployees([]);
              setShifts([]);
              setPermissions([]);
              removeProducts();
              removeFloor();
              removeBooking();
              setTable(null);
              clearCurrentEmployee();
              setCurrentShiftId(0);
              setSelectedShiftId(0);
              signOut();
            }}
          >
            Log out
            {/* <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut> */}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
