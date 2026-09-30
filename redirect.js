
  (async function(){try{
      const script = document.currentScript;
      const internationalDomain = script.dataset.domain;
      const countryCode = script.dataset.country;
      const isMapped = script.dataset.mapped === "1";

      // =========================================
      // POPUP CONFIGURATION
      // =========================================

      const shouldShowPopup = script.dataset.popup === "1";

      const popupTitle = script.dataset.popupTitle || "Visit our local store?";

      const popupMessage =
          script.dataset.popupMessage ||
          "We noticed that you're visiting from a different market. Would you like to continue to our local store?";

      const popupConfirm =
          script.dataset.popupConfirm ||
          "Continue";

      const popupCancel =
          script.dataset.popupCancel ||
          "Stay here";

      // =========================================
      // POPUP COLORS
      // =========================================

      const popupBg =
          script.dataset.popupBg ||
          "#ffffff";

      const popupText =
          script.dataset.popupText ||
          "#111111";

      const popupMessageColor =
          script.dataset.popupMessageColor ||
          "#555555";

      const popupOverlay =
          script.dataset.popupOverlay ||
          "rgba(0,0,0,0.55)";

      const popupConfirmBg =
          script.dataset.popupConfirmBg ||
          "#222222";

      const popupConfirmText =
          script.dataset.popupConfirmText ||
          "#ffffff";

      const popupCancelBg =
          script.dataset.popupCancelBg ||
          "#f2f2f2";

      const popupCancelText =
          script.dataset.popupCancelText ||
          "#222222";

      const popupCancelBorder =
          script.dataset.popupCancelBorder ||
          "#dddddd";

      const popupCloseText =
          script.dataset.popupCloseText ||
          "#666666";

      const popupCloseHover =
          script.dataset.popupCloseHover ||
          "#111111";

    if(!internationalDomain||!countryCode)return;
    
    if (/chrome-lighthouse/i.test(navigator.userAgent)) return;
    if (location.search.includes("pagespeed-test")) return;
    const ua=navigator.userAgent.toLowerCase();
    const BOT_UA_PATTERNS=[
    "googlebot","google-inspectiontool","googleweblight","google-extended",
    "bingbot","msnbot","bingpreview",
    "yandexbot","yandeximages","yandexvideo","yandexmetrika",
    "baiduspider","baidumobi","duckduckbot","duckduckgo-favicons-bot",
    "slurp","teoma","exabot","ia_archiver","archive.org_bot",
    "sogou","seznambot","ahrefsbot","semrushbot","mj12bot",
    "dotbot","rogerbot","petalbot","applebot","coccocbot",
    "facebookexternalhit","facebookcatalog","twitterbot","linkedinbot",
    "pinterest","whatsapp","telegrambot","slackbot","slack-imgproxy",
    "discordbot","vkshare","line-poker","outbrain","quora link preview",
    "tumblr","embedly","bot","crawl","spider","fetch","scan",
    "headless","phantom","selenium","puppeteer","playwright",
    "wget","curl","python-requests","axios","go-http-client",
    "java/","libwww","lwp-","okhttp"
    ];

    if(BOT_UA_PATTERNS.some(p=>ua.includes(p)))return;

    const isSecondaryBot=
    navigator.webdriver===true||
    !navigator.languages||
    navigator.languages.length===0||
    !window.screen||
    window.screen.width===0||
    window.screen.height===0||
    !window.history||
    (navigator.plugins!==undefined&&navigator.plugins.length===0&&!ua.includes("mobile"));

    if(isSecondaryBot)return;

    // COUNTRY DETECTION
    const response=await fetch("/browsing_context_suggestions.json");
    if(!response.ok)return;

    const data=await response.json();
    const visitorCountry=data?.detected_values?.country?.handle;

    console.log("Visitor Country:",visitorCountry);

    if(visitorCountry===countryCode)return;

    // BUILD REDIRECT URL
    const currentUrl=new URL(window.location.href);
    let redirectUrl;

    if(isMapped){
    const params=new URLSearchParams();
    params.set("src_url",currentUrl.pathname);

    if(currentUrl.pathname.startsWith("/products/")){
    params.set("src_type","product");
    }else if(currentUrl.pathname.startsWith("/collections/")){
    params.set("src_type","collection");
    }

    currentUrl.searchParams.forEach((value,key)=>params.set(key,value));
    redirectUrl=`https://${internationalDomain}/?${params.toString()}`;
    }else{
    redirectUrl=`https://${internationalDomain}${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
    }

    console.log("Redirect URL:",redirectUrl);

    // DIRECT REDIRECT
    if(!shouldShowPopup){
    window.location.replace(redirectUrl);
    return;
    }

    // SHOW POPUP
    showRedirectModal({
    title:popupTitle,
    message:popupMessage,
    confirmText:popupConfirm,
    cancelText:popupCancel,
    popupBg,
    popupText,
    popupMessageColor,
    popupOverlay,
    popupConfirmBg,
    popupConfirmText,
    popupCancelBg,
    popupCancelText,
    popupCancelBorder,
    popupCloseText,
    popupCloseHover,
    onConfirm:()=>window.location.replace(redirectUrl),
    onCancel:()=>console.log("User cancelled redirect.")
    });

    }catch(err){
    console.error("Redirect Error:",err);
    }


    // CUSTOM MODAL
    function showRedirectModal({
    title,message,confirmText,cancelText,
    popupBg,popupText,popupMessageColor,popupOverlay,
    popupConfirmBg,popupConfirmText,
    popupCancelBg,popupCancelText,popupCancelBorder,
    popupCloseText,popupCloseHover,
    onConfirm,onCancel
    }){

    if(document.getElementById("redirect-confirm-modal"))return;

    const style=document.createElement("style");
    style.id="redirect-confirm-modal-style";

    style.textContent=`
    #redirect-confirm-modal{
    position:fixed;inset:0;z-index:2147483647;
    display:flex;align-items:center;justify-content:center;
    padding:20px;box-sizing:border-box;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif
    }
    #redirect-confirm-modal .redirect-modal-overlay{
    position:absolute;inset:0;background:${popupOverlay};backdrop-filter:blur(3px)
    }
    #redirect-confirm-modal .redirect-modal{
    position:relative;z-index:2;width:100%;max-width:460px;
    background:${popupBg};border-radius:14px;padding:30px;
    box-sizing:border-box;box-shadow:0 20px 60px rgba(0,0,0,.25);
    animation:redirectModalIn .2s ease-out
    }
    #redirect-confirm-modal .redirect-modal-close{
    position:absolute;top:12px;right:14px;width:34px;height:34px;
    border:0;background:transparent;font-size:25px;line-height:1;
    cursor:pointer;color:${popupCloseText};padding:0
    }
    #redirect-confirm-modal .redirect-modal-close:hover{color:${popupCloseHover}}
    #redirect-confirm-modal .redirect-modal-title{
    margin:0 35px 12px 0;font-size:22px;line-height:1.3;
    font-weight:600;color:${popupText}
    }
    #redirect-confirm-modal .redirect-modal-message{
    margin:0 0 25px;font-size:15px;line-height:1.6;color:${popupMessageColor}
    }
    #redirect-confirm-modal .redirect-modal-actions{
    display:flex;gap:10px;justify-content:flex-end
    }
    #redirect-confirm-modal .redirect-modal-button{
    min-height:44px;padding:10px 20px;border-radius:7px;
    border:1px solid transparent;font-size:14px;font-weight:500;
    cursor:pointer;transition:opacity .15s ease,background .15s ease
    }
    #redirect-confirm-modal .redirect-modal-button:hover{opacity:.85}
    #redirect-confirm-modal .redirect-modal-cancel{
    background:${popupCancelBg};color:${popupCancelText};
    border-color:${popupCancelBorder}
    }
    #redirect-confirm-modal .redirect-modal-confirm{
    background:${popupConfirmBg};color:${popupConfirmText}
    }
    @keyframes redirectModalIn{
    from{opacity:0;transform:translateY(10px) scale(.98)}
    to{opacity:1;transform:translateY(0) scale(1)}
    }
    @media(max-width:480px){
    #redirect-confirm-modal{padding:15px}
    #redirect-confirm-modal .redirect-modal{padding:25px 20px;border-radius:12px}
    #redirect-confirm-modal .redirect-modal-title{font-size:20px}
    #redirect-confirm-modal .redirect-modal-actions{flex-direction:column-reverse}
    #redirect-confirm-modal .redirect-modal-button{width:100%}
    }
    `;

    document.head.appendChild(style);

    const modal=document.createElement("div");
    modal.id="redirect-confirm-modal";
    modal.setAttribute("role","dialog");
    modal.setAttribute("aria-modal","true");
    modal.innerHTML=`
    <div class="redirect-modal-overlay"></div>
    <div class="redirect-modal">
    <button type="button" class="redirect-modal-close" aria-label="Close">&times;</button>
    <h2 class="redirect-modal-title">${escapeHtml(title)}</h2>
    <p class="redirect-modal-message">${escapeHtml(message)}</p>
    <div class="redirect-modal-actions">
    <button type="button" class="redirect-modal-button redirect-modal-cancel">${escapeHtml(cancelText)}</button>
    <button type="button" class="redirect-modal-button redirect-modal-confirm">${escapeHtml(confirmText)}</button>
    </div>
    </div>
    `;

    document.body.appendChild(modal);

    const closeButton=modal.querySelector(".redirect-modal-close");
    const cancelButton=modal.querySelector(".redirect-modal-cancel");
    const confirmButton=modal.querySelector(".redirect-modal-confirm");
    const overlay=modal.querySelector(".redirect-modal-overlay");

    function closeModal(){
    modal.remove();
    const styleElement=document.getElementById("redirect-confirm-modal-style");
    if(styleElement)styleElement.remove();
    if(typeof onCancel==="function")onCancel();
    }

    closeButton.addEventListener("click",closeModal);
    cancelButton.addEventListener("click",closeModal);
    confirmButton.addEventListener("click",onConfirm);
    overlay.addEventListener("click",closeModal);

    function handleEscape(event){
    if(event.key==="Escape"){
    closeModal();
    document.removeEventListener("keydown",handleEscape);
    }
    }

    document.addEventListener("keydown",handleEscape);

    setTimeout(()=>confirmButton.focus(),0);
    }

    function escapeHtml(value){
    const div=document.createElement("div");
    div.textContent=value;
    return div.innerHTML;
    }

    })();