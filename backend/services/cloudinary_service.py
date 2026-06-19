import cloudinary
import cloudinary.uploader
from config import Config
import base64
import io
from PIL import Image

def init_cloudinary():
    """Initialize Cloudinary with credentials"""
    cloudinary.config(
        cloud_name=Config.CLOUDINARY_CLOUD_NAME,
        api_key=Config.CLOUDINARY_API_KEY,
        api_secret=Config.CLOUDINARY_API_SECRET,
        secure=True
    )

def upload_image(file, folder="properties", public_id=None):
    """
    Upload an image to Cloudinary
    
    Args:
        file: File object or base64 string
        folder: Folder name in Cloudinary
        public_id: Optional custom public ID
    
    Returns:
        dict: Upload result with URL and public_id
    """
    init_cloudinary()
    
    try:
        # If file is base64 string
        if isinstance(file, str) and file.startswith('data:image'):
            # Convert base64 to file-like object if needed
            upload_result = cloudinary.uploader.upload(
                file,
                folder=folder,
                public_id=public_id,
                transformation=[
                    {'quality': 'auto:best'},
                    {'fetch_format': 'auto'}
                ]
            )
        else:
            # If file is a file object
            upload_result = cloudinary.uploader.upload(
                file,
                folder=folder,
                public_id=public_id,
                transformation=[
                    {'quality': 'auto:best'},
                    {'fetch_format': 'auto'}
                ]
            )
        
        return {
            'success': True,
            'url': upload_result['secure_url'],
            'public_id': upload_result['public_id'],
            'width': upload_result.get('width'),
            'height': upload_result.get('height'),
            'format': upload_result.get('format'),
            'bytes': upload_result.get('bytes')
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def delete_image(public_id):
    """Delete an image from Cloudinary"""
    init_cloudinary()
    
    try:
        result = cloudinary.uploader.destroy(public_id)
        return {
            'success': result.get('result') == 'ok',
            'result': result
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def upload_multiple_images(files, folder="properties"):
    """Upload multiple images to Cloudinary"""
    results = []
    for file in files:
        result = upload_image(file, folder)
        results.append(result)
    return results