import { Button } from '@/components/ui/button';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange
}: any) {
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        onClick={handlePreviousPage}
        disabled={currentPage === 1}
        className="px-4 py-2"
      >
        Previous
      </Button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <Button
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className="px-4 py-2"
      >
        Next
      </Button>
    </div>
  );
}
