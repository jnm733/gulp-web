$(document).ready(function() {

    $('select[name="bonus_types_id"]').change(function() {
        var value = $(this).val();
        var block = $('#block-select-room');

        if (value == 3) {
            loadRoomsByGames();
        } else {
            $('#block-select-room').addClass('hide');
        }
    }).change();

    $('select[name="bonus_games[]"]').change(function() {
        var bonus_type = $('select[name="bonus_types_id"]').val();

        if (bonus_type == 3) {
            loadRoomsByGames();
        }
    }).change();

    var prevent_submit = true;

    $('#form-bonus').submit(function(e) {
        if (prevent_submit) {
            e.preventDefault();
            var save = confirm('¡ATENCIÓN! Tras guardar el bono se asignará a los usuarios que cumplan las condiciones. Una vez que el bono se muestre en la app los datos no podrán ser modificados. ¿Quieres guardar el bono?');
            if (save) {
                prevent_submit = false;
                $(this).submit();
            }
        }
    });

    $('.calculate').change(function(e) {
        calculateCandidates();
    });

    $('#bonus-table').on('change', '.change-order', function() {
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            url: $(this).data('url'),
            data: { order: $(this).val() },
            type: 'post',
            success: function(data) {
                $('#bonus-table').DataTable().ajax.reload();
            }
        });
    });

   console.log($("#bonus-table tfoot ").html());
});

function loadRoomsByGames() {
    var block = $('#block-select-room');
    var select = block.find('select');

    var games = $('select[name="bonus_games[]"]').val();
    if (games === null) {
        return false;
    }

    var room_selected = select.data('old');

    $.ajax({
        url: block.data('url'),
        type: 'GET',
        dataType: 'json',
        data: {games: games},
        success: function(rooms) {
            select.find('option').remove();
            $(rooms).each(function(i, item) {
                var selected = item.id == room_selected ? 'selected' : '';
                var html = '<option value="' + item.id + '" ' + selected + '>' + item.name + '</option>'
                select.append(html);
                select.selectpicker('refresh');
            });
        }
    });

    block.removeClass('hide');
}

function calculateCandidates() {
    var form = $('#form-bonus');

    var games = form.find('select[name="bonus_games[]"]').val();

    if (games != null) {

        var matches = form.find('input[name="matches"]').val();
        var matches_op = form.find('select[name="matches-op"]').val();

        var win = form.find('input[name="win"]').val();
        var win_op = form.find('select[name="win-op"]').val();

        var money_withdrawal = form.find('input[name="money_withdrawal"]').val();
        var money_withdrawal_op = form.find('select[name="money_withdrawal-op"]').val();

        var days_without_deposit = form.find('input[name="days_without_deposit"]').val();
        var days_without_deposit_op = form.find('select[name="days_without_deposit-op"]').val();

        var days_without_login = form.find('input[name="days_without_login"]').val();
        var days_without_login_op = form.find('select[name="days_without_login-op"]').val();

        var no_deposits = form.find('input[name="no_deposits"]').val();
        var no_deposits_op = form.find('select[name="no_deposits-op"]').val();

        var no_bonus = form.find('input[name="no_bonus"]').val();
        var no_bonus_op = form.find('select[name="no_bonus-op"]').val();

        var earned_money = form.find('input[name="earned_money"]').val();
        var earned_money_op = form.find('select[name="earned_money-op"]').val();

        $('#candidate-players').text('Calculando...');

        $.ajax({
            url: window.location.origin + '/bonos/calculate-players-bonus',
            type: 'GET',
            dataType: 'json',
            data: {
                games: games,
                matches: matches,
                matches_op: matches_op,
                win: win,
                win_op: win_op,
                money_withdrawal: money_withdrawal,
                money_withdrawal_op: money_withdrawal_op,
                days_without_deposit: days_without_deposit,
                days_without_deposit_op: days_without_deposit_op,
                days_without_login: days_without_login,
                days_without_login_op: days_without_login_op,
                no_deposits: no_deposits,
                no_deposits_op: no_deposits_op,
                no_bonus: no_bonus,
                no_bonus_op: no_bonus_op,
                earned_money: earned_money,
                earned_money_op: earned_money_op,
            },
            success: function (candidates) {
                $('#candidate-players').text(candidates);
            }
        });
    }
}