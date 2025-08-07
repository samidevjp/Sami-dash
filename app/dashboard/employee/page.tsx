'use client';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { columns } from '@/components/tables/employee-tables/columns';
import { EmployeeTable } from '@/components/tables/employee-tables/employee-table';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Employee } from '@/constants/data';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const breadcrumbItems = [
  { title: 'Dashboard', link: '/dashboard' },
  { title: 'Employee', link: '/dashboard/employee' }
];

type ParamsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

export default function Page({ searchParams }: ParamsProps) {
  const [employee, setEmployee] = useState<any[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const country = searchParams.search || null;
  const { data: session } = useSession();
  const offset = (page - 1) * pageLimit;

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.token) return;

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}get_employees`,
          {},
          { headers: { Authorization: `Bearer ${session.user.token}` } }
        );

        const employeeRes = res.data.data;
        console.log('data', employeeRes.employees);
        const totalUsers = employeeRes.employees.length; //1000
        setTotalUsers(totalUsers);
        const pageCount = Math.ceil(totalUsers / pageLimit);
        setPageCount(pageCount);
        const employee: Employee[] = [...employeeRes.employees];
        setEmployee(employee);
        // console.log(employee);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchData();
  }, [session, pageLimit]);

  return (
    <PageContainer>
      <div className="space-y-4">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title={`Employee (${totalUsers})`}
            description="Manage employees (Server side table functionalities.)"
          />

          <Link
            href={'/dashboard/employee/new'}
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </div>
        <Separator />

        <EmployeeTable
          searchKey="country"
          pageNo={page}
          columns={columns}
          totalUsers={totalUsers}
          data={employee}
          pageCount={pageCount}
        />
      </div>
    </PageContainer>
  );
}
