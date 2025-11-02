const game = {
    level: 1,
    health: 100,
    score: 0,
    attacks: 5,
    time: 60,
    jumping: false,
    allyUsed: false,
    ally1Used: false,
    ally2Used: false,
    protected: false,
    protectionTimer: null,
    playing: false,
    spawnTimer: null,
    powerTimer: null,
    gameTimer: null,

    data: {
        1: {
            title: "LEVEL 1: ELECTION CHASE (EASY)",
            story: `<h2>📰 Election Battle!</h2>
<p><b>Modi vs Rahul Gandhi</b></p>
<p><b>🌟 Thanos:</b> "I will protect you!"</p>
<p><b>Mission:</b> Survive 1 minute (EASY MODE)</p>
<p><b>🛡️ Thanos gives 15s protection</b></p>
<p><b>Controls:</b> Jump | Attack (5x) | Call Thanos</p>`,
            player: "modi.png",
            modiMusic: "modiplaying background music.mpeg",
            enemy: "rhaul.png",
            enemyMusic: "Rahul background.mp3",
            ally: { 
                img: "thanos.png", 
                entry: "thanos entry .mp3",
                special: "thanos and mode when come together to .mp3"
            },
            enemyLose: "rhaul lose.mp3",
            win: "meloni modi.png",
            winMusic: "meloni modi wining song.mpeg",
            lose: "modi lose.png",
            loseMusic: "modi lose.mpeg",
            time: 60,
            spawnRate: 2660,
            damage: 8,
            enemySpeed: 3800
        },
        2: {
            title: "LEVEL 2: TRADE WAR (INTERMEDIATE)",
            story: `<h2>📰 International Crisis!</h2>
<p><b>Modi vs Trump</b></p>
<p><b>🤝 Xi & Putin support you!</b></p>
<p><b>Mission:</b> Survive 72 seconds (MEDIUM)</p>
<p><b>🛡️ Each ally = 15s protection</b></p>
<p><b>Controls:</b> Jump | Attack (5x) | Call Xi or Putin</p>`,
            player: "modi.png",
            modiMusic: "modiplaying background music.mpeg",
            enemy: "trump face image.png",
            enemyMusic: "trump background.mp3",
            allies: [
                { img: "xi.png", music: "xi back ground.mp3" },
                { img: "putin.png", music: "putin background.mp3" }
            ],
            enemyLose: "trump lose.mp3",
            win: "meloni modi.png",
            winMusic: "meloni modi wining song.mpeg",
            lose: "modi lose.png",
            loseMusic: "modi lose.mpeg",
            time: 72,
            spawnRate: 2090,
            damage: 12,
            enemySpeed: 3325
        }
    },

    init() {
        document.addEventListener('keydown', (e) => {
            if (!this.playing) return;
            if (e.code === 'Space') { e.preventDefault(); this.jump(); }
            else if (e.code === 'KeyA') this.attack();
            else if (e.code === 'KeyH' && this.level === 1) this.callAlly();
            else if (e.code === 'KeyX' && this.level === 2) this.callAlly(0);
            else if (e.code === 'KeyP' && this.level === 2) this.callAlly(1);
        });

        let lastTap = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTap < 300) e.preventDefault();
            lastTap = now;
        });
    },

    showLevel(lvl) {
        this.level = lvl;
        const d = this.data[lvl];
        document.getElementById('start-screen').classList.remove('active');
        document.getElementById('level-screen').classList.add('active');
        document.getElementById('level-title').textContent = d.title;
        document.getElementById('story').innerHTML = d.story;

        const a = document.getElementById('bgm');
        const s = document.getElementById('sfx');
        a.pause();
        s.pause();
    },

    start() {
        document.getElementById('level-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');

        const d = this.data[this.level];
        this.health = 100;
        this.score = 0;
        this.attacks = 5;
        this.time = d.time;
        this.jumping = false;
        this.allyUsed = false;
        this.ally1Used = false;
        this.ally2Used = false;
        this.protected = false;
        this.playing = true;

        document.querySelectorAll('.enemy, .powerup, .ally').forEach(el => el.remove());
        document.getElementById('player').classList.remove('protected');
        document.getElementById('attack-btn').disabled = false;
        document.getElementById('attack-btn').textContent = '👊 ATK(5)';
        this.updateUI();

        document.getElementById('level').textContent = this.level;
        document.getElementById('timer').textContent = this.time;
        document.getElementById('player').style.backgroundImage = `url('${d.player}')`;

        if (this.level === 1) {
            document.getElementById('ally-btn-1').style.display = 'block';
            document.getElementById('ally-btn-1').disabled = false;
            document.getElementById('ally-btn-xi').style.display = 'none';
            document.getElementById('ally-btn-putin').style.display = 'none';
        } else {
            document.getElementById('ally-btn-1').style.display = 'none';
            document.getElementById('ally-btn-xi').style.display = 'block';
            document.getElementById('ally-btn-xi').disabled = false;
            document.getElementById('ally-btn-putin').style.display = 'block';
            document.getElementById('ally-btn-putin').disabled = false;
        }

        this.playFullAudio(d.enemyMusic).then(() => {
            this.playBGM(d.modiMusic);
            this.showNews(`Level ${this.level} - Survive ${d.time}s!`);
        });

        this.spawnTimer = setInterval(() => {
            if (this.playing) this.spawnEnemy();
        }, d.spawnRate);

        this.powerTimer = setInterval(() => {
            if (this.playing && Math.random() > 0.7) this.spawnPower();
        }, 3500);

        this.gameTimer = setInterval(() => {
            if (!this.playing) { clearInterval(this.gameTimer); return; }
            this.time--;
            this.score += 5;
            document.getElementById('timer').textContent = this.time;
            this.updateUI();

            if (this.time <= 0) {
                clearInterval(this.gameTimer);
                this.end(true);
            } else if (this.time === Math.floor(d.time / 2)) {
                this.showNews(`Halfway! ${this.time}s left!`);
            } else if (this.time === 10) {
                this.showNews('Final 10 seconds! 🔥');
            }
        }, 1000);
    },

    spawnEnemy() {
        const d = this.data[this.level];
        const e = document.createElement('div');
        e.className = 'enemy running';
        e.style.backgroundImage = `url('${d.enemy}')`;
        e.dataset.type = 'enemy';
        e.style.animationDuration = d.enemySpeed + 'ms';
        if (Math.random() > 0.7) {
            e.style.bottom = (window.innerWidth <= 480 ? 'calc(20vh + 25vh)' : 'calc(20vh + 28vh)');
        }
        document.getElementById('game-area').appendChild(e);

        const check = setInterval(() => {
            if (!this.playing || !e.parentElement) { clearInterval(check); return; }
            if (this.collision(e, document.getElementById('player'))) {
                if (!this.protected) {
                    this.damage(d.damage);
                } else {
                    this.showEvent('🛡️ PROTECTED!');
                }
                e.remove();
                clearInterval(check);
            }
        }, 50);

        setTimeout(() => {
            if (e.parentElement) e.remove();
            clearInterval(check);
        }, d.enemySpeed);
    },

    spawnPower() {
        const p = document.createElement('div');
        p.className = 'powerup';
        p.textContent = '⚡';
        document.getElementById('game-area').appendChild(p);

        const check = setInterval(() => {
            if (!this.playing || !p.parentElement) { clearInterval(check); return; }
            if (this.collision(p, document.getElementById('player'))) {
                this.score += 50;
                this.showEvent('⚡ +50!');
                this.updateUI();
                p.remove();
                clearInterval(check);
            }
        }, 50);

        setTimeout(() => { if (p.parentElement) p.remove(); clearInterval(check); }, 4275);
    },

    jump() {
        if (this.jumping || !this.playing) return;
        this.jumping = true;
        const p = document.getElementById('player');
        p.classList.add('jumping');
        setTimeout(() => {
            p.classList.remove('jumping');
            this.jumping = false;
        }, 500);
    },

    attack() {
        if (!this.playing || this.attacks <= 0) {
            if (this.attacks <= 0) this.showEvent('❌ No attacks!');
            return;
        }

        this.attacks--;
        this.score += 20;
        document.getElementById('attack-btn').textContent = `👊 ATK(${this.attacks})`;
        if (this.attacks === 0) {
            document.getElementById('attack-btn').disabled = true;
        }
        this.updateUI();

        const p = document.getElementById('player');
        p.style.transform = 'scale(1.3) rotate(20deg)';

        let hitCount = 0;
        document.querySelectorAll('.enemy').forEach(e => {
            const r1 = e.getBoundingClientRect();
            const r2 = p.getBoundingClientRect();
            if (Math.abs(r1.left - r2.right) < 140) {
                e.style.opacity = '0';
                setTimeout(() => e.remove(), 100);
                this.score += 30;
                hitCount++;
            }
        });

        if (hitCount > 0) {
            this.showEvent(`💥 +${20 + hitCount * 30}!`);
        } else {
            this.showEvent('👊 +20!');
        }

        this.updateUI();
        setTimeout(() => p.style.transform = '', 200);
    },

    callAlly(allyIndex) {
        const d = this.data[this.level];

        if (this.level === 1) {
            if (this.allyUsed || !this.playing) return;
            this.allyUsed = true;
            document.getElementById('ally-btn-1').disabled = true;

            this.showNews('🌌 THANOS ARRIVES!');

            this.activateProtection(15);
            this.health = Math.min(100, this.health + 20);
            this.score += 200;
            document.querySelectorAll('.enemy').forEach(e => e.remove());
            this.showEvent('💎 PROTECTED 15s!');
            this.updateUI();

            const a = document.createElement('div');
            a.className = 'ally';
            a.style.backgroundImage = `url('${d.ally.img}')`;
            a.style.left = '40%';
            a.style.bottom = 'calc(20vh + 22vh)';
            document.getElementById('game-area').appendChild(a);

            this.playFullAudio(d.ally.entry).then(() => {
                this.showNews('💎 Thanos protects Modi!');
                return this.playFullAudio(d.ally.special);
            }).then(() => {
                return this.playFullAudio(d.enemyLose);
            }).then(() => {
                this.playBGM(d.modiMusic);
                setTimeout(() => a.remove(), 3000);
            });
        } else {
            if (allyIndex === 0 && !this.ally1Used) {
                this.ally1Used = true;
                document.getElementById('ally-btn-xi').disabled = true;
                const ally = d.allies[0];
                this.showNews('🇨🇳 Xi Jinping arrives!');

                this.activateProtection(15);
                this.health = Math.min(100, this.health + 25);
                this.score += 250;
                document.querySelectorAll('.enemy').forEach(e => e.remove());
                this.showEvent('🇨🇳 PROTECTED 15s!');
                this.updateUI();

                const a1 = document.createElement('div');
                a1.className = 'ally';
                a1.style.backgroundImage = `url('${ally.img}')`;
                a1.style.left = '35%';
                a1.style.bottom = 'calc(20vh + 22vh)';
                document.getElementById('game-area').appendChild(a1);

                this.playFullAudio(ally.music).then(() => {
                    return this.playFullAudio(d.enemyLose);
                }).then(() => {
                    this.playBGM(d.modiMusic);
                    setTimeout(() => a1.remove(), 3000);
                });
            } else if (allyIndex === 1 && !this.ally2Used) {
                this.ally2Used = true;
                document.getElementById('ally-btn-putin').disabled = true;
                const ally = d.allies[1];
                this.showNews('🇷🇺 Putin arrives!');

                this.activateProtection(15);
                this.health = Math.min(100, this.health + 25);
                this.score += 250;
                document.querySelectorAll('.enemy').forEach(e => e.remove());
                this.showEvent('🇷🇺 PROTECTED 15s!');
                this.updateUI();

                const a2 = document.createElement('div');
                a2.className = 'ally';
                a2.style.backgroundImage = `url('${ally.img}')`;
                a2.style.left = '50%';
                a2.style.bottom = 'calc(20vh + 22vh)';
                document.getElementById('game-area').appendChild(a2);

                this.playFullAudio(ally.music).then(() => {
                    return this.playFullAudio(d.enemyLose);
                }).then(() => {
                    this.playBGM(d.modiMusic);
                    setTimeout(() => a2.remove(), 3000);
                });
            }
        }
    },

    activateProtection(seconds) {
        this.protected = true;
        document.getElementById('player').classList.add('protected');

        if (this.protectionTimer) clearTimeout(this.protectionTimer);

        this.protectionTimer = setTimeout(() => {
            this.protected = false;
            document.getElementById('player').classList.remove('protected');
            this.showNews('⚠️ Protection ended!');
        }, seconds * 1000);
    },

    damage(amt) {
        this.health = Math.max(0, this.health - amt);
        const p = document.getElementById('player');
        p.style.filter = 'brightness(2) drop-shadow(0 0 20px red)';
        setTimeout(() => p.style.filter = '', 200);
        this.showEvent(`-${amt} HP!`);
        this.updateUI();
        if (this.health <= 0) this.end(false);
    },

    collision(e1, e2) {
        const r1 = e1.getBoundingClientRect();
        const r2 = e2.getBoundingClientRect();
        return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
    },

    end(won) {
        this.playing = false;
        clearInterval(this.spawnTimer);
        clearInterval(this.powerTimer);
        clearInterval(this.gameTimer);
        if (this.protectionTimer) clearTimeout(this.protectionTimer);

        const d = this.data[this.level];

        setTimeout(() => {
            document.getElementById('game-screen').classList.remove('active');
            document.getElementById('result-screen').classList.add('active');
            document.getElementById('final-score').textContent = this.score;

            if (won) {
                document.getElementById('result-title').textContent = '🎉 VICTORY! 🎉';
                document.getElementById('result-img').src = d.win;
                document.getElementById('result-msg').textContent = this.level === 1 ?
                    'Modi wins election! 🏆' : 'Trade war won! 🌍';

                this.playBGM(d.winMusic);
                document.getElementById('next-btn').textContent = this.level === 1 ?
                    'NEXT LEVEL ➡️' : 'PLAY AGAIN 🔄';
            } else {
                document.getElementById('result-title').textContent = '😢 DEFEAT';
                document.getElementById('result-img').src = d.lose;
                document.getElementById('result-msg').textContent = 'Try again! 💪';

                this.playBGM(d.loseMusic);
                document.getElementById('next-btn').textContent = 'TRY AGAIN 🔄';
            }
        }, 500);
    },

    nextAction() {
        const btn = document.getElementById('next-btn');
        document.getElementById('result-screen').classList.remove('active');
        if (btn.textContent.includes('NEXT LEVEL')) {
            this.showLevel(2);
        } else if (btn.textContent.includes('PLAY AGAIN')) {
            document.getElementById('start-screen').classList.add('active');
            this.level = 1;
        } else {
            this.showLevel(this.level);
        }
    },

    updateUI() {
        document.getElementById('health').style.width = this.health + '%';
        document.getElementById('health-text').textContent = this.health + '%';
        document.getElementById('score').textContent = this.score;
        document.getElementById('attacks').textContent = this.attacks;
    },

    showNews(txt) {
        const n = document.getElementById('news');
        n.textContent = '📰 ' + txt;
        n.classList.add('show');
        setTimeout(() => n.classList.remove('show'), 3000);
    },

    showEvent(txt) {
        const e = document.getElementById('event');
        e.textContent = txt;
        e.classList.add('show');
        setTimeout(() => e.classList.remove('show'), 1500);
    },

    playBGM(file) {
        const a = document.getElementById('bgm');
        const s = document.getElementById('sfx');
        a.pause();
        s.pause();
        a.src = file;
        a.volume = 0.4;
        a.loop = true;
        a.play().catch(() => { });
    },

    playFullAudio(file) {
        return new Promise(resolve => {
            const a = document.getElementById('bgm');
            const s = document.getElementById('sfx');
            a.pause();
            s.pause();
            s.src = file;
            s.volume = 0.5;
            s.loop = false;
            s.onended = () => resolve();
            s.onerror = () => resolve();
            s.play().catch(() => resolve());
        });
    }
};

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Fullscreen error:', err);
        });
        document.getElementById('fullscreen-btn').textContent = '🗙 Exit';
    } else {
        document.exitFullscreen();
        document.getElementById('fullscreen-btn').textContent = '⛶ Fullscreen';
    }
}

window.addEventListener('DOMContentLoaded', () => game.init());
