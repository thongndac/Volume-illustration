/* ════════════════════════════════════════════
   PHÂN SỐ — Fractions Module
   Modes: Trực quan / So sánh / Phép tính
   Uses MATH helper for fraction display
   ════════════════════════════════════════════ */
(() => {
    let mode = 'visual';

    const MOD = {
        render(el) {
            el.innerHTML = `
                <div class="section-header">
                    <h2>📊 Phân Số</h2>
                    <p>Tử số / Mẫu số = phần được tô</p>
                </div>
                <div class="pill-group" id="ps-pills">
                    <button class="pill active" data-m="visual">👁 Trực quan</button>
                    <button class="pill" data-m="compare">⚖ So sánh</button>
                    <button class="pill" data-m="calc">🧮 Phép tính</button>
                </div>
                <div id="ps-body"></div>`;
            el.querySelectorAll('#ps-pills .pill').forEach(p => {
                p.addEventListener('click', () => {
                    el.querySelectorAll('#ps-pills .pill').forEach(b => b.classList.remove('active'));
                    p.classList.add('active');
                    mode = p.dataset.m;
                    renderMode(el.querySelector('#ps-body'));
                });
            });
            renderMode(el.querySelector('#ps-body'));
        },
        destroy() { }
    };

    function renderMode(box) {
        if (mode === 'visual') renderVisual(box);
        else if (mode === 'compare') renderCompare(box);
        else renderCalc(box);
    }

    /* ── VISUAL ── */
    function renderVisual(box) {
        box.innerHTML = `
            <div class="card">
                <h3>🎨 Nhập phân số</h3>
                <div class="input-group"><label>Tử số</label>
                    <input type="number" class="input-field" id="ps-num" value="3" min="0" max="20"></div>
                <div class="input-group"><label>Mẫu số</label>
                    <input type="number" class="input-field" id="ps-den" value="4" min="1" max="20"></div>
                <div id="ps-info" class="answer-box" style="margin-top:12px"></div>
            </div>
            <div class="card" style="margin-top:16px">
                <h3>🔵 Hình tròn</h3>
                <canvas id="ps-circle" width="260" height="260" style="display:block;margin:0 auto"></canvas>
            </div>
            <div class="card" style="margin-top:16px">
                <h3>📊 Thanh</h3>
                <canvas id="ps-bar" width="400" height="60" style="display:block;margin:0 auto;max-width:100%"></canvas>
            </div>`;
        const numEl = box.querySelector('#ps-num'), denEl = box.querySelector('#ps-den');
        const draw = () => {
            const n = parseInt(numEl.value) || 0, d = parseInt(denEl.value) || 1;
            const info = box.querySelector('#ps-info');
            const dec = (n / d), pct = (dec * 100);
            // Show fraction display
            info.innerHTML = MATH.expr(
                MATH.frac(n, d),
                MATH.eq(),
                MATH.val(dec.toFixed(dec % 1 ? 3 : 0).replace(/\.?0+$/, '')),
                MATH.eq(),
                MATH.val(pct.toFixed(pct % 1 ? 1 : 0) + '%')
            );
            drawCircle(box.querySelector('#ps-circle'), n, d);
            drawBar(box.querySelector('#ps-bar'), n, d);
        };
        numEl.addEventListener('input', draw);
        denEl.addEventListener('input', draw);
        draw();
    }

    function drawCircle(canvas, n, d) {
        const ctx = canvas.getContext('2d'), cx = 130, cy = 130, r = 110;
        ctx.clearRect(0, 0, 260, 260);
        for (let i = 0; i < d; i++) {
            const a1 = (i / d) * Math.PI * 2 - Math.PI / 2;
            const a2 = ((i + 1) / d) * Math.PI * 2 - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, a1, a2);
            ctx.closePath();
            ctx.fillStyle = i < n ? 'rgba(96,165,250,0.7)' : 'rgba(255,255,255,0.06)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    function drawBar(canvas, n, d) {
        const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        const pw = w / d;
        for (let i = 0; i < d; i++) {
            ctx.fillStyle = i < n ? 'rgba(167,139,250,0.6)' : 'rgba(255,255,255,0.06)';
            ctx.fillRect(i * pw + 1, 2, pw - 2, h - 4);
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.strokeRect(i * pw + 1, 2, pw - 2, h - 4);
        }
    }

    /* ── COMPARE ── */
    function renderCompare(box) {
        box.innerHTML = `
            <div class="grid-2">
                <div class="card">
                    <h3>Phân số A</h3>
                    <div class="input-group"><label>Tử số</label>
                        <input type="number" class="input-field cmp" id="cmp-a-n" value="2" min="0"></div>
                    <div class="input-group"><label>Mẫu số</label>
                        <input type="number" class="input-field cmp" id="cmp-a-d" value="3" min="1"></div>
                    <canvas id="cmp-a-c" width="180" height="180" style="display:block;margin:8px auto 0"></canvas>
                </div>
                <div class="card">
                    <h3>Phân số B</h3>
                    <div class="input-group"><label>Tử số</label>
                        <input type="number" class="input-field cmp" id="cmp-b-n" value="3" min="0"></div>
                    <div class="input-group"><label>Mẫu số</label>
                        <input type="number" class="input-field cmp" id="cmp-b-d" value="5" min="1"></div>
                    <canvas id="cmp-b-c" width="180" height="180" style="display:block;margin:8px auto 0"></canvas>
                </div>
            </div>
            <div class="card" style="margin-top:16px" id="cmp-result"></div>`;
        const update = () => {
            const an = +box.querySelector('#cmp-a-n').value || 0;
            const ad = +box.querySelector('#cmp-a-d').value || 1;
            const bn = +box.querySelector('#cmp-b-n').value || 0;
            const bd = +box.querySelector('#cmp-b-d').value || 1;
            // Draw circles
            drawCircleCmp(box.querySelector('#cmp-a-c'), an, ad);
            drawCircleCmp(box.querySelector('#cmp-b-c'), bn, bd);
            // Compare with fraction display
            const va = an / ad, vb = bn / bd;
            const sign = va > vb ? '>' : va < vb ? '<' : '=';
            const signColor = sign === '>' ? '#34d399' : sign === '<' ? '#f87171' : '#fbbf24';

            // Step-by-step quy đồng
            const lcm = MATH.lcm(ad, bd);
            const newAn = an * (lcm / ad), newBn = bn * (lcm / bd);
            const res = box.querySelector('#cmp-result');
            res.innerHTML = `
                <h3>📐 So sánh</h3>
                ${MATH.step(1, MATH.expr(MATH.txt('Quy đồng mẫu số: BCNN'), MATH.lbl(`(${ad}, ${bd})`), MATH.eq(), MATH.val(lcm)))}
                ${MATH.step(2, MATH.expr(MATH.frac(an, ad), MATH.eq(), MATH.frac(newAn, lcm)))}
                ${MATH.step(3, MATH.expr(MATH.frac(bn, bd), MATH.eq(), MATH.frac(newBn, lcm)))}
                ${MATH.answer(
                MATH.frac(an, ad) +
                `<span class="eq" style="color:${signColor};font-size:1.6rem">${sign}</span>` +
                MATH.frac(bn, bd)
            )}`;
        };
        box.querySelectorAll('.cmp').forEach(i => i.addEventListener('input', update));
        update();
    }

    function drawCircleCmp(canvas, n, d) {
        const ctx = canvas.getContext('2d'), cx = 90, cy = 90, r = 76;
        ctx.clearRect(0, 0, 180, 180);
        for (let i = 0; i < d; i++) {
            const a1 = (i / d) * Math.PI * 2 - Math.PI / 2;
            const a2 = ((i + 1) / d) * Math.PI * 2 - Math.PI / 2;
            ctx.beginPath(); ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, r, a1, a2); ctx.closePath();
            ctx.fillStyle = i < n ? 'rgba(96,165,250,0.65)' : 'rgba(255,255,255,0.06)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1.5; ctx.stroke();
        }
    }

    /* ── CALCULATOR ── */
    function renderCalc(box) {
        box.innerHTML = `
            <div class="card">
                <h3>🧮 Phép tính phân số</h3>
                <div class="grid-2">
                    <div>
                        <div class="input-group"><label>Tử số A</label>
                            <input type="number" class="input-field calc-in" id="ca-n" value="2"></div>
                        <div class="input-group"><label>Mẫu số A</label>
                            <input type="number" class="input-field calc-in" id="ca-d" value="3" min="1"></div>
                    </div>
                    <div>
                        <div class="input-group"><label>Tử số B</label>
                            <input type="number" class="input-field calc-in" id="cb-n" value="1"></div>
                        <div class="input-group"><label>Mẫu số B</label>
                            <input type="number" class="input-field calc-in" id="cb-d" value="4" min="1"></div>
                    </div>
                </div>
                <div class="pill-group" style="margin-top:12px;justify-content:center" id="calc-ops">
                    <button class="pill active" data-op="+">➕ Cộng</button>
                    <button class="pill" data-op="-">➖ Trừ</button>
                    <button class="pill" data-op="×">✖ Nhân</button>
                    <button class="pill" data-op="÷">➗ Chia</button>
                </div>
            </div>
            <div class="card" style="margin-top:16px" id="calc-result"></div>`;
        let op = '+';
        box.querySelectorAll('#calc-ops .pill').forEach(p => {
            p.addEventListener('click', () => {
                box.querySelectorAll('#calc-ops .pill').forEach(b => b.classList.remove('active'));
                p.classList.add('active');
                op = p.dataset.op;
                doCalc();
            });
        });
        box.querySelectorAll('.calc-in').forEach(i => i.addEventListener('input', doCalc));

        function doCalc() {
            const an = +box.querySelector('#ca-n').value, ad = +box.querySelector('#ca-d').value || 1;
            const bn = +box.querySelector('#cb-n').value, bd = +box.querySelector('#cb-d').value || 1;
            const res = box.querySelector('#calc-result');
            let rn, rd, steps = '';

            // Step 1: Show the problem
            steps += MATH.step(1, MATH.expr(MATH.frac(an, ad), MATH.op(op), MATH.frac(bn, bd)));

            if (op === '+' || op === '-') {
                const lcm = MATH.lcm(ad, bd);
                const na = an * (lcm / ad), nb = bn * (lcm / bd);
                steps += MATH.step(2, MATH.expr(
                    MATH.txt('Quy đồng mẫu'),
                    MATH.val(lcm), MATH.txt(':'),
                    MATH.frac(na, lcm), MATH.op(op), MATH.frac(nb, lcm)
                ));
                rn = op === '+' ? na + nb : na - nb;
                rd = lcm;
                steps += MATH.step(3, MATH.expr(
                    MATH.frac(`${na} ${op === '+' ? '+' : '−'} ${nb}`, lcm),
                    MATH.eq(),
                    MATH.frac(rn, rd)
                ));
            } else if (op === '×') {
                rn = an * bn; rd = ad * bd;
                steps += MATH.step(2, MATH.expr(
                    MATH.frac(`${an} × ${bn}`, `${ad} × ${bd}`),
                    MATH.eq(),
                    MATH.frac(rn, rd)
                ));
            } else { // ÷
                rn = an * bd; rd = ad * bn;
                steps += MATH.step(2, MATH.expr(
                    MATH.frac(an, ad), MATH.op('×'), MATH.frac(bd, bn),
                    MATH.eq(), MATH.frac(rn, rd)
                ));
            }

            // Simplify
            const g = MATH.gcd(rn, rd);
            if (g > 1 && rd !== 0) {
                const sn = rn / g, sd = rd / g;
                steps += MATH.step(op === '×' || op === '÷' ? 3 : 4, MATH.expr(
                    MATH.txt('Rút gọn:'),
                    MATH.frac(rn, rd), MATH.eq(), MATH.frac(sn, sd)
                ));
                rn = sn; rd = sd;
            }

            // Answer
            if (rd === 1) {
                steps += MATH.answer(MATH.val(rn));
            } else if (Math.abs(rn) > rd && rd > 0) {
                const whole = Math.floor(Math.abs(rn) / rd);
                const rem = Math.abs(rn) % rd;
                const sign = rn < 0 ? '−' : '';
                steps += MATH.answer(
                    MATH.frac(rn, rd) + MATH.eq() +
                    MATH.val(`${sign}${whole}`) +
                    (rem ? MATH.frac(rem, rd) : '')
                );
            } else {
                steps += MATH.answer(MATH.frac(rn, rd));
            }

            res.innerHTML = `<h3>📝 Bài giải</h3>${steps}`;
        }
        doCalc();
    }

    APP.register('phan-so', MOD);
})();
