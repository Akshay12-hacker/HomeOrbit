import { Platform } from 'react-native';
import API from '../apiClient';
import { withApiError } from '../apiError';

/**
 * Uploads an image to the server.
 * Endpoint: POST /Image/upload
 * Request Body: FormData with key "File"
 */
export const uploadImage = async (fileAsset) => {
  if (!fileAsset || !fileAsset.uri) {
    throw new Error('No image file provided for upload.');
  }

  try {
    const formData = new FormData();
    
    // Extract filename and type from URI if not provided
    const uri = fileAsset.uri;
    const filename = fileAsset.fileName || uri.split('/').pop() || `upload-${Date.now()}.png`;
    const match = /\.(\w+)$/.exec(filename);
    const type = fileAsset.mimeType || (match ? `image/${match[1]}` : 'image/png');

    const fileToUpload = {
      uri: uri,
      name: filename,
      type: type,
    };

    formData.append('File', fileToUpload);

    const response = await API.post('/Image/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // The API usually returns the URL or filename of the uploaded image
    return response.data?.url || response.data?.imageUrl || response.data?.fileName || response.data;
  } catch (error) {
    throw withApiError(error, 'Failed to upload image.');
  }
};
