/* ===== Nav scroll effect ===== */
(function(){
  var ticking = false;
  window.addEventListener('scroll', function(){
    if (!ticking) {
      requestAnimationFrame(function(){
        var n = document.getElementById('topNav');
        if (n) { n.classList.toggle('top-nav-scrolled', window.scrollY > 20); }
        ticking = false;
      });
      ticking = true;
    }
  });
})();

/* ===== Dark mode toggle ===== */
window.toggleDark = function(){
  var h = document.documentElement;
  h.classList.toggle('dark');
  var d = h.classList.contains('dark');
  localStorage.setItem('theme', d ? 'dark' : 'light');
  var btn = document.getElementById('darkBtn');
  if (btn) {
    btn.innerHTML = d ? '<i class="ri-sun-line"></i>' : '<i class="ri-moon-line"></i>';
    btn.setAttribute('aria-label', d ? '切换到亮色主题' : '切换到暗色主题');
  }
};
// 初始化暗色模式图标
if (document.documentElement.classList.contains('dark')) {
  var darkBtn = document.getElementById('darkBtn');
  if (darkBtn) { darkBtn.innerHTML = '<i class="ri-sun-line"></i>'; }
}

/* ===== Mobile menu toggle ===== */
window.toggleMenu = function(){
  var m = document.getElementById('topNavMenu');
  var btn = document.getElementById('menuBtn');
  if (!m) return;
  m.classList.toggle('open');
  var open = m.classList.contains('open');
  btn.innerHTML = open ? '<i class="ri-close-line"></i>' : '<i class="ri-menu-3-line"></i>';
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  btn.setAttribute('aria-label', open ? '收起导航菜单' : '展开导航菜单');
  // 菜单打开时点击外部自动关闭
  if (open) {
    setTimeout(function(){
      document.addEventListener('click', function handler(e){
        if (!m.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
          m.classList.remove('open');
          btn.innerHTML = '<i class="ri-menu-3-line"></i>';
          btn.setAttribute('aria-expanded', 'false');
          btn.setAttribute('aria-label', '展开导航菜单');
          document.removeEventListener('click', handler);
        }
      });
    }, 10);
  }
};

/* ===== Email link fix ===== */
(function(){
  document.querySelectorAll('a[data-type="mail"]').forEach(function(a){
    var h = a.getAttribute('href');
    if (h && h.indexOf('mailto:') !== 0 && h.indexOf('http') !== 0) {
      a.href = 'mailto:' + h;
    }
  });
})();

/* ===== Mouse cursor effect ===== */
(function(){
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
  document.documentElement.classList.add('cursor-custom');

  var d = document.createElement('div'); d.id = 'cursor-dot';
  var r = document.createElement('div'); r.id = 'cursor-ring';
  document.body.appendChild(d); document.body.appendChild(r);

  var mx = 0, my = 0, rx = 0, ry = 0, vis = false;
  var rafId;

  function onMove(e) {
    if (!rafId) {
      rafId = requestAnimationFrame(function(){
        mx = e.clientX; my = e.clientY;
        d.style.left = mx + 'px'; d.style.top = my + 'px';
        if (!vis) {
          vis = true; rx = mx; ry = my;
          r.style.left = rx + 'px'; r.style.top = ry + 'px';
          d.classList.remove('hide'); r.classList.remove('hide');
        }
        rafId = null;
      });
    }
  }
  document.addEventListener('mousemove', onMove, { passive: true });

  (function anim(){
    rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
    r.style.left = rx + 'px'; r.style.top = ry + 'px';
    requestAnimationFrame(anim);
  })();

  document.addEventListener('mouseleave', function(){ d.classList.add('hide'); r.classList.add('hide'); vis = false; });
  document.addEventListener('mouseenter', function(){ d.classList.remove('hide'); r.classList.remove('hide'); });

  document.addEventListener('mouseover', function(e){
    var t = e.target.closest('a,button,input,textarea,select,[role="button"],[contenteditable]');
    if (t) { d.classList.add('hover'); r.classList.add('hover'); }
  });
  document.addEventListener('mouseout', function(e){
    var t = e.target.closest('a,button,input,textarea,select,[role="button"],[contenteditable]');
    if (t) { d.classList.remove('hover'); r.classList.remove('hover'); }
  });

  /* 打字时变🐟 */
  var fishTimer = null;
  document.addEventListener('keydown', function(e){
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey) return;
    d.classList.add('fish'); r.classList.add('fish'); d.textContent = '🐟';
    clearTimeout(fishTimer);
    fishTimer = setTimeout(function(){ d.classList.remove('fish'); r.classList.remove('fish'); d.textContent = ''; }, 800);
  });
})();

