$(document).ready(function() {
    $('#room-categories-table').on('change', '.change-order', function() {
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: $(this).data('url'),
            data: { order: $(this).val() },
            type: 'post',
            success: function(data) {
                $('#room-categories-table').DataTable().ajax.reload();
            }
        });
    });
});
