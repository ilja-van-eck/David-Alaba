gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin, CustomEase, SplitText, Flip);
let lenis;

if (Webflow.env("editor") === undefined) {
  lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  $("[data-lenis-start]").on("click", function () {
    lenis.start();
  });
  $("[data-lenis-stop]").on("click", function () {
    lenis.stop();
  });
  $("[data-lenis-toggle]").on("click", function () {
    $(this).toggleClass("stop-scroll");
    if ($(this).hasClass("stop-scroll")) {
      lenis.stop();
    } else {
      lenis.start();
    }
  });
}

let lineTargets;
let letterTargets;
let characterTargets;
let ranHomeLoader = false;
let menuOpenFlag = false;
let isMobile = window.innerWidth < 550;
let isMobileLandscape = window.innerWidth < 768;
let isTablet = window.innerWidth < 992;
let nav = document.querySelector(".nav")
let contactAnchors = nav.querySelectorAll("[data-contact-anchor]")

CustomEase.create(
  "main",
  "0.65, 0.01, 0.05, 0.99"
);

gsap.defaults({
  ease:"main",
  duration:0.65
})




function handleOrientationChange() {
  setTimeout(function () {
    window.location.reload();
  }, 250);
}
window.addEventListener("orientationchange", handleOrientationChange);

function runSplit(next) {
  next = next || document;
  lineTargets = next.querySelectorAll('[data-anim="lines"]');
  var split = new SplitText(lineTargets, {
    linesClass: "line",
    wordsClass:"word",
    type: "lines, words",
    clearProps: "all",
  });

  letterTargets = next.querySelectorAll('[data-anim="letters"]');
  if (letterTargets) {
    var splitLetters = new SplitText(letterTargets, {
      type: "lines, words, chars",
      reduceWhiteSpace: false,
      charsClass: "char",
      wordsClass:"word"
    });
  }
  characterTargets = next.querySelectorAll('[data-split="letters"]');
    if (characterTargets) {
    var splitCharacters = new SplitText(characterTargets, {
      type: "chars",
      reduceWhiteSpace: false,
      charsClass: "char",
    });
  }
  // ————— Update on window resize
  let windowWidth = $(window).innerWidth();
  window.addEventListener("resize", function () {
    if (windowWidth !== $(window).innerWidth()) {
      windowWidth = $(window).innerWidth();
      split.revert();
      splitLetters.revert();
      runSplit();
    }
  });
}

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function resetWebflow(data) {
  let parser = new DOMParser();
  let dom = parser.parseFromString(data.next.html, "text/html");
  let webflowPageId = dom.querySelector("html").getAttribute("data-wf-page");
  document.documentElement.setAttribute("data-wf-page", webflowPageId);
  window.Webflow.destroy();
  window.Webflow.ready();
  window.Webflow.require("ix2").init();
}

function initMobileMenu(){
  let toggle = document.querySelector(".nav-button")
  let linkWrap = nav.querySelector(".nav-list")
  let links = linkWrap.querySelectorAll(".text-link")
  
  links.forEach((link)=>{
    link.addEventListener('click', () => {
      toggle.click()
    });    
  })

  toggle.addEventListener('click', () => {
    let navState = nav.getAttribute('data-nav') === 'open' ? 'closed' : 'open';
    nav.setAttribute('data-nav', navState);
  });
}
if(isMobileLandscape){initMobileMenu();}


function initCopyEmail(next) {
  let triggers = next.querySelectorAll('[data-copy-email]')
  if (triggers) {
    triggers.forEach(trigger => {
      trigger.addEventListener('click', function () {
        let email = this.getAttribute('data-copy-email')
        navigator.clipboard.writeText(email).then(
          function () {
            trigger.classList.add('copied')
            setTimeout(() => {
              trigger.classList.remove('copied')
            }, 3000)
          },
          function (err) {
            console.error('Async: Could not copy text: ', err)
          }
        )
      })
    })
  }
}

