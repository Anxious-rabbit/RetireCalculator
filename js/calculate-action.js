/* Visual handoff only. Form validation and calculation own the result. */
class CalculateAction extends HTMLElement {
  connectedCallback(){
    this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.lifecycle=new AbortController();
    this.motion.addEventListener('change',()=>{if(this.motion.matches)this.cancel();},{signal:this.lifecycle.signal});
    this.animations=[];
  }
  cancel(){clearTimeout(this.scrollTimer);for(const animation of this.animations||[])animation.cancel();this.animations=[];}
  play(target){
    this.cancel();const stacked=matchMedia('(max-width:960px)').matches;
    if(this.motion.matches){if(stacked)target.scrollIntoView({block:'start'});return;}
    const thumb=this.querySelector('.action-thumb'),button=this.querySelector('button');
    const travel=button.clientWidth-thumb.offsetWidth-8;
    this.animations.push(thumb.animate([
      {transform:'translateX(0)',opacity:1,offset:0},
      {transform:`translateX(${travel}px)`,opacity:1,offset:.34},
      {transform:`translateX(${travel}px)`,opacity:0,offset:.62},
      {transform:'translateX(0)',opacity:0,offset:.63},
      {transform:'translateX(0)',opacity:1,offset:1}
    ],{duration:1000,easing:'cubic-bezier(.22,.75,.2,1)'}));
    this.animations.push(this.querySelector('[data-action-label]').animate([{opacity:1},{opacity:.35,offset:.3},{opacity:1}],{duration:900,easing:'ease-out'}));
    for(const card of target.querySelectorAll('.option'))this.animations.push(card.animate([
      {boxShadow:'0 0 0 0 #ede9dc00',transform:`translate${stacked?'Y':'X'}(${stacked?8:6}px)`},
      {boxShadow:'0 0 28px 0 #ede9dc20',offset:.38},
      {boxShadow:'0 0 0 0 #ede9dc00',transform:'translate(0,0)'}
    ],{delay:280,duration:680,easing:'cubic-bezier(.2,.8,.2,1)'}));
    if(stacked)this.scrollTimer=setTimeout(()=>target.scrollIntoView({block:'start',behavior:'smooth'}),260);
  }
  disconnectedCallback(){this.cancel();this.lifecycle?.abort();}
}
customElements.define('calculate-action',CalculateAction);
