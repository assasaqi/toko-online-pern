/**
 * Memformat angka/string angka menjadi format mata uang Rupiah (IDR).
 * @param {number|string} number - Nilai nominal yang akan diformat.
 * @returns {string} String terformat Rupiah (contoh: "Rp 150.000").
 */
export const formatRupiah = (number) => {
    const val = Number(number) || 0;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(val);
};
