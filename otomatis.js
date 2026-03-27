const cron = require('node-cron');

const targetJids = ['628xxx@s.whatsapp.net']; // Ganti ID/Nomor

// DATABASE INFO TAMBAHAN
const quotes = [
    `"Barangsiapa yang menempuh jalan untuk mencari ilmu, maka Allah akan memudahkan baginya jalan ke surga." — HR. Muslim`,
    `"Waktu adalah pedang, jika kamu tidak menggunakannya, ia akan memotongmu."`
];

const jadwalSekolah = {
    "Monday": "Matematika, Bahasa Inggris, Fisika",
    "Tuesday": "Agama, Sejarah, Olahraga",
    // Tambahkan hari lainnya...
};

const fiturOtomatis = (naze) => {
    
    // --- 1. PESAN PAGI (JAM 06:00) ---
    // Mengirim quotes + Jadwal Sekolah hari ini
    cron.schedule('0 6 * * *', async () => {
        const day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        const pelajaran = jadwalSekolah[day] || "Tidak ada jadwal";

        let teks = `☀️ *SELAMAT PAGI!* ☀️\n\n`;
        teks += `✨ *Quote Hari Ini:* \n${quote}\n\n`;
        teks += `📚 *Jadwal Sekolah (${day}):*\n${pelajaran}\n\n`;
        teks += `Semangat belajarnya ya! 🚀`;

        for (let jid of targetJids) {
            await naze.sendMessage(jid, { text: teks });
        }
    }, { timezone: "Asia/Jakarta" });


    // --- 2. PESAN ADZAN (CEK TIAP MENIT) ---
    cron.schedule('* * * * *', async () => {
        try {
            const now = new Date();
            const jamSekarang = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' }).replace('.', ':');

            // Ambil Jadwal Sholat
            const response = await fetch(`https://api.aladhan.com/v1/timingsByAddress?address=Banjarnegara,Indonesia&method=20`);
            const res = await response.json();
            const t = res.data.timings;

            const jadwal = { "Subuh": t.Fajr, "Dzuhur": t.Dhuhr, "Ashar": t.Asr, "Maghrib": t.Maghrib, "Isya": t.Isha };

            if (Object.values(jadwal).includes(jamSekarang)) {
                const namaSholat = Object.keys(jadwal).find(key => jadwal[key] === jamSekarang);
                
                let teks = `🕌 *WAKTU ADZAN ${namaSholat.toUpperCase()}* 🕌\n`;
                teks += `Wilayah Banjarnegara: *${jamSekarang} WIB*\n\n`;
                teks += `_Jangan lupa sholat tepat waktu ya!_`;

                for (let jid of targetJids) {
                    await naze.sendMessage(jid, { text: teks });
                }
            }
        } catch (e) { console.error(e) }
    }, { timezone: "Asia/Jakarta" });

};

module.exports = { fiturOtomatis };
