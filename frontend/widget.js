(function () {
  const scriptId = 'ai-booking-widget';
  if (document.getElementById(scriptId)) return;

  // Create floating Book Now button
  const btn = document.createElement('button');
  btn.id = scriptId;
  btn.innerText = '📞 Book Now';
  btn.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #2563eb;
    color: white;
    border: none;
    padding: 14px 24px;
    border-radius: 50px;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    transition: transform 0.2s, box-shadow 0.2s;
  `;
  btn.onmouseenter = () => btn.style.transform = 'scale(1.05)';
  btn.onmouseleave = () => btn.style.transform = 'scale(1)';
  btn.onclick = openModal;

  document.body.appendChild(btn);

  function openModal() {
    const modal = document.createElement('div');
    modal.innerHTML = `
      <div style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center;">
        <div style="background:white;border-radius:16px;padding:32px;width:90%;max-width:400px;text-align:center;">
          <h3 style="margin:0 0 24px;font-family:'Inter';">How would you like to book?</h3>
          <button onclick="window.openAiChat()" style="display:block;width:100%;padding:16px;margin-bottom:12px;background:#3b82f6;color:white;border:none;border-radius:12px;cursor:pointer;font-weight:600;">💬 Chat to Book</button>
          <button onclick="window.startAiCall()" style="display:block;width:100%;padding:16px;background:#10b981;color:white;border:none;border-radius:12px;cursor:pointer;font-weight:600;">🎙️ Talk to AI</button>
          <button onclick="this.parentElement.parentElement.remove()" style="margin-top:24px;color:#6b7280;cursor:pointer;">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    window.openAiChat = () => {
      loadWidget('chat');
      modal.remove();
    };

    window.startAiCall = () => {
      loadWidget('voice');
      modal.remove();
    };
  }

  function loadWidget(mode) {
    // REPLACE "yourdomain.com" WITH YOUR VERCEL URL LATER
    const iframe = document.createElement('iframe');
   iframe.src = `https://ai-booking-agent-api.onrender.com/embed?mode=${mode}&businessId=${getBusinessId()}`;
    iframe.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 80%;
      max-width: 400px;
      border: none;
      border-top-left-radius: 24px;
      z-index: 9999;
      box-shadow: -4px -4px 24px rgba(0,0,0,0.1);
    `;
    document.body.appendChild(iframe);
  }

  function getBusinessId() {
    const scripts = document.querySelectorAll('script');
    for (let s of scripts) {
      if (s.src.includes('widget.js')) {
        return s.getAttribute('data-business-id') || 'default';
      }
    }
    return 'default';
  }
})();