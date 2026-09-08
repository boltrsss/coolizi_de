const FAQList = document.querySelector("#faq_container");

if (FAQList) {
  function faqCollapseHandler() {
    if (!FAQList) return;
    FAQList.addEventListener("click", (ev) => {
      if (!ev.target.classList.contains("questions__card")) return;
      const card = ev.target;
      const innerList = card.querySelector(".questions__cardList");
      const listWrap = card.querySelector(".questions__listWrap");
      const indicator = card.querySelector(".questions__button");
      const indicatorSvg = indicator.querySelector(".questions__svg");
      const height = innerList.clientHeight;
      if (!innerList || !card || !indicator) return;
      const state = ev.target.getAttribute("expanded");
      if (state === "false") {
        const allCards = FAQList.querySelectorAll(".questions__listWrap");
        const cardsIdicator = FAQList.querySelectorAll(".questions__button");
        const cards = FAQList.querySelectorAll(".questions__card");
        allCards.forEach((item) => (item.style.height = "0px"));
        cardsIdicator.forEach((item) => item.setAttribute("expanded", false));
        cards.forEach((item) => {
          item.setAttribute("expanded", false);
          item.classList.add("questions__card-hover");
        });
        card.setAttribute("expanded", "true");
        indicator.setAttribute("expanded", "true");
        card.classList.remove("questions__card-hover");
        indicatorSvg.classList.remove("questions__svg-active");
        listWrap.style.height = `${height}px`;
      } else {
        card.setAttribute("expanded", "false");
        indicator.setAttribute("expanded", "false");
        card.classList.add("questions__card-hover");
        listWrap.style.height = `0px`;
      }
    });
  }

  //add screen reader friendly <a> tag descriptions

  const tags = FAQList.querySelectorAll("a");
  tags.forEach((tag) => {
    const span = document.createElement("span");
    span.classList.add("screen-reader-text");
    span.innerText = "customers support";
    tag.appendChild(span);
  });

  faqCollapseHandler();
}
