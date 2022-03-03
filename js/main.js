const BOX_OPEN_DELAY = 300;

function closeBox({ boxEl, index, timers, callback }) {
  clearTimeout(timers[`has-opened-${index}`]);

  boxEl.classList.remove("has-opened");

  timers[`open-${index}`] = setTimeout(() => {
    boxEl.classList.remove("has-opened", "is-open");
    if (callback) callback();
  }, [BOX_OPEN_DELAY]);
}

function closeAllBoxes({ boxEls, excludeIndex, timers } = {}) {
  boxEls.forEach((boxEl, index) => {
    if (index === excludeIndex) return;

    closeBox({
      boxEl,
      index,
      timers,
    });
  });
}

function openBox({ boxEl, index, timers, callback } = {}) {
  clearTimeout(timers[`open-${index}`]);

  boxEl.classList.add("is-open");

  timers[`has-opened-${index}`] = setTimeout(() => {
    boxEl.classList.add("has-opened");
    if (callback) callback();
  }, BOX_OPEN_DELAY);
}

function applyTouchEvents({ boxEls, timers }) {
  let eventDataArr = [];

  boxEls.forEach((boxEl, index) => {
    const callback = (e) => {
      if (boxEl.classList.contains("has-opened")) return;

      e.preventDefault();

      openBox({
        boxEl,
        index,
        timers,
      });

      closeAllBoxes({
        boxEls,
        excludeIndex: index,
        timers,
      });
    };
    const eventName = "click";
    boxEl.addEventListener(eventName, callback);

    eventDataArr.push({
      boxEl,
      eventName,
      callback,
    });
  });

  return () => {
    eventDataArr.forEach(({ boxEl, eventName, callback }) => {
      boxEl.removeEventListener(eventName, callback);
    });
  };
}

function applyMouseEvents({ boxEls, timers }) {
  let eventDataArr = [];

  boxEls.forEach((boxEl, index) => {
    const callback = (e) => {
      openBox({
        boxEl,
        index,
        timers,
      });
    };
    const eventName = "pointerenter";
    boxEl.addEventListener(eventName, callback);

    eventDataArr.push({
      boxEl,
      eventName,
      callback,
    });
  });

  boxEls.forEach((boxEl, index) => {
    const callback = (e) => {
      closeBox({
        boxEl,
        index,
        timers,
      });
    };
    const eventName = "pointerleave";
    boxEl.addEventListener(eventName, callback);

    eventDataArr.push({
      boxEl,
      eventName,
      callback,
    });
  });

  return () => {
    eventDataArr.forEach(({ boxEl, eventName, callback }) => {
      boxEl.removeEventListener(eventName, callback);
    });
  };
}

function applyEvents() {
  const boxEls = document.querySelectorAll(".box-list li");
  const timers = {};
  const isHoverSupport = matchMedia("(hover: hover").matches;

  const handlePointerdown = (e) => {
    if (e.target.closest(".box")) return;

    closeAllBoxes({
      boxEls: boxEls,
      timers: timers,
    });
  };

  document.addEventListener("pointerdown", handlePointerdown);

  let mouseEventCleanup;
  let touchEventCleanup;
  if (isHoverSupport) {
    mouseEventCleanup = applyMouseEvents({
      boxEls,
      timers,
    });
  } else {
    touchEventCleanup = applyTouchEvents({ boxEls, timers });
  }

  return () => {
    document.removeEventListener("pointerdown", handlePointerdown);
    if (mouseEventCleanup) mouseEventCleanup();
    if (touchEventCleanup) touchEventCleanup();
  };
}

function adjustAxesHeight(axesContainerEl) {
  axesContainerEl.style.height = "";

  const { scrollHeight } = document.documentElement;
  const height =
    scrollHeight > window.innerHeight ? scrollHeight : window.innerHeight;

  axesContainerEl.style.height = `${height}px`;
}

function playIntro() {
  let fallTimers = [];
  const fall = (objectEl) => {
    const delay = 1000 + Math.floor(Math.random() * 500);
    const fallTimer = setTimeout(() => {
      objectEl.classList.add("has-fallen");
    }, delay);
    fallTimers.push(fallTimer);
  };
  const axesEl = document.getElementById("js-axes");
  const objectsEls = document.querySelectorAll(".js-fall");

  const doneTimer = setTimeout(() => {
    axesEl.classList.add("is-done");
  }, 100);

  objectsEls.forEach(fall);

  return () => {
    fallTimers.forEach(clearTimeout);
    clearTimeout(doneTimer);
    objectsEls.forEach((objectEl) => objectEl.classList.remove("has-fallen"));
    axesEl.classList.remove("is-done");
  };
}

function init() {
  const axesContainerEl = document.getElementById("js-axes-container");

  const clearIntro = playIntro();
  adjustAxesHeight(axesContainerEl);
  const clearEvents = applyEvents();

  const handleResize = () => adjustAxesHeight(axesContainerEl);

  window.addEventListener("resize", handleResize);

  return () => {
    clearIntro();
    clearEvents();
    window.removeEventListener("resize", handleResize);
  };
}

const media = matchMedia("screen and (min-width: 768px)");

let cleanup;
if (media.matches) {
  cleanup = init();
}

media.addEventListener("change", () => {
  if (cleanup) cleanup();
  if (media.matches) cleanup = init();
});
