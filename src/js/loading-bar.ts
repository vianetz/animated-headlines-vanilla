/**!
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import {AnimatedWordsElement} from "./words";

class LoadingBarAnimatedWordsElement extends AnimatedWordsElement {
    readonly #loadingClassName = 'is-loading';
    barWaiting = 800;

    protected init() {
        super.init();

        this.barWaiting = this.hasAttribute('bar-waiting') ? parseInt(<string>this.getAttribute('bar-waiting')) : this.barWaiting;
        this.runAfter(this.barWaiting, () => this.classList.add(this.#loadingClassName));
    }

    protected next(word: HTMLElement|null = null) {
        super.next(word);

        word = word ?? this.current();
        if (word === null) {
            return;
        }

        (word.parentNode as HTMLElement).classList.remove(this.#loadingClassName);
        this.runAfter(this.barWaiting, () => (word.parentNode as HTMLElement).classList.add(this.#loadingClassName));
    }
}
customElements.define('via-animated-headline-loading', LoadingBarAnimatedWordsElement);