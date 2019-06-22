$(document).ready(function() {

    $( "input[name='automatic_generation']" ).change(function () {
       if ($(this).val() == 1)
           $('#automatic_generation_div').removeClass('hide');
       else
           $('#automatic_generation_div').addClass('hide');
    });


    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        var target = $(e.target).attr("href");
        if ((target == '#tab_frame')) {
            var body_width = $('body').outerWidth();
            var frame_width = $('.tournament-bracket__round').last().offset();
            if (frame_width != undefined)
            {
                if (frame_width.left > body_width)
                    document.body.style.width = 'fit-content';
            }
        }
        else
            document.body.style.width = '';

    });


    var table = false;
    $('#round-matches-table')
        .on('click', '.btn-matches-results', function() {
            var match = $(this).data('id');
            var log_table = $('#matches-results-table');
            var modal = $('#modal-matches-results');

            if (table) {
                log_table.DataTable().destroy();
            }

            log_table.attr('data-endpoint', log_table.attr('data-url') + '/' + match + '/4/1');
            var datatable_columns = [];

            log_table.find('thead th').each(function(i, item){
                var column_name = $(item).data('name');
                if(column_name == 'actions'){
                    datatable_columns.push({ data: 'actions', name: 'actions', orderable: false, searchable: false });
                } else {
                    datatable_columns.push({ data: column_name, name: column_name });
                }
            });

            var table_id = log_table.attr('id');
            var order_table = log_table.data('order');
            var order_type = log_table.data('order-type');

            var orders = [];
            if(order_table !== undefined && order_type !== undefined){
                if ($.isNumeric(order_table)) {
                    order_table = order_table.toString();
                }

                order_table = order_table.split(',');
                order_type = order_type.split(',');

                $.each(order_table, function(i, item) {
                    orders.push([order_table[i], order_type[i]]);
                });
            }

            table = log_table.DataTable({
                processing: true,
                serverSide: true,
                ajax: log_table.attr('data-endpoint'),
                language: {
                    url: 'https://cdn.datatables.net/plug-ins/1.10.12/i18n/Spanish.json'
                },
                columns: datatable_columns,
                iDisplayLength: 100,
                order: orders,
                initComplete: function () {
                    var api = this.api();
                    api.columns().eq(0).each(function(index){
                        var column = api.column(index);
                        var footer = column.footer();
                        if(!$(footer).hasClass('non-searchable')){
                            if ($(footer).hasClass('select')) {
                                var values = $(footer).data('values');
                                var select = document.createElement('select');
                                var option = document.createElement("option");
                                option.text = '';
                                option.value = '';
                                select.appendChild(option);
                                $.each(values, function(item_name, item_id) {
                                    var option = document.createElement("option");
                                    option.text = item_name;
                                    option.value = item_id;
                                    select.appendChild(option);
                                });
                                $(select).appendTo($(column.footer()).empty()).on('change', function () {
                                    column.search($(this).val(), false, false, true).draw();
                                });
                            } else {
                                var input = document.createElement("input");
                                $(input).appendTo($(column.footer()).empty()).on('keyup', function () {
                                    column.search($(this).val(), false, false, true).draw();
                                });
                            }
                        }
                    });
                },
                drawCallback: function(){
                    $("#"+table_id).find('*[data-toggle="tooltip"]').tooltip();
                }
            });

            table
                .on('click', '.change-state-item', function(table){
                    var url = $(this).data('url');
                    var state = $(this).data('state');
                    table = $(this).parents('.dataTable').DataTable();
                    var endpoint = $(this).parents('.dataTable').data('endpoint');

                    if(confirm("Vas a cambiar el estado del registro. ¿Estás seguro?")){
                        $.ajax({
                            headers: {
                                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                            },
                            url: url,
                            dataType: 'json',
                            type: 'PATCH',
                            data: {state: state},
                            success: function(status){
                                table.ajax.url(endpoint).load();
                            }
                        })
                    }
                });

            modal.modal('show');
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

    $('#inscriptions-table')
        .on('click', '.btn-delete-inscription', function() {
            var r = confirm('Esta operación eliminará la inscripción del jugador. ¿Estás seguro?');
            if (r == true) {
                var inscription_id = $(this).data('id');
                var url = $(this).data('url');

                $.ajax({
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    url: url,
                    data: { inscription_id: inscription_id },
                    type: 'post',
                    success: function(data) {
                        $('#inscriptions-table').DataTable().ajax.reload();
                    }
                });
            }
        });

    $('#inscriptions-table')
        .on('click', '.btn-accept-inscription', function() {
            var r = confirm('Esta operación aceptará la inscripción del jugador. ¿Estás seguro?');
            if (r == true) {
                var inscription_id = $(this).data('id');
                var url = $(this).data('url');

                $.ajax({
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    url: url,
                    data: { inscription_id: inscription_id },
                    type: 'post',
                    success: function(data) {
                        if(data.status == 'ok')
                            $('#inscriptions-table').DataTable().ajax.reload();
                        else
                            alert(data.msg);
                    }
                });
            }
        });

    $('#tab_tournament')
        .on('click', '.btn-cancel-tournament', function() {
            var r = confirm('Esta operación es irreversible. Cancelará el torneo y devolverá las inscripciones a los jugadores inscritos. ¿Estás seguro?');
            if (r == true) {
                var tournament_id = $(this).data('id');
                var url = $(this).data('url');

                $.ajax({
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    url: url,
                    data: { tournament_id: tournament_id },
                    type: 'post',
                    success: function(data) {
                        if(data.status == 'ok')
                            location.reload();
                        else
                            alert(data.msg);
                    }
                });
            }
        });

    $('#tab_tournament')
        .on('click', '.btn-generate-draw', function() {

            var calculate_url = $(this).data('calculate-url');

            $.ajax({
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                url: calculate_url,
                type: 'get',
                success: function(data) {
                    if(data.status == 'ok')
                    {
                        var num_rounds = data.data.num_rounds;
                        var num_byes = data.data.num_byes;
                        var num_players = data.data.num_players;
                        var num_cancels = data.data.num_cancel;

                        $('#num_rounds_text').html("<b>Nº de Rondas:</b> "+num_rounds);
                        $('#num_byes_text').html("<b>Nº de Byes:</b> "+num_byes);
                        $('#num_players_text').html("<b>Nº de Jugadores:</b> "+num_players);
                        if (num_cancels > 0)
                            $('#num_cancels_text').html("<b>Nº de cancelaciones:</b> "+num_cancels);

                        $('#generateRoundsModal').modal('show');

                    }
                    else
                        alert(data.msg);
                }
            });
        });

    $('#new_reward').click(function (e) {
        var rewards = $('.reward-element').length
        if (rewards < 5)
        {
            e.preventDefault();
            var div = $('#rewards');
            var html = $('#reward-template').clone();
            var position = $('.position').length;
            html.find('.position').html(position);
            div.append(html.html());
        }
        else
            alert('Ya hay premio a los 4 primeros');
    });

    $('#delete_reward').click(function (e) {
        e.preventDefault();
        $('.reward-element').last().remove();

    });

});
