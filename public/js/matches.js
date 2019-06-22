$(document).ready(function() {
    var table;
    $('#matches-table')
        .on('click', '.btn-match-logs', function() {
            var match = $(this).data('id');
            var game_mode = $(this).data('game-mode');
            var players = $(this).data('players');
            var refund = $(this).data('refund');
            var arbitrated = $(this).data('arbitrated');
            var log_table = $('#match-logs-table');
            var modal = $('#modal-match-logs');
            modal.find('.btn-resolve-incident').removeClass('hide');
            modal.find('.btn-resolve-incident[data-winner="nobody"]').html('Pierden ambos');

            if (game_mode != 3) {
                modal.find('.modal-footer').removeClass('hide');

                if (game_mode == 2) {
                    console.log(players);
                    if (players == 1) {
                        modal.find('.btn-resolve-incident').addClass('hide');
                        modal.find('.btn-resolve-incident[data-winner="nobody"]').html('Pierde');
                    }
                    if (refund == 0) {
                        modal.find('.btn-resolve-incident[data-winner="both"]').removeClass('hide');
                        modal.find('.btn-resolve-incident[data-winner="nobody"]').removeClass('hide');
                    }
                }
                if (game_mode == 4) {
                    var winner = $(this).data('winner');
                    if (winner == 'incident')
                    {
                        modal.find('.btn-resolve-incident').removeClass('hide');
                        modal.find('.btn-resolve-incident[data-winner="both"]').addClass('hide');
                    }
                    else
                        modal.find('.modal-footer').addClass('hide');
                }
            } else {
                modal.find('.modal-footer').removeClass('hide');
                modal.find('.btn-resolve-incident[data-winner="both"]').removeClass('hide');
            }


            $('.btn-resolve-incident').attr('data-match', match);
            $('.btn-resolve-incident').attr('data-mode', game_mode);

            if (table) {
                log_table.DataTable().destroy();
            }

            log_table.attr('data-endpoint', log_table.attr('data-url') + '/' + match + '/' + game_mode);
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

            if (arbitrated == 1) {
                modal.find('.modal-footer').addClass('hide');
            }

            modal.modal('show');
        });

    $('#modal-match-logs')
        .on('click', '.btn-resolve-incident', function() {
            var r = confirm('Esta operación implica modificaciones en el saldo y las estadísticas de los jugadores. ¿Estás seguro?');
            if (r == true) {
                var winner = $(this).data('winner');

                var url = "";
                if ($(this).attr('data-mode') == '3')
                    url = $(this).data('multiplayer-url') + '/' + $(this).attr('data-match');
                else if ($(this).attr('data-mode') == '4')
                    url = $(this).data('tournaments-url') + '/' + $(this).attr('data-match');
                else
                    url = $(this).data('url') + '/' + $(this).attr('data-match');

                $.ajax({
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    url: url,
                    data: { winner: winner },
                    type: 'post',
                    success: function(data) {
                        $('#modal-match-logs').modal('hide');
                        $('#matches-table').DataTable().ajax.reload();
                    }
                });
            }
        });
});