'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { brevoApi } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Loader2, Trash, Upload } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ContactImport from './import-contact';
import PageContainer from '@/components/layout/page-container';

export default function Contacts() {
  const router = useRouter();
  const pathname = usePathname();

  const listId = pathname.split('/').pop();
  const [contacts, setContacts] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  const breadcrumbItems = [
    { title: 'Marketing', link: '/dashboard/marketing' },
    { title: 'Contacts', link: '/dashboard/marketing/contacts' },
    { title: 'List Contacts', link: `/dashboard/marketing/contacts/${listId}` }
  ];

  useEffect(() => {
    if (listId) {
      fetchContacts();
    }
  }, [listId]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const response = await brevoApi.get(
        `/contacts/lists/${listId}/contacts?modifiedSince=&limit=100&offset=0&sort=desc`
      );
      setContacts(response.data.contacts);
      console.log('Contacts:', response.data.contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch contacts. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updatedData = {
      attributes: {
        EMAIL: formData.get('email'),
        FIRSTNAME: formData.get('firstname'),
        LASTNAME: formData.get('lastname')
      },
      listIds: [parseInt(listId as string)]
    };

    try {
      await brevoApi.put(`/contacts/${selectedContact.id}`, updatedData);
      toast({
        title: 'Success',
        description: 'Contact updated successfully!',
        variant: 'success'
      });
      fetchContacts();
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to update contact. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const deleteContact = async (contact: any) => {
    try {
      await brevoApi.delete(`/contacts/${contact.id}`);
      toast({
        title: 'Success',
        description: 'Contact deleted successfully!',
        variant: 'success'
      });
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete contact. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <PageContainer scrollable>
      <div className="container mx-auto py-2">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Contacts</h1>
          <div className="flex space-x-4">
            <Button onClick={() => setIsImportModalOpen(true)}>
              <Upload className="mr-2 h-4 w-4" /> Import Contacts
            </Button>
            <Link href="/dashboard/marketing/contacts/create">
              <Button>Create New Contact</Button>
            </Link>
          </div>
        </div>
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>First Name</TableHead>
                <TableHead>Last Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact: any) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.attributes.FIRSTNAME}</TableCell>
                  <TableCell>{contact.attributes.LASTNAME}</TableCell>
                  <TableCell>{contact.createdAt.slice(0, 10)}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button onClick={() => setSelectedContact(contact)}>
                          Edit
                        </Button>
                      </DialogTrigger>

                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Contact</DialogTitle>
                        </DialogHeader>
                        <form
                          onSubmit={handleUpdateContact}
                          className="space-y-4"
                        >
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              name="email"
                              defaultValue={contact.email}
                            />
                          </div>
                          <div>
                            <Label htmlFor="firstname">First Name</Label>
                            <Input
                              id="firstname"
                              name="firstname"
                              defaultValue={contact.attributes.FIRSTNAME}
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastname">Last Name</Label>
                            <Input
                              id="lastname"
                              name="lastname"
                              defaultValue={contact.attributes.LASTNAME}
                            />
                          </div>
                          <div className="flex justify-between">
                            <Button type="submit">Update Contact</Button>
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() => deleteContact(contact)}
                            >
                              Delete
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Import Contacts</DialogTitle>
            </DialogHeader>
            <ContactImport
              listId={listId ? listId : ''}
              fetchContacts={fetchContacts}
              onClose={() => setIsImportModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
