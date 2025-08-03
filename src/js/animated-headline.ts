/**!
 * Plain Vanilla JavaScript Animated Headline Component
 *
 * @author Geoff Selby
 * @author Christoph Massmann <cm@vianetz.com>
 * @license https://opensource.org/licenses/MIT MIT License
 */

import './letters';
import './words';
import './clip';
import './loading-bar';
import './type';

export enum AnimationType {
    Clip = 'clip',
    LoadingBar = 'loading-bar',
    Push = 'push',
    Rotate1 = 'rotate-1',
    Rotate2 = 'rotate-2',
    Rotate3 = 'rotate-3',
    Scale = 'scale',
    Slide = 'slide',
    Type = 'type',
    Zoom = 'zoom'
}

function createAnimatedHeadline(animationType: AnimationType, props: { [key: string]: string|null } = {}) {
    let element;

    switch (animationType) {
        case AnimationType.Clip:
            element = document.createElement('via-animated-clip-headline');
            break;
        case AnimationType.LoadingBar:
            element = document.createElement('via-animated-loading-headline');
            break;
        case AnimationType.Push:
        case AnimationType.Slide:
        case AnimationType.Rotate1:
        case AnimationType.Zoom:
            element = document.createElement('via-animated-words-headline');
            break;
        case AnimationType.Scale:
        case AnimationType.Rotate2:
        case AnimationType.Rotate3:
            element = document.createElement('via-animated-letters-headline');
            break;
        case AnimationType.Type:
            element = document.createElement('via-animated-type-headline');
            break;
        default:
            throw 'invalid animation type ' + animationType + ' (must be one of ' + Object.values(AnimationType) + ')';
    }

    // copy attributes to child
    for (const [key, value] of Object.entries(props)) {
        element.setAttribute(key, value ?? '');
    }

    return element;
}

/**
 * You can either use the global <via-animated-headline> custom element or the specific ones directly like <via-animated-type-headline>.
 * This element simply instantiates the right sub-component and adds all attributes from the parent.
 */
class AnimatedHeadline extends HTMLElement {
    static get observedAttributes() {
        return ['animation', 'hold', 'delay'];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const animationType = this.getAttribute('animation') as AnimationType;

        // collect all attributes except 'type'
        const forwardedAttrs: { [key: string]: string|null } = {};
        for (const attr of this.attributes) {
          if (attr.name !== 'type') {
            forwardedAttrs[attr.name] = attr.value;
          }
        }

        const wrapper = createAnimatedHeadline(animationType, forwardedAttrs);
        // re-add the inner contents of the element
        Array.from(this.children).forEach(child => {
            if (child.tagName?.startsWith('VIA-ANIMATED-')) {
                child.childNodes.forEach(n => wrapper.appendChild(n.cloneNode(true)));
            } else {
                wrapper.appendChild(child.cloneNode(true));
            }
        });

        // @ts-ignore
        this.innerHTML = '';
        // @ts-ignore
        this.appendChild(wrapper);
    }
}
customElements.define('via-animated-headline', AnimatedHeadline);