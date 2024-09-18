import { business } from "./../services/business/business";
const otp = (otp: number) => {
  return `<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><!--[if gte mso 15]><xml><o:officedocumentsettings><o:allowpng><o:pixelsperinch>96</o:pixelsperinch></o:officedocumentsettings></xml><![endif]--><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width,initial-scale=1"><title>*|MC:SUBJECT|*</title><style type="text/css">img{-ms-interpolation-mode:bicubic}table,td{mso-table-lspace:0;mso-table-rspace:0}.mceStandardButton,.mceStandardButton td,.mceStandardButton td a{mso-hide:all!important}a,blockquote,li,p,td{mso-line-height-rule:exactly}a,blockquote,body,li,p,table,td{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}@media only screen and (max-width:480px){a,blockquote,body,li,p,table,td{-webkit-text-size-adjust:none!important}}.mcnPreviewText{display:none!important}.bodyCell{margin:0 auto;padding:0;width:100%}.ExternalClass,.ExternalClass div,.ExternalClass font,.ExternalClass p,.ExternalClass span,.ExternalClass td{line-height:100%}.ReadMsgBody{width:100%}.ExternalClass{width:100%}a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important}body{height:100%;margin:0;padding:0;width:100%;background:#fff}p{margin:0;padding:0}table{border-collapse:collapse}a,p,td{word-break:break-word}h1,h2,h3,h4,h5,h6{display:block;margin:0;padding:0}a img,img{border:0;height:auto;outline:0;text-decoration:none}a[href^=sms],a[href^=tel]{color:inherit;cursor:default;text-decoration:none}li p{margin:0!important}@media only screen and (max-width:640px){.mceClusterLayout td{padding:4px!important}}@media only screen and (max-width:480px){body{width:100%!important;min-width:100%!important}}@media only screen and (max-width:480px){body.mobile-native{-webkit-user-select:none;user-select:none;transition:transform .2s ease-in;transform-origin:top center}}@media only screen and (max-width:480px){body.mobile-native.selection-allowed .ProseMirror,body.mobile-native.selection-allowed a{user-select:auto;-webkit-user-select:auto}}@media only screen and (max-width:480px){colgroup{display:none}}@media only screen and (max-width:480px){img{height:auto!important}}@media only screen and (max-width:480px){.mceWidthContainer{max-width:660px!important}}@media only screen and (max-width:480px){.mceColumn{display:block!important;width:100%!important}}@media only screen and (max-width:480px){.mceColumn-forceSpan{display:table-cell!important;width:auto!important}}@media only screen and (max-width:480px){.mceColumn-forceSpan .mceButton a{min-width:0!important}}@media only screen and (max-width:480px){.mceBlockContainer{padding-right:16px!important;padding-left:16px!important}}@media only screen and (max-width:480px){.mceTextBlockContainer{padding-right:16px!important;padding-left:16px!important}}@media only screen and (max-width:480px){.mceBlockContainerE2E{padding-right:0;padding-left:0}}@media only screen and (max-width:480px){.mceSpacing-24{padding-right:16px!important;padding-left:16px!important}}@media only screen and (max-width:480px){.mceImage,.mceLogo{width:100%!important;height:auto!important}}@media only screen and (max-width:480px){.mceFooterSection .mceText,.mceFooterSection .mceText p{font-size:16px!important;line-height:140%!important}}div[contenteditable=true]{outline:0}.ProseMirror .empty-node,.ProseMirror:empty{position:relative}.ProseMirror .empty-node::before,.ProseMirror:empty::before{position:absolute;left:0;right:0;color:rgba(0,0,0,.2);cursor:text}.ProseMirror .empty-node:hover::before,.ProseMirror:empty:hover::before{color:rgba(0,0,0,.3)}.ProseMirror h1.empty-node:only-child::before,.ProseMirror h2.empty-node:only-child::before,.ProseMirror h3.empty-node:only-child::before,.ProseMirror h4.empty-node:only-child::before{content:'Heading'}.ProseMirror p.empty-node:only-child::before,.ProseMirror:empty::before{content:'Start typing...'}a .ProseMirror p.empty-node::before,a .ProseMirror:empty::before{content:''}.ProseMirror,.mceText{white-space:pre-wrap}.mceImageBorder{display:inline-block}.mceImageBorder img{border:0!important}#bodyTable,body{background-color:#f4f4f4}.mceLabel,.mceText{font-family:"Helvetica Neue",Helvetica,Arial,Verdana,sans-serif}.mceLabel,.mceText{color:#000}.mceText h1{margin-bottom:0}.mceText p{margin-bottom:0}.mceText label{margin-bottom:0}.mceText input{margin-bottom:0}.mceSpacing-24 .mceInput+.mceErrorMessage{margin-top:-12px}.mceText h1{margin-bottom:0}.mceText p{margin-bottom:0}.mceText label{margin-bottom:0}.mceText input{margin-bottom:0}.mceSpacing-12 .mceInput+.mceErrorMessage{margin-top:-6px}.mceText h1{margin-bottom:0}.mceText p{margin-bottom:0}.mceText label{margin-bottom:0}.mceText input{margin-bottom:0}.mceSpacing-48 .mceInput+.mceErrorMessage{margin-top:-24px}.mceInput{background-color:transparent;border:2px solid #d0d0d0;width:60%;color:#4d4d4d;display:block}.mceInput[type=checkbox],.mceInput[type=radio]{float:left;margin-right:12px;display:inline;width:auto!important}.mceLabel>.mceInput{margin-bottom:0;margin-top:2px}.mceLabel{display:block}.mceText p{color:#000;font-family:"Helvetica Neue",Helvetica,Arial,Verdana,sans-serif;font-size:16px;font-weight:400;line-height:1.5;text-align:center;direction:ltr}.mceText h1{color:#000;font-family:"Helvetica Neue",Helvetica,Arial,Verdana,sans-serif;font-size:31px;font-weight:700;line-height:1.5;text-align:center;direction:ltr}.mceText a{color:#000;font-style:normal;font-weight:400;text-decoration:underline;direction:ltr}@media only screen and (max-width:480px){.mceText p{font-size:16px!important;line-height:1.5!important}}@media only screen and (max-width:480px){.mceText h1{font-size:31px!important;line-height:1.5!important}}@media only screen and (max-width:480px){.mceBlockContainer{padding-left:16px!important;padding-right:16px!important}}#dataBlockId-9 h1,#dataBlockId-9 h2,#dataBlockId-9 h3,#dataBlockId-9 h4,#dataBlockId-9 p,#dataBlockId-9 ul{text-align:center}@media only screen and (max-width:480px){.mobileClass-33{padding-left:12!important;padding-top:0!important;padding-right:12!important}}@media only screen and (max-width:480px){.mobileClass-33{padding-left:12!important;padding-top:0!important;padding-right:12!important}}@media only screen and (max-width:480px){.mobileClass-33{padding-left:12!important;padding-top:0!important;padding-right:12!important}}</style><script>!function(){try{var o=decodeURIComponent("%0A%7B%0A%22ResourceTiming%22%3A%7B%0A%22comment%22%3A%20%22Clear%20RT%20Buffer%20on%20mPulse%20beacon%22%2C%0A%22clearOnBeacon%22%3A%20true%0A%7D%2C%0A%22AutoXHR%22%3A%7B%0A%22comment%22%3A%20%22Monitor%20XHRs%20requested%20using%20FETCH%22%2C%0A%22monitorFetch%22%3A%20true%2C%0A%22comment%22%3A%20%22Start%20Monitoring%20SPAs%20from%20Click%22%2C%0A%22spaStartFromClick%22%3A%20true%0A%7D%2C%0A%22PageParams%22%3A%7B%0A%22comment%22%3A%20%22Monitor%20all%20SPA%20XHRs%22%2C%0A%22spaXhr%22%3A%20%22all%22%0A%7D%0A%7D");if(0<o.length&&window.JSON&&"function"==typeof window.JSON.parse){var n=JSON.parse(o);void 0!==window.BOOMR_config?function o(n,r){if(n&&r)for(var e in r)r.hasOwnProperty(e)&&(void 0===n[e]?n[e]=r[e]:n[e].constructor===Object&&r[e].constructor===Object?o(n[e],r[e]):n[e]=r[e])}(window.BOOMR_config,n):window.BOOMR_config=n}}catch(o){window.console&&"function"==typeof window.console.error&&console.error("mPulse: Could not parse configuration",o)}}()</script><script>!function(o){var r="https://s.go-mpulse.net/boomerang/",c="addEventListener";o.BOOMR_config=o.BOOMR_config||{},o.BOOMR_config.PageParams=o.BOOMR_config.PageParams||{},o.BOOMR_config.PageParams.pci=!0,r="https://s2.go-mpulse.net/boomerang/",window.BOOMR_API_key="QAT5G-9HZLF-7EDMX-YMVCJ-QZJDA",function(){function a(a){o.BOOMR_onload=a&&a.timeStamp||(new Date).getTime()}if(!o.BOOMR||!o.BOOMR.version&&!o.BOOMR.snippetExecuted){o.BOOMR=o.BOOMR||{},o.BOOMR.snippetExecuted=!0;var e,t,n,i=document.createElement("iframe");o[c]?o[c]("load",a,!1):o.attachEvent&&o.attachEvent("onload",a),i.src="javascript:void(0)",i.title="",i.role="presentation",(i.frameElement||i).style.cssText="width:0;height:0;border:0;display:none;",(n=document.getElementsByTagName("script")[0]).parentNode.insertBefore(i,n);try{t=i.contentWindow.document}catch(a){e=document.domain,i.src="javascript:var d=document.open();d.domain='"+e+"';void(0);",t=i.contentWindow.document}t.open()._l=function(){var a=this.createElement("script");e&&(this.domain=e),a.id="boomr-if-as",a.src=r+"QAT5G-9HZLF-7EDMX-YMVCJ-QZJDA",BOOMR_lstart=(new Date).getTime(),this.body.appendChild(a)},t.write('<body onload="document._l();">'),t.close()}}(),0<"400".length&&o&&"performance"in o&&o.performance&&"function"==typeof o.performance.setResourceTimingBufferSize&&o.performance.setResourceTimingBufferSize(400),function(){if(BOOMR=o.BOOMR||{},BOOMR.plugins=BOOMR.plugins||{},!BOOMR.plugins.AK){var t={"ak.v":"37","ak.cp":"335882","ak.ai":parseInt("199322",10),"ak.ol":"0","ak.cr":4,"ak.ipv":4,"ak.proto":"h2","ak.rid":"453d8415","ak.r":41448,"ak.a2":0,"ak.m":"x","ak.n":"essl","ak.bpcip":"143.58.148.0","ak.cport":46027,"ak.gh":"95.101.236.191","ak.quicv":"","ak.tlsv":"tls1.3","ak.0rtt":"","ak.csrc":"-","ak.acc":"","ak.t":"1721592840","ak.ak":"hOBiQwZUYzCg5VSAfCLimQ==uROxhD+pa/SW+CHSdP69UBHxK/Qanw5yf4kVFrOUt82WciboWwaTf5lOLoNXFbUByx2bAsukyuywWfkZsyJIEeVEsFY3vpy92hGP3licCGY28D4f8kAXTBhqvCc9I2E3Nq0H2n/60WlRVH9w4c1zc4f9OZIm6RtPNs3NP9pfdS9Nwh3D+b6t02hUEhzRsI68zOEfOLN0bvvzCqqzGoOucKDPArE6qNqDW1NB8N2zrYwwIZk3r1TYEuzNVEj//FQ/QRE4T1FdmB95Nei6xV576IURnxVOihUnDE17DLFgwdPhDQsCdeW5a+M1yIqJsjI0PkP8VIlqWShPel0ksE9mThYoQq9HbKCJtqtajSqcjJ21pYQtgpEBaFW/KfGVYtajCLwka2nw6d9gxGi8QkvofB+aceBlyOwcG1RhUBJPJuU=","ak.pv":"175","ak.dpoabenc":"","ak.tf":1};0;var e={i:!1,av:function(a){var e="http.initiator";!a||a[e]&&"spa_hard"!==a[e]||(t["ak.feo"]=void 0!==o.aFeoApplied?1:0,BOOMR.addVar(t))},rv:function(){BOOMR.removeVar(["ak.bpcip","ak.cport","ak.cr","ak.csrc","ak.gh","ak.ipv","ak.m","ak.n","ak.ol","ak.proto","ak.quicv","ak.tlsv","ak.0rtt","ak.r","ak.acc","ak.t","ak.tf"])}};BOOMR.plugins.AK={akVars:t,akDNSPreFetchDomain:"r45jirdim7e62zu5nqea-f-b7a1817a4-clientnsv4-s.akamaihd.net",init:function(){if(!e.i){var a=BOOMR.subscribe;a("before_beacon",e.av,null,null),a("onbeacon",e.rv,null,null),e.i=!0}return this},is_complete:function(){return!0}}}}()}(window)</script></head><body><!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none;font-size:0;line-height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;visibility:hidden;mso-hide:all">*|MC_PREVIEW_TEXT|*</span><!--<![endif]--><center><table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable" style="background-color:#f4f4f4"><tbody><tr><td class="bodyCell" align="center" valign="top"><table id="root" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody data-block-id="13" class="mceWrapper"><tr><td align="center" valign="top" class="mceWrapperOuter"><!--[if (gte mso 9)|(IE)]><table align="center" border="0" cellspacing="0" cellpadding="0" width="660" style="width:660px"><tr><td><![endif]--><table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:660px" role="presentation"><tbody><tr><td style="background-color:#fff;background-position:center;background-repeat:no-repeat;background-size:cover" class="mceWrapperInner" valign="top"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" data-block-id="12"><tbody><tr class="mceRow"><td style="background-position:center;background-repeat:no-repeat;background-size:cover" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr><td style="padding-top:0;padding-bottom:0" class="mceColumn" data-block-id="-10" valign="top" colspan="12" width="100%"><table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr><td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0" valign="top"><table width="100%" style="border:0;border-collapse:separate"><tbody><tr><td style="padding-top:48px" class="mceTextBlockContainer"><div data-block-id="1" class="mceText" id="dataBlockId-1" style="width:100%"><p class="last-child"><a href="*|ARCHIVE|*">View this email in your browser</a></p></div></td></tr></tbody></table></td></tr><tr><td style="padding-top:12px;padding-bottom:12px;padding-right:48px;padding-left:48px" class="mceBlockContainer" align="center" valign="top"><span class="mceImageBorder" style="border:0;vertical-align:top;margin:0"><img data-block-id="2" width="150" height="auto" style="width:150px;height:auto;max-width:150px!important;display:block" alt="Logo" src="https://mcusercontent.com/5bbb557de4527833a72d82012/images/beca0713-ae93-95cb-50e4-0c7c7722ff58.jpg" class="mceLogo"></span></td></tr><tr><td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0" valign="top"><table width="100%" style="border:0;border-collapse:separate"><tbody><tr><td style="padding-left:24px;padding-right:24px;padding-top:12px;padding-bottom:12px" class="mceTextBlockContainer"><div data-block-id="3" class="mceText" id="dataBlockId-3" style="width:100%"><h1>${otp}</h1><p class="last-child">Use this One time password to validate your account.</p></div></td></tr></tbody></table></td></tr><tr><td style="background-color:transparent;padding-top:20px;padding-bottom:20px;padding-right:24px;padding-left:24px" class="mceBlockContainer" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:transparent" role="presentation" class="mceDividerContainer" data-block-id="6"><tbody><tr><td style="min-width:100%;border-top:2px solid #000" class="mceDividerBlock" valign="top"></td></tr></tbody></table></td></tr><tr><td style="padding-top:12px;padding-bottom:12px;padding-right:0;padding-left:0" class="mceLayoutContainer" valign="top"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" data-block-id="7"><tbody><tr class="mceRow"><td style="background-position:center;background-repeat:no-repeat;background-size:cover" valign="top"><table border="0" cellpadding="0" cellspacing="24" width="100%" role="presentation"><tbody><tr><td style="margin-bottom:24px" class="mceColumn" data-block-id="-9" valign="top" colspan="12" width="100%"><table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr><td align="center" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="" role="presentation" class="mceClusterLayout" data-block-id="-8"><tbody><tr><td style="padding-left:24px;padding-top:0;padding-right:24px" data-breakpoint="33" valign="top" class="mobileClass-33"><span class="mceImageBorder" style="border:0;vertical-align:top;margin:0"><img data-block-id="-5" width="40" height="auto" style="width:40px;height:auto;max-width:40px!important;display:block" alt="Facebook icon" src="https://cdn-images.mailchimp.com/icons/social-block-v3/block-icons-v3/facebook-filled-dark-40.png" class="mceImage"></span></td><td style="padding-left:24px;padding-top:0;padding-right:24px" data-breakpoint="33" valign="top" class="mobileClass-33"><span class="mceImageBorder" style="border:0;vertical-align:top;margin:0"><img data-block-id="-6" width="40" height="auto" style="width:40px;height:auto;max-width:40px!important;display:block" alt="Instagram icon" src="https://cdn-images.mailchimp.com/icons/social-block-v3/block-icons-v3/instagram-filled-dark-40.png" class="mceImage"></span></td><td style="padding-left:24px;padding-top:0;padding-right:24px" data-breakpoint="33" valign="top" class="mobileClass-33"><span class="mceImageBorder" style="border:0;vertical-align:top;margin:0"><img data-block-id="-7" width="40" height="auto" style="width:40px;height:auto;max-width:40px!important;display:block" alt="Twitter icon" src="https://cdn-images.mailchimp.com/icons/social-block-v3/block-icons-v3/twitter-filled-dark-40.png" class="mceImage"></span></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr><tr><td style="padding-top:8px;padding-bottom:8px;padding-right:8px;padding-left:8px" class="mceLayoutContainer" valign="top"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" data-block-id="11" id="section_1d1571bb7c3e6e5c40b65fb4d1dd8bf2" class="mceFooterSection"><tbody><tr class="mceRow"><td style="background-position:center;background-repeat:no-repeat;background-size:cover" valign="top"><table border="0" cellpadding="0" cellspacing="12" width="100%" role="presentation"><tbody><tr><td style="padding-top:0;padding-bottom:0;margin-bottom:12px" class="mceColumn" data-block-id="-3" valign="top" colspan="12" width="100%"><table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr><td style="padding-top:12px;padding-bottom:12px;padding-right:48px;padding-left:48px" class="mceBlockContainer" align="center" valign="top"><span class="mceImageBorder" style="border:0;vertical-align:top;margin:0"><img data-block-id="8" width="150" height="auto" style="width:150px;height:auto;max-width:150px!important;display:block" alt="Logo" src="https://mcusercontent.com/5bbb557de4527833a72d82012/images/beca0713-ae93-95cb-50e4-0c7c7722ff58.jpg" class="mceLogo"></span></td></tr><tr><td style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0" align="center" valign="top"><table width="100%" style="border:0;border-collapse:separate"><tbody><tr><td style="padding-left:16px;padding-right:16px;padding-top:12px;padding-bottom:12px" class="mceTextBlockContainer"><div data-block-id="9" class="mceText" id="dataBlockId-9" style="display:inline-block;width:100%"><p class="last-child"><em><span style="font-size:12px">Copyright (C) *|CURRENT_YEAR|* *|LIST:COMPANY|*. All rights reserved.</span></em><br><span style="font-size:12px">*|IFNOT:ARCHIVE_PAGE|**|LIST:DESCRIPTION|**|END:IF|*</span><br><br><span style="font-size:12px">Our mailing address is:</span><br><span style="font-size:12px">*|IFNOT:ARCHIVE_PAGE|**|HTML:LIST_ADDRESS|**|END:IF|*</span><br><br><span style="font-size:12px">Want to change how you receive these emails?</span><br><span style="font-size:12px">You can</span><a href="*|UPDATE_PROFILE|*"><span style="font-size:12px">update your preferences</span></a><span style="font-size:12px">or</span><a href="*|UNSUB|*"><span style="font-size:12px">unsubscribe</span></a></p></div></td></tr></tbody></table></td></tr><tr><td class="mceLayoutContainer" align="center" valign="top"><table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation" data-block-id="-2"><tbody><tr class="mceRow"><td style="background-position:center;background-repeat:no-repeat;background-size:cover" valign="top"><table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr><td class="mceColumn" data-block-id="-11" valign="top" colspan="12" width="100%"><table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation"><tbody><tr><td align="center" valign="top"><div><div data-block-id="10"><a href="http://eepurl.com/iP2msk" target="_blank" rel="noopener noreferrer"><img style="max-width:100%" width="137" height="53" alt="Email Marketing Powered by Mailchimp" title="Mailchimp Email Marketing" src="https://cdn-images.mailchimp.com/monkey_rewards/intuit-mc-rewards-2.png"></a></div></div></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table></td></tr></tbody></table><!--[if (gte mso 9)|(IE)]><![endif]--></td></tr></tbody></table></td></tr></tbody></table></center><script type="text/javascript" src="/_5qYEI/b/U/Y8z9x-j6rQ/YuS1bS6cpNGbVa/eD8hahxXGAE/Hn/Viewd0W2Y"></script></body></html>`;
};

