$(document).ready(function() {

    var table;
    $('#bag-instances-table')
        .on('click', '.btn-details-bag', function() {
            var bag_instance = $(this).data('id');
            var bag_instances_table = $('#instance-result-table');
            var modal = $('#modal-bag-instance-detail');

            if (table) {
                bag_instances_table.DataTable().destroy();
            }

            bag_instances_table.attr('data-endpoint', bag_instances_table.attr('data-url') + '/' + bag_instance);
            var datatable_columns = [];

            bag_instances_table.find('thead th').each(function(i, item){
                var column_name = $(item).data('name');
                if(column_name == 'actions'){
                    datatable_columns.push({ data: 'actions', name: 'actions', orderable: false, searchable: false });
                } else {
                    datatable_columns.push({ data: column_name, name: column_name });
                }
            });

            var table_id = bag_instances_table.attr('id');
            var order_table = bag_instances_table.data('order');
            var order_type = bag_instances_table.data('order-type');

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

            table = bag_instances_table.DataTable({
                processing: true,
                serverSide: true,
                ajax: bag_instances_table.attr('data-endpoint'),
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

            modal.modal('show');
        });

    $('#tab_instances').on('click', '.btn-close-bag',  function (e) {
        e.preventDefault();
        if(confirm("Vas a cerrar la bolsa. ¿Estás seguro?")){
            window.location.href = $(this).data('url');
        }
    });

    $('#new_reward').click(function (e) {
        e.preventDefault();
        var div = $('#rewards');
        var html = $('#reward-template').clone();
        var position = $('.position').length;
        html.find('.position').html(position);
        div.append(html.html());
    });

    $('#delete_reward').click(function (e) {
       e.preventDefault();
       $('.reward-element').last().remove();

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

    $('#form-bag').submit(function(e) {
        var form = $(this);
        var probability = $('input[name="probability"]').val();
        var reward_percentage = $('input[name="award_percentage"]').val();

        if (probability == undefined && reward_percentage == undefined) {
            e.preventDefault();
            probability = 0;
            $('input[name*="skins_probability["]').each(function(i, item) {
                probability += parseFloat($(item).val());
            });

            reward_percentage = 0;
            $('input[name*="rewards["]').each(function(i, item) {
                if(i > 0)
                    reward_percentage += parseFloat($(item).val());
            });

            form.append('<input type="number" name="reward_percentage" value="' + reward_percentage + '">');
            form.append('<input type="number" name="probability" value="' + probability + '">').submit();
        }

    });
});
