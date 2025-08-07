import React, { useEffect, useState } from 'react';

interface PartySizeSelectionProps {
  propSelectedPartySize?: any;
  partySize: number;
  handleSelectedPartySize: any;
}
function PartySizeSelection({
  propSelectedPartySize,
  partySize,
  handleSelectedPartySize
}: PartySizeSelectionProps) {
  const [selectedPartysize, setSelectedPartysize] = useState(
    propSelectedPartySize
  );

  useEffect(() => {
    if (propSelectedPartySize > partySize) {
      setSelectedPartysize(0);
    } else {
      setSelectedPartysize(propSelectedPartySize);
    }
  }, [propSelectedPartySize]);

  const selectOption = (e: any) => {
    let option = parseInt(e.target.value);
    setSelectedPartysize(option);
    handleSelectedPartySize(option);
  };

  return (
    <div className="relative inline-flex w-full gap-2 overflow-x-auto">
      {Array.from(Array(partySize), (e, i) => {
        return (
          <div
            key={Math.random()}
            className={`
              flex h-12 w-12 flex-none cursor-pointer items-center justify-center rounded-lg border transition-all
              ${
                selectedPartysize === i + 1
                  ? 'border-primary'
                  : 'border-secondary bg-secondary'
              }
              hover:opacity-60
            `}
          >
            <input
              key={Math.random()}
              onChange={selectOption}
              id={i + 1 + '-rad'}
              type="radio"
              value={i + 1}
              checked={selectedPartysize === i + 1}
              name="radioBtn"
              className="hidden"
            />
            <label
              className="flex h-full w-full cursor-pointer items-center justify-center"
              key={Math.random()}
              htmlFor={i + 1 + '-rad'}
            >
              {i + 1}
            </label>
          </div>
        );
      })}
    </div>
  );
}

export default PartySizeSelection;
