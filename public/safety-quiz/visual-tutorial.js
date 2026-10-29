/* Visual evidence overlays use the original dataset's YOLO boxes.
 * Never show them before the participant commits an initial decision.
 * The suggested AI answer is experimentally scripted, not model inference.
 */
const PRACTICE=[];
function translatedClass(label){
 const names={Person:"人員",person:"人員",helmet:"安全帽",Hardhat:"安全帽",
 gloves:"手套",vest:"工作背心","Safety Vest":"反光背心",boots:"安全鞋",
 goggles:"護目鏡",machinery:"施工機具",vehicle:"工程車輛","Safety Cone":"警示錐",
 "NO-Hardhat":"未戴安全帽","NO-Safety Vest":"未穿背心",no_helmet:"未戴安全帽",
 no_gloves:"未戴手套",no_goggle:"未戴護目鏡",no_boots:"未穿安全鞋",
 "NO-Mask":"未戴口罩",Mask:"口罩"};
 return names[label]||"關注物件";
}
function evidenceBoxes(q){
 const src=Array.isArray(q?.boxes)?q.boxes:[];
 const targets=Array.isArray(q?.queryClassIds)?q.queryClassIds:Array.isArray(q?.targetIds)?q.targetIds:[q?.classId];
 const matched=src.filter(b=>targets.includes(b.classId));
 const sorted=[...matched,...src.filter(b=>!matched.includes(b))];
 const unique=[];
 for(const b of sorted){
  if(!Number.isFinite(b.x)||!Number.isFinite(b.y)||!Number.isFinite(b.w)||!Number.isFinite(b.h))continue;
  if(b.w<=0||b.h<=0)continue;
  if(unique.some(v=>v.classId===b.classId)&&unique.length>=2)continue;
  unique.push(b);
  if(unique.length===3)break;
 }
 return unique;
}
function renderEvidence(q,img,layer){
 if(!img||!layer||!img.naturalWidth||!img.naturalHeight)return;
 const cw=img.clientWidth,ch=img.clientHeight,scale=Math.min(cw/img.naturalWidth,ch/img.naturalHeight);
 const iw=img.naturalWidth*scale,ih=img.naturalHeight*scale;
 layer.style.left=((cw-iw)/2)+"px";layer.style.top=((ch-ih)/2)+"px";
 layer.style.width=iw+"px";layer.style.height=ih+"px";
 layer.replaceChildren();
 const boxes=evidenceBoxes(q);
 boxes.forEach((b,i)=>{
  const e=document.createElement("div");e.className="evidence-box";
  e.style.left=Math.max(0,(b.x-b.w/2)*100)+"%";
  e.style.top=Math.max(0,(b.y-b.h/2)*100)+"%";
  e.style.width=Math.min(b.w*100,100)+"%";
  e.style.height=Math.min(b.h*100,100)+"%";
  const l=document.createElement("span");l.className="evidence-label";
  l.textContent=translatedClass(b.label);
  e.appendChild(l);layer.appendChild(e);
 });
 layer.hidden=!boxes.length;
}
function summaryEvidence(q){
 const boxes=evidenceBoxes(q);
 if(!boxes.length)return "未提供可呈現的標註區域";
 return "辨識區域："+boxes.map(b=>translatedClass(b.label)).join("、");
}
function tutorial(){
 const i=Math.min(state.tutorialIndex||0,1),q=PRACTICE[i],phase=state.tutorialPhase||"first";
 if(!q){
  main.innerHTML='<section class="card practice-loading"><h1>教學題載入中</h1><p>正在讀取有來源標註的練習圖片。</p><button id="reloadPractice" class="btn secondary">重新載入</button></section>';
  document.querySelector("#reloadPractice").onclick=()=>location.reload();
  return;
 }
 const reveal=phase!=="first";
 const finished=phase==="explain";
 const correct=q.correct===q.aiAdvice;
 main.innerHTML='<section class="practice-wrap"><div class="practice-heading"><span class="practice-kicker">教學 '+(i+1)+' / 2 · 不計分</span><span class="practice-step">'+(phase==="first"?"① 先自行回答":phase==="second"?"② 查看 AI 後再回答":"③ 核對答案")+'</span></div>'+
 '<h1 class="practice-question">'+esc(q.prompt)+'</h1>'+
 (reveal?'<section class="practice-ai"><div class="practice-ai-title">AI 辨識建議 <small>模擬</small></div><div class="practice-ai-answer">建議回答 <strong>'+esc(q.aiAdvice)+'</strong></div><p>'+esc(summaryEvidence(q))+'</p></section>':'')+
 '<section class="practice-photo"><img id="practiceImg" alt="教學題 '+(i+1)+' 影像" src="'+imgUrl(q.image)+'"><div id="practiceEvidence" class="evidence-layer" hidden></div></section>'+
 (finished?'<div class="practice-explain"><strong>參考答案：'+esc(q.correct)+'　/　AI 建議'+(correct?"正確":"錯誤")+'</strong><p>'+esc(q.explanation)+'</p></div>':
 '<div class="practice-options" role="group" aria-label="教學題回答"><button type="button" data-practice-answer="是">是</button><button type="button" data-practice-answer="否">否</button></div>')+
 '<div class="practice-foot"><button class="btn primary" id="practiceNext" '+(!finished?'disabled':'')+'>'+(finished?(i===1?"開始正式作答":"下一題教學"):(reveal?"確認答案":"查看 AI 建議"))+'</button></div>'+
 '<p class="practice-caption">教學題不計分。框選位置依公開資料集標註示意，AI 回覆為預設模擬。</p></section>';
 const img=document.querySelector("#practiceImg");
 img.onload=()=>{if(reveal)renderEvidence(q,img,document.querySelector("#practiceEvidence"));};
 if(img.complete&&img.naturalWidth&&reveal)renderEvidence(q,img,document.querySelector("#practiceEvidence"));
 if(finished){
  document.querySelector("#practiceNext").disabled=false;
  document.querySelector("#practiceNext").onclick=()=>{
   if(i===1){state.screen="quiz";state.tutorialIndex=2;state.tutorialPhase="first";}else{state.tutorialIndex=i+1;state.tutorialPhase="first";}
   state.tutorialChoice=null;state.tutorialFinal=null;save();render();
  };
 }else{
  document.querySelectorAll("[data-practice-answer]").forEach(b=>b.onclick=()=>{
   document.querySelectorAll("[data-practice-answer]").forEach(n=>{n.classList.toggle("selected",n===b);n.setAttribute("aria-pressed",String(n===b));});
   document.querySelector("#practiceNext").disabled=false;
   if(phase==="first")state.tutorialChoice=b.dataset.practiceAnswer;else state.tutorialFinal=b.dataset.practiceAnswer;
  });
  document.querySelector("#practiceNext").onclick=()=>{
   if(phase==="first"&&!state.tutorialChoice)return;
   if(phase==="second"&&!state.tutorialFinal)return;
   state.tutorialPhase=phase==="first"?"second":"explain";save();render();
  };
 }
}
