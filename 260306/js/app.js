/* ════════════════════════════════════════════
   APP.JS — Router & Module Loader
   Toán Vui Lớp 5
   ════════════════════════════════════════════ */

const APP = {
    modules: {},
    currentModule: null,
    container: null,

    /* ── Register a module ── */
    register(id, mod) {
        this.modules[id] = mod;
    },

    /* ── Initialize ── */
    init() {
        this.container = document.getElementById('app-content');

        // Nav click
        document.querySelectorAll('.nav-item[data-module]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const id = item.dataset.module;
                window.location.hash = id;
            });
        });

        // Hash routing
        window.addEventListener('hashchange', () => this.route());

        // Mobile nav
        const toggle = document.getElementById('nav-toggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (toggle) {
            toggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('show');
            });
        }
        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('show');
            });
        }

        // Initial route
        this.route();
    },

    /* ── Route to module ── */
    route() {
        const hash = window.location.hash.slice(1) || 'phan-so';
        this.loadModule(hash);
    },

    /* ── Load a module ── */
    loadModule(id) {
        const mod = this.modules[id];
        if (!mod) {
            this.container.innerHTML = `<div class="section-header"><h2>🚧 Đang xây dựng</h2><p>Module "${id}" chưa sẵn sàng</p></div>`;
            return;
        }

        // Cleanup previous module
        if (this.currentModule && this.modules[this.currentModule] && this.modules[this.currentModule].destroy) {
            this.modules[this.currentModule].destroy();
        }

        // Update active nav
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-item[data-module="${id}"]`);
        if (activeNav) activeNav.classList.add('active');

        // Close mobile nav
        document.getElementById('sidebar')?.classList.remove('open');
        document.getElementById('sidebar-overlay')?.classList.remove('show');

        // Render
        this.container.innerHTML = '';
        this.container.classList.add('fade-in');
        mod.render(this.container);
        this.currentModule = id;

        // Remove animation class after it plays
        setTimeout(() => this.container.classList.remove('fade-in'), 500);
    }
};

/* ════════════════════════════════════════════
   MATH — Shared fraction/expression helpers
   ════════════════════════════════════════════ */
const MATH = {
    /** Fraction: num / den */
    frac(n, d) {
        return `<span class="frac"><span class="num">${n}</span><span class="bar"></span><span class="den">${d}</span></span>`;
    },
    /** Operator (+, -, ×, ÷) */
    op(s) { return `<span class="op">${s}</span>`; },
    /** Equals sign */
    eq() { return `<span class="eq">=</span>`; },
    /** Value (highlighted number) */
    val(v) { return `<span class="val">${v}</span>`; },
    /** Label (variable name) */
    lbl(s) { return `<span class="lbl">${s}</span>`; },
    /** Unit (km/h, giờ, etc.) */
    unit(s) { return `<span class="unit">(${s})</span>`; },
    /** Plain text inside expression */
    txt(s) { return `<span class="txt">${s}</span>`; },
    /** Wrap contents in math-expr div */
    expr(...parts) { return `<span class="math-expr">${parts.join('')}</span>`; },
    /** Solution step with step number */
    step(num, content) {
        return `<div class="step"><div class="step-num">${num}</div><div>${content}</div></div>`;
    },
    /** Answer box */
    answer(content) {
        return `<div class="answer-box"><div class="math-expr" style="justify-content:center;font-size:1.3rem">${content}</div></div>`;
    },
    /** GCD helper */
    gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; },
    /** LCM helper */
    lcm(a, b) { return (a * b) / MATH.gcd(a, b); }
};

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', () => APP.init());
