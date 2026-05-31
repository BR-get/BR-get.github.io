/* ===== Copy to clipboard ===== */
function copyToClipboard(t){
  if(navigator.clipboard&&navigator.clipboard.writeText)return navigator.clipboard.writeText(t);
  var ta=document.createElement('textarea');ta.value=t;ta.style.position='fixed';ta.style.left='-9999px';
  document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}document.body.removeChild(ta);
  return Promise.resolve();
}

/* ===== Page ready ===== */
document.addEventListener('DOMContentLoaded',function(){
  var md=document.querySelector('.post-content,.markdown');
  var pres=md?md.querySelectorAll('pre'):[];

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

  /* Code: copy button + line numbers + lang tags */
  pres.forEach(function(pre){
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

    /* Line numbers */
    var code=pre.querySelector('code');
    if(!code||code.lineNumbered)return;code.lineNumbered=true;
    var lines=code.textContent.split('\n');
    if(lines.length&&lines[0].trim()==='')lines.shift();
    if(lines.length&&lines[lines.length-1].trim()==='')lines.pop();
    if(lines.length<2)return;
    var nums=document.createElement('div');nums.className='line-numbers';
    for(var i=0;i<lines.length;i++){var s=document.createElement('span');s.textContent=i+1;nums.appendChild(s);}
    pre.insertBefore(nums,code);pre.classList.add('has-line-numbers');code.classList.add('has-line-numbers');
  });

  /* Language tags */
  document.querySelectorAll('.post-content pre code[class*="language-"],.markdown pre code[class*="language-"]').forEach(function(code){
    if(code.langTagged)return;code.langTagged=true;
    var m=code.className.match(/language-(\w+)/);if(!m)return;
    var name=m[1].charAt(0).toUpperCase()+m[1].slice(1);
    var tag=document.createElement('span');tag.className='lang-tag';tag.textContent=name;
    code.parentElement.appendChild(tag);
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
});

/* ===== 🐟 MEOW 彩蛋 — 输入 meow 下鱼雨 ===== */
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
        inner.textContent=['🐟','🐠','🐡'][Math.floor(Math.random()*3)];
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

/* ===== 🐟 复制彩蛋 — 卖萌 toast ===== */
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

/* ===== 🐱 控制台猫猫 ===== */
setTimeout(function(){
  console.log('%c🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱\n🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱\n🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱\n🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱\n🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱\n🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱\n🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱\n🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱\n🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱\n🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱','color:#fbbf24;');
  window.meow=function(){console.log('%c🐱 喵！🐱','font-size:24px;color:#fbbf24;');};
  window.rainFish=function(){
    'meow'.split('').forEach(function(k,i){setTimeout(function(){document.dispatchEvent(new KeyboardEvent('keydown',{key:k}));},i*150);});
  };
},1000);

/* ===== 🎆 鼠标点击烟花 ===== */
(function(){
  if('ontouchstart' in window)return;
  var colors=['#ff6b6b','#ffd93d','#6bcbff','#a5b4fc','#ff8aeb','#51cf66'];
  document.addEventListener('click',function(e){
    for(var i=0;i<8;i++){
      var dot=document.createElement('div');
      dot.style.cssText='position:fixed;pointer-events:none;z-index:99995;width:6px;height:6px;border-radius:50%;background:'+colors[Math.floor(Math.random()*colors.length)]+';left:'+e.clientX+'px;top:'+e.clientY+'px;transition:all .6s ease-out;opacity:1';
      document.body.appendChild(dot);
      var angle=Math.random()*360,a=Math.random()*80+40;
      requestAnimationFrame(function(){
        dot.style.transform='translate('+Math.cos(angle)*a+'px,'+Math.sin(angle)*a+'px)';
        dot.style.opacity='0';
      });
      setTimeout(function(){if(dot.parentNode)dot.parentNode.removeChild(dot);},700);
    }
  });
})();