/* ===== Mouse trail particles (throttled) ===== */
(function(){
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
  var trailColors = ['#ff6b6b','#ffd93d','#6bcbff','#a5b4fc','#ff8aeb','#51cf66','#ff9f43','#f368e0'];
  var trailParticles = [], trailMax = 20;
  var lastTrail = 0;

  document.addEventListener('mousemove', function(e){
    var now = Date.now();
    if (now - lastTrail < 30) return; // throttle to ~33fps
    lastTrail = now;

    var p = document.createElement('div'); p.className = 'cursor-trail';
    var c = trailColors[Math.floor(Math.random() * trailColors.length)];
    var s = 2 + Math.random() * 3;
    p.style.cssText = 'position:fixed;pointer-events:none;z-index:99997;left:' + (e.clientX - s/2) + 'px;top:' + (e.clientY - s/2) + 'px;width:' + s + 'px;height:' + s + 'px;border-radius:50%;background:' + c + ';opacity:' + (0.5 + Math.random() * 0.5) + ';box-shadow:0 0 ' + (s*2) + 'px ' + c + ';';
    document.body.appendChild(p);
    trailParticles.push(p);
    if (trailParticles.length > trailMax) {
      var old = trailParticles.shift();
      if (old && old.parentNode) old.parentNode.removeChild(old);
    }
    setTimeout(function(){
      p.style.opacity = '0'; p.style.transform = 'scale(0)';
      p.style.transition = 'opacity .6s,transform .6s';
    }, 100);
    setTimeout(function(){ if (p.parentNode) p.parentNode.removeChild(p); }, 700);
  }, { passive: true });
})();

/* ===== Dynamic post-card animation delay ===== */
(function(){
  var cards = document.querySelectorAll('.post-card.animated, .post-card.fadeInUp');
  cards.forEach(function(card, i){
    card.style.animationDelay = (i * 0.05) + 's';
  });
})();

/* ===== Copy to clipboard ===== */
function copyToClipboard(t){
  if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t);
  var ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.left='-9999px';
  document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}document.body.removeChild(ta);
  return Promise.resolve();
}

/* ===== Page ready ===== */
function addLineNums(pre){
  var code=pre.querySelector('code');
  if(!code||code.lineNumbered)return;code.lineNumbered=true;
  var lines=code.textContent.split('\n');
  if(lines.length&&lines[0].trim()==='')lines.shift();
  if(lines.length&&lines[lines.length-1].trim()==='')lines.pop();
  if(lines.length<2)return;
  var nums=document.createElement('div');nums.className='line-numbers';
  for(var i=0;i<lines.length;i++){var s=document.createElement('span');s.textContent=i+1;nums.appendChild(s);}
  pre.insertBefore(nums,code);pre.classList.add('has-line-numbers');code.classList.add('has-line-numbers');
}

