/**
 * ==========================================================================
 * AURA // IMMERSIVE MOBILE LANDING PAGE
 * Component: Container & Sensory Engine
 * ==========================================================================
 */

class AudioEngine {
  /**
   * Synthesizes ambient spatial drone and cinematic pulse frequencies
   * using Web Audio API to guarantee sound even on silent video files.
   */
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.masterGain = null;
    this.oscillators = [];
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      // Master Gain Node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  async startAmbientDrone() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.oscillators.length > 0) return;

    // Build cinematic triad drone: Sub-bass 55Hz (A1), Mid-warmth 110Hz (A2), Luminous overtone 164.8Hz (E3)
    const freqs = [55, 110, 164.81];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Low frequency modulation (LFO) for breathing effect
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.2 + idx * 0.1, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(2.0, this.ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      oscGain.gain.setValueAtTime(idx === 0 ? 0.25 : 0.08, this.ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(this.masterGain);
      osc.start();

      this.oscillators.push(osc, lfo);
    });
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);

    if (muted) {
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
    } else {
      this.startAmbientDrone();
      this.masterGain.gain.linearRampToValueAtTime(0.45, now + 1.2);
    }
  }

  triggerPulse() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.8);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.8);
  }
}

/**
 * Procedural Motion Visualizer:
 * Renders an animated futuristic starfield and neon tunnel canvas
 * as a backup and backdrop for the video intro.
 */
class ProceduralCanvas {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.stars = [];
    this.numStars = 80;
    this.animId = null;
    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.resize();
    window.addEventListener('resize', () => this.resize());

    for (let i = 0; i < this.numStars; i++) {
      this.stars.push({
        x: (Math.random() - 0.5) * this.canvas.width,
        y: (Math.random() - 0.5) * this.canvas.height,
        z: Math.random() * this.canvas.width,
        pz: 0
      });
    }

    this.render();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.clientWidth || window.innerWidth;
    this.canvas.height = this.canvas.clientHeight || window.innerHeight;
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.fillStyle = 'rgba(3, 7, 18, 0.25)';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      s.pz = s.z;
      s.z -= 4;

      if (s.z <= 0) {
        s.z = w;
        s.x = (Math.random() - 0.5) * w;
        s.y = (Math.random() - 0.5) * h;
        s.pz = s.z;
      }

      const k = 128.0 / s.z;
      const px = s.x * k + cx;
      const py = s.y * k + cy;

