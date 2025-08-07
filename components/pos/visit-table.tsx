import React from 'react';
import moment from 'moment';

const VisitTable = ({
  title,
  visits,
  className
}: {
  title: string;
  visits: Array<{
    start_date: string;
    party_size: number;
    table: Array<{ name: string }>;
  }>;
  className?: string;
}) => (
  <li className={className}>
    <h4>{title}</h4>
    <table className="mt-2 w-full text-center">
      <thead>
        <tr className="text-sm">
          <th className="w-1/4">On</th>
          <th className="w-1/4">At</th>
          <th className="w-1/4">For</th>
          <th className="w-1/4">Details</th>
        </tr>
      </thead>
      <tbody>
        {visits.map((item, index) => (
          <tr className="text-xs" key={index}>
            <td className="py-1 ">
              {moment(item.start_date).format('dddd, DD MMM YYYY')}
            </td>
            <td>{moment(item.start_date).format('hh:mm A')}</td>
            <td>{item.party_size} Guests</td>
            <td>
              {item.table[0].name}
              {item.table.length > 1 && '(+1)'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </li>
);
export default VisitTable;
