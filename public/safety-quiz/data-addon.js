/* Load the diverse source-backed question bank created at build time. */
(function(){
  const legacyQuestion=question;
  question=function(i){
    const item=DATA[i];
    if(item&&item.prompt)return {...item,wording:item.prompt,category:item.category,correct:item.correct,cl:item.classId,yes:item.correct==='是'};
    return legacyQuestion(i);
  };
  function banner(status,detail){
    let n=document.getElementById('bank-status');
    if(!n){n=document.createElement('p');n.id='bank-status';n.className='bank-status';const h=document.querySelector('.site-head');h&&h.insertAdjacentElement('afterend',n);}
    n.textContent=detail;n.dataset.kind=status;
  }
  function gate(allowed){
    const a=document.querySelector('#startDemo'),b=document.querySelector('#startFull');
    if(a)a.disabled=!allowed;if(b)b.disabled=!allowed;
  }
  banner('loading','正在讀取多題材工業安全題庫……');
  gate(false);
  fetch('./data.json',{cache:'no-store'})
   .then(async res=>{if(!res.ok)throw Error('題庫清單未部署（HTTP '+res.status+'）');return res.json();})
   .then(async items=>{
     const response=await fetch('./tutorial.json',{cache:'no-store'});
     if(!response.ok)throw Error('2 題教學照片尚未部署');
     const practice=await response.json();
     if(!Array.isArray(practice)||practice.length!==2||practice.some(q=>!q.image||!Array.isArray(q.boxes)||!q.boxes.length))
       throw Error('教學題資料無效');
     if(new Set(practice.map(q=>q.source+'|'+q.sourceOriginal)).size!==2)throw Error('教學題重複');
     PRACTICE.splice(0,PRACTICE.length,...practice);
     if(items.length!==48||new Set(items.map(q=>q.source+'|'+q.sourceOriginal)).size!==48)throw Error('題數或原始圖像去重失敗');
     if(new Set(items.map(q=>q.category)).size<8)throw Error('題材種類不足');
     if(items.some(q=>!q.image||!q.source||!q.prompt||!['是','否'].includes(q.correct)))throw Error('題目資料不完整');
     DATA.splice(0,DATA.length,...items);
     BASE.splice(0,BASE.length,...DATA.map((_,i)=>question(i)));
     window.__safetyBankReady=true;
     banner('ok','48 題與 2 題教學已載入');
     gate(true);
     if(['intro','review','tutorial','quiz'].includes(state.screen))render();
   })
   .catch(err=>{
     window.__safetyBankReady=false;
     banner('error','多題材題庫暫時無法載入：'+err.message+'。請稍後重新整理，不會改用舊的安全帽題庫充數。');
     gate(false);
   });
  const originalStart=startMode;
  startMode=function(mode){
    if(!window.__safetyBankReady){alert('多題材題庫仍在載入中，請稍後再試。');return;}
    return originalStart(mode);
  };
  const oldRender=render;
  render=function(){
    oldRender();
    if(!window.__safetyBankReady)gate(false);
  };
})();
