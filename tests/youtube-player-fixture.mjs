// Deterministic external-player boundary for UI tests. Never shipped in public/.
export function installYouTubeFixture(){
  window.__ytPlayers=[];
  const fetchOriginal=window.fetch.bind(window);
  window.fetch=(url,options)=>{
    const target=String(url);
    if(target.startsWith('https://www.youtube.com/oembed'))return Promise.resolve(new Response(JSON.stringify({title:'시점 메모 연습 영상',author_name:'테스트 채널'}),{headers:{'Content-Type':'application/json'}}));
    if(target.startsWith('https://i.ytimg.com/'))return Promise.resolve(new Response('',{status:404}));
    return fetchOriginal(url,options);
  };
  window.YT={Player:class{
    constructor(node,options){this.options=options;this.t=options.playerVars?.start||0;this.state=2;this.calls=[];window.__ytPlayers.push(this);node.innerHTML='<div style="display:grid;place-content:center;height:100%;color:#cbd5e1;font:16px system-ui">YouTube 플레이어 시험 화면</div>';setTimeout(()=>{this.fixtureReady=true;options.events.onReady({target:this});},30);}
    getCurrentTime(){return this.t;}getDuration(){return 900;}getPlayerState(){return this.state;}
    seekTo(t){this.t=t;this.calls.push(['seek',t]);}
    playVideo(){this.state=1;this.calls.push(['play']);this.options.events.onStateChange({data:1});}
    pauseVideo(){this.state=2;this.calls.push(['pause']);this.options.events.onStateChange({data:2});}
    setPlaybackRate(){}destroy(){this.dead=true;}
  }};
}
