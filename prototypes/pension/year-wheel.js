/* Inline wheel with one real form input. Pointer motion previews; release commits.
 * Generic numeric min/max/step attributes; no pension calculation knowledge. */
class YearWheel extends HTMLElement {
  connectedCallback() {
    this.lifecycle?.abort();this.lifecycle=new AbortController();const opt={signal:this.lifecycle.signal};
    this.input=this.querySelector('input');this.trigger=this.querySelector('[data-trigger]');
    this.panel=this.querySelector('[data-panel]');this.wheel=this.querySelector('[data-wheel]');
    this.preview=this.querySelector('[data-value]');this.error=this.querySelector('.field-error');
    this.rows=this.querySelector('[data-rows]');this.rows.innerHTML=Array.from({length:11},()=>'<span class="wheel-row"></span>').join('');
    this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.position=0;this.input.readOnly=true;
    this.trigger.addEventListener('click',()=>{if(this.panel.hidden){this.show();this.input.focus({preventScroll:true});}else this.dismiss(true);},opt);
    this.input.addEventListener('input',()=>{this.syncValue(false);this.error.textContent='';this.input.removeAttribute('aria-invalid');},opt);
    this.input.addEventListener('blur',event=>{if(this.editing&&!event.relatedTarget?.closest('.wheel-confirm'))this.commitEdit();},opt);
    this.querySelector('.wheel-confirm').addEventListener('click',()=>{if(this.commitEdit())this.input.focus({preventScroll:true});else this.input.focus();},opt);
    this.input.addEventListener('keydown',event=>{
      if(event.isComposing)return;
      if(event.key==='Escape'){event.preventDefault();if(this.editing){this.input.value=this.editOrigin;this.exitEdit();this.emit();this.syncValue();}else this.dismiss(true);return;}
      if(event.key==='Enter'){event.preventDefault();if(this.editing)this.commitEdit();else this.edit();return;}
      if(this.editing)return;
      const steps={ArrowUp:1,ArrowDown:-1,PageUp:5,PageDown:-5};
      if(event.key in steps){event.preventDefault();this.choose(Number(this.input.value)+steps[event.key]*this.step);}
      else if(event.key==='Home'||event.key==='End'){event.preventDefault();this.choose(event.key==='Home'?this.min:this.max);}
      else if(/^\d$/.test(event.key)||event.key==='Backspace'||event.key==='Delete'){this.edit();}
    },opt);
    this.wheel.addEventListener('pointerdown',event=>this.down(event),opt);
    this.wheel.addEventListener('pointermove',event=>this.move(event),opt);
    this.wheel.addEventListener('pointerup',event=>this.up(event),opt);
    this.wheel.addEventListener('pointercancel',()=>this.cancel(),opt);
    this.wheel.addEventListener('lostpointercapture',()=>this.cancel(),opt);
    this.wheel.addEventListener('wheel',event=>{
      if(this.editing||event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;
      const delta=event.deltaY*(event.deltaMode===1?18:event.deltaMode===2?160:1);
      const current=Number(this.input.value)||0;
      if((current<=this.min&&delta<0)||(current>=this.max&&delta>0))return;
      event.preventDefault();this.wheelDelta=(this.wheelDelta||0)+delta;
      if(Math.abs(this.wheelDelta)>=28){this.choose(current+Math.sign(this.wheelDelta)*this.step);this.wheelDelta=0;}
      clearTimeout(this.wheelTimer);this.wheelTimer=setTimeout(()=>this.wheelDelta=0,140);
    },{...opt,passive:false});
    this.motion.addEventListener('change',()=>{if(this.motion.matches){cancelAnimationFrame(this.frame);this.syncValue();}},opt);
    window.addEventListener('blur',()=>this.cancel(),opt);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.cancel();},opt);
    this.syncValue();
  }
  get min(){return Number(this.getAttribute('min'))||0;}
  get max(){return Math.max(this.min,Number(this.getAttribute('max'))||200);}
  get step(){return Number(this.getAttribute('step'))||.5;}
  get editing(){return this.hasAttribute('editing');}
  get rowHeight(){return this.wheel.clientHeight/3;}
  clamp(value){return Math.max(this.min,Math.min(this.max,value));}
  emit(){this.input.dispatchEvent(new Event('input',{bubbles:true}));}
  show(){this.panel.hidden=false;this.trigger.setAttribute('aria-expanded','true');this.syncValue();}
  dismiss(restore=false){
    if(this.editing&&!this.commitEdit()){this.input.focus();return;}
    this.cancel();this.panel.hidden=true;this.trigger.setAttribute('aria-expanded','false');
    if(restore)this.trigger.focus({preventScroll:true});
  }
  edit(){
    if(this.editing)return;
    this.show();this.cancel();if(document.activeElement===this.input)this.input.blur();this.editOrigin=this.input.value;this.setAttribute('editing','');
    this.input.readOnly=false;this.input.focus({preventScroll:true});this.input.select();
  }
  exitEdit(){this.removeAttribute('editing');this.input.readOnly=true;this.error.textContent='';this.input.removeAttribute('aria-invalid');}
  commitEdit(){
    const text=this.input.value.trim(),value=text===''?0:Number(text);
    if((text!==''&&!/^\d+(?:\.\d+)?$/.test(text))||!Number.isFinite(value)||value<this.min||value>this.max){
      this.error.textContent=`Enter ${this.min}–${this.max} years.`;this.input.setAttribute('aria-invalid','true');return false;
    }
    this.input.value=String(value);this.exitEdit();this.emit();this.syncValue();return true;
  }
  syncValue(reposition=true){
    const value=Number(this.input.value),valid=this.input.value.trim()!==''&&Number.isFinite(value);
    this.preview.textContent=valid?`${value} yr`:this.input.value.trim()===''?'0 yr':'Edit';
    this.input.setAttribute('aria-valuemin',String(this.min));this.input.setAttribute('aria-valuemax',String(this.max));
    if(valid){this.input.setAttribute('aria-valuenow',String(value));this.input.setAttribute('aria-valuetext',`${value} years`);}else{this.input.removeAttribute('aria-valuenow');this.input.removeAttribute('aria-valuetext');}
    if(reposition){cancelAnimationFrame(this.frame);this.removeAttribute('moving');this.position=(valid?value:0)/this.step;this.paint();}
  }
  paint(){
    const base=Math.floor(this.position),height=this.rowHeight||36;
    [...this.rows.children].forEach((row,index)=>{
      const tick=base+index-5,offset=tick-this.position,angle=Math.max(-82,Math.min(82,offset*27));
      const value=Number((tick*this.step).toFixed(6));
      row.textContent=String(value);
      row.style.transform=`translateY(${Math.sin(angle*Math.PI/180)*height*2.13}px) rotateX(${-angle}deg)`;
      row.style.opacity=(value<this.min||value>this.max||Math.abs(offset)>3.1||(!this.hasAttribute('moving')&&Math.abs(offset)<.65))?'0':String(Math.pow(Math.max(0,1-Math.abs(offset)/3.4),1.5));
    });
  }
  choose(value){
    const next=Number(this.clamp(Math.round(value/this.step)*this.step).toFixed(6));
    this.input.value=String(next);this.error.textContent='';this.input.removeAttribute('aria-invalid');this.emit();
    const start=this.position,end=next/this.step;
    cancelAnimationFrame(this.frame);
    if(this.motion.matches||start===end){this.position=end;this.removeAttribute('moving');this.paint();return;}
    this.setAttribute('moving','');const began=performance.now();
    const tick=now=>{const p=Math.min(1,(now-began)/220);this.position=start+(end-start)*(1-Math.pow(1-p,3));this.paint();if(p<1)this.frame=requestAnimationFrame(tick);else{this.removeAttribute('moving');this.paint();}};
    this.frame=requestAnimationFrame(tick);
  }
  down(event){
    if(this.editing||!event.isPrimary||event.button!==0)return;
    event.preventDefault();cancelAnimationFrame(this.frame);this.input.focus({preventScroll:true});
    this.drag={id:event.pointerId,center:event.target===this.input,y:event.clientY,position:this.position,lastY:event.clientY,time:performance.now(),velocity:0,moved:false,origin:Number(this.input.value)||0};
    this.wheel.setPointerCapture(event.pointerId);
  }
  move(event){
    const d=this.drag;if(!d||event.pointerId!==d.id)return;
    const delta=d.y-event.clientY;
    if(!d.moved&&Math.abs(delta)<6)return;
    d.moved=true;this.setAttribute('moving','');
    const now=performance.now();d.velocity=(d.lastY-event.clientY)/Math.max(8,now-d.time);d.time=now;d.lastY=event.clientY;
    this.position=this.clamp((d.position+delta/this.rowHeight)*this.step)/this.step;this.paint();
  }
  up(event){
    const d=this.drag;if(!d||event.pointerId!==d.id)return;this.drag=null;
    if(this.wheel.hasPointerCapture(d.id))this.wheel.releasePointerCapture(d.id);
    if(d.moved){const velocity=performance.now()-d.time>80?0:d.velocity;const projected=this.motion.matches?0:Math.max(-3,Math.min(3,velocity*70/this.rowHeight));this.choose((this.position+projected)*this.step);}
    else{const offset=event.clientY-(this.wheel.getBoundingClientRect().top+this.wheel.clientHeight/2);if(d.center||Math.abs(offset)<this.rowHeight*.6)this.edit();else this.choose(d.origin+Math.sign(offset)*this.step);}
  }
  cancel(){
    const d=this.drag;if(!d)return;this.drag=null;
    if(this.wheel.hasPointerCapture(d.id))this.wheel.releasePointerCapture(d.id);
    cancelAnimationFrame(this.frame);this.removeAttribute('moving');this.syncValue();
  }
  disconnectedCallback(){this.cancel();this.lifecycle?.abort();cancelAnimationFrame(this.frame);clearTimeout(this.wheelTimer);}
}
customElements.define('year-wheel',YearWheel);
