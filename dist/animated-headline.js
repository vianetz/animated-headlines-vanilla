function c(i, e, t) {
  let s = performance.now();
  requestAnimationFrame(function a(l) {
    let n = (l - s) / t;
    n > 1 && (n = 1);
    let d = i(n);
    e(d), n < 1 && requestAnimationFrame(a);
  });
}
class r extends HTMLElement {
  #e = !1;
  holdDelay = 2500;
  wordSelector = "b";
  connectedCallback() {
    this.holdDelay = this.hasAttribute("hold") ? parseInt(this.getAttribute("hold")) : this.holdDelay, this.resize(), window.matchMedia("(prefers-reduced-motion: reduce)").matches || this.start();
  }
  attributeChangedCallback() {
    this.resize();
  }
  resize() {
    let e = 0;
    this.querySelectorAll(this.wordSelector).forEach(function(t) {
      e = Math.max(t.offsetWidth, e);
    }), this.style.width = e.toString();
  }
  /** @api */
  start() {
    this.#e = !1, this.runAfter(this.holdDelay, () => this.next());
  }
  /** @api */
  stop() {
    this.#e = !0;
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
    this.makeHidden(e), this.makeVisible(t);
  }
  makeVisible(e) {
    e.removeAttribute("hidden");
  }
  makeHidden(e) {
    e.setAttribute("hidden", "");
  }
  runAfter(e, t) {
    c((s) => s, (s) => {
      if (this.#e)
        throw "execution aborted";
      s === 1 && t();
    }, e);
  }
}
customElements.define("via-animated-words-headline", r);
class h extends r {
  lettersDelay = 50;
  letterClassName = "letter";
  connectedCallback() {
    super.connectedCallback(), this.lettersDelay = this.hasAttribute("delay") ? parseInt(this.getAttribute("delay")) : this.lettersDelay, this.querySelectorAll(this.wordSelector).forEach(this.splitIntoSingleLetters, this);
  }
  next(e = null) {
    if (e = e ?? this.current(), e === null)
      return;
    const t = this.getNextWord(e), s = e.querySelectorAll("." + this.letterClassName).length >= t.querySelectorAll("." + this.letterClassName).length;
    this.hideLetter(e.querySelector("." + this.letterClassName), e, s), this.showLetter(t.querySelector("." + this.letterClassName), t, !s), this.switchWord(e, t);
  }
  hideLetter(e, t, s) {
    this.hideOrShowLetter(e, t, s, !0);
  }
  showLetter(e, t, s) {
    this.hideOrShowLetter(e, t, s, !1);
  }
  hideOrShowLetter(e, t, s = !0, a = !1) {
    a ? this.makeHidden(e) : this.makeVisible(e), e.nextElementSibling ? this.runAfter(this.lettersDelay, () => this.hideOrShowLetter(e.nextElementSibling, t, s, a)) : s && this.runAfter(this.holdDelay, () => this.next(a ? this.getNextWord(t) : t));
  }
  splitIntoSingleLetters(e) {
    const t = [];
    for (const s of e.childNodes)
      if (s.nodeType === Node.TEXT_NODE) {
        const a = s.textContent.split("");
        for (let l in a) {
          const n = document.createElement("span");
          n.innerHTML = a[l], t.push(n);
        }
      } else s.nodeType === Node.ELEMENT_NODE ? t.push(s) : console.warn("unsupported child node", s);
    t.forEach((s) => {
      s.classList.add(this.letterClassName), e.hasAttribute("hidden") && s.setAttribute("hidden", "");
    }), e.innerHTML = t.map((s) => s.outerHTML).join(""), e.style.opacity = "1";
  }
}
customElements.define("via-animated-letters-headline", h);
class u extends r {
  revealDelay = 600;
  connectedCallback() {
    super.connectedCallback(), this.revealDelay = this.hasAttribute("delay") ? parseInt(this.getAttribute("delay")) : this.revealDelay;
  }
  resize() {
    this.style.width = String(this.offsetWidth + 10);
  }
  showWord(e) {
    let t = e.parentNode.animate([{ width: "2px" }, { width: e.offsetWidth + "px" }], { duration: this.revealDelay });
    t.onfinish = (s) => this.runAfter(this.holdDelay, () => this.next(e));
  }
  next(e = null) {
    if (e = e ?? this.current(), e === null)
      return;
    const t = this.getNextWord(e);
    let s = e.parentNode.animate([{ width: e.offsetWidth + "px" }, { width: "2px" }], { duration: this.revealDelay });
    s.onfinish = (a) => {
      this.switchWord(e, t), this.showWord(t);
    };
  }
}
customElements.define("via-animated-clip-headline", u);
class m extends r {
  #e = "is-loading";
  barDelay = 500;
  connectedCallback() {
    super.connectedCallback(), this.barDelay = this.hasAttribute("delay") ? parseInt(this.getAttribute("delay")) : this.barDelay, this.runAfter(this.barDelay, () => this.classList.add(this.#e));
  }
  next(e = null) {
    super.next(e), e = e ?? this.current(), e !== null && (e.parentNode.classList.remove(this.#e), this.runAfter(this.barDelay, () => e.parentNode.classList.add(this.#e)));
  }
}
customElements.define("via-animated-loading-headline", m);
class f extends h {
  #e = "waiting";
  #t = "selected";
  selectionDuration = 500;
  connectedCallback() {
    super.connectedCallback(), this.selectionDuration = this.hasAttribute("selection") ? parseInt(this.getAttribute("selection")) : this.selectionDuration;
  }
  resize() {
  }
  showWord(e) {
    this.showLetter(e.querySelector("." + this.letterClassName), e), this.makeVisible(e);
  }
  next(e = null) {
    if (e = e ?? this.current(), e === null)
      return;
    const t = this.getNextWord(e), s = e.parentNode;
    s.classList.add(this.#t), s.classList.remove(this.#e), this.runAfter(this.selectionDuration, () => {
      s.classList.remove(this.#t), this.makeHidden(e), e.querySelectorAll("." + this.letterClassName).forEach((a) => this.makeHidden(a));
    }), this.runAfter(this.selectionDuration * 2, () => this.showWord(t));
  }
  showLetter(e, t, s = !0) {
    super.showLetter(e, t, s), e.nextElementSibling || this.runAfter(200, () => t.parentNode.classList.add(this.#e));
  }
}
customElements.define("via-animated-type-headline", f);
var o = /* @__PURE__ */ ((i) => (i.Clip = "clip", i.LoadingBar = "loading-bar", i.Push = "push", i.Rotate1 = "rotate-1", i.Rotate2 = "rotate-2", i.Rotate3 = "rotate-3", i.Scale = "scale", i.Slide = "slide", i.Type = "type", i.Zoom = "zoom", i))(o || {});
function b(i, e = {}) {
  let t;
  switch (i) {
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
      throw "invalid animation type " + i + " (must be one of " + Object.values(o) + ")";
  }
  for (const [s, a] of Object.entries(e))
    t.setAttribute(s, a ?? "");
  return t;
}
class p extends HTMLElement {
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
    const e = this.getAttribute("animation"), t = {};
    for (const a of this.attributes)
      a.name !== "type" && (t[a.name] = a.value);
    const s = b(e, t);
    Array.from(this.children).forEach((a) => {
      a.tagName?.startsWith("VIA-ANIMATED-") ? a.childNodes.forEach((l) => s.appendChild(l.cloneNode(!0))) : s.appendChild(a.cloneNode(!0));
    }), this.innerHTML = "", this.appendChild(s);
  }
}
customElements.define("via-animated-headline", p);
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