function initTypographyAnimations(next){
  let letterAnimations = next.querySelectorAll('[data-anim="letters"]')
  if(letterAnimations){
    letterAnimations.forEach((target) => {
      let words = target.querySelectorAll(".word")
      words.forEach((word) => {
        let letters = word.querySelectorAll(".char")
        ScrollTrigger.create({
          trigger:word,
          start:"top bottom",
          onEnter:()=>{
            gsap.fromTo(letters,
            {
              yPercent:100,
              rotateY: 45,
              rotateX: -30,
              autoAlpha:0
            },
            {
              yPercent:0,
              rotateY: 0,
              rotateX:0,
              autoAlpha:1,
              duration:0.8,
              delay:0.1,
              stagger:0.015,
              overwrite:true,
              immediateRender:true
            })
          }
        })
        ScrollTrigger.create({
          trigger:word,
          start:"top bottom",
          onLeaveBack:()=>{
            gsap.to(letters,{
              yPercent:100,
              rotateY: 45,
              rotateX: -30,
              autoAlpha:0,
              duration:0.1,
              immediateRender:false
            })
          }
        })
      })
    })
  }

let lineAnimations = next.querySelectorAll('[data-anim="lines"]');
if(lineAnimations){
  lineAnimations.forEach((target)=>{
    let lines = target.querySelectorAll(".line");
    lines.forEach((line, lineIndex)=>{
      let words = line.querySelectorAll(".word");
      gsap.set(words,{yPercent:120})
      
      ScrollTrigger.create({
        trigger: lines[0],
        start: "top bottom",
        once:true,
        onEnter: ()=>{
          gsap.fromTo(words,
          {
            yPercent: 120,
          },
          {
            yPercent: 0,
            duration: 1.5,
            delay: lineIndex * 0.03, 
            stagger: 0.015,
            overwrite: true,
            immediateRender: true,
          });
        }
      });
    });
  });
}
}

function initImageWipes(next){
  let name = next.getAttribute("data-barba-namespace")
  if(isMobile && name === "press"){return}
  let triggers = next.querySelectorAll('[data-wipe="wrap"]')
  if(triggers){
    triggers.forEach((trigger)=>{
      let content = trigger.querySelector('[data-wipe="content"]')
      let cover = trigger.querySelector('[data-wipe="cover"]')  
      gsap.set(cover,{scaleY:1})
      ScrollTrigger.create({
        trigger: trigger,
        start:"top bottom",
        once:true,
        onEnter:()=>{
          gsap.fromTo(cover,{scaleY:1},{scaleY:0,duration:1.2,delay:0.2})
          gsap.fromTo(content,{scale:1.2},{scale:1,duration:1.4,delay:0.2})
        }
      })
    })
  }
}

function initSectionParallax(next) {
  let targets = next.querySelectorAll("[data-parallax-section]");

  function setParallax(section, bg) {
    let sectionHeight = section.offsetHeight;
    let bgHeight = bg[0].offsetHeight;
    let difference = bgHeight - sectionHeight;

    gsap.fromTo(bg, {
      y: -difference 
    },
    {
      y: 0,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      }
    });
  }

  function updateParallax(section, bg) {
    let sectionHeight = section.offsetHeight;
    let bgHeight = bg[0].offsetHeight;
    let difference = bgHeight - sectionHeight;
    gsap.to(bg, { y: -difference });
  }

  if (targets) {
    targets.forEach((section) => {
      let bg = section.querySelectorAll("[data-parallax-bg]");
      if (bg) {
        setParallax(section, bg);

        window.addEventListener('resize', () => {
          updateParallax(section, bg);
        });
      }
    });
  }
}

function initParallaxImages(next) {
  let targets = next.querySelectorAll(".parallax-img");

  function setParallax(target, parent, direction) {
    let parentHeight = parent.offsetHeight;
    let targetHeight = target.offsetHeight;
    let difference = targetHeight - parentHeight;
    let distance = difference / 3
    
    let reversed = direction === "reverse"
    
    gsap.fromTo(target, {
      y: reversed ? 0 : -difference,
    }, {
      y: reversed ? -difference : distance,
      ease: "none",
      scrollTrigger: {
        trigger: parent,
        start: "clamp(top bottom)",
        end: "clamp(bottom top)",
        scrub: true,
      }
    });
  }

  function updateParallax(target, parent, direction) {
    let parentHeight = parent.offsetHeight;
    let targetHeight = target.offsetHeight;
    let difference = targetHeight - parentHeight;
    let reversed = direction === "reverse";
    
    gsap.to(target, { y: reversed ? 0 : -difference });
  }

  if (targets) {
    targets.forEach((target) => {
      let direction = target.getAttribute("data-parallax-direction")
      if(direction === null){ direction = "normal" } else { direction= "reverse" }
      
      let parent = target.parentElement;
      if (parent) {
        setParallax(target, parent, direction);

      const debouncedUpdateParallax = debounce(() => {
        updateParallax(target, parent, direction);
      }, 250);
      
      window.addEventListener('resize', debouncedUpdateParallax);
      }
    });
  }
}

