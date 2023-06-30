$(document).ready(function() {
    showMenu()
});

if (!localStorage.getItem('clubs')) {
    localStorage.setItem('clubs', JSON.stringify([]));
}

function showMenu(menu) {
    switch (menu) {
        case 'input-club':
        default:
            showInputDataForm();
        break;
        case 'input-skor':
            showInputSkorForm();
        break;
        case 'view-klasemen':
            showKlasemen();
        break;
    }
}

// Tombol menu Input Data Club
function showInputDataForm() {
    var form = `
        <h2>Input Data</h2>
        <label for="nama">Nama Club</label>
        <input type="text" required id="nama">

        <label for="kota">Kota Club</label>
        <input type="text" required id="kota">

        <button onclick="saveClub()"> Save</button>
    `;

    $('#content').html(form);
}

function saveClub(club) {
    var nama = $('#nama').val();
    var kota = $('#kota').val();

    if (!nama || !kota) {
        alert('Form input tidak boleh kosong.');
        return;
    }

    if (isClubExists(nama)) {
        alert('Klub dengan nama tersebut sudah ada.');
        return;
    }

    var club = { nama: nama, kota: kota};

    var clubs = JSON.parse(localStorage.getItem('clubs')) || [];
    clubs.push(club);
    localStorage.setItem('clubs', JSON.stringify(clubs));

    clearInputClub();
    alert('Data klub berhasil disimpan.');
}

function clearInputClub() { 
    $('#nama').val('');
    $('#kota').val('');
    $('#nama').focus();
}

function isClubExists(nama) {
    var clubs = JSON.parse(localStorage.getItem('clubs')) || [];
    for (var i = 0; i < clubs.length; i++) {
        if (clubs[i].nama.toLowerCase() === nama.toLowerCase()) {
            return true;
        }
    }
    return false;
}

function showInputSkorForm() {
    var clubs = JSON.parse(localStorage.getItem('clubs')) || [];

    if (clubs.length < 2) {
        alert('Minimal harus ada 2 club terdaftar untuk input skor pertandingan.');
        return;
    }

    var form = `
        <h2>Input Skor Pertandingan</h2>
        <table>
            <thead>
                <tr>
                    <th>Klub 1</th>
                    <th>Klub 2</th>
                    <th>Skor 1</th>
                    <th>Skor 2</th>
                </tr>
            </thead>
            <tbody id="input-skor-body">
            </tbody>
        </table>
        <button onclick="addMatchInput()" class="d-block mt-5 mr-0 ml-auto">Add</button><br><br>
        <button onclick="saveKlasemen()">Save</button>
    `;

    $('#content').html(form);

    addMatchInput();
}

function saveKlasemen() {
    var matches = [];
    var isvalidated = true;
    var message = 'Data pertandingan berhasil disimpan.'

    $('#input-skor-body tr').each(function() {
        var club1 = $(this).find('.club1').val();
        var club2 = $(this).find('.club2').val();
        var skor1 = parseInt($(this).find('.skor1').val());
        var skor2 = parseInt($(this).find('.skor2').val());

        if(!club1 || !club2) {
            isvalidated = false
            message = 'Form input tidak boleh kosong.';
            return;
        }

        if (isNaN(skor1) || isNaN(skor2)) {
            isvalidated = false;
            message = 'Skor pertandingan harus berupa angka.';
            return;
        }

        if (skor1 < 0 || skor2 < 0) {
            isvalidated = false;
            message = 'Skor pertandingan tidak boleh negatif.';
            return;
        }

        if (club1 === club2) {
            isvalidated = false;
            message = 'Klub yang bertanding tidak boleh sama.';
            return;
        }

        if (isMatchExists(club1, club2)) {
            isvalidated = false;
            message = 'Pertandingan antara klub tersebut sudah ada.';
            return;
        }

        matches.push({ club1: club1, club2: club2, skor1: skor1, skor2: skor2 });
    });

    if (isvalidated) {
        saveMatches(matches);
    }
    
    alert(message);
}

