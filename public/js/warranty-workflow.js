(() => {
  'use strict';
  const kind = document.getElementById('reg-form') ? 'registration' : 'claim';
  const prefix = kind === 'registration' ? 'r' : 'c';
  const form = document.getElementById(kind === 'registration' ? 'reg-form' : 'claim-form');
  if (!form) return;
  const $ = suffix => document.getElementById(`${prefix}-${suffix}`);
  const content = window.ALASKA_CONTENT || {};
  const models = content.warrantyModels || [];
  const types = content.warrantyTypes || {};
  const typeInput = $('type');
  typeInput.replaceChildren(new Option('Select product type', ''), ...Object.entries(types).map(([value, label]) => new Option(label, value)));
  const fields = {
    name: ['name', 'Full name'], phone: ['phone', 'Phone / WhatsApp'], email: ['email', 'Email address'], city: ['city', 'City'],
    product_type: ['type', 'Product type'], product_model: ['model', 'Product model'], serial_number: ['serial', 'Product serial number'],
    card_number: ['card', 'Warranty card number'], purchase_date: ['date', 'Purchase date'], dealer: ['dealer', 'Dealer / shop'],
  };
  if (kind === 'claim') Object.assign(fields, {registration_reference: ['reference', 'Registration reference'], problem_started_on: ['problem-date', 'Problem started'], usage: ['use', 'Used in'], issue: ['issue', 'Problem'], description: ['desc', 'Description']});
  const required = Object.keys(fields).filter(key => !['registration_reference','usage'].includes(key) && !(kind === 'claim' && key === 'card_number'));
  let uploadId = null, uploading = false, sending = false, submissionKey = crypto.randomUUID(), reviewed = null, uploadGeneration = 0;
  const feedback = document.createElement('p'); feedback.className = 'warranty-help'; feedback.setAttribute('role', 'status');
  $('file').closest('.sf-file').after(feedback);
  const clearUpload = document.createElement('button'); clearUpload.type = 'button'; clearUpload.textContent = 'Remove attachment'; clearUpload.className = 'warranty-file-remove'; clearUpload.hidden = true; feedback.after(clearUpload);
  const problem = $('err');
  const dialog = document.createElement('dialog'); dialog.className = 'warranty-review'; dialog.setAttribute('aria-labelledby','warranty-review-title');
  const title = document.createElement('h2'); title.id = 'warranty-review-title'; title.textContent = 'Verify your information';
  const body = document.createElement('dl');
  const edit = document.createElement('button'); edit.type = 'button'; edit.textContent = 'Edit information'; edit.className = 'btn-secondary';
  const confirm = document.createElement('button'); confirm.type = 'button'; confirm.textContent = 'Confirm and send'; confirm.className = 'btn-primary';
  const error = document.createElement('p'); error.setAttribute('role','alert');
  const actions = document.createElement('div'); actions.className = 'warranty-review-actions'; actions.append(edit,confirm);
  const reminder = document.createElement('p'); reminder.textContent = 'Check all values, including anything read from your document. Submission records your request; staff will verify warranty eligibility.';
  dialog.append(title,reminder,body,error,actions); document.body.append(dialog);
  edit.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{ if (!sending) $('submit')?.focus(); });
  dialog.addEventListener('cancel',e=>{ if(sending)e.preventDefault(); });
  function fillModels() {
    const type = typeInput.value;
    const family = ['dry-charge','maintenance-free'].includes(type) ? 'lead-acid' : type;
    document.getElementById(`${prefix}-models`).replaceChildren(...models.filter(m=>m.family===family).map(m=>new Option(m.name,m.name)));
  }
  typeInput.addEventListener('change',fillModels);
  fillModels();
  const today = new Date().toLocaleDateString('en-CA'); $('date').max=today; if(kind==='claim') $('problem-date').max=today;
  async function post(url,data) {
    const headers={'Accept':'application/json','X-CSRF-TOKEN':document.querySelector('meta[name="csrf-token"]')?.content || ''};
    const isFile=data instanceof FormData;
    if(!isFile) headers['Content-Type']='application/json';
    const response=await fetch(url,{method:'POST',headers,body:isFile?data:JSON.stringify(data),credentials:'same-origin'});
    const result=await response.json().catch(()=>({message:'Unable to submit. Reload the page and try again.'}));
    if(!response.ok) throw result;
    return result;
  }
  function collect() {
    const data={submission_key:submissionKey,upload_id:uploadId,consent:$('consent').checked};
    for(const [key,[id]] of Object.entries(fields)) data[key]=$(id).value.trim();
    return data;
  }
  function validate() {
    const data=collect(), missing=[];
    for(const [key,[id,label]] of Object.entries(fields)) {
      const element=$(id); let valid=!required.includes(key)||!!data[key];
      if(valid&&data[key]&&key==='email') valid=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data[key]);
      if(valid&&data[key]&&key==='phone') valid=/^[+\d][\d\s()-]{7,29}$/.test(data[key]);
      if(valid&&['purchase_date','problem_started_on'].includes(key)) valid=data[key]<=today;
      if(valid&&key==='problem_started_on') valid=data[key]>=data.purchase_date;
      element.setAttribute('aria-invalid',String(!valid));
      if(!valid) missing.push({element,label});
    }
    if(!$('consent').checked) missing.push({element:$('consent'),label:'Confirmation and privacy consent'});
    return missing;
  }
  clearUpload.addEventListener('click',()=>{ uploadGeneration++; uploading=false; uploadId=null; $('file').value=''; clearUpload.hidden=true; feedback.textContent='Attachment removed. Review any values already entered in the form.'; });
  $('file').addEventListener('change',async()=>{
    const generation=++uploadGeneration; uploadId=null; uploading=false;
    const file=$('file').files[0]; if(!file)return;
    clearUpload.hidden=false;
    if(file.size>5*1024*1024){ feedback.textContent='Choose a file up to 5 MB.'; $('file').value=''; return; }
    uploading=true; feedback.textContent='Reading document… You can continue entering fields while it is processed.';
    const before={}; for(const [key,[id]] of Object.entries(fields)) before[key]=$(id).value;
    try {
      const data=new FormData(); data.append('file',file);
      const result=await post('/warranty/uploads',data);
      if(generation!==uploadGeneration)return;
      uploadId=result.upload_id;
      // Do not overwrite anything the customer has already entered or edited.
      for(const [key,value] of Object.entries(result.fields||{})) {
        if(!fields[key])continue;
        const [id]=fields[key]; if(!before[key]&&!$(id).value) $(id).value=value;
      }
      fillModels();
      const remaining=validate();
      feedback.textContent=result.message+(remaining.length?' Complete/check: '+remaining.map(m=>m.label).join(', ')+'.':' All required fields are filled. Review the information before sending.');
    } catch(e) { if(generation===uploadGeneration) feedback.textContent=Object.values(e.errors||{}).flat().join(' ')||e.message||'Upload failed. Try again or remove the attachment and complete the form manually.'; }
    finally{if(generation===uploadGeneration)uploading=false;}
  });
  form.addEventListener('submit',e=>{
    e.preventDefault(); problem.textContent='';
    if(uploading){problem.textContent='Wait for the document to finish reading, or remove it.';return;}
    if($('file').files.length&&!uploadId){problem.textContent='The file has not uploaded successfully. Retry or remove it before submitting.';return;}
    const missing=validate();
    if(missing.length){problem.textContent='Please complete/check: '+missing.map(m=>m.label).join(', ')+'.';missing[0].element.focus();return;}
    reviewed=collect(); body.replaceChildren(); error.textContent='';
    for(const [key,[,label]] of Object.entries(fields)){const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd');dd.textContent=key==='product_type'?(types[reviewed[key]]||reviewed[key]):(reviewed[key]||'Not provided');body.append(dt,dd);}
    const dt=document.createElement('dt');dt.textContent='Attachment';const dd=document.createElement('dd');dd.textContent=$('file').files[0]?.name||'None';body.append(dt,dd);
    dialog.showModal();edit.focus();
  });
  confirm.addEventListener('click',async()=>{
    if(sending||!reviewed)return;
    sending=true;confirm.disabled=true;edit.disabled=true;error.textContent='';confirm.textContent='Saving…';
    try{
      const result=await post(form.action,{...reviewed,confirmed:true});
      dialog.close();const section=document.createElement('section');section.className='pg-success';section.setAttribute('role','status');section.tabIndex=-1;
      const h=document.createElement('h3');h.textContent=kind==='registration'?'Warranty registered':'Claim submitted';
      const ref=document.createElement('p');ref.className='pg-ref';ref.textContent=result.reference;
      const msg=document.createElement('p');msg.textContent=result.message;
      const stamp=document.createElement('p');stamp.textContent='Received: '+new Date(result.received_at).toLocaleString();
      const link=document.createElement('a');link.href=kind==='registration'?'/warranty-claim.html':'/warranty.html';link.textContent=kind==='registration'?'File a claim':'Register a warranty';link.className='btn-secondary';
      section.append(h,ref,msg,stamp,link);form.replaceWith(section);section.focus();
    }catch(e){error.textContent=Object.values(e.errors||{}).flat().join(' ')||e.message||'Unable to save. Please try again.';}
    finally{sending=false;confirm.disabled=false;edit.disabled=false;confirm.textContent='Confirm and send';}
  });
})();
