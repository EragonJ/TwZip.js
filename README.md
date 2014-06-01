# TwZip.js

## What is TwZip.js

TwZip.js - A jQuery plugin that can help you search Taiwan Zipcode without
backend support. All you have to do is setup the basic environment for
generated json files and that's it !

## How to build zipcode data ?

Just `make db` !

By default, zipcode data will be generated (~ 3MB) inside a folder called 
`data/db` at the same folder of `makefile`. 

## How to use ?

1 - Inject needed scripts first (jQuery needed)

```html
<script src="jquery.min.js"></script>
<script src="twzip.js"></script>
```

2 - Initialize TwZip

```javascript
var twZip = new TwZip();
```

3 - Search on the fly

```javascript
twZip.search('台北市中正區', function(data) {
  console.log(data);
});
```

## Some Notes

1. I implemented a basic cache mechanism that will keep loaded data inside TwZip
and you don't have to load it again.

2. In TwZip.js, You can directly search the whole address (2 layers at maximun)
like previous example. It will send out two requests at the same time to load
each layer's data back from server.

## Author

EragonJ (Chia-Lung, Chen)

Email: eragonj@eragonj.me

## License

MIT
