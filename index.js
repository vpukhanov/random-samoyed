$(function() {

	var 
		_queue = [],
		_posters = {},
		displayElement = document.querySelector('#displayContainer'),
		preloadElement = document.querySelector('#preload'),
		authorElement = document.querySelector('.author'),
		nextImageLoaded = false, firstInit = true;

	function updateAuthor(src) {
		var poster = _posters[src];

		if (poster) {
			authorElement.innerHTML = '<a href="' + poster.link + '" target="_blank">' + poster.title + '</a> от <a href="https://imgur.com/user/' + poster.author + '" target="_blank">' + poster.author + '</a>';
		} else {
			authorElement.innerHTML = '';
		}
	}

	function showImage(src) {
		displayElement.style.backgroundImage = 'url(' + src + ')';
		updateAuthor(src);
	}

	function preloadImage(src) {
		preloadElement.src = src;
	}

	function addImageToQueue(post, image) {
		if (image && image.link && _queue.indexOf(image.link) === -1) {
			_queue.push(image.link);
			_posters[image.link] = { author: post.account_url, title: post.title, link: post.link };
		}
	}

	function addPostToQueue(post) {
		if (post && post.images) {
			post.images.forEach(addImageToQueue.bind(this, post));
		}
	}

	function shuffleQueue() {
	    var j, x, i;
	    for (i = _queue.length - 1; i > 0; i--) {
	        j = Math.floor(Math.random() * (i + 1));
	        x = _queue[i];
	        _queue[i] = _queue[j];
	        _queue[j] = x;
	    }
	}

	function nextImage() {
		if (_queue.length > 0) {
			showImage(preloadElement.src);
			nextImageLoaded = false;
			preloadImage(_queue.pop());
		} else {
			preloadImages();
		}
	}

	function createQueue(posts) {
		if (!posts) {
			return;
		}

		posts.forEach(addPostToQueue);
		shuffleQueue();
		
		nextImage();
		nextImage();
	}

	function gotoNextImage() {
		if (nextImageLoaded) {
			nextImage();
		} else {
			$(displayElement).removeClass('clickable');
			$('.spinner').show();
		}
	}

	function signalNextImageReady() {
		if ($(displayElement).hasClass('clickable')) {
			nextImageLoaded = true;
		} else {
			nextImage();
			$(displayElement).addClass('clickable');
			$('.spinner').hide();
		}
	}

	function preloadImages() {
		var settings = {
		  "async": true,
		  "crossDomain": true,
		  "url": "https://api.imgur.com/3/gallery/t/samoyed",
		  "method": "GET",
		  "headers": {
		    "authorization": "Client-ID 96f75e4cf9bbb13"
		  }
		};

		$.ajax(settings).done(function (response) {
		  if (response && response.data && response.data.items) {
		  	createQueue(response.data.items);
		  	if (firstInit) {
			  	$(displayElement).on('click', gotoNextImage);
			  	$(preloadElement).on('load', signalNextImageReady);
			  	firstInit = false;
		  	}
		  } else {
		  	preloadImages();
		  }
		});
	}

	preloadImages();

});