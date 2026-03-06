/* ════════════════════════════════════════════
   MODULE: HÌNH HỌC 3D
   Migrated from hinh-hoc.html — Three.js 3D shapes
   ════════════════════════════════════════════ */
(() => {
    let scene, camera, renderer, controls;
    let currentShape = 'box';
    let buildProgress = 0, isBuilding = false, buildAnimId = null;
    let baseMesh = null, bodyMesh = null, topMesh = null, edgeLines = null;
    let extraMeshes = [], labelSprites = [], gridHelper = null;
    let animLoopId = null;
    let matBase, matBody, matTop, matEdge;

    const dims = {
        box: { w: 5, d: 3, h: 4 },
        triangle: { a: 5, b: 3.5, h: 4 },
        circle: { r: 2.5, h: 4 },
        pentagon: { r: 2.5, h: 4 },
        hexagon: { r: 2.5, h: 4 },
        star: { r: 3, h: 4 },
        ellipse: { rx: 3, ry: 2, h: 4 },
    };

    const sliderConfig = {
        box: [{ key: 'w', label: 'Chiều dài (a)', min: 1, max: 8, step: 0.5 }, { key: 'd', label: 'Chiều rộng (b)', min: 1, max: 8, step: 0.5 }, { key: 'h', label: 'Chiều cao (h)', min: 1, max: 8, step: 0.5 }],
        triangle: [{ key: 'a', label: 'Cạnh đáy (a)', min: 1, max: 8, step: 0.5 }, { key: 'b', label: 'Chiều cao tam giác (b)', min: 1, max: 8, step: 0.5 }, { key: 'h', label: 'Chiều cao lăng trụ (h)', min: 1, max: 8, step: 0.5 }],
        circle: [{ key: 'r', label: 'Bán kính (r)', min: 0.5, max: 4, step: 0.25 }, { key: 'h', label: 'Chiều cao (h)', min: 1, max: 8, step: 0.5 }],
        pentagon: [{ key: 'r', label: 'Bán kính ngoại tiếp (r)', min: 0.5, max: 4, step: 0.25 }, { key: 'h', label: 'Chiều cao (h)', min: 1, max: 8, step: 0.5 }],
        hexagon: [{ key: 'r', label: 'Bán kính ngoại tiếp (r)', min: 0.5, max: 4, step: 0.25 }, { key: 'h', label: 'Chiều cao (h)', min: 1, max: 8, step: 0.5 }],
        star: [{ key: 'r', label: 'Bán kính ngoài (r)', min: 1, max: 5, step: 0.25 }, { key: 'h', label: 'Chiều cao (h)', min: 1, max: 8, step: 0.5 }],
        ellipse: [{ key: 'rx', label: 'Bán trục lớn (a)', min: 1, max: 5, step: 0.25 }, { key: 'ry', label: 'Bán trục nhỏ (b)', min: 0.5, max: 4, step: 0.25 }, { key: 'h', label: 'Chiều cao (h)', min: 1, max: 8, step: 0.5 }],
    };

    const shapeNames = {
        box: 'Hộp chữ nhật', triangle: 'Lăng trụ tam giác', circle: 'Hình trụ tròn',
        pentagon: 'Lăng trụ ngũ giác đều', hexagon: 'Lăng trụ lục giác đều',
        star: 'Lăng trụ ngôi sao', ellipse: 'Hình trụ elip',
    };

    /* ── Shape generators ── */
    function makeRectShape(w, d) { const s = new THREE.Shape(); s.moveTo(-w / 2, -d / 2); s.lineTo(w / 2, -d / 2); s.lineTo(w / 2, d / 2); s.lineTo(-w / 2, d / 2); s.closePath(); return s; }
    function makeTriangleShape(a, b) { const s = new THREE.Shape(); s.moveTo(-a / 2, 0); s.lineTo(a / 2, 0); s.lineTo(0, b); s.closePath(); return s; }
    function makeCircleShape(r, seg = 64) { const s = new THREE.Shape(); for (let i = 0; i <= seg; i++) { const a = (i / seg) * Math.PI * 2, x = r * Math.cos(a), y = r * Math.sin(a); if (i === 0) s.moveTo(x, y); else s.lineTo(x, y); } s.closePath(); return s; }
    function makePolygonShape(r, sides) { const s = new THREE.Shape(); for (let i = 0; i <= sides; i++) { const a = (i / sides) * Math.PI * 2 - Math.PI / 2, x = r * Math.cos(a), y = r * Math.sin(a); if (i === 0) s.moveTo(x, y); else s.lineTo(x, y); } s.closePath(); return s; }
    function makeStarShape(R, pts = 5) { const ri = R * 0.45; const s = new THREE.Shape(); for (let i = 0; i <= pts * 2; i++) { const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2, r = (i % 2 === 0) ? R : ri, x = r * Math.cos(a), y = r * Math.sin(a); if (i === 0) s.moveTo(x, y); else s.lineTo(x, y); } s.closePath(); return s; }
    function makeEllipseShape(rx, ry, seg = 64) { const s = new THREE.Shape(); for (let i = 0; i <= seg; i++) { const a = (i / seg) * Math.PI * 2, x = rx * Math.cos(a), y = ry * Math.sin(a); if (i === 0) s.moveTo(x, y); else s.lineTo(x, y); } s.closePath(); return s; }

    function getBaseShape() {
        const d = dims[currentShape];
        switch (currentShape) {
            case 'box': return makeRectShape(d.w, d.d);
            case 'triangle': return makeTriangleShape(d.a, d.b);
            case 'circle': return makeCircleShape(d.r);
            case 'pentagon': return makePolygonShape(d.r, 5);
            case 'hexagon': return makePolygonShape(d.r, 6);
            case 'star': return makeStarShape(d.r);
            case 'ellipse': return makeEllipseShape(d.rx, d.ry);
        }
    }

    function getBaseArea() {
        const d = dims[currentShape];
        switch (currentShape) {
            case 'box': return d.w * d.d;
            case 'triangle': return 0.5 * d.a * d.b;
            case 'circle': return Math.PI * d.r * d.r;
            case 'pentagon': return 0.5 * 5 * d.r * d.r * Math.sin(2 * Math.PI / 5);
            case 'hexagon': return 0.5 * 6 * d.r * d.r * Math.sin(2 * Math.PI / 6);
            case 'star': { const inner = d.r * 0.45; return 0.5 * 10 * d.r * inner * Math.sin(Math.PI / 5); }
            case 'ellipse': return Math.PI * d.rx * d.ry;
        }
    }

    /* ── Labels ── */
    function makeLabel(text, color = '#fff', fs = 40) {
        const c = document.createElement('canvas'), ctx = c.getContext('2d');
        c.width = 256; c.height = 72;
        ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.roundRect(6, 6, c.width - 12, c.height - 12, 12); ctx.fill();
        ctx.font = `bold ${fs}px Nunito,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = color; ctx.fillText(text, c.width / 2, c.height / 2);
        const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true;
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
        const sp = new THREE.Sprite(mat); sp.scale.set(2.2, 0.65, 1); return sp;
    }

    function makeVertexDot(letter, x, y, z, color = '#fbbf24') {
        const geo = new THREE.SphereGeometry(0.1, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(color) });
        const sphere = new THREE.Mesh(geo, mat); sphere.position.set(x, y, z); addObj(sphere);
        const c = document.createElement('canvas'), ctx = c.getContext('2d'); c.width = 96; c.height = 96;
        ctx.beginPath(); ctx.arc(48, 48, 40, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fill();
        ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke();
        ctx.font = 'bold 44px Nunito,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = color; ctx.fillText(letter, 48, 48);
        const tex = new THREE.CanvasTexture(c); tex.needsUpdate = true;
        const sm = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
        const sp = new THREE.Sprite(sm); sp.scale.set(0.7, 0.7, 1); sp.position.set(x, y + 0.45, z); addObj(sp);
    }

    function clearLabels() { labelSprites.forEach(s => scene.remove(s)); labelSprites = []; }
    function addObj(obj) { scene.add(obj); labelSprites.push(obj); }
    function makeArrowLine(from, to, color) {
        return new THREE.Line(new THREE.BufferGeometry().setFromPoints([from, to]), new THREE.LineBasicMaterial({ color }));
    }

    /* ── Vertex positions ── */
    const vertexLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    function getVertexPositions2D() {
        const d = dims[currentShape];
        switch (currentShape) {
            case 'box': return [{ x: -d.w / 2, z: d.d / 2 }, { x: d.w / 2, z: d.d / 2 }, { x: d.w / 2, z: -d.d / 2 }, { x: -d.w / 2, z: -d.d / 2 }];
            case 'triangle': return [{ x: -d.a / 2, z: 0 }, { x: d.a / 2, z: 0 }, { x: 0, z: -d.b }];
            case 'pentagon': { const p = []; for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 - Math.PI / 2; p.push({ x: d.r * Math.cos(a), z: -d.r * Math.sin(a) }); } return p; }
            case 'hexagon': { const p = []; for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 - Math.PI / 2; p.push({ x: d.r * Math.cos(a), z: -d.r * Math.sin(a) }); } return p; }
            default: return null;
        }
    }

    function addVertexLabels(progress) {
        const pts = getVertexPositions2D(), d = dims[currentShape], h = d.h * progress;
        if (pts) {
            pts.forEach((p, i) => makeVertexDot(vertexLetters[i], p.x, 0, p.z, '#fbbf24'));
            if (h > 0.15) pts.forEach((p, i) => makeVertexDot(vertexLetters[i] + "'", p.x, h, p.z, '#34d399'));
        }
        if (currentShape === 'circle' || currentShape === 'ellipse') {
            makeVertexDot('O', 0, 0, 0, '#fbbf24');
            if (h > 0.15) makeVertexDot("O'", 0, h, 0, '#34d399');
        }
    }

    function addDimensionLabels(progress) {
        clearLabels();
        const d = dims[currentShape], h = d.h * progress;
        addVertexLabels(progress);
        if (h > 0.15) {
            const lh = makeLabel(`h = ${h.toFixed(1)}`, '#f472b6');
            const offX = currentShape === 'box' ? -d.w / 2 - 1.4 : currentShape === 'triangle' ? d.a / 2 + 1.4 : currentShape === 'ellipse' ? -d.rx - 0.8 : -(d.r || 3) - 1.2;
            const offZ = currentShape === 'box' ? -d.d / 2 - 0.3 : 0;
            lh.position.set(offX, h / 2, offZ); addObj(lh);
            addObj(makeArrowLine(new THREE.Vector3(offX + 0.4, 0, offZ), new THREE.Vector3(offX + 0.4, h, offZ), 0xf472b6));
        }
        if (currentShape === 'box') {
            const la = makeLabel(`a = ${d.w}`, '#60a5fa'); la.position.set(0, -0.7, d.d / 2 + 0.8); addObj(la);
            const lb = makeLabel(`b = ${d.d}`, '#34d399'); lb.position.set(d.w / 2 + 0.8, -0.7, 0); addObj(lb);
        } else if (currentShape === 'triangle') {
            const la = makeLabel(`a = ${d.a}`, '#60a5fa'); la.position.set(0, -0.7, 0.8); addObj(la);
            const lb = makeLabel(`b = ${d.b}`, '#34d399'); lb.position.set(-d.a / 2 - 1.2, -0.7, -d.b / 2); addObj(lb);
        } else if (currentShape === 'circle') {
            const lr = makeLabel(`r = ${d.r}`, '#60a5fa'); lr.position.set(d.r / 2, -0.5, 0.6); addObj(lr);
            addObj(makeArrowLine(new THREE.Vector3(0, 0.02, 0), new THREE.Vector3(d.r, 0.02, 0), 0x60a5fa));
        } else if (currentShape === 'pentagon' || currentShape === 'hexagon') {
            const lr = makeLabel(`r = ${d.r}`, '#60a5fa'); lr.position.set(0, -0.7, d.r + 0.8); addObj(lr);
            addObj(makeArrowLine(new THREE.Vector3(0, 0.02, 0), new THREE.Vector3(d.r, 0.02, 0), 0x60a5fa));
        } else if (currentShape === 'star') {
            const lr = makeLabel(`R = ${d.r}`, '#60a5fa'); lr.position.set(d.r / 2, -0.5, d.r + 0.4); addObj(lr);
            addObj(makeArrowLine(new THREE.Vector3(0, 0.02, 0), new THREE.Vector3(d.r * Math.cos(-Math.PI / 2), 0.02, d.r * Math.sin(-Math.PI / 2)), 0x60a5fa));
        } else if (currentShape === 'ellipse') {
            const la = makeLabel(`a = ${d.rx}`, '#60a5fa'); la.position.set(d.rx / 2, -0.5, d.ry + 0.4); addObj(la);
            addObj(makeArrowLine(new THREE.Vector3(0, 0.02, 0), new THREE.Vector3(d.rx, 0.02, 0), 0x60a5fa));
            const lb = makeLabel(`b = ${d.ry}`, '#34d399'); lb.position.set(-d.rx - 0.6, -0.5, d.ry / 2); addObj(lb);
            addObj(makeArrowLine(new THREE.Vector3(0, 0.02, 0), new THREE.Vector3(0, 0.02, d.ry), 0x34d399));
        }
    }

    /* ── Build shape ── */
    function clearShape() {
        [baseMesh, bodyMesh, topMesh, edgeLines, ...extraMeshes].forEach(m => { if (m) scene.remove(m); });
        baseMesh = bodyMesh = topMesh = edgeLines = null; extraMeshes = [];
    }

    function buildShape(progress) {
        clearShape();
        const d = dims[currentShape], h = d.h * progress, shape = getBaseShape();
        const baseGeo = new THREE.ShapeGeometry(shape);
        baseMesh = new THREE.Mesh(baseGeo, matBase); baseMesh.rotation.x = -Math.PI / 2; baseMesh.position.y = 0.005; scene.add(baseMesh);
        if (h > 0.01) {
            const extGeo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
            bodyMesh = new THREE.Mesh(extGeo, matBody); bodyMesh.rotation.x = -Math.PI / 2; scene.add(bodyMesh);
            const topGeo = new THREE.ShapeGeometry(shape);
            topMesh = new THREE.Mesh(topGeo, matTop); topMesh.rotation.x = -Math.PI / 2; topMesh.position.y = h; scene.add(topMesh);
            const edges = new THREE.EdgesGeometry(extGeo);
            edgeLines = new THREE.LineSegments(edges, matEdge); edgeLines.rotation.x = -Math.PI / 2; scene.add(edgeLines);
        }
        addDimensionLabels(progress);
    }

    /* ── Formula ── */
    function updateFormula(progress) {
        const el = document.getElementById('hh-formula');
        const explain = document.getElementById('hh-explain');
        if (!el) return;
        const d = dims[currentShape], ba = getBaseArea(), vol = ba * d.h * progress, name = shapeNames[currentShape];

        let areaStr = '';
        switch (currentShape) {
            case 'box': areaStr = `<span class="f-blue">${d.w}</span> × <span class="f-green">${d.d}</span> = <span class="f-yellow">${ba.toFixed(1)}</span>`; break;
            case 'triangle': areaStr = `½ × <span class="f-blue">${d.a}</span> × <span class="f-green">${d.b}</span> = <span class="f-yellow">${ba.toFixed(1)}</span>`; break;
            case 'circle': areaStr = `π × <span class="f-blue">${d.r}</span>² = <span class="f-yellow">${ba.toFixed(2)}</span>`; break;
            case 'pentagon': areaStr = `½×5×<span class="f-blue">${d.r}</span>²×sin(72°) = <span class="f-yellow">${ba.toFixed(2)}</span>`; break;
            case 'hexagon': areaStr = `½×6×<span class="f-blue">${d.r}</span>²×sin(60°) = <span class="f-yellow">${ba.toFixed(2)}</span>`; break;
            case 'star': areaStr = `(ngôi sao) = <span class="f-yellow">${ba.toFixed(2)}</span>`; break;
            case 'ellipse': areaStr = `π × <span class="f-blue">${d.rx}</span> × <span class="f-green">${d.ry}</span> = <span class="f-yellow">${ba.toFixed(2)}</span>`; break;
        }

        el.innerHTML = `
            <div class="formula-line"><span class="f-blue">S<sub>đáy</sub></span> = ${areaStr}</div>
            <div class="formula-line"><span class="highlight f-purple">V</span> = <span class="f-yellow">S<sub>đáy</sub></span> × <span class="f-pink">h</span> = <span class="f-yellow">${ba.toFixed(1)}</span> × <span class="f-pink">${(d.h * progress).toFixed(1)}</span> = <span class="highlight f-orange">${vol.toFixed(1)}</span></div>
        `;

        if (explain) {
            let bd = '';
            switch (currentShape) {
                case 'box': bd = `hình chữ nhật (${d.w} × ${d.d})`; break;
                case 'triangle': bd = `tam giác (đáy ${d.a}, cao ${d.b})`; break;
                case 'circle': bd = `hình tròn (r = ${d.r})`; break;
                case 'pentagon': bd = `ngũ giác đều (r = ${d.r})`; break;
                case 'hexagon': bd = `lục giác đều (r = ${d.r})`; break;
                case 'star': bd = `ngôi sao 5 cánh (R = ${d.r})`; break;
                case 'ellipse': bd = `hình elip (a = ${d.rx}, b = ${d.ry})`; break;
            }
            explain.innerHTML = `<strong>${name}</strong> — mặt đáy ${bd}, kéo lên theo <span class="f-pink">h = ${d.h}</span>.<br>
            🔑 <span class="f-purple"><strong>V</strong></span> = <span class="f-yellow">S<sub>đáy</sub></span> × <span class="f-pink">h</span> = <strong class="f-orange">${(ba * d.h).toFixed(1)}</strong>`;
        }
    }

    /* ── Sliders ── */
    function buildSliders() {
        const c = document.getElementById('hh-sliders'); if (!c) return;
        c.innerHTML = '';
        sliderConfig[currentShape].forEach(s => {
            const d = dims[currentShape];
            const g = document.createElement('div'); g.className = 'slider-group';
            g.innerHTML = `<div class="slider-label"><span>${s.label}</span><span class="val" id="hh-val-${s.key}">${d[s.key]}</span></div>
            <input type="range" id="hh-slider-${s.key}" min="${s.min}" max="${s.max}" step="${s.step}" value="${d[s.key]}">`;
            c.appendChild(g);
            g.querySelector('input').addEventListener('input', e => {
                d[s.key] = parseFloat(e.target.value);
                document.getElementById(`hh-val-${s.key}`).textContent = d[s.key];
                buildShape(buildProgress > 0 ? buildProgress : 0);
                updateFormula(buildProgress > 0 ? buildProgress : 0);
            });
        });
    }

    /* ── Three.js setup ── */
    function initThree() {
        const canvas = document.getElementById('hh-canvas'); if (!canvas) return;
        const parent = canvas.parentElement;
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(window.devicePixelRatio); renderer.setClearColor(0x000000, 0);
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(45, parent.clientWidth / parent.clientHeight, 0.1, 100);
        camera.position.set(8, 6, 10);
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; controls.dampingFactor = 0.08; controls.minDistance = 5; controls.maxDistance = 30; controls.target.set(0, 2, 0);
        camera._defaultPos = camera.position.clone(); camera._defaultTarget = controls.target.clone();
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const dir = new THREE.DirectionalLight(0xffffff, 0.8); dir.position.set(8, 12, 6); scene.add(dir);
        scene.add(new THREE.PointLight(0x60a5fa, 0.4, 30).translateX(-5).translateY(8));
        gridHelper = new THREE.GridHelper(14, 14, 0x333366, 0x222244); gridHelper.position.y = -0.01; scene.add(gridHelper);

        matBase = new THREE.MeshPhysicalMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.6, roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide });
        matBody = new THREE.MeshPhysicalMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.35, roughness: 0.2, metalness: 0.05, side: THREE.DoubleSide });
        matTop = new THREE.MeshPhysicalMaterial({ color: 0x34d399, transparent: true, opacity: 0.5, roughness: 0.3, metalness: 0.1, side: THREE.DoubleSide });
        matEdge = new THREE.LineBasicMaterial({ color: 0xfbbf24, linewidth: 2 });

        function resize() { renderer.setSize(parent.clientWidth, parent.clientHeight); camera.aspect = parent.clientWidth / parent.clientHeight; camera.updateProjectionMatrix(); }
        resize(); window.addEventListener('resize', resize);
        (function loop() { animLoopId = requestAnimationFrame(loop); controls.update(); renderer.render(scene, camera); })();
    }

    const MOD = {
        render(el) {
            el.innerHTML = `
                <div class="section-header slide-up">
                    <h2>🧊 Hình Học Không Gian</h2>
                    <p>Mọi hình khối = "kéo" mặt đáy lên theo chiều cao!</p>
                    <div class="formula-badge"><span class="f-purple">V</span> = <span class="f-yellow">S<sub>đáy</sub></span> × <span class="f-pink">h</span></div>
                </div>

                <div class="pill-group slide-up" id="hh-tabs" style="justify-content:center">
                    <div style="font-size:0.72rem;font-weight:700;color:var(--text-muted);padding:6px 0;width:100%">🔷 LĂNG TRỤ — đáy đa giác</div>
                    <div class="pill active" data-shape="box" onclick="ModuleHinhHoc.selectShape('box')">📦 Chữ nhật</div>
                    <div class="pill" data-shape="triangle" onclick="ModuleHinhHoc.selectShape('triangle')">🔺 Tam giác</div>
                    <div class="pill" data-shape="pentagon" onclick="ModuleHinhHoc.selectShape('pentagon')">⬠ Ngũ giác</div>
                    <div class="pill" data-shape="hexagon" onclick="ModuleHinhHoc.selectShape('hexagon')">⬡ Lục giác</div>
                    <div class="pill" data-shape="star" onclick="ModuleHinhHoc.selectShape('star')">⭐ Ngôi sao</div>
                    <div style="font-size:0.72rem;font-weight:700;color:var(--text-muted);padding:6px 0;width:100%">🔵 HÌNH TRỤ — đáy đường cong</div>
                    <div class="pill" data-shape="circle" onclick="ModuleHinhHoc.selectShape('circle')">⭕ Tròn</div>
                    <div class="pill" data-shape="ellipse" onclick="ModuleHinhHoc.selectShape('ellipse')">🥚 Elip</div>
                </div>

                <div class="grid-sidebar slide-up">
                    <div class="card" style="position:relative;min-height:450px;overflow:hidden">
                        <canvas id="hh-canvas" style="width:100%;height:100%;display:block;cursor:grab"></canvas>
                        <button class="btn btn-secondary" style="position:absolute;bottom:12px;right:12px;padding:6px 12px;font-size:0.78rem" onclick="ModuleHinhHoc.resetCamera()">📷 Góc nhìn mặc định</button>
                    </div>
                    <div class="flex-col">
                        <div class="card"><h3>📏 Kích thước</h3><div id="hh-sliders"></div></div>
                        <div class="card">
                            <h3>🎬 Dựng hình</h3>
                            <button class="btn btn-primary btn-full" id="hh-btn-build" onclick="ModuleHinhHoc.startBuild()">▶️ Bắt đầu dựng hình</button>
                            <button class="btn btn-secondary btn-full" style="margin-top:6px" onclick="ModuleHinhHoc.resetBuild()">🔄 Đặt lại</button>
                            <div class="progress-bar-container"><div class="progress-bar-fill" id="hh-progress"></div></div>
                        </div>
                        <div class="card formula-card"><h3>📐 Công thức</h3><div id="hh-formula"></div></div>
                        <div class="card"><h3>💡 Giải thích</h3><div id="hh-explain" style="font-size:0.88rem;color:var(--text-secondary);line-height:1.6"></div></div>
                    </div>
                </div>
            `;

            // Init Three.js after DOM is ready
            setTimeout(() => {
                currentShape = 'box';
                buildProgress = 0;
                isBuilding = false;
                initThree();
                buildSliders();
                buildShape(0);
                updateFormula(0);
            }, 50);
        },

        selectShape(shape) {
            currentShape = shape;
            document.querySelectorAll('#hh-tabs .pill').forEach(p => p.classList.remove('active'));
            document.querySelector(`#hh-tabs [data-shape="${shape}"]`)?.classList.add('active');
            if (buildAnimId) cancelAnimationFrame(buildAnimId);
            isBuilding = false;
            buildProgress = 0;
            const pb = document.getElementById('hh-progress');
            if (pb) pb.style.width = '0%';
            const btn = document.getElementById('hh-btn-build');
            if (btn) btn.textContent = '▶️ Bắt đầu dựng hình';
            buildSliders();
            buildShape(0);
            updateFormula(0);
        },

        startBuild() {
            if (isBuilding) return;
            isBuilding = true;
            buildProgress = 0;
            const btn = document.getElementById('hh-btn-build');
            if (btn) btn.textContent = '⏳ Đang dựng...';
            const duration = 5000, start = performance.now();
            function step(now) {
                buildProgress = Math.min((now - start) / duration, 1);
                const t = buildProgress < 0.5 ? 4 * buildProgress * buildProgress * buildProgress : 1 - Math.pow(-2 * buildProgress + 2, 3) / 2;
                buildShape(t);
                updateFormula(t);
                const pb = document.getElementById('hh-progress');
                if (pb) pb.style.width = (buildProgress * 100) + '%';
                if (buildProgress < 1) { buildAnimId = requestAnimationFrame(step); }
                else { isBuilding = false; if (btn) btn.textContent = '✅ Hoàn thành!'; setTimeout(() => { if (btn) btn.textContent = '▶️ Dựng lại'; }, 2000); }
            }
            buildAnimId = requestAnimationFrame(step);
        },

        resetBuild() {
            if (buildAnimId) cancelAnimationFrame(buildAnimId);
            isBuilding = false; buildProgress = 0;
            clearLabels();
            const pb = document.getElementById('hh-progress');
            if (pb) pb.style.width = '0%';
            const btn = document.getElementById('hh-btn-build');
            if (btn) btn.textContent = '▶️ Bắt đầu dựng hình';
            buildShape(0); updateFormula(0);
        },

        resetCamera() {
            if (!camera || !camera._defaultPos) return;
            const sp = camera.position.clone(), st = controls.target.clone(), ep = camera._defaultPos.clone(), et = camera._defaultTarget.clone();
            const dur = 600, t0 = performance.now();
            function anim(now) { const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3); camera.position.lerpVectors(sp, ep, e); controls.target.lerpVectors(st, et, e); controls.update(); if (p < 1) requestAnimationFrame(anim); }
            requestAnimationFrame(anim);
        },

        destroy() {
            if (buildAnimId) cancelAnimationFrame(buildAnimId);
            if (animLoopId) cancelAnimationFrame(animLoopId);
            if (renderer) { renderer.dispose(); renderer = null; }
            if (scene) {
                scene.traverse(obj => { if (obj.geometry) obj.geometry.dispose(); if (obj.material) { if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose()); else obj.material.dispose(); } });
                scene = null;
            }
            camera = null; controls = null;
        }
    };

    window.ModuleHinhHoc = MOD;
    APP.register('hinh-hoc', MOD);
})();
