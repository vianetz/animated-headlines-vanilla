/**!
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import {AnimatedWordsElement} from "./words";

class ClipAnimatedWordsElement extends AnimatedWordsElement {
    revealDuration= 600;

    protected init() {
        super.init();
        this.revealDuration = this.hasAttribute('reveal-duration') ? parseInt(<string>this.getAttribute('reveal-duration')) : this.revealDuration;
    }

    protected resize() {
        this.style.width = String(this.offsetWidth + 10);
    }

    protected showWord(word: HTMLElement) {
       let animation = (word.parentNode as HTMLElement).animate([{width: '2px'}, {width: word.offsetWidth + 'px' }], {duration: this.revealDuration});
       animation.onfinish = (e) => this.runAfter(this.animationDelay, () => this.next(word));
    }

    protected next(word: HTMLElement|null = null) {
        word = word ?? this.current();
        if (word === null) {
            return;
        }

        const nextWord = this.getNextWord(word);

        let animation = (word.parentNode as HTMLElement).animate([{width: word.offsetWidth + 'px' }, {width: '2px'}], {duration: this.revealDuration});
        animation.onfinish = (e) => {
            this.switchWord(word, nextWord);
            this.showWord(nextWord);
        };
    }
}
customElements.define('via-animated-headline-clip', ClipAnimatedWordsElement);