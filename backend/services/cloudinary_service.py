import cloudinary
import cloudinary.uploader
from config import Config
import base64
import io
from PIL import Image


ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}

CATEGORY_CONFIGS = {
    "property": {
        "max_file_size": 5 * 1024 * 1024,
        "min_width": 600,
        "min_height": 400,
        "max_width": 1200,
        "max_height": 800,
        "transformations": [
            {"width": 1200, "height": 800, "crop": "limit"},
            {"quality": "auto:good"},
            {"fetch_format": "auto"},
            {"dpr": "auto"},
        ],
    },
    "payment_proof": {
        "max_file_size": 2 * 1024 * 1024,
        "min_width": 300,
        "min_height": 200,
        "max_width": 600,
        "max_height": 400,
        "transformations": [
            {"width": 600, "height": 400, "crop": "limit"},
            {"quality": 80},
            {"fetch_format": "auto"},
        ],
    },
    "default": {
        "max_file_size": 5 * 1024 * 1024,
        "min_width": 200,
        "min_height": 200,
        "max_width": 1920,
        "max_height": 1080,
        "transformations": [
            {"quality": "auto:good"},
            {"fetch_format": "auto"},
        ],
    },
}


def init_cloudinary():
    """Initialize Cloudinary with credentials"""
    cloudinary.config(
        cloud_name=Config.CLOUDINARY_CLOUD_NAME,
        api_key=Config.CLOUDINARY_API_KEY,
        api_secret=Config.CLOUDINARY_API_SECRET,
        secure=True,
    )


def validate_image(file, category="default"):
    """
    Validate image file size, dimensions, and type before upload.

    Returns:
        dict with 'valid' (bool) and 'error' (str if invalid)
    """
    config = CATEGORY_CONFIGS.get(category, CATEGORY_CONFIGS["default"])

    try:
        file.seek(0, 2)
        file_size = file.tell()
        file.seek(0)

        if file_size > config["max_file_size"]:
            max_mb = config["max_file_size"] / (1024 * 1024)
            return {
                "valid": False,
                "error": f"File size exceeds {max_mb:.0f}MB limit for {category} images",
            }

        img = Image.open(file)
        width, height = img.size
        file.seek(0)

        if width < config["min_width"] or height < config["min_height"]:
            return {
                "valid": False,
                "error": f"Image too small. Minimum {config['min_width']}x{config['min_height']}px required",
            }

        if img.format:
            ext = img.format.lower()
            if ext not in ALLOWED_EXTENSIONS and ext not in {"jpeg"}:
                if ext == "jpeg":
                    pass
                elif ext not in ALLOWED_EXTENSIONS:
                    return {
                        "valid": False,
                        "error": f"Invalid format '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
                    }

        return {"valid": True, "width": width, "height": height, "size": file_size}
    except Exception as e:
        return {"valid": False, "error": f"Image validation failed: {str(e)}"}


def get_transformations(category="default"):
    """
    Get Cloudinary transformations for a given category.

    Returns appropriate transformations for property images, payment proofs, etc.
    """
    config = CATEGORY_CONFIGS.get(category, CATEGORY_CONFIGS["default"])
    return config["transformations"]


def upload_image(file, folder="properties", public_id=None, category="default"):
    """
    Upload an image to Cloudinary with category-optimized transformations.

    Args:
        file: File object or base64 string
        folder: Folder name in Cloudinary
        public_id: Optional custom public ID
        category: Image category ('property', 'payment_proof', or 'default')

    Returns:
        dict: Upload result with URL, public_id, and optimization info
    """
    init_cloudinary()

    try:
        transformations = get_transformations(category)

        upload_result = cloudinary.uploader.upload(
            file,
            folder=folder,
            public_id=public_id,
            transformation=transformations,
        )

        original_size = upload_result.get("bytes", 0)

        return {
            "success": True,
            "url": upload_result["secure_url"],
            "public_id": upload_result["public_id"],
            "width": upload_result.get("width"),
            "height": upload_result.get("height"),
            "format": upload_result.get("format"),
            "bytes": original_size,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def delete_image(public_id):
    """Delete an image from Cloudinary"""
    init_cloudinary()

    try:
        result = cloudinary.uploader.destroy(public_id)
        return {
            "success": result.get("result") == "ok",
            "result": result,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def upload_multiple_images(files, folder="properties", category="default"):
    """Upload multiple images to Cloudinary with category-based optimization"""
    results = []
    for file in files:
        result = upload_image(file, folder, category=category)
        results.append(result)
    return results


def get_optimization_report(upload_results, original_sizes=None):
    """
    Generate an optimization report for uploaded images.

    Args:
        upload_results: List of upload result dicts
        original_sizes: Optional dict mapping public_ids to original file sizes

    Returns:
        dict: Report containing file size stats, dimensions, and estimated savings
    """
    if not upload_results:
        return {"total_images": 0, "total_size": 0, "average_size": 0}

    successful = [r for r in upload_results if r.get("success")]
    total_size = sum(r.get("bytes", 0) for r in successful)

    report = {
        "total_images": len(successful),
        "total_size_bytes": total_size,
        "total_size_kb": round(total_size / 1024, 2),
        "average_size_bytes": round(total_size / len(successful)) if successful else 0,
        "average_size_kb": round(total_size / len(successful) / 1024, 2) if successful else 0,
        "formats": {},
    }

    for r in successful:
        fmt = r.get("format", "unknown")
        report["formats"][fmt] = report["formats"].get(fmt, 0) + 1

    if original_sizes:
        total_original = sum(original_sizes.values())
        total_optimized = sum(r.get("bytes", 0) for r in successful if r.get("public_id") in original_sizes)
        if total_original > 0:
            savings_pct = round((1 - total_optimized / total_original) * 100, 2)
            report["estimated_savings_percent"] = savings_pct
            report["estimated_savings_bytes"] = total_original - total_optimized

    return report
