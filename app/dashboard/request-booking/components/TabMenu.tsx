import React from 'react';
import { Button } from '@/components/ui/button';

interface TabProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

const TabMenu = ({ selectedTab, setSelectedTab }: TabProps) => {
  const tabs = ['Bookings'];
  // const tabs = ['Bookings', 'Settings'];
  return (
    <div className="flex space-x-4">
      {tabs.map((tab) => (
        <Button
          key={tab}
          variant="ghost"
          className={`relative h-12 px-4 ${
            selectedTab === tab
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setSelectedTab(tab)}
        >
          {tab}
          {selectedTab === tab && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </Button>
      ))}
    </div>
  );
};

export default TabMenu;
