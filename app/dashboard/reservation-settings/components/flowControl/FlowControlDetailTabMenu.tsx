import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
interface FlowControlDetailTabMenuProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}

const FlowControlDetailTabMenu: React.FC<FlowControlDetailTabMenuProps> = ({
  selectedTab,
  setSelectedTab
}) => {
  const tabs = ['Services', 'Time Settings', 'Section', 'Payments'];
  const tabWidth = 100 / tabs.length;
  const reducedTabWidth = tabWidth * 0.7;
  const tabPaddingY = 2;
  return (
    <Tabs
      defaultValue="Services"
      onValueChange={setSelectedTab}
      className={`border-b py-${tabPaddingY}`}
    >
      <TabsList className="relative bg-background">
        {tabs.map((tab) => (
          <TabsTrigger key={tab} value={tab} className="relative w-36">
            <span className="">
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </span>
          </TabsTrigger>
        ))}
        <span
          className={`absolute -bottom-2 h-0.5 rounded-lg bg-primary transition-all duration-300 ease-in-out`}
          style={{
            width: `${reducedTabWidth}%`,
            left: `calc(${tabs.indexOf(selectedTab) * tabWidth}% + ${
              tabWidth * 0.15
            }%)`
          }}
        />
      </TabsList>
    </Tabs>
  );
};

export default FlowControlDetailTabMenu;
