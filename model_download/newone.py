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
    print("⚠️  browser_cookie3 not installed. Run: pip install browser_cookie3")

def fix_malformed_url(url):
    """Fix URLs that are missing hyphens before model ID"""
    # Pattern: word directly followed by 32-char hex (missing hyphen)
    # Example: infusion-pump678e23... should be infusion-pump-678e23...
    pattern = r'/3d-models/([a-zA-Z\-]+)([a-f0-9]{32})$'
    
    match = re.search(pattern, url)
    if match:
        name_part = match.group(1)
        id_part = match.group(2)
        # Add missing hyphen
        fixed_url = url.replace(f'{name_part}{id_part}', f'{name_part}-{id_part}')
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

def download_sketchfab_model(url, output_dir='downloads', session=None, delay=2):
    """Download a Sketchfab model"""
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Fix malformed URL
    original_url = url
    url = fix_malformed_url(url)
    if url != original_url:
        print(f"🔧 Fixed URL: {url}")
    
    model_id = get_model_id(url)
    if not model_id:
        print(f"❌ Could not extract model ID from URL: {url}")
        return False
    
    print(f"📦 Model ID: {model_id}")
    
    if session is None:
        session = requests.Session()
    
    api_url = f"https://sketchfab.com/i/models/{model_id}"
    
    try:
        response = session.get(api_url)
        response.raise_for_status()
        model_data = response.json()
        
        model_name = model_data.get('name', 'Unknown')
        print(f"📝 Name: {model_name}")
        
        # Get download endpoint
        download_api = f"https://sketchfab.com/i/models/{model_id}/download"
        time.sleep(delay)
        
        download_response = session.get(download_api)
        
        if download_response.status_code == 401:
            print(f"🔒 AUTH REQUIRED - Login to Sketchfab in your browser first!")
            return False
        
        if download_response.status_code == 403:
            print(f"🚫 FORBIDDEN - Downloads disabled by owner")
            return False
        
        download_response.raise_for_status()
        download_data = download_response.json()
        
        available_formats = list(download_data.keys())
        if not available_formats:
            print(f"❌ No formats available")
            return False
            
        print(f"📋 Available: {', '.join([f.upper() for f in available_formats])}")
        
        download_url, file_extension, selected_format = select_best_format(download_data)
        
        if not download_url:
            print(f"❌ No suitable format")
            return False
        
        print(f"🎯 Using: {selected_format}")
        print(f"⬇️  Downloading...")
        
        file_response = session.get(download_url, stream=True)
        file_response.raise_for_status()
        
        safe_name = re.sub(r'[^\w\s-]', '', model_name)[:50]
        filename = f"{safe_name}_{model_id}_{selected_format}.{file_extension}"
        filepath = os.path.join(output_dir, filename)
        
        total_size = int(file_response.headers.get('content-length', 0))
        
        with open(filepath, 'wb') as f:
            downloaded = 0
            for chunk in file_response.iter_content(chunk_size=8192):
                f.write(chunk)
                downloaded += len(chunk)
                if total_size > 0:
                    percent = (downloaded / total_size) * 100
                    print(f"\r   Progress: {percent:.1f}%", end='', flush=True)
        
        file_size_mb = os.path.getsize(filepath) / (1024 * 1024)
        print(f"\n✅ SUCCESS: {filename} ({file_size_mb:.2f} MB)")
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

