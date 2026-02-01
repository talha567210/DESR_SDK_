# Build and Installation Guide

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## PowerShell Script Execution Issue

If you encounter the error:
```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled
```

**Solution: Enable PowerShell Scripts**

1. Open PowerShell as **Administrator**
2. Run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Confirm with `Y` when prompted

## Installation Steps

```bash
# Navigate to project directory
cd C:\Users\user\OneDrive\Desktop\desr

# Install dependencies
npm install

# Build the SDK
npm run build

# (Optional) Watch for changes during development
npm run watch

# (Optional) Serve examples locally
npm run serve
# Then open http://localhost:8080/examples/basic-integration.html
```

## Build Output

After building, you'll find:
- `dist/desr.js` - Full SDK bundle with source maps
- `dist/desr.min.js` - Minified production version

## Testing

1. Open `examples/basic-integration.html` in a browser
2. Allow camera access when prompted
3. Verify 3D models load and display
4. Test navigation arrows
5. Test order button functionality

## Publishing to NPM (Optional)

```bash
# Login to npm
npm login

# Publish package
npm publish
```

## Manual Build (Without npm)

If you cannot use npm, you can manually include the source files:

```html
<script type="module">
  import DesrSDK from './src/index.js';
  const desr = new DesrSDK({ /* config */ });
  desr.init();
</script>
```

Note: This requires a module-capable browser and won't bundle dependencies.
