/* ════════════════════════════════════════════
   MODULE: LUYỆN TẬP — Quiz tổng hợp
   Random questions from all topics
   Uses MATH helper for fraction display in questions
   ════════════════════════════════════════════ */
(() => {
    const MOD = {
        score: 0,
        total: 0,
        streak: 0,
        bestStreak: 0,
        currentAnswer: null,
        currentQuestion: null,
        timer: null,
        timeLeft: 0,

        render(el) {
            el.innerHTML = `
                <div class="section-header slide-up">
                    <h2>📝 Luyện Tập</h2>
                    <p>Thử thách kiến thức Toán lớp 5 — Trắc nghiệm tổng hợp!</p>
                </div>

                <div class="grid-2 slide-up" style="margin-bottom:16px">
                    <div class="card" style="text-align:center">
                        <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600">🏆 Điểm số</div>
                        <div style="font-size:2.5rem;font-weight:900" id="lt-score" class="f-green">0</div>
                        <div style="font-size:0.75rem;color:var(--text-muted)" id="lt-ratio">0/0 câu đúng</div>
                    </div>
                    <div class="card" style="text-align:center">
                        <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600">🔥 Chuỗi đúng</div>
                        <div style="font-size:2.5rem;font-weight:900" id="lt-streak" class="f-yellow">0</div>
                        <div style="font-size:0.75rem;color:var(--text-muted)" id="lt-best">Kỷ lục: 0</div>
                    </div>
                </div>

                <div class="card slide-up" id="lt-question-card" style="text-align:center">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
                        <span id="lt-topic-badge" style="padding:3px 10px;border-radius:20px;font-size:0.72rem;font-weight:700;background:rgba(96,165,250,0.15);color:var(--accent-blue)"></span>
                        <span id="lt-timer" style="font-size:0.85rem;font-weight:700;color:var(--accent-yellow)">⏱️ 30s</span>
                    </div>
                    <div style="font-size:1.2rem;font-weight:800;padding:24px 0" id="lt-question">Nhấn "Bắt đầu" để chơi!</div>
                    <div id="lt-choices" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px"></div>
                    <div id="lt-feedback" style="margin-top:12px;font-weight:700;min-height:30px"></div>
                </div>

                <div style="display:flex;gap:8px;justify-content:center;margin-top:16px" class="slide-up">
                    <button class="btn btn-primary" id="lt-start-btn" onclick="ModuleLuyenTap.newQuestion()">🎮 Bắt đầu</button>
                    <button class="btn btn-secondary" onclick="ModuleLuyenTap.resetScore()">🔄 Chơi lại</button>
                </div>
            `;
        },

        generateQuestion() {
            const topics = ['phan-so', 'thap-phan', 'hinh-hoc', 'van-toc', 'van-toc-meet', 'van-toc-chase'];
            const topic = topics[Math.floor(Math.random() * topics.length)];
            switch (topic) {
                case 'phan-so': return this.genFractionQ();
                case 'thap-phan': return this.genDecimalQ();
                case 'hinh-hoc': return this.genGeometryQ();
                case 'van-toc': return this.genVelocityQ();
                case 'van-toc-meet': return this.genMeetQ();
                case 'van-toc-chase': return this.genChaseQ();
            }
        },

        /* ── Fraction Questions ── */
        genFractionQ() {
            const type = Math.floor(Math.random() * 3);
            if (type === 0) {
                const a1 = Math.floor(Math.random() * 5) + 1;
                const a2 = Math.floor(Math.random() * 8) + 2;
                const b1 = Math.floor(Math.random() * 5) + 1;
                const b2 = Math.floor(Math.random() * 8) + 2;
                const va = a1 / a2, vb = b1 / b2;
                const answer = va > vb ? '>' : va < vb ? '<' : '=';
                return {
                    topic: '📊 Phân Số',
                    question: `So sánh: ${MATH.expr(MATH.frac(a1, a2), MATH.txt('◻'), MATH.frac(b1, b2))}`,
                    isHTML: true,
                    answer,
                    choices: ['>', '<', '='],
                    choiceLabels: [`${a1}/${a2} > ${b1}/${b2}`, `${a1}/${a2} < ${b1}/${b2}`, `${a1}/${a2} = ${b1}/${b2}`]
                };
            } else if (type === 1) {
                const d = Math.floor(Math.random() * 8) + 2;
                const a = Math.floor(Math.random() * (d - 1)) + 1;
                const b = Math.floor(Math.random() * (d - a)) + 1;
                const sum = a + b;
                const g = MATH.gcd(sum, d);
                const ansStr = g > 1 ? `${sum / g}/${d / g}` : `${sum}/${d}`;
                const wrong1 = `${a + b + 1}/${d}`;
                const wrong2 = `${a + b}/${d * 2}`;
                const choices = this.shuffleChoices(ansStr, wrong1, wrong2);
                return {
                    topic: '📊 Phân Số',
                    question: MATH.expr(MATH.frac(a, d), MATH.op('+'), MATH.frac(b, d), MATH.eq(), MATH.txt('?')),
                    isHTML: true,
                    answer: ansStr,
                    choices, choiceLabels: choices
                };
            } else {
                const pairs = [[1, 2, '0.5'], [1, 4, '0.25'], [3, 4, '0.75'], [1, 5, '0.2'], [2, 5, '0.4'], [3, 5, '0.6']];
                const [n, d, dec] = pairs[Math.floor(Math.random() * pairs.length)];
                const wrong1 = (parseFloat(dec) + 0.1).toFixed(1);
                const wrong2 = (parseFloat(dec) + 0.25).toFixed(2);
                const choices = this.shuffleChoices(dec, wrong1, wrong2);
                return {
                    topic: '📊 Phân Số',
                    question: MATH.expr(MATH.frac(n, d), MATH.eq(), MATH.txt('? (thập phân)')),
                    isHTML: true,
                    answer: dec,
                    choices, choiceLabels: choices
                };
            }
        },

        /* ── Decimal Questions ── */
        genDecimalQ() {
            const type = Math.floor(Math.random() * 2);
            if (type === 0) {
                const a = +(Math.random() * 50).toFixed(1);
                const b = +(Math.random() * 50).toFixed(1);
                const ans = +(a + b).toFixed(1);
                const wrong1 = +(ans + 0.1).toFixed(1);
                const wrong2 = +(ans - 1).toFixed(1);
                const choices = this.shuffleChoices(ans.toString(), wrong1.toString(), wrong2.toString());
                return {
                    topic: '🔢 Số Thập Phân',
                    question: MATH.expr(MATH.val(a), MATH.op('+'), MATH.val(b), MATH.eq(), MATH.txt('?')),
                    isHTML: true,
                    answer: ans.toString(),
                    choices, choiceLabels: choices
                };
            } else {
                const a = +(Math.random() * 10 + 1).toFixed(1);
                const b = Math.floor(Math.random() * 9 + 2);
                const ans = +(a * b).toFixed(1);
                const wrong1 = +(ans + b).toFixed(1);
                const wrong2 = +(ans - a).toFixed(1);
                const choices = this.shuffleChoices(ans.toString(), wrong1.toString(), wrong2.toString());
                return {
                    topic: '🔢 Số Thập Phân',
                    question: MATH.expr(MATH.val(a), MATH.op('×'), MATH.val(b), MATH.eq(), MATH.txt('?')),
                    isHTML: true,
                    answer: ans.toString(),
                    choices, choiceLabels: choices
                };
            }
        },

        /* ── Geometry Questions ── */
        genGeometryQ() {
            const type = Math.floor(Math.random() * 2);
            if (type === 0) {
                const a = Math.floor(Math.random() * 8) + 2;
                const b = Math.floor(Math.random() * 6) + 2;
                const h = Math.floor(Math.random() * 5) + 2;
                const ans = a * b * h;
                const wrong1 = a * b * (h + 1);
                const wrong2 = (a + b) * h;
                const choices = this.shuffleChoices(ans.toString(), wrong1.toString(), wrong2.toString());
                return {
                    topic: '🧊 Hình Học',
                    question: MATH.expr(MATH.txt('V hộp'), MATH.val(`${a}×${b}×${h}`), MATH.eq(), MATH.txt('?')),
                    isHTML: true,
                    answer: ans.toString(),
                    choices, choiceLabels: choices
                };
            } else {
                const r = Math.floor(Math.random() * 4) + 2;
                const h = Math.floor(Math.random() * 5) + 2;
                const ans = Math.round(Math.PI * r * r * h * 10) / 10;
                const wrong1 = Math.round(Math.PI * r * h * 10) / 10;
                const wrong2 = Math.round(2 * Math.PI * r * r * h * 10) / 10;
                const choices = this.shuffleChoices(ans.toString(), wrong1.toString(), wrong2.toString());
                return {
                    topic: '🧊 Hình Học',
                    question: MATH.expr(MATH.txt('V hình trụ'), MATH.val(`r=${r}, h=${h}`), MATH.eq(), MATH.txt('?')),
                    isHTML: true,
                    answer: ans.toString(),
                    choices, choiceLabels: choices
                };
            }
        },

        /* ── Velocity Basic Questions ── */
        genVelocityQ() {
            const type = Math.floor(Math.random() * 3);
            if (type === 0) {
                const v = (Math.floor(Math.random() * 8) + 3) * 10;
                const t = Math.floor(Math.random() * 5) + 2;
                const s = v * t;
                const wrong1 = v * (t + 1);
                const wrong2 = v + t;
                const choices = this.shuffleChoices(s + ' km', wrong1 + ' km', wrong2 + ' km');
                return {
                    topic: '🚀 Vận Tốc',
                    question: MATH.expr(MATH.lbl('V'), MATH.eq(), MATH.val(v + ' km/h'), MATH.txt(','), MATH.lbl('T'), MATH.eq(), MATH.val(t + 'h'), MATH.txt('→ S = ?')),
                    isHTML: true,
                    answer: s + ' km',
                    choices, choiceLabels: choices
                };
            } else if (type === 1) {
                const t = Math.floor(Math.random() * 4) + 2;
                const v = (Math.floor(Math.random() * 6) + 3) * 10;
                const s = v * t;
                const wrong1 = (v + 10) + ' km/h';
                const wrong2 = (v - 15) + ' km/h';
                const choices = this.shuffleChoices(v + ' km/h', wrong1, wrong2);
                return {
                    topic: '🚀 Vận Tốc',
                    question: MATH.expr(MATH.lbl('V'), MATH.eq(), MATH.frac(s, t), MATH.eq(), MATH.txt('?')),
                    isHTML: true,
                    answer: v + ' km/h',
                    choices, choiceLabels: choices
                };
            } else {
                const v = (Math.floor(Math.random() * 6) + 3) * 10;
                const t = Math.floor(Math.random() * 5) + 2;
                const s = v * t;
                const wrong1 = (t + 1) + ' giờ';
                const wrong2 = (t - 1 || 1) + ' giờ';
                const choices = this.shuffleChoices(t + ' giờ', wrong1, wrong2);
                return {
                    topic: '🚀 Vận Tốc',
                    question: MATH.expr(MATH.lbl('T'), MATH.eq(), MATH.frac(s, v), MATH.eq(), MATH.txt('?')),
                    isHTML: true,
                    answer: t + ' giờ',
                    choices, choiceLabels: choices
                };
            }
        },

        /* ── Meeting Questions (NEW) ── */
        genMeetQ() {
            const v1 = (Math.floor(Math.random() * 5) + 3) * 10; // 30-70
            const v2 = (Math.floor(Math.random() * 4) + 2) * 10; // 20-50
            const t = Math.floor(Math.random() * 3) + 2; // 2-4 hours
            const s = (v1 + v2) * t;
            const wrong1 = (t + 1) + ' giờ';
            const wrong2 = (t * 2) + ' giờ';
            const choices = this.shuffleChoices(t + ' giờ', wrong1, wrong2);
            return {
                topic: '🚗↔🏍️ Gặp nhau',
                question: MATH.expr(
                    MATH.txt('AB ='), MATH.val(s + 'km'), MATH.txt(','),
                    MATH.lbl('V₁'), MATH.eq(), MATH.val(v1), MATH.txt(','),
                    MATH.lbl('V₂'), MATH.eq(), MATH.val(v2),
                    MATH.txt('→ T = ?')
                ),
                isHTML: true,
                answer: t + ' giờ',
                choices, choiceLabels: choices
            };
        },

        /* ── Chase Questions (NEW) ── */
        genChaseQ() {
            const v1 = (Math.floor(Math.random() * 4) + 4) * 10; // 40-70 (faster)
            const v2 = (Math.floor(Math.random() * 3) + 1) * 10; // 10-30 (slower)
            const t = Math.floor(Math.random() * 3) + 2;
            const d = (v1 - v2) * t;
            const wrong1 = (t + 1) + ' giờ';
            const wrong2 = (t - 1 || 1) + ' giờ';
            const choices = this.shuffleChoices(t + ' giờ', wrong1, wrong2);
            return {
                topic: '🚗→🏍️ Đuổi kịp',
                question: MATH.expr(
                    MATH.txt('Cách'), MATH.val(d + 'km'), MATH.txt(','),
                    MATH.lbl('V₁'), MATH.eq(), MATH.val(v1), MATH.txt(','),
                    MATH.lbl('V₂'), MATH.eq(), MATH.val(v2),
                    MATH.txt('→ T = ?')
                ),
                isHTML: true,
                answer: t + ' giờ',
                choices, choiceLabels: choices
            };
        },

        shuffleChoices(correct, wrong1, wrong2) {
            const arr = [correct];
            if (wrong1 !== correct) arr.push(wrong1); else arr.push((parseFloat(correct) + 1) + '');
            if (wrong2 !== correct && wrong2 !== wrong1) arr.push(wrong2); else arr.push((parseFloat(correct) + 2) + '');
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        },

        newQuestion() {
            const q = this.generateQuestion();
            this.currentQuestion = q;
            this.currentAnswer = q.answer;

            document.getElementById('lt-topic-badge').textContent = q.topic;
            const qEl = document.getElementById('lt-question');
            if (q.isHTML) {
                qEl.innerHTML = q.question;
            } else {
                qEl.textContent = q.question;
            }
            document.getElementById('lt-feedback').innerHTML = '';

            const choicesEl = document.getElementById('lt-choices');
            choicesEl.innerHTML = '';
            q.choices.forEach((c, i) => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-secondary btn-full';
                btn.style.padding = '14px';
                btn.style.fontSize = '1rem';
                btn.textContent = q.choiceLabels ? q.choiceLabels[i] : c;
                btn.dataset.value = c;
                btn.onclick = () => this.checkAnswer(c, btn);
                choicesEl.appendChild(btn);
            });

            // Timer
            this.timeLeft = 30;
            if (this.timer) clearInterval(this.timer);
            document.getElementById('lt-timer').textContent = `⏱️ ${this.timeLeft}s`;
            this.timer = setInterval(() => {
                this.timeLeft--;
                const timerEl = document.getElementById('lt-timer');
                if (timerEl) timerEl.textContent = `⏱️ ${this.timeLeft}s`;
                if (this.timeLeft <= 0) {
                    clearInterval(this.timer);
                    this.handleTimeout();
                }
            }, 1000);

            document.getElementById('lt-start-btn').textContent = '⏭️ Bài tiếp';
        },

        checkAnswer(choice, btnEl) {
            if (this.timer) clearInterval(this.timer);
            document.querySelectorAll('#lt-choices button').forEach(b => b.disabled = true);
            const fb = document.getElementById('lt-feedback');
            this.total++;

            if (choice === this.currentAnswer) {
                this.score += 10;
                this.streak++;
                if (this.streak > this.bestStreak) this.bestStreak = this.streak;
                btnEl.style.background = 'linear-gradient(135deg, rgba(52,211,153,0.3), rgba(52,211,153,0.1))';
                btnEl.style.borderColor = 'var(--accent-green)';
                btnEl.style.color = 'var(--accent-green)';
                fb.innerHTML = '<span class="f-green">✅ Chính xác! +10 điểm</span>';
            } else {
                this.streak = 0;
                btnEl.style.background = 'rgba(248,113,113,0.2)';
                btnEl.style.borderColor = 'var(--accent-red)';
                document.querySelectorAll('#lt-choices button').forEach(b => {
                    if (b.dataset.value === this.currentAnswer) {
                        b.style.background = 'linear-gradient(135deg, rgba(52,211,153,0.3), rgba(52,211,153,0.1))';
                        b.style.borderColor = 'var(--accent-green)';
                        b.style.color = 'var(--accent-green)';
                    }
                });
                fb.innerHTML = `<span class="f-red">❌ Sai rồi! Đáp án: <strong>${this.currentAnswer}</strong></span>`;
            }
            this.updateDisplay();
        },

        handleTimeout() {
            this.total++;
            this.streak = 0;
            document.querySelectorAll('#lt-choices button').forEach(b => {
                b.disabled = true;
                if (b.dataset.value === this.currentAnswer) {
                    b.style.background = 'linear-gradient(135deg, rgba(52,211,153,0.3), rgba(52,211,153,0.1))';
                    b.style.borderColor = 'var(--accent-green)';
                }
            });
            document.getElementById('lt-feedback').innerHTML = `<span class="f-orange">⏰ Hết giờ! Đáp án: <strong>${this.currentAnswer}</strong></span>`;
            this.updateDisplay();
        },

        updateDisplay() {
            const scoreEl = document.getElementById('lt-score');
            if (scoreEl) { scoreEl.textContent = this.score; scoreEl.classList.add('pop'); setTimeout(() => scoreEl.classList.remove('pop'), 300); }
            document.getElementById('lt-ratio').textContent = `${this.score / 10}/${this.total} câu đúng`;
            document.getElementById('lt-streak').textContent = this.streak;
            document.getElementById('lt-best').textContent = `Kỷ lục: ${this.bestStreak}`;
        },

        resetScore() {
            this.score = 0; this.total = 0; this.streak = 0; this.bestStreak = 0;
            if (this.timer) clearInterval(this.timer);
            document.getElementById('lt-score').textContent = '0';
            document.getElementById('lt-ratio').textContent = '0/0 câu đúng';
            document.getElementById('lt-streak').textContent = '0';
            document.getElementById('lt-best').textContent = 'Kỷ lục: 0';
            document.getElementById('lt-start-btn').textContent = '🎮 Bắt đầu';
            document.getElementById('lt-question').textContent = 'Nhấn "Bắt đầu" để chơi!';
            document.getElementById('lt-choices').innerHTML = '';
            document.getElementById('lt-feedback').innerHTML = '';
            document.getElementById('lt-timer').textContent = '⏱️ 30s';
            document.getElementById('lt-topic-badge').textContent = '';
        },

        destroy() {
            if (this.timer) clearInterval(this.timer);
        }
    };

    window.ModuleLuyenTap = MOD;
    APP.register('luyen-tap', MOD);
})();
