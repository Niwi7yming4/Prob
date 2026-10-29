/* Optional protocol extension: trust questionnaire, exit evaluation and analytics. */
const UX_ITEMS=[
 "題目、照片和作答按鈕，是否容易看清楚？",
 "先自行回答、再閱讀 AI 建議的操作順序，是否容易理解？",
 "從影像判讀、信任量表到結束頁，整體流程是否容易完成？"
];

/* DOCX protocol: one questionnaire after both image blocks. Demo gets a
   3-item form preview; it is not interpreted as a full Jian scale score. */
const DEMO_TRUST_INDICES=[2,5,9];
survey=function(){
  const demo=isDemo(),indices=demo?DEMO_TRUST_INDICES:Array.from({length:12},(_,i)=>i);
  const page=demo?0:(state.surveyPage||0),start=page*4;
  const items=demo?indices:indices.slice(start,start+4);
  const filled=indices.filter((_,i)=>Number(state.survey[i])>=1&&Number(state.survey[i])<=7).length;
  const pageReady=items.every((_,j)=>Number(state.survey[start+j])>=1&&Number(state.survey[start+j])<=7);
  main.innerHTML='<section class="survey-wrap"><div class="kicker">'+(demo?'Demo · 問卷試填':'完整模式 · 問卷 '+(page+1)+'/3')+'</div>'+
    '<h1>AI 信任問卷</h1><p>'+(demo?'試填 3 題。正式施測使用完整 12 題。':'已完成 48 題，請依本次 AI 建議的使用經驗評分。')+'</p>'+
    '<p class="progress-title">已填 '+filled+' / '+indices.length+' 題</p>'+
    '<div class="progress-bg"><div class="progress-fill" style="width:'+(filled/indices.length*100)+'%"></div></div>'+
    '<article class="card" style="padding:clamp(16px,3vw,28px)"><p class="note">1＝完全不符合　4＝普通　7＝非常符合</p>'+
    items.map((idx,j)=>{const slot=start+j;return '<div class="survey-item"><h3>'+String(slot+1).padStart(2,'0')+'. '+esc(TRUST[idx])+'</h3>'+
      '<div class="scale" data-trust-index="'+slot+'" role="group" aria-label="問卷第 '+(slot+1)+' 題">'+
      Array.from({length:7},(_,k)=>'<button type="button" class="scale-choice '+(Number(state.survey[slot])===k+1?'selected':'')+
       '" data-value="'+(k+1)+'" aria-pressed="'+(Number(state.survey[slot])===k+1)+'">'+(k+1)+'</button>').join('')+
      '</div><div class="scale-guide"><span>完全不符合</span><span>非常符合</span></div></div>';}).join('')+
    '<div class="button-row" style="justify-content:space-between">'+(demo?'':'<button class="btn secondary" type="button" id="trustPrev" '+(page===0?'disabled':'')+'>上一頁</button>')+
    '<button class="btn primary" type="button" id="trustNext" '+(pageReady?'':'disabled')+'>'+(demo||page===2?'完成問卷，查看結果':'下一頁')+'</button></div></article></section>';
  document.querySelectorAll('[data-trust-index] button').forEach(b=>b.onclick=()=>{
    const slot=Number(b.parentElement.dataset.trustIndex);state.survey[slot]=Number(b.dataset.value);save();
    b.parentElement.querySelectorAll('button').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});
    document.querySelector('#trustNext').disabled=!items.every((_,j)=>Number(state.survey[start+j])>=1);
    const n=indices.filter((_,i)=>Number(state.survey[i])>=1).length;
    document.querySelector('.progress-title').textContent='已填 '+n+' / '+indices.length+' 題';
    document.querySelector('.progress-fill').style.width=(n/indices.length*100)+'%';
  });
  if(!demo)document.querySelector('#trustPrev').onclick=()=>{if(page>0){state.surveyPage=page-1;save();render();}};
  document.querySelector('#trustNext').onclick=()=>{
    if(!items.every((_,j)=>Number(state.survey[start+j])>=1))return;
    if(!demo&&page<2){state.surveyPage=page+1;save();render();return;}
    if(indices.some((_,i)=>!(Number(state.survey[i])>=1&&Number(state.survey[i])<=7)))return;
    state.surveyRounds=[{block:1,questionEnd:state.position,indices:[...indices],answers:{...state.survey},at:new Date().toISOString()}];
    state.screen='done';state.completedAt=new Date().toISOString();save();render();
  };
};

