export function showCustomPrompt(title, defaultValue, onConfirm) {
    const overlay = document.createElement('div');
    overlay.style = `position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(5,5,8,0.8); backdrop-filter:blur(10px); display:flex; align-items:center; justify-content:center; z-index:9999;`;
    overlay.innerHTML = `
        <div style="background:rgba(20,20,30,0.9); border:1px solid var(--accent-glow); padding:30px; border-radius:20px; width:400px; text-align:center;">
            <p style="color:#f0f0f5; margin-bottom:20px;">${title}</p>
            <input type="text" id="prompt-input" value="${defaultValue}" style="width:100%; padding:12px; border-radius:10px; border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.3); color:#fff; text-align:center; outline:none; border-color:var(--accent-glow);">
            <div style="display:flex; gap:12px; margin-top:20px;">
                <button id="prompt-cancel" style="flex:1; padding:10px; border-radius:10px; border:1px solid #444; background:transparent; color:#ccc; cursor:pointer;">Cancelar</button>
                <button id="prompt-confirm" style="flex:1; padding:10px; border-radius:10px; border:none; background:var(--accent-glow); color:#000; cursor:pointer; font-weight:bold;">Confirmar</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    const input = document.getElementById('prompt-input');
    input.focus(); input.select();
    
    const close = () => document.body.removeChild(overlay);
    document.getElementById('prompt-cancel').onclick = close;
    document.getElementById('prompt-confirm').onclick = () => { onConfirm(input.value); close(); };
    input.onkeydown = (e) => { 
        if (e.key === 'Enter') document.getElementById('prompt-confirm').click(); 
        if (e.key === 'Escape') close(); 
    };
}