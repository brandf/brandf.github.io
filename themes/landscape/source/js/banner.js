var numBanners = 3;
var bannerIndex = Math.floor(Math.random() * numBanners);
var iframe = document.getElementById('banner-iframe');
iframe.src = 'https://brandf.github.io/brandf-banner-' + bannerIndex;
