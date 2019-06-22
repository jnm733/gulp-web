$(document).ready(function() {

    $('select[name="game_modes_id"]').change(function(e) {
        if($(this).val() != 3)
        {
            $('#num_players_match_div').hide();
            $('input[name="num_players_match"]').val('');
            //$('input[name="min_matches"]').val('');
            //$('input[name="max_matches"]').val('');

            $('#rookies_div').show();
        }
        else
        {
            $('#num_players_match_div').show();

            $('#rookies_div').hide();
            $('#block-room-matches').addClass('hide');
            $('input[name="rookies"][value="0"]').prop('checked', true);
            $('input[name="rookies"]').checkboxradio("refresh");
        }
    });

    if ($('.colorpicker').length > 0) {
        $('.colorpicker').minicolors({
            control: $(this).attr('data-control') || 'hue',
            defaultValue: $(this).attr('data-defaultValue') || '',
            format: $(this).attr('data-format') || 'hex',
            keywords: $(this).attr('data-keywords') || '',
            inline: $(this).attr('data-inline') === 'true',
            letterCase: $(this).attr('data-letterCase') || 'lowercase',
            opacity: $(this).attr('data-opacity'),
            position: $(this).attr('data-position') || 'bottom left',
            swatches: $(this).attr('data-swatches') ? $(this).attr('data-swatches').split('|') : [],
            change: function(value, opacity) {
                if( !value ) return;
                if( opacity ) value += ', ' + opacity;
                if( typeof console === 'object' ) {
                    console.log(value);
                }
            },
            theme: 'bootstrap'
        });
    }

    $('input[name="rookies"]').change(function(e) {
        var value = $('input[name="rookies"]:checked').val();
        var block = $('#block-room-matches');

        if (value == 1) {
            block.removeClass('hide');
        } else {
            block.addClass('hide');
        }
    }).change();

    $('select[name="games_id"]').change(function(e) {
        var games_id = $(this).val();
        var block = $('#block-skins');
        var select = $('select[name="skins[]"]');

        var skins = select.data('old').toString();
        skins = skins.split(',');

        var selected_skins = [];
        var probabilities = [];

        $(skins).each(function(i, item) {
            var skin_probability = item.split('-');
            selected_skins.push(skin_probability[0]);
            probabilities[skin_probability[0]] = skin_probability[1];
        });

        $.ajax({
            url: block.data('url'),
            type: 'GET',
            dataType: 'json',
            data: {games_id: games_id},
            success: function(skins) {
                select.find('option').remove();
                $(skins).each(function(i, item) {
                    var string_id = item.id.toString();
                    var selected = $.inArray(string_id, selected_skins) !== -1 ? 'selected' : '';
                    var html = '<option value="' + item.id + '" ' + selected + ' probability="' + probabilities[item.id] + '">' + item.name + '</option>'
                    select.append(html);
                    select.selectpicker('refresh').change();
                });
            }
        });
    }).change();

    $('select[name="skins[]"]').change(function(e) {
        var select = $(this);
        var skins = $(this).val();
        var block = $('#block-skins');

        if (skins === null) {
            block.addClass('hide');
        } else {
            block.removeClass('hide');
        }

        block.find('.form-group').remove();
        $(skins).each(function(i, item){
            var option = select.find('option[value="' + item + '"]');
            var name = option.html();
            var probability = option.attr('probability');
            if (probability === 'undefined') {
                var old_selected_skin = $('#selected-skin-' + item);
                if (old_selected_skin.length > 0) {
                    probability = old_selected_skin.val();
                } else {
                    probability = 0;
                }
            }
            var html =
                '<div class="form-group">' +
                    '<div class="row">' +
                        '<div class="col-xs-6">' + name + '</div>' +
                        '<div class="col-xs-6"><input type="number" name="skins_probability[' + item + ']" class="form-control" min="0" max="100" value="' + probability + '" required></div>' +
                    '</div>' +
                '</div>';

            block.append(html);
        });
    });

    $('#form-room').submit(function(e) {
        var form = $(this);
        var probability = $('input[name="probability"]').val();

        if (probability == undefined) {
            e.preventDefault();
            probability = 0;
            $('input[name*="skins_probability["]').each(function(i, item) {
                probability += parseFloat($(item).val());
            });

            form.append('<input type="hidden" name="probability" value="' + probability + '">').submit();
        }
    });

    $('#rooms-table').on('change', '.change-order', function() {
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: $(this).data('url'),
            data: { order: $(this).val() },
            type: 'post',
            success: function(data) {
                $('#rooms-table').DataTable().ajax.reload();
            }
        });
    });
});
