(window.__LOADABLE_LOADED_CHUNKS__=window.__LOADABLE_LOADED_CHUNKS__||[]).push([[22],{"/qXn":function(e,t){},"0HLj":function(e,t,a){"use strict";a("jW1Z")},"1yjQ":function(e,t){},"295A":function(e,t,a){"use strict";a.d(t,"a",(function(){return r}));var n=a("q1tI"),c=a.n(n),r=Object(n.createContext)(null);t.b=function(e){var t=e.children,a=e.location,i=Object(n.useMemo)((function(){return{location:a}}),[a]);return c.a.createElement(r.Provider,{value:i},t)}},"2GVX":function(e,t,a){},DxWo:function(e,t,a){"use strict";a.d(t,"a",(function(){return _}));var n=a("q1tI"),c=a.n(n),r=a("TSYQ"),i=a.n(r),l=a("KFxo"),o=a.n(l),s=a("21kl"),d=a("xHbj"),u=a("295A"),m=a("M1OY"),b=(a("bvJr"),a("1yjQ")),v=a.n(b);function f(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if(!(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e)))return;var a=[],n=!0,c=!1,r=void 0;try{for(var i,l=e[Symbol.iterator]();!(n=(i=l.next()).done)&&(a.push(i.value),!t||a.length!==t);n=!0);}catch(e){c=!0,r=e}finally{try{n||null==l.return||l.return()}finally{if(c)throw r}}return a}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}var _=Object(n.createContext)({reMount:function(){},setTotalSlides:function(){},totalSlides:0,currentSlide:0,sendGAEvent:function(){}});t.b=o()(v.a)((function(e){var t=e.options,a=void 0===t?{}:t,r=e.inverted,l=e.children,o=Object(n.useContext)(u.a),b=f(Object(n.useState)(0),2),v=b[0],h=b[1],E=f(Object(n.useState)(0),2),w=E[0],p=E[1],j=Object(m.a)((function(e){var t=w+1;if(o){var a=o.location;Object(d.a)({event:"carousel-interaction",action:"carousel:".concat(a),category:"page interaction",label:e,customDimensions:{slideNumber:t}})}}),[o,w]),O=Object(s.a)(a,(function(e){e.on("move",(function(){p(e.index)})),o&&e.on("run.after",(function(){j("control:move")}))})),g=O.ref,N=O.reMount,y=i()("glide carousel",{"carousel--inverted":!!r}),S=Object(n.useMemo)((function(){return{reMount:N,totalSlides:v,setTotalSlides:h,currentSlide:w,sendGAEvent:j}}),[O,v,h]);return Object(n.useEffect)((function(){v>0&&N()}),[v]),c.a.createElement(_.Provider,{value:S},c.a.createElement("div",{className:y,ref:g},l))}))},HZ4S:function(e,t,a){"use strict";var n=a("DxWo"),c=a("q1tI"),r=a.n(c),i=a("TSYQ"),l=a.n(i),o=a("vTy/"),s=function(e){var t=Object(c.useContext)(n.a),a=t.currentSlide,i=t.totalSlides,s=e.direction,d="left"===s?"<":">",u="left"===s&&0===a||"right"===s&&a===i-1,m=l()("glide__arrow","glide__arrow--".concat(s),"carousel__arrow--".concat(s),{"glide__arrow--disabled":u});return r.a.createElement("div",{className:"glide__arrows carousel__arrow","data-glide-el":"controls"},r.a.createElement("button",{className:m,"data-glide-dir":d},r.a.createElement(o.a,{width:"15px",className:"carousel__arrow-svg"})))},d=function(e){var t=e.activeDeviceType,a=Object(c.useContext)(n.a).totalSlides,i=Object(c.useContext)(n.a).currentSlide,o=a;a>3&&"mobile"===t&&(o=3);for(var s=[],d=0;d<o;d++)"mobile"===t?(i>1&&a>2&&i+1!==a?i=1:d+1===o&&i+1===a&&(i=2),s.push(r.a.createElement("span",{className:l()("glide__bullet-mobile",{"glide__bullet-mobile--active-bullet":i===d&&a>3,"glide__bullet-mobile--non-active-bullet":i!==d&&a>3}),key:d,"data-glide-dir":"=".concat(d)}))):s.push(r.a.createElement("button",{className:"glide__bullet",key:d,"data-glide-dir":"=".concat(d)}));return r.a.createElement("div",{className:"glide__bullets carousel__bullets","data-glide-el":"controls[nav]"},s)},u=function(e){var t=e.activeDeviceType;return r.a.createElement("div",{className:"carousel-control"},r.a.createElement(s,{direction:"left"}),r.a.createElement(d,{activeDeviceType:t}),r.a.createElement(s,{direction:"right"}))},m=function(e){var t=e.slides,a=e.extraClassNames,i=Object(c.useContext)(n.a).setTotalSlides,l=a?"glide__slide "+a:"glide__slide",o=t.map((function(e,t){return r.a.createElement("li",{className:l,key:t},e)}));return Object(c.useEffect)((function(){i(o.length)}),[o.length]),r.a.createElement("div",{className:"glide__track","data-glide-el":"track"},r.a.createElement("ul",{className:"glide__slides"},o))};a.d(t,"e",(function(){return n.b})),a.d(t,"b",(function(){return n.a})),a.d(t,"a",(function(){return s})),a.d(t,"c",(function(){return u})),a.d(t,"d",(function(){return m}))},SV56:function(e,t,a){"use strict";a("fNVU")},Tcy5:function(e,t,a){"use strict";var n=a("TSYQ"),c=a.n(n),r=a("/MKj"),i=a("KFxo"),l=a.n(i),o=a("Bqdl"),s=a("q1tI"),d=a.n(s),u=(a("hSVq"),function(e){return d.a.createElement("div",{className:"main-body__pre-content"},d.a.createElement("div",{className:e.className,id:e.id},e.children))}),m=a("/qXn"),b=a.n(m),v=l()(b.a)(Object(r.b)((function(e,t){return{className:c()(t.className,"hero-area"),prefetchInProgress:Object(o.Vc)(e)}}))(u));t.a=v},al7l:function(e,t,a){"use strict";a.r(t);var n=a("q1tI"),c=a.n(n),r=a("sjME"),i=a("Tcy5"),l=a("ske0"),o=a("/MKj"),s=a("Bqdl"),d=a("p1t6"),u=a("77oc"),m=a("zVZG"),b=function(e){var t=e.shows.map((function(e,t){var a=e.showUrl,n=e.showImgUrl,r=e.showName;return c.a.createElement("div",{className:"show-node",key:t},c.a.createElement(m.a,{to:a},c.a.createElement("img",{className:"show-node__img",src:n,alt:r})),c.a.createElement("h3",{className:"show-node__title"},c.a.createElement(m.a,{to:a},r)))}));return c.a.createElement("div",{className:"shows-feed"},c.a.createElement("div",{className:"shows-feed__toolbar"},c.a.createElement("h2",{className:"module-title shows-feed__header"},"ALL SHOWS")),c.a.createElement("div",{className:"shows-feed__container"},t))},v=(a("SV56"),Object(o.b)((function(e){var t=Object(s.b)("cloudinary")(e).transformations;return{shows:Object(s.Jc)(e).map((function(a){var n=Object(s.Tc)(a)(e),c=Object(d.a)(n,"data"),r=Object(u.a)(c,"alias"),i=Object(u.a)(c,"verticalThumbnail"),l=Object(u.a)(c,"name");return{showAlias:r,showImgUrl:"string"==typeof i?Object(s.Pc)(i,t.showsThumbnailVertical)(e):"",showName:l,showUrl:"/video/".concat(Object(u.a)(c,"alias"))}}))}}))(b)),f=a("KFxo"),_=a.n(f),h=a("HZ4S"),E=a("TSYQ"),w=a.n(E),p=a("k7NS"),j=a("AvBf"),O=function(e){var t=e.title,a=e.description,n=e.imageUrl,r=e.imageAlt,i=e.isNewShow,l=e.showUrl,o=e.brandedKeywords,s=e.bcCounter,d=w()("show-hero",{"show-hero--new-show":i});return c.a.createElement("div",{className:d},c.a.createElement(p.a,{to:l},c.a.createElement("div",{className:"show-hero__image"},c.a.createElement("img",{src:n,alt:r}))),c.a.createElement("div",{className:"show-hero__detail main-container main-container--padded"},c.a.createElement("h2",{className:"show-hero__title"},c.a.createElement("span",null,t)),c.a.createElement("div",{className:"show-hero__description"},a),c.a.createElement("div",{className:"show-hero__ad"},o&&c.a.createElement(j.a,{bcCounter:s,className:"adUnits_branded",cmnuntBrandedKw:o,idPrefix:"video-landing-show-hero"}))))},g=Object(o.b)((function(e,t){var a,n=t.id,c=Object(s.b)("cloudinary")(e).transformations,r=Object(s.Tc)(n)(e),i=Object(d.a)(r,"data"),l=i.alias,o=i.backgroundImage,u=i.name,m=i.description,b=i.newShow,v=i.brandedContentKeyword;return o&&(a=Object(s.Pc)(o,c.showsBackgroundImage)(e)),{imageUrl:a,imageAlt:u,title:u,description:m,isNewShow:!!b,showUrl:"/video/".concat(l),brandedKeywords:v}}))(O),N=a("gJYd"),y=a.n(N),S=(a("0HLj"),_()(y.a)((function(e){var t=e.showIds,a=e.activeDeviceType,n=t.map((function(e,t){return c.a.createElement(g,{id:e,key:e,bcCounter:t})}));return c.a.createElement("div",{className:"video-landing-hero"},n.length>0&&c.a.createElement(h.e,{inverted:!0,options:{autoplay:5e3,hoverpause:!1,keyboard:!1}},c.a.createElement(h.d,{slides:n}),c.a.createElement("div",{className:"video-landing-hero__control-container main-container main-container--padded"},c.a.createElement("div",{className:"video-landing-hero__controls"},c.a.createElement(h.c,{activeDeviceType:a})))))}))),T=Object(o.b)((function(e){var t=Object(s.Jc)(e)||[],a=Object(s.U)(e);return{showIds:t.slice(0,3),activeDeviceType:a}}))(S),x=a("vTy/"),k=a("DxWo"),C=function(e){var t=e.imageUrl,a=e.showName,r=e.title,i=e.episodeUrl,l=Object(n.useContext)(k.a).sendGAEvent,o=Object(n.useCallback)((function(){l("slide:clicked")}),[l]);return c.a.createElement("div",{className:"new-episode-preview"},c.a.createElement("div",{className:"new-episode-preview__image"},c.a.createElement(p.a,{to:i},c.a.createElement("img",{src:t,alt:r,onClick:o}),c.a.createElement(x.r,null))),c.a.createElement("h3",{className:"new-episode-preview__show-name"},a),c.a.createElement("h4",{className:"new-episode-preview__title"},c.a.createElement(p.a,{to:i,title:r,onClick:o},r)))},U=Object(o.b)((function(e,t){var a=t.episodeId,n=Object(s.Qb)(a)(e),c=Object(s.Uc)(e)[Object(d.a)(n,"mainNode")],r=Object(d.a)(n,"headline","text"),i=Object(d.a)(c,"data").name.toUpperCase(),l=Object(s.b)("cloudinary")(e).transformations,o=Object(s.Zb)(n)(e);return{title:r,showName:i,imageUrl:Object(s.Pc)(o,l.showFeedThumb)(e),episodeUrl:Object(s.lc)(n)(e)}}))(C),A=a("h+dt"),D=a("295A"),I=(a("k36a"),function(e){for(var t=e.episodeIds,a=e.activeDeviceType,n=Object(A.a)("(min-width: 1024px)")?3:2,r=t.map((function(e){return c.a.createElement("div",{key:e,className:"newest-episodes__preview"},c.a.createElement(U,{episodeId:e}))})),i=[],l=0;l<r.length;l++)if(l%n==0){var o=r.slice(l,l+n);i.push(c.a.createElement("div",{className:"newest-episodes__slide"},o))}return c.a.createElement("div",{className:"newest-episodes"},c.a.createElement(D.b,{location:"newest episodes"},c.a.createElement(h.e,{options:{autoplay:!1,keyboard:!1}},c.a.createElement("div",{className:"newest-episodes__toolbar"},c.a.createElement("h1",{className:"module-title newest-episodes__title"}," NEWEST EPISODES "),c.a.createElement("div",{className:"newest-episodes__controls"},c.a.createElement(h.c,{activeDeviceType:a}))),c.a.createElement(h.d,{slides:i}))))}),q=a("zQ2p"),K=Object(o.b)((function(e){return{episodeIds:Object(s.xc)(e).filter((function(t){var a=Object(s.Qb)(t)(e),n=Object(d.a)(a,"leadCarousel"),c=Object(s.Mc)(e),r=c&&n&&c[n[0]];return Object(q.d)(r)})).slice(0,9),activeDeviceType:Object(s.U)(e)}}))(I),V=a("pCfc");t.default=function(e){return c.a.createElement(l.a,e,c.a.createElement(i.a,{id:"video-background",className:"video-landing-page__hero-area"},c.a.createElement(T,null)),c.a.createElement("div",{className:"main-container main-container--padded"},c.a.createElement(r.a,{className:"video-landing-hero-container",fullWidth:!0},c.a.createElement(K,null),c.a.createElement(v,null),c.a.createElement(V.a,null))))}},bvJr:function(e,t,a){},fNVU:function(e,t,a){},gJYd:function(e,t){},hSVq:function(e,t,a){"use strict";a("2GVX")},jW1Z:function(e,t,a){},k36a:function(e,t,a){"use strict";a("lpJZ")},lpJZ:function(e,t,a){}}]);