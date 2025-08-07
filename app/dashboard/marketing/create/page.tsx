'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import EmailEditor, { EditorRef, EmailEditorProps } from 'react-email-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { brevoApi } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

import appleTemplate from './templates/apple-template.json';
import minimalTemplate from './templates/minimal-template.json';
import modernTemplate from './templates/modern-template.json';

const templates = [
  { name: 'Apple-inspired', design: appleTemplate },
  { name: 'Minimal', design: minimalTemplate },
  { name: 'Modern', design: modernTemplate }
];

export default function EmailCampaignCreator() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();
  const router = useRouter();
  const emailEditorRef = useRef<any>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [contactsList, setContactsList] = useState<any>([]);
  const [selectedContactList, setSelectedContactList] = useState<any>(null);
  const [contacts, setContacts] = useState<any>([]);
  const [seeContacts, setSeeContacts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]);

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

  const exportHtml = () => {
    emailEditorRef.current.editor.exportHtml((data: any) => {
      const { html } = data;
      setHtmlContent(html);
    });
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    exportHtml();
    const campaignData = {
      ...data,
      recipients: {
        listIds: [Number(selectedContactList)]
      },
      htmlContent,
      scheduledAt: new Date(
        data.scheduledAt ? data.scheduledAt : Date.now() + 60 * 1000
      ).toISOString()
    };

    try {
      const response = await brevoApi.post('/emailCampaigns', campaignData);
      toast({
        title: 'Success',
        description: 'Campaign created successfully!',
        variant: 'success'
      });
      router.push('/dashboard/marketing');
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to create campaign.' + error.response.data.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onReady: EmailEditorProps['onReady'] = () => {
    emailEditorRef.current.editor.loadDesign(selectedTemplate.design);
  };

  const handleTemplateChange = (templateName: string) => {
    const template = templates.find((t) => t.name === templateName);
    if (template) {
      setSelectedTemplate(template);
      emailEditorRef.current.editor.loadDesign(template.design);
    }
  };

  return (
    <PageContainer scrollable>
      <div className="container mx-auto py-8">
        <h1 className="mb-8 text-4xl font-bold text-primary">
          Create New Email Campaign
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>
                Enter the basic information for your campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  {...register('name', { required: true })}
                  placeholder="e.g., Newsletter - May 2023"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    Campaign name is required.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  {...register('subject', { required: true })}
                  placeholder="e.g., Discover the New Collection!"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderName">Sender Name</Label>
                <Input
                  id="senderName"
                  {...register('sender.name', { required: true })}
                  placeholder="e.g., Mary from MyShop"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderEmail">Sender Email</Label>
                <Input
                  id="senderEmail"
                  type="email"
                  {...register('sender.email', { required: true })}
                  placeholder="e.g., newsletter@myshop.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Schedule At</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  {...register('scheduledAt')}
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
                      <SelectItem
                        key={contact.id}
                        value={contact.id.toString()}
                      >
                        {contact.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedContactList && (
                <Button onClick={() => setSeeContacts(true)} variant="outline">
                  See contacts
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Design</CardTitle>
              <CardDescription>
                Choose a template and customize your email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template">Select Template</Label>
                <Select
                  onValueChange={handleTemplateChange}
                  defaultValue={selectedTemplate.name}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.name} value={template.name}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-hidden rounded-lg border border-border shadow-md">
                <EmailEditor ref={emailEditorRef} onReady={onReady} />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Campaign...
              </>
            ) : (
              'Create Campaign'
            )}
          </Button>
        </form>

        <Dialog open={seeContacts} onOpenChange={setSeeContacts}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Contacts</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              {contacts.contacts?.map((contact: any) => (
                <div key={contact.id} className="py-2">
                  <p>{contact.email}</p>
                </div>
              ))}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </PageContainer>
  );
}
