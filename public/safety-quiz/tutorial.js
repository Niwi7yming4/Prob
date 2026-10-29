/* Two unscored training trials before the study session. */
function tutorial(){
 const index=Math.min(1,state.tutorialIndex||0);
 const q=DATA[46+index];
 const phase=state.tutorialPhase||"try";
 const answer=q?.correct||"是";
 main.innerHTML='<section class="tutorial-screen"><div class="kicker">教學題 '+(index+1)+' / 2 · 不計分</div>'+
 '<h1>'+esc(q?.prompt||"辨認畫面中的防護設備")+'</h1>'+
 '<div class="tutorial-picture"><img src="'+imgUrl(q?.image||"")+'" alt="教學照片"><span>練習照片</span></div>'+
 (phase==="try"?'<p>先選「是」或「否」，熟悉判斷方式。</p><div class="tutorial-answers"><button type="button" data-tutorial="是">是</button><button type="button" data-tutorial="否">否</button></div>':
 '<div class="tutorial-result"><strong>初答：'+esc(state.tutorialAnswer||"—")+'</strong><strong>AI 模擬建議：'+esc(answer)+'</strong><p>正式題目會先記錄你的答案，再顯示 AI 建議；之後可修改答案。</p></div><button class="btn primary tutorial-next" id="tutorialNext">'+(index===1?"開始正式判讀":"下一題教學")+'</button>')+
 '<p class="tutorial-foot">教學不計入 '+total()+' 題，也不納入統計。</p></section>';
 document.querySelectorAll("[data-tutorial]").forEach(b=>b.onclick=()=>{state.tutorialAnswer=b.dataset.tutorial;state.tutorialPhase="result";save();render();});
 const next=document.querySelector("#tutorialNext");if(next)next.onclick=()=>{
  if(index===1){state.screen="quiz";delete state.tutorialPhase;delete state.tutorialAnswer;}
  else{state.tutorialIndex=1;state.tutorialPhase="try";delete state.tutorialAnswer;}
  save();render();
 };
}
