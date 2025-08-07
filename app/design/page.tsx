'use client';
import React from 'react';
import { theme } from '@/tailwind.config';

// @ts-ignore
const { extend } = theme;

export default function Page() {
  return (
    <div className="h-screen overflow-y-auto bg-backgroundReverse pb-20">
      <ul className="flex flex-wrap content-start gap-2 p-2 text-[10px]">
        {Object.entries(extend.colors).map(
          ([key, value]: any, index: number) =>
            typeof value === 'string' ? (
              <li
                className="cursor-pointer content-start"
                key={index}
                onClick={() => navigator.clipboard.writeText(key)}
              >
                <div
                  className="relative float-left flex h-40 w-40 flex-col items-center justify-center rounded-lg"
                  style={{ backgroundColor: value }}
                >
                  <ul className="absolute left-1 top-1 flex gap-1">
                    <li className="left-1 top-1 h-4 w-4 rounded-full bg-white"></li>
                    <li className="left-1 top-1 h-4 w-4 rounded-full bg-black"></li>
                  </ul>
                  {key}
                  <span className="block">{value}</span>
                </div>
              </li>
            ) : (
              Object.entries(value).map(
                ([subKey, subValue]: any, subIndex: number) => (
                  <li
                    key={subIndex}
                    className={`relative flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-lg`}
                    style={{ backgroundColor: subValue }}
                    onClick={() =>
                      subKey === 'DEFAULT'
                        ? navigator.clipboard.writeText(`${key}`)
                        : navigator.clipboard.writeText(`${key}-${subKey}`)
                    }
                  >
                    <ul className="absolute left-1 top-1 flex gap-1">
                      <li className="left-1 top-1 h-4 w-4 rounded-full bg-white"></li>
                      <li className="left-1 top-1 h-4 w-4 rounded-full bg-black"></li>
                    </ul>
                    {subKey === 'DEFAULT' ? (
                      <p>{key}</p>
                    ) : (
                      <p>
                        {key}-{subKey}
                      </p>
                    )}
                    <p>{subValue}</p>
                  </li>
                )
              )
            )
        )}
      </ul>
    </div>
  );
}
