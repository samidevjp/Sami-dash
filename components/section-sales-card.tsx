import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatNumberWithCommas } from '@/lib/utils';

interface SectionSale {
  floor_id: number;
  floor_name: string;
  total_sales: number;
}

export function SectionSalesCard({ data }: { data: SectionSale[] }) {
  return (
    <div className="space-y-3">
      {data.length > 0 ? (
        data.map((section: SectionSale) => (
          <Card key={section.floor_id} className="border-none">
            <CardHeader className="pb-1 pt-3">
              <CardTitle className="text-xs">{section.floor_name}</CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="flex items-center gap-1 text-2xl font-medium">
                <span className="text-base">$</span>
                {formatNumberWithCommas(section.total_sales.toFixed(2))}
              </p>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No section sales to display.
        </div>
      )}
    </div>
  );
}
