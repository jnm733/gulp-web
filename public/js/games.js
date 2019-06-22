$(document).ready(function(){
    $('.btn-save-splash').click(function() {
        var tr = $(this).parents('tr');
        var url = tr.data('action');
        var splash = tr.find('input[name="splash"]');
        var link = tr.find('input[name="link"]').val();
        var type = tr.find('select[name="type"]').val();
        var platform = tr.find('select[name="platform"]').val();
        var active = tr.find('select[name="active"]').val();
        var languages = tr.find('select[name="languages[]"]').val();

        var form = new FormData();
        form.append('splash', splash[0].files[0]);
        form.append('link', link);
        form.append('type', type);
        if (platform != '') {
            form.append('platform', platform);
        }
        form.append('active', active);
        if(languages != undefined)
            form.append('languages', languages);

        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: url,
            dataType: 'json',
            contentType: false,
            type: 'POST',
            data: form,
            processData: false,
            success: function(url){
                window.location.href = url;
                window.location.reload(true);
            },
            error: function(xhr, status, text) {
                if (xhr.status == 422) {
                    var errors = $.parseJSON(xhr.responseText);
                    $.each(errors, function(i, error) {
                        alert(error);
                    });
                }
            }
        })
    });

    $('#save-form').click(function () {
        $('#games-form').submit();
    });

    $('.btn-edit-splash').click(function() {
        var tr = $(this).parents('tr');
        var url = tr.data('action');
        var link = tr.find('input[name="link"]').val();
        var type = tr.find('select[name="type"]').val();
        var platform = tr.find('select[name="platform"]').val();
        var active = tr.find('select[name="active"]').val();
        var languages = tr.find('select[name="languages[]"]').val();
        var splash = tr.find('input[name="splash"]');

        var form = new FormData();
        form.append('link', link);
        form.append('type', type);
        if (platform != '') {
            form.append('platform', platform);
        }
        form.append('active', active);
        if(languages != undefined)
            form.append('languages', languages);
        if(splash[0].files[0] != undefined)
            form.append('img', splash[0].files[0]);

        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: url,
            dataType: 'json',
            contentType: false,
            type: 'POST',
            data: form,
            processData: false,
            success: function(url){
                window.location.href = url;
                window.location.reload(true);
            },
            error: function(xhr, status, text) {
                if (xhr.status == 422) {
                    var errors = $.parseJSON(xhr.responseText);
                    $.each(errors, function(i, error) {
                        alert(error);
                    });
                }
            }
        })
    });

    $('.btn-remove-splash').click(function() {
        var url = $(this).data('action');
        if (confirm("Vas a eliminar el splash. ¿Estás seguro?") == false) {
            return;
        }
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: url,
            dataType: 'json',
            contentType: false,
            type: 'GET',
            processData: false,
            success: function(url){
                window.location.href = url;
                window.location.reload(true);
            },
            error: function(xhr, status, text) {
                if (xhr.status == 422) {
                    var errors = $.parseJSON(xhr.responseText);
                    $.each(errors, function(i, error) {
                        alert(error);
                    });
                }
            }
        })
    });

    $('.btn-duplicate-splash').click(function() {
        var url = $(this).data('action');
        if (confirm("Se va a duplicar el splash. ¿Estás seguro?") == false) {
            return;
        }
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: url,
            dataType: 'json',
            contentType: false,
            type: 'GET',
            processData: false,
            success: function(url){
                window.location.href = url;
                window.location.reload(true);
            },
            error: function(xhr, status, text) {
                if (xhr.status == 422) {
                    var errors = $.parseJSON(xhr.responseText);
                    $.each(errors, function(i, error) {
                        alert(error);
                    });
                }
            }
        })
    });

});