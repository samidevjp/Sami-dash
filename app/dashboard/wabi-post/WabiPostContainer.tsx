import React, { useState } from 'react';
import TabMenu from './TabMenu';
import Carousel from './Carousel';
import EditorContent from './EditorContent';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Share2, Eye, Pencil, CircleAlert } from 'lucide-react';
import { ContentProps, ContainerProps } from './types';
import { useSession } from 'next-auth/react';
import { toast } from '@/components/ui/use-toast';

interface TabMenuProps {
  selectedTab: string;
  setSelectedTab: React.Dispatch<React.SetStateAction<string>>;
}
const WabiPostContainer: React.FC<ContainerProps> = ({
  entitySearch,
  setEntitySearch,
  fetchEntitySearch
}) => {
  const tabs = ['Tickets', 'Experience', 'Post'];
  const [selectedTab, setSelectedTab] =
    useState<TabMenuProps['selectedTab']>('Tickets');
  const { data: session } = useSession();
  const hasStripeAccount = !!session?.user.stripeAccount;
  const widgetToken = session?.user?.widget_token;
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => {
    setIsOpen(false);
    setSelectedContent(null);
  };
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentProps | null>(
    null
  );
  const handleAddContent = () => {
    // Check if user is trying to create a ticket without a stripe account
    if (selectedTab === 'Tickets' && !hasStripeAccount) {
      toast({
        title: 'Stripe Account Required',
        description:
          'You need to connect a Stripe account to create tickets. You can still create experiences and posts.',
        variant: 'destructive'
      });
      return;
    }

    setSelectedContent(null);
    setIsOpen(true);
  };
  const handleEdit = (post: ContentProps) => {
    setSelectedContent(post);
    setIsOpen(true);
  };
  const handleShare = (post: {
    id: string;
    type: string;
    data: any;
    visits: number;
    updated_at: string;
    name: string;
  }) => {
    const postType =
      post.type === 'TICKET'
        ? '/tickets'
        : post.type === 'EXPERIENCE'
        ? '/events'
        : '/posts';
    const link =
      process.env.NEXT_PUBLIC_WIDGET_LINK +
      postType +
      '/' +
      post.data.id +
      '/' +
      widgetToken;

    navigator.clipboard.writeText(link);
    toast({
      title: 'Link Copied',
      description: `The link for "${post.name}" has been copied to your clipboard.`,
      variant: 'success'
    });
  };
  const mapFilesWithBucketPath = (files: any[]) =>
    files.map((file) => ({
      ...file,
      path: `${process.env.NEXT_PUBLIC_IMG_URL}${file.path}`
    }));
  return (
    <>
      <div className="items-center justify-between border-b px-4 md:flex">
        <TabMenu setSelectedTab={setSelectedTab} tabs={tabs} />
        <Button
          className="mb-2"
          onClick={() => handleAddContent()}
          disabled={
            (selectedTab === 'Tickets' && !hasStripeAccount) ||
            (selectedTab === 'Experience' && !hasStripeAccount)
          }
        >
          Add {selectedTab}
          {(selectedTab === 'Tickets' || selectedTab === 'Experience') &&
            !hasStripeAccount && (
              <span className="ml-1 text-xs">(Stripe account required)</span>
            )}
        </Button>
      </div>
      <div
        className="relative h-full overflow-y-auto"
        style={{
          maxHeight:
            selectedTab === 'Tickets' ? '80dvh' : 'calc(100dvh - 200px)'
        }}
      >
        {(selectedTab === 'Tickets' || selectedTab === 'Experience') &&
          !hasStripeAccount && (
            <div className="flex min-h-[80vh] flex-col items-center justify-center bg-accent p-4">
              <h3 className="mb-4 flex items-center gap-2 text-2xl font-semibold">
                <CircleAlert />
                Stripe Account Required
              </h3>
              <p className="mb-6 text-center">
                You need to connect a Stripe account to create tickets and
                experiences. You can still create posts.
              </p>

              <Button
                variant="submit"
                className="min-w-52 max-w-52 max-md:mt-4"
                onClick={() =>
                  window.open('https://onboard.wabify.net/', '_blank')
                }
              >
                Connect Stripe Account
              </Button>
            </div>
          )}
        <div
          className="flex flex-wrap content-start gap-4 overflow-auto p-6 sm:grid"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))'
          }}
        >
          {entitySearch.filter((post: any) => {
            if (selectedTab === 'Tickets') return post.type === 'TICKET';
            if (selectedTab === 'Experience') return post.type === 'EXPERIENCE';
            if (selectedTab === 'Post') return post.type === 'POST';
            return true;
          }).length === 0 ? (
            <></>
          ) : (
            entitySearch
              .filter((post: any) => {
                if (selectedTab === 'Tickets') return post.type === 'TICKET';
                if (selectedTab === 'Experience')
                  return post.type === 'EXPERIENCE';
                if (selectedTab === 'Post') return post.type === 'POST';
                return true;
              })
              .map((content: any) => (
                <div
                  key={content.id}
                  className="w-full overflow-hidden rounded-lg bg-secondary shadow-md"
                >
                  <div
                    className="relative overflow-hidden"
                    style={{ height: '180px' }}
                  >
                    <Carousel
                      imagePreview={mapFilesWithBucketPath(content.data.files)}
                    />
                    <Button
                      variant="ghost"
                      className="absolute right-2 top-2 z-10 h-8 w-8 rounded-full bg-white p-0 text-gray-500 shadow-lg"
                      onClick={() => handleEdit(content)}
                    >
                      <Pencil size={16} />
                    </Button>
                  </div>
                  <div className="p-3 pt-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          content.data.status === 1
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {content.data.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          className="h-8 w-8  rounded-full p-0 px-2 py-1 text-muted-foreground"
                          onClick={() => handleShare(content)}
                        >
                          <Share2 size={16} />
                        </Button>
                        <div className="flex flex-col items-center justify-center pt-2 text-muted-foreground">
                          <Eye size={16} />
                          <span
                            className="relative -top-1"
                            style={{ fontSize: '0.5rem' }}
                          >
                            {content.visits}
                          </span>
                        </div>
                      </div>
                    </div>
                    <h2 className="text-sm font-semibold">{content.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {content?.data?.description?.length > 140
                        ? `${content.data.description.substring(0, 100)}[...]`
                        : content.data.description}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Posted on {content.updated_at}
                    </p>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
      {selectedTab && (
        <EditorContent
          selectedContent={selectedContent}
          selectedTab={selectedTab}
          isOpen={isOpen}
          onClose={onClose}
          entitySearch={entitySearch}
          setEntitySearch={setEntitySearch}
          fetchEntitySearch={fetchEntitySearch}
          hasStripeAccount={hasStripeAccount}
        />
      )}
      <Modal
        description="Are you sure you want to delete this content?"
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Content"
      >
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant={'danger'} onClick={() => setDeleteModalOpen(false)}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
};
export default WabiPostContainer;
