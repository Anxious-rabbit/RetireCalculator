/* Presentation only. The accessible amount is exact from the first frame.
 * value: final rounded amount; from: optional previous visible amount.
 * No business rules, no third-party runtime. */
class MoneyCounter extends HTMLElement {
  connectedCallback() {
    (this.shadowRoot || this.attachShadow({mode:'open'})).innerHTML = `<style>
      :host{display:inline-flex;white-space:nowrap;font-variant-numeric:tabular-nums;vertical-align:baseline;align-items:baseline;line-height:1.08}
      .currency{margin-right:.025em}.reel{display:inline-block;height:1.08em;width:.62em;overflow:hidden;position:relative}
      .track{display:flex;flex-direction:column;will-change:transform}.track span{height:1.08em;line-height:1.08;text-align:center}
      .separator{width:.26em;line-height:1.08}.visual{display:inline-flex;align-self:flex-start}.baseline{display:inline-block;width:0;visibility:hidden;flex:none}
      @media(forced-colors:active){:host{color:CanvasText}}
    </style><span class="baseline" aria-hidden="true">0</span><span class="visual" aria-hidden="true"></span>`;
    this.motion = matchMedia('(prefers-reduced-motion: reduce)');
    this.controller = new AbortController();
    this.motion.addEventListener('change', () => { if(this.motion.matches) this.finish(); }, {signal:this.controller.signal});
    document.addEventListener('visibilitychange', () => { if(document.hidden) this.finish(); }, {signal:this.controller.signal});
    this.setAttribute('role','img');
    this.current = Number(this.getAttribute('from')) || 0;
    this.value = Number(this.getAttribute('value')) || 0;
  }
  disconnectedCallback(){cancelAnimationFrame(this.frame);this.controller?.abort();}
  get value(){return this.target;}
  set value(value){
    const next = Math.max(0, Math.round(Number(value)||0));
    cancelAnimationFrame(this.frame);
    this.target=next;
    this.setAttribute('aria-label',new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0}).format(next));
    this.dataset.target=String(next);
    const start=this.current||0;
    const length=String(Math.max(next,Math.ceil(start))).length;
    this.reels=[];
    const visual=this.shadowRoot.querySelector('.visual');
    visual.innerHTML='<span class="currency">$</span>';
    for(let index=length-1;index>=0;index--){
      const reel=document.createElement('span');reel.className='reel';
      reel.innerHTML='<span class="track"><span></span><span></span></span>';
      visual.append(reel);this.reels.push({place:10**index,track:reel.firstChild});
      if(index>0&&index%3===0){const comma=document.createElement('span');comma.className='separator';comma.textContent=',';visual.append(comma);}
    }
    if(this.motion.matches||document.hidden||start===next){this.finish();return;}
    this.dataset.animating='true';
    const duration=950, began=performance.now()+Math.max(0,Number(this.getAttribute('delay'))||0);
    const tick=now=>{
      const p=Math.max(0,Math.min(1,(now-began)/duration));
      this.current=start+(next-start)*(1-Math.pow(1-p,4));
      this.draw(this.current);
      if(p<1)this.frame=requestAnimationFrame(tick);else this.finish();
    };
    this.draw(start);this.frame=requestAnimationFrame(tick);
  }
  draw(value){
    for(const {place,track} of this.reels){
      const base=Math.floor(value/place);
      const phase=place===1?value%1:Math.max(0,(value%place)-(place-1));
      track.children[0].textContent=String(base%10);
      track.children[1].textContent=String((base+1)%10);
      track.style.transform=`translateY(${-phase*1.08}em)`;
    }
    this.dataset.visible=String(value);
  }
  finish(){
    cancelAnimationFrame(this.frame);this.current=this.target;
    const excess=this.reels.length-String(this.target).length;
    for(const {track} of this.reels.slice(0,Math.max(0,excess))){
      const reel=track.parentElement,next=reel.nextElementSibling;
      if(next?.classList.contains('separator'))next.remove();reel.remove();
    }
    this.reels=this.reels.slice(Math.max(0,excess));
    this.draw(this.target);this.dataset.animating='false';
  }
}
customElements.define('money-counter',MoneyCounter);