const businessApproval = () => {
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vamooze Business Approval</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #4CAF50;
                color: white;
                text-align: center;
                padding: 20px;
            }
            .content {
                background-color: #f9f9f9;
                padding: 20px;
            }
            .button {
                display: inline-block;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                margin-top: 20px;
                border-radius: 5px;
            }
            @media only screen and (max-width: 600px) {
                .container {
                    width: 100% !important;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Vamooze Business Approval</h1>
            </div>
            <div class="content">
                <p>Dear Valued Partner,</p>
                <p>We are excited to inform you that your business registration with Vamooze has been approved! Welcome to our innovative logistics platform.</p>
                <p>At Vamooze, we're committed to revolutionizing urban and suburban logistics through our eco-conscious approach and diverse range of transportation assets. We're thrilled to have you on board as we work together to enhance efficiency and sustainability in the logistics industry.</p>
                <p>Your account is now active, and you can start using our platform to access reliable, eco-friendly delivery options that meet your business needs.</p>
                <p>If you have any questions or need assistance getting started, our support team is here to help.</p>
                <a href="#" class="button">Log In to Your Account</a>
                <p>Thank you for choosing Vamooze. We look forward to contributing to your business success!</p>
                <p>Best regards,<br>The Vamooze Team</p>
            </div>
        </div>
    </body>
    </html>`;
};

const inHouseManagerInvite = (
  first_name: string,
  email: string,
  defaultPassword: string
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vamooze In-House Manager Invitation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .email-container {
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 20px;
        }
        h1 {
            color: #4a4a4a;
            text-align: center;
        }
        h2 {
            color: #4CAF50;
        }
        .credentials {
            background-color: #f2f2f2;
            padding: 10px;
            border-radius: 5px;
            margin: 15px 0;
        }
        .warning {
            color: #ff0000;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <h1>Vamooze In-House Manager Invitation</h1>
        
        <h2>Welcome, ${first_name}!</h2>
        
        <p>You have been invited to join as an In-House Manager.</p>
        
        <div class="credentials">
            <p>Your login credentials are:</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${defaultPassword}</p>
        </div>
        
        <p class="warning">Please log in and change your password immediately.</p>
        
        <p>If you didn't request this invitation, please ignore this email.</p>
        
        <p>Best regards,<br>The Vamooze Team</p>
    </div>
</body>
</html>`;
};

const emailTemplates = { otp, businessApproval, inHouseManagerInvite };

export default emailTemplates;
