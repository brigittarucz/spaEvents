function changeView() {
    document.querySelectorAll(".main-view").forEach(queryElement => {
        queryElement.style.display = "none";
        if(queryElement.getAttribute("data-location") == event.target.getAttribute("data-location")) {
           queryElement.style.display = "block";
        }
    })
}