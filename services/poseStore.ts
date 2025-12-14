
import { POSES } from '../constants';
import { Pose } from '../types';

const STORAGE_KEY_MEDIA = 'yogaflow_custom_media';
const STORAGE_KEY_NEW_POSES = 'yogaflow_custom_poses';

// Helper to format YouTube URLs to Embed format
export const formatYoutubeUrl = (url: string): string => {
  if (!url) return '';
  
  // Handle standard watch URLs: https://www.youtube.com/watch?v=VIDEO_ID
  if (url.includes('watch?v=')) {
    const videoId = url.split('watch?v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  // Handle share URLs: https://youtu.be/VIDEO_ID
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Already an embed or other URL, return as is (but ensure https)
  return url;
};

export const poseStore = {
  getAll: (): Pose[] => {
    try {
      // 1. Get Media Overrides
      const storedMedia = localStorage.getItem(STORAGE_KEY_MEDIA);
      const mediaOverrides = storedMedia ? JSON.parse(storedMedia) : {};
      
      // 2. Get User Added Poses
      const storedPoses = localStorage.getItem(STORAGE_KEY_NEW_POSES);
      const userPoses: Pose[] = storedPoses ? JSON.parse(storedPoses) : [];

      // 3. Merge Constants + User Poses
      const allPoses = [...POSES, ...userPoses];

      // 4. Apply Overrides
      return allPoses.map(pose => {
        // If there is an override for this pose ID, update the media
        if (mediaOverrides[pose.id]) {
          return {
            ...pose,
            media: {
              ...pose.media,
              videoEmbedUrl: mediaOverrides[pose.id]
            }
          };
        }
        return pose;
      });
    } catch (e) {
      console.error("Error loading custom poses", e);
      return POSES;
    }
  },

  addPose: (newPose: Pose) => {
    try {
        const storedPoses = localStorage.getItem(STORAGE_KEY_NEW_POSES);
        const userPoses: Pose[] = storedPoses ? JSON.parse(storedPoses) : [];
        
        // Ensure video URL is formatted
        newPose.media.videoEmbedUrl = formatYoutubeUrl(newPose.media.videoEmbedUrl);
        
        userPoses.push(newPose);
        localStorage.setItem(STORAGE_KEY_NEW_POSES, JSON.stringify(userPoses));
    } catch (e) {
        console.error("Error adding new pose", e);
        throw e;
    }
  },

  updateVideoUrl: (poseId: string, newUrl: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MEDIA);
      const overrides = stored ? JSON.parse(stored) : {};
      
      const formattedUrl = formatYoutubeUrl(newUrl);
      overrides[poseId] = formattedUrl;
      
      localStorage.setItem(STORAGE_KEY_MEDIA, JSON.stringify(overrides));
      return formattedUrl; // Return for UI update
    } catch (e) {
      console.error("Error saving custom pose", e);
      throw e;
    }
  },

  resetToDefault: (poseId: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MEDIA);
      if (!stored) return;
      
      const overrides = JSON.parse(stored);
      delete overrides[poseId];
      
      localStorage.setItem(STORAGE_KEY_MEDIA, JSON.stringify(overrides));
    } catch (e) {
      console.error("Error resetting pose", e);
    }
  }
};
