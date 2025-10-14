/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import AnimatedWordsElement from "./words";

class ClipAnimatedWordsElement extends AnimatedWordsElement {
    revealDelay= 600;

    connectedCallback() {
        super.connectedCallback();
        this.revealDelay = this.hasAttribute('delay') ? parseInt(<string>this.getAttribute('delay')) : this.revealDelay;
    }

    protected resize() {
        this.style.width = String(this.offsetWidth + 10);
    }

    protected showWord(word: HTMLElement) {
       let animation = (word.parentNode as HTMLElement).animate([{width: '2px'}, {width: word.offsetWidth + 'px' }], {duration: this.revealDelay});
       animation.onfinish = (e) => this.runAfter(this.holdDelay, () => this.next(word));
    }

    protected next(word: HTMLElement|null = null) {
        word = word ?? this.current();
        if (word === null) {
            return;
        }

        const nextWord = this.getNextWord(word);

        let animation = (word.parentNode as HTMLElement).animate([{width: word.offsetWidth + 'px' }, {width: '2px'}], {duration: this.revealDelay});
        animation.onfinish = (e) => {
            this.switchWord(word, nextWord);
            this.showWord(nextWord);
        };
    }
}
customElements.define('via-animated-clip-headline', ClipAnimatedWordsElement);