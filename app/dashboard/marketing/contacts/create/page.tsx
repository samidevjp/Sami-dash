'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { brevoApi } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumbs } from '@/components/breadcrumbs';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();
  const [contactsList, setContactsList] = useState<any>([]);
  const [selectedContactList, setSelectedContactList] = useState<any>(null);
  const [contacts, setContacts] = useState<any>([]);
  const [seeContacts, setSeeContacts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const breadcrumbItems = [
    { title: 'Marketing', link: '/dashboard/marketing' },
    { title: 'Contacts', link: '/dashboard/marketing/contacts/create' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const contactsListResponse = await brevoApi.get(
          '/contacts/lists?limit=10&offset=0&sort=desc'
        );
        setContactsList(contactsListResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedContactList) {
      const fetchContacts = async () => {
        setIsLoading(true);
        try {
          const response = await brevoApi.get(
            `/contacts/lists/${selectedContactList}/contacts?modifiedSince=&limit=50&offset=0&sort=desc`
          );
          setContacts(response.data);
        } catch (error) {
          console.error('Error fetching contacts:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchContacts();
    }
  }, [selectedContactList]);

  const onSubmit = async (data: any) => {
    if (!selectedContactList) {
      toast({
        title: 'Error',
        description: 'Please select a contact list.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      const contactData = {
        email: data.email,
        attributes: {
          FIRSTNAME: data.firstname,
          LASTNAME: data.lastname,
          SMS: data.phone
        },
        listIds: [parseInt(selectedContactList)]
      };

      const response = await brevoApi.post('/contacts', contactData);
      console.log(response.data);
      toast({
        title: 'Success',
        description: 'Contact created successfully!',
        variant: 'success'
      });
      reset();
    } catch (error: any) {
      console.error('Error creating contact:', error);
      toast({
        title: 'Error',
        description: error.response.data.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Contact</CardTitle>
        <CardDescription>
          Add a new contact to your selected list
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email', { required: true })}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">Email is required.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstname">First Name</Label>
            <Input
              id="firstname"
              {...register('firstname', { required: true })}
              placeholder="John"
            />
            {errors.name && (
              <p className="text-sm text-destructive">Name is required.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastname">Last Name</Label>
            <Input
              id="lastname"
              {...register('lastname', { required: true })}
              placeholder="Doe"
            />
            {errors.name && (
              <p className="text-sm text-destructive">Name is required.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              {...register('phone')}
              placeholder="+1234567890"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactList">Select Contact List</Label>
            <Select onValueChange={setSelectedContactList}>
              <SelectTrigger>
                <SelectValue placeholder="Select a contact list" />
              </SelectTrigger>
              <SelectContent>
                {contactsList.lists?.map((contact: any) => (
                  <SelectItem key={contact.id} value={contact.id.toString()}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Contact...
              </>
            ) : (
              'Create Contact'
            )}
          </Button>
        </form>
        <Link href="/dashboard/marketing/contacts">
          <Button className="mt-4">Back to Contacts</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default Page;
