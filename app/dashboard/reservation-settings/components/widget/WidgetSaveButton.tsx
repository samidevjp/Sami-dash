import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { WidgetSaveButtonProps } from '@/app/dashboard/reservation-settings/type';

const WidgetSaveButton: React.FC<WidgetSaveButtonProps> = ({
  settingId,
  uploadImagedata,
  setUploadImageData,
  deleteImageId,
  uploadLogoData,
  backgroundColor,
  accentColor,
  bookNowColor,
  selectedFont,
  useLogo,
  description,
  requireCreditCard,
  isShowPopup,
  isDisplaySectionName,
  isAllowSectionFilter,
  isShowOtherVenues,
  hasButtonFontColour,
  fetchWidgetBranding,
  isRelatedLink,
  relatedLinks,
  setRelatedLinks,
  selectedButtonShape,
  mvType
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const {
    updateWidgetBranding,
    uploadPhotoWidgetBranding,
    uploadLogoWidgetBranding,
    uploadWidgetRelatedLinkImage
  } = useApi();

  // Save Widget
  const handlesSave = async () => {
    try {
      setIsSaving(true);

      // 1. Validate input
      const invalidLink = relatedLinks
        .filter((link) => !link.is_deleted)
        .find((link) => !link.title?.trim() || !link.link_url?.trim());

      if (invalidLink) {
        toast({
          title: 'Error',
          description: 'Each related link must have a title and link URL.',
          variant: 'destructive'
        });
        setIsSaving(false);
        return;
      }

      // 2. Prepare params
      const params = {
        background_colour: backgroundColor,
        accent_colour: accentColor,
        book_now_colour: bookNowColor,
        font: selectedFont,
        font_size: '12px',
        require_credit_credentials: requireCreditCard ? 1 : 0,
        pop_up_wabi_posts: isShowPopup ? 1 : 0,
        display_other_venues: isShowOtherVenues ? 1 : 0,
        has_button_font_colour: hasButtonFontColour ? 1 : 0,
        description: description,
        filesToDelete: deleteImageId,
        display_section_name: isDisplaySectionName ? 1 : 0,
        enable_section_filter: isAllowSectionFilter ? 1 : 0,
        show_logo: useLogo ? 1 : 0,
        button_type: selectedButtonShape,
        use_related_links: isRelatedLink ? 1 : 0,
        mv_type: mvType,
        related_links: relatedLinks.map((link) => ({
          id: link.id,
          widget_branding_id: settingId,
          is_visible: link.is_visible,
          image_url: link.image_url,
          title: link.title,
          description: link.description,
          link_url: link.link_url,
          is_deleted: link.is_deleted
        }))
      };

      // 3. Save widget settings
      await updateWidgetBranding(params);

      // 4. Upload additional images (if any)
      if (uploadImagedata && uploadImagedata.length > 0) {
        try {
          await Promise.all(
            uploadImagedata.map(async (imageData: any) => {
              await uploadPhotoWidgetBranding(settingId, imageData);
            })
          );
          setUploadImageData([]);
        } catch (error) {
          console.log('Error uploading images:', error);
        }
      }

      // 5. Upload logo (if any)
      if (uploadLogoData && uploadLogoData instanceof File) {
        try {
          await uploadLogoWidgetBranding(settingId, uploadLogoData);
        } catch (error) {
          console.log('Error uploading logo:', error);
        }
      }
      // 6. Fetch the latest related links after saving

      const brandingData: any = await fetchWidgetBranding();
      const updatedLinks = brandingData?.related_links ?? [];

      // 7. Upload related link images for newly added links
      const uploadImageTasks = relatedLinks
        .filter((link) => !link.is_deleted && link.imageFile)
        .map((localLink) => {
          if (localLink.is_new) {
            // Newly created link: need to find the new ID after saving
            const matched = updatedLinks.find(
              (serverLink: any) =>
                serverLink.title === localLink.title &&
                serverLink.link_url === localLink.link_url
            );
            if (matched && matched.id) {
              return uploadWidgetRelatedLinkImage(
                matched.id,
                localLink.imageFile!
              );
            }
          } else {
            // Existing link: already has ID
            if (localLink.id) {
              return uploadWidgetRelatedLinkImage(
                localLink.id,
                localLink.imageFile!
              );
            }
          }
          return null;
        })
        .filter(Boolean);
      await Promise.all(uploadImageTasks);
      // 8. Optionally, re-fetch everything to fully refresh the screen
      fetchWidgetBranding();
      // 9. Clean up relatedLinks after saving
      setRelatedLinks((prevLinks) =>
        prevLinks.map((link) => ({
          ...link,
          imageFile: undefined,
          is_new: false
        }))
      );
      toast({
        duration: 20000,
        title: 'Saved!',
        description: 'All changes have been saved successfully.',
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error saving widget',
        variant: 'destructive'
      });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        variant="default"
        className="flex w-40 items-center justify-center gap-2"
        disabled={isSaving}
        onClick={() => handlesSave()}
      >
        Save
      </Button>
    </>
  );
};

export default WidgetSaveButton;
