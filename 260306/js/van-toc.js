/* ════════════════════════════════════════════
   VẬN TỐC — Velocity Module (4 Tabs)
   Tab 1: Cơ bản (S=V×T)
   Tab 2: Hai xe gặp nhau (ngược chiều)
   Tab 3: Đuổi kịp (cùng chiều)
   Tab 4: Thời điểm (giờ đi/đến)
   ════════════════════════════════════════════ */
(() => {
    let mode = 'basic', animId = null;

    const MOD = {
        render(el) {
            el.innerHTML = `
                <div class="section-header">
                    <h2>🚀 Vận Tốc, Quãng Đường, Thời Gian</h2>
                    <p>S = V × T &nbsp;·&nbsp; V = S ÷ T &nbsp;·&nbsp; T = S ÷ V</p>
                </div>
                <div class="pill-group" id="vt-pills">
                    <button class="pill active" data-m="basic">🔢 Cơ bản</button>
                    <button class="pill" data-m="meet">🚗↔🏍️ Gặp nhau</button>
                    <button class="pill" data-m="chase">🚗→🏍️ Đuổi kịp</button>
                    <button class="pill" data-m="time">⏰ Thời điểm</button>
                </div>
                <div id="vt-body"></div>`;
            el.querySelectorAll('#vt-pills .pill').forEach(p => {
                p.addEventListener('click', () => {
                    el.querySelectorAll('#vt-pills .pill').forEach(b => b.classList.remove('active'));
                    p.classList.add('active');
                    mode = p.dataset.m;
                    cancelAnim();
                    renderMode(el.querySelector('#vt-body'));
                });
            });
            renderMode(el.querySelector('#vt-body'));
        },
        destroy() { cancelAnim(); }
    };

    function cancelAnim() { if (animId) { cancelAnimationFrame(animId); animId = null; } }

    function renderMode(box) {
        cancelAnim();
        if (mode === 'basic') renderBasic(box);
        else if (mode === 'meet') renderMeet(box);
        else if (mode === 'chase') renderChase(box);
        else renderTime(box);
    }

    /* ═══ TAB 1: CƠ BẢN ═══ */
    function renderBasic(box) {
        box.innerHTML = `
            <div class="card">
                <h3>🔢 Nhập giá trị (bỏ trống ô cần tìm)</h3>
                <div class="grid-2">
                    <div class="input-group"><label>Quãng đường S (km)</label>
                        <input type="number" class="input-field" id="vt-s" value="170" step="any"></div>
                    <div class="input-group"><label>Vận tốc V (km/h)</label>
                        <input type="number" class="input-field" id="vt-v" value="" step="any" placeholder="?"></div>
                    <div class="input-group"><label>Thời gian T (giờ)</label>
                        <input type="number" class="input-field" id="vt-t" value="4" step="any"></div>
                </div>
                <button class="btn btn-primary btn-full" id="vt-calc" style="margin-top:12px">📐 Tính</button>
            </div>
            <div id="vt-solution" style="margin-top:16px"></div>
            <div class="card" style="margin-top:16px">
                <canvas id="vt-anim" width="600" height="120" style="width:100%;border-radius:8px"></canvas>
            </div>`;
        box.querySelector('#vt-calc').addEventListener('click', () => solveBasic(box));
        solveBasic(box);
    }

    function solveBasic(box) {
        let s = box.querySelector('#vt-s').value, v = box.querySelector('#vt-v').value, t = box.querySelector('#vt-t').value;
        s = s !== '' ? parseFloat(s) : null;
        v = v !== '' ? parseFloat(v) : null;
        t = t !== '' ? parseFloat(t) : null;
        const sol = box.querySelector('#vt-solution');
        let steps = '', ans, label, unit;

        if (s === null && v !== null && t !== null) {
            ans = v * t; label = 'S';
            steps += MATH.step(1, MATH.expr(MATH.lbl('S'), MATH.eq(), MATH.lbl('V'), MATH.op('×'), MATH.lbl('T')));
            steps += MATH.step(2, MATH.expr(MATH.lbl('S'), MATH.eq(), MATH.val(v), MATH.op('×'), MATH.val(t)));
            steps += MATH.answer(MATH.lbl('S') + MATH.eq() + MATH.val(ans) + MATH.unit('km'));
            box.querySelector('#vt-s').value = ans;
        } else if (v === null && s !== null && t !== null) {
            ans = s / t; label = 'V';
            steps += MATH.step(1, MATH.expr(MATH.lbl('V'), MATH.eq(), MATH.frac('S', 'T')));
            steps += MATH.step(2, MATH.expr(MATH.lbl('V'), MATH.eq(), MATH.frac(s, t)));
            steps += MATH.answer(MATH.lbl('V') + MATH.eq() + MATH.val(+ans.toFixed(2)) + MATH.unit('km/giờ'));
            box.querySelector('#vt-v').value = +ans.toFixed(2);
        } else if (t === null && s !== null && v !== null) {
            ans = s / v; label = 'T';
            steps += MATH.step(1, MATH.expr(MATH.lbl('T'), MATH.eq(), MATH.frac('S', 'V')));
            steps += MATH.step(2, MATH.expr(MATH.lbl('T'), MATH.eq(), MATH.frac(s, v)));
            const hrs = Math.floor(ans), mins = Math.round((ans - hrs) * 60);
            let timeStr = MATH.val(+ans.toFixed(2)) + MATH.unit('giờ');
            if (mins > 0 && hrs > 0) timeStr += ' ' + MATH.eq() + ' ' + MATH.val(`${hrs} giờ ${mins} phút`);
            steps += MATH.answer(MATH.lbl('T') + MATH.eq() + timeStr);
            box.querySelector('#vt-t').value = +ans.toFixed(2);
        } else {
            steps = '<p style="color:var(--text-secondary);text-align:center;padding:16px">Hãy bỏ trống đúng 1 ô để tính</p>';
        }
        sol.innerHTML = `<div class="card solution-card"><h3>📝 Bài giải</h3>${steps}</div>`;
        // Animation
        if (ans) animateCar(box.querySelector('#vt-anim'), v || ans, s || ans);
    }

    function animateCar(canvas, speed, dist) {
        cancelAnim();
        const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
        let x = 40;
        const maxX = w - 60;
        function draw() {
            ctx.clearRect(0, 0, w, h);
            // Road
            ctx.fillStyle = '#1e293b'; ctx.fillRect(0, h / 2 - 4, w, 8);
            ctx.setLineDash([12, 8]); ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
            ctx.setLineDash([]);
            // Car
            ctx.fillStyle = '#60a5fa'; ctx.fillRect(x, h / 2 - 22, 40, 18);
            ctx.fillStyle = '#93c5fd'; ctx.fillRect(x + 8, h / 2 - 32, 24, 12);
            ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(x + 10, h / 2, 5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x + 30, h / 2, 5, 0, Math.PI * 2); ctx.fill();
            // Labels
            ctx.fillStyle = '#94a3b8'; ctx.font = '12px Nunito'; ctx.textAlign = 'center';
            ctx.fillText('A', 30, h - 8); ctx.fillText('B', w - 30, h - 8);
            ctx.fillStyle = '#fbbf24'; ctx.font = 'bold 13px Nunito';
            ctx.fillText(`${speed} km/h`, x + 20, h / 2 - 38);
            // Move
            x += 1.5;
            if (x > maxX) x = 40;
            animId = requestAnimationFrame(draw);
        }
        draw();
    }

    /* ═══ TAB 2: HAI XE GẶP NHAU ═══ */
    function renderMeet(box) {
        box.innerHTML = `
            <div class="card">
                <h3>🚗↔🏍️ Hai xe ngược chiều — Tìm thời gian gặp nhau</h3>
                <div class="grid-2">
                    <div class="input-group"><label>Quãng đường AB (km)</label>
                        <input type="number" class="input-field" id="mt-s" value="180" step="any"></div>
                    <div class="input-group"><label>Vận tốc xe 1 — V₁ (km/h)</label>
                        <input type="number" class="input-field" id="mt-v1" value="54" step="any"></div>
                    <div class="input-group"><label>Vận tốc xe 2 — V₂ (km/h)</label>
                        <input type="number" class="input-field" id="mt-v2" value="36" step="any"></div>
                </div>
                <button class="btn btn-primary btn-full" style="margin-top:12px" id="mt-calc">📐 Tính</button>
            </div>
            <div id="mt-solution" style="margin-top:16px"></div>
            <div class="card" style="margin-top:16px">
                <canvas id="mt-anim" width="600" height="140" style="width:100%;border-radius:8px"></canvas>
            </div>`;
        box.querySelector('#mt-calc').addEventListener('click', () => solveMeet(box));
        solveMeet(box);
    }

    function solveMeet(box) {
        const s = parseFloat(box.querySelector('#mt-s').value) || 0;
        const v1 = parseFloat(box.querySelector('#mt-v1').value) || 0;
        const v2 = parseFloat(box.querySelector('#mt-v2').value) || 0;
        const sol = box.querySelector('#mt-solution');
        const vSum = v1 + v2;
        const t = vSum > 0 ? s / vSum : 0;
        const hrs = Math.floor(t), mins = Math.round((t - hrs) * 60);

        let steps = '';
        steps += MATH.step(1, MATH.expr(MATH.txt('Mỗi giờ, cả hai xe đi được:')));
        steps += MATH.step(2, MATH.expr(
            MATH.lbl('V₁'), MATH.op('+'), MATH.lbl('V₂'), MATH.eq(),
            MATH.val(v1), MATH.op('+'), MATH.val(v2), MATH.eq(),
            MATH.val(vSum), MATH.unit('km/giờ')
        ));
        steps += MATH.step(3, MATH.expr(MATH.txt('Thời gian gặp nhau:')));
        steps += MATH.step(4, MATH.expr(
            MATH.lbl('T'), MATH.eq(),
            MATH.frac('S', 'V₁ + V₂'), MATH.eq(),
            MATH.frac(s, vSum)
        ));
        let timeStr = MATH.val(+t.toFixed(2)) + MATH.unit('giờ');
        if (mins > 0 && hrs >= 0 && t !== Math.round(t)) timeStr += ' ' + MATH.eq() + ' ' + MATH.val(`${hrs} giờ ${mins} phút`);
        steps += MATH.answer(MATH.lbl('T') + MATH.eq() + timeStr);

        sol.innerHTML = `<div class="card solution-card"><h3>📝 Bài giải</h3>${steps}</div>`;
        animateMeet(box.querySelector('#mt-anim'), v1, v2, s);
    }

    function animateMeet(canvas, v1, v2, s) {
        cancelAnim();
        const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
        const roadY = h / 2;
        const meetX = 40 + (w - 80) * (v1 / (v1 + v2));
        let x1 = 40, x2 = w - 40;
        const speed1 = 1.5 * (v1 / (v1 + v2 || 1));
        const speed2 = 1.5 * (v2 / (v1 + v2 || 1));
        let met = false;

        function draw() {
            ctx.clearRect(0, 0, w, h);
            // Road
            ctx.fillStyle = '#1e293b'; ctx.fillRect(0, roadY - 4, w, 8);
            ctx.setLineDash([12, 8]); ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0, roadY); ctx.lineTo(w, roadY); ctx.stroke();
            ctx.setLineDash([]);
            // Labels
            ctx.fillStyle = '#94a3b8'; ctx.font = '13px Nunito'; ctx.textAlign = 'center';
            ctx.fillText('A', 30, h - 6); ctx.fillText('B', w - 30, h - 6);
            ctx.fillStyle = '#fbbf24'; ctx.fillText(`${s} km`, w / 2, h - 6);
            // Car 1 (left → right)
            ctx.fillStyle = '#60a5fa'; ctx.fillRect(x1, roadY - 22, 36, 16);
            ctx.fillStyle = '#93c5fd'; ctx.fillRect(x1 + 6, roadY - 30, 20, 10);
            ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(x1 + 8, roadY, 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x1 + 28, roadY, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#60a5fa'; ctx.font = 'bold 11px Nunito';
            ctx.fillText(`${v1}km/h →`, x1 + 18, roadY - 36);
            // Car 2 (right → left)
            ctx.fillStyle = '#f472b6'; ctx.fillRect(x2 - 36, roadY - 22, 36, 16);
            ctx.fillStyle = '#f9a8d4'; ctx.fillRect(x2 - 28, roadY - 30, 20, 10);
            ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(x2 - 28, roadY, 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x2 - 8, roadY, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#f472b6'; ctx.font = 'bold 11px Nunito';
            ctx.fillText(`← ${v2}km/h`, x2 - 18, roadY - 36);

            if (!met) {
                x1 += speed1; x2 -= speed2;
                if (x1 + 36 >= x2 - 36) {
                    met = true;
                    // Flash
                    ctx.fillStyle = '#34d399'; ctx.font = 'bold 16px Nunito';
                    ctx.fillText('🤝 GẶP NHAU!', (x1 + x2) / 2, roadY + 30);
                }
            } else {
                ctx.fillStyle = '#34d399'; ctx.font = 'bold 16px Nunito';
                ctx.fillText('🤝 GẶP NHAU!', (x1 + x2) / 2, roadY + 30);
                // Reset after pause
                setTimeout(() => { x1 = 40; x2 = w - 40; met = false; }, 2000);
            }
            animId = requestAnimationFrame(draw);
        }
        draw();
    }

    /* ═══ TAB 3: ĐUỔI KỊP ═══ */
    function renderChase(box) {
        box.innerHTML = `
            <div class="card">
                <h3>🚗→🏍️ Bài toán đuổi kịp — cùng chiều</h3>
                <div class="grid-2">
                    <div class="input-group"><label>Khoảng cách ban đầu (km)</label>
                        <input type="number" class="input-field" id="ch-d" value="48" step="any"></div>
                    <div class="input-group"><label>V₁ — xe đuổi (km/h)</label>
                        <input type="number" class="input-field" id="ch-v1" value="36" step="any"></div>
                    <div class="input-group"><label>V₂ — xe bị đuổi (km/h)</label>
                        <input type="number" class="input-field" id="ch-v2" value="12" step="any"></div>
                </div>
                <button class="btn btn-primary btn-full" style="margin-top:12px" id="ch-calc">📐 Tính</button>
            </div>
            <div id="ch-solution" style="margin-top:16px"></div>
            <div class="card" style="margin-top:16px">
                <canvas id="ch-anim" width="600" height="140" style="width:100%;border-radius:8px"></canvas>
            </div>`;
        box.querySelector('#ch-calc').addEventListener('click', () => solveChase(box));
        solveChase(box);
    }

    function solveChase(box) {
        const d = parseFloat(box.querySelector('#ch-d').value) || 0;
        const v1 = parseFloat(box.querySelector('#ch-v1').value) || 0;
        const v2 = parseFloat(box.querySelector('#ch-v2').value) || 0;
        const sol = box.querySelector('#ch-solution');

        if (v1 <= v2) {
            sol.innerHTML = `<div class="card solution-card"><h3>⚠️</h3><p style="color:var(--accent-red)">V₁ phải lớn hơn V₂ để đuổi kịp!</p></div>`;
            return;
        }

        const vDiff = v1 - v2;
        const t = d / vDiff;
        const hrs = Math.floor(t), mins = Math.round((t - hrs) * 60);

        let steps = '';
        steps += MATH.step(1, MATH.expr(MATH.txt('Mỗi giờ, xe đuổi gần thêm:')));
        steps += MATH.step(2, MATH.expr(
            MATH.lbl('V₁'), MATH.op('−'), MATH.lbl('V₂'), MATH.eq(),
            MATH.val(v1), MATH.op('−'), MATH.val(v2), MATH.eq(),
            MATH.val(vDiff), MATH.unit('km/giờ')
        ));
        steps += MATH.step(3, MATH.expr(MATH.txt('Thời gian đuổi kịp:')));
        steps += MATH.step(4, MATH.expr(
            MATH.lbl('T'), MATH.eq(),
            MATH.frac('Khoảng cách', 'V₁ − V₂'), MATH.eq(),
            MATH.frac(d, vDiff)
        ));
        let timeStr = MATH.val(+t.toFixed(2)) + MATH.unit('giờ');
        if (mins > 0 && t !== Math.round(t)) timeStr += ' ' + MATH.eq() + ' ' + MATH.val(`${hrs} giờ ${mins} phút`);
        steps += MATH.answer(MATH.lbl('T') + MATH.eq() + timeStr);

        sol.innerHTML = `<div class="card solution-card"><h3>📝 Bài giải</h3>${steps}</div>`;
        animateChase(box.querySelector('#ch-anim'), v1, v2, d);
    }

    function animateChase(canvas, v1, v2, dist) {
        cancelAnim();
        const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
        const roadY = h / 2;
        let x1 = 40, x2 = 200; // x2 starts ahead
        const scale = v1 / 60;
        const s1 = scale, s2 = scale * (v2 / v1);
        let caught = false;

        function draw() {
            ctx.clearRect(0, 0, w, h);
            // Road
            ctx.fillStyle = '#1e293b'; ctx.fillRect(0, roadY - 4, w, 8);
            ctx.setLineDash([12, 8]); ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0, roadY); ctx.lineTo(w, roadY); ctx.stroke();
            ctx.setLineDash([]);
            // Distance label
            ctx.fillStyle = '#fbbf24'; ctx.font = '12px Nunito'; ctx.textAlign = 'center';
            ctx.fillText(`← ${dist}km →`, (x1 + x2) / 2, h - 6);
            // Car 1 (chaser, blue, faster)
            ctx.fillStyle = '#60a5fa'; ctx.fillRect(x1, roadY - 22, 36, 16);
            ctx.fillStyle = '#93c5fd'; ctx.fillRect(x1 + 6, roadY - 30, 20, 10);
            ctx.fillStyle = '#1e293b';
            ctx.beginPath(); ctx.arc(x1 + 8, roadY, 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x1 + 28, roadY, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#60a5fa'; ctx.font = 'bold 11px Nunito';
            ctx.fillText(`${v1}km/h →`, x1 + 18, roadY - 36);
            // Car 2 (prey, pink, slower)
            ctx.fillStyle = '#fb923c'; ctx.fillRect(x2, roadY - 22, 36, 16);
            ctx.fillStyle = '#fdba74'; ctx.fillRect(x2 + 6, roadY - 30, 20, 10);
            ctx.fillStyle = '#1e293b';
            ctx.beginPath(); ctx.arc(x2 + 8, roadY, 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x2 + 28, roadY, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fb923c'; ctx.font = 'bold 11px Nunito';
            ctx.fillText(`${v2}km/h →`, x2 + 18, roadY - 36);

            if (!caught) {
                x1 += s1; x2 += s2;
                if (x1 + 36 >= x2) caught = true;
                if (x2 > w - 40) { x1 = 40; x2 = 200; }
            } else {
                ctx.fillStyle = '#34d399'; ctx.font = 'bold 16px Nunito'; ctx.textAlign = 'center';
                ctx.fillText('🏁 ĐUỔI KỊP!', x1 + 36, roadY + 30);
                setTimeout(() => { x1 = 40; x2 = 200; caught = false; }, 2000);
            }
            animId = requestAnimationFrame(draw);
        }
        draw();
    }

    /* ═══ TAB 4: THỜI ĐIỂM ═══ */
    function renderTime(box) {
        box.innerHTML = `
            <div class="card">
                <h3>⏰ Tính thời điểm đến</h3>
                <div class="grid-2">
                    <div class="input-group"><label>Giờ khởi hành</label>
                        <input type="time" class="input-field" id="tm-start" value="08:45"></div>
                    <div class="input-group"><label>Quãng đường S (km)</label>
                        <input type="number" class="input-field" id="tm-s" value="2150" step="any"></div>
                    <div class="input-group"><label>Vận tốc V (km/h)</label>
                        <input type="number" class="input-field" id="tm-v" value="860" step="any"></div>
                </div>
                <button class="btn btn-primary btn-full" style="margin-top:12px" id="tm-calc">📐 Tính giờ đến</button>
            </div>
            <div id="tm-solution" style="margin-top:16px"></div>`;
        box.querySelector('#tm-calc').addEventListener('click', () => solveTime(box));
        solveTime(box);
    }

    function solveTime(box) {
        const startTime = box.querySelector('#tm-start').value;
        const s = parseFloat(box.querySelector('#tm-s').value) || 0;
        const v = parseFloat(box.querySelector('#tm-v').value) || 1;
        const sol = box.querySelector('#tm-solution');

        const t = s / v; // hours
        const hrs = Math.floor(t);
        const mins = Math.round((t - hrs) * 60);

        // Parse start time
        const [startH, startM] = startTime.split(':').map(Number);
        let endM = startM + mins;
        let endH = startH + hrs + Math.floor(endM / 60);
        endM = endM % 60;
        if (endH >= 24) endH -= 24;

        const fmtTime = (h, m) => `${h} giờ ${m > 0 ? m + ' phút' : ''}`;
        const fmtClock = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

        let steps = '';
        steps += MATH.step(1, MATH.expr(MATH.txt('Thời gian đi:')));
        steps += MATH.step(2, MATH.expr(
            MATH.lbl('T'), MATH.eq(),
            MATH.frac('S', 'V'), MATH.eq(),
            MATH.frac(s, v), MATH.eq(),
            MATH.val(+t.toFixed(2)), MATH.unit('giờ')
        ));
        if (mins > 0 || hrs > 0) {
            steps += MATH.step(3, MATH.expr(
                MATH.eq(), MATH.val(fmtTime(hrs, mins))
            ));
        }
        steps += MATH.step(4, MATH.expr(MATH.txt('Giờ đến:')));
        steps += MATH.step(5, MATH.expr(
            MATH.val(fmtTime(startH, startM)),
            MATH.op('+'),
            MATH.val(fmtTime(hrs, mins)),
            MATH.eq(),
            `<span class="val" style="color:var(--accent-green);font-size:1.4rem">${fmtTime(endH, endM)}</span>`
        ));
        steps += MATH.answer(
            MATH.txt('Đến nơi lúc') +
            `<span class="val" style="color:var(--accent-green);font-size:1.5rem;margin-left:8px">${fmtClock(endH, endM)}</span>`
        );

        sol.innerHTML = `<div class="card solution-card"><h3>📝 Bài giải</h3>${steps}</div>`;
    }

    APP.register('van-toc', MOD);
})();
