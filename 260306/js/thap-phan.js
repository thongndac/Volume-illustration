/* ════════════════════════════════════════════
   SỐ THẬP PHÂN — Decimal Module
   Modes: Luyện tập / Đổi số / Đặt tính
   Uses MATH helper for fraction display
   ════════════════════════════════════════════ */
(() => {
    let mode = 'practice', score = 0, streak = 0, bestStreak = 0;
    let currentQ = null;

    const MOD = {
        render(el) {
            el.innerHTML = `
                <div class="section-header">
                    <h2>🔢 Số Thập Phân</h2>
                    <p>Cộng · Trừ · Nhân · Chia số thập phân</p>
                </div>
                <div class="pill-group" id="tp-pills">
                    <button class="pill active" data-m="practice">🎯 Luyện tập</button>
                    <button class="pill" data-m="convert">🔄 Đổi số</button>
                    <button class="pill" data-m="lineup">📐 Đặt tính</button>
                </div>
                <div id="tp-body"></div>`;
            el.querySelectorAll('#tp-pills .pill').forEach(p => {
                p.addEventListener('click', () => {
                    el.querySelectorAll('#tp-pills .pill').forEach(b => b.classList.remove('active'));
                    p.classList.add('active');
                    mode = p.dataset.m;
                    renderMode(el.querySelector('#tp-body'));
                });
            });
            renderMode(el.querySelector('#tp-body'));
        },
        destroy() { currentQ = null; }
    };

    function renderMode(box) {
        if (mode === 'practice') renderPractice(box);
        else if (mode === 'convert') renderConvert(box);
        else renderLineup(box);
    }

    /* ── PRACTICE ── */
    function renderPractice(box) {
        score = 0; streak = 0;
        box.innerHTML = `
            <div class="card">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                    <span>⭐ Điểm: <b id="tp-score">0</b></span>
                    <span>🔥 Chuỗi: <b id="tp-streak">0</b> (Best: <b id="tp-best">0</b>)</span>
                </div>
                <div id="tp-question" class="card" style="text-align:center;font-size:1.2rem;padding:20px"></div>
                <div style="margin-top:12px">
                    <input type="number" class="input-field" id="tp-answer" placeholder="Nhập đáp án..." step="any">
                </div>
                <div style="display:flex;gap:8px;margin-top:12px">
                    <button class="btn btn-primary btn-full" id="tp-check">✅ Kiểm tra</button>
                    <button class="btn btn-secondary" id="tp-skip">⏭ Bỏ qua</button>
                </div>
                <div id="tp-feedback" style="margin-top:12px"></div>
            </div>`;
        newQuestion(box);
        box.querySelector('#tp-check').addEventListener('click', () => checkAnswer(box));
        box.querySelector('#tp-skip').addEventListener('click', () => newQuestion(box));
        box.querySelector('#tp-answer').addEventListener('keydown', e => { if (e.key === 'Enter') checkAnswer(box); });
    }

    function newQuestion(box) {
        const ops = ['+', '-', '×', '÷'];
        const op = ops[Math.floor(Math.random() * 4)];
        let a, b, ans;
        if (op === '+' || op === '-') {
            a = +(Math.random() * 50 + 1).toFixed(1);
            b = +(Math.random() * 30 + 1).toFixed(1);
            if (op === '-' && b > a) [a, b] = [b, a];
            ans = op === '+' ? +(a + b).toFixed(2) : +(a - b).toFixed(2);
        } else if (op === '×') {
            a = +(Math.random() * 20 + 1).toFixed(1);
            b = +(Math.random() * 9 + 1).toFixed(1);
            ans = +(a * b).toFixed(2);
        } else {
            b = +(Math.random() * 9 + 1).toFixed(1);
            ans = +(Math.random() * 20 + 1).toFixed(1);
            a = +(b * ans).toFixed(2);
        }
        currentQ = { a, b, op, ans };
        const qBox = box.querySelector('#tp-question');
        qBox.innerHTML = MATH.expr(MATH.val(a), MATH.op(op), MATH.val(b), MATH.eq(), MATH.txt('?'));
        box.querySelector('#tp-answer').value = '';
        box.querySelector('#tp-answer').focus();
        box.querySelector('#tp-feedback').innerHTML = '';
    }

    function checkAnswer(box) {
        if (!currentQ) return;
        const inp = parseFloat(box.querySelector('#tp-answer').value);
        const fb = box.querySelector('#tp-feedback');
        if (Math.abs(inp - currentQ.ans) < 0.01) {
            score += 10; streak++;
            if (streak > bestStreak) bestStreak = streak;
            fb.innerHTML = `<div class="answer-box" style="border-color:rgba(52,211,153,0.4)">
                ✅ Đúng! ${MATH.expr(MATH.val(currentQ.a), MATH.op(currentQ.op), MATH.val(currentQ.b), MATH.eq(), MATH.val(currentQ.ans))}
            </div>`;
            setTimeout(() => newQuestion(box), 1200);
        } else {
            streak = 0;
            fb.innerHTML = `<div class="answer-box" style="border-color:rgba(248,113,113,0.4);background:rgba(248,113,113,0.1)">
                ❌ Sai! Đáp án: ${MATH.expr(MATH.val(currentQ.a), MATH.op(currentQ.op), MATH.val(currentQ.b), MATH.eq(), MATH.val(currentQ.ans))}
            </div>`;
        }
        box.querySelector('#tp-score').textContent = score;
        box.querySelector('#tp-streak').textContent = streak;
        box.querySelector('#tp-best').textContent = bestStreak;
    }

    /* ── CONVERT ── */
    function renderConvert(box) {
        box.innerHTML = `
            <div class="grid-2">
                <div class="card">
                    <h3>📊 Phân số → Thập phân</h3>
                    <div class="input-group"><label>Tử số</label>
                        <input type="number" class="input-field" id="cv-num" value="3"></div>
                    <div class="input-group"><label>Mẫu số</label>
                        <input type="number" class="input-field" id="cv-den" value="4" min="1"></div>
                    <div id="cv-r1" style="margin-top:12px"></div>
                </div>
                <div class="card">
                    <h3>🔢 Thập phân → Phân số</h3>
                    <div class="input-group"><label>Số thập phân</label>
                        <input type="text" class="input-field" id="cv-dec" value="0.375"></div>
                    <div id="cv-r2" style="margin-top:12px"></div>
                </div>
            </div>`;
        const updateF2D = () => {
            const n = parseInt(box.querySelector('#cv-num').value) || 0;
            const d = parseInt(box.querySelector('#cv-den').value) || 1;
            const dec = n / d;
            const r = box.querySelector('#cv-r1');
            r.innerHTML =
                MATH.step(1, MATH.expr(MATH.frac(n, d), MATH.eq(), MATH.val(n), MATH.op('÷'), MATH.val(d))) +
                MATH.answer(MATH.frac(n, d) + MATH.eq() + MATH.val(dec.toFixed(dec % 1 === 0 ? 0 : 4).replace(/0+$/, '').replace(/\.$/, '')));
        };
        const updateD2F = () => {
            const v = box.querySelector('#cv-dec').value.trim();
            const dec = parseFloat(v);
            const r = box.querySelector('#cv-r2');
            if (isNaN(dec)) { r.innerHTML = ''; return; }
            const parts = v.split('.');
            const places = parts[1] ? parts[1].length : 0;
            const den = Math.pow(10, places);
            const num = Math.round(dec * den);
            const g = MATH.gcd(num, den);
            const sn = num / g, sd = den / g;
            let html = MATH.step(1, MATH.expr(MATH.val(v), MATH.eq(), MATH.frac(num, den)));
            if (g > 1) {
                html += MATH.step(2, MATH.expr(MATH.txt('Rút gọn cho'), MATH.val(g), MATH.txt(':')));
                html += MATH.answer(MATH.frac(num, den) + MATH.eq() + MATH.frac(sn, sd));
            } else {
                html += MATH.answer(MATH.frac(sn, sd));
            }
            r.innerHTML = html;
        };
        box.querySelector('#cv-num').addEventListener('input', updateF2D);
        box.querySelector('#cv-den').addEventListener('input', updateF2D);
        box.querySelector('#cv-dec').addEventListener('input', updateD2F);
        updateF2D(); updateD2F();
    }

    /* ── LINEUP (Đặt tính) ── */
    function renderLineup(box) {
        box.innerHTML = `
            <div class="card">
                <h3>📐 Đặt tính thẳng hàng</h3>
                <div class="grid-2">
                    <div class="input-group"><label>Số A</label>
                        <input type="text" class="input-field" id="lu-a" value="12.45"></div>
                    <div class="input-group"><label>Số B</label>
                        <input type="text" class="input-field" id="lu-b" value="3.8"></div>
                </div>
                <div class="pill-group" style="margin-top:8px" id="lu-ops">
                    <button class="pill active" data-op="+">➕ Cộng</button>
                    <button class="pill" data-op="-">➖ Trừ</button>
                </div>
                <div id="lu-result" style="margin-top:16px"></div>
            </div>`;
        let op = '+';
        const calc = () => {
            const a = box.querySelector('#lu-a').value.trim();
            const b = box.querySelector('#lu-b').value.trim();
            const va = parseFloat(a), vb = parseFloat(b);
            if (isNaN(va) || isNaN(vb)) return;
            const ans = op === '+' ? va + vb : va - vb;
            // Format vertical alignment
            const dA = (a.split('.')[1] || '').length;
            const dB = (b.split('.')[1] || '').length;
            const maxD = Math.max(dA, dB);
            const fA = va.toFixed(maxD), fB = vb.toFixed(maxD), fAns = ans.toFixed(maxD);
            const maxLen = Math.max(fA.length, fB.length, fAns.length) + 2;

            const pad = s => s.padStart(maxLen);
            box.querySelector('#lu-result').innerHTML = `
                <pre style="font-family:'JetBrains Mono',monospace;font-size:1.3rem;color:var(--accent-yellow);line-height:1.8;text-align:right;background:rgba(15,23,42,0.5);padding:20px;border-radius:12px;border-left:3px solid #7c3aed">
${pad(fA)}
<span style="color:var(--accent-pink)">${op}</span>${fB.padStart(maxLen - 1)}
${'─'.repeat(maxLen)}
<span style="color:var(--accent-green);font-weight:800">${pad(fAns)}</span>
</pre>
                ${MATH.answer(MATH.val(va) + MATH.op(op) + MATH.val(vb) + MATH.eq() + MATH.val(parseFloat(fAns)))}`;
        };
        box.querySelectorAll('#lu-ops .pill').forEach(p => {
            p.addEventListener('click', () => {
                box.querySelectorAll('#lu-ops .pill').forEach(b => b.classList.remove('active'));
                p.classList.add('active');
                op = p.dataset.op;
                calc();
            });
        });
        box.querySelector('#lu-a').addEventListener('input', calc);
        box.querySelector('#lu-b').addEventListener('input', calc);
        calc();
    }

    APP.register('thap-phan', MOD);
})();
