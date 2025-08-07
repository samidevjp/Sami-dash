import React, { useState, useEffect } from 'react';
import { X, Info, Trash2, Undo2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  BUTTON_SHAPES,
  MV_TYPE
} from '@/app/dashboard/reservation-settings/enums-settings';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { resizeImage } from '@/lib/utils';
import {
  WidgetSettingsProps,
  RelatedLink
} from '@/app/dashboard/reservation-settings/type';

const WidgetSettings: React.FC<WidgetSettingsProps> = ({
  useLogo,
  setUseLogo,
  imagePreview,
  setImagePreview,
  uploadImagedata,
  setUploadImagedata,
  setdeleteImageId,
  logoPreview,
  setLogoPreview,
  setUploadLogoData,
  backgroundColor,
  setBackgroundColor,
  accentColor,
  setAccentColor,
  bookNowColor,
  setBookNowColor,
  isResetDesign,
  setIsResetDesign,
  previousColors,
  setPreviousColors,
  selectedFont,
  setSelectedFont,
  isShowPopup,
  setIsShowPopup,
  isDisplaySectionName,
  setIsDisplaySectionName,
  isAllowSectionFilter,
  setIsAllowSectionFilter,

  hasButtonFontColour,
  setHasButtonFontColour,
  description,
  setDescription,
  isRelatedLink,
  setIsRelatedLink,
  relatedLinks,
  setRelatedLinks,
  selectedButtonShape,
  setSelectedButtonShape,
  mvType,
  setMvType
}) => {
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState<boolean>(false);
  const [isButtonShapeDropdownOpen, setIsButtonShapeDropdownOpen] =
    useState<boolean>(false);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {}
  );

  const [relatedLinkErrors, setRelatedLinkErrors] = useState<
    { title?: string; description?: string; link_url?: string }[]
  >([]);

  const MAX_IMAGE_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const MAX_IMAGE_DIMENSION = 1920;

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    const now = Date.now();

    if (files) {
      const newFiles = await Promise.all(
        Array.from(files).map(async (file) => {
          let resizedFile = file;
          if (
            file.size > MAX_IMAGE_FILE_SIZE &&
            file.type.startsWith('image/')
          ) {
            try {
              resizedFile = await resizeImage(
                file,
                MAX_IMAGE_FILE_SIZE,
                MAX_IMAGE_DIMENSION
              );
            } catch (error) {
              console.error(`Error resizing ${file.name}:`, error);
            }
          }
          return {
            id: now,
            path: URL.createObjectURL(resizedFile),
            file_type: resizedFile.type,
            fileable_id: 0,
            fileable_type: ''
          };
        })
      );

      setImagePreview((prev) => [...prev, ...newFiles]);

      const uploadFiles = await Promise.all(
        Array.from(files).map(async (file) => {
          let resizedFile = file;
          if (
            file.size > MAX_IMAGE_FILE_SIZE &&
            file.type.startsWith('image/')
          ) {
            try {
              resizedFile = await resizeImage(
                file,
                MAX_IMAGE_FILE_SIZE,
                MAX_IMAGE_DIMENSION
              );
            } catch (error) {
              console.error(`Error resizing ${file.name}:`, error);
            }
          }
          // @ts-ignore
          resizedFile.id = now;
          return resizedFile;
        })
      );

      setUploadImagedata((prev: any) => [...prev, ...uploadFiles]);
    }
  };

  const MAX_LOGO_SIZE = 500 * 1024;
  const MAX_LOGO_DIMENSION = 500;

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files && event.target.files[0];

    if (file) {
      let resizedFile = file;
      if (file.size > MAX_LOGO_SIZE && file.type.startsWith('image/')) {
        try {
          resizedFile = await resizeImage(
            file,
            MAX_LOGO_SIZE / 1024 / 1024,
            MAX_LOGO_DIMENSION
          );
        } catch (error) {
          console.error('Error resizing logo image:', error);
          return;
        }
      }

      const logoUrl = URL.createObjectURL(resizedFile);
      setLogoPreview(logoUrl);
      setUploadLogoData(resizedFile);
    }
  };
  const handleDeletePhoto = (id: number) => {
    setdeleteImageId((prev: number[]) => [...prev, id]);
    setImagePreview((prev) => prev.filter((image) => image.id !== id));
    setUploadImagedata((prev: any) =>
      prev.filter((file: any) => file.id !== id)
    );
  };
  const handleBlur = (index: number) => {
    const updatedErrors = [...relatedLinkErrors];
    const link = relatedLinks[index];
    const errors = validateLink(link);
    updatedErrors[index] = errors;
    setRelatedLinkErrors(updatedErrors);
  };
  const handleResetDesignToggle = (checked: boolean) => {
    if (checked) {
      setPreviousColors({
        backgroundColor,
        accentColor,
        bookNowColor
      });
      setBackgroundColor('#000000');
      setAccentColor('#ffffff');
      setBookNowColor('#485df9');
    } else {
      setBackgroundColor(previousColors.backgroundColor);
      setAccentColor(previousColors.accentColor);
      setBookNowColor(previousColors.bookNowColor);
    }
    setIsResetDesign(checked);
  };
  const handleChange = (
    index: number,
    key: keyof RelatedLink,
    value: string | number
  ) => {
    const updated = [...relatedLinks];
    (updated[index][key] as typeof value) = value;

    if (!updated[index].is_new) {
      updated[index].is_edited = true;
    }

    setRelatedLinks(updated);
  };

  const handleAddLink = () => {
    setRelatedLinks((prev: any[]) => [
      ...prev,
      {
        image_url: '',
        title: '',
        description: '',
        link_url: '',
        is_visible: 1,
        is_new: true
      }
    ]);
  };

  const validateLink = (link: RelatedLink) => {
    const errors: { title?: string; link_url?: string; description?: string } =
      {};

    if (!link.title || link.title.trim() === '') {
      errors.title = 'Title is required.';
    } else if (link.title.length > 50) {
      errors.title = 'Title must be 50 characters or less.';
    }

    if (link.description && link.description.length > 150) {
      errors.description = 'Description must be 150 characters or less.';
    }

    if (!link.link_url || link.link_url.trim() === '') {
      errors.link_url = 'Link URL is required.';
    } else if (!/^https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+$/.test(link.link_url)) {
      errors.link_url = 'Invalid URL format.';
    }

    return errors;
  };

  const MAX_RELATED_LINK_IMAGE_SIZE = 500 * 1024; // 500KB
  const MAX_RELATED_LINK_IMAGE_DIMENSION = 500;

  const handleRelatedLinkImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let resizedFile = file;

    if (
      file.size > MAX_RELATED_LINK_IMAGE_SIZE &&
      file.type.startsWith('image/')
    ) {
      try {
        resizedFile = await resizeImage(
          file,
          MAX_RELATED_LINK_IMAGE_SIZE,
          MAX_RELATED_LINK_IMAGE_DIMENSION
        );
      } catch (error) {
        console.error('Error resizing related link image:', error);
        return;
      }
    }

    const updated = [...relatedLinks];
    updated[index].imageFile = resizedFile;
    setRelatedLinks(updated);
  };

  const handleImageError = (imagePath: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [imagePath]: true
    }));
  };

  return (
    <div className="">
      <div className="border-b pb-6">
        <h2 className="text-md mb-1 font-semibold">Brand elements</h2>
        <p className="text-xs">
          Set your default brand elements to determine how You Wabi widget will
          appear to your customers.
        </p>
      </div>
      {/* Image */}
      <div className="border-b py-6">
        <div className="mb-4 flex flex-wrap items-center justify-between">
          <div className="flex gap-2">
            <Label className="mb-2">Image</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="">
                    <Info size={16} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  This image will be displayed when there is no registered
                  image.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {imagePreview.length > 0 ? (
              <>
                {imagePreview.map((image) => (
                  <Label key={image.id} htmlFor={`file-input-${image.id}`}>
                    <div className="group relative h-16 w-16 overflow-hidden rounded-lg border bg-gray-100">
                      <button
                        className="absolute right-1 top-1 z-10 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => {
                          handleDeletePhoto(image.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>

                      <Image
                        alt=""
                        width={60}
                        height={60}
                        src={
                          imageErrors[image.path]
                            ? '/placeholder-img.png'
                            : image.path
                        }
                        className="h-full w-full object-cover"
                        onError={() => handleImageError(image.path)}
                      />
                    </div>
                  </Label>
                ))}
                {imagePreview.length < 5 && (
                  <Label htmlFor="new-file-input" className="cursor-pointer">
                    <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-400 text-white">
                      <span className="text-xl">+</span>
                    </div>
                    <Input
                      id="new-file-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e)}
                      className="hidden"
                    />
                  </Label>
                )}
              </>
            ) : (
              <Label htmlFor="new-file-input" className="cursor-pointer">
                <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-400 text-white">
                  <span className="text-xl">+</span>
                </div>
                <Input
                  id="new-file-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e)}
                  className="hidden"
                />
              </Label>
            )}
          </div>
        </div>

        <Label className="mb-4 flex cursor-pointer items-center justify-between">
          <span className="mr-2">Display Entire Image</span>
          <Switch
            checked={mvType === MV_TYPE.FullImage}
            onCheckedChange={(checked) => {
              setMvType(checked ? MV_TYPE.FullImage : MV_TYPE.Cropped);
            }}
          />
        </Label>
        <div className="mb-4 flex items-center justify-between">
          <Label className="mb-2">Logo</Label>
          <div className="flex items-center space-x-2">
            <Label htmlFor="logo-input" className="cursor-pointer">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded bg-gray-400 text-white">
                {logoPreview ? (
                  <Image
                    width={60}
                    height={60}
                    src={logoPreview}
                    alt="Logo Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl">+</span>
                )}
              </div>
            </Label>
            <Input
              id="logo-input"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </div>
        <Label className="flex cursor-pointer items-center justify-between">
          <span className="mr-2">Show logo</span>
          <Switch
            checked={useLogo}
            onCheckedChange={(checked) => setUseLogo(checked)}
          />
        </Label>
      </div>
      {/* Colors */}
      <div className="border-b py-6">
        {/* Colour pallet */}
        <div
          className={
            isResetDesign ? 'pointer-events-none cursor-not-allowed' : ''
          }
        >
          <div className="mb-4 flex items-center justify-between space-x-4">
            <Label className="mb-2">Background colour</Label>
            <div className="flex w-28 items-center overflow-hidden rounded-lg border-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-10 min-w-10 max-w-10 cursor-pointer border-none p-0"
                style={{ backgroundColor: 'transparent' }}
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value.startsWith('#')) {
                    setBackgroundColor(`#${value}`);
                  } else {
                    setBackgroundColor(value);
                  }
                }}
                className={
                  isResetDesign
                    ? 'w-full border-none p-2 text-center text-xs text-gray-500'
                    : 'w-full border-none p-2 text-center text-xs'
                }
              />
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between space-x-4">
            <Label className="mb-2">Font colour</Label>
            <div className="flex w-28 items-center overflow-hidden rounded-lg border-2">
              <Input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-10 min-w-10 max-w-10 cursor-pointer border-none p-0"
                style={{ backgroundColor: 'transparent' }}
              />
              <Input
                type="text"
                value={accentColor}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value.startsWith('#')) {
                    setAccentColor(`#${value}`);
                  } else {
                    setAccentColor(value);
                  }
                }}
                className={
                  isResetDesign
                    ? 'w-full border-none p-2 text-center text-xs text-gray-500'
                    : 'w-full border-none p-2 text-center text-xs'
                }
              />
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between space-x-4">
            <Label className="mb-2">Button colour</Label>
            <div className="flex w-28  items-center overflow-hidden rounded-lg border-2">
              <Input
                type="color"
                value={bookNowColor}
                onChange={(e) => {
                  setBookNowColor(e.target.value);
                }}
                className="h-10 min-w-10 max-w-10 cursor-pointer border-none p-0"
                style={{ backgroundColor: 'transparent' }}
              />
              <Input
                type="text"
                value={bookNowColor}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value.startsWith('#')) {
                    setBookNowColor(`#${value}`);
                  } else {
                    setBookNowColor(value);
                  }
                }}
                className={
                  isResetDesign
                    ? 'w-full border-none p-2 text-center text-xs text-gray-500'
                    : 'w-full border-none p-2 text-center text-xs'
                }
              />
            </div>
          </div>
        </div>
        <Label className="mb-8 flex cursor-pointer items-center justify-between">
          <span className="mr-2">
            Use the same colour as the font color for the button
          </span>
          <Switch
            checked={hasButtonFontColour}
            onCheckedChange={() => setHasButtonFontColour(!hasButtonFontColour)}
          />
        </Label>
        {/* Reset the design */}
        <Label className="mb-8 flex cursor-pointer items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="mr-2">Reset the design to default colors</span>
          </div>
          <Switch
            checked={isResetDesign}
            onCheckedChange={(checked) => handleResetDesignToggle(checked)}
          />
        </Label>
      </div>
      {/* Font */}
      <div className="border-b py-6">
        <div className="mb-4 flex items-center justify-between space-x-4">
          <Label className="mb-2">Font</Label>
          <DropdownMenu
            open={isFontDropdownOpen}
            onOpenChange={setIsFontDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-1/2">
                {selectedFont || 'Select a Font'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {[
                'Arial',
                'Georgia',
                'Times New Roman',
                'Verdana',
                'Helvetica',
                'Courier New',
                'Trebuchet MS',
                'Lucida Sans Unicode',
                'Tahoma',
                'Comic Sans MS',
                'Impact',
                'Palatino Linotype'
              ].map((font) => (
                <DropdownMenuItem
                  key={font}
                  onSelect={() => setSelectedFont(font)}
                >
                  {font}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Design of timeslots button */}
        <div className="flex items-center justify-between space-x-4 py-6">
          <Label className="mb-2">Timeslots Shape</Label>
          <DropdownMenu
            open={isButtonShapeDropdownOpen}
            onOpenChange={setIsButtonShapeDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-1/2">
                {selectedButtonShape
                  ? BUTTON_SHAPES.find(
                      (shape) => shape.value === selectedButtonShape
                    )?.label
                  : 'Select a Timeslots Shape'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {BUTTON_SHAPES.map((shape) => (
                <DropdownMenuItem
                  key={shape.value}
                  onSelect={() => setSelectedButtonShape(shape.value)}
                >
                  {shape.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mb-4">
          <Label>
            <p className="mb-2">Type text</p>
          </Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>
      </div>

      {/* Related links */}
      <div className="border-b py-6">
        <h2 className="text-md mb-1 font-semibold">Related links</h2>
        <p className="mb-8 text-xs">
          Add links to your website, social media, or other relevant platforms.
        </p>
        <div className="pl-4">
          <div className="mb-8">
            <Label className="mb-8 flex cursor-pointer items-center justify-between">
              <span className="mr-2">Display related links</span>
              <Switch
                checked={isRelatedLink}
                onCheckedChange={() => setIsRelatedLink(!isRelatedLink)}
              />
            </Label>
          </div>

          {isRelatedLink && (
            <div className="rounded-lg border p-4 shadow-sm">
              <div className="grid max-h-96 grid-cols-2 gap-4 overflow-y-scroll">
                {relatedLinks.map((link, index) => (
                  <div
                    key={index}
                    className={`space-y-2 rounded-lg border bg-secondary p-4 
                      ${
                        link.is_new || link.is_edited
                          ? 'border-green-400'
                          : 'border-transparent'
                      }`}
                  >
                    {link.is_deleted ? (
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-xs text-danger">
                          This link will be deleted.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const updated = [...relatedLinks];
                            updated[index].is_deleted = false;
                            setRelatedLinks(updated);
                          }}
                          className="border px-2"
                        >
                          <Undo2 size={16} className="mr-1" />
                          Undo
                        </Button>
                      </div>
                    ) : (
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="relative mr-2 h-[40px] w-[40px] overflow-hidden rounded-full">
                            <div className="relative h-[40px] w-[40px] overflow-hidden rounded-full">
                              <label
                                htmlFor={`related-link-file-${index}`}
                                className="cursor-pointer"
                              >
                                <Image
                                  src={
                                    link.imageFile
                                      ? URL.createObjectURL(link.imageFile)
                                      : link.image_url
                                      ? `${process.env.NEXT_PUBLIC_IMG_URL}${link.image_url}`
                                      : '/placeholder-img.png'
                                  }
                                  alt={link.title || 'Placeholder'}
                                  fill
                                  className="object-cover"
                                />
                              </label>
                              <input
                                id={`related-link-file-${index}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleRelatedLinkImageSelect(e, index)
                                }
                              />
                            </div>
                          </div>
                          <p className="text-sm">Activate</p>
                          <Switch
                            checked={link.is_visible === 1}
                            onCheckedChange={(checked) =>
                              handleChange(index, 'is_visible', checked ? 1 : 0)
                            }
                          />
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            const updated = [...relatedLinks];
                            if (updated[index].is_new) {
                              updated.splice(index, 1);
                            } else {
                              updated[index].is_deleted = true;
                            }
                            setRelatedLinks(updated);
                          }}
                          className="px-2 py-1"
                        >
                          <Trash2 size={16} className="text-danger" />
                        </Button>
                      </div>
                    )}
                    <div className="px-2">
                      <Label>
                        <p className="mb-1 text-xs">
                          Link Title <span className="text-danger">*</span>
                        </p>
                        <Input
                          className="text-xs"
                          placeholder="Title"
                          value={link.title}
                          onChange={(e) =>
                            handleChange(index, 'title', e.target.value)
                          }
                          onBlur={() => handleBlur(index)}
                        />
                        {relatedLinkErrors[index]?.title && (
                          <p className="mt-1 text-xs text-danger">
                            {relatedLinkErrors[index].title}
                          </p>
                        )}
                      </Label>
                      <Label>
                        <p className="mb-1 mt-2 text-xs">
                          Link URL <span className="text-danger">*</span>
                        </p>
                        <Input
                          className="text-xs"
                          placeholder="https://..."
                          value={link.link_url}
                          onChange={(e) =>
                            handleChange(index, 'link_url', e.target.value)
                          }
                          onBlur={() => handleBlur(index)}
                        />
                        {relatedLinkErrors[index]?.link_url && (
                          <p className="mt-1 text-xs text-danger">
                            {relatedLinkErrors[index].link_url}
                          </p>
                        )}
                      </Label>
                      <Label>
                        <p className="mb-1 mt-2 text-xs">Description</p>
                        <Input
                          className="text-xs"
                          placeholder="Description"
                          value={link.description}
                          onChange={(e) =>
                            handleChange(index, 'description', e.target.value)
                          }
                          onBlur={() => handleBlur(index)}
                        />
                        {relatedLinkErrors[index]?.description && (
                          <p className="mt-1 text-xs text-danger">
                            {relatedLinkErrors[index].description}
                          </p>
                        )}
                      </Label>

                      {/* <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleRelatedLinkImageUpload(e, link.id!)}
                    /> */}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={handleAddLink}
                className="mt-4"
              >
                + Add New Link
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Other */}
      <div className="mb-20 py-6 md:mb-32">
        <Label className="mb-8 flex cursor-pointer items-center justify-between">
          <span className="mr-2">Turn on pop up for wabi posts</span>
          <Switch
            checked={isShowPopup}
            onCheckedChange={() => setIsShowPopup(!isShowPopup)}
          />
        </Label>
        <Label className="mb-8 flex cursor-pointer items-center justify-between">
          <span className="mr-2">Display section names</span>
          <Switch
            checked={isDisplaySectionName}
            onCheckedChange={() =>
              setIsDisplaySectionName(!isDisplaySectionName)
            }
          />
        </Label>
        <Label className="mb-8 flex cursor-pointer items-center justify-between">
          <span className="mr-2">Allow section filter</span>
          <Switch
            checked={isAllowSectionFilter}
            onCheckedChange={() =>
              setIsAllowSectionFilter(!isAllowSectionFilter)
            }
          />
        </Label>
      </div>
    </div>
  );
};
export default WidgetSettings;
