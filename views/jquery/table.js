
function draw_table(){
    $("#table").empty();
    $.getJSONuncached = function(url) {
        return $.ajax({
            url: url,
            type: 'GET',
            cache: false,
            success: function(html) {
                $("#table").append(html);
            }
        });
    };
    $.getJSONuncached("/get/html")
}
$(document).ready(function(){
    draw_table();
})