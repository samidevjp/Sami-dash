'use client';

import React, { useEffect, useState } from 'react';
import { brevoApi } from '@/lib/utils';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/breadcrumbs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { useSession } from 'next-auth/react';

export default function ContactLists() {
  const [contactsList, setContactsList] = useState<any>([]);
  const [contactsFolders, setContactsFolders] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const { data: session } = useSession();

  const breadcrumbItems = [
    { title: 'Marketing', link: '/dashboard/marketing' },
    { title: 'Contacts', link: '/dashboard/marketing/contacts' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const campaignContactsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}campaigns/contacts`,
          {
            headers: {
              Authorization: `Bearer ${session?.user?.token}`
            }
          }
        );

        const campaignContacts = campaignContactsResponse.data.data;
        console.log('campaignContacts', campaignContacts);
        const listIds = campaignContacts.flatMap(
          (contact: any) => contact.listIds
        );

        const brevoListsResponse = await brevoApi.get('/contacts/lists', {
          params: {
            limit: 50,
            offset: 0,
            sort: 'desc',
            ids: listIds.join(',')
          }
        });

        setContactsList(brevoListsResponse.data.lists);

        const contactsFolderResponse = await brevoApi.get(
          '/contacts/folders?limit=10&offset=0&sort=desc'
        );
        setContactsFolders(contactsFolderResponse.data.folders);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch contact lists. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateList = async () => {
    try {
      // Create list in Brevo
      const brevoResponse = await brevoApi.post('/contacts/lists', {
        folderId: parseInt(selectedFolderId),
        name: newListName
      });

      // Create campaign contact in your API
      await axios.post(
        '/api/campaigns/contacts',
        {
          listIds: [brevoResponse.data.id],
          folderId: selectedFolderId
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`
          }
        }
      );

      // Update local state
      setContactsList([...contactsList, brevoResponse.data]);
      toast({
        title: 'Success',
        description: 'New list created successfully!',
        variant: 'success'
      });
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating list:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new list. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleCreateFolder = async () => {
    try {
      const response = await brevoApi.post('/contacts/folders', {
        name: newFolderName
      });
      setContactsFolders([...contactsFolders, response.data]);
      toast({
        title: 'Success',
        description: 'New folder created successfully!',
        variant: 'success'
      });
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new folder. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setNewListName('');
    setSelectedFolderId('');
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  return (
    <div className="container mx-auto py-8">
      <Breadcrumbs items={breadcrumbItems} />
      <h1 className="mb-8 text-4xl font-bold">Contact Lists</h1>
      {isLoading ? (
        <Loader2 className="h-8 w-8 animate-spin" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contactsList.map((list: any) => (
            <Card key={list.id}>
              <CardHeader>
                <CardTitle>{list.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Total Contacts: {list.uniqueSubscribers}</p>
                <Link href={`/dashboard/marketing/contacts/${list.id}`}>
                  <Button className="mt-4">View Contacts</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button className="mt-8">Create New List</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isCreatingFolder ? 'Create New Folder' : 'Create New List'}
            </DialogTitle>
          </DialogHeader>
          {isCreatingFolder ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="newFolderName">Folder Name</Label>
                <Input
                  id="newFolderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateFolder}>Create Folder</Button>
              <Button
                variant="outline"
                onClick={() => setIsCreatingFolder(false)}
              >
                Back to List Creation
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="newListName">List Name</Label>
                <Input
                  id="newListName"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="folderSelect">Select Folder</Label>
                <Select
                  value={selectedFolderId}
                  onValueChange={setSelectedFolderId}
                >
                  <SelectTrigger id="folderSelect">
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactsFolders.map((folder: any) => (
                      <SelectItem key={folder.id} value={folder.id.toString()}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between">
                <Button onClick={handleCreateList}>Create List</Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingFolder(true)}
                >
                  Create New Folder
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
