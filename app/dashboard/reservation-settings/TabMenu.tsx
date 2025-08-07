import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
interface TabMenuProps {
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}
const TabMenu: React.FC<TabMenuProps> = ({ setSelectedTab }) => {
  const tabs = ['widget', 'settings', 'flow-control'];
  // const tabs = ['widget', 'settings', 'flow-control', 'request-booking'];
  return (
    <Tabs defaultValue="widget" onValueChange={setSelectedTab}>
      <TabsList className="relative bg-background">
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
