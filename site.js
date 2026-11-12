(()=> {
 'use strict';
 const $=s=>document.querySelector(s);
 const cfg=window.UFILAG_CONFIG||{};
 const supaCfg=cfg.supabase||{};
 const isRemote=!!(window.supabase?.createClient&&supaCfg.url&&supaCfg.anonKey);
 const db=isRemote?window.supabase.createClient(supaCfg.url,supaCfg.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storage:window.localStorage,storageKey:'ufilag-auth-v1'}}):null;
 const localRead=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
 const localSave=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
 const defaults=[{id:'welcome',type:'news',title:'SECTOR 7 — Development is underway',summary:'Follow the first steps of our upcoming story-driven horror game.',body:'UFILAG is developing its first original title: SECTOR 7. More details will be shared as development progresses.',category:'Development Update',date:'NOV 2026',image_url:'',featured:true,created_at:'2026-11-01T00:00:00Z'}];
 let contentCache=null, galleryCache=[];
 const normalize=row=>({...row,id:row.id,title:row.title,summary:row.summary||'',body:row.body||'',category:row.category||'',type:row.type||'news',image:row.image_url||row.image||'',video:row.video_url||row.video||'',button_label:row.button_label||'',button_url:row.button_url||'',game_id:row.game_id||'',featured:!!row.featured,date:row.date||new Date(row.created_at||Date.now()).toLocaleDateString('en-GB',{month:'short',year:'numeric'}).toUpperCase(),created:row.created_at?new Date(row.created_at).getTime():(row.created||0)});
 async function getContent(){if(isRemote){const {data,error}=await db.from('content').select('*').eq('published',true).order('created_at',{ascending:false});if(error)throw error;return (data||[]).map(normalize)}return localRead('uf_news',defaults).map(normalize).sort((a,b)=>b.created-a.created)}
 async function refreshContent(){try{contentCache=await getContent()}catch(e){console.error('UFILAG content backend:',e);contentCache=[];const h=$('#homeNews'),f=$('#newsFeed');if(h)h.innerHTML='<div class="empty-state">Не удалось загрузить публикации. Проверьте подключение Supabase и права доступа.</div>';if(f)f.innerHTML='<div class="empty-state">Не удалось загрузить новости. Обновите страницу позже.</div>';return}renderAll()}
 function esc(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
 const nav=$('.main-nav'),toggle=$('.menu-toggle');if(toggle&&nav)toggle.addEventListener('click',()=>nav.classList.toggle('open'));
 let lang=$('#adminApp')?'ru':(localStorage.getItem('uf_lang')||'en');
 function setLang(v){lang=v;localStorage.setItem('uf_lang',v);document.documentElement.lang=v;document.querySelectorAll('[data-en][data-ru]').forEach(el=>el.textContent=el.dataset[v]);const b=$('#langSwitch');if(b)b.textContent=v==='en'?'RU':'EN'}
 setLang(lang);$('#langSwitch')?.addEventListener('click',()=>setLang(lang==='en'?'ru':'en'));
 // Ambient snow and cinematic page transitions.
 // Lightweight ambient particles: capped DPR, fewer particles, pauses in background tabs.
 const canvas=$('.snow-layer');if(canvas&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&innerWidth>760){const ctx=canvas.getContext('2d',{alpha:true});let flakes=[],last=0,raf=0;function resize(){const dpr=Math.min(devicePixelRatio||1,1.25);canvas.width=Math.round(innerWidth*dpr);canvas.height=Math.round(innerHeight*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);flakes=Array.from({length:24},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*.8+.25,v:Math.random()*.28+.12}))}function draw(t){if(document.hidden){raf=0;return}if(t-last>40){last=t;ctx.clearRect(0,0,innerWidth,innerHeight);ctx.fillStyle='rgba(255,255,255,.16)';flakes.forEach(f=>{ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,6.28);ctx.fill();f.y+=f.v;if(f.y>innerHeight)f.y=-3})}raf=requestAnimationFrame(draw)}addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!raf)raf=requestAnimationFrame(draw)});resize();raf=requestAnimationFrame(draw)}else if(canvas){canvas.style.display='none'}
 document.querySelectorAll('a[href]').forEach(a=>{const h=a.getAttribute('href');if(!h||h.startsWith('#')||h.startsWith('mailto:')||h.startsWith('tel:')||a.target==='_blank'||h.startsWith('http'))return;a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const u=new URL(a.href,location.href);if(u.origin!==location.origin||u.pathname===location.pathname&&u.hash)return;e.preventDefault();document.body.classList.add('page-leaving');setTimeout(()=>location.href=a.href,220)})});
 const reveals=document.querySelectorAll('.section,.page-hero,.project-feature,.rn-card,.promo-tile,.contact-card,.media-card');if('IntersectionObserver'in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.08});reveals.forEach(e=>{e.classList.add('reveal');io.observe(e)})}else reveals.forEach(e=>e.classList.add('is-visible'));
 function card(p){return `<a class="rn-card" href="news.html#${encodeURIComponent(p.id)}">${p.image?`<img class="rn-image" src="${esc(p.image)}" alt="">`:'<div class="rn-image"></div>'}<div class="rn-copy"><div class="rn-meta">${esc(p.category)} • ${esc(p.date)}</div><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p><span class="rn-read">READ MORE ↗</span></div></a>`}
 function renderAll(){
  const all=contentCache||defaults.map(normalize);
  const h=$('#homeNews');if(h){const news=all.filter(p=>p.type!=='trailer');h.innerHTML=news.map(card).join('')||'<div class="empty-state">News and updates are coming soon.</div>';setupHomeNewsCarousel(news.length)}
  const feed=$('#newsFeed');if(feed){const hash=decodeURIComponent(location.hash.slice(1));const item=all.find(p=>String(p.id)===hash);if(item){feed.innerHTML=`<article class="news-article"><div class="eyebrow">${esc(item.category)} • ${esc(item.date)}</div><h2>${esc(item.title)}</h2>${item.image?`<img src="${esc(item.image)}" alt="">`:''}<p class="lead">${esc(item.summary)}</p><p style="white-space:pre-wrap;line-height:2;color:#ccc">${esc(item.body)}</p><section class="article-community"><h3>ОБСУЖДЕНИЕ</h3><div id="articleComments"><p class="notice">Загрузка комментариев…</p></div><textarea id="newCommentText" placeholder="Поделитесь мнением…" rows="4"></textarea><button class="admin-btn" id="sendComment" type="button">ОТПРАВИТЬ КОММЕНТАРИЙ</button><p id="commentStatus" class="notice" aria-live="polite"></p></section><a class="text-link" href="news.html">← ВСЕ НОВОСТИ</a></article>`}else feed.innerHTML=all.filter(p=>p.type!=='trailer').map(card).join('')||'<div class="empty-state">No publications yet.</div>'}
  const ann=$('#announcementsGrid');if(ann){let a=all.filter(p=>p.type==='announcement');ann.innerHTML=a.map(card).join('')||'<div class="empty-state" style="grid-column:1/-1">Studio announcements will appear here.</div>'}
  const trailers=$('#trailersGrid');if(trailers){let a=all.filter(p=>p.type==='trailer'&&p.video);trailers.innerHTML=a.map(p=>{const video=String(p.video||'').trim();let player='';const yt=video.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{6,})/i);const vm=video.match(/vimeo\.com\/(?:video\/)?(\d+)/i);const direct=/\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(video)||/\/storage\/v1\/object\/public\//i.test(video);if(direct){const type=/\.webm(?:[?#].*)?$/i.test(video)?'video/webm':/\.ogg(?:[?#].*)?$/i.test(video)?'video/ogg':'video/mp4';player=`<video controls playsinline preload="metadata" poster="${esc(p.image||'')}"><source src="${esc(video)}" type="${type}"><p>Ваш браузер не поддерживает HTML5-видео. <a href="${esc(video)}" target="_blank" rel="noopener">Открыть видео</a>.</p></video>`}else if(yt){player=`<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="${esc(p.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`}else if(vm){player=`<iframe src="https://player.vimeo.com/video/${vm[1]}" title="${esc(p.title)}" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`}else{player=`<div class="video-unavailable">Не удалось распознать видео. Укажите прямую ссылку MP4/WebM или ссылку YouTube/Vimeo.</div>`}return `<article class="media-card"><div class="video-frame">${player}</div><div class="rn-copy"><div class="rn-meta">UFILAG VIDEO • ${esc(p.date)}</div><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p></div></article>`}).join('')||'<div class="empty-state" style="grid-column:1/-1">Trailers and gameplay videos will appear here after publication.</div>'}
  renderHero(all);
  renderPhotoOnlyHero();
  const articleId = document.querySelector('#newsFeed .news-article') ? decodeURIComponent(location.hash.slice(1)) : null;
  if (articleId) renderArticleComments(articleId);
 }
 window.addEventListener('hashchange',()=>{if($('#newsFeed'))renderAll()});
 async function renderPhotoOnlyHero(){
  const root=$('#heroSlider');if(!root||!isRemote)return;
  try{
   const {data,error}=await db.from('hero_media').select('image_url,photo_only').eq('id',1).maybeSingle();
   if(error)throw error;
   if(!data?.image_url)return;
   if(root._timer)clearInterval(root._timer);
   root.querySelectorAll('.slide').forEach(x=>x.remove());
   const slide=document.createElement('div');slide.className='slide active photo-only-slide';
   slide.style.backgroundImage=`url("${String(data.image_url).replace(/["\\]/g,'')}")`;
   slide.style.backgroundSize='cover';slide.style.backgroundPosition='center';
   const copy=document.createElement('div');copy.className='slide-copy container';copy.hidden=!!data.photo_only;copy.innerHTML=`${data.title?`<h1 class="display">${esc(data.title)}</h1>`:''}${data.summary?`<p class="lead">${esc(data.summary)}</p>`:''}${data.button_label&&data.button_url?`<a class="btn filled" href="${esc(data.button_url)}" target="_blank" rel="noopener noreferrer">${esc(data.button_label)} ↗</a>`:''}`;slide.appendChild(copy);
   const controls=root.querySelector('.slider-controls');if(controls)root.insertBefore(slide,controls);else root.appendChild(slide);
   root.classList.toggle('photo-only-mode',!!data.photo_only);
   const dots=root.querySelector('.dots');if(dots)dots.hidden=!!data.photo_only;
   if(controls)controls.hidden=!!data.photo_only;
  }catch(e){console.warn('UFILAG photo hero:',e.message)}
 }
 $('#savePhotoHero')?.addEventListener('click',async()=>{const b=$('#savePhotoHero'),status=$('#photoHeroStatus');b.disabled=true;try{await checkAdmin();const file=$('#photoHeroUpload').files[0];if(!file)throw Error('Выберите изображение главного экрана.');const url=await uploadImage(file);const {error}=await db.from('hero_media').upsert({id:1,image_url:url,photo_only:$('#photoHeroOnly').checked,title:$('#heroTitle')?.value.trim()||null,summary:$('#heroSummary')?.value.trim()||null,button_label:$('#heroButtonLabel')?.value.trim()||null,button_url:$('#heroButtonUrl')?.value.trim()||null,updated_at:new Date().toISOString()},{onConflict:'id'});if(error)throw error;status.textContent='Главный экран сохранён. Обновите главную страницу.';status.dataset.state='success';$('#photoHeroUpload').value=''}catch(e){status.textContent=e.message;status.dataset.state='error'}finally{b.disabled=false}});
 $('#clearPhotoHero')?.addEventListener('click',async()=>{const status=$('#photoHeroStatus');try{await checkAdmin();const {error}=await db.from('hero_media').delete().eq('id',1);if(error)throw error;status.textContent='Стандартный главный экран восстановлен.';status.dataset.state='success'}catch(e){status.textContent=e.message;status.dataset.state='error'}});
 let homeNewsTimer=null,homeNewsIndex=0,homeNewsCount=0;
 function setupHomeNewsCarousel(count){
  const track=$('#homeNews'),viewport=track?.parentElement,prev=$('#homeNewsPrev'),next=$('#homeNewsNext'),status=$('#homeNewsStatus');if(!track||!viewport)return;
  homeNewsCount=count;homeNewsIndex=Math.min(homeNewsIndex,Math.max(0,count-1));
  const visible=()=>innerWidth<=560?1:innerWidth<=850?2:3;
  const max=()=>Math.max(0,homeNewsCount-visible());
  const paint=()=>{homeNewsIndex=Math.min(homeNewsIndex,max());track.style.setProperty('--news-visible',visible());track.style.setProperty('--news-card-width',`calc((100% - ${(visible()-1)*18}px) / ${visible()})`);track.style.transform=`translateX(calc(-${homeNewsIndex} * (100% / var(--news-visible)) - ${homeNewsIndex*18}px))`;if(status)status.textContent=count?`${String(homeNewsIndex+1).padStart(2,'0')} / ${String(Math.max(1,max()+1)).padStart(2,'0')}`:'';if(prev)prev.disabled=max()===0;if(next)next.disabled=max()===0};
  if(prev)prev.onclick=()=>{homeNewsIndex=homeNewsIndex<=0?max():homeNewsIndex-1;paint();restart()};
  if(next)next.onclick=()=>{homeNewsIndex=homeNewsIndex>=max()?0:homeNewsIndex+1;paint();restart()};
  if(track._resizeHandler)removeEventListener('resize',track._resizeHandler);track._resizeHandler=paint;addEventListener('resize',paint,{passive:true});
  const restart=()=>{if(homeNewsTimer)clearInterval(homeNewsTimer);if(max()>0&&!matchMedia('(prefers-reduced-motion: reduce)').matches)homeNewsTimer=setInterval(()=>{homeNewsIndex=homeNewsIndex>=max()?0:homeNewsIndex+1;paint()},5200)};
  if(homeNewsTimer)clearInterval(homeNewsTimer);paint();restart();
 }
 function renderHero(all){
  const home=$('#heroSlider');if(!home)return;
  const controls=home.querySelector('.slider-controls');
  home.querySelectorAll('.slide').forEach(x=>x.remove());
  let items=all.filter(p=>p.featured&&p.image).sort((a,b)=>b.created-a.created).slice(0,8);
  if(!items.length)items=[{title:'BEYOND THE COLD.',summary:'Original worlds. Unforgettable stories. Games made to stay with you.',category:'UFILAG ORIGINAL',image:'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2000&q=85',id:'games'}];
  items.forEach((p,i)=>{
   const el=document.createElement('div');el.className='slide dynamic-slide'+(i===0?' active':'');
   el.style.backgroundImage=`linear-gradient(90deg,rgba(0,0,0,.88),rgba(0,0,0,.12)),url("${p.image}")`;
   const hasCopy=!!(p.title||p.summary||p.button_label);el.innerHTML=hasCopy?`<div class="slide-copy container"><div class="eyebrow">${esc(p.category||'UFILAG ORIGINAL')}</div>${p.title?`<h1 class="display">${esc(p.title)}</h1>`:''}${p.summary?`<p class="lead">${esc(p.summary)}</p>`:''}${p.button_label?`<a class="btn filled" href="${esc(p.button_url||('news.html#'+encodeURIComponent(p.id)))}" ${/^https?:/i.test(p.button_url||'')?'target="_blank" rel="noopener noreferrer"':''}>${esc(p.button_label)} ↗</a>`:''}</div>`:'';
   home.insertBefore(el,controls);
  });
  const slides=[...home.querySelectorAll('.slide')];let n=0,busy=false;
  const show=(next,dir=1)=>{
   if(slides.length<2||busy||((next%slides.length+slides.length)%slides.length)===n)return;
   busy=true;const nextIndex=(next+slides.length)%slides.length,current=slides[n],incoming=slides[nextIndex];
   slides.forEach(s=>s.classList.remove('active','slide-out-left','slide-out-right','slide-in-right','slide-in-left'));
   incoming.classList.add(dir>0?'slide-in-right':'slide-in-left');
   current.classList.add(dir>0?'slide-out-left':'slide-out-right');
   requestAnimationFrame(()=>requestAnimationFrame(()=>{incoming.classList.add('active');incoming.classList.remove('slide-in-right','slide-in-left')}));
   n=nextIndex;window.setTimeout(()=>{current.classList.remove('slide-out-left','slide-out-right');busy=false},900);
  };
  const prev=$('#prevSlide'),next=$('#nextSlide');if(prev)prev.onclick=()=>show(n-1,-1);if(next)next.onclick=()=>show(n+1,1);
  let downX=0,downY=0,dragging=false;
  home.onpointerdown=e=>{if(e.target.closest('a,button'))return;downX=e.clientX;downY=e.clientY;dragging=true;try{home.setPointerCapture(e.pointerId)}catch(_){}};
  home.onpointerup=e=>{if(!dragging)return;dragging=false;const dx=e.clientX-downX,dy=e.clientY-downY;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.25)show(n+(dx<0?1:-1),dx<0?1:-1)};
  home.onpointercancel=()=>{dragging=false};home.ondragstart=e=>e.preventDefault();
  if(home._timer)clearInterval(home._timer);
  if(slides.length>1&&!matchMedia('(prefers-reduced-motion: reduce)').matches)home._timer=setInterval(()=>show(n+1,1),7000);
 }
 // SECTOR 7 featured artwork: admin gallery uploads rotate in the homepage game panel.
 async function renderFeaturedGame(){
  const root=$('#featuredGameSlider');if(!root)return;
  let urls=[];
  try{
   if(isRemote){const {data,error}=await db.from('game_media').select('image_url').eq('game_slug','sector-7').order('created_at',{ascending:false});if(error)throw error;urls=(data||[]).map(x=>x.image_url).filter(Boolean)}
   else urls=localRead('uf_gallery',[]).filter(Boolean);
  }catch(e){console.warn('UFILAG featured gallery:',e.message)}
  if(!urls.length){try{if(isRemote){const {data}=await db.from('games').select('cover_url').eq('slug','sector-7').maybeSingle();if(data?.cover_url)urls=[data.cover_url]}}catch(e){console.warn('Featured cover:',e.message)}}
  if(!urls.length)urls=['assets/sector7-hospital.jpg'];
  const link=root.querySelector('.feature-gallery-link');
  if(!urls.length){root.classList.add('has-no-gallery');return}
  root.classList.remove('has-no-gallery');let index=0,busy=false;
  const makeSlide=(url,extra='')=>{const el=document.createElement('div');el.className='feature-gallery-slide'+(extra?' '+extra:'');el.style.backgroundImage=`linear-gradient(0deg,rgba(0,0,0,.68),transparent 48%),url("${url}")`;return el};
  const paint=()=>{root.querySelectorAll('.feature-gallery-slide').forEach(x=>x.remove());root.insertBefore(makeSlide(urls[index]),link);const count=$('#featureCounter');if(count)count.textContent=`${String(index+1).padStart(2,'0')} / ${String(urls.length).padStart(2,'0')}`};
  const move=dir=>{if(urls.length<2||busy)return;busy=true;const current=root.querySelector('.feature-gallery-slide');index=(index+dir+urls.length)%urls.length;const incoming=makeSlide(urls[index],'is-entering');root.insertBefore(incoming,link);current?.classList.add(dir>0?'is-leaving-left':'is-leaving-right');requestAnimationFrame(()=>requestAnimationFrame(()=>incoming.classList.remove('is-entering')));const count=$('#featureCounter');if(count)count.textContent=`${String(index+1).padStart(2,'0')} / ${String(urls.length).padStart(2,'0')}`;setTimeout(()=>{current?.remove();incoming.classList.remove('is-leaving-left','is-leaving-right');busy=false},680)};
  $('#featurePrev')?.addEventListener('click',()=>move(-1));$('#featureNext')?.addEventListener('click',()=>move(1));
  let sx=0,sy=0,drag=false;
  root.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;sx=e.clientX;sy=e.clientY;drag=true});
  root.addEventListener('pointerup',e=>{if(!drag)return;drag=false;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy))move(dx<0?1:-1)});
  root.addEventListener('pointercancel',()=>drag=false);
  paint();
  if(urls.length>1&&!matchMedia('(prefers-reduced-motion: reduce)').matches){root._featureTimer&&clearInterval(root._featureTimer);root._featureTimer=setInterval(()=>move(1),6000)}
 }
 // Contacts: real Telegram provided by the studio; other contacts remain intentionally blank.
 const contacts=cfg.contacts||{},contactDefs=[['telegram','Telegram','Message the UFILAG team','Open Telegram'],['instagram','Instagram','Follow studio updates','Visit Instagram'],['phone','Phone','Business and press enquiries','Call UFILAG']];
 const contactCards=contactDefs.filter(([k])=>contacts[k]).map(([k,label,desc,cta])=>{let url=contacts[k];if(k==='phone'&&!url.startsWith('tel:'))url='tel:'+url;return `<a class="contact-card" href="${esc(url)}" ${k!=='phone'?'target="_blank" rel="noopener"':''}><span class="rn-meta">UFILAG CONTACT</span><strong>${label}</strong><p>${desc}</p><span class="rn-read">${cta} ↗</span></a>`}).join('');
 if($('#contactCards'))$('#contactCards').innerHTML=contactCards||'<p class="notice">Contact links will appear here once configured.</p>';
 if($('#socialLinks'))$('#socialLinks').innerHTML=contactCards?contactDefs.filter(([k])=>contacts[k]).map(([k,l])=>`<a href="${esc(k==='phone'&&!contacts[k].startsWith('tel:')?'tel:'+contacts[k]:contacts[k])}" ${k!=='phone'?'target="_blank" rel="noopener"':''}>${l}</a>`).join(''):'<span class="notice">Connect with UFILAG</span>';
 // Studio logo: admin uploads one transparent logo; studio page reads it from Supabase.
 async function loadStudioBrand(){if(!isRemote)return;try{const {data,error}=await db.from('studio_settings').select('logo_url').eq('id',1).maybeSingle();if(error)throw error;if(data?.logo_url){const img=$('#studioBrandLogo');const fallback=$('#studioBrandFallback');if(img){img.src=data.logo_url;img.hidden=false}if(fallback)fallback.hidden=true;const preview=$('#studioLogoPreview');if(preview){preview.src=data.logo_url;preview.hidden=false}}}catch(e){console.warn('Studio logo:',e.message)}}
 loadStudioBrand();
 $('#saveStudioLogo')?.addEventListener('click',async()=>{const status=$('#studioLogoStatus'),btn=$('#saveStudioLogo');btn.disabled=true;try{await checkAdmin();const file=$('#studioLogoUpload').files[0];if(!file)throw Error('Выберите файл логотипа.');const url=await uploadImage(file);const {error}=await db.from('studio_settings').upsert({id:1,logo_url:url,updated_at:new Date().toISOString()},{onConflict:'id'});if(error)throw error;const img=$('#studioLogoPreview');img.src=url;img.hidden=false;status.textContent='Логотип сохранён и появится на странице «Студия».';status.dataset.state='success';$('#studioLogoUpload').value='';await loadStudioBrand()}catch(e){status.textContent=e.message;status.dataset.state='error'}finally{btn.disabled=false}});
 $('#removeStudioLogo')?.addEventListener('click',async()=>{const status=$('#studioLogoStatus');try{await checkAdmin();const {error}=await db.from('studio_settings').delete().eq('id',1);if(error)throw error;const img=$('#studioLogoPreview');if(img)img.hidden=true;status.textContent='Логотип удалён. Будет показан текстовый вариант.';status.dataset.state='success'}catch(e){status.textContent=e.message;status.dataset.state='error'}});
 // Dynamic game catalogue and release calendar (Supabase-backed).
 let gameRows=[],releaseRows=[],editingGameId=null,editingReleaseId=null;
 const gameStatusLabel={in_development:'В разработке',coming_soon:'Скоро',released:'Вышла',paused:'Приостановлена',cancelled:'Отменена'};
 const releaseStatusLabel={planned:'Запланирован',released:'Вышел',delayed:'Перенесён',cancelled:'Отменён'};
 function dateLabel(v){if(!v)return 'Дата уточняется';const d=new Date(v+'T00:00:00');return Number.isNaN(d.getTime())?v:d.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'})}
 function slugify(v){return v.toLowerCase().trim().replace(/[^a-z0-9а-яё]+/gi,'-').replace(/[а-яё]/gi,c=>({'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'}[c]||c)).replace(/^-|-$/g,'')}
 function gameFeedback(m,ok=false){const e=$('#gameStatusMessage');if(e){e.textContent=m;e.dataset.state=ok?'success':'error'}}
 function releaseFeedback(m,ok=false){const e=$('#releaseStatusMessage');if(e){e.textContent=m;e.dataset.state=ok?'success':'error'}}
 async function loadGames(){if(!isRemote)return;const {data,error}=await db.from('games').select('*').order('created_at',{ascending:false});if(error)throw error;gameRows=data||[];renderGamesAdmin();renderGameSelect();renderPublicGames();['#postGame','#mediaGameSelect'].forEach(sel=>{const el=$(sel);if(el){const val=el.value;el.innerHTML='<option value="">Без привязки / выберите игру</option>'+gameRows.map(g=>`<option value="${g.id}">${esc(g.title)}</option>`).join('');if(gameRows.some(g=>String(g.id)===val))el.value=val}})}
 async function loadReleases(){if(!isRemote)return;const {data,error}=await db.from('game_releases').select('*,games(title,slug)').order('release_date',{ascending:true});if(error)throw error;releaseRows=data||[];renderReleasesAdmin();renderPublicReleases()}
 function renderGamesAdmin(){const el=$('#adminGamesList');if(!el)return;el.innerHTML=gameRows.map(g=>`<div class="admin-item"><div class="admin-item-copy"><strong>${esc(g.title)}</strong><small>${esc(g.genre||'Без жанра')} · ${gameStatusLabel[g.status]||g.status} · ${dateLabel(g.release_date)}</small></div><div class="admin-item-actions"><button class="admin-btn secondary" data-game-edit="${g.id}">ИЗМЕНИТЬ</button><button class="admin-btn danger" data-game-del="${g.id}">УДАЛИТЬ</button></div></div>`).join('')||'<p class="notice">Игр пока нет. Создайте первую запись выше.</p>';
 el.querySelectorAll('[data-game-edit]').forEach(b=>b.onclick=()=>{const g=gameRows.find(x=>String(x.id)===b.dataset.gameEdit);if(!g)return;editingGameId=g.id;$('#gameTitle').value=g.title||'';$('#gameSlug').value=g.slug||'';$('#gameGenre').value=g.genre||'';$('#gameStatus').value=g.status||'in_development';$('#gameReleaseDate').value=g.release_date||'';$('#gamePlatforms').value=(g.platforms||[]).join(', ');$('#gameDescription').value=g.description||'';$('#gameDetailTitle').value=g.detail_title||'';$('#gameLongDescription').value=g.long_description||'';$('#gameSectionsText').value=(Array.isArray(g.detail_sections)?g.detail_sections:[]).map(x=>(x.title||'')+' | '+(x.body||'')).join('\n');$('#gameVisible').checked=g.is_visible!==false;const cp=$('#gameCoverPreview');if(cp){cp.src=g.cover_url||'';cp.hidden=!g.cover_url}$('#saveGame').textContent='СОХРАНИТЬ ИЗМЕНЕНИЯ';$('#gameManager').scrollIntoView({behavior:'smooth'})});
 el.querySelectorAll('[data-game-del]').forEach(b=>b.onclick=async()=>{const g=gameRows.find(x=>String(x.id)===b.dataset.gameDel);if(!g||!confirm(`Удалить игру «${g.title}»? Связанные релизы также будут удалены.`))return;try{const {error}=await db.from('games').delete().eq('id',g.id);if(error)throw error;await loadGames();await loadReleases();gameFeedback('Игра удалена.',true)}catch(e){gameFeedback(e.message)}})}
 function renderGameSelect(){const el=$('#releaseGame');if(el)el.innerHTML=gameRows.map(g=>`<option value="${g.id}">${esc(g.title)}</option>`).join('')||'<option value="">Сначала добавьте игру</option>'}
 function renderReleasesAdmin(){const el=$('#adminReleasesList');if(!el)return;el.innerHTML=releaseRows.map(r=>`<div class="admin-item"><div class="admin-item-copy"><strong>${esc(r.title||r.games?.title||'Релиз')}</strong><small>${dateLabel(r.release_date)} · ${releaseStatusLabel[r.status]||r.status} · ${esc(r.platforms||'')}</small><small>${esc(r.note||'')}</small></div><div class="admin-item-actions"><button class="admin-btn secondary" data-release-edit="${r.id}">ИЗМЕНИТЬ</button><button class="admin-btn danger" data-release-del="${r.id}">УДАЛИТЬ</button></div></div>`).join('')||'<p class="notice">Релизов пока нет.</p>';
 el.querySelectorAll('[data-release-edit]').forEach(b=>b.onclick=()=>{const r=releaseRows.find(x=>String(x.id)===b.dataset.releaseEdit);if(!r)return;editingReleaseId=r.id;$('#releaseGame').value=r.game_id;$('#releaseDate').value=r.release_date||'';$('#releaseStatus').value=r.status||'planned';$('#releasePlatforms').value=r.platforms||'';$('#releaseNote').value=r.note||'';$('#saveRelease').textContent='СОХРАНИТЬ ИЗМЕНЕНИЯ';$('#releaseManager').scrollIntoView({behavior:'smooth'})});
 el.querySelectorAll('[data-release-del]').forEach(b=>b.onclick=async()=>{if(!confirm('Удалить эту запись о релизе?'))return;try{const {error}=await db.from('game_releases').delete().eq('id',b.dataset.releaseDel);if(error)throw error;await loadReleases();releaseFeedback('Запись удалена.',true)}catch(e){releaseFeedback(e.message)}})}
 function renderPublicGames(){const el=$('#gamesCatalog');if(!el||!gameRows.length)return;const visible=gameRows.filter(g=>g.is_visible!==false);el.innerHTML=visible.map(g=>`<article class="project-feature"><a class="project-art" href="${g.slug==='sector-7'?'sector-7.html':'games.html#'+encodeURIComponent(g.slug)}" ${g.cover_url?`style="background-image:linear-gradient(0deg,rgba(0,0,0,.25),rgba(0,0,0,.05)),url('${esc(g.cover_url)}');background-size:cover;background-position:center"`:''}><span class="art-corner">UFILAG ORIGINAL</span></a><div class="project-info"><div class="eyebrow">${esc(g.genre||'UFILAG GAME')}</div><h3>${esc(g.title)}</h3><p class="lead">${esc(g.description||'')}</p><div class="status">● ${gameStatusLabel[g.status]||esc(g.status)}${g.release_date?' · '+dateLabel(g.release_date):''}</div><p class="notice">${esc((g.platforms||[]).join(' · '))}</p><button class="admin-btn secondary" type="button" data-favorite-game="${g.id}">♡ В ИЗБРАННОЕ</button><a class="btn" href="${g.slug==='sector-7'?'sector-7.html':'games.html#'+encodeURIComponent(g.slug)}">ПОДРОБНЕЕ ↗</a></div></article>`).join('')||'<p class="empty-state">Скоро здесь появятся новые игры UFILAG.</p>'}
 function renderPublicReleases(){const el=$('#publicReleases');if(!el)return;const rows=releaseRows.filter(r=>r.status!=='cancelled');el.innerHTML=rows.map(r=>`<article class="rn-card"><div class="rn-copy"><div class="rn-meta">${releaseStatusLabel[r.status]||r.status} · ${dateLabel(r.release_date)}</div><h3>${esc(r.title||r.games?.title||'Релиз UFILAG')}</h3><p>${esc(r.note||'')}</p><span class="rn-read">${esc(r.platforms||'Платформы уточняются')}</span></div></article>`).join('')||'<p class="empty-state">Даты будущих релизов скоро появятся.</p>'}
 $('#saveGame')?.addEventListener('click',async()=>{const b=$('#saveGame');b.disabled=true;try{await checkAdmin();const title=$('#gameTitle').value.trim();if(!title)throw Error('Введите название игры.');const slug=($('#gameSlug').value.trim()||slugify(title));if(!/^[a-z0-9-]+$/.test(slug))throw Error('Идентификатор должен содержать только латинские буквы, цифры и дефис.');const file=$('#gameCover').files[0];let cover_url=null;if(file){if(file.size>8*1024*1024)throw Error('Обложка больше 8 МБ.');cover_url=await uploadImage(file)}const row={title,slug,genre:$('#gameGenre').value.trim(),status:$('#gameStatus').value,release_date:$('#gameReleaseDate').value||null,platforms:$('#gamePlatforms').value.split(',').map(x=>x.trim()).filter(Boolean),description:$('#gameDescription').value.trim(),detail_title:$('#gameDetailTitle').value.trim(),long_description:$('#gameLongDescription').value.trim(),detail_sections:$('#gameSectionsText').value.split('\n').map(line=>{const i=line.indexOf('|');return i<0?null:{title:line.slice(0,i).trim(),body:line.slice(i+1).trim()}}).filter(x=>x&&(x.title||x.body)),is_visible:$('#gameVisible').checked,updated_at:new Date().toISOString()};if(cover_url)row.cover_url=cover_url;let result;if(editingGameId)result=await db.from('games').update(row).eq('id',editingGameId);else{row.author_id=adminUser.id;result=await db.from('games').insert(row)}if(result.error)throw result.error;gameFeedback(editingGameId?'Изменения игры сохранены.':'Игра добавлена в каталог.',true);resetGameForm();await loadGames()}catch(e){gameFeedback(e.message)}finally{b.disabled=false}});
 function resetGameForm(){editingGameId=null;['#gameTitle','#gameSlug','#gameGenre','#gameReleaseDate','#gamePlatforms','#gameDescription','#gameDetailTitle','#gameLongDescription','#gameSectionsText','#gameCover'].forEach(x=>{const e=$(x);if(e)e.value=''});$('#gameStatus').value='in_development';$('#gameVisible').checked=true;$('#saveGame').textContent='СОХРАНИТЬ ИГРУ'}
 $('#resetGame')?.addEventListener('click',resetGameForm);$('#gameTitle')?.addEventListener('input',()=>{if(!editingGameId&&!$('#gameSlug').value)$('#gameSlug').value=slugify($('#gameTitle').value)});
 $('#saveRelease')?.addEventListener('click',async()=>{const b=$('#saveRelease');b.disabled=true;try{await checkAdmin();const game_id=$('#releaseGame').value,release_date=$('#releaseDate').value;if(!game_id)throw Error('Сначала добавьте игру.');if(!release_date)throw Error('Укажите дату релиза.');const game=gameRows.find(g=>String(g.id)===game_id);const row={game_id,title:game?.title||'',release_date,status:$('#releaseStatus').value,platforms:$('#releasePlatforms').value.trim(),note:$('#releaseNote').value.trim(),updated_at:new Date().toISOString()};const result=editingReleaseId?await db.from('game_releases').update(row).eq('id',editingReleaseId):await db.from('game_releases').insert(row);if(result.error)throw result.error;releaseFeedback(editingReleaseId?'Дата и данные релиза обновлены.':'Релиз добавлен в календарь.',true);editingReleaseId=null;$('#releaseDate').value='';$('#releasePlatforms').value='';$('#releaseNote').value='';$('#releaseStatus').value='planned';$('#saveRelease').textContent='СОХРАНИТЬ РЕЛИЗ';await loadReleases()}catch(e){releaseFeedback(e.message)}finally{b.disabled=false}});
 $('#resetRelease')?.addEventListener('click',()=>{editingReleaseId=null;$('#releaseDate').value='';$('#releasePlatforms').value='';$('#releaseNote').value='';$('#releaseStatus').value='planned';$('#saveRelease').textContent='СОХРАНИТЬ РЕЛИЗ'});
 // Accounts: Supabase Auth with registration, login, profile editing and password recovery.
 const accountStatus=$('#accountStatus'),setAccountMsg=m=>{if(accountStatus)accountStatus.textContent=m};
 const accountError=e=>{const m=e?.message||'Не удалось выполнить действие. Попробуйте ещё раз.';return m.includes('Invalid login credentials')?'Неверная почта или пароль.':m.includes('User already registered')?'Этот адрес уже зарегистрирован. Попробуйте войти.':m.includes('Email not confirmed')?'Подтвердите электронную почту по ссылке из письма.':m};
 async function signIn(email,password){if(!isRemote)throw Error('Сервис аккаунтов пока не подключён. Проверьте настройки Supabase в assets/config.js.');const {data,error}=await db.auth.signInWithPassword({email,password});if(error)throw error;return data}
 const accountCreate=$('#createAccount'),accountLogin=$('#accountSignIn'),accountSave=$('#saveProfile'),accountLogout=$('#accountSignOut'),accountReset=$('#resetPassword');
 accountCreate?.addEventListener('click',async()=>{try{const name=$('#accountName').value.trim(),email=$('#accountEmail').value.trim(),password=$('#accountPassword').value;if(!name||!email||password.length<8)throw Error('Укажите имя, электронную почту и пароль не короче 8 символов.');if(!isRemote)throw Error('Supabase не подключён. Проверьте URL и публичный ключ в assets/config.js.');const {data,error}=await db.auth.signUp({email,password,options:{data:{display_name:name}}});if(error)throw error;if(data.session){setAccountMsg('Аккаунт создан. Вход сохранён на этом устройстве.');await loadAccountProfile();await loadCommunityDashboard()}else{setAccountMsg('Аккаунт создан. Подтвердите почту по ссылке из письма. После подтверждения войдите — профиль будет доступен на этом и других устройствах.')} }catch(e){setAccountMsg(accountError(e))}});
 accountLogin?.addEventListener('click',async()=>{try{await signIn($('#accountEmail').value.trim(),$('#accountPassword').value);setAccountMsg('Вы успешно вошли в аккаунт.');await loadAccountProfile();await loadCommunityDashboard()}catch(e){setAccountMsg(accountError(e))}});
 accountSave?.addEventListener('click',async()=>{try{const name=$('#accountName').value.trim();if(!name)throw Error('Введите имя пользователя.');const {data:{user}}=await db.auth.getUser();if(!user)throw Error('Сначала войдите в аккаунт.');const {error:authError}=await db.auth.updateUser({data:{display_name:name}});if(authError)throw authError;const {error}=await db.from('profiles').upsert({id:user.id,display_name:name},{onConflict:'id'});if(error)throw error;setAccountMsg('Имя профиля сохранено.');}catch(e){setAccountMsg(accountError(e))}});
 accountReset?.addEventListener('click',async()=>{try{const email=$('#accountEmail').value.trim();if(!email)throw Error('Сначала укажите электронную почту.');if(!isRemote)throw Error('Supabase не подключён.');const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});if(error)throw error;setAccountMsg('Если аккаунт с такой почтой существует, на неё придёт письмо для сброса пароля.')}catch(e){setAccountMsg(accountError(e))}});
 accountLogout?.addEventListener('click',async()=>{try{if(db)await db.auth.signOut();setAccountMsg('Вы вышли из аккаунта.');if(accountCreate)accountCreate.hidden=false;if(accountLogin)accountLogin.hidden=false;if(accountSave)accountSave.hidden=true;if(accountLogout)accountLogout.style.display='none';if(accountReset)accountReset.style.display='inline-block';if($('#accountPassword'))$('#accountPassword').closest('.field').hidden=false;if($('#accountHeading'))$('#accountHeading').textContent='РЕГИСТРАЦИЯ';if($('#accountIntro'))$('#accountIntro').textContent='Зарегистрируйся с помощью электронной почты. Аккаунт будет доступен на всех устройствах.'}catch(e){setAccountMsg(accountError(e))}});
 async function loadAccountProfile(){
  if(!$('#accountBox')||!isRemote)return;
  const {data:{session},error:sessionError}=await db.auth.getSession();
  if(sessionError)throw sessionError;const user=session?.user;if(!user)return;
  let profile=null;const result=await db.from('profiles').select('display_name').eq('id',user.id).maybeSingle();
  if(result.error){console.warn('UFILAG profile row:',result.error.message)}else profile=result.data;
  $('#accountHeading').textContent='ТВОЙ ПРОФИЛЬ';$('#accountIntro').textContent='Вы вошли как '+user.email;
  $('#accountName').value=profile?.display_name||user.user_metadata?.display_name||'';
  $('#accountName').closest('.field').querySelector('span').textContent='Имя пользователя';
  if(accountCreate)accountCreate.hidden=true;if(accountLogin)accountLogin.hidden=true;if(accountSave)accountSave.hidden=false;
  if(accountLogout)accountLogout.style.display='inline-block';if(accountReset)accountReset.style.display='none';
  const pass=$('#accountPassword');if(pass)pass.closest('.field').hidden=true;
 }
 async function loadCommunityDashboard(){
  const box=$('#communityDashboard');if(!box||!isRemote)return;
  const {data:{session}}=await db.auth.getSession();const user=session?.user;if(!user)return;box.hidden=false;
  const safeQuery=async(q)=>{const r=await q;return r.error?{data:[],error:r.error}:r};
  const [fav,notes,comments]=await Promise.all([
   safeQuery(db.from('user_favorites').select('game_id,games(title,slug)').eq('user_id',user.id).order('created_at',{ascending:false})),
   safeQuery(db.from('user_notifications').select('id,title,message,is_read,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(20)),
   safeQuery(db.from('content_comments').select('id,body,created_at,content(title)').eq('user_id',user.id).order('created_at',{ascending:false}).limit(20))
  ]);
  const fe=$('#favoriteGames');if(fe)fe.innerHTML=(fav.data||[]).map(x=>`<div class="community-row"><strong>${esc(x.games?.title||'Игра')}</strong><a href="games.html#${encodeURIComponent(x.games?.slug||'')}">ОТКРЫТЬ ↗</a></div>`).join('')||'<p class="notice">Пока нет сохранённых игр.</p>';
  const ne=$('#userNotifications');if(ne)ne.innerHTML=(notes.data||[]).map(x=>`<div class="community-row"><div><strong>${esc(x.title)}</strong><p>${esc(x.message||'')}</p><small>${new Date(x.created_at).toLocaleString('ru-RU')}</small></div>${x.is_read?'':'<span class="notice">НОВОЕ</span>'}</div>`).join('')||'<p class="notice">Новых событий пока нет.</p>';
  const ce=$('#myComments');if(ce)ce.innerHTML=(comments.data||[]).map(x=>`<div class="community-row"><div><strong>${esc(x.content?.title||'Публикация')}</strong><p>${esc(x.body)}</p></div></div>`).join('')||'<p class="notice">Ты ещё не оставлял комментариев.</p>';
  [fav,notes,comments].forEach((r)=>{if(r.error)console.warn('UFILAG community section:',r.error.message)});
  if(notes.data?.length)await db.from('user_notifications').update({is_read:true}).eq('user_id',user.id).eq('is_read',false);
 }
 if($('#accountBox')&&isRemote){db.auth.getSession().then(({data,error})=>{if(error)throw error;if(data.session){loadAccountProfile().catch(e=>setAccountMsg('Не удалось загрузить профиль: '+e.message));loadCommunityDashboard().catch(e=>console.warn('UFILAG dashboard:',e.message))}}).catch(e=>setAccountMsg('Не удалось восстановить вход: '+e.message));db.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_IN'||event==='TOKEN_REFRESHED'){setTimeout(()=>{loadAccountProfile().catch(e=>setAccountMsg('Ошибка профиля: '+e.message));loadCommunityDashboard().catch(e=>console.warn('UFILAG dashboard:',e.message))},0)}else if(event==='SIGNED_OUT'){if($('#communityDashboard'))$('#communityDashboard').hidden=true}})}
 // Community actions: authenticated favorites and article comments.
 document.addEventListener('click',async e=>{const b=e.target.closest('[data-favorite-game]');if(!b)return;e.preventDefault();try{if(!isRemote)throw Error('Подключите Supabase.');const {data:{user}}=await db.auth.getUser();if(!user){location.href='profile.html';return}const id=b.dataset.favoriteGame;const {data,error:q}=await db.from('user_favorites').select('game_id').eq('user_id',user.id).eq('game_id',id).maybeSingle();if(q)throw q;if(data){const {error}=await db.from('user_favorites').delete().eq('user_id',user.id).eq('game_id',id);if(error)throw error;b.textContent='♡ В ИЗБРАННОЕ'}else{const {error}=await db.from('user_favorites').insert({user_id:user.id,game_id:id});if(error)throw error;b.textContent='♥ В ИЗБРАННОМ'}}catch(err){alert(err.message)}});
 async function renderArticleComments(id){const el=$('#articleComments');if(!el||!isRemote)return;const {data,error}=await db.from('content_comments').select('id,body,created_at,user_id').eq('content_id',id).order('created_at',{ascending:true});if(error){el.textContent=error.message;return}el.innerHTML=(data||[]).map(c=>`<div class="community-row"><div><strong>${'Игрок UFILAG'}</strong><p>${esc(c.body)}</p><small>${new Date(c.created_at).toLocaleString('ru-RU')}</small></div></div>`).join('')||'<p class="notice">Пока нет комментариев. Будь первым!</p>'}
 if($('#articleComments'))renderArticleComments(decodeURIComponent(location.hash.slice(1)));
 // The article view is injected asynchronously by renderAll(), so bind comment submission via delegation.
 document.addEventListener('click',async e=>{const button=e.target.closest('#sendComment');if(!button)return;const status=$('#commentStatus'),input=$('#newCommentText'),body=input?.value.trim()||'',id=decodeURIComponent(location.hash.slice(1));button.disabled=true;try{if(!isRemote)throw Error('Комментарии недоступны: Supabase не подключён.');if(!id)throw Error('Не удалось определить публикацию. Откройте новость ещё раз.');if(!body||body.length>2000)throw Error('Введите комментарий от 1 до 2000 символов.');const {data:{user},error:authError}=await db.auth.getUser();if(authError)throw authError;if(!user){if(status)status.textContent='Чтобы комментировать, войдите в аккаунт.';location.href='profile.html';return}const {data,error}=await db.from('content_comments').insert({content_id:id,user_id:user.id,body}).select('id').single();if(error)throw error;if(!data?.id)throw Error('Supabase не подтвердил сохранение комментария.');input.value='';if(status)status.textContent='Комментарий сохранён.';await renderArticleComments(id)}catch(err){if(status)status.textContent=commentErrorMessage(err)}finally{button.disabled=false}});
 function commentErrorMessage(err){const m=err?.message||'Не удалось отправить комментарий.';if(/content_comments.*does not exist|relation .*content_comments/i.test(m))return 'Таблица комментариев не создана. Выполните SUPABASE_V15_REPAIR.sql.';if(/row-level security|permission denied|violates row-level security/i.test(m))return 'Supabase запретил запись. Выполните SUPABASE_V15_REPAIR.sql и проверьте вход в аккаунт.';if(/invalid input syntax for type uuid/i.test(m))return 'У публикации некорректный идентификатор. Обновите список новостей.';return m}

 // Admin login is server-authenticated; authorization is checked against profiles.role.
 let adminUser=null;
 async function checkAdmin(){if(!isRemote)throw Error('Supabase не подключён. Проверьте настройки assets/config.js.');const {data:{user},error}=await db.auth.getUser();if(error||!user)throw Error('Войдите в аккаунт администратора UFILAG.');const {data:profile,error:pe}=await db.from('profiles').select('role').eq('id',user.id).single();if(pe||profile?.role!=='admin')throw Error('У этого аккаунта нет прав администратора. Назначьте роль admin в Supabase.');adminUser=user;return user}
 function revealAdminShortcut(){if(document.querySelector('.admin-float'))return;const a=document.createElement('a');a.className='admin-float';a.href='admin.html';a.innerHTML='<span>✦</span> ADMIN DESK';a.setAttribute('aria-label','Open UFILAG admin dashboard');document.body.appendChild(a)}
 if(isRemote){db.auth.getUser().then(async({data})=>{if(!data.user)return;const {data:p}=await db.from('profiles').select('role').eq('id',data.user.id).maybeSingle();if(p?.role==='admin')revealAdminShortcut()}).catch(()=>{});db.auth.onAuthStateChange((_event,session)=>{if(session?.user){db.from('profiles').select('role').eq('id',session.user.id).maybeSingle().then(({data:p})=>{if(p?.role==='admin')revealAdminShortcut()})}else document.querySelector('.admin-float')?.remove()})}
 
 const adminLogin=$('#adminLogin'),adminApp=$('#adminApp'),adminMsg=$('#adminMessage');
 let adminRows=[],editingId=null;
 function paintAdminList(){
  const el=$('#adminPosts');if(!el)return;
  const q=($('#adminSearch')?.value||'').trim().toLowerCase(),filter=$('#adminFilter')?.value||'all';
  const rows=adminRows.filter(p=>(filter==='all'||p.type===filter)&&(!q||`${p.title} ${p.category} ${p.summary}`.toLowerCase().includes(q)));
  el.innerHTML=rows.map(p=>`<article class="admin-item admin-content-item"><div class="admin-item-copy"><strong>${esc(p.title)}</strong><small>${({news:'НОВОСТЬ',announcement:'АНОНС',devlog:'ДНЕВНИК РАЗРАБОТКИ',article:'СТАТЬЯ',update:'ОБНОВЛЕНИЕ СТУДИИ',trailer:'ТРЕЙЛЕР'}[p.type]||p.type)} · ${esc(p.category||'Без категории')} · ${p.published?'ОПУБЛИКОВАНО':'ЧЕРНОВИК'} ${p.featured?'· НА ГЛАВНОЙ':''}</small><small>${new Date(p.created_at).toLocaleString()}</small></div><div class="admin-item-actions"><button class="admin-btn secondary" data-edit="${p.id}" >ИЗМЕНИТЬ</button><button class="admin-btn danger" data-delete="${p.id}">УДАЛИТЬ</button></div></article>`).join('')||'<p class="notice">Ничего не найдено. Измените фильтр или создайте публикацию.</p>';
  el.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',async()=>{
   const row=adminRows.find(x=>String(x.id)===b.dataset.delete);if(!row)return;
   if(!confirm(`Удалить публикацию «${row.title}»? Это действие нельзя отменить.`))return;
   b.disabled=true;b.textContent='УДАЛЕНИЕ…';
   try{const {data,error}=await db.from('content').delete().eq('id',row.id).select('id');if(error)throw error;if(!data?.length)throw Error('Supabase did not delete the row. Check the admin role and УДАЛИТЬ policy (RLS).');adminRows=adminRows.filter(x=>String(x.id)!==String(row.id));paintAdminList();await refreshContent();setAdminFeedback('Публикация успешно удалена.','success')}catch(e){b.disabled=false;b.textContent='УДАЛИТЬ';setAdminFeedback(e.message,'error')}
  }));
  el.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>{
   const p=adminRows.find(x=>String(x.id)===b.dataset.edit);if(!p)return;editingId=p.id;
   $('#contentType').value=p.type;$('#postCategory').value=p.category||'Development Update';$('#postTitle').value=p.title||'';$('#postSummary').value=p.summary||'';$('#postBody').value=p.body||'';$('#postVideo').value=p.video_url||'';if($('#postGame'))$('#postGame').value=p.game_id||'';if($('#postButtonLabel'))$('#postButtonLabel').value=p.button_label||'';if($('#postButtonUrl'))$('#postButtonUrl').value=p.button_url||'';$('#postFeatured').checked=!!p.featured;
   $('#editorHeading').textContent='EDIT PUBLICATION';$('#publishPost').textContent='СОХРАНИТЬ ИЗМЕНЕНИЯ';$('#publishStatus').textContent='Editing existing publication. Select a new cover only if you want to replace it.';
   document.querySelector('.admin-editor')?.scrollIntoView({behavior:'smooth',block:'start'});
  }));
 }
 function setAdminFeedback(message,type=''){const el=$('#publishStatus');if(el){el.textContent=message;el.dataset.state=type}}
 async function loadAdmin(){const {data,error}=await db.from('content').select('*').order('created_at',{ascending:false});if(error)throw error;adminRows=data||[];paintAdminList()}
 $('#adminSearch')?.addEventListener('input',paintAdminList);$('#adminFilter')?.addEventListener('change',paintAdminList);
  $('#adminEnter')?.addEventListener('click',async()=>{try{if(!isRemote)throw Error('Supabase не подключён. Проверьте Project URL и публичный ключ в assets/config.js.');await signIn($('#adminEmail').value.trim(),$('#adminPassword').value);await checkAdmin();adminLogin.hidden=true;adminApp.hidden=false;await loadAdmin();await loadGames();await loadReleases();await renderGalleryAdmin()}catch(e){if(adminMsg)adminMsg.textContent=e.message}});
 $('#logoutAdmin')?.addEventListener('click',async()=>{if(db)await db.auth.signOut();location.reload()});
 async function uploadImage(file){if(!file)return null;if(file.size>8*1024*1024)throw Error('Изображение больше 8 МБ.');if(!isRemote){if(file.size>1400000)throw Error('Local demo images must be smaller than 1.4 MB.');return await new Promise((resolve,reject)=>{let r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}let ext=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'');let path=`${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;const {error}=await db.storage.from('ufilag-media').upload(path,file,{upsert:false,contentType:file.type});if(error)throw error;const {data}=db.storage.from('ufilag-media').getPublicUrl(path);return data.publicUrl}
 async function uploadVideo(file){
  if(!file)return null;if(!isRemote)throw Error('Сначала подключите Supabase.');
  if(file.size>50*1024*1024)throw Error('Видео больше 50 МБ. Используйте YouTube/Vimeo или сожмите файл.');
  const extByName=(file.name.split('.').pop()||'').toLowerCase();const ext=file.type==='video/webm'||extByName==='webm'?'webm':file.type==='video/mp4'||extByName==='mp4'?'mp4':'';if(!ext)throw Error('Поддерживаются только файлы MP4 и WebM.');
  const mime=ext==='webm'?'video/webm':'video/mp4';const path=`videos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const {error}=await db.storage.from('ufilag-media').upload(path,file,{upsert:false,contentType:mime});
  if(error)throw error;return db.storage.from('ufilag-media').getPublicUrl(path).data.publicUrl;
 }

 $('#saveGameCoverMedia')?.addEventListener('click',async()=>{const status=$('#bannerStatus');try{await checkAdmin();const game=gameRows.find(g=>String(g.id)===$('#mediaGameSelect')?.value);if(!game)throw Error('Выберите игру.');const file=$('#gameCoverUpload')?.files[0];if(!file)throw Error('Выберите изображение обложки.');const url=await uploadImage(file);const {error}=await db.from('games').update({cover_url:url,updated_at:new Date().toISOString()}).eq('id',game.id);if(error)throw error;$('#gameCoverUpload').value='';status.textContent='Обложка игры обновлена.';status.dataset.state='success';await loadGames()}catch(e){status.textContent=e.message;status.dataset.state='error'}});
 $('#saveGameBanner')?.addEventListener('click',async()=>{
  const btn=$('#saveGameBanner'),status=$('#bannerStatus');btn.disabled=true;btn.textContent='ЗАГРУЗКА…';
  try{
   await checkAdmin();const selectedGame=gameRows.find(g=>String(g.id)===$('#mediaGameSelect')?.value);if(!selectedGame)throw Error('Выберите игру для баннера.');const file=$('#gameBannerUpload')?.files[0];if(!file)throw Error('Сначала выберите файл баннера.');
   if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Выберите JPG, PNG или WebP.');
   if(file.size>8*1024*1024)throw Error('Баннер больше 8 МБ.');
   status.textContent='Загружаем изображение…';
   const url=await uploadImage(file);
   const {error}=await db.from('game_settings').upsert({game_slug:selectedGame.slug,banner_url:url,updated_at:new Date().toISOString()},{onConflict:'game_slug'});
   if(error)throw error;
   status.textContent='Баннер сохранён. Откройте страницу SECTOR 7 и обновите её.';status.dataset.state='success';$('#gameBannerUpload').value='';
  }catch(e){
   let message=e.message||'Не удалось сохранить баннер.';
   if(/game_settings|relation .* does not exist/i.test(message))message='Таблица game_settings не создана. Выполните SUPABASE_V7_MIGRATION.sql в SQL Editor.';
   if(/row-level security|permission denied/i.test(message))message='Нет прав на запись. Проверьте роль admin и повторно выполните SUPABASE_V7_MIGRATION.sql.';
   status.textContent=message;status.dataset.state='error';
  }finally{btn.disabled=false;btn.textContent='ОБНОВИТЬ БАННЕР'}
 });
 async function renderGameBanner(){
  const hero=document.querySelector('[data-game-banner]');
  const artPanel=document.querySelector('.sector7-art-panel');
  if(!hero&&!artPanel)return;
  // Локальный арт остаётся видимым даже при временной недоступности Supabase.
  const applyImage=(el,url,overlay)=>{
   if(!el||!url)return;
   const safe=String(url).replace(/[\"\\]/g,'');
   el.style.backgroundImage=`${overlay||'linear-gradient(0deg,rgba(3,7,10,.16),rgba(3,7,10,.03))'},url("${safe}")`;
   el.style.backgroundSize='cover';el.style.backgroundPosition='center';el.classList.add('has-custom-art');
  };
  if(!isRemote)return;
  try{
   const [settings,game]=await Promise.all([
    db.from('game_settings').select('banner_url').eq('game_slug','sector-7').maybeSingle(),
    db.from('games').select('title,description,status,cover_url,detail_title,long_description,detail_sections').eq('slug','sector-7').maybeSingle()
   ]);
   if(settings.error)throw settings.error;
   if(game.error)throw game.error;
   const g=game.data||{};
   if(g.title){const t=$('#sector7Title');if(t)t.textContent=g.title}
   if(g.description){const d=$('#sector7Description');if(d)d.textContent=g.description}if(g.detail_title){const t=$('#gameDetailTitlePublic');if(t)t.textContent=g.detail_title}if(g.long_description){const d=$('#gameLongDescriptionPublic');if(d)d.textContent=g.long_description}if(Array.isArray(g.detail_sections)){const box=$('#gameDetailSections');if(box)box.innerHTML=g.detail_sections.map(x=>`<section class="game-detail-section"><h3>${esc(x.title||'')}</h3><p>${esc(x.body||'')}</p></section>`).join('')}
   if(g.status){const st=$('#sector7Status');if(st)st.textContent='UFILAG ORIGINAL • '+g.status.toUpperCase().replaceAll('_',' ')}
   // Баннер управляет верхним hero, а cover_url — большой обложкой в блоке проекта.
   // Если заполнено только одно поле, используем его в обоих местах, чтобы новая картинка
   // не оставалась незаметной на странице игры.
   const banner=settings.data?.banner_url||g.cover_url||'assets/sector7-hospital.jpg';
   const cover=g.cover_url||settings.data?.banner_url||'assets/sector7-cover.jpg';
   applyImage(hero,banner,'linear-gradient(90deg,rgba(3,7,10,.84),rgba(3,7,10,.22))');
   applyImage(artPanel,cover,'linear-gradient(0deg,rgba(3,7,10,.16),rgba(3,7,10,.03))');
  }catch(e){
   console.warn('SECTOR 7 game details:',e.message);
   // Даже если таблица настроек недоступна, пробуем взять cover_url игры отдельно.
   try{const {data}=await db.from('games').select('cover_url').eq('slug','sector-7').maybeSingle();if(data?.cover_url){applyImage(hero,data.cover_url,'linear-gradient(90deg,rgba(3,7,10,.84),rgba(3,7,10,.22))');applyImage(artPanel,data.cover_url)}}catch(_){/* локальная обложка остаётся */}
  }
 }
 $('#publishPost')?.addEventListener('click',async()=>{
  const btn=$('#publishPost');btn.disabled=true;const oldLabel=btn.textContent;btn.textContent=editingId?'СОХРАНЕНИЕ…':'ПУБЛИКАЦИЯ…';
  try{
   await checkAdmin();let type=$('#contentType').value,title=$('#postTitle').value.trim(),summary=$('#postSummary').value.trim(),body=$('#postBody').value.trim(),video=$('#postVideo').value.trim();
   if(!title||!summary)throw Error('Заполните заголовок и краткое описание.');
   if(type==='trailer'&&!video&&!$('#postVideoFile')?.files[0])throw Error('Добавьте ссылку YouTube/Vimeo или выберите видеофайл.');
   const picked=$('#postImage').files[0],image=picked?await uploadImage(picked):null;const videoFile=$('#postVideoFile')?.files[0],uploadedVideo=videoFile?await uploadVideo(videoFile):null;
   let row={type,title,summary,body,category:type==='announcement'?'Анонс':type==='trailer'?'Трейлер':$('#postCategory').value,video_url:uploadedVideo||video||null,game_id:$('#postGame')?.value||null,button_label:$('#postButtonLabel')?.value.trim()||null,button_url:$('#postButtonUrl')?.value.trim()||null,featured:$('#postFeatured').checked,published:true};
   if(image)row.image_url=image;
   if(editingId){const {data,error}=await db.from('content').update(row).eq('id',editingId).select('id');if(error)throw error;if(!data?.length)throw Error('Изменение не сохранено. Проверьте права администратора (RLS).');setAdminFeedback('Изменения сохранены.','success')}
   else{row.author_id=adminUser.id;const {error}=await db.from('content').insert(row);if(error)throw error;setAdminFeedback('Публикация добавлена на сайт.','success')}
   resetEditor();await loadAdmin();await refreshContent();
  }catch(e){setAdminFeedback(e.message,'error')}
  finally{btn.disabled=false;btn.textContent=editingId?'СОХРАНИТЬ ИЗМЕНЕНИЯ':'ОПУБЛИКОВАТЬ'}
 });
 function resetEditor(){editingId=null;['#postTitle','#postSummary','#postBody','#postImage','#postVideo','#postVideoFile'].forEach(s=>{const el=$(s);if(el)el.value=''});$('#postFeatured').checked=false;$('#editorHeading').textContent='СОЗДАТЬ ПУБЛИКАЦИЮ';$('#publishPost').textContent='ОПУБЛИКОВАТЬ'}
 $('#clearPost')?.addEventListener('click',()=>{resetEditor();setAdminFeedback('Форма очищена.','')});
  $('#addGallery')?.addEventListener('click',async()=>{try{await checkAdmin();let file=$('#galleryUpload').files[0];if(!file)throw Error('Сначала выберите изображение.');const selectedGame=gameRows.find(g=>String(g.id)===$('#mediaGameSelect')?.value);if(!selectedGame)throw Error('Выберите игру для галереи.');let url=await uploadImage(file);const {error}=await db.from('game_media').insert({title:file.name,image_url:url,game_slug:selectedGame.slug});if(error)throw error;$('#galleryUpload').value='';alert('Изображение добавлено в галерею.');await renderGalleryAdmin()}catch(e){alert(e.message)}});
 async function renderGalleryAdmin(){if(!$('#adminGallery')||!isRemote)return;const {data,error}=await db.from('game_media').select('*').order('created_at',{ascending:false});if(error){$('#adminGallery').textContent=error.message;return}$('#adminGallery').innerHTML=(data||[]).map(x=>`<div class="admin-item"><span>${esc(x.title)}</span><button class="admin-btn secondary" data-gdelete="${x.id}">УДАЛИТЬ</button></div>`).join('');$('#adminGallery').querySelectorAll('[data-gdelete]').forEach(b=>b.onclick=async()=>{if(!confirm('Удалить изображение из галереи?'))return;b.disabled=true;const {data,error}=await db.from('game_media').delete().eq('id',b.dataset.gdelete).select('id');if(error||!data?.length){alert(error?.message||'Изображение не удалено. Проверьте права доступа (RLS).');b.disabled=false;return}await renderGalleryAdmin();await renderGallery()})}
 async function renderGallery(){const el=$('#gameGallery');if(!el)return;try{let urls;if(isRemote){const {data,error}=await db.from('game_media').select('image_url').eq('game_slug','sector-7').order('created_at',{ascending:false});if(error)throw error;urls=(data||[]).map(x=>x.image_url)}else urls=localRead('uf_gallery',[]);el.innerHTML=urls.length?urls.map(u=>`<img src="${esc(u)}" alt="UFILAG game media" loading="lazy">`).join(''):'<div class="empty-state" style="grid-column:1/-1">Official screenshots and artwork will appear here.</div>'}catch(e){el.innerHTML='<div class="empty-state">Gallery is not available yet.</div>'}}
 if(isRemote&&adminLogin){db.auth.getUser().then(async({data})=>{if(data.user){try{await checkAdmin();adminLogin.hidden=true;adminApp.hidden=false;await loadAdmin();await loadGames();await loadReleases();await renderGalleryAdmin()}catch(e){if(adminMsg)adminMsg.textContent=e.message}}})}
 refreshContent();renderGallery();renderGameBanner();renderFeaturedGame();if($('#gamesCatalog')||$('#publicReleases')){loadGames().catch(e=>console.warn('Games catalogue:',e.message));loadReleases().catch(e=>console.warn('Release calendar:',e.message))}
})();
