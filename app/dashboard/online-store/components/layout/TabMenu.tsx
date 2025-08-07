import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabMenuProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

const TabMenu: React.FC<TabMenuProps> = ({ selectedTab, setSelectedTab }) => {
  const tabs = ['Branding', 'Products', 'Settings'];

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
      <TabsList className="flex w-fit flex-wrap bg-background md:block md:flex-nowrap">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab}
            value={tab}
            className="flex-1 py-2 text-center hover:text-primary data-[state=active]:font-bold data-[state=active]:text-primary data-[state=active]:shadow-none"
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default TabMenu;
