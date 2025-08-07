import React, { useEffect, useState } from 'react';
import { Avatar } from '@mui/material';
import NextImage from 'next/image';
import { getRelativeLuminance } from '@/utils/common';

interface ProfileAvatarProps {
  profilePicUrl?: string;
  firstName: string;
  lastName: string;
  color?: string;
  width?: number;
  height?: number;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  profilePicUrl,
  firstName,
  lastName,
  color,
  width = 56,
  height = 56
}) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  const checkImageExists = (url: string) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
    });
  };

  useEffect(() => {
    if (profilePicUrl) {
      const fullUrl = `${process.env.NEXT_PUBLIC_IMG_URL}${profilePicUrl}`;
      checkImageExists(fullUrl).then((exists) => {
        if (exists) {
          setImgSrc(fullUrl);
        } else {
          setImgSrc(null);
        }
      });
    } else {
      setImgSrc(null);
    }
  }, [profilePicUrl]);

  const firstInitial =
    typeof firstName === 'string' && firstName.length > 0
      ? firstName.charAt(0)
      : '';

  const lastInitial =
    typeof lastName === 'string' && lastName.length > 0
      ? lastName.charAt(0)
      : '';

  return (
    <Avatar
      style={{
        background: color,
        width: width,
        height: height,
        fontWeight: 'bold',
        color: getRelativeLuminance(color)
      }}
    >
      {imgSrc ? (
        <NextImage
          width={width}
          height={height}
          src={imgSrc}
          alt={`${firstInitial} ${lastInitial}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <div className="text-sm">
          {firstInitial?.charAt(0)}
          {lastInitial?.charAt(0)}
        </div>
      )}
    </Avatar>
  );
};

export default ProfileAvatar;
