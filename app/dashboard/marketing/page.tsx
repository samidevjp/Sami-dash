'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  Mail,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Trash,
  User2,
  Pause
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { brevoApi, formatDateShort } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';

export default function EmailCampaignsOverview() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getEmailCampaigns, createEmailCampaign } = useApi();
  const [availableLists, setAvailableLists] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response1 = await getEmailCampaigns();
        console.log('response1', response1);
        setAvailableLists(response1.data.listsIds);
        const campaignsId = response1.data.map((campaign: any) => {
          return {
            id: campaign.id
          };
        });
        // console.log(campaignsId);
        campaignsId.forEach(async (campaign: any) => {
          const response = await brevoApi.get(`/emailCampaigns/${campaign.id}`);
          console.log('response', response);
          setCampaigns((prevCampaigns) => {
            const campaignExists = prevCampaigns.some(
              (prevCampaign) => prevCampaign.id === response.data.id
            );

            if (campaignExists) {
              return prevCampaigns.map((prevCampaign) =>
                prevCampaign.id === response.data.id
                  ? response.data
                  : prevCampaign
              );
            } else {
              return [...prevCampaigns, response.data];
            }
          });
        });
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateCampaign = () => {
    router.push('/dashboard/marketing/create');
  };

  const sendCampaign = async (campaignId: string) => {
    try {
      const response = await brevoApi.post(
        `/emailCampaigns/${campaignId}/sendNow`
      );
      console.log('Campaign sent:', response.data);
      // Update the campaign status in the state
      setCampaigns(
        campaigns.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, status: 'sent' }
            : campaign
        )
      );
    } catch (error) {
      console.error('Error sending campaign:', error);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    try {
      await brevoApi.delete(`/emailCampaigns/${campaignId}`);
      // Remove the deleted campaign from the state
      setCampaigns(campaigns.filter((campaign) => campaign.id !== campaignId));
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  const suspendCampaign = async (campaignId: string) => {
    try {
      const params = { status: 'suspended' };
      await brevoApi.put(`/emailCampaigns/${campaignId}/status`, params);
      // Update the campaign status in the state

      setCampaigns(
        campaigns.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, status: 'suspended' }
            : campaign
        )
      );
    } catch (error) {
      console.error('Error suspending campaign:', error);
    }
  };

  const handleContactsList = () => {
    router.push('/dashboard/marketing/contacts');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-primary">Campaigns Overview</h1>
        <div className="flex gap-4">
          <Button onClick={handleContactsList}>
            <User2 className="mr-2 h-4 w-4" />
            Contacts List
          </Button>
          <Button onClick={handleCreateCampaign}>
            <Mail className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="grid gap-6">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onSend={() => sendCampaign(campaign.id)}
                onDelete={() => deleteCampaign(campaign.id)}
                suspendCampaign={() => suspendCampaign(campaign.id)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

const CampaignCard = ({
  campaign,
  onSend,
  onDelete,
  suspendCampaign
}: {
  campaign: any;
  onSend: () => void;
  onDelete: () => void;
  suspendCampaign: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { name, subject, status, scheduledAt, sender, statistics } = campaign;
  const statsData = [
    {
      name: 'Unique Clicks',
      value: statistics?.campaignStats[0]?.uniqueClicks
    },
    { name: 'Unique Views', value: statistics?.campaignStats[0]?.uniqueViews },
    { name: 'Sent', value: statistics?.campaignStats[0]?.sent },
    { name: 'Delivered', value: statistics?.campaignStats[0]?.delivered }
  ];

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-grow">
            <CardTitle className="text-2xl">{name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{subject}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={status === 'sent' ? 'success' : 'secondary'}>
              {status}
            </Badge>
            <Button onClick={onSend} disabled={status === 'sent'}>
              <Mail className="mr-2 h-4 w-4" />
              Send
            </Button>
            {isExpanded && status !== 'sent' && (
              <Button onClick={onDelete} variant="destructive">
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            {status === 'queued' && (
              <Button onClick={suspendCampaign}>
                <Pause className="mr-2 h-4 w-4" />
                Suspend
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpand}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isExpanded ? 'Hide' : 'Show'} details
              </span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {new Date(scheduledAt).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center">
            <User className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {sender.name} ({sender.email})
            </span>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold">Statistics</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip contentStyle={{ color: 'black' }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
