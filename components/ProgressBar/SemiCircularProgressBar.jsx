import React from 'react';
import { TABLETYPE } from '@/utils/enum';

import {
  getBookingProgressStatusColor,
  getBookingStatusColor
} from '@/utils/common';

const SemiCircularProgressBar = ({
  percentage,
  tableType,
  tableRotate,
  bookingStatus,
  startDate
}) => {
  const radius = 32;
  const stroke = 3;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * Math.PI;
  const strokeDashoffset = `${
    circumference - (percentage / 100) * circumference
  }`;
  const baseStyle = {
    position: 'absolute',
    zIndex: 1,
    left: '7px',
    bottom: '2px',
    transform: 'scale(1,-1)'
  };
  if (tableType === TABLETYPE.halfSeatRoundTable) {
    baseStyle.left = '12px';
    if (tableRotate === 0) {
      baseStyle.left = '3px';
      baseStyle.bottom = '11px';
    }
  } else if (
    tableType === TABLETYPE.fourPersonRoundTable ||
    tableType === TABLETYPE.eightPersonRoundTable ||
    tableType === TABLETYPE.sixPersonRoundTable
  ) {
    baseStyle.left = '7px';
    baseStyle.bottom = '5px';
  } else if (tableType === TABLETYPE.tenPersonRoundTable) {
    baseStyle.left = '8px';
    baseStyle.bottom = '7px';
  }
  return (
    <svg height={radius + stroke} width={radius * 2 + stroke} style={baseStyle}>
      <path
        d={`
          M ${stroke / 2},${radius + stroke / 2}
          a ${normalizedRadius},${normalizedRadius} 0 0,1 ${
            normalizedRadius * 2
          },0
        `}
        fill="none"
        className={`${getBookingStatusColor(
          'stroke',
          bookingStatus,
          startDate
        )}`}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      <path
        d={`
          M ${stroke / 2},${radius + stroke / 2}
          a ${normalizedRadius},${normalizedRadius} 0 0,1 ${
            normalizedRadius * 2
          },0
        `}
        fill="none"
        className={`${getBookingProgressStatusColor('stroke', bookingStatus)}`}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default SemiCircularProgressBar;