function addMatchInput() {
    var row = `
        <tr>
            <td>
                <select class="club1" required>
                    <option value="" disabled selected>Pilih Klub 1</option>
                    ${generateClubOptions()}
                </select>
            </td>
            <td>
                <select class="club2" required>
                    <option value="" disabled selected>Pilih Klub 2</option>
                    ${generateClubOptions()}
                </select>
            </td>
            <td><input type="number" class="skor1" min="0" required></td>
            <td><input type="number" class="skor2" min="0" required></td>
        </tr>
    `;
    $('#input-skor-body').append(row);
}

function isMatchExists(club1, club2) {
    var savedMatches = JSON.parse(localStorage.getItem('matches')) || [];
    for (var i = 0; i < savedMatches.length; i++) {
        var match = savedMatches[i];
        if ((match.club1 === club1 && match.club2 === club2) || (match.club1 === club2 && match.club2 === club1)) {
            return true;
        }
    }
    return false;
}

function saveMatches(matches) {
    var savedMatches = JSON.parse(localStorage.getItem('matches')) || [];
    savedMatches = savedMatches.concat(matches);
    localStorage.setItem('matches', JSON.stringify(savedMatches));

    clearInputSkor()
}

function clearInputSkor() { 
    $('#content').empty()
    showInputSkorForm();
}

function showKlasemen() {
    var klasemen = getKlasemenData();

    var table = `
        <h2>Tampilan Klasemen</h2>
        <table>
            <thead>
                <tr>
                    <th>No</th>
                    <th>Klub</th>
                    <th>Ma</th>
                    <th>Me</th>
                    <th>S</th>
                    <th>K</th>
                    <th>GM</th>
                    <th>GK</th>
                    <th>Point</th>
                </tr>
            </thead>
            <tbody id="klasemen-body">
            </tbody>
        </table>
    `;
    $('#content').html(table);

    let index = 1
    klasemen.forEach(club => {
        var row = `
            <tr>
                <td>${index}</td>
                <td>${club.nama}</td>
                <td>${club.play}</td>
                <td>${club.win}</td>
                <td>${club.draw}</td>
                <td>${club.loss}</td>
                <td>${club.goalWin}</td>
                <td>${club.goalLose}</td>
                <td>${club.point}</td>
            </tr>
        `;

        $('#klasemen-body').append(row);

        index++
    });
}

function getKlasemenData() {
    var clubs        = JSON.parse(localStorage.getItem('clubs')) ?? [];
    var savedMatches = JSON.parse(localStorage.getItem('matches')) ?? [];

    clubs.forEach(club => {
        club.play   = 0;
        club.win    = 0;
        club.draw   = 0;
        club.loss   = 0;
        club.goalWin    = 0;
        club.goalLose   = 0;
        club.point      = 0;

        savedMatches.forEach(match => {
            if (match.club1 === club.nama) {
                club.play++;
                club.goalWin += match.skor1;
                club.goalLose += match.skor2;

                if (match.skor1 > match.skor2) {
                    club.win++;
                    club.point += 3;
                } else if (match.skor1 === match.skor2) {
                    club.draw++;
                    club.point++;
                } else {
                    club.loss++;
                }
            } else if (match.club2 === club.nama) {
                club.play++;
                club.goalWin += match.skor2;
                club.goalLose += match.skor1;

                if (match.skor2 > match.skor1) {
                    club.win++;
                    club.point += 3;
                } else if (match.skor1 === match.skor2) {
                    club.draw++;
                    club.point++;
                } else {
                    club.loss++;
                }
            }
        });
    });

    return clubs;
}

function generateClubOptions() {
    var clubs   = JSON.parse(localStorage.getItem('clubs')) || [];
    var options = '';

    clubs.forEach(club => {
        options += `<option value="${club.nama}">${club.nama}</option>`;
    });
    return options;
}