function enhanceCode(){
  var md=document.querySelector('.post-content,.markdown');
  var pres=md?md.querySelectorAll('pre'):[];

  /* 为 markdown 内容中的图片添加懒加载 */
  if (md) {
    md.querySelectorAll('img:not([loading])').forEach(function(img){
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
    });
  }

  /* PhotoSwipe */
  var pswp=document.querySelector('.pswp');
  if(pswp&&md){
    md.addEventListener('click',function(e){
      if(pswp.classList.contains('pswp--open'))return;
      var img=e.target.closest('img');if(!img)return;
      var imgs=Array.from(md.querySelectorAll('img')),idx=imgs.indexOf(img);
      var items=imgs.map(function(el){
        var s=el.getAttribute('data-src')||el.src;
        return{src:s,w:el.naturalWidth||el.width||1200,h:el.naturalHeight||el.height||800,title:el.getAttribute('alt')||''};
      });
      if(typeof PhotoSwipe==='undefined'||typeof PhotoSwipeUI_Default==='undefined')return;
      var gal=new PhotoSwipe(pswp,PhotoSwipeUI_Default,items,{
        index:idx,bgOpacity:0.85,maxSpreadZoom:4,pinchToClose:true,loop:true,
        getThumbBoundsFn:function(i){var el=imgs[i];if(!el)return null;var r=el.getBoundingClientRect();return{x:r.left,y:r.top+window.scrollY,w:r.width};}
      });
      gal.listen('close',function(){document.body.style.overflow='';});
      gal.listen('openingAnimationStart',function(){document.body.style.overflow='hidden';});
      gal.init();
    });
  }

  /* Copy button + lang tags + line numbers */
  pres.forEach(function(pre){
    if(pre._done)return;pre._done=true;
    /* Copy button */
    var btn=document.createElement('button');
    btn.className='copy-btn';btn.innerHTML='<i class="ri-clipboard-line"></i>';
    btn.setAttribute('aria-label','复制代码');pre.appendChild(btn);
    btn.addEventListener('click',function(e){
      e.stopPropagation();var code=pre.querySelector('code');
      if(!code)return;copyToClipboard(code.textContent).then(function(){
        btn.innerHTML='<i class="ri-check-line"></i>';
        setTimeout(function(){btn.innerHTML='<i class="ri-clipboard-line"></i>';},2000);
      });
    });
    /* Language tag */
    var code=pre.querySelector('code');
    if(code){var m=code.className.match(/language-(\w+)/);if(m){var t=document.createElement('span');t.className='lang-tag';t.textContent=m[1].charAt(0).toUpperCase()+m[1].slice(1);code.parentElement.appendChild(t);}}
    /* Line numbers (deferred for lang blocks to let Prism finish first) */
    if(code&&!code.className.match(/language-/))addLineNums(pre);
    else if(code)setTimeout(function(){addLineNums(pre);},200);
  });

  /* Heading anchors */
  if(md){
    md.querySelectorAll('h2,h3,h4').forEach(function(h){
      if(h.querySelector('.heading-anchor'))return;
      var id=h.id||h.textContent.replace(/[^\w一-鿿]+/g,'-').replace(/(^-|-$)/g,'').toLowerCase();
      if(!id)return;h.id=id;
      var a=document.createElement('a');a.className='heading-anchor';a.href='#'+id;a.textContent='#';
      a.addEventListener('click',function(e){
        e.preventDefault();var url=window.location.href.split('#')[0]+'#'+id;
        copyToClipboard(url);history.pushState(null,'','#'+id);h.scrollIntoView({behavior:'smooth'});
      });
      h.insertBefore(a,h.firstChild);
    });
  }
};
document.addEventListener('DOMContentLoaded', enhanceCode);

// Prism 增强：等待 Prism 加载完毕后重新处理代码块
if (typeof Prism !== 'undefined') {
  // Prism 已同步加载，直接包装
  var _origHighlightAll = Prism.highlightAll;
  Prism.highlightAll = function() {
    var result = _origHighlightAll.apply(this, arguments);
    enhanceCode();
    return result;
  };
} else {
  // Prism 异步加载后触发增强
  var _prismCheck = setInterval(function(){
    if (typeof Prism !== 'undefined') {
      clearInterval(_prismCheck);
      var _orig = Prism.highlightAll;
      Prism.highlightAll = function() {
        var result = _orig.apply(this, arguments);
        enhanceCode();
        return result;
      };
    }
  }, 200);
  // 最多等 10 秒
  setTimeout(function(){ clearInterval(_prismCheck); }, 10000);
}

