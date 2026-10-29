/* Optional protocol extension: trust questionnaire, exit evaluation and analytics. */
const UX_ITEMS=[
 "題目、照片和作答按鈕，是否容易看清楚？",
 "先自行回答、再閱讀 AI 建議的操作順序，是否容易理解？",
 "從影像判讀、信任量表到結束頁，整體流程是否容易完成？"
];
survey=function(){
  const page=state.surveyPage||0,start=page*4,items=TRUST.slice(start,start+4);
  const answered=Object.keys(state.survey).length;
  const completed=items.every((_,i)=>Number(state.survey[start+i])>=1);
  main.innerHTML='<section class="survey-wrap"><div class="kicker">第 3 階段｜AI 信任量表 · '+(page+1)+'/3 頁</div><h1>AI 信任量表</h1>'+
    '<p>依剛才使用 AI 的感受，選擇 1～7 分。</p>'+
    '<p class="progress-title">已回答 '+answered+' / 12 題</p><div class="progress-bg"><div class="progress-fill" style="width:'+(answered/12*100)+'%"></div></div>'+
    '<article class="card" style="padding:clamp(18px,3vw,30px)"><p class="note">1＝完全不符合　　4＝普通　　7＝非常符合</p>'+
    items.map((q,i)=>{const idx=start+i;return '<div class="survey-item"><h3>'+String(idx+1).padStart(2,"0")+'. '+esc(q)+'</h3><div class="scale" data-idx="'+idx+'" role="group" aria-label="第 '+(idx+1)+' 題">'+
      Array.from({length:7},(_,k)=>'<button type="button" class="scale-choice '+(state.survey[idx]===k+1?'selected':'')+'" data-value="'+(k+1)+'" aria-pressed="'+(state.survey[idx]===k+1)+'">'+(k+1)+'</button>').join('')+
      '</div><div class="scale-guide"><span>完全不符合</span><span>非常符合</span></div></div>';}).join('')+
    '<div class="button-row" style="justify-content:space-between"><button class="btn secondary" id="surveyPrev" '+(page===0?'disabled':'')+'>上一頁</button>'+
    '<button class="btn primary" id="surveyNext" '+(completed?'':'disabled')+'>'+(page===2?'完成量表，進入小評估':'下一頁')+'</button></div></article></section>';
  document.querySelectorAll('.scale-choice').forEach(b=>b.onclick=()=>{
    const idx=+b.parentElement.dataset.idx;state.survey[idx]=+b.dataset.value;save();
    b.parentElement.querySelectorAll('button').forEach(x=>{x.classList.toggle('selected',x===b);x.setAttribute('aria-pressed',String(x===b));});
    document.querySelector('#surveyNext').disabled=!items.every((_,i)=>Number(state.survey[start+i])>=1);
    const n=Object.keys(state.survey).length;
    document.querySelector('.progress-title').textContent='已回答 '+n+' / 12 題';
    document.querySelector('.progress-fill').style.width=n/12*100+'%';
  });
  document.querySelector('#surveyPrev').onclick=()=>{if(page>0){state.surveyPage=page-1;save();render();}};
  document.querySelector('#surveyNext').onclick=()=>{
    if(!items.every((_,i)=>Number(state.survey[start+i])>=1))return;
    if(page===2)state.screen='feedback';else state.surveyPage=page+1;
    save();render();
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
  document.querySelector('#backTrust').onclick=()=>{state.screen='survey';state.surveyPage=2;save();render();};
  document.querySelector('#endProtocol').onclick=()=>{if(Object.keys(state.feedback).filter(k=>state.feedback[k]>=1).length!==3)return;state.completedAt=new Date().toISOString();setScreen('done');};
}
done=function(){
 const x=stats(),n=state.records.length,trust=TRUST.map((_,i)=>i<5?8-state.survey[i]:state.survey[i]);
 const mean=trust.reduce((a,b)=>a+b,0)/12,uxMean=Object.values(state.feedback).reduce((a,b)=>a+Number(b),0)/3;
 const wrongAdvice=state.records.filter(r=>r.aiCondition==='incorrect'),correctAdvice=state.records.filter(r=>r.aiCondition==='correct');
 const influenced=wrongAdvice.filter(r=>r.initialCorrect&&r.changed&&!r.finalCorrect).length;
 const caution=wrongAdvice.filter(r=>r.initialCorrect).length;
 const misses=state.records.filter(r=>r.hasTargetAnnotation&&((r.negativeWording&&r.final==='是')||(!r.negativeWording&&r.final==='否'))).length;
 const insight=[
  {title:'初答和終答比較',body:x.end>x.init?'終答多 '+(x.end-x.init)+' 題。':x.end<x.init?'終答少 '+(x.init-x.end)+' 題。':'初答與終答正確數相同。'},
  {title:'錯誤 AI 建議的影響',body:caution?'原本答對的 '+caution+' 題中，有 '+influenced+' 題改錯。':'沒有可計算題目。'},
  {title:'信任與操作體驗',body:'信任 '+mean.toFixed(2)+'/7；介面 '+uxMean.toFixed(2)+'/5。分開計分。'}
 ];
 const rows=[['初次作答',x.init],['最終作答',x.end]];
 main.innerHTML='<section class="summary"><div class="kicker">第 5 階段｜流程結束</div><h1>'+(isDemo()?'4 題流程 Demo 已完成':'48 題完整流程已完成')+'</h1>'+
 '<p>本次作答摘要（非正式研究結論）。</p>'+
 '<article class="card"><h2>影像判讀摘要</h2><div class="summ-grid"><div><strong>'+x.init+'/'+n+'</strong><span>初答正確</span></div><div><strong>'+x.end+'/'+n+'</strong><span>終答正確</span></div><div><strong>'+x.changed+'</strong><span>答案改變</span></div><div><strong>'+x.bad+'/'+x.eligible+'</strong><span>因錯誤 AI 建議而改錯</span></div></div>'+
 '<div class="score-trend">'+rows.map((r,i)=>'<div class="score-row '+(i===1?'final':'')+'"><div><span>'+r[0]+'正確率</span><b>'+Math.round(r[1]/n*100)+'%</b></div><div class="score-track"><div class="score-fill" style="width:'+(r[1]/n*100)+'%"></div></div></div>').join('')+'</div>'+
 '<h2>問卷結果</h2><div class="summ-grid"><div><strong>'+mean.toFixed(2)+' / 7</strong><span>信任量表平均（反向題已計分）</span></div><div><strong>'+uxMean.toFixed(2)+' / 5</strong><span>介面評估平均</span></div><div><strong>'+misses+'</strong><span>漏判目標（依標註）</span></div><div><strong>'+correctAdvice.length+' / '+wrongAdvice.length+'</strong><span>正確／錯誤 AI 建議題數</span></div></div>'+
 '<h2>作答觀察</h2><div class="insight-list">'+insight.map(v=>'<div class="insight"><strong>'+v.title+'</strong>'+v.body+'</div>').join('')+'</div>'+
 '<details class="rule"><summary><strong>解讀限制</strong></summary><p>答案依標註推定，仍須人工核對。AI 建議為模擬；4 題 Demo 不能推論研究效果。</p></details>'+
 '<div class="button-row"><button class="btn primary" id="csv">下載影像題 CSV</button><button class="btn secondary" id="json">下載完整 JSON</button><button class="btn secondary" id="review">查看圖片來源</button></div></article>'+
 '<div class="button-row"><button class="btn secondary" id="home">回到模式選擇</button><button class="btn warn" id="reset">重做本模式</button></div></section>';
 document.querySelector('#csv').onclick=downloadCSV;
 document.querySelector('#json').onclick=()=>download('industrial-safety-'+n+'-protocol.json',JSON.stringify({...state,summary:x,trustReverseScored:trust,trustAverage:mean,uxAverage:uxMean},null,2),'application/json;charset=utf-8');
 document.querySelector('#review').onclick=()=>{state.screen='review';previewPage=0;render();};
 document.querySelector('#home').onclick=()=>{state.screen='intro';save();render();};
 document.querySelector('#reset').onclick=reset;
};
reset=function(){
 if(!confirm('確定清除目前這個模式的所有紀錄？另一個模式的紀錄不會受影響。'))return;
 localStorage.removeItem(isDemo()?DEMO_STORE:STORE);state=fresh(state.mode);render();
};
render();
