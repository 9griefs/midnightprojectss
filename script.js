(() => {
  "use strict";

  /* ---------------------------------------------------------
     AUDIO MANAGER
     One track plays at a time. Crossfades between named tracks.
     Nothing plays until the ribbon is clicked (first gesture).
  --------------------------------------------------------- */
  const tracks = {
    intro:   document.getElementById("track-intro"),
    halooo:  document.getElementById("track-halooo"),
    ranking: document.getElementById("track-ranking"),
    letter:  document.getElementById("track-letter"),
  };

  const TARGET_VOL = 0.55;
  Object.values(tracks).forEach(t => { t.volume = 0; });

  let current = null;   // key of currently active track
  let isMuted = false;
  let fadeTimers = [];

  function clearFades(){
    fadeTimers.forEach(id => clearInterval(id));
    fadeTimers = [];
  }

  function fade(audio, from, to, duration, onDone){
    const steps = 24;
    const stepTime = duration / steps;
    let i = 0;
    const id = setInterval(() => {
      i++;
      const v = from + (to - from) * (i / steps);
      audio.volume = Math.max(0, Math.min(1, v));
      if (i >= steps){
        clearInterval(id);
        fadeTimers = fadeTimers.filter(x => x !== id);
        if (onDone) onDone();
      }
    }, stepTime);
    fadeTimers.push(id);
  }

  function playTrack(key, { restart = false } = {}){
    if (!tracks[key]) return;
    if (current === key && !restart) return;

    const incoming = tracks[key];
    const outgoing = current ? tracks[current] : null;

    if (restart){ incoming.currentTime = 0; }

    incoming.muted = isMuted;
    const playPromise = incoming.play();
    if (playPromise && playPromise.catch) playPromise.catch(() => {});

    fade(incoming, incoming.volume, isMuted ? 0 : TARGET_VOL, 900);

    if (outgoing && outgoing !== incoming){
      fade(outgoing, outgoing.volume, 0, 700, () => outgoing.pause());
    }
    current = key;
  }

  function setMuted(muted){
    isMuted = muted;
    Object.values(tracks).forEach(t => { t.muted = false; }); // control via volume, not mute flag, for smooth fades
    if (current){
      fade(tracks[current], tracks[current].volume, isMuted ? 0 : TARGET_VOL, 350);
    }
    soundToggle.setAttribute("aria-pressed", String(isMuted));
  }

  /* ---------------------------------------------------------
     SOUND TOGGLE
  --------------------------------------------------------- */
  const soundToggle = document.getElementById("soundToggle");
  soundToggle.addEventListener("click", () => setMuted(!isMuted));

  /* ---------------------------------------------------------
     INTRO -> RIBBON CLICK -> FLASH -> UNLOCK -> HALOOO
  --------------------------------------------------------- */
  const body = document.body;
  const experience = document.getElementById("experience");
  const flash = document.getElementById("flash");
  const ribbonBtn = document.getElementById("ribbonBtn");
  const haloooSection = document.getElementById("halooo");

  let opened = false;
  ribbonBtn.addEventListener("click", () => {
    if (opened) return;
    opened = true;

    playTrack("intro");

    flash.classList.add("is-firing");
    ribbonBtn.style.pointerEvents = "none";

    setTimeout(() => {
      body.classList.add("is-unlocked");
      haloooSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 420);

    setTimeout(() => flash.classList.remove("is-firing"), 900);
  });

  /* ---------------------------------------------------------
     HALOOO -> "click here!!" -> RANKING (explicit track swap)
  --------------------------------------------------------- */
  const toRanking = document.getElementById("toRanking");
  const rankingSection = document.getElementById("ranking");

  toRanking.addEventListener("click", () => {
    playTrack("ranking");
    rankingSection.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------------------------------------------------------
     RANKING CAROUSEL
  --------------------------------------------------------- */
  const slides = Array.from(document.querySelectorAll(".rank-slide"));
  const dots = Array.from(document.querySelectorAll(".rank-dot"));
  const rankNext = document.getElementById("rankNext");
  const rankNextLabel = document.getElementById("rankNextLabel");
  const letter1 = document.getElementById("letter1");

  let slideIndex = 0;

  function goToSlide(i){
    slideIndex = Math.max(0, Math.min(slides.length - 1, i));
    slides.forEach((s, idx) => s.classList.toggle("is-active", idx === slideIndex));
    dots.forEach((d, idx) => d.classList.toggle("is-active", idx === slideIndex));
    rankNextLabel.textContent = slideIndex === slides.length - 1 ? "keep going" : "next";
  }

  dots.forEach(d => {
    d.addEventListener("click", () => goToSlide(parseInt(d.dataset.go, 10)));
  });

  rankNext.addEventListener("click", () => {
    if (slideIndex < slides.length - 1){
      goToSlide(slideIndex + 1);
    } else {
      letter1.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  goToSlide(0);

  /* ---------------------------------------------------------
     SCROLL-DRIVEN: letter section entering -> crossfade to
     the final track, and reveal paragraphs progressively.
  --------------------------------------------------------- */
  const letterSections = document.querySelectorAll(".letter");
  const letterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.35){
        playTrack("letter");
      }
    });
  }, { threshold: [0, 0.35, 0.6] });
  letterSections.forEach(sec => letterObserver.observe(sec));

  const paragraphs = document.querySelectorAll(".letter__body, .letter__scroll-cue");
  const paraObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add("is-visible");
      }
    });
  }, { threshold: 0.35 });
  paragraphs.forEach(p => paraObserver.observe(p));

  /* ---------------------------------------------------------
     OUTRO / REPLAY
  --------------------------------------------------------- */
  const replayBtn = document.getElementById("replayBtn");
  const introSection = document.getElementById("intro");

  replayBtn.addEventListener("click", () => {
    body.classList.remove("is-unlocked");
    experience.scrollTo({ top: 0, behavior: "auto" });
    opened = false;
    ribbonBtn.style.pointerEvents = "auto";
    playTrack("intro", { restart: true });
    goToSlide(0);
  });

  /* ---------------------------------------------------------
     Safety: pause all audio if tab hidden for long, resume vol
  --------------------------------------------------------- */
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    if (current && tracks[current].paused && opened){
      tracks[current].play().catch(() => {});
    }
  });

})();
