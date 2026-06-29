var smb_fixed_flag = document.querySelector("#smb-fixed-flag");
var smb_fixed = document.querySelector(".smb-right-main");
var smb_none = document.querySelector("#smb-flag-none");
var smb_bottom = document.querySelector(".smb-button-bottom");
var screen =
  document.body.clientWidth ||
  document.documentElement.clientWidth ||
  window.innerWidth;

if (screen > 768) {
  window.addEventListener("scroll", function(e) {
    var scroll = smb_fixed_flag.getBoundingClientRect().top;
    if (scroll < 0) {
      smb_fixed.classList.add('smb-fixed');
    } else if (scroll > 0) {
      smb_fixed.classList.remove('smb-fixed');
    }
  });
}

if (screen < 768) {
  window.addEventListener("scroll", function(e) {
    var scroll_none = smb_none.getBoundingClientRect().top;
    if (scroll_none > 1500) {
      smb_bottom.classList.add("smb-mb-block");
    } else if (scroll_none < 1000) {
      smb_bottom.classList.remove("smb-mb-block");
    }
  });
}
