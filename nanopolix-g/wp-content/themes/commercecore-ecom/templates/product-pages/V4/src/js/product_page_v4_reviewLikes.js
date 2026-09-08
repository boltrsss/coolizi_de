window.addEventListener("DOMContentLoaded", () => {
  const readMoreBtn = document.querySelector("#read-more");
  const readMoreInnerContainer = document.querySelector(
    ".reviews__listWrapper--hidden",
  );
  const mainContainer = document.querySelector(".reviews__list");
  const outerContainer = document.querySelector(".reviews__list--hidden");

  if (readMoreBtn) {
    readMoreBtn.addEventListener("click", (e) => {
      if (outerContainer.clientHeight == 0) {
        const height = readMoreInnerContainer.clientHeight;
        outerContainer.style.height = `${height}px`;
        readMoreBtn.innerHTML = `${review_data.read_less}`;
        setTimeout(() => {
          outerContainer.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }, 300);
      } else {
        outerContainer.style.height = 0;
        readMoreBtn.innerHTML = `${review_data.read_more}`;
        setTimeout(() => {
          mainContainer.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }, 300);
      }
    });
  }

  if (mainContainer) {
    mainContainer.addEventListener("click", function (event) {
      if (event.target.classList.contains("review-button--like")) {
        const reviewThumb = event.target.closest(".review-likes__thumb");
        const reviewImage = event.target.querySelector(".review-button__image");
        if (reviewImage.src.includes("thumb_up-passive.svg")) {
          const reviewIconSrc = reviewImage.src;
          const activeThumb = reviewIconSrc.replace(
            "thumb_up-passive.svg",
            "thumb_up-active.svg",
          );
          reviewImage.src = activeThumb;
          const likesSpan = reviewThumb.querySelector(".review-text--span");
          const currentCount = parseInt(likesSpan.textContent);
          likesSpan.textContent = currentCount + 1;
          const likesContainer = event.target.closest(".review-likes");
          if (likesContainer) {
            const dislikeBtn = likesContainer.querySelector(
              ".review-button--dislike",
            );
            const dislikeBtnImg = dislikeBtn.querySelector(
              ".review-button__image",
            );
            const dislikeBtnSrc = dislikeBtnImg.src;
            if (
              dislikeBtnSrc.includes("thumb_down-active.svg", "thumb_down.svg")
            ) {
              dislikeBtnImg.src = dislikeBtnSrc.replace(
                "thumb_down-active.svg",
                "thumb_down.svg",
              );
              const likesSpan = likesContainer.querySelector(
                ".review-text--counte--passive",
              );
              const currentCount = parseInt(likesSpan.textContent);
              likesSpan.textContent = currentCount - 1;
            }
          }
        } else {
          const reviewIconSrc = reviewImage.src;
          const activeThumb = reviewIconSrc.replace(
            "thumb_up-active.svg",
            "thumb_up-passive.svg",
          );
          reviewImage.src = activeThumb;
          const likesSpan = reviewThumb.querySelector(".review-text--span");
          const currentCount = parseInt(likesSpan.textContent);
          likesSpan.textContent = currentCount - 1;
        }
      }
      if (event.target.classList.contains("review-button--dislike")) {
        const reviewThumb = event.target.closest(".review-likes__thumb");
        const reviewImage = event.target.querySelector(".review-button__image");
        if (reviewImage.src.includes("thumb_down.svg")) {
          const reviewIconSrc = reviewImage.src;
          const activeThumb = reviewIconSrc.replace(
            "thumb_down.svg",
            "thumb_down-active.svg",
          );
          reviewImage.src = activeThumb;
          const likesSpan = reviewThumb.querySelector(".review-text--span");
          const currentCount = parseInt(likesSpan.textContent);
          likesSpan.textContent = currentCount + 1;
          const likesContainer = event.target.closest(".review-likes");
          if (likesContainer) {
            const likeBtn = likesContainer.querySelector(
              ".review-button--like",
            );
            const likeBtnImg = likeBtn.querySelector(".review-button__image");
            const likeBtnSrc = likeBtnImg.src;
            if (likeBtnSrc.includes("thumb_up-active.svg")) {
              likeBtnImg.src = likeBtnSrc.replace(
                "thumb_up-active.svg",
                "thumb_up-passive.svg",
              );
              const likesSpan = likesContainer.querySelector(
                ".review-text--counter",
              );
              const currentCount = parseInt(likesSpan.textContent);
              likesSpan.textContent = currentCount - 1;
            }
          }
        } else {
          const reviewIconSrc = reviewImage.src;
          const activeThumb = reviewIconSrc.replace(
            "thumb_down-active.svg",
            "thumb_down.svg",
          );
          reviewImage.src = activeThumb;
          const likesSpan = reviewThumb.querySelector(
            ".review-likes__thumb > .review-text--span",
          );
          const currentCount = parseInt(likesSpan.textContent);
          likesSpan.textContent = currentCount - 1;
        }
      }
    });
  }
});
