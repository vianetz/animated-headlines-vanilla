const l = (s, e, t, i = !1) => s.dispatchEvent(new CustomEvent(`via-animated-headline:${e}`, { bubbles: !0, cancelable: i, detail: t }));
function u(s, e, t) {
  let i = performance.now();
  requestAnimationFrame(function a(h) {
    let n = (h - i) / t;
    n > 1 && (n = 1);
    let c = s(n);
    e(c), n < 1 && requestAnimationFrame(a);
  });
}
class r extends HTMLElement {
  #e = !1;
  holdDelay = 2500;
  wordSelector = "b";
  connectedCallback() {
    this.holdDelay = this.hasAttribute("hold") ? parseInt(this.getAttribute("hold")) : this.holdDelay, this.resize(), window.matchMedia("(prefers-reduced-motion: reduce)").matches || this.start(), l(this, "ready");
  }
  attributeChangedCallback() {
    this.resize();
  }
  resize() {
    let e = 0;
    this.querySelectorAll(this.wordSelector).forEach(function(t) {
      e = Math.max(t.offsetWidth, e);
    }), this.style.width = e.toString(), l(this, "resized", { width: e.toString() });
  }
  /** @api */
  start() {
    this.#e = !1, this.runAfter(this.holdDelay, () => this.next()), l(this, "started");
  }
  /** @api */
  stop() {
    this.#e = !0, l(this, "stopped");
  }
  /** @api */
  current() {
    return this.querySelector(this.wordSelector + ":not([hidden])") ?? this.querySelector(this.wordSelector);
  }
  // main logic
  next(e = null) {
    if (e = e ?? this.current(), e === null)
      return;
    const t = this.getNextWord(e);
    this.switchWord(e, t), this.runAfter(this.holdDelay, () => this.next(t));
  }
  getNextWord(e) {
    return e.nextElementSibling ? e.nextElementSibling : e.parentNode.children[0];
  }
  switchWord(e, t) {
    this.makeHidden(e), this.makeVisible(t), l(this, "word-replaced", { old: e, new: t });
  }
  makeVisible(e) {
    e.removeAttribute("hidden");
  }
  makeHidden(e) {
    e.setAttribute("hidden", "");
  }
  runAfter(e, t) {
    u((i) => i, (i) => {
      if (this.#e)
        throw "execution aborted";
      i === 1 && t();
    }, e);
  }
}
customElements.define("via-animated-words-headline", r);
class d extends r {
  lettersDelay = 50;
  letterClassName = "letter";
  connectedCallback() {
    super.connectedCallback(), this.lettersDelay = this.hasAttribute("delay") ? parseInt(this.getAttribute("delay")) : this.lettersDelay, this.querySelectorAll(this.wordSelector).forEach(this.splitIntoSingleLetters, this);
  }
  next(e = null) {
    if (e = e ?? this.current(), e === null)
      return;
    const t = this.getNextWord(e), i = e.querySelectorAll("." + this.letterClassName).length >= t.querySelectorAll("." + this.letterClassName).length;
    this.hideLetter(e.querySelector("." + this.letterClassName), e, i), this.showLetter(t.querySelector("." + this.letterClassName), t, !i), this.switchWord(e, t);
  }
  hideLetter(e, t, i) {
    this.hideOrShowLetter(e, t, i, !0);
  }
  showLetter(e, t, i) {
    this.hideOrShowLetter(e, t, i, !1);
  }
  hideOrShowLetter(e, t, i = !0, a = !1) {
    a ? this.makeHidden(e) : this.makeVisible(e), e.nextElementSibling ? this.runAfter(this.lettersDelay, () => this.hideOrShowLetter(e.nextElementSibling, t, i, a)) : i && this.runAfter(this.holdDelay, () => this.next(a ? this.getNextWord(t) : t));
  }
  splitIntoSingleLetters(e) {
    const t = [];
    for (const i of e.childNodes)
      if (i.nodeType === Node.TEXT_NODE) {
        const a = i.textContent.split("");
        for (let h in a) {
          const n = document.createElement("span");
          n.innerHTML = a[h], t.push(n);
        }
      } else i.nodeType === Node.ELEMENT_NODE ? t.push(i) : console.warn("unsupported child node:", i);
    t.forEach((i) => {
      i.classList.add(this.letterClassName), e.hasAttribute("hidden") && i.setAttribute("hidden", "");
    }), e.innerHTML = t.map((i) => i.outerHTML).join(""), e.style.opacity = "1";
  }
}
customElements.define("via-animated-letters-headline", d);
class m extends r {
  revealDelay = 600;
  connectedCallback() {
    super.connectedCallback(), this.revealDelay = this.hasAttribute("delay") ? parseInt(this.getAttribute("delay")) : this.revealDelay;
  }
  resize() {
    this.style.width = String(this.offsetWidth + 10);
  }
  showWord(e) {
    let t = e.parentNode.animate([{ width: "2px" }, { width: e.offsetWidth + "px" }], { duration: this.revealDelay });
    t.onfinish = (i) => this.runAfter(this.holdDelay, () => this.next(e));
  }
  next(e = null) {
    if (e = e ?? this.current(), e === null)
      return;
    const t = this.getNextWord(e);
    let i = e.parentNode.animate([{ width: e.offsetWidth + "px" }, { width: "2px" }], { duration: this.revealDelay });
    i.onfinish = (a) => {
      this.switchWord(e, t), this.showWord(t);
    };
  }
}
customElements.define("via-animated-clip-headline", m);
class f extends r {
  #e = "is-loading";
  barDelay = 500;
  connectedCallback() {
    super.connectedCallback(), this.barDelay = this.hasAttribute("delay") ? parseInt(this.getAttribute("delay")) : this.barDelay, this.runAfter(this.barDelay, () => this.classList.add(this.#e));
  }
  next(e = null) {
    super.next(e), e = e ?? this.current(), e !== null && (e.parentNode.classList.remove(this.#e), this.runAfter(this.barDelay, () => e.parentNode.classList.add(this.#e)));
  }
}
customElements.define("via-animated-loading-headline", f);
class p extends d {
  #e = "waiting";
  #t = "selected";
  selectionDuration = 500;
  connectedCallback() {
    super.connectedCallback(), this.selectionDuration = this.hasAttribute("selection") ? parseInt(this.getAttribute("selection")) : this.selectionDuration;
  }
  resize() {
  }
  showWord(e) {
    const t = this.current();
    this.showLetter(e.querySelector("." + this.letterClassName), e), this.makeVisible(e), l(this, "word-replaced", { old: t, new: e });
  }
  next(e = null) {
    if (e = e ?? this.current(), e === null)
      return;
    const t = this.getNextWord(e), i = e.parentNode;
    i.classList.add(this.#t), i.classList.remove(this.#e), this.runAfter(this.selectionDuration, () => {
      i.classList.remove(this.#t), this.makeHidden(e), e.querySelectorAll("." + this.letterClassName).forEach((a) => this.makeHidden(a));
    }), this.runAfter(this.selectionDuration * 2, () => this.showWord(t));
  }
  showLetter(e, t, i = !0) {
    super.showLetter(e, t, i), e.nextElementSibling || this.runAfter(200, () => t.parentNode.classList.add(this.#e));
  }
}
customElements.define("via-animated-type-headline", p);
var o = /* @__PURE__ */ ((s) => (s.Clip = "clip", s.LoadingBar = "loading-bar", s.Push = "push", s.Rotate1 = "rotate-1", s.Rotate2 = "rotate-2", s.Rotate3 = "rotate-3", s.Scale = "scale", s.Slide = "slide", s.Type = "type", s.Zoom = "zoom", s))(o || {});
function b(s, e) {
  let t;
  switch (s) {
    case "clip":
      t = document.createElement("via-animated-clip-headline");
      break;
    case "loading-bar":
      t = document.createElement("via-animated-loading-headline");
      break;
    case "push":
    case "slide":
    case "rotate-1":
    case "zoom":
      t = document.createElement("via-animated-words-headline");
      break;
    case "scale":
    case "rotate-2":
    case "rotate-3":
      t = document.createElement("via-animated-letters-headline");
      break;
    case "type":
      t = document.createElement("via-animated-type-headline");
      break;
    default:
      throw new Error("invalid animation type " + s + " (must be one of " + Object.values(o) + ")");
  }
  return Array.from(e).forEach((i) => t.setAttribute(i.name, i.value)), t;
}
class y extends HTMLElement {
  static get observedAttributes() {
    return ["animation", "hold", "delay"];
  }
  connectedCallback() {
    this.render();
  }
  attributeChangedCallback() {
    this.render();
  }
  render() {
    const e = this.getAttribute("animation"), t = b(e, this.attributes);
    Array.from(this.children).forEach((i) => {
      i.tagName?.startsWith("VIA-ANIMATED-") ? i.childNodes.forEach((a) => t.appendChild(a.cloneNode(!0))) : t.appendChild(i.cloneNode(!0));
    }), this.innerHTML = "", this.appendChild(t);
  }
}
customElements.define("via-animated-headline", y);
export {
  o as AnimationType
};
/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */
