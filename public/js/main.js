$(document).ready(function(){
    var hash = window.location.hash;
    if (hash !== '') {
        $('a[href="'+ hash +'"]').click();
    }

    if ($.fn.colorpicker){
        $('.colorpicker-component').colorpicker();

        $('.colorpicker-component input').click(function(){
            $(this).parent().colorpicker('show');
        });
    }

    var table = null;
    $(".dataTable").each(function(){
        var datatable_columns = [];
        var search_columns = [];

        $(this).find('thead th').each(function(i, item){
            var column_name = $(item).data('name');

            if(column_name == 'actions'){
                datatable_columns.push({ data: 'actions', name: 'actions', orderable: false, searchable: false});
            } else {
                datatable_columns.push({ data: column_name, name: column_name });
            }

            //FILTRO POR DEFECTO
            //Obtenemos la columna del footer correspondiente al header y añadimos a search_columns si tiene default, null en caso contrario.
            var foot = $(this).parents('table').find('tfoot th:nth-child('+(i+1)+')');
            var default_value = $(foot).data('default');
            if( default_value ){
                search_columns.push({ 'sSearch': default_value })
            }else{
                search_columns.push(null);
            }
        });

        var table_id = $(this).attr('id');
        var order_table = $(this).data('order');
        var order_type = $(this).data('order-type');

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

        table = $(this).DataTable({
            processing: true,
            serverSide: true,
            ajax: $(this).data('endpoint'),
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.10.12/i18n/Spanish.json'
            },
            columns: datatable_columns,
            iDisplayLength: 100,
            order: orders,

            'searchCols': search_columns,

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
                            var default_value = $(footer).data('default');

                            option.text = '';
                            option.value = '';
                            select.appendChild(option);
                            $.each(values, function(item_name, item_id) {
                                var option = document.createElement("option");
                                option.text = item_name;
                                option.value = item_id;
                                option.selected = (item_id == default_value);
                                select.appendChild(option);
                            });
                            if ($(footer).hasClass('multiple'))
                            {
                                $(select).attr('multiple', 'multiple');
                                $(select).attr('data-live-search', 'true');
                            }


                            $(select).appendTo($(column.footer()).empty()).on('change', function () {
                                column.search($(this).val(), false, false, true).draw();
                            });

                            if ($(footer).hasClass('multiple'))
                                $(select).selectpicker();

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

        table
            .on('click', '.change-state-file', function(table){
                var url = $(this).data('url');
                var status = $(this).data('status');
                table = $(this).parents('.dataTable').DataTable();
                var endpoint = $(this).parents('.dataTable').data('endpoint');

                if(confirm("Vas a cambiar el estado del documento. ¿Estás seguro?")){
                    $.ajax({
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        url: url,
                        dataType: 'json',
                        type: 'PATCH',
                        data: {status: status},
                        success: function(status){
                            table.ajax.url(endpoint).load();
                        }
                    })
                }
            });
    });

    $(".data-table").each(function(){
        $(this).DataTable({
            paging: false,
            searching: false
        });
    });

    $('.change-language-link').click(function() {
        var language = $(this).data('language');
        $('.change-language-input[data-language!="' + language + '"]').addClass('hide');
        $('.change-language-input[data-language="' + language + '"]').removeClass('hide');

        $('.change-language-link').removeClass('active');
        $('.change-language-link[data-language="' + language + '"]').addClass('active');
    });

    $('.btn-duplicate').click(function(e) {
        e.preventDefault();
        var url = $(this).attr('href');
        if(confirm("Vas a duplicar el elemento actual. ¿Estás seguro?")){
            window.location.href = url;
        }
    });

    if ($.fn.magnificPopup) {
        $('a.magnific').magnificPopup({
            type: 'image'
        });
    }
});