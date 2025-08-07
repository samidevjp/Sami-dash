import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Bookings & Sales Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="col-span-1">
          {/* Bookings */}
          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="h-full">
                <CardHeader className="pb-1">
                  <CardTitle className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Skeleton className="h-5 w-5 rounded-sm" />
                    <Skeleton className="h-4 w-[160px]" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="mb-2 h-10 w-[120px]" />
                  <Skeleton className="h-5 w-[80px]" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Total Sales & Sales Overview */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Skeleton className="h-5 w-5 rounded-sm" />
                    <Skeleton className="h-4 w-[140px]" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="mb-4 h-10 w-[100px]" />
                  <Skeleton className="h-[200px] w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-1 h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Skeleton className="h-5 w-5 rounded-sm" />
                <Skeleton className="h-4 w-[120px]" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="mb-8 grid grid-cols-2 items-center gap-8 px-4">
                {[...Array(2)].map((_, i) => (
                  <Card key={i} className="border-none">
                    <CardHeader className="flex flex-row items-center gap-2 p-4 pb-2">
                      <Skeleton className="h-5 w-5 rounded-sm" />
                      <Skeleton className="h-4 w-[100px]" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Skeleton className="h-10 w-[100px]" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="max-h-[320px] w-full overflow-y-auto">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="mb-2 h-6 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row (Cost of Goods, Section Sales, Team Insights) */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Cost of Goods */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Skeleton className="h-5 w-5 rounded-sm" />
              <Skeleton className="h-4 w-[120px]" />
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 p-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="border-none">
                <CardHeader className="flex items-center gap-2 p-4 pb-2">
                  <Skeleton className="h-5 w-5 rounded-sm" />
                  <Skeleton className="h-4 w-[100px]" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="h-10 w-[100px]" />
                </CardContent>
              </Card>
            ))}
            <div className="col-span-2 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b py-2"
                >
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-4 w-[60px]" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Skeleton className="h-5 w-5 rounded-sm" />
              <Skeleton className="h-4 w-[100px]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="mb-4 h-4 w-full" />
            ))}
          </CardContent>
        </Card>

        {/* Team Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Skeleton className="h-5 w-5 rounded-sm" />
              <Skeleton className="h-4 w-[120px]" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between border-b py-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[60px]" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AnalyticsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Skeleton className="h-5 w-5 rounded-sm" />
              <Skeleton className="h-4 w-[150px]" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SalesSkeleton() {
  return (
    <div>
      <Card variant="secondary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Skeleton className="h-5 w-5 rounded-sm" />
            <Skeleton className="h-4 w-[150px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-8 px-6 md:w-1/2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="border-none">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Skeleton className="h-5 w-5 rounded-sm" />
                      <Skeleton className="h-4 w-[100px]" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-10 w-[100px]" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="h-[400px]">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
