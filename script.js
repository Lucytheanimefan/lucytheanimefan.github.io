var titles = ["Shelter", "Fate Zero", "Psychopass", "Durarara!!", "Madoka Magica"]

function updateDesc(num) {
    $("#animetitle").empty();
    $(".description p").empty();
    $("#animetitle").html(titles[num-1]);
}