/* ===== MEOW easter egg ===== */
(function(){
  var seq=[],trigger=['m','e','o','w'];
  document.addEventListener('keydown',function(e){
    var k=e.key.toLowerCase();if(k.length!==1||k<'a'||k>'z')return;
    seq.push(k);if(seq.length>trigger.length)seq.shift();
    if(seq.length===trigger.length&&seq.every(function(x,i){return x===trigger[i]})){
      seq=[];
      for(var i=0;i<40;i++){
        var el=document.createElement('div');el.className='meow-fish';
        el.style.left=Math.random()*100+'%';
        el.style.animationDuration=(4+Math.random()*3)+'s';
        el.style.animationDelay=(Math.random()*2)+'s';
        var inner=document.createElement('span');
        inner.textContent=['馃悷','馃悹','馃悺'][Math.floor(Math.random()*3)];
        inner.style.fontSize=(16+Math.random()*28)+'px';
        inner.style.display='inline-block';
        inner.style.transform='rotate('+(Math.random()*60-30)+'deg)';
        el.appendChild(inner);document.body.appendChild(el);
        el.addEventListener('animationend',function(){if(this.parentNode)this.parentNode.removeChild(this);});
      }
      setTimeout(function(){document.querySelectorAll('.meow-fish').forEach(function(el){if(el.parentNode)el.parentNode.removeChild(el);});},6000);
    }
  });
})();

/* ===== Copy toast ===== */
(function(){
  var timer=null;
  document.addEventListener('copy',function(){
    if(!window.getSelection()||!window.getSelection().toString())return;
    var old=document.querySelector('.meow-toast');if(old&&old.parentNode)old.parentNode.removeChild(old);
    if(timer)clearTimeout(timer);
    var el=document.createElement('div');el.className='meow-toast';
    el.textContent='喵，偷代码可是要请我吃小鱼干的 🐟';
    document.body.appendChild(el);el.offsetHeight;el.classList.add('show');
    timer=setTimeout(function(){
      el.classList.remove('show');
      el.addEventListener('transitionend',function(){if(el.parentNode)el.parentNode.removeChild(el);});
    },3000);
  });
})();

/* ===== Console cat ===== */
setTimeout(function(){
  console.log('%c🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟\n🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟\n🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟\n🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟\n🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟\n🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟\n🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟\n🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟\n🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟🐟','color:#fbbf24;');
  window.meow=function(){console.log('%c🐟 喵！🐟','font-size:24px;color:#fbbf24;');};
  window.rainFish=function(){
    'meow'.split('').forEach(function(k,i){setTimeout(function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:k}));},i*150);});
  };
},1000);

/* ===== Fireworks ===== */
(function(){
  if('ontouchstart' in window)return;
  var colors=['#ff6b6b','#ffd93d','#6bcbff','#a5b4fc','#ff8aeb','#51cf66'];
  document.addEventListener('click',function(e){
    for(var i=0;i<8;i++)(function(){
      var dot=document.createElement('div');
      dot.style.cssText='position:fixed;pointer-events:none;z-index:99995;width:6px;height:6px;border-radius:50%;background:'+colors[Math.floor(Math.random()*colors.length)]+';left:'+e.clientX+'px;top:'+e.clientY+'px;transition:all .6s ease-out;opacity:1';
      document.body.appendChild(dot);
      var angle=Math.random()*360,a=Math.random()*80+40;
      requestAnimationFrame(function(){
        dot.style.transform='translate('+Math.cos(angle)*a+'px,'+Math.sin(angle)*a+'px)';
        dot.style.opacity='0';
      });
      setTimeout(function(){if(dot.parentNode)dot.parentNode.removeChild(dot);},700);
    })();
  });
})();

/* ===== Typing floating words ===== */
(function(){
  var words=['喵','呜','嗷','哼','嗯','啾','叽','嘎','哇','呀','呜喵','嗷呜','咕噜','啪','哒','喵喵','嗷呜','啾','嘎'];
  var mx=window.innerWidth/2,my=window.innerHeight/2;
  document.addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;});
  document.addEventListener('keydown',function(e){
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.isContentEditable)return;
    if(e.key.length!==1||e.ctrlKey||e.metaKey||e.altKey)return;
    var el=document.createElement('span');
    el.textContent=words[Math.floor(Math.random()*words.length)];
    el.style.cssText='position:fixed;pointer-events:none;z-index:99994;font-size:20px;font-weight:700;color:#667eea;left:'+mx+'px;top:'+my+'px;opacity:1;transition:all .8s ease-out;';
    document.body.appendChild(el);
    requestAnimationFrame(function(){
      el.style.transform='translateY(-60px)';
      el.style.opacity='0';
    });
    setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},900);
  });
})();
