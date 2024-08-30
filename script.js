gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin);
let lenis;

if (Webflow.env("editor") === undefined) {
  lenis = new Lenis();

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll("[data-lenis-start]").forEach(function (element) {
    element.addEventListener("click", function () {
      lenis.start();
    });
  });

  document.querySelectorAll("[data-lenis-stop]").forEach(function (element) {
    element.addEventListener("click", function () {
      lenis.stop();
    });
  });

  document.querySelectorAll("[data-lenis-toggle]").forEach(function (element) {
    element.addEventListener("click", function () {
      element.classList.toggle("stop-scroll");
      if (element.classList.contains("stop-scroll")) {
        lenis.stop();
      } else {
        lenis.start();
      }
    });
  });
}

function initDragContainer() {
  if (document.querySelector("[data-drag-container]")) {
    let clampSkew = gsap.utils.clamp(-4, 4);

    class DraggableImg {
      constructor(Image) {
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
            gsap.to(Image, {
              clipPath: "inset(2%)",
              duration: 1,
              ease: "power4.out",
              overwrite: "auto",
            });
          },
          onRelease() {
            gsap.to(Image, {
              clipPath: "inset(0%)",
              duration: 1,
              ease: "power4.out",
              overwrite: "auto",
            });
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
      let img = item.querySelector(".img-cover");
      gsap.fromTo(
        img,
        { yPercent: 0 },
        {
          yPercent: -15,
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
initDragContainer();
