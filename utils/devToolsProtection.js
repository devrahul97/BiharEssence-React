// DevTools Protection - Only active in production, not on localhost
const isProduction = () => {
  return (
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1" &&
    !window.location.hostname.includes("local")
  );
};

// Detect if DevTools is open
const detectDevTools = () => {
  const threshold = 160;
  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
  
  if (widthThreshold || heightThreshold) {
    return true;
  }
  return false;
};

// Handle DevTools detection
let devToolsOpen = false;
const handleDevTools = () => {
  if (detectDevTools() && !devToolsOpen) {
    devToolsOpen = true;
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 20px;
      ">
        <div style="
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 20px;
          max-width: 500px;
        ">
          <h1 style="font-size: 48px; margin-bottom: 20px;">⚠️</h1>
          <h2 style="font-size: 24px; margin-bottom: 15px;">Developer Tools Detected</h2>
          <p style="font-size: 16px; margin-bottom: 20px;">
            For security reasons, this application cannot run with developer tools open.
          </p>
          <p style="font-size: 14px; opacity: 0.9;">
            Please close DevTools and refresh the page to continue.
          </p>
        </div>
      </div>
    `;
  }
};

// Disable right-click context menu
const disableRightClick = (e) => {
  e.preventDefault();
  return false;
};

// Disable common DevTools shortcuts
const disableShortcuts = (e) => {
  // F12
  if (e.keyCode === 123) {
    e.preventDefault();
    return false;
  }
  
  // Ctrl+Shift+I (Inspect)
  if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
    e.preventDefault();
    return false;
  }
  
  // Ctrl+Shift+J (Console)
  if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
    e.preventDefault();
    return false;
  }
  
  // Ctrl+U (View Source)
  if (e.ctrlKey && e.keyCode === 85) {
    e.preventDefault();
    return false;
  }
  
  // Ctrl+Shift+C (Inspect Element)
  if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
    e.preventDefault();
    return false;
  }
};

// Initialize protection (only in production)
export const initDevToolsProtection = () => {
  if (!isProduction()) {
    console.log("🔓 DevTools protection disabled (localhost/development mode)");
    return;
  }

  console.log("🔒 DevTools protection enabled (production mode)");

  // Disable right-click
  document.addEventListener("contextmenu", disableRightClick);

  // Disable keyboard shortcuts
  document.addEventListener("keydown", disableShortcuts);

  // Check for DevTools periodically
  setInterval(handleDevTools, 1000);

  // Clear console periodically (optional)
  setInterval(() => {
    console.clear();
  }, 2000);

  // Override console methods in production
  const noop = () => {};
  console.log = noop;
  console.warn = noop;
  console.error = noop;
  console.debug = noop;
  console.info = noop;
};

// Cleanup function (if needed)
export const removeDevToolsProtection = () => {
  document.removeEventListener("contextmenu", disableRightClick);
  document.removeEventListener("keydown", disableShortcuts);
};