function initFooterReveal(next){
  let footerLogo = next.querySelector(".footer-logo")
  let letters = footerLogo.querySelectorAll("path")
  let footer = next.querySelector(".footer")
  let lastSection = footer.previousElementSibling;
  
  ScrollTrigger.create({
    trigger: lastSection,
    start: "bottom 55%",
    onEnter:()=>{
      gsap.fromTo(letters,{
        yPercent: gsap.utils.wrap([-110, 110])
      },{
        yPercent: 0,
        duration: 0.8,
        ease:"main",
        stagger:0.025,
        overwrite:true
      })
    },
    onLeaveBack:()=>{
      gsap.to(letters,{
        yPercent: gsap.utils.wrap([-100, 100]),
        duration: 0.1,
      })
    }    
  })

}

function initPageLoad(data){
  ranHomeLoader = true;
  let next = data.next.container;
  let hero = next.querySelector(".section")
  let heroLines = hero.querySelectorAll('[data-load="line"]')
  let heroVid = hero.querySelector("video")
  let fadeTargets = hero.querySelectorAll('[data-load="fade"]')
  let images = hero.querySelectorAll('[data-load="img"]')

  let nextPageTitle = next.querySelectorAll('[data-load="title"]')
  if(nextPageTitle){
    let splitNextTitle = new SplitText(nextPageTitle, {
      linesClass: "line",
      wordsClass:"word",
      type: "lines, words",
      clearProps: "all",
    });          
  }  
  
  if(heroVid){heroVid.load()}


  let heroTitle = hero.querySelectorAll(".word")
  let tl = gsap.timeline({
    defaults:{duration:0.8},
    onComplete:()=>{next.setAttribute("data-loaded", "true")}
  })
    tl.from(heroLines,{scaleX:0,stagger:0.1},0.5)
    .from(heroTitle,{yPercent:120,stagger:0.06},"<")
    .from(images,{clipPath:"inset(0px 100% 100% 0px)",duration:1.2,stagger:0.1},"<")
    .from(fadeTargets,{autoAlpha:0,yPercent:50,duration:1},"<")
}

function initHomeLoader(){
  let loadWrap= document.querySelector(".load-w")
  let loadLogo = loadWrap.querySelector(".load-logo")
  let letters = loadLogo.querySelectorAll("path")
  let middleLetters = Array.from(letters).slice(1, -1);
  let loadIntro = loadWrap.querySelector(".load-intro")
  let introP = loadIntro.querySelector(".p-small")
  let loadImageWraps= loadWrap.querySelectorAll('.load-img__wrap')
  let loadImages = loadWrap.querySelectorAll(".img-cover")
  let loadBg = loadWrap.querySelector(".load-bg")
  let loadBar = loadWrap.querySelector(".load-bar")
  let hero = document.querySelector(".section")
  let heroLines = hero.querySelectorAll('[data-load="line"]')
  let pageTitle = hero.querySelectorAll('[data-load="title"]')
  let navLinks = nav.querySelectorAll("a")
  let navLogo = document.querySelector(".nav-logo")
  let navLogoInner = navLogo.querySelector("#logo-main")
  
  var split = new SplitText(introP, {
    linesClass: "line",
    type: "lines",
    clearProps: "all",
  });
  
  let splitTitle = new SplitText(pageTitle, {
    linesClass: "line",
    wordsClass:"word",
    type: "lines, words",
    clearProps: "all",
  });   
  
  let tl = gsap.timeline({
    defaults:{
      duration:0.75
    },
    onComplete:()=>{
      ranHomeLoader = true
    }
  })
  
  let heroTitle = hero.querySelectorAll(".word")
  
  tl.set(loadLogo,{autoAlpha:1})
  .set(loadIntro,{autoAlpha:1})
  .from(letters,{yPercent:gsap.utils.wrap([-130,130]),stagger:0.03})
  .from(split.lines,{yPercent:100,autoAlpha:0,stagger:0.1},"<")
  .to(loadImageWraps,{clipPath:"inset(0% 0px 0px 0px)",stagger:1,duration:0.75},"<")
  .to(loadBar,{scaleX:1,duration:4},"<")
  .to(loadImages,{scale:1.15,stagger:1,duration:0.75},"<")
  .to(middleLetters,{yPercent:gsap.utils.wrap([-130,130]),duration:0.6,stagger:{from:"center", each:0.02}},">-=0.5")
  .to(letters[0],{xPercent: 415,duration:0.8},"<+=0.2")
  .to(letters[9],{xPercent: -415,duration:0.8},"<")
  .to(split.lines,{yPercent:-100,autoAlpha:0,stagger:0.05,duration:0.6},"<")
  .to(loadImageWraps,{clipPath:"inset(0% 0px 101% 0px)",duration:0.8},"<+=0.25")
  .to(loadBg,{
    scaleY:0,
    duration:1,
    onStart:()=>{
      gsap.set(loadLogo,{color:"white"})
      gsap.set(loadBar,{transformOrigin:"right center"})
      const state = Flip.getState(loadLogo);
      navLogo.appendChild(loadLogo)
      Flip.from(state,{duration:1.2})
    }
  },"<+=0.4")
  .from(heroLines,{scaleX:0,stagger:0.1,duration:0.8},"<+=0.2")
  .to(loadBar,{scaleX:0,duration:0.6},"<")
  .from(heroTitle,{yPercent:120,stagger:0.06,duration:0.8},"<")
  .set(loadWrap,{display:"none"})
}