# Failed URLs from your output
failed_urls = [
    "https://sketchfab.com/3d-models/anesthesia-machine-c6aa260bc9f544108eb2761f321ca86b",
    "https://sketchfab.com/3d-models/operating-table-e3a4512227d34b098e2ef0d11c8a80fd",
    "https://sketchfab.com/3d-models/operating-table-high-poly-dddfd66649b74288a4e538b19931586b",
    "https://sketchfab.com/3d-models/magill-forceps-28825c7414c24c959a6130faecfe607f",
    "https://sketchfab.com/3d-models/diathermy-machine-024e894d52754082bdb3a2b96116d0f3",
    "https://sketchfab.com/3d-models/surgical-light-53a5881441f94e4d8c7b6464d6f13c72",
    "https://sketchfab.com/3d-models/surgical-instruments-collection-46f5799ca36240efae3abec6e61d4c8a",
    "https://sketchfab.com/3d-models/surgical-instrument-table-collection-a1fcfeab1ad646638089655e8b6f0e2b",
    "https://sketchfab.com/3d-models/ultrasound-machine-0d4593f431f94de9a94815ec2c7715e9",
    "https://sketchfab.com/3d-models/infusion-pump678e23f86b4a464b8d3ae88f2ab53124",  # MALFORMED
    "https://sketchfab.com/3d-models/pump-syringe-1970a597a61c4053bf48a27882ac34ba",
    "https://sketchfab.com/3d-models/iv-pole-stand-49aaeb9d857e4390a09d70b2c871fe3a",
    "https://sketchfab.com/3d-models/piping-system-oxygen-outlet-testb03e63618e17491b995c65b1e5d5dbec",  # MALFORMED
    "https://sketchfab.com/3d-models/patient-monitoraf304e6de7da41b6a5903a8cd20e2f0f",  # MALFORMED
    "https://sketchfab.com/3d-models/medical-equipment477c49ea929b4b7681211dea81fcf99d",  # MALFORMED
    "https://sketchfab.com/3d-models/anesthesia-machine67841aa7eed745b8b438d5a22b560900",  # MALFORMED
    "https://sketchfab.com/3d-models/ecg-machine-a91c89c8da684b12a3ece16cbcd98bc4",
    "https://sketchfab.com/3d-models/defibrillator-8c1b312974244f3ba8ab53d8d1386358",
    "https://sketchfab.com/3d-models/dialysis-machine07887b8cb4e540f8a5711170fb72ade8",  # MALFORMED
    "https://sketchfab.com/3d-models/ventilador-synovent-e5-uci91f853ae66324f919997871651e20096",  # MALFORMED
    "https://sketchfab.com/3d-models/siemens-x300pe-ultrasonic-medical-device8d49d06c4f10415a8f6e74db274584e2",  # MALFORMED
    "https://sketchfab.com/3d-models/hospital-bed-d9216bfa9b6d49a89012f7d2a9f6395f",
    "https://sketchfab.com/3d-models/crash-cart-hamper-board0ad682af8d1d4e37ad96167b57e6bde2",  # MALFORMED
    "https://sketchfab.com/3d-models/overbed-table07a7890ce89c40999769bc03341bb3dd",  # MALFORMED
    "https://sketchfab.com/3d-models/locker-c558bded063444af82242f9cd8a19396",
    "https://sketchfab.com/3d-models/hand-sanitizer-station1dfeea12bde64e03a88e50789330fa9b",  # MALFORMED
    "https://sketchfab.com/3d-models/hospital-trash-can-low-poly8456ea120c264f279377ab62557d4707",  # MALFORMED
]

if __name__ == "__main__":
    OUTPUT_DIR = "sketchfab_models"
    BROWSER = "chrome"  # or 'firefox', 'edge', 'brave'
    DELAY = 2
    
    print("="*70)
    print("RETRY FAILED DOWNLOADS")
    print("="*70)
    print(f"Total URLs to retry: {len(failed_urls)}\n")
    
    # Setup session with cookies
    session = requests.Session()
    
    if HAS_COOKIE_LIB:
        print(f"🍪 Loading cookies from {BROWSER}...")
        cookies = get_sketchfab_cookies(BROWSER)
        if cookies:
            session.cookies = cookies
            print(f"✅ Cookies loaded\n")
        else:
            print(f"⚠️  No cookies - you must be logged into Sketchfab!\n")
    else:
        print("❌ Install browser_cookie3: pip install browser_cookie3\n")
    
    successful = 0
    failed = 0
    
    for i, url in enumerate(failed_urls, 1):
        print(f"\n{'='*70}")
        print(f"[{i}/{len(failed_urls)}] {url}")
        print(f"{'='*70}")
        
        if download_sketchfab_model(url, OUTPUT_DIR, session, DELAY):
            successful += 1
        else:
            failed += 1
        
        if i < len(failed_urls):
            time.sleep(DELAY)
    
    print(f"\n{'='*70}")
    print(f"📊 RETRY SUMMARY")
    print(f"{'='*70}")
    print(f"✅ Successful: {successful}")
    print(f"❌ Failed: {failed}")
    print(f"📁 Saved to: {os.path.abspath(OUTPUT_DIR)}")