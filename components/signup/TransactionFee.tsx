interface TransactionFeeProps {
  isShowPersonTransactionFee: boolean;
  isShowOnlineTransactionFee: boolean;
}

export const TransactionFee = ({
  isShowPersonTransactionFee,
  isShowOnlineTransactionFee
}: TransactionFeeProps) => {
  const transactionFees = [];
  if (isShowPersonTransactionFee) {
    transactionFees.push({
      type: 'In-Person Transaction',
      fees: [
        { text: '1.95% + $0.30 domestic cards' },
        { text: '2.5% + $0.30 amex domestic' },
        { text: '5% + $0.50 international' }
      ]
    });
  }
  if (isShowOnlineTransactionFee) {
    transactionFees.push({
      type: 'Online Transaction',
      fees: [
        { text: '3% + $0.30 domestic cards' },
        { text: '5% + $0.50 international' }
      ]
    });
  }

  return (
    <div className=" text-description rounded-lg ">
      {/* <h3 className="text-base font-semibold  mb-3">Transaction Fees</h3> */}
      <div className="flex flex-col gap-4">
        {transactionFees.map((transaction, index) => (
          <div key={index} className="rounded-lg border bg-gray-50 p-4 ">
            <h4 className="mb-2 text-sm  font-semibold">{transaction.type}</h4>
            <ul className="space-y-1 text-xs text-gray-600">
              {transaction.fees.map((fee, feeIndex) => (
                <li key={feeIndex} className="flex items-center">
                  <svg
                    className="mr-2 h-3 w-3 shrink-0 fill-primary"
                    viewBox="0 0 12 12"
                  >
                    <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                  </svg>
                  {fee.text}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
