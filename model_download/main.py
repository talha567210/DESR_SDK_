import requests
import json
import os
import re
import time

try:
    import browser_cookie3
    HAS_COOKIE_LIB = True
except ImportError:
    HAS_COOKIE_LIB = False

def extract_urls_from_file(filename):
    """Extract all Sketchfab URLs from a text file using regex"""
    
    if not os.path.exists(filename):
        print(f"File not found: {filename}")
        return []
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Regex pattern to match Sketchfab URLs
    pattern = r'https?://(?:www\.)?sketchfab\.com/(?:3d-models|models)/[a-zA-Z0-9\-]+'
    
    urls = re.findall(pattern, content)
    
    # Remove duplicates while preserving order
    seen = set()
    unique_urls = []
    for url in urls:
        if url not in seen:
            seen.add(url)
            unique_urls.append(url)
    
    return unique_urls

def fix_malformed_url(url):
    """Fix URLs that are missing hyphens before model ID"""
    # Pattern: word directly followed by 32-char hex (missing hyphen)
    pattern = r'/3d-models/([a-zA-Z\-]+)([a-f0-9]{32})$'
    
    match = re.search(pattern, url)
    if match:
        name_part = match.group(1)
        id_part = match.group(2)
        fixed_url = url.replace(f'{name_part}{id_part}', f'{name_part}-{id_part}')
        print(f"🔧 Fixed malformed URL")
        return fixed_url
    
    return url

def get_model_id(url):
    """Extract model ID from Sketchfab URL"""
    match = re.search(r'/models/([a-zA-Z0-9]+)', url)
    if match:
        return match.group(1)
    
    match = re.search(r'/3d-models/[^/]+-([a-zA-Z0-9]{32})', url)
    if match:
        return match.group(1)
    
    return None

def get_sketchfab_cookies(browser='chrome'):
    """Get Sketchfab cookies from browser"""
    if not HAS_COOKIE_LIB:
        return None
        
    try:
        if browser.lower() == 'chrome':
            cookies = browser_cookie3.chrome(domain_name='sketchfab.com')
        elif browser.lower() == 'firefox':
            cookies = browser_cookie3.firefox(domain_name='sketchfab.com')
        elif browser.lower() == 'edge':
            cookies = browser_cookie3.edge(domain_name='sketchfab.com')
        elif browser.lower() == 'brave':
            cookies = browser_cookie3.brave(domain_name='sketchfab.com')
        else:
            cookies = browser_cookie3.load(domain_name='sketchfab.com')
        
        return cookies
    except Exception as e:
        print(f"⚠️  Could not load cookies from {browser}: {e}")
        return None

def select_best_format(download_data):
    """Select the best available format with priority: FBX > OBJ > GLTF > others"""
    
    # Priority order
    format_priority = [
        ('fbx', 'fbx.zip'),
        ('obj', 'obj.zip'),
        ('gltf', 'gltf.zip'),
        ('usdz', 'usdz.zip'),
        ('source', 'source.zip')
    ]
    
    for format_key, file_extension in format_priority:
        if format_key in download_data:
            return download_data[format_key]['url'], file_extension, format_key.upper()
    
    return None, None, None

