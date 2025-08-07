import { ReactNode } from 'react';

type FormLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  fullWidth?: boolean;
};

export default function FormLayout({
  title,
  description,
  children,
  fullWidth = false
}: FormLayoutProps) {
  return (
    <div
      className={`flex-row gap-8 md:flex ${
        fullWidth ? 'w-full flex-col' : 'mx-auto max-w-4xl'
      }`}
    >
      {fullWidth ? (
        <div className="w-full space-y-4 pb-4 pt-8">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
      ) : (
        <div className="w-full space-y-4 pb-4 pt-8 md:w-1/3 md:pb-0">
          <h2 className="text-2xl font-semibold ">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
      )}

      <div className={`${fullWidth ? 'flex-1' : 'w-full md:w-2/3'}`}>
        {/* <div className="overflow-hidden rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/5 md:p-8"> */}
        {children}
        {/* </div> */}
      </div>
    </div>
  );
}
