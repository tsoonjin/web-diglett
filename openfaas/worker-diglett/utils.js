const extractAllLinks = (page) => {
  return page.evaluate(() => {
    const urlArray = Array.from(document.links).map((link) => link.href);
    const uniqueUrlArray = [...new Set(urlArray)];
    return uniqueUrlArray;
  });
}

const extractImageLinks = (page) => {
  return page.evaluate(() => {
    const srcs = Array.from(
      document.querySelectorAll("img")
    ).map((image) => image.getAttribute("src"));
    return srcs;
  })
};

const extractVideoLinks = (page) => {
  return page.evaluate(() => {
    const srcs = Array.from(
      document.querySelectorAll("video")
    ).map((video) => video.getAttribute("src"));
    return srcs;
  });
}

module.exports = {
  extractAllLinks,
  extractImageLinks,
  extractVideoLinks
}