      if (px >= 0 && px <= w && py >= 0 && py <= h) {
        const size = (1 - s.z / w) * 3.2;
        const alpha = (1 - s.z / w);
        ctx.fillStyle = `rgba(0, 245, 212, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    this.animId = requestAnimationFrame(() => this.render());
  }
}

/**
 * Interactive Particles for Welcome Section
 */
class WelcomeParticles {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 100 };
    this.animId = null;
    this.init();
  }

  init() {
    if (!this.canvas) return;
    this.resize();
    window.addEventListener('resize', () => this.resize());

    const count = 45;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2.2 + 0.8,
        color: Math.random() > 0.4 ? 'rgba(0, 245, 212, 0.5)' : 'rgba(121, 40, 202, 0.5)'
      });
    }

    // Touch & Pointer interaction
    const updateCoord = (x, y) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = x - rect.left;
      this.mouse.y = y - rect.top;
    };

    window.addEventListener('mousemove', (e) => updateCoord(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        updateCoord(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    this.render();
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = this.canvas.clientWidth || window.innerWidth;
    this.canvas.height = this.canvas.clientHeight || window.innerHeight;
  }

  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw and connect particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      // Mouse/Touch repulsion
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          const force = (this.mouse.radius - dist) / this.mouse.radius;
          p.x += (dx / dist) * force * 3;
          p.y += (dy / dist) * force * 3;
        }
      }

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 80) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - dist / 80)})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    this.animId = requestAnimationFrame(() => this.render());
  }
}

/**
 * ==========================================================================
 * MAIN COMPONENT: Container
 * Wraps and controls the entire application layout, video autoplay,
 * audio fallback, gesture transitions, and welcome screen states.
 * ==========================================================================
 */
class Container {
  constructor() {
    // DOM Cache
    this.container = document.getElementById('appContainer');
    this.videoSection = document.getElementById('videoSection');
    this.welcomeSection = document.getElementById('welcomeSection');
    this.video = document.getElementById('introVideo');
    this.videoFallbackCanvas = document.getElementById('videoCanvasFallback');
    this.welcomeCanvas = document.getElementById('welcomeCanvas');
    this.swipeIndicator = document.getElementById('swipeIndicator');
    this.audioPromptContainer = document.getElementById('audioPromptContainer');
    this.enableAudioBtn = document.getElementById('enableAudioBtn');
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.replayIntroBtn = document.getElementById('replayIntroBtn');
    this.swipeDownBtn = document.getElementById('swipeDownBtn');
    this.ambientSoundPulseBtn = document.getElementById('ambientSoundPulseBtn');
    this.viewToggleBtn = document.getElementById('viewToggleBtn');
    this.viewToggleText = document.getElementById('viewToggleText');
    this.deviceSimulator = document.getElementById('deviceSimulator');

    // Audio Engine
    this.audio = new AudioEngine();
    this.isAudioEnabled = false;

    // Gesture & State Tracking
    this.currentSection = 0; // 0: Video, 1: Welcome
    this.touchStartY = 0;
    this.touchEndY = 0;
    this.touchStartTime = 0;
    this.isTransitioning = false;

    // Initialize Subsystems
    this.initVisuals();
    this.initVideoAutoplay();
    this.initAudioControls();
    this.initGestureEngine();
    this.initIntersectionObserver();
    this.initDesktopSimulator();
  }

  /**
   * Initializes background particle canvases
   */
  initVisuals() {
    new ProceduralCanvas(this.videoFallbackCanvas);
    new WelcomeParticles(this.welcomeCanvas);
  }

  /**
   * Requirement 1: Video Introduction & Autoplay
   * Attempts unmuted playback; smoothly falls back to muted if policy blocks it,
   * showing "Tap to Enable Sound" pill.
   */
  initVideoAutoplay() {
    if (!this.video) return;

    // Prepare video settings for mobile policy
    this.video.muted = true; // Start muted to guarantee autoplay
    this.video.defaultMuted = true;
    this.video.setAttribute('playsinline', '');
    this.video.setAttribute('webkit-playsinline', '');

    // Default: audio prompt is visible until user enables audio
    this.showAudioPrompt();

    const startPlay = () => {
      const playPromise = this.video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Autoplay succeeded muted. Now test if we can unmute
            this.attemptUnmuteAutoplay();
          })
          .catch((error) => {
            console.log('Video autoplay deferred, awaiting gesture:', error);
            this.showAudioPrompt();
          });
      }
    };

    // Attempt immediate play
    startPlay();

    // Secondary trigger on first user interaction
    const oneTouchPlay = () => {
      if (this.video.paused) {
        this.video.play().catch(() => {});
      }
      window.removeEventListener('touchstart', oneTouchPlay);
      window.removeEventListener('click', oneTouchPlay);
    };
    window.addEventListener('touchstart', oneTouchPlay, { once: true, passive: true });
    window.addEventListener('click', oneTouchPlay, { once: true });
  }

  /**
   * Checks if browser allows unmuted audio playback
   */
  attemptUnmuteAutoplay() {
    // Attempt unmuting
    this.video.muted = false;
    const testPromise = this.video.play();

    if (testPromise !== undefined) {
      testPromise
        .then(() => {
          // Unmuted autoplay permitted!
          this.setAudioState(true);
          this.hideAudioPrompt();
        })
        .catch(() => {
          // Unmuted autoplay blocked by policy: revert to muted and show prompt
          this.video.muted = true;
          this.video.play();
          this.setAudioState(false);
          this.showAudioPrompt();
        });
    }
  }

  /**
   * Requirement 1 Fallback: Sound control & "Tap to Enable Sound"
   */
  initAudioControls() {
    // Tapping "Tap to Enable Sound" pill
    if (this.enableAudioBtn) {
      this.enableAudioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.enableSoundGesture();
      });
    }

    // Tapping sound toggle icon in HUD
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSound();
      });
    }

    // Interactive sound pulse in Welcome screen
    if (this.ambientSoundPulseBtn) {
      this.ambientSoundPulseBtn.addEventListener('click', () => {
        this.audio.triggerPulse();
        // Micro button bounce
        this.ambientSoundPulseBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
          this.ambientSoundPulseBtn.style.transform = '';
        }, 150);
      });
    }
  }

  enableSoundGesture() {
    this.setAudioState(true);
    this.hideAudioPrompt();
    this.audio.triggerPulse();
  }

  toggleSound() {
    this.setAudioState(!this.isAudioEnabled);
  }

  setAudioState(enabled) {
    this.isAudioEnabled = enabled;

    if (this.video) {
      this.video.muted = !enabled;
      if (enabled && this.video.paused) {
        this.video.play().catch(() => {});
      }
    }

    // Toggle Web Audio API synthesizer
    this.audio.setMuted(!enabled);

    // Update HUD Icon
    if (this.soundToggleBtn) {
      if (enabled) {
        this.soundToggleBtn.classList.remove('muted');
        this.soundToggleBtn.setAttribute('aria-label', 'Mute audio');
      } else {
        this.soundToggleBtn.classList.add('muted');
        this.soundToggleBtn.setAttribute('aria-label', 'Enable sound');
      }
    }
  }

  showAudioPrompt() {
    if (this.audioPromptContainer) {
      this.audioPromptContainer.classList.remove('hidden');
    }
  }

  hideAudioPrompt() {
    if (this.audioPromptContainer) {
      this.audioPromptContainer.classList.add('hidden');
    }
  }

  /**
   * Requirement 2 & 3: Touch / Gesture / Scroll Transition
   */
  initGestureEngine() {
    // Tap on Swipe Up Indicator triggers smooth scroll to Welcome
    if (this.swipeIndicator) {
      this.swipeIndicator.addEventListener('click', () => {
        this.navigateToSection(1);
      });
    }

    // Tap on Replay Intro Button
    if (this.replayIntroBtn) {
      this.replayIntroBtn.addEventListener('click', () => {
        this.navigateToSection(0);
      });
    }

    // Tap on Swipe Down Prompt
    if (this.swipeDownBtn) {
      this.swipeDownBtn.addEventListener('click', () => {
        this.navigateToSection(0);
      });
    }

    // Touch events for intuitive mobile swipe velocity
    this.container.addEventListener('touchstart', (e) => {
      this.touchStartY = e.touches[0].clientY;
      this.touchStartTime = Date.now();
    }, { passive: true });

    this.container.addEventListener('touchend', (e) => {
      this.touchEndY = e.changedTouches[0].clientY;
      this.handleSwipeGesture();
    }, { passive: true });

    // Keyboard navigation (Arrow keys, Space)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        this.navigateToSection(1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        this.navigateToSection(0);
      }
    });

    // Real-time scroll position tracking
    this.container.addEventListener('scroll', () => {
      const scrollPos = this.container.scrollTop;
      const height = this.container.clientHeight;
      if (scrollPos > height * 0.45) {
        if (this.currentSection !== 1) {
          this.currentSection = 1;
          this.welcomeSection.classList.add('in-view');
        }
      } else {
        if (this.currentSection !== 0) {
          this.currentSection = 0;
          this.welcomeSection.classList.remove('in-view');
        }
      }
    }, { passive: true });

    // Wheel listener for desktop trackpad/mouse
    let wheelTimeout;
    this.container.addEventListener('wheel', (e) => {
      if (this.isTransitioning) return;
      if (Math.abs(e.deltaY) > 28) {
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
          if (e.deltaY > 0 && this.currentSection === 0) {
            this.navigateToSection(1);
          } else if (e.deltaY < 0 && this.currentSection === 1 && this.welcomeSection.scrollTop <= 5) {
            this.navigateToSection(0);
          }
        }, 30);
      }
    }, { passive: true });
  }

  handleSwipeGesture() {
    const deltaY = this.touchStartY - this.touchEndY;
    const duration = Date.now() - this.touchStartTime;
    const velocity = Math.abs(deltaY) / duration;

    // Minimum swipe threshold (50px or quick flick velocity > 0.45)
    if (deltaY > 50 || (deltaY > 25 && velocity > 0.45)) {
      // Swiped UP -> Move to Welcome Screen
      if (this.currentSection === 0) {
        this.navigateToSection(1);
      }
    } else if (deltaY < -50 || (deltaY < -25 && velocity > 0.45)) {
      // Swiped DOWN -> Return to Video Section if at top of welcome
      if (this.currentSection === 1 && this.welcomeSection.scrollTop <= 10) {
        this.navigateToSection(0);
      }
    }
  }

  navigateToSection(index) {
    if (index === this.currentSection && !this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentSection = index;

    const targetSection = index === 0 ? this.videoSection : this.welcomeSection;
    if (targetSection) {
      this.container.scrollTo({
        top: targetSection.offsetTop,
        behavior: 'smooth'
      });
    }

    if (index === 1) {
      this.welcomeSection.classList.add('in-view');
    } else {
      this.welcomeSection.classList.remove('in-view');
    }

    setTimeout(() => {
      this.isTransitioning = false;
    }, 700);
  }

  /**
   * Requirement 4: Welcome Screen Animation & Intersection Observer
   */
  initIntersectionObserver() {
    const options = {
      root: this.container,
      threshold: 0.55
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === this.welcomeSection) {
          if (entry.isIntersecting) {
            this.welcomeSection.classList.add('in-view');
            this.currentSection = 1;
          } else {
            this.welcomeSection.classList.remove('in-view');
            this.currentSection = 0;
          }
        }
      });
    }, options);

    if (this.welcomeSection) {
      observer.observe(this.welcomeSection);
    }
  }

  /**
   * Requirement 5: Desktop Simulator Mode Toggle
   */
  initDesktopSimulator() {
    if (!this.viewToggleBtn || !this.deviceSimulator) return;

    this.viewToggleBtn.addEventListener('click', () => {
      const isFullscreen = this.deviceSimulator.classList.toggle('mode-fullscreen');
      if (isFullscreen) {
        this.viewToggleText.textContent = 'Fullscreen View';
        this.viewToggleBtn.classList.remove('active');
      } else {
        this.viewToggleText.textContent = 'Device Frame';
        this.viewToggleBtn.classList.add('active');
      }
    });
  }
}

// Instantiate Container when DOM content is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new Container();
});