def download_sketchfab_model(url, output_dir='downloads', session=None, api_token=None, delay=2):
    """Download a Sketchfab model with format priority: FBX > OBJ > GLTF > others"""
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Fix malformed URLs
    url = fix_malformed_url(url)
    
    # Get model ID
    model_id = get_model_id(url)
    if not model_id:
        print(f"❌ Could not extract model ID from URL: {url}")
        return False
    
    print(f"📦 Processing Model ID: {model_id}")
    
    # Use session if provided, otherwise create new requests session
    if session is None:
        session = requests.Session()
    
    # Prepare headers with API token
    headers = {}
    if api_token:
        headers['Authorization'] = f'Token {api_token}'
    
    # Get model info from API
    api_url = f"https://sketchfab.com/i/models/{model_id}"
    
    try:
        response = session.get(api_url, headers=headers)
        response.raise_for_status()
        model_data = response.json()
        
        model_name = model_data.get('name', 'Unknown')
        print(f"📝 Model name: {model_name}")
        
        # Check if model is downloadable
        is_downloadable = model_data.get('isDownloadable', False)
        print(f"🔍 Downloadable flag: {is_downloadable}")
        
        # If not downloadable, skip (owner disabled downloads)
        if not is_downloadable:
            print(f"⚠️  Model owner has disabled downloads")
            return False
        
        # Get download link
        download_api = f"https://sketchfab.com/i/models/{model_id}/download"
        
        time.sleep(delay)  # Rate limiting
        
        download_response = session.get(download_api, headers=headers)
        
        # Check response
        if download_response.status_code == 401:
            print(f"🔒 Authentication required - API token may be invalid")
            return False
        
        if download_response.status_code == 403:
            print(f"🚫 Download forbidden - model owner has disabled downloads")
            return False
        
        if download_response.status_code == 404:
            print(f"❌ Download endpoint not found")
            return False
        
        download_response.raise_for_status()
        download_data = download_response.json()
        
        # Show available formats
        available_formats = list(download_data.keys())
        if not available_formats:
            print(f"❌ No download formats available for '{model_name}'")
            return False
            
        print(f"📋 Available formats: {', '.join([f.upper() for f in available_formats])}")
        
        # Select best format based on priority
        download_url, file_extension, selected_format = select_best_format(download_data)
        
        if not download_url:
            print(f"❌ No downloadable format found for model '{model_name}'")
            return False
        
        print(f"🎯 Selected format: {selected_format}")
        
        # Download the file
        print(f"⬇️  Downloading...")
        file_response = session.get(download_url, stream=True, headers=headers)
        file_response.raise_for_status()
        
        # Clean filename
        safe_name = re.sub(r'[^\w\s-]', '', model_name)[:50]
        filename = f"{safe_name}_{model_id}_{selected_format}.{file_extension}"
        filepath = os.path.join(output_dir, filename)
        
        # Get file size
        total_size = int(file_response.headers.get('content-length', 0))
        
        with open(filepath, 'wb') as f:
            downloaded = 0
            for chunk in file_response.iter_content(chunk_size=8192):
                f.write(chunk)
                downloaded += len(chunk)
                if total_size > 0:
                    percent = (downloaded / total_size) * 100
                    print(f"\r   Progress: {percent:.1f}% ({downloaded / (1024*1024):.1f} MB)", end='', flush=True)
        
        file_size_mb = os.path.getsize(filepath) / (1024 * 1024)
        print(f"\n✅ Successfully downloaded: {filename} ({file_size_mb:.2f} MB)")
        return True
        
    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP error {e.response.status_code} for {model_id}: {e}")
        return False
    except Exception as e:
        print(f"❌ Error downloading {model_id}: {e}")
        return False

def download_from_file(filename, output_dir='downloads', browser='chrome', api_token=None, delay=2):
    """Read URLs from file and download all models"""
    
    print(f"📄 Reading URLs from: {filename}")
    urls = extract_urls_from_file(filename)
    
    if not urls:
        print("❌ No Sketchfab URLs found in the file")
        return
    
    print(f"✅ Found {len(urls)} unique Sketchfab URL(s)")
    print(f"🎯 Format priority: FBX > OBJ > GLTF > USDZ > SOURCE\n")
    
    # Create session with cookies or API token
    session = requests.Session()
    
    if api_token:
        print(f"🔑 Using API token for authentication")
        session.headers['Authorization'] = f'Token {api_token}'
    else:
        if HAS_COOKIE_LIB:
            print(f"🍪 Attempting to load cookies from {browser}...")
            cookies = get_sketchfab_cookies(browser)
            if cookies:
                session.cookies = cookies
                print(f"✅ Cookies loaded successfully")
            else:
                print(f"⚠️  No cookies found")
        else:
            print(f"⚠️  browser_cookie3 not installed - install with: pip install browser_cookie3")
    
    print()
    
    successful = 0
    failed = 0
    disabled = 0
    
    for i, url in enumerate(urls, 1):
        print(f"\n{'='*70}")
        print(f"[{i}/{len(urls)}] {url}")
        print(f"{'='*70}")
        
        result = download_sketchfab_model(url.strip(), output_dir, session, api_token, delay)
        
        if result:
            successful += 1
        else:
            failed += 1
        
        # Add delay between downloads
        if i < len(urls):
            time.sleep(delay)
    
    # Summary
    print(f"\n{'='*70}")
    print(f"📊 DOWNLOAD SUMMARY")
    print(f"{'='*70}")
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed/Disabled: {failed}")
    print(f"📁 Files saved to: {os.path.abspath(output_dir)}")
    
    if successful > 0:
        print(f"\n💡 Tip: Extract .zip files to access the 3D models")
    
    if failed > 0:
        print(f"\n⚠️  Note: Some models may have downloads disabled by their owners")

# Example usage:
if __name__ == "__main__":
    # Configuration
    INPUT_FILE = "doc.txt"  # Your text file with URLs
    OUTPUT_DIR = "sketchfab_models"     # Where to save downloads
    BROWSER = "chrome"                   # chrome, firefox, edge, or brave
    API_TOKEN = "81b5c105e6e04b2ea08289e9eb15a372"  # Your API token
    DELAY = 2                           # Delay in seconds between downloads
    
    # Use API token
    download_from_file(
        filename=INPUT_FILE,
        output_dir=OUTPUT_DIR,
        api_token=API_TOKEN,
        delay=DELAY
    )