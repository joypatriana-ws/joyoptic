"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

// După NovaFitUpgrade (components/site/analytics-scripts.tsx) și docs/consent.
// JoyOptic nu are încă Analytics / Pixel: se pornesc doar când se setează ID-urile în env.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

const gaInject = GA_ID
  ? `var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${GA_ID}';document.head.appendChild(s);gtag('js',new Date());gtag('config','${GA_ID}');`
  : "";

const pixelInject = META_PIXEL_ID
  ? `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');try{var m=document.cookie.match(/(?:^|; )joyoptic_consent=([^;]+)/);var sc=m?JSON.parse(decodeURIComponent(m[1])):null;fbq('consent',sc&&sc.ad_storage==='granted'?'grant':'revoke');}catch(e){fbq('consent','revoke');}fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`
  : "";

// Tracking-ul pornește la prima interacțiune, niciodată pe timer; nu pe localhost.
const delayedTracking = `(function(){if(/^(localhost|127\\.0\\.0\\.1|\\[::1\\])$/.test(location.hostname))return;var done=false;function load(){if(done)return;done=true;${gaInject}${pixelInject}}['scroll','touchstart','mousedown','keydown','pointerdown'].forEach(function(ev){addEventListener(ev,load,{once:true,passive:true});});})();`;

/**
 * Google Consent Mode v2 (sincron, înaintea oricărui tag): până la clic nu se stochează nimic.
 * Sincron cu DEFAULT_CONSENT din lib/consent.ts. Vezi docs/consent/README.md.
 */
export default function AnalyticsScripts() {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
            gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',personalization_storage:'denied',security_storage:'granted',wait_for_update:500});
            try{var m=document.cookie.match(/(?:^|; )joyoptic_consent=([^;]+)/);if(m){var s=JSON.parse(decodeURIComponent(m[1]));if(s&&typeof s==='object')gtag('consent','update',s)}}catch(e){}
            gtag('set','url_passthrough',true);
          `,
        }}
      />
      {(GA_ID || META_PIXEL_ID) && (
        <Script id="joyoptic-tracking" strategy="afterInteractive">
          {delayedTracking}
        </Script>
      )}
    </>
  );
}