function feedback(){
  const n=Object.keys(state.feedback).filter(k=>state.feedback[k]>=1).length;
  main.innerHTML='<section class="survey-wrap"><div class="kicker">第 4 階段｜介面評估</div><h1>使用體驗</h1>'+
    '<p>3 題操作評估，不列入信任量表。</p>'+
    '<article class="card" style="padding:clamp(18px,3vw,28px)"><p class="note">1＝非常不容易　　3＝普通　　5＝非常容易</p>'+
    UX_ITEMS.map((q,i)=>'<div class="feedback-item"><h3>'+(i+1)+'. '+esc(q)+'</h3><div class="feedback-options" data-idx="'+i+'" role="group" aria-label="介面體驗第 '+(i+1)+' 題">'+
      Array.from({length:5},(_,k)=>'<button type="button" class="'+(state.feedback[i]===k+1?'selected':'')+'" data-value="'+(k+1)+'" aria-pressed="'+(state.feedback[i]===k+1)+'">'+(k+1)+'</button>').join('')+
      '</div><div class="feedback-key"><span>非常不容易</span><span>非常容易</span></div></div>').join('')+
    '<div style="margin:20px 0"><label for="uxNote" style="font-weight:800;display:block;margin-bottom:8px">補充意見（選填）</label><textarea class="feedback-note" id="uxNote" maxlength="500" placeholder="例如：哪張照片難看清？哪個步驟容易誤解？">'+esc(state.feedbackNote||'')+'</textarea></div>'+
    '<div class="button-row"><button class="btn secondary" id="backTrust">返回信任量表</button><button class="btn primary" id="endProtocol" '+(n===3?'':'disabled')+'>查看結果</button></div></article></section>';
  document.querySelectorAll('.feedback-options button').forEach(b=>b.onclick=()=>{
    const i=+b.parentElement.dataset.idx;state.feedback[i]=+b.dataset.value;save();
    b.parentElement.querySelectorAll('button').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});
    document.querySelector('#endProtocol').disabled=Object.keys(state.feedback).filter(k=>state.feedback[k]>=1).length!==3;
  });
  document.querySelector('#uxNote').oninput=e=>{state.feedbackNote=e.target.value;save();};
  document.querySelector('#backTrust').onclick=()=>{state.reviewCompletedSurvey=true;state.screen='survey';state.surveyPage=isDemo()?0:2;save();render();};
  document.querySelector('#endProtocol').onclick=()=>{if(Object.keys(state.feedback).filter(k=>state.feedback[k]>=1).length!==3)return;state.completedAt=new Date().toISOString();setScreen('done');};
}
done=function(){
  const x=stats(),n=state.records.length,demo=isDemo();
  const indices=demo?DEMO_TRUST_INDICES:Array.from({length:12},(_,i)=>i);
  const scores=indices.map((idx,i)=>idx<5?8-Number(state.survey[i]):Number(state.survey[i]));
  const average=scores.reduce((a,b)=>a+b,0)/scores.length;
  const pct=value=>n?Math.round(value/n*100):0;
  main.innerHTML='<section class="summary"><div class="kicker">已完成</div>'+
    '<h1>'+(demo?'4 題 Demo 結束':'48 題測驗結束')+'</h1>'+
    '<p>'+(demo?'四種條件各一題，已完成問卷試填。':'已完成兩組判讀與一次 Jian 12 題問卷。')+'</p>'+
    '<article class="card"><h2>作答摘要</h2>'+
    '<div class="summ-grid"><div><strong>'+x.init+'/'+n+'</strong><span>初答正確</span></div>'+
    '<div><strong>'+x.end+'/'+n+'</strong><span>最後正確</span></div>'+
    '<div><strong>'+x.changed+'</strong><span>改答次數</span></div>'+
    '<div><strong>'+x.bad+'/'+x.eligible+'</strong><span>錯誤 AI 建議後改錯</span></div></div>'+
    '<div class="score-trend">'+[['初答正確率',x.init],['終答正確率',x.end]].map((v,i)=>
      '<div class="score-row '+(i?'final':'')+'"><div><span>'+v[0]+'</span><b>'+pct(v[1])+'%</b></div>'+
      '<div class="score-track"><div class="score-fill" style="width:'+pct(v[1])+'%"></div></div></div>').join('')+'</div>'+
    '<h2>問卷結果</h2><div class="summ-grid"><div><strong>'+average.toFixed(2)+' / 7</strong>'+
    '<span>'+(demo?'3 題試填平均（不是正式量表分數）':'Jian 信任量表平均（前五題反向計分）')+'</span></div>'+
    '<div><strong>'+scores.length+' 題</strong><span>已填問卷</span></div></div>'+
    '<details class="rule"><summary><strong>結果使用限制</strong></summary><p>AI 建議是模擬輸出，標準答案依資料集標註推定，正式施測前須人工確認。Demo 不作正式統計推論。</p></details>'+
    '<div class="button-row"><button class="btn primary" id="csv">下載作答 CSV</button>'+
    '<button class="btn secondary" id="json">下載完整 JSON</button></div></article>'+
    '<div class="button-row"><button class="btn secondary" id="home">返回模式選擇</button>'+
    '<button class="btn warn" id="reset">重做本模式</button></div></section>';
  document.querySelector('#csv').onclick=downloadCSV;
  document.querySelector('#json').onclick=()=>download('industrial-safety-'+n+'-protocol.json',
    JSON.stringify({...state,summary:x,trustAverage:average,trustScores:scores,trustIsPreview:demo},null,2),
    'application/json;charset=utf-8');
  document.querySelector('#home').onclick=()=>{state.screen='intro';save();render();};
  document.querySelector('#reset').onclick=reset;
};

reset=function(){
 if(!confirm('確定清除目前這個模式的所有紀錄？另一個模式的紀錄不會受影響。'))return;
 localStorage.removeItem(isDemo()?DEMO_STORE:STORE);state=fresh(state.mode);render();
};
render();
