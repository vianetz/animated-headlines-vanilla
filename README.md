# Animated Headlines with Vanilla JavaScript

Animated headlines, with interchangeable words that replace one another through CSS transitions.

## Installation

### npm

```bash
npm install animated-headlines-vanilla
```

### bower
```bash
bower install animated-headlines-vanilla
```

## Default Usage

Include the css in your head.
```html
<link rel="stylesheet" src="dist/css/animated-headline.css">
```

Use the following markup.
```html
<div class="selector">
    <h1 class="ah-headline">
        <span>My favorite food is</span>
        <span class="ah-words-wrapper">
            <b class="is-visible">pizza</b>
            <b>sushi</b>
            <b>steak</b>
        </span>
    </h1>
</div>
```

Finally, initialize the plugin.
```html
<script src="dist/js/animated-headline.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function () {
    AnimatedHeadline('.animatedHeadline');
});
</script>
```

## Advanced Usage

The plugin provides multiple options to customize the animation type and delay.
```html
<script>
document.addEventListener('DOMContentLoaded', function () {
    AnimatedHeadline('.animatedHeadline', {
        animationType: 'type'
    });
});
</script>
```

## Options

It is recommended to use the default delay options. Because of this, I won't list them below. See `src/js/jquery.animatedheadline.js` for a complete list of options.

<table>
    <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Default</th>
        <th>Description</th>
    </tr>
    <tr valign="top">
        <td>animation-type</td>
        <td>string</td>
        <td>rotate-1</td>
        <td>Type of animation used.<br /><strong>Options</strong>: <ul><li>rotate-1</li><li>rotate-2</li><li>rotate-3</li><li>type</li><li>loading-bar</li><li>slide</li><li>clip</li><li>zoom</li><li>scale</li><li>push</li></ul></td>
    </tr>
</table>

## License

jQuery Animated Headlines is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).