/* Full-viewport atmospheric light. Presentation only; no assets or dependencies.
 * 24fps ceiling, 0.85 DPR ceiling, visible-document only, reduced-motion still.
 */
class AmbientScene extends HTMLElement {
  connectedCallback(){
    this.setAttribute('aria-hidden','true');
    this.innerHTML='<canvas></canvas>';
    this.canvas=this.querySelector('canvas');
    const gl=this.canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
    if(!gl)return;
    this.gl=gl;this.lifecycle=new AbortController();const opt={signal:this.lifecycle.signal};
    const vertex=`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
    const fragment=`precision mediump float;varying vec2 uv;uniform float time;uniform float aspect;
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
    void main(){
      vec2 p=vec2((uv.x-.5)*aspect,uv.y-.5);float t=time*.14;
      float n=noise(p*1.7+vec2(t*.3,-t*.17));
      float bend=sin(p.y*2.4+t)*.26+sin(p.x*1.8-p.y*1.4-t*.7)*.16;
      float curve=p.x*.73+p.y*.85+bend+(n-.5)*.19;
      float beam=exp(-pow((curve-.16)/.20,2.));
      float edge=exp(-pow((curve-.36)/.035,2.));
      float wide=exp(-pow((curve+.52)/.43,2.));
      float folds=.5+.5*sin(curve*21.+n*2.2);folds=pow(folds,9.);
      float light=beam*.10+edge*.075+wide*.035+folds*beam*.08;
      vec3 graphite=vec3(.041,.045,.051);
      vec3 silver=vec3(.89,.89,.86);
      vec3 color=graphite+silver*light;
      color+=noise(p*2.3-t*.1)*.014;
      float grain=hash(gl_FragCoord.xy)*.006;color+=grain;
      gl_FragColor=vec4(color,1.);
    }`;
    const compile=(type,source)=>{const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;};
    try{this.program=gl.createProgram();const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);gl.attachShader(this.program,vs);gl.attachShader(this.program,fs);gl.linkProgram(this.program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(this.program,gl.LINK_STATUS))throw Error('Background shader link failed');}
    catch{this.dispose();return;}
    gl.useProgram(this.program);this.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(this.program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    this.time=gl.getUniformLocation(this.program,'time');this.aspect=gl.getUniformLocation(this.program,'aspect');this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.elapsed=0;this.lastTime=0;
    this.resize=new ResizeObserver(()=>this.draw());this.resize.observe(this);
    const resume=()=>{cancelAnimationFrame(this.frame);this.lastTime=0;this.draw();if(!this.motion.matches&&!document.hidden)this.frame=requestAnimationFrame(now=>this.tick(now));};
    this.motion.addEventListener('change',resume,opt);document.addEventListener('visibilitychange',resume,opt);
    this.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(this.frame);this.classList.remove('rendered');},opt);
    this.canvas.addEventListener('webglcontextrestored',()=>{this.disconnectedCallback();this.connectedCallback();},opt);
    resume();this.classList.add('rendered');
  }
  tick(now){
    if(document.hidden||this.motion.matches||this.gl.isContextLost())return;
    if(!this.lastTime)this.lastTime=now;
    if(now-this.lastTime>=1000/24){this.elapsed+=Math.min(now-this.lastTime,100)/1000;this.lastTime=now;this.draw();}
    this.frame=requestAnimationFrame(t=>this.tick(t));
  }
  draw(){
    const gl=this.gl;if(!gl||gl.isContextLost()||document.hidden)return;
    const scale=Math.min(devicePixelRatio,.85);const w=Math.round(this.clientWidth*scale),h=Math.round(this.clientHeight*scale);if(!w||!h)return;
    if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;gl.viewport(0,0,w,h);}
    gl.uniform1f(this.aspect,w/h);gl.uniform1f(this.time,this.elapsed);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }
  dispose(){if(this.gl){if(this.buffer)this.gl.deleteBuffer(this.buffer);if(this.program)this.gl.deleteProgram(this.program);}}
  disconnectedCallback(){cancelAnimationFrame(this.frame);this.lifecycle?.abort();this.resize?.disconnect();this.dispose();}
}
customElements.define('ambient-scene',AmbientScene);