function updateContactAnchor(next) {

  const scrollToBottom = (e) => {
    //e.preventDefault();
    lenis.scrollTo(document.body.scrollHeight,
    {
      duration:1.5,
      lock:true
    });
  };

  contactAnchors.forEach(anchor => {
    anchor.removeEventListener("click", scrollToBottom);
    anchor.addEventListener("click", scrollToBottom);
  });

  barba.hooks.beforeLeave(() => {
    contactAnchors.forEach(anchor => {
      anchor.removeEventListener("click", scrollToBottom);
    });
  });
}
//
//
//
//
//
//
//
//
//

function initDragContainer() {
  if (document.querySelector("[data-drag-container]")) {
    let clampSkew = gsap.utils.clamp(-4, 4);

    class DraggableImg {
      constructor(Image) {
        let inner = Image.querySelector(".img-wrap__inner")
        const proxy = document.createElement("div"),
          tracker = InertiaPlugin.track(proxy, "x")[0],
          skewTo = gsap.quickTo(Image, "skewX"),
          updateSkew = () => {
            let vx = tracker.get("x");
            skewTo(clampSkew(vx / -50));
            if (!vx && !this.drag.isPressed) gsap.ticker.remove(updateSkew);
          },
          align = () =>
          gsap.set(proxy, {
            attr: { class: "proxy" },
            x: gsap.getProperty(Image, "x"),
            y: gsap.getProperty(Image, "y"),
            width: Image.offsetWidth,
            height: Image.offsetHeight,
            position: "absolute",
            pointerEvents: "none",
            top: Image.offsetTop,
            left: Image.offsetLeft,
          }),
          xTo = gsap.quickTo(Image, "x", { duration: 1, ease: "power3" }),
          yTo = gsap.quickTo(Image, "y", { duration: 1, ease: "power3" });

        align();
        Image.parentNode.append(proxy);

        window.addEventListener("resize", align);

        this.drag = Draggable.create(proxy, {
          type: "x,y",
          //lockAxis: true,
          trigger: Image,
          bounds: "[data-drag-container]",
          edgeResistance: 1,
          onPressInit() {
            align();
            xTo.tween.pause();
            yTo.tween.pause();
            gsap.ticker.add(updateSkew);
          },
          onPress() {
            Image.style.zIndex = proxy.style.zIndex;
            // gsap.to(inner, {
            //   width:"90%",
            //   height:"90%",
            //   overwrite: "auto",
            // });
          },
          onRelease() {
            // gsap.to(inner, {
            //   width:"100%",
            //   height:"100%",
            //   overwrite: "auto",
            // });
          },
          onDrag() {
            xTo(this.x);
            yTo(this.y);
          },
          onThrowUpdate() {
            xTo(this.x);
            yTo(this.y);
          },
          inertia: false,
        })[0];
      }
    }

    let draggables = gsap.utils
      .toArray("[data-gallery-item]")
      .map((el) => new DraggableImg(el));

    let items = document.querySelectorAll("[data-gallery-item]");
    items.forEach((item) => {
      let images = item.querySelectorAll(".img-cover");
      gsap.fromTo(
        images, { yPercent: 0 },
        {
          yPercent: -15,
          ease:"linear",
          scrollTrigger: {
            trigger: item,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });
  }
}

function initAboutHero(next){
  let hero = next.querySelector(".section")
  let headingWraps = hero.querySelectorAll('[data-about="headline"]')
  let imageContainer = hero.querySelector(".parallax-img")
  let cover = hero.querySelector(".about-cover")
  let mainImage = cover.querySelector(".img-cover")

  let heading1 = headingWraps[0];
  let heading2 = headingWraps[1];
  let state = Flip.getState(mainImage)
  
  let introLines = next.querySelectorAll('[data-intro="lines"]');
  var splitLines = new SplitText(introLines, {
    linesClass: "line",
    wordsClass:"word",
    type: "lines, words",
    clearProps: "all",
  });
  
  gsap.set(splitLines.words,{yPercent:120})
  
  gsap.delayedCall(1,()=>{
    introLines.forEach((target)=>{
      let lines = target.querySelectorAll(".line");
      lines.forEach((line, lineIndex)=>{
        let words = line.querySelectorAll(".word");
        gsap.to(words,{
          yPercent: 0,
          duration: 1.5,
          stagger: 0.015,
          overwrite: true,
          immediateRender: true,
        });
      });
    });    
  })

  let headlineAnimation = (function() {
    let tls = [];

    headingWraps.forEach((wrap) => {
      let titles = wrap.querySelectorAll('[data-about="title"]');
      let tl = gsap.timeline({
        repeat: -1,
        paused: true, 
        defaults: {
          duration: 1.2,
          delay: 0.75,
        }
      });

      tl
      .to(titles, {
        yPercent: -100,
      })
      .to(titles, {
        yPercent: -200,
      })
      .to(titles, {
        yPercent: -300,
      })    
      .to(titles, {
        yPercent: -400,
      })
      .set(titles, {
        yPercent: 0,
        delay: 0
      });

      tls.push(tl);
    });

    return {
      start: function() {
        tls.forEach(tl => tl.play());
      },
      stop: function() {
        tls.forEach(tl => tl.pause());
      }
    }
  })();
  
  imageContainer.style.overflow = "visible"
  imageContainer.appendChild(mainImage)
  Flip.from(state, {
    duration: 1.25,
    delay:0.25
  })

  let y1 = heading1.getBoundingClientRect().top;
  let y2 = heading2.getBoundingClientRect().top;

  let introTl = gsap.timeline({
    defaults: {
      duration: 1.25,
    },
    onComplete: () =>{ 
      headlineAnimation.start()
      initParallaxImages(hero)
      
      ScrollTrigger.create({
        trigger:hero,
        start:"top top",
        end: "bottom bottom",
        onLeave:() => {
          headlineAnimation.stop();
        },
        onEnterBack:() => {
          headlineAnimation.start();
        }
      })
      
      if (window.location.hash === '#about-achievements') {
        const target = document.querySelector('#about-achievements');
        if (target) {
          lenis.scrollTo(target,{duration:1.25});
        }
      }      
    }
  })

  introTl.set(heading1, {y: y2 - heading1.getBoundingClientRect().top,})
  .to(heading2, {y: y1 - heading2.getBoundingClientRect().top, },0.25)
  .to(heading1, {y: 0 }, "<")
  .to(cover, { clipPath: isMobile? "inset(50% 0px 0px 0px)": "inset(0px 0px 0px 100%)", }, "<")
  .set("#about-hero-wrap",{overflow:"hidden"})
  .set(cover,{display:isMobile?"none":"inherit"},1)

}

function initAboutDrag(next) {
  const grid = next.querySelector('.achievements-grid');
  
  if (isTablet) {
    const gridWidth = grid.scrollWidth; 
    const containerWidth = grid.offsetWidth; 
    const progressLine = next.querySelector(".progress-line")
    
    function updateProgressLine(x) {
      const dragProgress = Math.abs(x) / (gridWidth - containerWidth);
      const scale = Math.max(dragProgress, 0.1);
      gsap.set(progressLine, { scaleX: scale });
    }

    Draggable.create(grid, {
      type: 'x',
      bounds: {
        minX: -(gridWidth - containerWidth),
        maxX: 0
      },
      inertia: true,
      edgeResistance: 0.9,
      throwProps: true,
      onDrag: function() {
        updateProgressLine(this.x); 
      },
      onThrowUpdate: function() {
        updateProgressLine(this.x);
      }
    });
    
    updateProgressLine(0);
  }
}
//
//
//
//
//
//
//
//
//

function initSoundToggle(next) {
  let toggle = next.querySelector("[data-sound-toggle]");
  if (toggle) {
      let heroWrap = toggle.closest(".home-hero__wrap");
      let video = heroWrap ? heroWrap.querySelector("#hero-vid") : null;
    toggle.addEventListener("click", () => {
      if (video) {
        if (toggle.getAttribute("data-sound-toggle") === "on") {
          video.muted = false;
          video
          toggle.setAttribute("data-sound-toggle", "off");
        } else {
          video.muted = true;
          toggle.setAttribute("data-sound-toggle", "on");
        }
      }
    });
  }
}

function initHomeGallery(next){
  let container = next.querySelector(".home-img__grid")
  let rows = next.querySelectorAll(".home-img__grid-row")
  let items = container.querySelectorAll(".home-img__grid-item")
  
  gsap.from(items,{
    yPercent:150,
    ease:"linear",
    stagger:0.1,
    scrollTrigger:{
      trigger: container,
      start:"top bottom",
      end:"center center",
      scrub:1,
    }
  })
}

function initHomeHeroReveal(next){
  let container = next.querySelector('.home-hero__wrap')
  let scroller = container.querySelector('.home-hero__main')
  let bg = container.querySelector("video.cover")
  let controls = next.querySelector(".home-hero__bg-controls")
  
  gsap.fromTo(bg,{
    scale:1.25
  },
  {
    scale:1,
    ease:"linear",
    scrollTrigger:{
      trigger:scroller,
      start:"bottom bottom",
      end: "bottom top",
      scrub: true
    }
  })

  let tl = gsap.timeline({
    defaults:{ease:"linear",duration:1},
    scrollTrigger:{
      trigger: scroller,
      start:"bottom bottom",
      endTrigger:controls,
      end:"bottom 15%",
      scrub:true,
    }
  })
  
  tl.fromTo(controls,{autoAlpha:0},{autoAlpha:1})
  .to(controls,{autoAlpha:1,duration:0.3})
  .to(controls,{autoAlpha:0,duration:0.7})
  
}

function initJourney(next) {
  let yearWrap = next.querySelector(".journey-year__wrap");
  let yearRows = yearWrap.querySelectorAll(".journey-year__row");
  let steps = next.querySelectorAll(".journey-step");
  let imageWraps = next.querySelectorAll(".journey-img__wrap")
  let infoColumns = next.querySelectorAll(".journey-info__col")
  let timelineButtons = next.querySelectorAll(".timeline-button")
  let wrap = next.querySelector(".journey-wrap")
  let timeline = next.querySelector(".journey-timeline")
  
  ScrollTrigger.create({
    trigger: wrap,
    start: "top top",
    end:"bottom bottom",
    pin:timeline
  })

  if(!isMobileLandscape){
   // Year changing
  steps.forEach((step, stepIndex) => {
    yearRows.forEach((row) => {
      let chars = row.querySelectorAll('.char');
      
      let fromOffset = stepIndex === 0 ? 0 : -stepIndex * 100; 
      let toOffset = -(stepIndex + 1) * 100; 
      
      let nextYear = gsap.fromTo(chars, 
        { yPercent: fromOffset }, 
        { 
          yPercent: toOffset,
          stagger: 0.05,
          duration: 0.8, 
          paused: true,
          //overwrite:true,
          immediateRender:false,
        }
      );

      let prevYear = gsap.fromTo(chars, 
        { yPercent: toOffset }, 
        { 
          yPercent: fromOffset,
          stagger: 0.05,
          duration: 0.8, 
          paused: true,
          //overwrite:true,
          immediateRender:false,
        }
      );
      
      ScrollTrigger.create({
        trigger: step,
        start: "40% center", 
        end:"40% center",
        onEnter: () => nextYear.play(0), 
        onEnterBack: () => prevYear.play(0), 
        //onLeaveBack:()=> prevYear.play(0),
        //markers: true,
      });
    });
  });
  
  // Info 
  infoColumns.forEach((wrap)=>{
    let items = wrap.querySelectorAll(".journey-info__item")
    let parent = wrap.parentElement;
    gsap.set(items,{ x:"-1rem", autoAlpha:0 })   
        
    ScrollTrigger.create({
      trigger:wrap,
      start:"top 70%",
      endTrigger:parent,
      end:"bottom 60%",
      onEnter:()=>{
        gsap.fromTo(items,{
          y:"2rem",
          autoAlpha:0,
        },{
          y:"0rem",
          autoAlpha:1,        
          stagger:0.05,
        })       
      },
      onEnterBack:()=>{
        gsap.fromTo(items,{
          y:"2rem",
          autoAlpha:0,
        },{
          y:"0rem",
          autoAlpha:1,        
          stagger:0.05,
        })       
      },
      onLeave:()=>{
        gsap.to(items,{
          y:"2rem",
          autoAlpha:0,        
          stagger:0.05,
        })       
      }, 
      onLeaveBack:()=>{
        gsap.to(items,{
          y:"2rem",
          autoAlpha:0,        
          stagger:0.05,
        })       
      },       
    })
  })
     
  }

  // Timeline nav
  imageWraps.forEach((wrap, index) => {
    ScrollTrigger.create({
      trigger: wrap,
      start: "top 70%",  
      end: "bottom 70%",
      onEnter: () => {
        timelineButtons.forEach(button => button.classList.remove('active'));
        timelineButtons[index].classList.add('active');
      },
      onLeaveBack: () => {
        timelineButtons.forEach(button => button.classList.remove('active'));
        if (index > 0) {
          timelineButtons[index - 1].classList.add('active');
        }
      }
    });
  });

  timelineButtons.forEach((button, index) => {
    button.addEventListener('click', (e) => {
      let targetWrap = imageWraps[index];
      
      lenis.scrollTo(targetWrap, {
        offset: -18 * 16,
        duration: 1.2,
      });
    });
  });
  
}

function initGalleryLoad(next){
  let items = next.querySelectorAll('[data-gallery-item]')
  let covers = next.querySelectorAll(".gallery-cover")
  let images = next.querySelectorAll(".img-cover")
  let message = next.querySelector(".notice-message")
  let messageP = message.querySelector("div")
  
  let item1 = next.querySelectorAll("#galleryItem1")
  let item2 = next.querySelectorAll("#galleryItem2")
  let item3 = next.querySelectorAll("#galleryItem3")
  let item4 = next.querySelectorAll("#galleryItem4")
  
  let initialItems = [item1,item2,item3,item4]
  
  let tl = gsap.timeline({
    defaults:{
      duration: 1
    }
  })
  
  tl
  .set(covers,{transformOrigin:"top center"})
  .to(covers,{scaleY:0})
  .from(images,{scale:1.2},"<")
  .set(covers,{transformOrigin:"bottom center"})
  .set(message,{autoAlpha:1})
  .from(message,{scaleX:0})
  .to(initialItems,{clipPath:"inset(3%)",duration:0.25,stagger:0.02},"<")
  .from(messageP,{yPercent:150,duration:0.6},"<+=0.8")
  .to(initialItems,{x:0,y:0,duration:0.8},"<")
  .to(initialItems,{clipPath:"inset(0%)",duration:0.45})
  .to(message,{yPercent:200},">+=1")
  
}

function initGalleryFilters(next) {
  let filters = next.querySelectorAll('[data-gallery-filter]');
  let items = next.querySelectorAll('[data-gallery-item]');
  let rows = next.querySelectorAll('[data-gallery-row="false"]')
  
  gsap.set(rows,{display:"none"})
  ScrollTrigger.refresh()
  
  let initialFilter = next.querySelector('[data-gallery-filter="active"]');

  filters.forEach(filter => {
    filter.addEventListener('click', () => {
      if (filter.getAttribute('data-gallery-filter') === 'active') return;


      let activeFilter = next.querySelector('[data-gallery-filter="active"]');
      if (activeFilter) {
        activeFilter.setAttribute('data-gallery-filter', 'inactive');
      }

      filter.setAttribute('data-gallery-filter', 'active');
      let isInitialFilter = filter === initialFilter;

      items.forEach((item, index) => {
        let galleryCover = item.querySelector('.gallery-img__cover');
        let images = item.querySelectorAll(".img-cover")
        let cover = item.querySelector(".gallery-cover")
        if (isInitialFilter) {
          gsap.set(rows,{display:"none"})
          ScrollTrigger.refresh()
          gsap.to(cover,{scaleY: 1,duration:0.5})
          gsap.to(images[1],{scale:1.2})
          gsap.set(cover,{transformOrigin:"bottom center",delay:0.5})
          gsap.set(galleryCover,{display:"none", delay:0.5})
          gsap.to(cover,{scaleY: 0,duration:0.5,delay:0.5001})
          gsap.fromTo(images[0],{scale:1.2},{scale:1,delay:0.5001})
        } else {
          gsap.set(rows,{display:"flex"})
          ScrollTrigger.refresh()
          gsap.to(cover,{scaleY: 1,duration:0.5})
          gsap.to(images[0],{scale:1.2})
          gsap.set(cover,{transformOrigin:"top center",delay:0.5})
          gsap.set(galleryCover,{display:"block", delay:0.5})
          gsap.to(cover,{scaleY: 0,duration:0.5,delay:0.5001})
          gsap.fromTo(images[1],{scale:1.2},{scale:1,delay:0.5001})
        }
      });
    });
  });
}

//
//
//
//
//
//
//
//
//


function initGeneral(next){
  next = next || document;
  runSplit(next)
  updateContactAnchor(next)
  initCopyEmail(next)
  initTypographyAnimations(next)
  initImageWipes(next)
  initParallaxImages(next) 
  initFooterReveal(next)
}

function initHome(next){
  next = next || document;
  initHomeHeroReveal(next)
  initSectionParallax(next)
  initSoundToggle(next)
  if(!isMobile){
    initHomeGallery(next)
  }
}

//
//
//
//
//
//
//
//
//


    
barba.hooks.leave(() => {
  lenis.destroy();
});

barba.hooks.enter((data) => {
  let next = data.next.container;
  next.classList.add("fixed");
});

barba.hooks.afterEnter((data) => {
  let next = data.next.container;
  let name = data.next.namespace;
  let triggers = ScrollTrigger.getAll();
  triggers.forEach((trigger) => {
    trigger.kill();
  });
  
  if(ranHomeLoader === true || name !== "home"){
    initPageLoad(data)
  }

  $(".is--transitioning").removeClass("is--transitioning");
  next.classList.remove("fixed");

  if(Webflow.env("editor") === undefined){
    lenis = new Lenis({
      duration: 1.25,
      wrapper: document.body,
      easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -13 * t)),
    });
    lenis.scrollTo(".page-w", {
      duration: 0.5,
      force: true,
      lock: true,
    });
  }

  initGeneral(next);
});

barba.init({
   debug: true,
  preventRunning: true,
  prevent: function ({ el }) {
    if (el.hasAttribute("data-barba-prevent")) {
      return true;
    }
  },
  transitions: [
    {
      name: "default",
      sync: false,
      once() {
        if(Webflow.env("editor") === undefined){
          lenis.start();
        }
      },
      leave(data) {

        if (menuOpenFlag) {
          let menuButton = document.querySelector(".menu-btn");
          gsap.delayedCall(0.5, () => {
            menuButton.click();
          });
        }

        const tl = gsap.timeline({
          onComplete: () => data.current.container.remove(),
        });
        tl
          .to(
            data.current.container,
            {
              opacity: 0,
              duration: 0.5,
            }
          )
        return tl;
      },
      enter(data) {

        gsap.fromTo(
          data.next.container,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1,
            ease: "load",
            onComplete: function () {
              lenis.start();
              gsap.set(data.next.container, { clearProps: "all" });
            },
          }
        );
        

      },
    },
  ],
  views: [
    {
      namespace: "home",
      afterEnter(data) {
        let next = data.next.container;
        if (ranHomeLoader !== true) {
          initHomeLoader();
        }
        else {
          gsap.set(".load-w",{display:"none"});
        }
        initHome(next);
      },
    },
    {
      namespace:"journey",
      afterEnter(data){
        let next = data.next.container;
        initJourney(next)
      }
    },
    {
      namespace:"gallery",
      afterEnter(data){
        let next = data.next.container;
        initGalleryLoad(next);
        initDragContainer()
        initGalleryFilters(next)
      }
    },
    {
      namespace:"about",
      afterEnter(data){
        let next = data.next.container;
        initAboutHero(next)
        initAboutDrag(next)
      }
    },
  ],
});
    