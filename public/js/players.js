$(document).ready(function() {

    $('#check_withdrawal').click(function (e) {
        e.preventDefault();
        var url = $(this).data('url');
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                if (data.status == 'ok')
                    $('#withdrawal_result').html(data.html);
            }
        });
    });

});